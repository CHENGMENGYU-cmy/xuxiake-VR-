# -*- coding: utf-8 -*-
"""生成徐霞客社区系统架构图（白色亮色三层 + 治理横切层）SVG"""

W, H = 1600, 890

# 配色（白色背景 + 亮色）
BG = "#FFFFFF"
FRAME_BG = "#F8FAFC"
FRAME_STROKE = "#3B82F6"
USER = "#3B82F6"
INTER_BG = "#FFFFFF"
INTER_STROKE = "#3B82F6"
BLOCK_BGS = ["#EFF6FF", "#F0FDFA", "#F5F3FF", "#ECFDF5"]
BLOCK_ACCENTS = ["#3B82F6", "#14B8A6", "#8B5CF6", "#22C55E"]
GOV_BG = "#FFF7ED"
GOV_ACCENT = "#F59E0B"
BASE_BG = "#F8FAFC"
BASE_STROKE = "#14B8A6"
LINE = "#3B82F6"
LINE_ACCENT = "#14B8A6"
TEXT_DARK = "#1F2937"
TEXT_DIM = "#64748B"
TEXT_SUB = "#334155"

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

gov_title = "内容治理与权限"
gov_sub = "内容审核 · 举报处理 · 软删除 · 三角色权限（USER / MODERATOR / ADMIN）"

bases = [
    ("应用层", "Next.js + React · NestJS"),
    ("数据与AI", "MySQL 8 · DeepSeek"),
    ("部署运维", "Docker Compose · xuxiake.com"),
]


def main():
    L = []
    S = L.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

    S('<defs>')
    S(f'<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE}"/></marker>')
    S(f'<marker id="arrowA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE_ACCENT}"/></marker>')
    S('</defs>')

    user_cx, user_cy, user_r = 800, 55, 32
    beam1_y = 100
    inter_cy = 138
    inter_h = 44
    inter_w = 200
    inter_xs = [350, 800, 1250]
    inter_top = inter_cy - inter_h / 2
    inter_bottom = inter_cy + inter_h / 2

    frame_x, frame_y, frame_w, frame_h = 70, 190, 1460, 460
    frame_bottom = frame_y + frame_h

    block_w = 320
    block_h = 260
    block_y = 248
    block_xs = [100, 450, 800, 1150]

    gov_x, gov_w, gov_y, gov_h = 100, 1370, 528, 72

    beam2_y = 700
    base_y = 720
    base_h = 64
    base_xs = [100, 570, 1040]
    base_w = 430

    # ---- 连接线 ----
    S(f'<line x1="{user_cx}" y1="{user_cy + user_r}" x2="{user_cx}" y2="{beam1_y}" stroke="{LINE}" stroke-width="2"/>')
    S(f'<line x1="{inter_xs[0]}" y1="{beam1_y}" x2="{inter_xs[-1]}" y2="{beam1_y}" stroke="{LINE}" stroke-width="2"/>')
    for x in inter_xs:
        S(f'<line x1="{x}" y1="{beam1_y}" x2="{x}" y2="{inter_top}" stroke="{LINE}" stroke-width="2"/>')
    for x in inter_xs:
        S(f'<line x1="{x}" y1="{inter_bottom}" x2="{x}" y2="{frame_y - 4}" stroke="{LINE}" stroke-width="2" marker-end="url(#arrow)"/>')
    S(f'<line x1="{user_cx}" y1="{frame_bottom}" x2="{user_cx}" y2="{beam2_y}" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5"/>')
    S(f'<line x1="{base_xs[0]}" y1="{beam2_y}" x2="{base_xs[-1] + base_w}" y2="{beam2_y}" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5"/>')
    for x in base_xs:
        S(f'<line x1="{x + base_w / 2}" y1="{beam2_y}" x2="{x + base_w / 2}" y2="{base_y - 4}" stroke="{LINE_ACCENT}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#arrowA)"/>')

    # ---- 第一层：用户圆 ----
    S(f'<circle cx="{user_cx}" cy="{user_cy}" r="{user_r}" fill="{USER}"/>')
    S(f'<text x="{user_cx}" y="{user_cy}" fill="#FFFFFF" font-size="18" font-weight="bold" text-anchor="middle" dominant-baseline="central">用户</text>')

    # ---- 第一层：三交互模块 ----
    for i, (title, sub) in enumerate(interactions):
        x = inter_xs[i]
        S(f'<rect x="{x - inter_w / 2}" y="{inter_cy - inter_h / 2}" width="{inter_w}" height="{inter_h}" rx="22" fill="{INTER_BG}" stroke="{INTER_STROKE}" stroke-width="1.5"/>')
        S(f'<text x="{x}" y="{inter_cy - 9}" fill="{TEXT_DARK}" font-size="17" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        S(f'<text x="{x}" y="{inter_cy + 12}" fill="{TEXT_DIM}" font-size="12.5" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 第二层：大框 ----
    S(f'<rect x="{frame_x}" y="{frame_y}" width="{frame_w}" height="{frame_h}" rx="22" fill="{FRAME_BG}" stroke="{FRAME_STROKE}" stroke-width="2"/>')
    S(f'<text x="{user_cx}" y="{frame_y + 30}" fill="{TEXT_DARK}" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="central">徐霞客社区系统</text>')

    # ---- 第二层：四区块 ----
    for i, (title, items) in enumerate(blocks):
        x = block_xs[i]
        bg = BLOCK_BGS[i]
        accent = BLOCK_ACCENTS[i]
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="{block_h}" rx="13" fill="{bg}"/>')
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="4" rx="2" fill="{accent}"/>')
        S(f'<text x="{x + block_w / 2}" y="{block_y + 30}" fill="{accent}" font-size="18" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        for j, item in enumerate(items):
            iy = block_y + 62 + j * 42
            S(f'<circle cx="{x + 24}" cy="{iy}" r="3.5" fill="{accent}"/>')
            S(f'<text x="{x + 38}" y="{iy}" fill="{TEXT_SUB}" font-size="15" text-anchor="start" dominant-baseline="central">{item}</text>')

    # ---- 第二层：治理横切条 ----
    S(f'<rect x="{gov_x}" y="{gov_y}" width="{gov_w}" height="{gov_h}" rx="12" fill="{GOV_BG}" stroke="{GOV_ACCENT}" stroke-width="1.5"/>')
    S(f'<text x="{gov_x + gov_w / 2}" y="{gov_y + 27}" fill="{GOV_ACCENT}" font-size="17" font-weight="bold" text-anchor="middle" dominant-baseline="central">{gov_title}</text>')
    S(f'<text x="{gov_x + gov_w / 2}" y="{gov_y + 52}" fill="{TEXT_DIM}" font-size="14" text-anchor="middle" dominant-baseline="central">{gov_sub}</text>')

    # ---- 第三层：底座 ----
    for i, (title, sub) in enumerate(bases):
        x = base_xs[i]
        S(f'<rect x="{x}" y="{base_y}" width="{base_w}" height="{base_h}" rx="12" fill="{BASE_BG}" stroke="{BASE_STROKE}" stroke-width="1.5"/>')
        S(f'<text x="{x + base_w / 2}" y="{base_y + 24}" fill="{TEXT_DARK}" font-size="17" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        S(f'<text x="{x + base_w / 2}" y="{base_y + 46}" fill="{TEXT_DIM}" font-size="13.5" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 底部说明 ----
    S(f'<text x="{W / 2}" y="850" fill="{TEXT_DIM}" font-size="14.5" text-anchor="middle">说明：系统以 AI 眼镜采集为入口，经素材库与 AI 生成沉淀为日记/游记，联动社区社交与内容治理，实现「采集→生成→发布→互动」完整闭环。</text>')

    S('</svg>')
    with open("徐霞客社区系统架构图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print("done")


if __name__ == "__main__":
    main()
