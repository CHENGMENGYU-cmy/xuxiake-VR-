"""通用 Markdown → Word (.docx) 转换脚本，支持标题/表格/列表/引用/代码块/分隔线。

用法: python md_to_docx.py <input.md> [output.docx]
样式参照项目 generate_docx.py（微软雅黑、Light Grid 表格、居中标题等）。
"""
import re
import sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def set_run_font(run, name='Microsoft YaHei', size=10.5, bold=False, italic=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color
    run.element.rPr.rFonts.set(qn('w:eastAsia'), name)


def shade_paragraph(paragraph, fill='F2F2F2'):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    pPr.append(shd)


INLINE = re.compile(r'(\*\*.+?\*\*|`.+?`)')


def add_inline(paragraph, text, size=10.5, base_bold=False):
    """把含 **粗体** 与 `行内代码` 的文本渲染进段落。"""
    for part in INLINE.split(text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            run = paragraph.add_run(part[2:-2])
            set_run_font(run, size=size, bold=True)
        elif part.startswith('`') and part.endswith('`'):
            run = paragraph.add_run(part[1:-1])
            set_run_font(run, name='Consolas', size=size - 0.5, color=RGBColor(0xC0, 0x39, 0x2B))
        else:
            run = paragraph.add_run(part)
            set_run_font(run, size=size, bold=base_bold)


def set_cell_bg(cell, fill):
    """设置单元格底色（黑白表格用浅灰表头）。"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    tcPr.append(shd)


def add_styled_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'  # 黑白表格：黑色细边框，无彩色
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        set_cell_bg(cell, 'D9D9D9')  # 表头浅灰底（黑白）
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_inline(p, h, size=10, base_bold=True)

    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = ''
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            add_inline(p, val, size=9.5)


def parse_table(lines):
    """从 | 分隔行解析出 (headers, rows)，消费到非表格行。"""
    headers = [c.strip() for c in lines[0].strip().strip('|').split('|')]
    rows = []
    i = 1
    while i < len(lines) and lines[i].strip().startswith('|'):
        cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
        rows.append(cells)
        i += 1
    return headers, rows, i


def convert(md_path, out_path):
    with open(md_path, encoding='utf-8') as f:
        lines = f.read().splitlines()

    doc = Document()

    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.8)
        section.right_margin = Cm(2.8)

    normal = doc.styles['Normal']
    normal.font.name = 'Microsoft YaHei'
    normal.font.size = Pt(10.5)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.35
    normal.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

    for i in range(1, 5):
        h = doc.styles[f'Heading {i}']
        h.font.name = 'Microsoft YaHei'
        h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
        h.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
        h.font.size = Pt({1: 20, 2: 15, 3: 12, 4: 11}[i])
        if i == 1:
            h.paragraph_format.space_before = Pt(6)
            h.paragraph_format.space_after = Pt(12)
        elif i == 2:
            h.paragraph_format.space_before = Pt(16)
            h.paragraph_format.space_after = Pt(8)
        else:
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(6)

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue

        # 代码块
        if line.strip().startswith('```'):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1
            for cl in code_lines:
                p = doc.add_paragraph()
                run = p.add_run(cl if cl else ' ')
                set_run_font(run, name='Consolas', size=9, color=RGBColor(0x33, 0x33, 0x33))
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.1
                shade_paragraph(p)
            doc.add_paragraph().paragraph_format.space_after = Pt(2)
            continue

        # 分隔线
        if re.match(r'^---+$', line.strip()):
            p = doc.add_paragraph()
            pPr = p._p.get_or_add_pPr()
            pbdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            bottom.set(qn('w:val'), 'single')
            bottom.set(qn('w:sz'), '4')
            bottom.set(qn('w:space'), '1')
            bottom.set(qn('w:color'), 'B0B0B0')
            pbdr.append(bottom)
            pPr.append(pbdr)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            i += 1
            continue

        # 表格
        if line.strip().startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|[\s:\-|]+\|\s*$', lines[i + 1]):
            headers, rows, consumed = parse_table(lines[i:])
            add_styled_table(doc, headers, rows)
            i += consumed
            doc.add_paragraph().paragraph_format.space_after = Pt(0)
            continue

        # 标题
        m = re.match(r'^(#{1,4})\s+(.*)$', line)
        if m:
            level = len(m.group(1))
            p = doc.add_heading(level=level)
            add_inline(p, m.group(2), size={1: 20, 2: 15, 3: 12, 4: 11}[level], base_bold=True)
            i += 1
            continue

        # 引用
        if line.strip().startswith('>'):
            p = doc.add_paragraph()
            add_inline(p, line.strip().lstrip('> ').strip(), size=9.5, base_bold=True)
            p.paragraph_format.left_indent = Cm(0.6)
            p.paragraph_format.space_after = Pt(6)
            shade_paragraph(p, fill='FBFBF7')
            i += 1
            continue

        # 无序列表
        m = re.match(r'^[-*]\s+(.*)$', line)
        if m:
            p = doc.add_paragraph(style='List Bullet')
            add_inline(p, m.group(1), size=10.5)
            i += 1
            continue

        # 有序列表
        m = re.match(r'^(\d+)\.\s+(.*)$', line)
        if m:
            p = doc.add_paragraph(style='List Number')
            add_inline(p, m.group(2), size=10.5)
            i += 1
            continue

        # 普通段落
        p = doc.add_paragraph()
        add_inline(p, line, size=10.5)
        i += 1

    doc.save(out_path)
    print(f'OK: {out_path}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python md_to_docx.py <input.md> [output.docx]')
        sys.exit(1)
    md = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else md.rsplit('.', 1)[0] + '.docx'
    convert(md, out)
