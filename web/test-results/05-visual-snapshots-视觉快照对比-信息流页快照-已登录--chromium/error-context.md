# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-visual-snapshots.spec.ts >> 视觉快照对比 >> 信息流页快照 (已登录)
- Location: e2e\05-visual-snapshots.spec.ts:19:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  21699 pixels (ratio 0.03 of all image pixels) are different.

  Snapshot: feed-page.png

Call log:
  - Expect "toHaveScreenshot(feed-page.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 21699 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 21699 pixels (ratio 0.03 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - navigation [ref=f1e2]:
    - generic [ref=f1e3]:
      - link "徐 徐霞客" [ref=f1e5] [cursor=pointer]:
        - /url: /feed
        - generic [ref=f1e6]: 徐
        - generic [ref=f1e8]: 徐霞客
      - searchbox "搜索徐霞客系统..." [ref=f1e14]
      - generic [ref=f1e15]:
        - link [ref=f1e16] [cursor=pointer]:
          - /url: /feed
          - button [ref=f1e17]
        - link [ref=f1e18] [cursor=pointer]:
          - /url: /upload
          - button [ref=f1e19]
        - link [ref=f1e20] [cursor=pointer]:
          - /url: /messages
          - button "3" [ref=f1e21]
        - link [ref=f1e23] [cursor=pointer]:
          - /url: /notifications
          - button [ref=f1e24]
        - button [ref=f1e25]:
          - img "张三" [ref=f1e27]
  - generic [ref=f1e28]:
    - complementary [ref=f1e29]:
      - generic [ref=f1e31]:
        - link [ref=f1e33] [cursor=pointer]:
          - /url: /profile/zhangshan
          - img "张三" [ref=f1e35]
          - generic [ref=f1e36]:
            - paragraph [ref=f1e38]: 张三
            - paragraph [ref=f1e39]: "@zhangshan"
        - separator [ref=f1e40]
        - generic [ref=f1e41]:
          - paragraph [ref=f1e42]: 浏览
          - link [ref=f1e43] [cursor=pointer]:
            - /url: /feed
            - button "首页" [ref=f1e44]
          - link [ref=f1e46] [cursor=pointer]:
            - /url: /topics
            - button "话题广场" [ref=f1e47]
          - link [ref=f1e49] [cursor=pointer]:
            - /url: /discover
            - button "找搭子" [ref=f1e50]
        - separator [ref=f1e52]
        - generic [ref=f1e53]:
          - paragraph [ref=f1e54]: 我的内容
          - link [ref=f1e55] [cursor=pointer]:
            - /url: /classified
            - button "旅途档案" [ref=f1e56]
          - link [ref=f1e58] [cursor=pointer]:
            - /url: /diaries
            - button "我的日记" [ref=f1e59]
          - link [ref=f1e61] [cursor=pointer]:
            - /url: /journeys
            - button "游记散文" [ref=f1e62]
        - separator [ref=f1e64]
        - separator [ref=f1e65]
        - generic [ref=f1e66]:
          - paragraph [ref=f1e67]: 创作
          - link [ref=f1e68] [cursor=pointer]:
            - /url: /upload
            - button "分享见闻" [ref=f1e69]
        - generic [ref=f1e71]:
          - paragraph [ref=f1e72]: 个人
          - link [ref=f1e73] [cursor=pointer]:
            - /url: /messages
            - button "消息 3" [ref=f1e74]:
              - generic [ref=f1e75]: 消息
              - generic [ref=f1e76]: "3"
          - link [ref=f1e77] [cursor=pointer]:
            - /url: /notifications
            - button "通知" [ref=f1e78]
          - link [ref=f1e80] [cursor=pointer]:
            - /url: /settings
            - button "设置" [ref=f1e81]
    - main [ref=f1e83]:
      - generic [ref=f1e85]:
        - generic [ref=f1e86]:
          - button "推荐" [ref=f1e87]
          - button "关注" [ref=f1e91]
        - generic [ref=f1e97]:
          - generic [ref=f1e100]:
            - img "张三" [ref=f1e102]
            - generic [ref=f1e104]:
              - generic [ref=f1e105]: 分享你的旅行故事...
              - button [ref=f1e106]
              - button "发布" [disabled]
          - button "刷新内容" [ref=f1e108]
          - generic [ref=f1e109]:
            - generic [ref=f1e110]:
              - generic [ref=f1e111]:
                - link [ref=f1e112] [cursor=pointer]:
                  - /url: /profile/lisi
                  - img "李四" [ref=f1e114]
                - generic [ref=f1e115]:
                  - generic [ref=f1e116]:
                    - link "李四" [ref=f1e117] [cursor=pointer]:
                      - /url: /profile/lisi
                    - generic [ref=f1e118]: 瞬间
                  - generic [ref=f1e121]:
                    - generic [ref=f1e122]: 2026/7/16
                    - generic [ref=f1e123]: ·
                    - generic [ref=f1e127]: ·
                    - generic [ref=f1e131]: 上海外滩
                - button [ref=f1e132]
              - paragraph [ref=f1e138]: 下班后骑车去了外滩，用VR记录了黄浦江的夜景。上海的夜晚真的很迷人 ✨
              - generic [ref=f1e139]: 🌆 城市探索
              - generic [ref=f1e141]:
                - generic [ref=f1e142]: "0"
                - generic [ref=f1e146]:
                  - generic [ref=f1e147]: 0 条评论
                  - generic [ref=f1e148]: 982 次浏览
              - generic [ref=f1e149]:
                - button "赞" [ref=f1e150]
                - button "评论" [ref=f1e151]
                - button "分享" [ref=f1e153]
            - generic [ref=f1e154]:
              - generic [ref=f1e155]:
                - link [ref=f1e156] [cursor=pointer]:
                  - /url: /profile/zhangshan
                  - img "张三" [ref=f1e158]
                - generic [ref=f1e159]:
                  - link "张三" [ref=f1e161] [cursor=pointer]:
                    - /url: /profile/zhangshan
                  - generic [ref=f1e162]:
                    - generic [ref=f1e163]: 2026/7/14
                    - generic [ref=f1e164]: ·
                    - generic [ref=f1e168]: ·
                    - generic [ref=f1e172]: 故宫博物院
                - button [ref=f1e173]
              - paragraph [ref=f1e179]: 故宫博物院一日游！用VR眼镜录了一段导游讲解，还自动翻译成了英文版本。推荐大家一定要去看看延禧宫，那个西洋建筑真的很有意思 🏯
              - generic [ref=f1e180]:
                - generic [ref=f1e181] [cursor=pointer]: 🏛️ 历史古迹
                - generic [ref=f1e182] [cursor=pointer]: 🏛️ 博物馆
                - link "#古镇探秘" [ref=f1e183] [cursor=pointer]:
                  - /url: /topics/topic-005
              - generic [ref=f1e187]:
                - generic [ref=f1e188]: "0"
                - generic [ref=f1e192]:
                  - generic [ref=f1e193]: 0 条评论
                  - generic [ref=f1e194]: 3200 次浏览
              - generic [ref=f1e195]:
                - button "赞" [ref=f1e196]
                - button "评论" [ref=f1e197]
                - button "分享" [ref=f1e199]
            - generic [ref=f1e200]:
              - generic [ref=f1e201]:
                - link [ref=f1e202] [cursor=pointer]:
                  - /url: /profile/zhangshan
                  - img "张三" [ref=f1e204]
                - generic [ref=f1e205]:
                  - generic [ref=f1e206]:
                    - link "张三" [ref=f1e207] [cursor=pointer]:
                      - /url: /profile/zhangshan
                    - generic [ref=f1e208]: 第一视角
                    - generic [ref=f1e211]: Meta Quest 4
                  - generic [ref=f1e212]:
                    - generic [ref=f1e213]: 2026/7/11
                    - generic [ref=f1e214]: ·
                    - generic [ref=f1e218]: ·
                    - generic [ref=f1e222]: 张家界天门山
                - generic [ref=f1e223]: "2"
                - button [ref=f1e226]
              - paragraph [ref=f1e232]: 张家界天门山VR180立体视频！走在玻璃栈道上，脚下就是万丈深渊，刺激又震撼。用Meta Quest 4拍摄 🌿
              - generic [ref=f1e233]:
                - generic [ref=f1e234] [cursor=pointer]: 🏔️ 自然风光
                - generic [ref=f1e235] [cursor=pointer]: 📹 空间视频
                - link "#VR拍摄技巧" [ref=f1e236] [cursor=pointer]:
                  - /url: /topics/topic-003
              - generic [ref=f1e237]: 您的浏览器不支持视频播放
              - generic [ref=f1e244]:
                - generic [ref=f1e245]: "0"
                - generic [ref=f1e249]:
                  - generic [ref=f1e250]: 2 条评论
                  - generic [ref=f1e251]: 3800 次浏览
              - generic [ref=f1e252]:
                - button "赞" [ref=f1e253]
                - button "评论" [ref=f1e254]
                - button "分享" [ref=f1e256]
            - generic [ref=f1e257]:
              - generic [ref=f1e258]:
                - link [ref=f1e259] [cursor=pointer]:
                  - /url: /profile/lisi
                  - img "李四" [ref=f1e261]
                - generic [ref=f1e262]:
                  - generic [ref=f1e263]:
                    - link "李四" [ref=f1e264] [cursor=pointer]:
                      - /url: /profile/lisi
                    - generic [ref=f1e265]: 第一视角
                    - generic [ref=f1e268]: Apple Vision Pro
                  - generic [ref=f1e269]:
                    - generic [ref=f1e270]: 2026/7/10
                    - generic [ref=f1e271]: ·
                    - generic [ref=f1e275]: ·
                    - generic [ref=f1e279]: 桂林漓江
                - button [ref=f1e280]
              - paragraph [ref=f1e286]: 桂林漓江空间视频！坐在竹筏上，两岸的喀斯特地貌尽收眼底。这个空间视频效果真的太棒了 🎥
              - generic [ref=f1e287]:
                - generic [ref=f1e288] [cursor=pointer]: 🏔️ 自然风光
                - generic [ref=f1e289] [cursor=pointer]: 📹 空间视频
              - generic [ref=f1e290]:
                - generic [ref=f1e291]: "0"
                - generic [ref=f1e295]:
                  - generic [ref=f1e296]: 0 条评论
                  - generic [ref=f1e297]: 2600 次浏览
              - generic [ref=f1e298]:
                - button "赞" [ref=f1e299]
                - button "评论" [ref=f1e300]
                - button "分享" [ref=f1e302]
            - generic [ref=f1e303]:
              - generic [ref=f1e304]:
                - link [ref=f1e305] [cursor=pointer]:
                  - /url: /profile/zhangshan
                  - img "张三" [ref=f1e307]
                - generic [ref=f1e308]:
                  - generic [ref=f1e309]:
                    - link "张三" [ref=f1e310] [cursor=pointer]:
                      - /url: /profile/zhangshan
                    - generic [ref=f1e311]: 游记
                  - generic [ref=f1e315]:
                    - generic [ref=f1e316]: 2026/7/8
                    - generic [ref=f1e317]: ·
                    - generic [ref=f1e321]: ·
                    - generic [ref=f1e325]: 千岛湖
                - generic [ref=f1e326]: "2"
                - button [ref=f1e329]
              - paragraph [ref=f1e335]: 千岛湖环湖骑行路线！全程约80公里，沿湖骑行风景绝美。途经千岛湖大桥、姜家镇、汾口镇，最后回到千岛湖镇。建议分两天完成，中间在姜家镇住一晚 🚴
              - generic [ref=f1e336]:
                - generic [ref=f1e337] [cursor=pointer]: 🏔️ 自然风光
                - generic [ref=f1e338] [cursor=pointer]: 🚴 骑行
              - generic [ref=f1e339]:
                - generic [ref=f1e340]: "0"
                - generic [ref=f1e344]:
                  - generic [ref=f1e345]: 2 条评论
                  - generic [ref=f1e346]: 2100 次浏览
              - generic [ref=f1e347]:
                - button "赞" [ref=f1e348]
                - button "评论" [ref=f1e349]
                - button "分享" [ref=f1e351]
            - generic [ref=f1e352]:
              - generic [ref=f1e353]:
                - link [ref=f1e354] [cursor=pointer]:
                  - /url: /profile/lisi
                  - img "李四" [ref=f1e356]
                - generic [ref=f1e357]:
                  - generic [ref=f1e358]:
                    - link "李四" [ref=f1e359] [cursor=pointer]:
                      - /url: /profile/lisi
                    - generic [ref=f1e360]: 游记
                  - generic [ref=f1e364]:
                    - generic [ref=f1e365]: 2026/7/7
                    - generic [ref=f1e366]: ·
                    - generic [ref=f1e370]: ·
                    - generic [ref=f1e374]: 阳朔月亮山
                - button [ref=f1e375]
              - paragraph [ref=f1e381]: 阳朔攀岩路线推荐！在月亮山有几条经典线路，难度5.10a-5.12b不等。今天挑战了5.11a的"月光之路"，虽然中途掉了两次但最终还是完攀了！🧗
              - generic [ref=f1e382]: 🥾 徒步旅行
              - generic [ref=f1e384]:
                - generic [ref=f1e385]: "0"
                - generic [ref=f1e389]:
                  - generic [ref=f1e390]: 0 条评论
                  - generic [ref=f1e391]: 1800 次浏览
              - generic [ref=f1e392]:
                - button "赞" [ref=f1e393]
                - button "评论" [ref=f1e394]
                - button "分享" [ref=f1e396]
            - generic [ref=f1e397]:
              - generic [ref=f1e398]:
                - link [ref=f1e399] [cursor=pointer]:
                  - /url: /profile/zhangshan
                  - img "张三" [ref=f1e401]
                - generic [ref=f1e402]:
                  - link "张三" [ref=f1e404] [cursor=pointer]:
                    - /url: /profile/zhangshan
                  - generic [ref=f1e405]:
                    - generic [ref=f1e406]: 2026/7/6
                    - generic [ref=f1e407]: ·
                    - generic [ref=f1e411]: ·
                    - generic [ref=f1e415]: 云南
                - button [ref=f1e416]
              - paragraph [ref=f1e422]: 【云南住宿攻略】从青旅到民宿到星级酒店，云南各地住宿全攻略。重点推荐大理的海景民宿和丽江的纳西庭院客栈，性价比超高 🏨
              - generic [ref=f1e423]:
                - generic [ref=f1e424] [cursor=pointer]: 📝 旅行攻略
                - link "#云南之旅" [ref=f1e425] [cursor=pointer]:
                  - /url: /topics/topic-002
              - generic [ref=f1e426]:
                - generic [ref=f1e427]: "0"
                - generic [ref=f1e431]:
                  - generic [ref=f1e432]: 0 条评论
                  - generic [ref=f1e433]: 3900 次浏览
              - generic [ref=f1e434]:
                - button "赞" [ref=f1e435]
                - button "评论" [ref=f1e436]
                - button "分享" [ref=f1e438]
            - generic [ref=f1e439]:
              - generic [ref=f1e440]:
                - link [ref=f1e441] [cursor=pointer]:
                  - /url: /profile/lisi
                  - img "李四" [ref=f1e443]
                - generic [ref=f1e444]:
                  - link "李四" [ref=f1e446] [cursor=pointer]:
                    - /url: /profile/lisi
                  - generic [ref=f1e447]:
                    - generic [ref=f1e448]: 2026/7/4
                    - generic [ref=f1e449]: ·
                    - generic [ref=f1e453]: ·
                    - generic [ref=f1e457]: 黄山
                - button [ref=f1e458]
              - paragraph [ref=f1e464]: 【黄山交通攻略】怎么去黄山？高铁到黄山北站后怎么到景区？景区内交通怎么安排？索道怎么选？一篇搞定所有交通问题 🚗
              - generic [ref=f1e465]:
                - generic [ref=f1e466] [cursor=pointer]: 🚗 自驾游
                - generic [ref=f1e467] [cursor=pointer]: 📝 旅行攻略
                - link "#徒步挑战" [ref=f1e468] [cursor=pointer]:
                  - /url: /topics/topic-007
              - generic [ref=f1e469]:
                - generic [ref=f1e470]: "0"
                - generic [ref=f1e474]:
                  - generic [ref=f1e475]: 0 条评论
                  - generic [ref=f1e476]: 2800 次浏览
              - generic [ref=f1e477]:
                - button "赞" [ref=f1e478]
                - button "评论" [ref=f1e479]
                - button "分享" [ref=f1e481]
            - generic [ref=f1e482]:
              - generic [ref=f1e483]:
                - link [ref=f1e484] [cursor=pointer]:
                  - /url: /profile/zhangshan
                  - img "张三" [ref=f1e486]
                - generic [ref=f1e487]:
                  - generic [ref=f1e488]:
                    - link "张三" [ref=f1e489] [cursor=pointer]:
                      - /url: /profile/zhangshan
                    - generic [ref=f1e490]: 游记
                  - generic [ref=f1e494]:
                    - generic [ref=f1e495]: 2026/7/1
                    - generic [ref=f1e496]: ·
                    - generic [ref=f1e500]: ·
                    - generic [ref=f1e504]: 东京
                - button [ref=f1e505]
              - paragraph [ref=f1e511]: 日本东京5日游！浅草寺、涩谷、新宿、秋叶原、台场...每天都是暴走模式。最推荐的是筑地市场的海鲜早餐，新鲜到爆 🇯🇵
              - generic [ref=f1e512]:
                - generic [ref=f1e513] [cursor=pointer]: 🌆 城市探索
                - generic [ref=f1e514] [cursor=pointer]: 🍜 美食探店
                - link "#东京自由行" [ref=f1e515] [cursor=pointer]:
                  - /url: /topics/topic-001
              - generic [ref=f1e519]:
                - generic [ref=f1e520]: "0"
                - generic [ref=f1e524]:
                  - generic [ref=f1e525]: 0 条评论
                  - generic [ref=f1e526]: 4100 次浏览
              - generic [ref=f1e527]:
                - button "赞" [ref=f1e528]
                - button "评论" [ref=f1e529]
                - button "分享" [ref=f1e531]
            - generic [ref=f1e532]:
              - generic [ref=f1e533]:
                - link [ref=f1e534] [cursor=pointer]:
                  - /url: /profile/lisi
                  - img "李四" [ref=f1e536]
                - generic [ref=f1e537]:
                  - link "李四" [ref=f1e539] [cursor=pointer]:
                    - /url: /profile/lisi
                  - generic [ref=f1e540]:
                    - generic [ref=f1e541]: 2026/6/21
                    - generic [ref=f1e542]: ·
                    - generic [ref=f1e546]: ·
                    - generic [ref=f1e550]: 杭州西湖
                - button [ref=f1e551]
              - paragraph [ref=f1e557]: 杭州西湖太美了！VR180度拍摄断桥残雪，还附上了百度百科链接，方便大家了解更多西湖的历史 🌊
              - generic [ref=f1e558]:
                - generic [ref=f1e559]:
                  - generic [ref=f1e560]: 您的浏览器不支持视频播放
                  - generic [ref=f1e565]: VR 180°
                  - generic [ref=f1e566]: 1:30
                - link "西湖 - 百度百科 西湖，位于浙江省杭州市西面，是中国大陆首批国家重点风景名胜区之一" [ref=f1e567] [cursor=pointer]:
                  - /url: https://baike.baidu.com/item/西湖
                  - generic [ref=f1e569]:
                    - generic [ref=f1e570]: 西湖 - 百度百科
                    - paragraph [ref=f1e579]: 西湖，位于浙江省杭州市西面，是中国大陆首批国家重点风景名胜区之一
              - generic [ref=f1e580]:
                - generic [ref=f1e581]: "2"
                - generic [ref=f1e585]:
                  - generic [ref=f1e586]: 0 条评论
                  - generic [ref=f1e587]: 720 次浏览
              - generic [ref=f1e588]:
                - button "赞" [ref=f1e589]
                - button "评论" [ref=f1e590]
                - button "分享" [ref=f1e592]
          - button "加载更多" [ref=f1e594]
    - complementary [ref=f1e595]:
      - generic [ref=f1e596]:
        - generic [ref=f1e597]:
          - generic [ref=f1e598]: 热门话题
          - generic [ref=f1e604]:
            - link "# VR拍摄技巧 3篇" [ref=f1e605] [cursor=pointer]:
              - /url: /topics/topic-003
              - generic [ref=f1e606]: "# VR拍摄技巧"
              - generic [ref=f1e607]: 3篇
            - link "# 徒步挑战 3篇" [ref=f1e608] [cursor=pointer]:
              - /url: /topics/topic-007
              - generic [ref=f1e609]: "# 徒步挑战"
              - generic [ref=f1e610]: 3篇
            - link "# 东京自由行 2篇" [ref=f1e611] [cursor=pointer]:
              - /url: /topics/topic-001
              - generic [ref=f1e612]: "# 东京自由行"
              - generic [ref=f1e613]: 2篇
            - link "# 云南之旅 2篇" [ref=f1e614] [cursor=pointer]:
              - /url: /topics/topic-002
              - generic [ref=f1e615]: "# 云南之旅"
              - generic [ref=f1e616]: 2篇
            - link "# 美食地图 2篇" [ref=f1e617] [cursor=pointer]:
              - /url: /topics/topic-008
              - generic [ref=f1e618]: "# 美食地图"
              - generic [ref=f1e619]: 2篇
            - button "查看全部话题" [ref=f1e620]
        - generic [ref=f1e621]:
          - generic [ref=f1e622]: 推荐关注
          - generic [ref=f1e628]:
            - link [ref=f1e629] [cursor=pointer]:
              - /url: /profile/zhaoliu
              - img "赵六" [ref=f1e631]
              - generic [ref=f1e632]:
                - paragraph [ref=f1e633]: 赵六
                - paragraph [ref=f1e634]: 1个共同兴趣
            - link [ref=f1e635] [cursor=pointer]:
              - /url: /profile/xuxiake
              - img "徐霞客" [ref=f1e637]
              - generic [ref=f1e638]:
                - paragraph [ref=f1e639]: 徐霞客
                - paragraph [ref=f1e640]: 带着VR眼镜看世界 🌍 记录每一段旅程
            - link [ref=f1e641] [cursor=pointer]:
              - /url: /profile/lisi
              - img "李四" [ref=f1e643]
              - generic [ref=f1e644]:
                - paragraph [ref=f1e645]: 李四
                - paragraph [ref=f1e646]: 1个共同兴趣
        - generic [ref=f1e647]:
          - generic [ref=f1e648]: 推荐社群
          - generic [ref=f1e653]:
            - link "户外探险小队 户外探险小队 3 成员 雪山攀登 徒步旅行" [ref=f1e654] [cursor=pointer]:
              - /url: /communities/com2
              - img "户外探险小队" [ref=f1e656]
              - generic [ref=f1e657]:
                - paragraph [ref=f1e658]: 户外探险小队
                - paragraph [ref=f1e659]: 3 成员
                - generic [ref=f1e660]:
                  - generic [ref=f1e661]: 雪山攀登
                  - generic [ref=f1e662]: 徒步旅行
            - link "美食探店群 美食探店群 6 成员 城市探索 美食探店" [ref=f1e663] [cursor=pointer]:
              - /url: /communities/com3
              - img "美食探店群" [ref=f1e665]
              - generic [ref=f1e666]:
                - paragraph [ref=f1e667]: 美食探店群
                - paragraph [ref=f1e668]: 6 成员
                - generic [ref=f1e669]:
                  - generic [ref=f1e670]: 城市探索
                  - generic [ref=f1e671]: 美食探店
        - generic [ref=f1e672]:
          - generic [ref=f1e673]: 近期热门动态
          - generic [ref=f1e678]:
            - link "测评了一下最新款的VR相机，画质提升太明显了！4K 360度拍摄，细节保留得非常好，推荐给所有VR创作者 📷✨ 李四 4 赞 6 评论" [ref=f1e679] [cursor=pointer]:
              - /url: /post/p15
              - paragraph [ref=f1e680]: 测评了一下最新款的VR相机，画质提升太明显了！4K 360度拍摄，细节保留得非常好，推荐给所有VR创作者 📷✨
              - generic [ref=f1e681]:
                - generic [ref=f1e682]: 李四
                - generic [ref=f1e683]: 4 赞
                - generic [ref=f1e684]: 6 评论
            - link "今天成功登顶了哈巴雪山！5396米的海拔，用VR记录下了从大本营到登顶的全过程，太不容易了 🏔️💪 赵六 4 赞 5 评论" [ref=f1e685] [cursor=pointer]:
              - /url: /post/p7
              - paragraph [ref=f1e686]: 今天成功登顶了哈巴雪山！5396米的海拔，用VR记录下了从大本营到登顶的全过程，太不容易了 🏔️💪
              - generic [ref=f1e687]:
                - generic [ref=f1e688]: 赵六
                - generic [ref=f1e689]: 4 赞
                - generic [ref=f1e690]: 5 评论
            - link "稻城亚丁的秋天简直就是上帝打翻的调色盘！三神山在云雾中若隐若现，用VR360记录下了这绝美的一刻 🎨🏔️ 王五 4 赞 4 评论" [ref=f1e691] [cursor=pointer]:
              - /url: /post/p17
              - paragraph [ref=f1e692]: 稻城亚丁的秋天简直就是上帝打翻的调色盘！三神山在云雾中若隐若现，用VR360记录下了这绝美的一刻 🎨🏔️
              - generic [ref=f1e693]:
                - generic [ref=f1e694]: 王五
                - generic [ref=f1e695]: 4 赞
                - generic [ref=f1e696]: 4 评论
        - generic [ref=f1e697]:
          - separator [ref=f1e698]
          - paragraph [ref=f1e699]: 徐霞客系统 © 2026
          - paragraph [ref=f1e700]: 用VR记录旅程，让世界触手可及
  - region "Notifications alt+T"
  - alert [ref=f1e701]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { loginAsUser, loginAsAdmin, loginAsModerator, logout } from './auth.helper';
  3   | 
  4   | test.describe('视觉快照对比', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   test('登录页快照', async ({ page }) => {
  8   |     await page.goto('/login');
  9   |     await page.waitForTimeout(1000);
  10  |     await expect(page).toHaveScreenshot('login-page.png', { fullPage: true, maxDiffPixels: 5000 });
  11  |   });
  12  | 
  13  |   test('注册页快照', async ({ page }) => {
  14  |     await page.goto('/register');
  15  |     await page.waitForTimeout(1000);
  16  |     await expect(page).toHaveScreenshot('register-page.png', { fullPage: true, maxDiffPixels: 5000 });
  17  |   });
  18  | 
  19  |   test('信息流页快照 (已登录)', async ({ page }) => {
  20  |     await loginAsUser(page);
  21  |     await page.goto('/feed');
  22  |     await page.waitForTimeout(2000);
> 23  |     await expect(page).toHaveScreenshot('feed-page.png', { fullPage: true, maxDiffPixels: 5000 });
      |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  24  |   });
  25  | 
  26  |   test('探索页快照', async ({ page }) => {
  27  |     await loginAsUser(page);
  28  |     await page.goto('/discover');
  29  |     await page.waitForTimeout(2000);
  30  |     await expect(page).toHaveScreenshot('discover-page.png', { fullPage: true, maxDiffPixels: 5000 });
  31  |   });
  32  | 
  33  |   test('发帖页快照', async ({ page }) => {
  34  |     await loginAsUser(page);
  35  |     await page.goto('/upload');
  36  |     await page.waitForTimeout(2000);
  37  |     await expect(page).toHaveScreenshot('upload-page.png', { fullPage: true, maxDiffPixels: 5000 });
  38  |   });
  39  | 
  40  |   test('管理仪表板快照 (管理员)', async ({ page }) => {
  41  |     await logout(page);
  42  |     await loginAsAdmin(page);
  43  |     await page.goto('/admin/dashboard');
  44  |     await page.waitForTimeout(2000);
  45  |     await expect(page).toHaveScreenshot('admin-dashboard.png', { fullPage: true, maxDiffPixels: 5000 });
  46  |   });
  47  | 
  48  |   test('审核队列快照 (审核员)', async ({ page }) => {
  49  |     await logout(page);
  50  |     await loginAsModerator(page);
  51  |     await page.goto('/admin/reviews');
  52  |     await page.waitForTimeout(2000);
  53  |     await expect(page).toHaveScreenshot('admin-reviews.png', { fullPage: true, maxDiffPixels: 5000 });
  54  |   });
  55  | 
  56  |   test('用户管理页快照 (管理员)', async ({ page }) => {
  57  |     await logout(page);
  58  |     await loginAsAdmin(page);
  59  |     await page.goto('/admin/users');
  60  |     await page.waitForTimeout(2000);
  61  |     await expect(page).toHaveScreenshot('admin-users.png', { fullPage: true, maxDiffPixels: 5000 });
  62  |   });
  63  | 
  64  |   test('通知中心快照', async ({ page }) => {
  65  |     await loginAsUser(page);
  66  |     await page.goto('/notifications');
  67  |     await page.waitForTimeout(2000);
  68  |     await expect(page).toHaveScreenshot('notifications-page.png', { fullPage: true, maxDiffPixels: 5000 });
  69  |   });
  70  | 
  71  |   test('个人设置快照', async ({ page }) => {
  72  |     await loginAsUser(page);
  73  |     await page.goto('/settings');
  74  |     await page.waitForTimeout(2000);
  75  |     await expect(page).toHaveScreenshot('settings-page.png', { fullPage: true, maxDiffPixels: 5000 });
  76  |   });
  77  | 
  78  |   test('话题页快照', async ({ page }) => {
  79  |     await loginAsUser(page);
  80  |     await page.goto('/topics');
  81  |     await page.waitForTimeout(2000);
  82  |     await expect(page).toHaveScreenshot('topics-page.png', { fullPage: true, maxDiffPixels: 5000 });
  83  |   });
  84  | 
  85  |   test('内容分类页快照', async ({ page }) => {
  86  |     await loginAsUser(page);
  87  |     await page.goto('/classified');
  88  |     await page.waitForTimeout(2000);
  89  |     await expect(page).toHaveScreenshot('classified-page.png', { fullPage: true, maxDiffPixels: 5000 });
  90  |   });
  91  | 
  92  |   test('日记页快照', async ({ page }) => {
  93  |     await loginAsUser(page);
  94  |     await page.goto('/diaries');
  95  |     await page.waitForTimeout(2000);
  96  |     await expect(page).toHaveScreenshot('diaries-page.png', { fullPage: true, maxDiffPixels: 5000 });
  97  |   });
  98  | 
  99  |   test('游记页快照', async ({ page }) => {
  100 |     await loginAsUser(page);
  101 |     await page.goto('/journeys');
  102 |     await page.waitForTimeout(2000);
  103 |     await expect(page).toHaveScreenshot('journeys-page.png', { fullPage: true, maxDiffPixels: 5000 });
  104 |   });
  105 | });
  106 | 
```