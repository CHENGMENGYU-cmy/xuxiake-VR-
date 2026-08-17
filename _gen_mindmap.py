# -*- coding: utf-8 -*-
"""生成 Xmind 树形结构彩虹思维导图 SVG"""
import math

W, H = 1900, 580
CX = 950

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


def main():
    lines = []
    S = lines.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

    n = len(branches)
    root_cy = 85
    root_h = 68
    root_w = tw("徐霞客社区系统框架图", 30) + 64
    beam_y = 160
    branch_cy = 240
    branch_h = 50
    child_y0 = 350
    child_h = 40
    child_gap = 52

    branch_xs = [CX + (i - (n - 1) / 2.0) * 260 for i in range(n)]
    LINK = "#C5C9D0"

    # ---- 连接线 ----
    S(f'<line x1="{CX}" y1="{root_cy + root_h / 2:.1f}" x2="{CX}" y2="{beam_y}" stroke="{LINK}" stroke-width="2"/>')
    S(f'<line x1="{branch_xs[0]:.1f}" y1="{beam_y}" x2="{branch_xs[-1]:.1f}" y2="{beam_y}" stroke="{LINK}" stroke-width="2"/>')
    for x in branch_xs:
        S(f'<line x1="{x:.1f}" y1="{beam_y}" x2="{x:.1f}" y2="{branch_cy - branch_h / 2:.1f}" stroke="{LINK}" stroke-width="2"/>')

    for i, (title, children) in enumerate(branches):
        x = branch_xs[i]
        prev_bottom = branch_cy + branch_h / 2
        for j in range(len(children)):
            cy = child_y0 + j * child_gap
            S(f'<line x1="{x:.1f}" y1="{prev_bottom:.1f}" x2="{x:.1f}" y2="{cy - child_h / 2:.1f}" stroke="{LINK}" stroke-width="2"/>')
            prev_bottom = cy + child_h / 2

    # ---- 根节点 ----
    S(f'<rect x="{CX - root_w / 2:.1f}" y="{root_cy - root_h / 2:.1f}" width="{root_w:.1f}" height="{root_h:.1f}" rx="18" fill="#1F2937"/>')
    S(f'<text x="{CX}" y="{root_cy}" fill="#FFFFFF" font-size="30" font-weight="bold" text-anchor="middle" dominant-baseline="central">徐霞客社区系统框架图</text>')

    # ---- 分支节点 + 子节点 ----
    boxes = [("中心", CX - root_w / 2, root_cy - root_h / 2, CX + root_w / 2, root_cy + root_h / 2)]
    for i, (title, children) in enumerate(branches):
        x = branch_xs[i]
        color = COLORS[i]
        bw = max(tw(title, 22) + 44, 128)
        S(f'<rect x="{x - bw / 2:.1f}" y="{branch_cy - branch_h / 2:.1f}" width="{bw:.1f}" height="{branch_h:.1f}" rx="14" fill="{color}"/>')
        S(f'<text x="{x}" y="{branch_cy}" fill="#FFFFFF" font-size="22" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')
        boxes.append((title, x - bw / 2, branch_cy - branch_h / 2, x + bw / 2, branch_cy + branch_h / 2))

        for j, child in enumerate(children):
            cw = tw(child, 16) + 36
            cy = child_y0 + j * child_gap
            S(f'<rect x="{x - cw / 2:.1f}" y="{cy - child_h / 2:.1f}" width="{cw:.1f}" height="{child_h:.1f}" rx="11" fill="{color}" fill-opacity="0.12" stroke="{color}" stroke-opacity="0.5" stroke-width="1.5"/>')
            S(f'<text x="{x}" y="{cy}" fill="#374151" font-size="16" text-anchor="middle" dominant-baseline="central">{child}</text>')
            boxes.append((child, x - cw / 2, cy - child_h / 2, x + cw / 2, cy + child_h / 2))

    S('</svg>')
    with open("徐霞客社区系统框架图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # 布局检查
    report = ["== 越界 =="]
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
