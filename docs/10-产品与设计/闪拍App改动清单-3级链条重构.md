# 闪拍 App Android 端改动清单

> 对应社区后端 V1.2 重构：内容链条简化为3级（闪拍→日记→游记），支持文字备注(textNote)

## 改动概述

社区后端已做以下调整，App 端需要同步修改以适配：

1. **内容链条从4级简化为3级**：闪拍(SNAPSHOT) → 日记(DIARY) → 游记(TRAVELOGUE)，去掉了日志(LOG)层
2. **同步接口支持文字备注**：Moment 新增 `textNote` 字段，App 可上传手动输入的文字
3. **支持纯文字闪拍**：没有照片/视频的纯文字记录也能同步到社区

---

## 改动1：SyncMoment 模型增加 textNote 字段

**文件**：`CommunityBackendClient.kt` 或数据模型所在文件

**当前**：
```kotlin
data class SyncMoment(
    val id: String,
    val capturedAt: Long,
    val mediaType: String,          // "PHOTO" 或 "VIDEO"
    val photoPath: String?,
    val videoPath: String?,
    val thumbnailPath: String?,
    val durationMs: Long?,
    val activityCategoryId: String?,
    val categorySource: String?,
    val categoryLocked: Boolean,
    val source: String?,
    val gpsLat: Double?,
    val gpsLng: Double?,
    val locationName: String?,
    val weather: String?,
    val keywords: List<String>?,
    val mood: String?,
    val scene: String?,
    val tripId: String?,
    val tripTitle: String?
)
```

**改为**（加1个字段）：
```kotlin
data class SyncMoment(
    val id: String,
    val capturedAt: Long,
    val mediaType: String,          // "PHOTO" 或 "VIDEO" 或 "TEXT"
    val photoPath: String?,
    val videoPath: String?,
    val thumbnailPath: String?,
    val durationMs: Long?,
    val textNote: String?,          // ← 新增：手动输入的文字备注
    val activityCategoryId: String?,
    val categorySource: String?,
    val categoryLocked: Boolean,
    val source: String?,
    val gpsLat: Double?,
    val gpsLng: Double?,
    val locationName: String?,
    val weather: String?,
    val keywords: List<String>?,
    val mood: String?,
    val scene: String?,
    val tripId: String?,
    val tripTitle: String?
)
```

---

## 改动2：同步 JSON 序列化

**文件**：`CommunityBackendClient.kt`（同步请求体构建处）

同步请求体的 `moments` 数组中每个元素需要包含 `textNote`：

```json
{
  "moments": [
    {
      "id": "moment-001",
      "capturedAt": 1690435500000,
      "mediaType": "PHOTO",
      "photoPath": "/uploads/images/xxx.jpg",
      "videoPath": null,
      "thumbnailPath": "/uploads/images/xxx_thumb.jpg",
      "durationMs": null,
      "textNote": "在漓江边站了十五个小时等光",   ← 新增
      "gpsLat": 24.78,
      "gpsLng": 110.49,
      "locationName": "桂林阳朔",
      "weather": "晴",
      ...
    }
  ]
}
```

如果使用 Gson 序列化，只需在 data class 中加上 `textNote` 字段即可自动序列化。
如果手动构建 JSON，需要加上：
```kotlin
jsonObject.put("textNote", moment.textNote)  // 可为 null
```

---

## 改动3：textNote 数据来源（UI + 存储）

### 3.1 拍摄票据增加 textNote

**文件**：SharedPreferences 票据 JSON

当前票据 JSON 没有 textNote 字段。需要在拍照/录像后增加一个可选的文字输入步骤：

```json
{
  "id": "a1b2c3d4-...",
  "capturedAt": 1690435500000,
  "mediaType": "PHOTO",
  "photoPath": "/storage/.../Noah/Photos/xxx.jpg",
  "textNote": null,               ← 新增
  ...
}
```

### 3.2 SQLite 数据库增加列

**文件**：`noah_travel.db` → `travel_moments` 表

```sql
ALTER TABLE travel_moments ADD COLUMN text_note TEXT DEFAULT NULL;
```

在 `DatabaseHelper` 的 `onUpgrade` 中增加此迁移。

### 3.3 拍照/录像后增加文字输入 UI（可选）

在拍照/录像完成的确认页面，增加一个可选的"写备注"输入框：

```
┌──────────────────────────┐
│  [照片预览]               │
│                          │
│  ┌────────────────────┐  │
│  │ 写个备注...（可选） │  │  ← EditText, hint="写个备注..."
│  └────────────────────┘  │
│                          │
│  [保存]  [同步到社区]     │
└──────────────────────────┘
```

这个改动是 **可选的**（P2优先级）。如果不做 UI，`textNote` 始终为 null，后端也能正常工作（用语音感悟的 recognizedText 兜底）。

---

## 改动4：支持纯文字记录（TEXT mediaType）

当前 App 只能通过拍照/录像产生 moment。如果某天没拍照但有文字想记录，App 无法同步。

### 方案：增加"纯文字记录"入口

在主界面增加一个"写文字"按钮：
- mediaType = "TEXT"
- photoPath = null
- videoPath = null
- textNote = 用户输入的文字

这个改动是 **可选的**（P2优先级）。如果不做，纯文字闪拍只能从语音感悟产生。

---

## 改动5：同步时 textNote 和 recognizedText 的优先级

后端已处理优先级逻辑：
```
SNAPSHOT.content = [textNote, recognizedText].filter(Boolean).join('\n')
```

即：
- 如果只有 textNote → content = textNote
- 如果只有 recognizedText → content = recognizedText
- 如果两者都有 → content = "textNote\nrecognizedText"（拼接）
- 如果两者都没有 → content = null

**App 端无需额外处理**，只需确保 textNote 字段正确上传即可。

---

## 改动6：同步请求中 logIds → snapIds（如果有相关代码）

如果 App 端有调用游记生成接口的代码（`POST /posts/travelogue/generate`），需要将参数名从 `logIds` 改为 `snapIds`。

**当前**（如果有）：
```kotlin
val body = mapOf(
    "logIds" to listOf(momentId1, momentId2),
    "diaryIds" to listOf(diaryId1)
)
```

**改为**：
```kotlin
val body = mapOf(
    "snapIds" to listOf(momentId1, momentId2),
    "diaryIds" to listOf(diaryId1)
)
```

> 注意：后端已做兼容，传 `logIds` 也能工作，但建议改为 `snapIds` 以保持一致。

---

## 改动优先级汇总

| 优先级 | 改动 | 工作量 | 必要性 |
|---|---|---|---|
| **P0** | SyncMoment 加 textNote 字段 + JSON 序列化 | 小 | 必须（后端已支持） |
| **P1** | SQLite 加 text_note 列 + 数据库迁移 | 小 | 必须（持久化） |
| **P1** | 同步时传递 textNote | 小 | 必须（数据流通） |
| **P2** | 拍照后增加"写备注"UI | 中 | 可选（无UI则textNote始终null） |
| **P2** | 增加"纯文字记录"入口 | 中 | 可选（纯文字可从语音感悟产生） |
| **P2** | logIds → snapIds 参数名修改 | 小 | 可选（后端兼容） |

---

## 后端已完成的变更（无需 App 端操作）

以下变更已在社区后端完成，App 端无需额外操作：

1. ✅ `sync.service.ts`：支持 `textNote` 字段，优先级 textNote > recognizedText
2. ✅ `sync.service.ts`：支持纯文字闪拍（无 photoPath/videoPath 也创建 SNAPSHOT）
3. ✅ `sync.service.ts`：vr_metadata 增加 `hasTextNote` 和 `mediaType: "TEXT"` 标记
4. ✅ `ai.service.ts`：游记生成器从 `logIds` 改为 `snapIds`（兼容旧参数）
5. ✅ `posts.controller.ts`：API 参数从 `logIds` 改为 `snapIds`
6. ✅ 种子数据：LOG → SNAPSHOT，旧 LOG 数据已删除
7. ✅ 设计文档：《内容生成逻辑链条》V1.2 已更新
