# -*- coding: utf-8 -*-
"""生成 Xmind 风格彩虹思维导图 SVG"""
import math

W, H = 1700, 1100
CX, CY = 850, 560

# 彩虹七色
COLORS = ["#EF5350", "#FF9800", "#E6A817", "#66BB6A", "#26A69A", "#42A5F5", "#AB47BC"]

# 分支：标题 + 子节点（顺时针 = 闭环主线顺序）
branches = [
    ("三种角色", ["普通用户 USER", "审核员 MODERATOR", "管理员 ADMIN"]),
    ("① 采集", ["闪拍App拍摄", "照片/视频/语音"]),
    ("② 素材", ["SNAPSHOT 素材库", "相册式聚合浏览"]),
    ("③ AI生成", ["AI日记 · 5种风格", "AI游记 · 结构化章节"]),
    ("④ 发布", ["三级内容链条", "草稿/私密/公开"]),
    ("⑤ 互动", ["社群·消息·推荐·通知", "USER + MODERATOR"]),
    ("⑥ 治理", ["审核·举报·软删除", "USER+MODERATOR+ADMIN"]),
]


def tw(text, size):
    return sum(size if ord(c) > 127 else size * 0.58 for c in text)


def main():
    lines = []
    S = lines.append
    S(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Microsoft YaHei, PingFang SC, sans-serif">')
    S(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

    # 中心主题
    ct = "徐霞客社区系统框架图"
    cs = 30
    cw = tw(ct, cs) + 64
    ch = 74

    # 先画连线（后画节点矩形盖住线头）
    n = len(branches)
    R1 = 340
    for i, (title, children) in enumerate(branches):
        ang = math.radians(-90 + i * (360.0 / n))
        dx, dy = math.cos(ang), math.sin(ang)
        color = COLORS[i]
        bx = CX + R1 * dx
        by = CY + R1 * dy

        S(f'<line x1="{CX:.1f}" y1="{CY:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="3"/>')

        # 子节点位置 + 连线
        tx, ty = -dy, dx
        m = len(children)
        gap = 50
        radial = 104
        for j, child in enumerate(children):
            cw2 = tw(child, 16) + 38
            off = (j - (m - 1) / 2.0) * gap
            cxx = bx + dx * radial + tx * off
            cyy = by + dy * radial + ty * off
            S(f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{cxx:.1f}" y2="{cyy:.1f}" stroke="{color}" stroke-width="2" opacity="0.55"/>')

    # 中心节点
    S(f'<rect x="{CX - cw / 2:.1f}" y="{CY - ch / 2:.1f}" width="{cw:.1f}" height="{ch:.1f}" rx="22" fill="#1F2937"/>')
    S(f'<text x="{CX}" y="{CY}" fill="#FFFFFF" font-size="{cs}" font-weight="bold" text-anchor="middle" dominant-baseline="central">{ct}</text>')

    # 分支节点 + 子节点
    for i, (title, children) in enumerate(branches):
        ang = math.radians(-90 + i * (360.0 / n))
        dx, dy = math.cos(ang), math.sin(ang)
        color = COLORS[i]
        bx = CX + R1 * dx
        by = CY + R1 * dy

        bs = 22
        bw = max(tw(title, bs) + 46, 132)
        bh = 52
        S(f'<rect x="{bx - bw / 2:.1f}" y="{by - bh / 2:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="15" fill="{color}"/>')
        S(f'<text x="{bx}" y="{by}" fill="#FFFFFF" font-size="{bs}" font-weight="bold" text-anchor="middle" dominant-baseline="central">{title}</text>')

        tx, ty = -dy, dx
        m = len(children)
        gap = 50
        radial = 104
        for j, child in enumerate(children):
            cw2 = tw(child, 16) + 38
            chh = 42
            off = (j - (m - 1) / 2.0) * gap
            cxx = bx + dx * radial + tx * off
            cyy = by + dy * radial + ty * off
            S(f'<rect x="{cxx - cw2 / 2:.1f}" y="{cyy - chh / 2:.1f}" width="{cw2:.1f}" height="{chh:.1f}" rx="12" fill="{color}" fill-opacity="0.12" stroke="{color}" stroke-opacity="0.5" stroke-width="1.5"/>')
            S(f'<text x="{cxx}" y="{cyy}" fill="#374151" font-size="16" text-anchor="middle" dominant-baseline="central">{child}</text>')

    S('</svg>')

    with open("徐霞客社区系统框架图.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("SVG 已生成")


if __name__ == "__main__":
    main()
