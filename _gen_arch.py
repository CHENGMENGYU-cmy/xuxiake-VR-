# -*- coding: utf-8 -*-
"""生成徐霞客社区系统架构图（深色科技感三层）SVG"""

W, H = 1600, 1100

# 配色
BG = "#0D1B2A"          # 背景 深蓝
FRAME_BG = "#12263E"    # 大框底
FRAME_STROKE = "#3B82F6"  # 亮蓝
LINE = "#3B82F6"        # 连接线
LINE_ACCENT = "#2DD4BF"  # 青绿点缀
TEXT_WHITE = "#FFFFFF"
TEXT_DIM = "#94A3B8"    # 浅灰
TEXT_SUB = "#CBD5E1"

# 四区块主题色（青绿/蓝/紫/绿）
BLOCK_COLORS = ["#2DD4BF", "#60A5FA", "#A78BFA", "#4ADE80"]
BLOCK_BGS = ["#0E2A2E", "#0E2036", "#1E1A36", "#0E2A1E"]

interactions = [
    ("闪拍App", "AI眼镜采集"),
    ("Web社区端", "浏览/发布/互动"),
    ("管理后台", "审核/治理"),
]

blocks = [
    ("内容采集与素材", ["照片/视频/语音采集", "时间/地点/天气标注", "SNAPSHOT素材库", "相册式聚合浏览"]),
    ("AI内容生成", ["AI日记 · 5种风格", "AI游记 · 结构化章节", "真实素材不虚构", "失败回退本地模板"]),
    ("内容发布与分层", ["三级链条：闪拍→日记→游记", "草稿 / 私密 / 公开", "章节式图文编辑器", "携程旅拍风详情"]),
    ("社区社交互动", ["社群：动态/挑战/角色", "消息：WebSocket实时", "推荐：搭子/社群", "通知：SSE推送"]),
]

bases = [
    ("前端层", "Next.js + React"),
    ("后端层", "NestJS · API/WS/SSE"),
    ("数据层", "MySQL 8 + 对象存储"),
    ("AI与部署", "DeepSeek + Docker · xuxiake.com"),
]


def main():
    L = []
    S = L.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

    # 箭头 marker
    S('<defs>')
    S(f'<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE}"/></marker>')
    S(f'<marker id="arrowA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE_ACCENT}"/></marker>')
    S('</defs>')

    # ---- 坐标 ----
    user_cx, user_cy, user_r = 800, 70, 38
    inter_cy = 175
    inter_h = 52
    inter_w = 200
    inter_xs = [350, 800, 1250]
    inter_bottom = inter_cy + inter_h / 2

    frame_x, frame_y, frame_w, frame_h = 70, 280, 1460, 510
    frame_top = frame_y

    block_w = 320
    block_h = 430
    block_y = 345
    block_xs = [100, 450, 800, 1150]

    base_y = 885
    base_h = 78
    base_xs = [100, 450, 800, 1150]
    base_w = 320

    # ---- 连接线 ----
    # 用户 -> 三模块
    S(f'<line x1="{user_cx}" y1="{user_cy + user_r}" x2="{user_cx}" y2="135" stroke="{LINE}" stroke-width="2"/>')
    S(f'<line x1="{inter_xs[0]}" y1="135" x2="{inter_xs[-1]}" y2="135" stroke="{LINE}" stroke-width="2"/>')
    for x in inter_xs:
        S(f'<line x1="{x}" y1="135" x2="{x}" y2="{inter_cy - inter_h / 2}" stroke="{LINE}" stroke-width="2"/>')
    # 模块 -> 大框（箭头）
    for x in inter_xs:
        S(f'<line x1="{x}" y1="{inter_bottom}" x2="{x}" y2="{frame_top - 4}" stroke="{LINE}" stroke-width="2" marker-end="url(#arrow)"/>')
    # 大框 -> 底座（虚线 + 箭头）
    S(f'<line x1="{user_cx}" y1="{frame_y + frame_h}" x2="{user_cx}" y2="840" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5"/>')
    S(f'<line x1="{base_xs[0]}" y1="840" x2="{base_xs[-1]}" y2="840" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5"/>')
    for x in base_xs:
        S(f'<line x1="{x}" y1="840" x2="{x}" y2="{base_y - 4}" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#arrowA)"/>')

    # ---- 第一层：用户圆 ----
    S(f'<circle cx="{user_cx}" cy="{user_cy}" r="{user_r}" fill="{FRAME_STROKE}"/>')
    S(f'<text x="{user_cx}" y="{user_cy}" fill="{TEXT_WHITE}" font-size="20" font-weight="bold" text-anchor="middle" dominant-baseline="central">用户</text>')

    # ---- 第一层：三交互模块 ----
    for i, (title, sub) in enumerate(interactions):
        x = inter_xs[i]
        S(f'<rect x="{x - inter_w / 2}" y="{inter_cy - inter_h / 2}" width="{inter_w}" height="{inter_h}" rx="26" fill="#16283E" stroke="{LINE}" stroke-width="1.5"/>')
        S(f'<text x="{x}" y="{inter_cy - 10}" fill="{TEXT_WHITE}" font-size="18" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        S(f'<text x="{x}" y="{inter_cy + 14}" fill="{TEXT_DIM}" font-size="13" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 第二层：大框 ----
    S(f'<rect x="{frame_x}" y="{frame_y}" width="{frame_w}" height="{frame_h}" rx="24" fill="{FRAME_BG}" stroke="{FRAME_STROKE}" stroke-width="2"/>')
    S(f'<text x="{user_cx}" y="{frame_y + 36}" fill="{TEXT_WHITE}" font-size="26" font-weight="bold" text-anchor="middle" dominant-baseline="central">徐霞客社区系统</text>')

    # ---- 第二层：四区块 ----
    for i, (title, items) in enumerate(blocks):
        x = block_xs[i]
        color = BLOCK_COLORS[i]
        bg = BLOCK_BGS[i]
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="{block_h}" rx="14" fill="{bg}"/>')
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="4" rx="2" fill="{color}"/>')
        S(f'<text x="{x + block_w / 2}" y="{block_y + 42}" fill="{color}" font-size="19" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        for j, item in enumerate(items):
            iy = block_y + 92 + j * 64
            S(f'<circle cx="{x + 24}" cy="{iy}" r="3.5" fill="{color}"/>')
            S(f'<text x="{x + 38}" y="{iy}" fill="{TEXT_SUB}" font-size="15" text-anchor="start" dominant-baseline="central">{item}</text>')

    # ---- 第三层：底座 ----
    for i, (title, sub) in enumerate(bases):
        x = base_xs[i]
        S(f'<rect x="{x}" y="{base_y}" width="{base_w}" height="{base_h}" rx="12" fill="#16283E" stroke="{LINE_ACCENT}" stroke-width="1.5"/>')
        S(f'<text x="{x + base_w / 2}" y="{base_y + 28}" fill="{TEXT_WHITE}" font-size="18" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        S(f'<text x="{x + base_w / 2}" y="{base_y + 56}" fill="{TEXT_DIM}" font-size="14" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 底部说明 ----
    S(f'<text x="{W / 2}" y="1050" fill="{TEXT_DIM}" font-size="15" text-anchor="middle">说明：系统以 AI 眼镜采集为入口，经素材库与 AI 生成沉淀为日记/游记，联动社区社交与内容治理，实现「采集→生成→发布→互动」完整闭环。</text>')

    S('</svg>')
    with open("徐霞客社区系统架构图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print("done")


if __name__ == "__main__":
    main()
