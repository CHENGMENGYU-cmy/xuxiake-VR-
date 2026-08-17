# -*- coding: utf-8 -*-
"""生成 Xmind 风格彩虹思维导图 SVG + 布局检查"""
import math

W, H = 1900, 1250
CX, CY = 950, 625

COLORS = ["#EF5350", "#FF9800", "#E6A817", "#66BB6A", "#26A69A", "#42A5F5", "#AB47BC"]

branches = [
    ("三种角色", ["普通用户 USER", "审核员 MODERATOR", "管理员 ADMIN"]),
    ("① 采集", ["闪拍App拍摄", "照片·视频·语音"]),
    ("② 素材", ["SNAPSHOT素材库", "相册式聚合"]),
    ("③ AI生成", ["AI日记·5种风格", "AI游记·章节式"]),
    ("④ 发布", ["三级内容链条", "草稿·私密·公开"]),
    ("⑤ 互动", ["社群·消息·推荐", "通知·SSE推送"]),
    ("⑥ 治理", ["审核·举报·删除", "三角色权限"]),
]


def tw(text, size):
    return sum(size if ord(c) > 127 else size * 0.58 for c in text)


R1 = 300
RADIAL = 150

# 收集所有节点 bbox 用于检查
boxes = []


def main():
    lines = []
    S = lines.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

    ct = "徐霞客社区系统框架图"
    cs = 30
    cw = tw(ct, cs) + 64
    center_h = 74
    n = len(branches)

    # 先连线
    for i, (title, children) in enumerate(branches):
        ang = math.radians(-90 + i * 360.0 / n)
        dx, dy = math.cos(ang), math.sin(ang)
        color = COLORS[i]
        bx, by = CX + R1 * dx, CY + R1 * dy
        S(f'<line x1="{CX:.1f}" y1="{CY:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="3"/>')

        tx, ty = -dy, dx
        m = len(children)
        widths = [tw(ch, 16) + 38 for ch in children]
        total = sum(widths) + 14 * (m - 1)
        pos = -total / 2.0
        for j, ch in enumerate(children):
            off = pos + widths[j] / 2.0
            pos += widths[j] + 14
            cxx = bx + dx * RADIAL + tx * off
            cyy = by + dy * RADIAL + ty * off
            S(f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{cxx:.1f}" y2="{cyy:.1f}" stroke="{color}" stroke-width="2" opacity="0.55"/>')

    # 中心节点
    S(f'<rect x="{CX - cw / 2:.1f}" y="{CY - ch / 2:.1f}" width="{cw:.1f}" height="{ch:.1f}" rx="22" fill="#1F2937"/>')
    S(f'<text x="{CX}" y="{CY}" fill="#FFFFFF" font-size="{cs}" font-weight="bold" text-anchor="middle" dominant-baseline="central">{ct}</text>')
    boxes.append(("中心", CX - cw / 2, CY - ch / 2, CX + cw / 2, CY + ch / 2))

    # 分支节点 + 子节点
    for i, (title, children) in enumerate(branches):
        ang = math.radians(-90 + i * 360.0 / n)
        dx, dy = math.cos(ang), math.sin(ang)
        color = COLORS[i]
        bx, by = CX + R1 * dx, CY + R1 * dy

        bs = 22
        bw = max(tw(title, bs) + 46, 132)
        bh = 52
        S(f'<rect x="{bx - bw / 2:.1f}" y="{by - bh / 2:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="15" fill="{color}"/>')
        S(f'<text x="{bx}" y="{by}" fill="#FFFFFF" font-size="{bs}" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        boxes.append((title, bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2))

        tx, ty = -dy, dx
        m = len(children)
        widths = [tw(ch, 16) + 38 for ch in children]
        total = sum(widths) + 14 * (m - 1)
        pos = -total / 2.0
        for j, ch in enumerate(children):
            off = pos + widths[j] / 2.0
            pos += widths[j] + 14
            cxx = bx + dx * RADIAL + tx * off
            cyy = by + dy * RADIAL + ty * off
            chh = 42
            S(f'<rect x="{cxx - widths[j] / 2:.1f}" y="{cyy - chh / 2:.1f}" width="{widths[j]:.1f}" height="{chh:.1f}" rx="12" fill="{color}" fill-opacity="0.12" stroke="{color}" stroke-opacity="0.5" stroke-width="1.5"/>')
            S(f'<text x="{cxx}" y="{cyy}" fill="#374151" font-size="16" text-anchor="middle" dominant-baseline="central">{ch}</text>')
            boxes.append((ch, cxx - widths[j] / 2, cyy - chh / 2, cxx + widths[j] / 2, cyy + chh / 2))

    S('</svg>')
    with open("徐霞客社区系统框架图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # 布局检查报告
    report = []
    report.append("== 越界 ==")
    for name, x0, y0, x1, y1 in boxes:
        if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
            report.append("  %s: (%.0f,%.0f)-(%.0f,%.0f)" % (name, x0, y0, x1, y1))
    report.append("== 重叠 ==")
    found = False
    for a in range(len(boxes)):
        for b in range(a + 1, len(boxes)):
            na, xa0, ya0, xa1, ya1 = boxes[a]
            nb, xb0, yb0, xb1, yb1 = boxes[b]
            if xa0 < xb1 and xb0 < xa1 and ya0 < yb1 and yb0 < ya1:
                report.append("  %s <-> %s" % (na, nb))
                found = True
    if not found:
        report.append("  (无)")
    with open("_layout_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report))
    print("done")


if __name__ == "__main__":
    main()
