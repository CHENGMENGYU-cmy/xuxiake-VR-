from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# 设置默认字体
style = doc.styles['Normal']
font = style.font
font.name = 'Microsoft YaHei'
font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

# 标题样式设置
for i in range(1, 4):
    heading = doc.styles[f'Heading {i}']
    heading.font.name = 'Microsoft YaHei'
    heading.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    heading.font.color.rgb = RGBColor(0, 0, 0)

def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # 表头
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
    # 数据行
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            table.rows[r_idx + 1].cells[c_idx].text = str(val)
    return table

# ==================== 封面 ====================
doc.add_paragraph()
doc.add_paragraph()
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('徐霞客社区')
run.font.size = Pt(36)
run.bold = True

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('研究计划与研究方案')
run.font.size = Pt(24)

doc.add_paragraph()
info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = info.add_run('时间范围：2026.7.19 → 2026.9.1（约6周）\n目标：完成社区平台建设，实现可投入使用状态')
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(100, 100, 100)

doc.add_page_break()

# ==================== 目录页 ====================
doc.add_heading('目录', level=1)
toc_items = [
    '一、任务清单',
    '  1.1 总任务',
    '  1.2 任务分解',
    '二、方案',
    '  2.1 整体架构',
    '  2.2 技术选型',
    '  2.3 AR眼镜日志数据方案',
    '  2.4 核心模块方案',
    '三、计划',
    '  3.1 总时间表',
    '  3.2 详细周计划',
    '四、进度跟踪',
    '  4.1 总进度',
    '  4.2 各模块进度明细',
    '五、风险与应对',
    '六、后期规划',
]
for item in toc_items:
    doc.add_paragraph(item, style='List Bullet')

doc.add_page_break()

# ==================== 一、任务清单 ====================
doc.add_heading('一、任务清单（做什么）', level=1)

doc.add_heading('1.1 总任务', level=2)
doc.add_paragraph('完成"徐霞客社区"旅行社交平台从开发到上线的全流程，包括前端完善、后端搭建、AI功能集成、AR数据接入、测试部署。')

doc.add_heading('1.2 任务分解', level=2)

# 阶段一
doc.add_heading('阶段一：基础搭建', level=3)
add_table(doc, ['编号', '任务', '说明'], [
    ['T1', '后端项目初始化', 'Spring Boot项目搭建、目录结构、基础配置'],
    ['T2', '数据库设计', '设计并建表：用户、帖子、评论、社群、消息、通知等'],
    ['T3', '用户认证服务', '注册、登录、JWT鉴权、Token刷新'],
    ['T4', '前后端联调', 'API对接、跨域配置、请求拦截器'],
])

doc.add_paragraph()
doc.add_heading('阶段二：核心功能', level=3)
add_table(doc, ['编号', '任务', '说明'], [
    ['T5', '内容服务', '帖子CRUD、点赞、评论、媒体上传'],
    ['T6', '社交服务', '关注/粉丝、私信（WebSocket实时推送）'],
    ['T7', '社群服务', '社群创建/管理、挑战活动、排行榜'],
    ['T8', '搜索服务', '全局搜索、搜索建议'],
    ['T9', '通知系统', '站内通知、未读计数、消息推送'],
])

doc.add_paragraph()
doc.add_heading('阶段三：AI功能', level=3)
add_table(doc, ['编号', '任务', '说明'], [
    ['T10', '用户画像', '收集行为数据，构建兴趣标签体系'],
    ['T11', '内容推荐', '基于画像的个性化Feed推荐'],
    ['T12', '社交匹配', '智能推荐旅伴（兴趣/地区/行为相似度）'],
    ['T13', 'AI游记生成', '输入轨迹+照片，大模型生成图文游记'],
    ['T14', '智能助手', '对话式AI旅行助手'],
])

doc.add_paragraph()
doc.add_heading('阶段四：AR数据接入', level=3)
add_table(doc, ['编号', '任务', '说明'], [
    ['T15', 'AR数据结构定义', '定义AR眼镜日志数据格式（轨迹、视角、识别结果等）'],
    ['T16', '数据导入模块', '支持AR眼镜日志数据的批量导入与解析'],
    ['T17', '轨迹可视化', '在地图上展示AR眼镜记录的旅行轨迹'],
    ['T18', '第一视角回放', '基于AR日志数据的第一视角内容回放'],
])

doc.add_paragraph()
doc.add_heading('阶段五：测试部署', level=3)
add_table(doc, ['编号', '任务', '说明'], [
    ['T19', '功能测试', '核心流程端到端测试'],
    ['T20', '性能优化', '页面加载、API响应、数据库查询优化'],
    ['T21', '部署上线', '前端Vercel + 后端云服务器'],
    ['T22', '文档整理', '使用文档、API文档、部署文档'],
])

doc.add_page_break()

# ==================== 二、方案 ====================
doc.add_heading('二、方案（怎么做）', level=1)

doc.add_heading('2.1 整体架构', level=2)
doc.add_paragraph('''系统采用前后端分离架构：

前端（Next.js 16）
  ├── React 19 + TypeScript + Tailwind CSS
  ├── shadcn/ui + Zustand + Axios
  └── 通过 REST API / WebSocket 与后端通信

后端（Spring Boot）
  ├── 用户服务 | 内容服务 | 社交服务 | 社群服务
  ├── AI服务   | 搜索服务 | 通知服务 | AR数据服务
  └── 连接 MySQL（主存储）+ Redis（缓存）+ AI服务（大模型API）''')

doc.add_heading('2.2 技术选型', level=2)
add_table(doc, ['层级', '技术', '选型理由'], [
    ['前端框架', 'Next.js 16 + React 19', '已有代码基础，SSR支持好'],
    ['UI组件', 'shadcn/ui + Tailwind CSS', '已集成，开发效率高'],
    ['状态管理', 'Zustand', '轻量，已使用'],
    ['后端框架', 'Spring Boot', '企业级标准，生态成熟'],
    ['数据库', 'MySQL', '关系型数据存储'],
    ['缓存', 'Redis', '会话、热点数据、在线状态'],
    ['实时通信', 'WebSocket', '私信、通知实时推送'],
    ['AI能力', '大模型API', '内容生成、对话助手'],
    ['推荐算法', '自研 + 向量检索', '用户匹配、内容推荐'],
    ['部署', 'Vercel + 云服务器', '前端CDN加速，后端稳定运行'],
])

doc.add_heading('2.3 AR眼镜日志数据方案', level=2)
doc.add_paragraph('数据格式设计：')
doc.add_paragraph('''{
  "sessionId": "session_001",
  "userId": "user_123",
  "startTime": "2026-08-15T09:00:00Z",
  "endTime": "2026-08-15T17:30:00Z",
  "device": { "model": "XiaoAI Glasses", "version": "2.0" },
  "轨迹数据": [{ "timestamp": "...", "lat": 39.9, "lng": 116.4, "地点名称": "天安门广场" }],
  "视角数据": [{ "timestamp": "...", "视频片段": "clip_001.mp4", "vrFormat": "VR360" }],
  "AI识别结果": [{ "timestamp": "...", "类型": "景点", "名称": "天安门城楼" }],
  "用户语音": [{ "timestamp": "...", "转写文本": "今天天气真好" }]
}''')

doc.add_paragraph('数据处理流程：')
doc.add_paragraph('AR眼镜日志 → 数据导入 → 解析清洗 → 存储入库 → 展示回放\n                                    ↓\n                              AI分析处理\n                              ├── 自动生成游记\n                              ├── 景点标签提取\n                              └── 旅行画像更新')

doc.add_heading('2.4 核心模块方案', level=2)

doc.add_paragraph('用户认证方案', style='List Bullet')
doc.add_paragraph('  方式：邮箱注册 + JWT认证\n  Token：Access Token（2小时）+ Refresh Token（7天）\n  存储：Redis存Session，MySQL存用户信息')

doc.add_paragraph('实时通信方案', style='List Bullet')
doc.add_paragraph('  技术：WebSocket（Spring Boot + STOMP）\n  场景：私信聊天、通知推送、在线状态\n  消息存储：MySQL持久化 + Redis暂存未读')

doc.add_paragraph('推荐算法方案', style='List Bullet')
doc.add_paragraph('  内容推荐：协同过滤（用户行为）+ 内容特征（标签/地点）+ 热度衰减\n  社交匹配：多维特征向量相似度（兴趣/年龄/地区/活跃度）\n  冷启动：基于注册时选择的兴趣标签 + 热门内容兜底')

doc.add_paragraph('AI游记生成方案', style='List Bullet')
doc.add_paragraph('  输入：AR轨迹数据 + 语音转写 + 拍摄照片\n  处理：大模型API，Prompt模板化\n  输出：图文并茂的游记草稿，用户可编辑发布')

doc.add_page_break()

# ==================== 三、计划 ====================
doc.add_heading('三、计划（什么时候做）', level=1)

doc.add_heading('3.1 总时间表', level=2)
doc.add_paragraph('7.19 ──────────────────────────────────────── 9.1\n  │\n  ├─ 第1周 ──┤ 基础搭建（后端+数据库+认证）\n  ├─ 第2周 ──┤ 前后端联调 + 核心服务开发\n  ├─ 第3周 ──┤ 核心服务完成 + AI功能启动\n  ├─ 第4周 ──┤ AI功能开发 + AR数据接入\n  ├─ 第5周 ──┤ 测试优化 + AI功能完善\n  └─ 第6周 ──┘ 部署上线 + 文档整理')

doc.add_heading('3.2 详细周计划', level=2)

doc.add_heading('第1周（7.19 - 7.25）：基础搭建', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['7.19-7.20', '后端项目初始化、目录结构、基础配置', '可运行的Spring Boot项目'],
    ['7.21-7.22', '数据库设计、建表、初始化数据', '数据库脚本、ER图'],
    ['7.23-7.24', '用户注册/登录接口、JWT鉴权', '用户认证完整流程'],
    ['7.25', '前后端联调、跨域配置', '前端能调通后端接口'],
])

doc.add_paragraph()
doc.add_heading('第2周（7.26 - 8.1）：核心服务开发', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['7.26-7.27', '帖子服务（CRUD、媒体上传）', '发帖/删帖/改帖接口'],
    ['7.28-7.29', '评论/点赞服务、社交服务（关注/粉丝）', '完整的内容互动功能'],
    ['7.30-7.31', '私信服务（WebSocket）', '实时聊天可用'],
    ['8.1', '通知系统', '站内通知推送'],
])

doc.add_paragraph()
doc.add_heading('第3周（8.2 - 8.8）：社群 + 搜索', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['8.2-8.3', '社群服务（创建/管理/成员）', '社群功能完整'],
    ['8.4-8.5', '挑战活动、排行榜', '社群互动功能'],
    ['8.6-8.7', '搜索服务（全局搜索、搜索建议）', '搜索功能可用'],
    ['8.8', '前端对接 + 整体联调', '社群和搜索功能跑通'],
])

doc.add_paragraph()
doc.add_heading('第4周（8.9 - 8.15）：AI功能', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['8.9-8.10', '用户画像系统（行为采集、标签体系）', '用户画像可用'],
    ['8.11-8.12', '内容推荐算法', 'Feed流个性化推荐'],
    ['8.13-8.14', '社交匹配算法', '推荐旅伴功能'],
    ['8.15', 'AI游记生成（大模型接入）', '输入轨迹生成游记'],
])

doc.add_paragraph()
doc.add_heading('第5周（8.16 - 8.22）：AR数据 + 测试', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['8.16-8.17', 'AR数据格式定义、导入模块', '支持AR日志导入'],
    ['8.18-8.19', '轨迹可视化、第一视角回放', 'AR数据展示功能'],
    ['8.20-8.21', '功能测试、Bug修复', '核心流程无阻断问题'],
    ['8.22', '性能优化', '页面加载、接口响应优化'],
])

doc.add_paragraph()
doc.add_heading('第6周（8.23 - 9.1）：部署收尾', level=3)
add_table(doc, ['日期', '任务', '产出'], [
    ['8.23-8.24', '部署前端到Vercel', '线上可访问'],
    ['8.25-8.26', '部署后端到云服务器', '后端服务稳定运行'],
    ['8.27-8.28', '联调测试、问题修复', '线上功能正常'],
    ['8.29-8.31', '文档整理', '完整项目文档'],
    ['9.1', '最终检查、成果汇报准备', '项目完成'],
])

doc.add_page_break()

# ==================== 四、进度跟踪 ====================
doc.add_heading('四、进度跟踪', level=1)

doc.add_heading('4.1 总进度', level=2)
doc.add_paragraph('整体进度：0%（尚未开始）')
doc.add_paragraph('前端：100%（已有代码基础）\n后端：0%（待开发）\nAI：0%（待开发）\nAR：0%（待开发）\n测试：0%（待进行）\n部署：0%（待进行）')

doc.add_heading('4.2 各模块进度明细', level=2)

doc.add_heading('前端模块', level=3)
add_table(doc, ['模块', '状态', '完成度', '备注'], [
    ['用户系统（登录/注册/设置）', '已完成', '100%', ''],
    ['动态Feed（发帖/点赞/评论）', '已完成', '100%', ''],
    ['社群系统（创建/管理/挑战）', '已完成', '100%', ''],
    ['私信聊天', '已完成', '100%', ''],
    ['搜索发现', '已完成', '100%', ''],
    ['VR播放器', '已完成', '100%', ''],
    ['AI游记生成界面', '待开发', '0%', ''],
    ['AR轨迹展示', '待开发', '0%', ''],
    ['智能推荐展示', '待开发', '0%', ''],
])

doc.add_paragraph()
doc.add_heading('后端模块', level=3)
add_table(doc, ['模块', '状态', '完成度', '备注'], [
    ['项目初始化', '待开始', '0%', ''],
    ['用户认证', '待开始', '0%', ''],
    ['内容服务', '待开始', '0%', ''],
    ['社交服务', '待开始', '0%', ''],
    ['社群服务', '待开始', '0%', ''],
    ['搜索服务', '待开始', '0%', ''],
    ['通知服务', '待开始', '0%', ''],
    ['AR数据服务', '待开始', '0%', ''],
])

doc.add_paragraph()
doc.add_heading('AI模块', level=3)
add_table(doc, ['模块', '状态', '完成度', '备注'], [
    ['用户画像', '待开始', '0%', ''],
    ['内容推荐', '待开始', '0%', ''],
    ['社交匹配', '待开始', '0%', ''],
    ['游记生成', '待开始', '0%', ''],
    ['智能助手', '待开始', '0%', ''],
])

doc.add_paragraph()
doc.add_heading('部署模块', level=3)
add_table(doc, ['模块', '状态', '完成度', '备注'], [
    ['前端部署（Vercel）', '待开始', '0%', ''],
    ['后端部署（云服务器）', '待开始', '0%', ''],
    ['域名配置', '待开始', '0%', ''],
    ['文档整理', '待开始', '0%', ''],
])

doc.add_page_break()

# ==================== 五、风险与应对 ====================
doc.add_heading('五、风险与应对', level=1)

add_table(doc, ['风险', '可能性', '影响', '应对方案'], [
    ['6周时间不够', '高', '高', '优先做核心功能，AI和AR可降级为Demo'],
    ['AI效果不理想', '中', '中', '先用规则引擎兜底，后续迭代优化'],
    ['AR眼镜没有真实数据', '中', '中', '先用模拟数据，后期接入真实设备'],
    ['后端开发进度慢', '中', '高', '简化非核心功能，必要时用BaaS替代'],
    ['部署出问题', '低', '中', '提前准备备用方案（本地演示）'],
])

doc.add_page_break()

# ==================== 六、后期规划 ====================
doc.add_heading('六、后期规划（9月开学后）', level=1)

doc.add_heading('6.1 短期（9-10月）', level=2)
doc.add_paragraph('• 接入真实AR眼镜设备，采集日志数据', style='List Bullet')
doc.add_paragraph('• 根据用户反馈优化功能和体验', style='List Bullet')
doc.add_paragraph('• 完善AI推荐算法效果', style='List Bullet')

doc.add_heading('6.2 中期（11-12月）', level=2)
doc.add_paragraph('• 移动端适配/小程序开发', style='List Bullet')
doc.add_paragraph('• 更多AI能力接入', style='List Bullet')
doc.add_paragraph('• 用户运营和内容运营', style='List Bullet')

doc.add_heading('6.3 长期（明年）', level=2)
doc.add_paragraph('• 商业化探索', style='List Bullet')
doc.add_paragraph('• 更多VR/AR设备支持', style='List Bullet')
doc.add_paragraph('• 社区生态建设', style='List Bullet')

# 保存文档
output_path = r'D:\Other\Cluade CodeProjects\XuXiaKe\研究计划与研究方案.docx'
doc.save(output_path)
print(f'文档已保存到: {output_path}')
