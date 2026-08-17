# -*- coding: utf-8 -*-
"""生成徐霞客社区系统架构图（白色亮色 + 图标 + 治理横切 + 大字体 + 顶部标题）SVG"""

W, H = 1600, 990

# 配色
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

TITLE = "徐霞客社区系统架构图"

ICONS = {
    "user": '<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
    "camera": '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>',
    "sparkles": '<path d="M12 3l1.9 5.8L19.7 10l-5.8 1.9L12 17.7l-1.9-5.8L4.3 10l5.8-1.9z"/><path d="M19 3v4M17 5h4"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    "message": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    "layers": '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    "cloud": '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
}

interactions = [
    ("camera", "闪拍App", "AI眼镜采集"),
    ("globe", "Web社区端", "浏览/发布/互动"),
    ("settings", "管理后台", "审核/治理"),
]

blocks = [
    ("camera", "内容采集与素材", ["照片/视频/语音采集", "时间/地点/天气标注", "SNAPSHOT素材库", "相册式聚合浏览"]),
    ("sparkles", "AI内容生成", ["AI日记 · 5种风格", "AI游记 · 结构化章节", "真实素材不虚构", "失败回退本地模板"]),
    ("file", "内容发布与分层", ["三级链条：闪拍→日记→游记", "草稿 / 私密 / 公开", "章节式图文编辑器", "携程旅拍风详情"]),
    ("message", "社区社交互动", ["社群：动态/挑战/角色", "消息：WebSocket实时", "推荐：搭子/社群", "通知：SSE推送"]),
]

gov_icon = "shield"
gov_title = "内容治理与权限"
gov_sub = "内容审核 · 举报处理 · 软删除 · 三角色权限（USER / MODERATOR / ADMIN）"

bases = [
    ("layers", "应用层", "Next.js + React · NestJS"),
    ("database", "数据与AI", "MySQL 8 · DeepSeek"),
    ("cloud", "部署运维", "Docker Compose · xuxiake.com"),
]


def tw(text, size):
    return sum(size if ord(c) > 127 else size * 0.58 for c in text)


def icon(center_x, cy, name, size, color):
    return (f'<g transform="translate({center_x - size / 2:.1f},{cy - size / 2:.1f}) scale({size / 24:.4f})" '
            f'fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')


def icon_title(center_x, cy, name, title, icon_size, title_size, gap, icon_color, title_color):
    t = tw(title, title_size)
    total = icon_size + gap + t
    sx = center_x - total / 2
    ix = sx + icon_size / 2
    tx = sx + icon_size + gap
    return (icon(ix, cy, name, icon_size, icon_color)
            + f'<text x="{tx:.1f}" y="{cy}" fill="{title_color}" font-size="{title_size}" font-weight="bold" text-anchor="start" dominant-baseline="central">{title}</text>')


def main():
    L = []
    S = L.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

    S('<defs>')
    S(f'<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE}"/></marker>')
    S(f'<marker id="arrowA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{LINE_ACCENT}"/></marker>')
    S('</defs>')

    # 顶部标题
    S(f'<text x="{W / 2}" y="46" fill="#000000" font-size="36" font-weight="bold" text-anchor="middle" dominant-baseline="central">{TITLE}</text>')

    user_cx, user_cy, user_r = 800, 118, 32
    beam1_y = 182
    inter_cy = 232
    inter_h = 60
    inter_w = 224
    inter_xs = [340, 800, 1260]
    inter_top = inter_cy - inter_h / 2
    inter_bottom = inter_cy + inter_h / 2

    frame_x, frame_y, frame_w, frame_h = 70, 294, 1460, 502
    frame_bottom = frame_y + frame_h

    block_w = 320
    block_h = 292
    block_y = 356
    block_xs = [100, 450, 800, 1150]

    gov_x, gov_w, gov_y, gov_h = 100, 1370, 670, 86

    beam2_y = 822
    base_y = 842
    base_h = 74
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

    # ---- 第一层：用户圆 + 标注 ----
    S(f'<circle cx="{user_cx}" cy="{user_cy}" r="{user_r}" fill="{USER}"/>')
    S(icon(user_cx, user_cy, "user", 24, "#FFFFFF"))
    S(f'<text x="{user_cx}" y="{user_cy + user_r + 17}" fill="{TEXT_DARK}" font-size="17" font-weight="bold" text-anchor="middle" dominant-baseline="central">用户</text>')

    # ---- 第一层：三交互模块 ----
    for i, (iname, title, sub) in enumerate(interactions):
        x = inter_xs[i]
        S(f'<rect x="{x - inter_w / 2}" y="{inter_cy - inter_h / 2}" width="{inter_w}" height="{inter_h}" rx="30" fill="{INTER_BG}" stroke="{INTER_STROKE}" stroke-width="1.5"/>')
        S(icon_title(x, inter_cy - 12, iname, title, 20, 20, 8, INTER_STROKE, TEXT_DARK))
        S(f'<text x="{x}" y="{inter_cy + 16}" fill="{TEXT_DIM}" font-size="15.5" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 第二层：大框 ----
    S(f'<rect x="{frame_x}" y="{frame_y}" width="{frame_w}" height="{frame_h}" rx="22" fill="{FRAME_BG}" stroke="{FRAME_STROKE}" stroke-width="2"/>')
    S(f'<text x="{user_cx}" y="{frame_y + 35}" fill="{TEXT_DARK}" font-size="30" font-weight="bold" text-anchor="middle" dominant-baseline="central">徐霞客社区系统</text>')

    # ---- 第二层：四区块 ----
    for i, (iname, title, items) in enumerate(blocks):
        x = block_xs[i]
        bg = BLOCK_BGS[i]
        accent = BLOCK_ACCENTS[i]
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="{block_h}" rx="13" fill="{bg}"/>')
        S(f'<rect x="{x}" y="{block_y}" width="{block_w}" height="4" rx="2" fill="{accent}"/>')
        S(icon_title(x + block_w / 2, block_y + 38, iname, title, 24, 22, 8, accent, accent))
        for j, item in enumerate(items):
            iy = block_y + 80 + j * 50
            S(f'<circle cx="{x + 24}" cy="{iy}" r="4" fill="{accent}"/>')
            S(f'<text x="{x + 38}" y="{iy}" fill="{TEXT_SUB}" font-size="18" text-anchor="start" dominant-baseline="central">{item}</text>')

    # ---- 第二层：治理横切条 ----
    S(f'<rect x="{gov_x}" y="{gov_y}" width="{gov_w}" height="{gov_h}" rx="12" fill="{GOV_BG}" stroke="{GOV_ACCENT}" stroke-width="1.5"/>')
    S(icon_title(gov_x + gov_w / 2, gov_y + 30, gov_icon, gov_title, 22, 20, 8, GOV_ACCENT, GOV_ACCENT))
    S(f'<text x="{gov_x + gov_w / 2}" y="{gov_y + 58}" fill="{TEXT_DIM}" font-size="17" text-anchor="middle" dominant-baseline="central">{gov_sub}</text>')

    # ---- 第三层：底座 ----
    for i, (iname, title, sub) in enumerate(bases):
        x = base_xs[i]
        S(f'<rect x="{x}" y="{base_y}" width="{base_w}" height="{base_h}" rx="12" fill="{BASE_BG}" stroke="{BASE_STROKE}" stroke-width="1.5"/>')
        S(icon_title(x + base_w / 2, base_y + 27, iname, title, 22, 20, 8, BASE_STROKE, TEXT_DARK))
        S(f'<text x="{x + base_w / 2}" y="{base_y + 52}" fill="{TEXT_DIM}" font-size="16" text-anchor="middle" dominant-baseline="central">{sub}</text>')

    # ---- 底部说明 ----
    S(f'<text x="{W / 2}" y="950" fill="{TEXT_DIM}" font-size="17" text-anchor="middle">说明：系统以 AI 眼镜采集为入口，经素材库与 AI 生成沉淀为日记/游记，联动社区社交与内容治理，实现「采集→生成→发布→互动」完整闭环。</text>')

    S('</svg>')
    with open("徐霞客社区系统架构图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print("done")


if __name__ == "__main__":
    main()
