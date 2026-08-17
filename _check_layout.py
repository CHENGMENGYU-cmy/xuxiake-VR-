# -*- coding: utf-8 -*-
import math
W, H, CX, CY = 1700, 1100, 850, 560
branches = [
    ("三种角色", ["普通用户 USER", "审核员 MODERATOR", "管理员 ADMIN"]),
    ("① 采集", ["闪拍App拍摄", "照片/视频/语音"]),
    ("② 素材", ["SNAPSHOT 素材库", "相册式聚合浏览"]),
    ("③ AI生成", ["AI日记 · 5种风格", "AI游记 · 结构化章节"]),
    ("④ 发布", ["三级内容链条", "草稿/私密/公开"]),
    ("⑤ 互动", ["社群·消息·推荐·通知", "USER + MODERATOR"]),
    ("⑥ 治理", ["审核·举报·软删除", "USER+MODERATOR+ADMIN"]),
]


def tw(t, s):
    return sum(s if ord(c) > 127 else s * 0.58 for c in t)


R1 = 340
rects = []
for i, (title, children) in enumerate(branches):
    ang = math.radians(-90 + i * 360.0 / 7)
    dx, dy = math.cos(ang), math.sin(ang)
    bx, by = CX + R1 * dx, CY + R1 * dy
    bw = max(tw(title, 22) + 46, 132)
    bh = 52
    rects.append((title, bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2))
    tx, ty = -dy, dx
    m = len(children)
    for j, ch in enumerate(children):
        cw2 = tw(ch, 16) + 38
        off = (j - (m - 1) / 2.0) * 50
        cxx = bx + dx * 104 + tx * off
        cyy = by + dy * 104 + ty * off
        rects.append((ch, cxx - cw2 / 2, cyy - 21, cxx + cw2 / 2, cyy + 21))

print("== 越界 ==")
for n, x0, y0, x1, y1 in rects:
    if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
        print("  %s: (%.0f,%.0f)-(%.0f,%.0f)" % (n, x0, y0, x1, y1))
print("== 重叠 ==")
found = False
for a in range(len(rects)):
    for b in range(a + 1, len(rects)):
        na, xa0, ya0, xa1, ya1 = rects[a]
        nb, xb0, yb0, xb1, yb1 = rects[b]
        if xa0 < xb1 and xb0 < xa1 and ya0 < yb1 and yb0 < ya1:
            print("  %s <-> %s" % (na, nb))
            found = True
if not found:
    print("  (无)")
