-- MySQL dump 10.13  Distrib 8.4.10, for Win64 (x86_64)
--
-- Host: localhost    Database: xuxiake
-- ------------------------------------------------------
-- Server version	8.4.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audio_playlist_items`
--

DROP TABLE IF EXISTS `audio_playlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_playlist_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `playlist_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_api_unique` (`playlist_id`,`post_id`),
  KEY `fk_api_post` (`post_id`),
  CONSTRAINT `fk_api_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `audio_playlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_api_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_playlist_items`
--

LOCK TABLES `audio_playlist_items` WRITE;
/*!40000 ALTER TABLE `audio_playlist_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `audio_playlist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audio_playlists`
--

DROP TABLE IF EXISTS `audio_playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_playlists` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `track_count` int NOT NULL DEFAULT '0',
  `total_duration` int NOT NULL DEFAULT '0' COMMENT '总时长(秒)',
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ap_user` (`user_id`),
  CONSTRAINT `fk_ap_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_playlists`
--

LOCK TABLES `audio_playlists` WRITE;
/*!40000 ALTER TABLE `audio_playlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `audio_playlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_posts`
--

DROP TABLE IF EXISTS `collection_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collection_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cp_unique` (`collection_id`,`post_id`),
  KEY `idx_cp_collection` (`collection_id`),
  KEY `idx_cp_post` (`post_id`),
  CONSTRAINT `fk_cp_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_posts`
--

LOCK TABLES `collection_posts` WRITE;
/*!40000 ALTER TABLE `collection_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建者ID',
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合集名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '合集描述',
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '合集封面图',
  `is_public` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否公开',
  `post_count` int NOT NULL DEFAULT '0' COMMENT '收录帖子数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_collection_creator` (`creator_id`),
  KEY `idx_collection_public` (`is_public`,`post_count` DESC),
  CONSTRAINT `fk_collection_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
INSERT INTO `collections` VALUES ('col1','u1','我的VR旅行精华','精心挑选的VR旅行内容，每一篇都值得反复观看','https://picsum.photos/seed/col-vr/800/400',1,5,'2026-08-04 12:00:35',NULL),('col10','u7','建筑摄影灵感','世界各地的建筑美学','https://picsum.photos/seed/col-arch/800/400',0,2,'2026-08-04 12:00:35',NULL),('col2','u1','云南旅行全攻略','云南旅行的所有攻略、路线、美食合集','https://picsum.photos/seed/col-yunnan/800/400',1,4,'2026-08-04 12:00:35',NULL),('col3','u1','拍摄灵感库','看到好的VR作品就收藏起来，学习借鉴','https://picsum.photos/seed/col-inspire/800/400',0,3,'2026-08-04 12:00:35',NULL),('col4','u2','摄影装备清单','想买的各种VR拍摄设备和配件','https://picsum.photos/seed/col-gear/800/400',1,3,'2026-08-04 12:00:35',NULL),('col5','u2','绝美风景打卡地','收藏的风景绝美目的地，一定要去！','https://picsum.photos/seed/col-scenic/800/400',1,4,'2026-08-04 12:00:35',NULL),('col6','u3','科技评测合集','VR设备和旅行科技的评测文章','https://picsum.photos/seed/col-tech/800/400',1,3,'2026-08-04 12:00:35',NULL),('col7','u5','户外路线精选','收藏的经典户外徒步和登山路线','https://picsum.photos/seed/col-route/800/400',1,4,'2026-08-04 12:00:35',NULL),('col8','u6','美食地图','各地美食探店记录，吃货必备','https://picsum.photos/seed/col-food/800/400',1,5,'2026-08-04 12:00:35',NULL),('col9','u4','环球旅行计划','想去的国家和城市清单','https://picsum.photos/seed/col-global/800/400',1,2,'2026-08-04 12:00:35',NULL);
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post` (`post_id`,`created_at`),
  KEY `idx_comments_parent` (`parent_id`),
  KEY `idx_comments_author` (`author_id`),
  CONSTRAINT `fk_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communities`
--

DROP TABLE IF EXISTS `communities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communities` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联的群聊会话ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '社群名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '社群描述',
  `rules` text COLLATE utf8mb4_unicode_ci COMMENT '社群规则',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '社群头像',
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '社群封面图URL',
  `creator_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建者ID',
  `member_count` int NOT NULL DEFAULT '0' COMMENT '成员数量',
  `max_members` int NOT NULL DEFAULT '500' COMMENT '最大成员数',
  `is_public` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否公开可见',
  `status` enum('ACTIVE','DISSOLVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '社群分类',
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '社群地理位置',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_community_conv` (`conversation_id`),
  KEY `idx_community_creator` (`creator_id`),
  KEY `idx_community_public` (`is_public`,`status`),
  CONSTRAINT `fk_community_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communities`
--

LOCK TABLES `communities` WRITE;
/*!40000 ALTER TABLE `communities` DISABLE KEYS */;
INSERT INTO `communities` VALUES ('com1','conv3','VR旅行社区','用VR镜头丈量世界，分享第一视角的旅行见闻、拍摄技巧与设备测评。','1. 作品请标注拍摄设备与地点\n2. 友善交流，互相尊重\n3. 每周五为 VR 作品分享日','https://api.dicebear.com/9.x/identicon/svg?seed=com1','https://picsum.photos/seed/com-vr-cover/1600/600','u1',6,500,1,'ACTIVE','TRAVEL','北京','2026-08-04 12:00:34',NULL),('com2','conv6','户外探险社区','一起征服山河湖海：徒步、登山、露营、潜水，安全第一。','1. 户外安全第一，禁止单独冒险\n2. 出行前检查装备清单\n3. 尊重自然，不留垃圾','https://api.dicebear.com/9.x/identicon/svg?seed=com2','https://picsum.photos/seed/com-outdoor-cover/1600/600','u5',5,500,1,'ACTIVE','OUTDOOR','云南','2026-08-04 12:00:34',NULL),('com3','conv8','美食社区','用味蕾丈量世界，记录每一次探店打卡与美食之旅。','1. 发帖请附店名+地址+人均消费\n2. 每帖推荐至少 2 道菜\n3. 必须为亲身探店经历','https://api.dicebear.com/9.x/identicon/svg?seed=com3','https://picsum.photos/seed/com-food-cover/1600/600','u6',5,500,1,'ACTIVE','FOOD','长沙','2026-08-04 12:00:34',NULL);
/*!40000 ALTER TABLE `communities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_announcements`
--

DROP TABLE IF EXISTS `community_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_announcements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '社群ID',
  `author_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发布者ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告标题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告内容',
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_community` (`community_id`),
  KEY `fk_announcements_author` (`author_id`),
  CONSTRAINT `fk_announcements_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_announcements_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群公告';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_announcements`
--

LOCK TABLES `community_announcements` WRITE;
/*!40000 ALTER TABLE `community_announcements` DISABLE KEYS */;
INSERT INTO `community_announcements` VALUES ('ca1','com1','u1','欢迎加入VR旅行爱好者群！','大家好！这里是VR旅行爱好者的家。欢迎分享你的VR作品、拍摄技巧和旅行故事。\n\n📌 群规：\n1. 作品请标注拍摄设备和地点\n2. 互相尊重，友善交流\n3. 每周五是\"VR作品分享日\"',1,'2026-08-04 12:00:35','2026-08-04 12:00:35'),('ca2','com1','u1','7月VR拍摄活动：黄山云海','本月活动：7月25-27日黄山VR拍摄之旅！\n\n行程安排：\n- Day1: 前山上山，拍迎客松VR\n- Day2: 光明顶看日出，拍云海全景\n- Day3: 后山下山，翡翠谷\n\n费用：约800元/人（含住宿索道）\n报名请联系群主，名额有限！',1,'2026-08-04 12:00:35','2026-08-04 12:00:35'),('ca3','com1','u2','新设备推荐：Insta360 X4','最近入手了Insta360 X4，8K画质真的很能打！\n\n优点：\n- 8K30fps VR360拍摄\n- 防水10米\n- AI智能剪辑\n\n有兴趣的可以一起团购，有优惠～',0,'2026-08-04 12:00:35','2026-08-04 12:00:35'),('ca4','com2','u5','安全第一！户外探险注意事项','各位队员，户外探险安全最重要！\n\n⚠️ 必带装备：\n1. 急救包\n2. 头灯+备用电池\n3. 充足饮水（每人至少2L）\n4. 雨衣\n5. 哨子\n\n🚫 禁止：\n- 单独行动\n- 未报备更改路线\n- 恶劣天气强行出发',1,'2026-08-04 12:00:35','2026-08-04 12:00:35'),('ca5','com2','u5','8月计划：虎跳峡徒步','8月中旬计划去虎跳峡高路徒步，2天1夜。\n\n路线：桥头→28道拐→Tina\'s→中虎跳\n难度：中等偏上\n费用：约500元/人\n\n感兴趣的回复报名，需要有一定徒步经验！',1,'2026-08-04 12:00:35','2026-08-04 12:00:35'),('ca6','com3','u6','美食探店打卡规则','欢迎吃货们！本群探店打卡规则：\n\n📸 分享格式：\n- 店名+地址\n- 推荐菜品（至少2道）\n- 人均消费\n- VR/照片至少1张\n\n🏷️ 标签格式：#城市美食 #菜系\n每月评选\"最佳探店达人\"🏆',1,'2026-08-04 12:00:35','2026-08-04 12:00:35');
/*!40000 ALTER TABLE `community_announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_challenge_entries`
--

DROP TABLE IF EXISTS `community_challenge_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_challenge_entries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `challenge_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '挑战ID',
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '参与者ID',
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联帖子ID',
  `note` text COLLATE utf8mb4_unicode_ci COMMENT '参与说明',
  `score` int DEFAULT '0' COMMENT '得分/积分',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_challenge_user` (`challenge_id`,`user_id`),
  KEY `idx_entries_challenge` (`challenge_id`),
  KEY `idx_entries_user` (`user_id`),
  KEY `fk_entries_post` (`post_id`),
  CONSTRAINT `fk_entries_challenge` FOREIGN KEY (`challenge_id`) REFERENCES `community_challenges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entries_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_entries_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群挑战参与记录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_challenge_entries`
--

LOCK TABLES `community_challenge_entries` WRITE;
/*!40000 ALTER TABLE `community_challenge_entries` DISABLE KEYS */;
INSERT INTO `community_challenge_entries` VALUES ('ce1','ch1','u1',NULL,'黄山云海VR全景，光明顶日出时分拍摄',95,'2026-08-04 12:00:35'),('ce10','ch4','u5',NULL,'黄山✅ 泰山✅ 华山✅ 已打卡3座',0,'2026-08-04 12:00:35'),('ce11','ch4','u1',NULL,'黄山✅ 庐山✅ 武夷山✅ 继续冲',0,'2026-08-04 12:00:35'),('ce12','ch4','u9',NULL,'泰山✅ 嵩山✅ 历史名山必须打卡',0,'2026-08-04 12:00:35'),('ce13','ch5','u6',NULL,'东京美食攻略，10家餐厅全覆盖',92,'2026-08-04 12:00:35'),('ce14','ch5','u1',NULL,'成都宽窄巷子火锅，古色古香的环境',88,'2026-08-04 12:00:35'),('ce15','ch5','u3',NULL,'广州早茶推荐，陶陶居必去',0,'2026-08-04 12:00:35'),('ce2','ch1','u2',NULL,'张家界天门山VR180立体视频，走在玻璃栈道上',90,'2026-08-04 12:00:35'),('ce3','ch1','u3',NULL,'桂林漓江空间视频，竹筏上的喀斯特地貌',88,'2026-08-04 12:00:35'),('ce4','ch1','u4',NULL,'计划拍摄九寨沟VR，敬请期待',0,'2026-08-04 12:00:35'),('ce5','ch1','u8',NULL,'准备拍三亚海底VR，水下360全景',0,'2026-08-04 12:00:35'),('ce6','ch3','u5',NULL,'黄山徒步12.5km，累计爬升1200m',85,'2026-08-04 12:00:35'),('ce7','ch3','u1',NULL,'跟着赵六哥一起走的，累但值得！',80,'2026-08-04 12:00:35'),('ce8','ch3','u8',NULL,'已完成35km，继续加油',0,'2026-08-04 12:00:35'),('ce9','ch3','u10',NULL,'滑雪场训练也算运动量吧哈哈',0,'2026-08-04 12:00:35');
/*!40000 ALTER TABLE `community_challenge_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_challenges`
--

DROP TABLE IF EXISTS `community_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_challenges` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '社群ID',
  `creator_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建者ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '挑战标题',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '挑战描述',
  `type` enum('PHOTO','ROUTE','CHECKIN','DISTANCE') COLLATE utf8mb4_unicode_ci DEFAULT 'PHOTO' COMMENT '挑战类型',
  `start_date` timestamp NOT NULL COMMENT '开始时间',
  `end_date` timestamp NOT NULL COMMENT '结束时间',
  `max_participants` int DEFAULT '0' COMMENT '最大参与人数，0表示不限',
  `participant_count` int DEFAULT '0' COMMENT '当前参与人数',
  `status` enum('UPCOMING','ACTIVE','ENDED') COLLATE utf8mb4_unicode_ci DEFAULT 'UPCOMING' COMMENT '挑战状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_challenges_community` (`community_id`),
  KEY `idx_challenges_status` (`status`),
  KEY `fk_challenges_creator` (`creator_id`),
  CONSTRAINT `fk_challenges_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_challenges_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群挑战活动';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_challenges`
--

LOCK TABLES `community_challenges` WRITE;
/*!40000 ALTER TABLE `community_challenges` DISABLE KEYS */;
INSERT INTO `community_challenges` VALUES ('ch1','com1','u1','夏日VR摄影大赛','用VR设备记录你眼中的夏天！可以是海边、山间、城市，任何你觉得美的地方。\n\n🏆 奖品：\n- 一等奖：Insta360自拍杆\n- 二等奖：VR清洁套装\n- 三等奖：定制手机壳\n\n📏 要求：VR360或空间视频，标注地点','PHOTO','2026-06-30 16:00:00','2026-07-31 15:59:59',50,12,'ACTIVE','2026-08-04 12:00:35','2026-08-04 12:00:35'),('ch2','com1','u2','VR设备开箱挑战','新买了VR设备？拍一段开箱视频分享给大家！展示你的新装备和第一视角体验。','PHOTO','2026-07-31 16:00:00','2026-08-15 15:59:59',30,0,'UPCOMING','2026-08-04 12:00:35','2026-08-04 12:00:35'),('ch3','com2','u5','百公里徒步挑战','一个月内累计徒步100公里！用APP记录轨迹，截图打卡。\n\n🏆 完成奖励：\n- 完成100km：户外探险队徽章\n- 前三名：专业登山杖\n\n每周末可以组队刷公里数！','DISTANCE','2026-06-30 16:00:00','2026-07-31 15:59:59',100,23,'ACTIVE','2026-08-04 12:00:35','2026-08-04 12:00:35'),('ch4','com2','u8','打卡十大名山','挑战打卡中国十大名山！拍下你征服的每一座山。\n\n十大名山：泰山、华山、衡山、恒山、嵩山、黄山、庐山、峨眉山、五台山、武夷山\n\n完成5座以上有神秘奖品！','CHECKIN','2026-07-14 16:00:00','2026-12-31 15:59:59',200,8,'ACTIVE','2026-08-04 12:00:35','2026-08-04 12:00:35'),('ch5','com3','u6','城市美食探店接力','每个城市推荐一家必吃店！用VR拍下店内环境和美食，写100字以上点评。\n\n规则：\n- 每人限推荐3家\n- 不能重复城市\n- 必须是亲身去过的\n\n点赞最多的前10名获得\"美食达人\"称号！','PHOTO','2026-07-09 16:00:00','2026-08-10 15:59:59',80,15,'ACTIVE','2026-08-04 12:00:35','2026-08-04 12:00:35'),('ch6','com3','u3','早餐打卡30天','连续30天打卡早餐！每天拍一张早餐照片+简单介绍。\n\n坚持30天的勇士将获得：\n- \"早起鸟儿\"徽章\n- 美食群专属头衔\n- 美食优惠券礼包','CHECKIN','2026-07-19 16:00:00','2026-08-18 15:59:59',50,0,'UPCOMING','2026-08-04 12:00:35','2026-08-04 12:00:35');
/*!40000 ALTER TABLE `community_challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_roles`
--

DROP TABLE IF EXISTS `community_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '社群ID',
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `role` enum('ADMIN','MODERATOR') COLLATE utf8mb4_unicode_ci DEFAULT 'ADMIN' COMMENT '角色类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_community_user` (`community_id`,`user_id`),
  KEY `idx_roles_community` (`community_id`),
  KEY `idx_roles_user` (`user_id`),
  CONSTRAINT `fk_roles_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群角色';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_roles`
--

LOCK TABLES `community_roles` WRITE;
/*!40000 ALTER TABLE `community_roles` DISABLE KEYS */;
INSERT INTO `community_roles` VALUES ('cr1','com1','u1','ADMIN','2026-08-04 12:00:35'),('cr2','com1','u2','MODERATOR','2026-08-04 12:00:35'),('cr3','com2','u5','ADMIN','2026-08-04 12:00:35'),('cr4','com2','u8','MODERATOR','2026-08-04 12:00:35'),('cr5','com3','u6','ADMIN','2026-08-04 12:00:35'),('cr6','com3','u3','MODERATOR','2026-08-04 12:00:35');
/*!40000 ALTER TABLE `community_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_tags`
--

DROP TABLE IF EXISTS `community_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_tags` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_community_tag_unique` (`community_id`,`tag_id`),
  KEY `idx_ct_community` (`community_id`),
  KEY `idx_ct_tag` (`tag_id`),
  CONSTRAINT `fk_ct_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ct_tag` FOREIGN KEY (`tag_id`) REFERENCES `interest_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_tags`
--

LOCK TABLES `community_tags` WRITE;
/*!40000 ALTER TABLE `community_tags` DISABLE KEYS */;
INSERT INTO `community_tags` VALUES ('ct1','com1','tag-009','2026-08-04 12:00:34'),('ct2','com1','tag-010','2026-08-04 12:00:34'),('ct3','com1','tag-011','2026-08-04 12:00:34'),('ct4','com2','tag-015','2026-08-04 12:00:34'),('ct5','com2','tag-007','2026-08-04 12:00:34'),('ct6','com2','tag-018','2026-08-04 12:00:34'),('ct7','com3','tag-021','2026-08-04 12:00:34'),('ct8','com3','tag-003','2026-08-04 12:00:34');
/*!40000 ALTER TABLE `community_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content_reviews`
--

DROP TABLE IF EXISTS `content_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_reviews` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','FLAGGED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `risk_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '敏感词/违规图片/隐私信息/其他',
  `risk_detail` text COLLATE utf8mb4_unicode_ci,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_review_status` (`status`),
  KEY `idx_review_post` (`post_id`),
  KEY `fk_review_reviewer` (`reviewer_id`),
  CONSTRAINT `fk_review_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_reviews`
--

LOCK TABLES `content_reviews` WRITE;
/*!40000 ALTER TABLE `content_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `content_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('NORMAL','REQUEST','HIDDEN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `last_read_at` timestamp NULL DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cp_unique` (`conversation_id`,`user_id`),
  KEY `idx_cp_user` (`user_id`),
  CONSTRAINT `fk_cp_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES ('cp1','conv1','u1','NORMAL',NULL,'2026-06-23 02:30:00'),('cp10','conv4','u5','NORMAL',NULL,'2026-06-20 00:00:00'),('cp11','conv5','u1','NORMAL',NULL,'2026-06-18 02:00:00'),('cp12','conv5','u6','NORMAL','2026-08-27 10:27:06','2026-06-18 02:00:00'),('cp13','conv6','u1','NORMAL',NULL,'2026-06-15 04:00:00'),('cp14','conv6','u5','NORMAL',NULL,'2026-06-15 04:00:00'),('cp15','conv6','u8','NORMAL',NULL,'2026-06-15 04:00:00'),('cp16','conv6','u10','NORMAL',NULL,'2026-06-15 04:00:00'),('cp17','conv7','u1','NORMAL',NULL,'2026-06-12 06:00:00'),('cp18','conv7','u9','NORMAL',NULL,'2026-06-12 06:00:00'),('cp19','conv8','u1','NORMAL',NULL,'2026-06-10 10:00:00'),('cp2','conv1','u2','NORMAL',NULL,'2026-06-23 02:30:00'),('cp20','conv8','u6','NORMAL','2026-08-27 10:27:04','2026-06-10 10:00:00'),('cp21','conv8','u4','NORMAL',NULL,'2026-06-10 10:00:00'),('cp22','conv8','u9','NORMAL',NULL,'2026-06-10 10:00:00'),('cp23','conv3','u7','NORMAL',NULL,'2026-06-24 02:00:00'),('cp24','conv3','u10','NORMAL',NULL,'2026-06-24 02:00:00'),('cp25','conv6','u4','NORMAL',NULL,'2026-06-16 01:00:00'),('cp26','conv8','u3','NORMAL',NULL,'2026-06-11 02:00:00'),('cp3','conv2','u1','NORMAL',NULL,'2026-06-22 07:00:00'),('cp4','conv2','u3','NORMAL',NULL,'2026-06-22 07:00:00'),('cp5','conv3','u1','NORMAL',NULL,'2026-06-21 12:00:00'),('cp6','conv3','u2','NORMAL',NULL,'2026-06-21 12:00:00'),('cp7','conv3','u3','NORMAL',NULL,'2026-06-21 12:00:00'),('cp8','conv3','u4','NORMAL',NULL,'2026-06-21 12:00:00'),('cp9','conv4','u1','NORMAL',NULL,'2026-06-20 00:00:00');
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('DIRECT','GROUP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_disappearing` tinyint(1) NOT NULL DEFAULT '0',
  `disappear_seconds` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_conv_updated` (`updated_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('conv1','DIRECT',NULL,'2026-06-23 02:30:00','2026-06-23 02:30:00',0,0),('conv2','DIRECT',NULL,'2026-06-22 07:00:00','2026-06-22 07:00:00',0,0),('conv3','GROUP','VR旅行爱好者群','2026-06-21 12:00:00','2026-06-21 12:00:00',0,0),('conv4','DIRECT',NULL,'2026-06-20 00:00:00','2026-06-20 00:00:00',0,0),('conv5','DIRECT',NULL,'2026-06-18 02:00:00','2026-06-18 02:00:00',0,0),('conv6','GROUP','户外探险小队','2026-06-15 04:00:00','2026-06-15 04:00:00',0,0),('conv7','DIRECT',NULL,'2026-06-12 06:00:00','2026-06-12 06:00:00',0,0),('conv8','GROUP','美食探店群','2026-06-10 10:00:00','2026-06-10 10:00:00',0,0);
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guide_details`
--

DROP TABLE IF EXISTS `guide_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guide_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联帖子ID',
  `destination` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '目的地',
  `category` enum('FOOD','STAY','TRANSPORT','TICKET','TIPS') COLLATE utf8mb4_unicode_ci DEFAULT 'TIPS' COMMENT '攻略分类',
  `best_season` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最佳季节',
  `budget_level` enum('BUDGET','MID','LUXURY') COLLATE utf8mb4_unicode_ci DEFAULT 'MID' COMMENT '预算等级',
  `rich_content` longtext COLLATE utf8mb4_unicode_ci COMMENT '富文本/Markdown长内容',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_guide_post` (`post_id`),
  CONSTRAINT `fk_guide_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guide_details`
--

LOCK TABLES `guide_details` WRITE;
/*!40000 ALTER TABLE `guide_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `guide_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hashtags`
--

DROP TABLE IF EXISTS `hashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hashtags` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_hashtag_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hashtags`
--

LOCK TABLES `hashtags` WRITE;
/*!40000 ALTER TABLE `hashtags` DISABLE KEYS */;
/*!40000 ALTER TABLE `hashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interest_tags`
--

DROP TABLE IF EXISTS `interest_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interest_tags` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签分类：TRAVEL/VR/ACTIVITY/CULTURE/OTHER',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签图标',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序权重',
  `is_hot` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否热门标签',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tag_name` (`name`),
  KEY `idx_tag_category` (`category`),
  KEY `idx_tag_hot` (`is_hot`,`sort_order` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interest_tags`
--

LOCK TABLES `interest_tags` WRITE;
/*!40000 ALTER TABLE `interest_tags` DISABLE KEYS */;
INSERT INTO `interest_tags` VALUES ('tag-001','自然风光','TRAVEL','🏔️',100,1,'2026-08-04 12:00:31'),('tag-002','历史古迹','TRAVEL','🏛️',95,1,'2026-08-04 12:00:31'),('tag-003','城市探索','TRAVEL','🌆',90,1,'2026-08-04 12:00:31'),('tag-004','乡村田园','TRAVEL','🌾',85,0,'2026-08-04 12:00:31'),('tag-005','海滨度假','TRAVEL','🏖️',88,1,'2026-08-04 12:00:31'),('tag-006','沙漠探险','TRAVEL','🏜️',70,0,'2026-08-04 12:00:31'),('tag-007','雪山攀登','TRAVEL','🏔️',65,0,'2026-08-04 12:00:31'),('tag-008','古镇漫游','TRAVEL','🏘️',82,1,'2026-08-04 12:00:31'),('tag-009','VR全景拍摄','VR','📷',98,1,'2026-08-04 12:00:31'),('tag-010','360视频','VR','🎬',92,1,'2026-08-04 12:00:31'),('tag-011','空间视频','VR','📹',88,1,'2026-08-04 12:00:31'),('tag-012','VR直播','VR','📡',75,0,'2026-08-04 12:00:31'),('tag-013','VR后期制作','VR','🖥️',72,0,'2026-08-04 12:00:31'),('tag-014','设备评测','VR','🎮',80,1,'2026-08-04 12:00:31'),('tag-015','徒步旅行','ACTIVITY','🥾',86,1,'2026-08-04 12:00:31'),('tag-016','自驾游','ACTIVITY','🚗',84,1,'2026-08-04 12:00:31'),('tag-017','骑行','ACTIVITY','🚴',78,0,'2026-08-04 12:00:31'),('tag-018','露营','ACTIVITY','⛺',82,1,'2026-08-04 12:00:31'),('tag-019','潜水','ACTIVITY','🤿',76,0,'2026-08-04 12:00:31'),('tag-020','摄影','ACTIVITY','📸',90,1,'2026-08-04 12:00:31'),('tag-021','美食探店','CULTURE','🍜',88,1,'2026-08-04 12:00:31'),('tag-022','民俗文化','CULTURE','🎭',74,0,'2026-08-04 12:00:31'),('tag-023','非遗体验','CULTURE','🎨',72,0,'2026-08-04 12:00:31'),('tag-024','博物馆','CULTURE','🏛️',80,1,'2026-08-04 12:00:31'),('tag-025','寺庙祈福','CULTURE','🛕',68,0,'2026-08-04 12:00:31'),('tag-026','旅行攻略','OTHER','📝',85,1,'2026-08-04 12:00:31'),('tag-027','穷游','OTHER','💰',78,0,'2026-08-04 12:00:31'),('tag-028','亲子游','OTHER','👨‍👩‍👧',82,1,'2026-08-04 12:00:31'),('tag-029','独自旅行','OTHER','🧳',76,0,'2026-08-04 12:00:31'),('tag-030','团队出行','OTHER','👥',74,0,'2026-08-04 12:00:31');
/*!40000 ALTER TABLE `interest_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journey_stop_media`
--

DROP TABLE IF EXISTS `journey_stop_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journey_stop_media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stop_id` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stop_media_stop` (`stop_id`),
  CONSTRAINT `fk_stop_media_stop` FOREIGN KEY (`stop_id`) REFERENCES `journey_stops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journey_stop_media`
--

LOCK TABLES `journey_stop_media` WRITE;
/*!40000 ALTER TABLE `journey_stop_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `journey_stop_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journey_stops`
--

DROP TABLE IF EXISTS `journey_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journey_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `journey_id` int NOT NULL COMMENT '所属旅程ID',
  `day_number` int DEFAULT NULL COMMENT '第几天',
  `day_date` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地点名称',
  `location_lat` decimal(10,7) DEFAULT NULL COMMENT '纬度',
  `location_lng` decimal(10,7) DEFAULT NULL COMMENT '经度',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '站点描述',
  `highlights` text COLLATE utf8mb4_unicode_ci,
  `tips` text COLLATE utf8mb4_unicode_ci,
  `media_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '站点照片/视频URL',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stop_journey` (`journey_id`),
  CONSTRAINT `fk_stop_journey` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journey_stops`
--

LOCK TABLES `journey_stops` WRITE;
/*!40000 ALTER TABLE `journey_stops` DISABLE KEYS */;
INSERT INTO `journey_stops` VALUES (42,20,1,'2026-08-02','兴坪古镇',NULL,NULL,'抵达兴坪古镇，安顿设备后沿漓江踩点。傍晚在江边拍摄了第一组日落延时，喀斯特山峰的剪影在夕阳中层层叠叠。','兴坪古镇老街、漓江日落','提前一天到古镇熟悉拍摄点位；镇上住宿价格实惠，推荐江边客栈',NULL,0,'2026-08-14 13:28:33'),(43,20,2,'2026-08-03','漓江边',NULL,NULL,'凌晨4:30到达拍摄点，从日出拍到日落。14组延时序列，记录了漓江光影的完整变化。中午在江边休息，看竹筏和游客来来往往。','漓江日出（5:12）、日落延时、竹筏','日出前20分钟天空最美，不要迟到；中午阳光太硬不适合拍摄',NULL,1,'2026-08-14 13:28:33'),(44,20,3,'2026-08-04','兴坪码头',NULL,NULL,'最后一天补拍了一些细节素材。收拾设备，回望漓江最后一眼。','兴坪码头晨景、渔翁','可以找当地渔翁配合拍摄，需提前沟通',NULL,2,'2026-08-14 13:28:33'),(45,21,1,'2026-08-02','断桥/白堤',NULL,NULL,'上午在断桥拍摄VR180素材，测试暗部细节和HDR表现。从白堤走到雷峰塔，一路走一路拍。','断桥晨景、白堤荷花、雷峰塔远景','上午9点前光线柔和；建议携带三脚架',NULL,0,'2026-08-14 13:28:33'),(46,21,2,'2026-08-03','湖滨路',NULL,NULL,'下午在湖滨路咖啡馆整理素材，对比前三代设备画质。暗部细节提升明显。','西湖湖面倒影、湖滨路咖啡馆','下午光线适合拍倒影；咖啡馆可以充电整理素材',NULL,1,'2026-08-14 13:28:33'),(47,22,1,'2026-07-31','冲古寺',NULL,NULL,'从游客中心步行到冲古寺适应海拔。沿途高山松林空气带着松香，冲古寺正对仙乃日雪山。','冲古寺、仙乃日雪山远景','建议步行而非坐电瓶车，有助于适应海拔',NULL,0,'2026-08-14 13:28:34'),(48,22,2,'2026-08-01','洛绒牛场',NULL,NULL,'从冲古寺到洛绒牛场三公里，沿途开阔草甸和溪流。三座神山轮流出现，看到了藏羚羊和土拨鼠。','洛绒牛场、央迈勇雪山、野生动物','这段是全程精华段，慢慢走多拍照',NULL,1,'2026-08-14 13:28:34'),(49,22,3,'2026-08-02','牛奶海/五色海',NULL,NULL,'最艰难的爬升段，4200米到4700米。每走十步停下来深呼吸。到达牛奶海那一刻，碧蓝色让人说不出话。','牛奶海、五色海、4700米俯瞰','这是魔鬼爬升段，务必控制节奏；午后容易起云，尽量上午到达',NULL,2,'2026-08-14 13:28:34'),(50,23,1,'2026-07-31','哈巴村→大本营',NULL,NULL,'从哈巴村出发徒步到4100米大本营，沿途经过原始森林和高山草甸。','哈巴村、原始森林、大本营星空','骑马或徒步4-5小时到达大本营；当晚早睡，凌晨3点冲顶',NULL,0,'2026-08-14 13:28:34'),(51,23,2,'2026-08-01','哈巴雪山峰顶',NULL,NULL,'凌晨3点出发冲顶，6:48全队登顶5396米。天亮时太阳从云海中升起，雪地变成金色。','云海日出、5396米峰顶、玉龙雪山远景','走十步歇一口的节奏；天亮前后是最美的时刻；不要急着拍照，先用眼睛看',NULL,1,'2026-08-14 13:28:34'),(52,24,1,'2026-07-31','火宫殿/太平街/坡子街',NULL,NULL,'早上从火宫殿开始，臭豆腐外酥里嫩配萝卜干绝了。太平街一路吃小吃，午餐在坡子街吃剁椒鱼头，鲜辣平衡9分。','火宫殿臭豆腐、太平街小吃、坡子街剁椒鱼头','臭豆腐选黑色经典；太平街刮凉粉夏天必吃；剁椒鱼头认准老店',NULL,0,'2026-08-14 13:28:34'),(53,24,2,'2026-08-01','文和友/茶颜悦色',NULL,NULL,'晚餐去了文和友，六层楼复古街景像穿越回八十年代。口味虾是招牌，蒜蓉口味更推荐。配一杯茶颜悦色幽兰拿铁。','文和友口味虾、茶颜悦色幽兰拿铁','文和友排队很恐怖，建议提前1小时去；幽兰拿铁是招牌必点',NULL,1,'2026-08-14 13:28:34'),(54,25,1,'2026-07-29','拙政园',NULL,NULL,'游览3小时，测绘12处观景点。远香堂的借景手法令人惊叹——北寺塔被框在花窗里，但塔在园外一公里。','远香堂借景、北寺塔框景、荷风四面亭','上午9点前入园人最少；雨天反而增加园林意境',NULL,0,'2026-08-14 13:28:34'),(55,25,2,'2026-07-30','留园',NULL,NULL,'游览2小时，重点记录步移景异的动线设计。冠云峰从不同角度看形态完全不同，造园师的巧思令人敬佩。','冠云峰太湖石、步移景异动线、冠云楼','下午去光线更好；留园比拙政园小但细节更精致',NULL,1,'2026-08-14 13:28:34'),(56,26,1,'2026-07-28','情人桥潜点',NULL,NULL,'第一潜下潜到18米，水温27°C，能见度15米。鹿角珊瑚群像水下森林，小丑鱼在枝丫间钻进钻出。','鹿角珊瑚群、小丑鱼、水下光束','情人桥是入门潜点，适合热身；下潜前做好耳压平衡',NULL,0,'2026-08-14 13:28:34'),(57,26,2,'2026-07-29','珊瑚花园潜点',NULL,NULL,'第二潜到22米，遇到了海龟和鳐鱼。海龟从珊瑚礁后游出来，在水中对视了几秒。','海龟、鳐鱼、彩色软珊瑚','珊瑚花园是最佳潜点；注意保护珊瑚不要触碰；红色滤镜矫正水下色差',NULL,1,'2026-08-14 13:28:34'),(58,27,1,'2026-07-27','一号坑/三号坑',NULL,NULL,'一号坑气势恢弘，六千陶俑列队站立。最震撼的是每个俑面部都不一样——千人千面。三号坑是指挥部，有指挥车。','一号坑全景阵列、兵俑面部特写、三号坑指挥车','一号坑最大最震撼，建议先去；VR拍摄建议中长焦拍面部特写',NULL,0,'2026-08-14 13:28:34'),(59,27,2,'2026-07-28','二号坑/文物陈列厅',NULL,NULL,'二号坑最有名的是彩色陶俑，出土后几分钟内氧化褪色。讲解员说宁愿让它们多睡几年。','彩色陶俑遗迹、文物陈列厅','二号坑很多区域暂停挖掘，是保护的克制；陈列厅有近距离展品',NULL,1,'2026-08-14 13:28:34'),(60,28,1,'2026-07-26','亚布力旱雪道',NULL,NULL,'热身两趟后开始正式训练。大回转+小回转组合练习，头盔GoPro拍第一视角VR。','旱雪道高级道、第一视角VR','夏季旱雪道和冬季雪感接近；人少可以反复冲',NULL,0,'2026-08-14 13:28:34'),(61,28,2,'2026-07-27','亚布力高级道',NULL,NULL,'第五趟全速冲击，最高时速72km/h。在这个速度上视野变窄，只剩下雪道和呼吸声。','72km/h全速冲刺、高级道全景','全速冲刺前确保技术过硬；必须佩戴全套护具',NULL,1,'2026-08-14 13:28:34'),(62,29,1,'2026-08-04','阳朔兴坪镇漓江边',NULL,NULL,'凌晨四点半的兴坪镇还沉在墨色的梦里，我独自踩着露水走到漓江边，架好Insta360 X4时，天幕仍缀着几粒疏星。空气里浮着湿热的水汽，江面静得像一块未打磨的玄玉。5点12分，东方的天际线开始有了动静，先是极淡的蟹壳青，随后晨雾如薄纱从江心缓缓升起，喀斯特的山峦剪影在金色光线里一层层显影，像古老的画卷徐徐展开。我按下快门，听见自己和江水一同呼吸。这漓江边的一块礁石成了我的禅座，从蓝调时刻到烈日当空，再到晚霞把群山染成鎏金，我守着取景框里的每一帧变幻，直到19点30分最后一缕暮光隐入山脊。整整十五个小时，三块电池耗尽电量，十四组延时素材安静地躺在储存卡里，像被驯服的光影标本。气温34°C，湿度高得能把衣服拧出水来，可我竟不觉得煎熬——当一个人真正沉浸在等待中，时间便不再是敌人。\n其实真正让我动容的，不是那张完美的日出照片，而是日出前那二十分钟——天空从深蓝渐变为浅紫，再被橘红浸染，整个过程安静得只听得见快门声和水流声。那种美不张扬，却让人眼眶发热。我忽然明白，摄影教会我的从来不是如何构图、如何调参数，而是如何等待。光不会因我着急就提前亮起，云不会因我渴望就停留片刻，万事万物都有自己的节律，我唯一能做的，就是把自己安放在这里，让时间流淌过我的镜头。傍晚收工时整理素材，三千多张照片里可能最终只会留下十张，但这份看似“浪费”的奢侈，却让我感到前所未有的富足。独处的这十五个小时里，我听到江水反复吟唱古老歌谣，看到白鹭从薄雾中掠过，也看见自己的内心从焦躁走向澄明。原来独处不是孤独，而是与自己最温柔的相处。','漓江日出观景位（兴坪镇段），兴坪古镇黄昏漫步','户外拍摄需备足电池和饮用水，注意防暑降温；清晨江边湿滑，建议穿防滑鞋。',NULL,0,'2026-09-09 08:47:22');
/*!40000 ALTER TABLE `journey_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journeys`
--

DROP TABLE IF EXISTS `journeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journeys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联帖子ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '旅程标题',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `destination` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '目的地',
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '旅程封面图',
  `summary` text COLLATE utf8mb4_unicode_ci,
  `transport` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theme` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insight` text COLLATE utf8mb4_unicode_ci,
  `tips` text COLLATE utf8mb4_unicode_ci,
  `stop_count` int NOT NULL DEFAULT '0' COMMENT '站点数量',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_journey_post` (`post_id`),
  CONSTRAINT `fk_journey_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journeys`
--

LOCK TABLES `journeys` WRITE;
/*!40000 ALTER TABLE `journeys` DISABLE KEYS */;
INSERT INTO `journeys` VALUES (20,'0c163d89-97e4-11f1-9bd9-6018957395ba','漓江光影日记：从日出到日落的十二小时','2026-08-02','2026-08-04','阳朔兴坪镇',NULL,'在漓江边等光的人，用三天把桂林的光影装进镜头','自驾','人均2000元','摄影','摄影教会我的不是怎么拍好一张照片，而是怎么等待','建议住在兴坪古镇，步行到江边约15分钟；夏季日出约5:10，需提前到达；带足电池和存储卡',3,'2026-08-14 13:28:33'),(21,'0c1ef16f-97e4-11f1-9bd9-6018957395ba','当千年湖山撞上最新科技：西湖VR拍摄手记','2026-08-02','2026-08-03','杭州西湖',NULL,'用最新VR相机拍最老的风景，六年后的西湖断桥','高铁','人均1500元','摄影','科技一直在进步，但西湖还是那个西湖','断桥上午9点前光线最佳；VR拍摄建议用三脚架保持水平；白堤一侧可拍到雷峰塔远景',2,'2026-08-14 13:28:33'),(22,'0c22ae40-97e4-11f1-9bd9-6018957395ba','稻城亚丁徒步全记录：在4700米与自己对话','2026-07-31','2026-08-02','稻城亚丁',NULL,'身体在地狱，眼睛在天堂——18公里高海拔徒步全记录','自驾','人均3500元','自然','有些画面，镜头装不下','必须提前一天到稻城适应海拔；每人至少2罐氧气瓶；牛奶海最佳拍摄时间上午11点前；高原天气多变，备好冲锋衣',3,'2026-08-14 13:28:33'),(23,'0c25bba6-97e4-11f1-9bd9-6018957395ba','第23次站在哈巴之巅：一座入门雪山的不入门哲学','2026-07-31','2026-08-01','哈巴雪山',NULL,'带三个新手客户登顶5396米，比自己的第一次登顶更骄傲','自驾','人均5000元','冒险','带人看世界，可能比我自己看世界更有意义','必备装备：高山靴、冰爪、冰镐、安全带、头盔、头灯；必须请向导；最佳季节4-6月和9-11月',2,'2026-08-14 13:28:34'),(24,'0c2afb63-97e4-11f1-9bd9-6018957395ba','24小时吃遍长沙：从臭豆腐到剁椒鱼头的火辣之旅','2026-07-31','2026-08-01','长沙',NULL,'一座为吃而生的城市，从早吃到晚的火辣体验','高铁','人均300-400元/天','美食','生活要够味，辣一点没关系','火宫殿→太平街→坡子街→文和友，建议避开节假日；一天预算约300-400元',2,'2026-08-14 13:28:34'),(25,'0c2fec71-97e4-11f1-9bd9-6018957395ba','五百年了，苏州园林依然是沉浸式体验的最好教科书','2026-07-29','2026-07-30','苏州',NULL,'一个建筑师带着VR眼镜逛园林，找到了空间设计的终极答案','高铁','人均1200元','人文','古典园林里，藏着最好的UX设计','拙政园上午9点前入园避开人流；留园下午光线更佳；两园相距3公里可步行+公交；建议请导游或租讲解器',2,'2026-08-14 13:28:34'),(26,'0c367b7e-97e4-11f1-9bd9-6018957395ba','蔚蓝之下：蜈支洲岛潜水日记','2026-07-28','2026-07-29','三亚蜈支洲岛',NULL,'在20米深的海底找到真正的宁静，与海龟对视的瞬间','飞机','人均3000元','自然','放小自己，烦恼就小了','潜水需提前一天预约；初学者可选体验潜水（6-8米）不需潜水证；水下拍摄建议用红色滤镜；最佳季节4-10月',2,'2026-08-14 13:28:34'),(27,'0c3a5400-97e4-11f1-9bd9-6018957395ba','站在兵马俑前，我看到了两千年前的\"工匠精神\"','2026-07-27','2026-07-28','西安',NULL,'做了十五年历史教师，每次站在兵马俑前还是会被震撼','高铁','人均800元','人文','我们做的每一件认真的事，也许都会在某个遥远的未来被看见','旺季门票120元建议提前公众号预约；强烈建议请官方讲解员（150元/次）；参观顺序一号坑→三号坑→二号坑；预留3-4小时',2,'2026-08-14 13:28:34'),(28,'0c3e5314-97e4-11f1-9bd9-6018957395ba','夏天在亚布力滑雪是一种什么体验？','2026-07-26','2026-07-27','亚布力',NULL,'在旱雪道上冲到72km/h，体验绝对专注带来的自由','自驾','人均2000元','冒险','在雪道上，我只需要感受风和重力','初学者建议请教练（2小时约400元）；夏季旱雪道人少适合训练；必须戴头盔；VR第一视角建议用头盔固定支架',2,'2026-08-14 13:28:34'),(29,'a245f057-d789-4e13-b023-4e92d602079f','漓江边的十五小时：与光同行的等待','2026-08-04','2026-08-04','阳朔兴坪镇',NULL,'一个人在漓江边从漆黑等到漆黑，用15个小时的坚守，换一场日升月落的光影独白。','未知','未知','摄影、独处、自然光影','当我在夜色中收拾器材准备离开时，江面已恢复了凌晨的墨色，仿佛这一天的光影盛宴从未发生。可我明白，那些被记录的光已经长进我的身体里。漓江教会我的，不是如何抓住美，而是如何诚实地等待美。这十五个小时的独处，像一场无声的修行，让我在快门的嗒嗒声中，找到了内心最安稳的节拍。下一次当城市的喧嚣让我喘不过气时，我会记得，在阳朔的某个江边，曾有一个人用整整一天的光阴，只为等待一场完美的日落。','拍摄日出日落需提前踩点并预留充足时间；夏季漓江边湿热，建议携带防暑药品；延时摄影请备足存储卡和电池；若想独享安静，不妨选择工作日前往；拍摄间隙记得抬头看看实景，别让取景框框住了旅行的意义。',1,'2026-09-09 08:47:22');
/*!40000 ALTER TABLE `journeys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_likes_unique` (`user_id`,`post_id`),
  KEY `idx_likes_post` (`post_id`),
  CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_shares`
--

DROP TABLE IF EXISTS `location_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_shares` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `location_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_live` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loc_conv` (`conversation_id`),
  KEY `idx_loc_user` (`user_id`),
  KEY `idx_loc_live` (`is_live`,`expires_at`),
  CONSTRAINT `fk_loc_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_shares`
--

LOCK TABLES `location_shares` WRITE;
/*!40000 ALTER TABLE `location_shares` DISABLE KEYS */;
INSERT INTO `location_shares` VALUES ('ls1','conv3','u1',30.25900000,120.14490000,'杭州西湖断桥',0,NULL,'2026-08-04 12:00:35'),('ls2','conv6','u5',27.10000000,100.18000000,'玉龙雪山脚下',1,'2026-07-19 10:00:00','2026-08-04 12:00:35'),('ls3','conv1','u1',30.12970000,118.16490000,'黄山光明顶',1,'2026-07-19 12:00:00','2026-08-04 12:00:35'),('ls4','conv4','u5',27.34000000,100.17000000,'虎跳峡入口',0,NULL,'2026-08-04 12:00:35'),('ls5','conv8','u6',35.66500000,139.77000000,'东京筑地市场',0,NULL,'2026-08-04 12:00:35'),('ls6','conv8','u1',30.67000000,104.05000000,'成都宽窄巷子',0,NULL,'2026-08-04 12:00:35');
/*!40000 ALTER TABLE `location_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_items`
--

DROP TABLE IF EXISTS `media_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('VIDEO','IMAGE','AUDIO','LINK','TRANSLATION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hls_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `vr_format` enum('STANDARD','VR180','VR360','SPATIAL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `translated_text` text COLLATE utf8mb4_unicode_ci,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_description` text COLLATE utf8mb4_unicode_ci,
  `link_favicon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `text_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_post` (`post_id`),
  CONSTRAINT `fk_media_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_items`
--

LOCK TABLES `media_items` WRITE;
/*!40000 ALTER TABLE `media_items` DISABLE KEYS */;
INSERT INTO `media_items` VALUES ('0815fd4e-10ed-426f-aa3b-98d2fa6e44e2','2d85df5c-773b-4241-9a40-f6a5677c0a6d','IMAGE','/uploads/images/38cb0475-5e9f-42d9-9b48-970fb1ae6845.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:51'),('1f557553-4fff-47aa-8f40-19c0fe833b92','9617defc-02e2-4ba5-9920-0d43edc24ea3','IMAGE','/uploads/images/5f997b16-0155-4172-ab8a-16e0d7a41e17.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:50'),('2c8faad6-30a9-47b2-8775-a5c808a2b92d','c02c5cda-9bd3-43e3-853b-9fc3889e0dc4','IMAGE','/uploads/images/224a599c-ef26-475b-8ea2-41b40a723b4a.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:51'),('8631cef7-e71c-4143-ac46-99be5f536c60','83773003-ea8b-45ff-8d91-d77e67b2719c','IMAGE','http://localhost:3001/uploads/images/ffe0c98b-f7d8-476c-9eca-2af1d61eeeee.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-27 10:26:34'),('bad306c9-ffa6-4797-9789-89be5e320868','d49d8d81-1808-4e07-962a-ed95e6983a1c','IMAGE','/uploads/images/aa10ce3e-b0a2-454b-b4df-c6c32b00e403.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:50'),('d69e8763-4f53-412e-b763-5324b055a832','eb5b041e-a432-4d46-96fb-85881c578c34','IMAGE','/uploads/images/cb269c43-4065-4624-891a-8604c0f5d354.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:50'),('e14def28-ee7d-4cce-a3f7-a75a1c278ede','2aeb247d-105e-4bb8-bae2-90ab0dcf39dc','IMAGE','/uploads/images/587daf6e-ba35-4fbc-8389-3736707d0366.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:52'),('ec5c3055-6413-49af-a350-a4f56fb5f9b9','b40cecbe-9d18-4fb7-85d5-255183e22924','IMAGE','/uploads/images/0af731a7-09f1-4d5e-bff2-e3c0e36136a6.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-24 09:20:51');
/*!40000 ALTER TABLE `media_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_reactions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emoji` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reaction` (`message_id`,`user_id`,`emoji`),
  KEY `idx_message_id` (`message_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_reaction_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_reactions`
--

LOCK TABLES `message_reactions` WRITE;
/*!40000 ALTER TABLE `message_reactions` DISABLE KEYS */;
INSERT INTO `message_reactions` VALUES ('mr1','msg1','u1','like','2026-08-04 12:00:35'),('mr10','msg8','u4','tada','2026-08-04 12:00:35'),('mr11','msg9','u1','like','2026-08-04 12:00:35'),('mr12','msg9','u2','handshake','2026-08-04 12:00:35'),('mr13','msg10','u5','pray','2026-08-04 12:00:35'),('mr14','msg13','u1','calendar','2026-08-04 12:00:35'),('mr15','msg14','u1','noodles','2026-08-04 12:00:35'),('mr16','msg15','u6','heart','2026-08-04 12:00:35'),('mr17','msg16','u1','wave','2026-08-04 12:00:35'),('mr18','msg16','u8','like','2026-08-04 12:00:35'),('mr19','msg16','u10','muscle','2026-08-04 12:00:35'),('mr2','msg1','u1','pray','2026-08-04 12:00:35'),('mr20','msg17','u5','tada','2026-08-04 12:00:35'),('mr21','msg18','u5','diving','2026-08-04 12:00:35'),('mr22','msg20','u1','scroll','2026-08-04 12:00:35'),('mr23','msg22','u1','museum','2026-08-04 12:00:35'),('mr3','msg3','u1','tada','2026-08-04 12:00:35'),('mr4','msg2','u2','heart_eyes','2026-08-04 12:00:35'),('mr5','msg4','u3','handshake','2026-08-04 12:00:35'),('mr6','msg5','u1','muscle','2026-08-04 12:00:35'),('mr7','msg6','u1','heart','2026-08-04 12:00:35'),('mr8','msg6','u2','like','2026-08-04 12:00:35'),('mr9','msg6','u3','heart_eyes','2026-08-04 12:00:35');
/*!40000 ALTER TABLE `message_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `media_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_type` enum('IMAGE','FILE','AUDIO','CARD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv` (`conversation_id`,`created_at`),
  KEY `fk_msg_sender` (`sender_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('msg1','conv1','u2','你拍的黄山VR视频太震撼了！是用什么设备拍的？',NULL,'IMAGE','2026-06-23 02:30:00'),('msg10','conv4','u1','赵六哥，哈巴雪山的VR视频太棒了！',NULL,'IMAGE','2026-06-20 00:00:00'),('msg11','conv4','u5','谢谢！想一起去爬山吗？',NULL,'IMAGE','2026-06-20 00:05:00'),('msg12','conv4','u1','当然想！什么时候出发？',NULL,'IMAGE','2026-06-20 00:10:00'),('msg13','conv4','u5','下个月吧，我先做攻略',NULL,'IMAGE','2026-06-20 00:15:00'),('msg14','conv5','u6','你在长沙吃的那些美食，我都想尝尝！',NULL,'IMAGE','2026-06-18 02:00:00'),('msg15','conv5','u1','下次一起去！长沙的美食真的太多了',NULL,'IMAGE','2026-06-18 02:05:00'),('msg16','conv6','u5','下周末虎跳峡徒步，有人一起吗？',NULL,'IMAGE','2026-06-15 04:00:00'),('msg17','conv6','u1','我！一定去！',NULL,'IMAGE','2026-06-15 04:05:00'),('msg18','conv6','u8','我也可以，顺便看看有没有水下拍摄点',NULL,'IMAGE','2026-06-15 04:10:00'),('msg19','conv6','u10','太好了！人多更安全',NULL,'IMAGE','2026-06-15 04:15:00'),('msg2','conv1','u1','Apple Vision Pro，空间视频模式',NULL,'IMAGE','2026-06-23 02:35:00'),('msg20','conv7','u9','你的布达拉宫VR视频太有教育意义了',NULL,'IMAGE','2026-06-12 06:00:00'),('msg21','conv7','u1','谢谢郑老师！希望能为文化传承做点贡献',NULL,'IMAGE','2026-06-12 06:05:00'),('msg22','conv7','u9','下次一起去兵马俑吧，我当导游',NULL,'IMAGE','2026-06-12 06:10:00'),('msg23','conv8','u6','发现了一家超好吃的火锅店！',NULL,'IMAGE','2026-06-10 10:00:00'),('msg24','conv8','u4','在哪里？我马上去！',NULL,'IMAGE','2026-06-10 10:05:00'),('msg25','conv8','u9','西安的美食太多了，根本吃不完',NULL,'IMAGE','2026-06-10 10:10:00'),('msg26','conv8','u1','下次美食VR拍摄走起！',NULL,'IMAGE','2026-06-10 10:15:00'),('msg3','conv1','u2','下次一起出去拍吧！',NULL,'IMAGE','2026-06-23 02:40:00'),('msg4','conv2','u1','好的，下次一起去桂林拍VR！',NULL,'IMAGE','2026-06-22 07:00:00'),('msg5','conv2','u3','没问题！我带上新评测的设备',NULL,'IMAGE','2026-06-22 07:05:00'),('msg6','conv3','u4','推荐一个拍360全景的好地方——九寨沟！',NULL,'IMAGE','2026-06-21 12:00:00'),('msg7','conv3','u1','九寨沟确实很美！我上个月刚去过',NULL,'IMAGE','2026-06-21 12:05:00'),('msg8','conv3','u2','我也想去！组队吗？',NULL,'IMAGE','2026-06-21 12:10:00'),('msg9','conv3','u3','算我一个！',NULL,'IMAGE','2026-06-21 12:15:00');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('LIKE','COMMENT','FOLLOW','SYSTEM','MESSAGE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_recipient` (`recipient_id`,`is_read`,`created_at` DESC),
  KEY `idx_notif_sender` (`sender_id`),
  KEY `idx_notif_post` (`post_id`),
  CONSTRAINT `fk_notif_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('n10','u1','u2','FOLLOW','张三 关注了你',NULL,0,'2026-07-17 02:00:00'),('n15','u1','u7','FOLLOW','周八 关注了你',NULL,1,'2026-07-15 02:00:00'),('n18','u1','u10','FOLLOW','钱一 关注了你',NULL,1,'2026-07-13 01:00:00'),('n19','u1',NULL,'SYSTEM','你的VR视频《黄山云海》已被推荐到首页 🎉',NULL,1,'2026-07-12 02:00:00'),('n20','u1',NULL,'SYSTEM','欢迎来到徐霞客！开始你的VR旅行之旅吧 🌍',NULL,1,'2026-07-01 00:00:00'),('n21','u1','u2','MESSAGE','张三 给你发了一条新消息',NULL,0,'2026-07-17 23:30:00'),('n22','u1','u3','MESSAGE','李四 给你发了一条新消息',NULL,0,'2026-07-17 11:00:00'),('n24','u2','u1','FOLLOW','徐霞客 关注了你',NULL,0,'2026-07-18 01:00:00'),('n27','u2',NULL,'SYSTEM','你的帖子获得了50个赞！继续加油 💪',NULL,1,'2026-07-16 02:00:00'),('n3','u1','u5','FOLLOW','赵六 关注了你',NULL,0,'2026-07-18 00:45:00'),('n30','u3','u6','FOLLOW','孙七 关注了你',NULL,0,'2026-07-17 06:00:00'),('n31','u3',NULL,'SYSTEM','你的VR全景作品已被精选推荐 ✨',NULL,1,'2026-07-15 01:00:00'),('n33','u4','u3','FOLLOW','李四 关注了你',NULL,0,'2026-07-17 03:00:00'),('n37','u5','u2','FOLLOW','张三 关注了你',NULL,0,'2026-07-17 07:00:00'),('n38','u5',NULL,'SYSTEM','恭喜！你获得了「户外探险家」徽章 🏔️',NULL,0,'2026-07-16 04:00:00'),('n39','u6','u1','FOLLOW','徐霞客 关注了你',NULL,1,'2026-07-17 23:00:00'),('n44','u8','u4','FOLLOW','王五 关注了你',NULL,0,'2026-07-17 08:00:00'),('n47','u10','u1','FOLLOW','徐霞客 关注了你',NULL,0,'2026-07-18 00:30:00'),('n50','u1',NULL,'SYSTEM','系统维护完成，VR播放体验已优化 🚀',NULL,0,'2026-07-17 22:00:00'),('n7','u1','u8','FOLLOW','吴九 关注了你',NULL,0,'2026-07-17 10:00:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist_tracks`
--

DROP TABLE IF EXISTS `playlist_tracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist_tracks` (
  `playlist_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`playlist_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `playlist_tracks_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `audio_playlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `playlist_tracks_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_tracks`
--

LOCK TABLES `playlist_tracks` WRITE;
/*!40000 ALTER TABLE `playlist_tracks` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist_tracks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_hashtags`
--

DROP TABLE IF EXISTS `post_hashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_hashtags` (
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashtag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`post_id`,`hashtag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_hashtags`
--

LOCK TABLES `post_hashtags` WRITE;
/*!40000 ALTER TABLE `post_hashtags` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_hashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `idx_ptag_tag` (`tag_id`),
  CONSTRAINT `fk_ptag_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ptag_tag` FOREIGN KEY (`tag_id`) REFERENCES `interest_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_topics`
--

DROP TABLE IF EXISTS `post_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_topics` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pt_post` (`post_id`),
  KEY `idx_pt_topic` (`topic_id`),
  CONSTRAINT `fk_pt_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_topics`
--

LOCK TABLES `post_topics` WRITE;
/*!40000 ALTER TABLE `post_topics` DISABLE KEYS */;
INSERT INTO `post_topics` VALUES ('0c72525d-97e4-11f1-9bd9-6018957395ba','0c163d89-97e4-11f1-9bd9-6018957395ba','topic-003','2026-08-14 13:28:34'),('0c72bdce-97e4-11f1-9bd9-6018957395ba','0c1ef16f-97e4-11f1-9bd9-6018957395ba','topic-003','2026-08-14 13:28:34'),('0c72bf4c-97e4-11f1-9bd9-6018957395ba','0c22ae40-97e4-11f1-9bd9-6018957395ba','topic-007','2026-08-14 13:28:34'),('0c72c058-97e4-11f1-9bd9-6018957395ba','0c25bba6-97e4-11f1-9bd9-6018957395ba','topic-007','2026-08-14 13:28:34'),('0c72c139-97e4-11f1-9bd9-6018957395ba','0c2afb63-97e4-11f1-9bd9-6018957395ba','topic-008','2026-08-14 13:28:34'),('0c72c213-97e4-11f1-9bd9-6018957395ba','0c2fec71-97e4-11f1-9bd9-6018957395ba','topic-005','2026-08-14 13:28:34'),('0c72c2e5-97e4-11f1-9bd9-6018957395ba','0c367b7e-97e4-11f1-9bd9-6018957395ba','topic-006','2026-08-14 13:28:34'),('0c72c3ab-97e4-11f1-9bd9-6018957395ba','0c3a5400-97e4-11f1-9bd9-6018957395ba','topic-005','2026-08-14 13:28:34'),('0c72c49a-97e4-11f1-9bd9-6018957395ba','0c3e5314-97e4-11f1-9bd9-6018957395ba','topic-007','2026-08-14 13:28:34');
/*!40000 ALTER TABLE `post_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_type` enum('NOTE','VR_MEDIA','ROUTE','JOURNEY','GUIDE','MOMENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOTE' COMMENT '帖子类型',
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联社群ID',
  `content_level` enum('SNAPSHOT','CLASSIFIED','DIARY','ESSAY','LOG','TRAVELOGUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SNAPSHOT' COMMENT '内容层级：SNAPSHOT闪拍|CLASSIFIED分类|DIARY日记|ESSAY散文|LOG日志|TRAVELOGUE游记',
  `parent_post_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '上级内容ID',
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '行程ID（闪拍App tripId）',
  `trip_title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '行程标题',
  `content` text COLLATE utf8mb4_unicode_ci,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题（游记用）',
  `location_lat` decimal(10,7) DEFAULT NULL,
  `location_lng` decimal(10,7) DEFAULT NULL,
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vr_metadata` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON格式VR元数据',
  `visibility` enum('PUBLIC','FOLLOWERS','PRIVATE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLIC',
  `like_count` int NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_posts_author` (`author_id`),
  KEY `idx_posts_community` (`community_id`),
  KEY `idx_posts_type` (`post_type`),
  KEY `idx_posts_content_level` (`content_level`),
  KEY `idx_posts_parent` (`parent_post_id`),
  KEY `idx_posts_created` (`created_at` DESC),
  KEY `idx_posts_view` (`view_count` DESC),
  KEY `idx_posts_like` (`like_count` DESC),
  KEY `idx_posts_trip` (`trip_id`),
  CONSTRAINT `fk_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('0c162849-97e4-11f1-9bd9-6018957395ba','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年8月4日，阳朔兴坪镇。凌晨4:30到达拍摄点，架设Insta360 X4。5:12日出开始，晨雾从江面升起，喀斯特山峰在金色光线中渐次显现。拍摄持续到19:30日落，共拍摄14组延时素材。天气晴朗，气温34°C，湿度偏高。同行：无。设备电量消耗3块电池。',NULL,NULL,NULL,'阳朔兴坪镇漓江边','{\"image\": \"/api/placeholder/snap-0c162849-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"晴\", \"activity\": \"摄影\", \"keywords\": [\"漓江\", \"延时摄影\", \"日出\", \"日落\", \"喀斯特\"], \"companion\": \"独自\"}','PRIVATE',0,0,9,'2026-08-04 12:00:00',NULL,NULL),('0c162e57-97e4-11f1-9bd9-6018957395ba','u2','NOTE',NULL,'DIARY','0c162849-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'在漓江边站了15个小时，从漆黑等到漆黑。最美的其实是日出前那二十分钟——天空从深蓝变成浅紫，再变成橘红，整个过程安静得只听得见快门声和水流声。\n\n有时候觉得，摄影教会我的不是怎么拍好一张照片，而是怎么等待。很多东西急不来，光不会因为你着急就提前亮起来。\n\n今天拍了三千多张，最后可能只选十张。但这种\"浪费\"让我觉得奢侈而幸福。','在漓江边等光的人',NULL,NULL,'阳朔兴坪镇','{\"keywords\":[\"漓江\",\"等待\",\"摄影哲学\",\"独处\",\"光影\"],\"mood\":\"calm\",\"weather\":\"sunny\",\"insight\":\"摄影教会我的不是怎么拍好一张照片，而是怎么等待。\",\"style\":\"诗意散文风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,6,'2026-08-04 13:00:00',NULL,NULL),('0c163d89-97e4-11f1-9bd9-6018957395ba','u2','JOURNEY',NULL,'TRAVELOGUE','0c162e57-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 漓江光影日记：从日出到日落的十二小时\n\n## 出发\n\n去漓江拍延时，是计划了很久的事。桂林山水在VR镜头里会是什么样子？我想知道当喀斯特山峰遇到360度全景，是不是能让人真的\"站在\"漓江边。\n\n凌晨四点出发，兴坪镇还在沉睡，只有江面的雾气醒着。\n\n## 等待光\n\n架好设备的时候天还是黑的。第一缕光在5点12分出现——不是太阳，是天空开始变颜色。深蓝、浅紫、橘红，整个过程像有人在头顶慢慢拉开一块画布。\n\n喀斯特山峰的轮廓从黑暗中浮现，江面开始反射天光。那一刻我突然明白了，为什么古人说\"桂林山水甲天下\"——不是因为山有多高水有多深，而是因为这里的山水组合，恰好击中了人对\"美\"最原始的感知。\n\n## 十二小时的凝视\n\n从日出到日落，我用Insta360 X4记录了14组延时序列。中午的阳光太硬，不适合拍摄，我就坐在江边的石头上，看来往的竹筏和游客。\n\n一个撑竹筏的老人经过，问我拍了多久。我说从凌晨开始。他笑了笑说：\"你们拍照片的人，比我们划船的还有耐心。\"\n\n我想他说得对。摄影和旅行一样，最美的部分不在目的地，在路上。\n\n## 入夜\n\n太阳落山后，我收拾设备准备离开。江面恢复了平静，山峰重新变成剪影。我回头看了一眼，心想：今天的光，我会记得很久。\n\n> 旅行提示：阳朔兴坪镇是拍摄漓江日出的最佳位置，建议住在兴坪古镇，步行到江边约15分钟。夏季日出时间约5:10-5:30，需提前到达。','漓江光影日记：从日出到日落的十二小时',NULL,NULL,'阳朔兴坪镇','{\"keywords\":[\"漓江\",\"阳朔\",\"延时摄影\",\"日出\",\"桂林山水\",\"旅行摄影\"],\"sourceSnapIds\":[\"0c162849-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c162e57-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"根据今天的拍摄日志和心情日记，写一篇漓江光影旅行游记，包含实用旅行提示\",\"style\":\"诗意散文风\",\"aiGenerated\":true}','PUBLIC',0,0,26,'2026-08-04 14:00:00',NULL,NULL),('0c1ef060-97e4-11f1-9bd9-6018957395ba','u3','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年8月3日，杭州西湖断桥。测试新VR相机的空间视频拍摄能力。拍摄参数：4K/60fps，VR180模式，白平衡自动，ISO 100-800。拍摄对象：断桥、白堤、雷峰塔远景、湖面倒影、游客动态。设备温度正常，未出现过热警告。视频文件共28GB。下午在湖滨路咖啡馆对比了前三代设备的画质表现，暗部细节提升明显。',NULL,NULL,NULL,'杭州西湖断桥','{\"image\": \"/api/placeholder/snap-0c1ef060-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"多云转晴\", \"activity\": \"设备测评\", \"keywords\": [\"VR相机\", \"测评\", \"西湖\", \"空间视频\", \"画质对比\"], \"companion\": \"独自\"}','PRIVATE',0,0,0,'2026-08-03 11:00:00',NULL,NULL),('0c1ef0f2-97e4-11f1-9bd9-6018957395ba','u3','NOTE',NULL,'DIARY','0c1ef060-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'拿着新设备在西湖边走了一圈，突然想起六年前第一次来西湖——那时候拿的还是手机，拍了张糊掉的断桥。\n\n六年过去，设备从手机变成了VR相机，从平面变成了360度。但站在断桥上的那种感觉没变。科技一直在进步，但西湖还是那个西湖，断桥还是那个断桥。\n\n可能这就是科技的意义吧——不是替代真实的体验，而是让没来过的人，也能感受到那一刻的风和光。','用最新的设备，拍最老的风景',NULL,NULL,'杭州西湖','{\"keywords\":[\"西湖\",\"科技\",\"时间\",\"断桥\",\"VR\"],\"mood\":\"calm\",\"weather\":\"cloudy\",\"insight\":\"科技一直在进步，但西湖还是那个西湖。\",\"style\":\"成长复盘风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,7,'2026-08-03 12:00:00',NULL,NULL),('0c1ef16f-97e4-11f1-9bd9-6018957395ba','u3','JOURNEY',NULL,'TRAVELOGUE','0c1ef0f2-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 西湖边上的一场VR革命：当千年湖山撞上最新科技\n\n## 为什么选西湖？\n\n做VR相机测评，选景很重要。西湖有山有水有建筑有倒影，自然光和阴影交错，是测试HDR和暗部细节的最佳场地。而断桥——一个被拍了无数次的地方——恰恰是检验VR能不能让人看到\"不一样\"的最佳场景。\n\n## 拍摄体验\n\n这次带的是最新款VR180相机，4K/60fps。在断桥上拍了四十分钟：全景、特写、人像、风景。最惊喜的是暗部表现——荷叶下面的阴影区域，上一代设备会一片死黑，这一代能看清水面的纹理。\n\n从白堤走到雷峰塔，一路走一路拍。自动白平衡在树荫和阳光之间切换很快，没有明显的色温漂移。唯一的小遗憾是逆光场景下高光溢出稍多，后期需要压一下。\n\n## 在西湖边想到的\n\n六年前我第一次来西湖，用手机拍了张断桥。那张照片后来换了三次手机也没舍得删——不是因为画质好，而是因为那一刻的风、温度、心情都和像素一起被保存了下来。\n\n现在用VR拍西湖，本质上做的是一样的事：让一个瞬间被记住。只不过这一次，我想让看的人不只是看到断桥，而是\"站在\"断桥上看西湖。\n\n> 拍摄建议：西湖断桥上午9点前光线最佳，白堤一侧可以拍到雷峰塔远景。VR拍摄建议使用三脚架，保持水平，避免后期拼接错位。','当千年湖山撞上最新科技：西湖VR拍摄手记',NULL,NULL,'杭州西湖','{\"keywords\":[\"VR测评\",\"西湖\",\"空间视频\",\"摄影技巧\",\"科技人文\"],\"sourceSnapIds\":[\"0c1ef060-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c1ef0f2-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合设备测评日志和个人感悟日记，写一篇西湖VR拍摄游记，包含设备体验和拍摄建议\",\"style\":\"成长复盘风\",\"aiGenerated\":true}','PUBLIC',0,0,7,'2026-08-03 13:00:00',NULL,NULL),('0c22acb1-97e4-11f1-9bd9-6018957395ba','u4','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年8月2日，稻城亚丁景区。徒步路线：游客中心→冲古寺→洛绒牛场→牛奶海→五色海，全程18公里，海拔从3900米爬升到4700米。用时8.5小时。天气：上午晴，午后转多云，14:00开始下小雨。三神山（仙乃日、央迈勇、夏诺多吉）均有可见。牛奶海水色碧蓝，五色海因光线不足色彩不太明显。高反轻微，服用了红景天。',NULL,NULL,NULL,'稻城亚丁景区','{\"image\": \"/api/placeholder/snap-0c22acb1-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"晴转小雨\", \"activity\": \"高海拔徒步\", \"keywords\": [\"稻城亚丁\", \"徒步\", \"高海拔\", \"三神山\", \"牛奶海\"], \"companion\": \"独自\"}','PRIVATE',0,0,0,'2026-08-02 13:00:00',NULL,NULL),('0c22adb1-97e4-11f1-9bd9-6018957395ba','u4','NOTE',NULL,'DIARY','0c22acb1-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'在海拔4700米的五色海边，我突然理解了什么叫做\"身体在地狱，眼睛在天堂\"。\n\n走最后一段爬升的时候，每走十步就要停下来喘气。但一抬头，仙乃日雪山的山尖就在云层中若隐若现，像在说：快到了，再坚持一下。\n\n到了牛奶海的那一刻，我坐在石头上一句话都说不出来。那个蓝色——不是天蓝也不是海蓝，是只有在高原冰川融水里才能看到的碧蓝。我拿起VR相机，又放下。有些画面，镜头装不下。','在4700米的高原上，我学会了呼吸',NULL,NULL,'稻城亚丁牛奶海','{\"keywords\":[\"高海拔\",\"牛奶海\",\"坚持\",\"震撼\",\"自然之美\"],\"mood\":\"excited\",\"weather\":\"rainy\",\"insight\":\"有些画面，镜头装不下。\",\"style\":\"温柔治愈风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-08-02 14:00:00',NULL,NULL),('0c22ae40-97e4-11f1-9bd9-6018957395ba','u4','JOURNEY',NULL,'TRAVELOGUE','0c22adb1-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 稻城亚丁：身体的地狱，眼睛的天堂\n\n## 为什么一定要去稻城亚丁？\n\n如果有人问\"中国最美的徒步路线在哪里\"，稻城亚丁一定在前三名。三座神山环绕的高原盆地，海拔从3900到4700米，沿途有冰川、湖泊、草甸、森林，景观密度极高。\n\n但这里也是出了名的\"体力绞肉机\"——全程18公里，高海拔爬升800米，对体能和意志力都是巨大考验。\n\n## 徒步全记录\n\n### 第一段：游客中心→冲古寺（轻松开局）\n\n这段有电瓶车可以坐，但我选择步行适应海拔。沿途是茂密的高山松林，空气里带着松香。冲古寺很小，但位置绝佳——正对仙乃日雪山，是拍摄第一组VR全景的最佳点位。\n\n### 第二段：冲古寺→洛绒牛场（精华段）\n\n从冲古寺步行三公里到洛绒牛场，沿途是开阔的草甸和溪流。三座神山会轮流出现在视野里，每转一个弯就是不一样的构图。这里也是野生动物的天堂，我看到了藏羚羊和土拨鼠。\n\n### 第三段：洛绒牛场→牛奶海（魔鬼爬升）\n\n这是全程最难的一段。从4200米到4500米，坡度陡、氧气少。我每走十步就要停下来深呼吸。路上遇到一个藏族大叔，他跟我说：\"慢慢走，山不会跑的。\"这句话给了我很大的安慰。\n\n### 终点：牛奶海和五色海\n\n牛奶海的水色是饱和度极高的碧蓝，据说是冰川融水中富含矿物质导致的。我在湖边坐了很久，拍了很多VR素材——但说实话，VR也拍不出身临其境的那种震撼。\n\n五色海因为下午光线不足，五种颜色不太明显。但站在4700米的高度俯瞰整个山谷，那种\"渺小而幸运\"的感觉，是任何设备都拍不出来的。\n\n> 实用提示：①必须提前一天到稻城县城适应海拔；②带足氧气瓶，每人至少2罐；③牛奶海最佳拍摄时间是上午11点前，午后容易起云；④高原天气多变，备好雨衣和冲锋衣。','稻城亚丁徒步全记录：在4700米与自己对话',NULL,NULL,'稻城亚丁景区','{\"keywords\":[\"稻城亚丁\",\"徒步攻略\",\"牛奶海\",\"高原旅行\",\"VR全景\"]}','PUBLIC',0,0,1,'2026-08-02 15:00:00',NULL,NULL),('0c25ba7c-97e4-11f1-9bd9-6018957395ba','u5','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年8月1日，哈巴雪山登顶日。凌晨3:00从大本营（4100m）出发，6:48登顶（5396m）。天气：晴朗无风，气温-8°C，能见度极佳。登顶用时3小时48分。同行客户3人，均成功登顶。使用了冰爪、冰镐、安全带等技术装备。雪线以上约500米，冰裂缝较往年偏少。拍摄了登顶360°全景VR。下撤用时2.5小时，15:00返回哈巴村。',NULL,NULL,NULL,'哈巴雪山','{\"image\": \"/api/placeholder/snap-0c25ba7c-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"晴\", \"activity\": \"雪山攀登\", \"keywords\": [\"哈巴雪山\", \"登顶\", \"5396米\", \"雪山攀登\", \"向导\"], \"companion\": \"带客户3人\"}','PRIVATE',0,0,0,'2026-08-01 10:00:00',NULL,NULL),('0c25bb1c-97e4-11f1-9bd9-6018957395ba','u5','NOTE',NULL,'DIARY','0c25ba7c-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'这是我的第23次哈巴登顶，但这次不太一样。\n\n以前登顶都是一个人或者带老手，这次带的是三个第一次爬雪山的客户。看到他们站在5396米的那一刻，眼睛里的光芒比我第一次登顶的时候还要亮。\n\n有个客户在峰顶哭了。她说从来没有想过自己能站在这个高度。我递了杯热水给她，说：\"山一直都在，是你选择了来。\"\n\n带人看世界——这可能比我自己看世界，更有意义。','带他们站在5396米，比我自己登顶更骄傲',NULL,NULL,'哈巴雪山','{\"keywords\":[\"登顶\",\"客户\",\"向导\",\"成就感\",\"雪山\"],\"mood\":\"excited\",\"weather\":\"sunny\",\"insight\":\"带人看世界，可能比我自己看世界，更有意义。\",\"style\":\"成长复盘风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-08-01 11:00:00',NULL,NULL),('0c25bba6-97e4-11f1-9bd9-6018957395ba','u5','JOURNEY',NULL,'TRAVELOGUE','0c25bb1c-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 哈巴雪山：一座\"入门级\"雪山的不入门体验\n\n## 哈巴雪山是什么水平？\n\n很多人说哈巴是\"入门级雪山\"，但我要纠正一下——哈巴只是\"技术难度入门\"，但海拔和体能要求一点也不入门。5396米的海拔，从大本营到峰顶需要爬升近1300米，在-8°C的凌晨连续攀登近4小时。\n\n## 登顶日记\n\n凌晨3点出发，头灯的光束在雪地上画出一条路。星空极亮，银河清晰可见——这是城市里永远看不到的。\n\n走了大约一个小时后，第一个客户出现了轻度高反。我让她放慢节奏，按照\"走十步歇一口\"的频率来。在高海拔登山，比的不是谁快，而是谁能保持自己的节奏。\n\n天亮的时候我们刚好到达雪线。太阳从云海中升起，把整片雪地染成了金色。这是哈巴最美的时刻，也是我第23次看这个画面——但每次都不一样。\n\n6点48分，全队登顶。站在5396米俯瞰云海，玉龙雪山在远处若隐若现。有个客户拿出手机想拍照，我说别急，先用眼睛看三十秒，再拿设备。\n\n## 山教会我的事\n\n做户外教练十年，带过几百人登山。最大的感触是：山不会因为你厉害就对你客气，也不会因为你菜就不让你上。它只认一件事——你愿不愿意一步一步走。\n\n> 登顶攻略：①哈巴村出发→大本营（骑马/徒步4-5小时）→凌晨出发冲顶→下撤；②必备装备：高山靴、冰爪、冰镐、安全带、头盔、头灯、羽绒服；③最佳季节：4-6月和9-11月；④必须请向导，不要独自攀登。','第23次站在哈巴之巅：一座入门雪山的不入门哲学',NULL,NULL,'哈巴雪山','{\"keywords\":[\"哈巴雪山\",\"登顶攻略\",\"雪山攀登\",\"向导经验\",\"5396米\"],\"sourceSnapIds\":[\"0c25ba7c-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c25bb1c-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合登顶技术日志和带队感悟日记，写一篇哈巴雪山深度攀登游记，包含攻略和人文感悟\",\"style\":\"成长复盘风\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-08-01 12:00:00',NULL,NULL),('0c2afa23-97e4-11f1-9bd9-6018957395ba','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年7月31日，长沙。探店路线：火宫殿（早餐）→ 太平街（小吃）→ 坡子街（午餐）→ 文和友（晚餐）。打卡菜品：臭豆腐（黑色经典）、糖油粑粑、口味虾、剁椒鱼头、茶颜悦色（幽兰拿铁）。共拍摄美食VR近景素材47组。花费：交通15元+餐饮286元。口味评价：臭豆腐外酥里嫩8.5分，口味虾辣度适中但虾肉偏老7分，剁椒鱼头鲜辣平衡9分。',NULL,NULL,NULL,'长沙火宫殿/太平街/文和友','{\"image\": \"/api/placeholder/snap-0c2afa23-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"spend\": 301, \"activity\": \"美食探店\", \"keywords\": [\"长沙\", \"美食探店\", \"臭豆腐\", \"口味虾\", \"湘菜\"], \"companion\": \"独自\"}','PRIVATE',0,0,2,'2026-07-31 14:00:00',NULL,NULL),('0c2afad6-97e4-11f1-9bd9-6018957395ba','u6','NOTE',NULL,'DIARY','0c2afa23-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'今天在太平街吃臭豆腐的时候，旁边坐着一个老奶奶带着孙子。小朋友咬了一口被辣得直吐舌头，老奶奶笑着说：\"慢慢吃，辣味是要品的，不是要躲的。\"\n\n突然觉得这句话很对。长沙的食物是\"凶\"的——辣椒、花椒、蒜，每一口都像在挑战你的味蕾。但正是这种\"凶\"，让人吃完之后全身发热，觉得活着真好。\n\n湘菜教我的事：生活要够味，辣一点没关系。','长沙教会我：辣一点没关系',NULL,NULL,'长沙太平街','{\"keywords\":[\"长沙美食\",\"辣\",\"人生哲学\",\"湘菜\",\"市井烟火\"],\"mood\":\"happy\",\"weather\":\"sunny\",\"insight\":\"生活要够味，辣一点没关系。\",\"style\":\"轻松口语风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,3,'2026-07-31 15:00:00',NULL,NULL),('0c2afb63-97e4-11f1-9bd9-6018957395ba','u6','JOURNEY',NULL,'TRAVELOGUE','0c2afad6-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 24小时吃遍长沙：一个美食博主的火辣日记\n\n## 长沙，一座为吃而生的城市\n\n如果说成都是\"来了就不想走\"，那长沙就是\"来了就一直在吃\"。从早上的臭豆腐到凌晨的小龙虾，这座城市的美食密度高得离谱。\n\n## 早餐：火宫殿（8:00-9:30）\n\n火宫殿与其说是餐厅，不如说是一个美食博物馆。早上八点就开始热闹，蒸笼冒着白气，空气里是辣椒和蒜的混合香味。\n\n必点：臭豆腐（黑色经典，外酥里嫩，配萝卜干绝了）、糖油粑粑（甜糯但不腻）、姊妹团子（猪肉和糖馅两种口味）。\n\n## 上午：太平街小吃之旅（10:00-12:00）\n\n太平街是长沙最有烟火气的地方。青石板路两边全是小吃摊，从街头走到街尾，嘴巴停不下来。\n\n强烈推荐：文和友老长沙大香肠（肉感十足）、刮凉粉（夏天吃太清爽了）、紫苏桃子姜（非常特别的风味组合）。\n\n## 午餐：坡子街剁椒鱼头（12:30-14:00）\n\n来长沙必须吃一顿正宗的剁椒鱼头。我选的是坡子街的一家老店——鱼头用的是胖头鱼，肉质嫩滑；剁椒是店家自己腌的，鲜辣不呛。鱼头上的肉蘸着汤汁吃，辣得恰到好处，米饭直接干掉了两碗。\n\n## 晚餐：文和友（18:00-20:00）\n\n文和友已经不只是一家餐厅，它是一个\"老长沙\"的沉浸式体验空间。六层楼高的复古街景，走进去像穿越回了八十年代。\n\n口味虾是招牌——虾的个头很大，蒜蓉口味比麻辣的更对我胃口。但说实话虾肉偏老了一点，可能今天批次的问题。\n\n## 在辣椒里悟出的人生\n\n坐在太平街吃臭豆腐的时候，旁边的老奶奶说了一句话让我记到现在：\"辣味是要品的，不是要躲的。\"\n\n长沙的美食就是这样——它的辣不是要折磨你，是要你在冒汗和吸气的间隙里，尝到食材本身的鲜。生活也一样，该辣的时候别躲，辣过之后才会觉得：原来也没那么难。\n\n> 美食地图：火宫殿（天心区坡子街）→ 太平街（步行5分钟）→ 坡子街（步行10分钟）→ 文和友（打车15分钟至海信广场）。一天预算约300-400元。建议避开节假日，排队真的很恐怖。','24小时吃遍长沙：从臭豆腐到剁椒鱼头的火辣之旅',NULL,NULL,'长沙市','{\"keywords\":[\"长沙美食\",\"探店攻略\",\"臭豆腐\",\"剁椒鱼头\",\"文和友\",\"湘菜\"]}','PUBLIC',0,0,1,'2026-07-31 16:00:00',NULL,NULL),('0c2feb36-97e4-11f1-9bd9-6018957395ba','u7','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年7月30日，苏州拙政园+留园。考察目的：研究古典园林的空间叙事手法对VR空间设计的启发。拙政园：游览3小时，测绘主要观景点12处，重点记录\"借景\"手法——北寺塔的框景、远香堂的对景。留园：游览2小时，重点记录\"步移景异\"的动线设计——每走几步就有新的构图出现。拍摄VR360参考素材86组。天气：阴有小雨，反而增加了园林的意境。',NULL,NULL,NULL,'苏州拙政园/留园','{\"image\": \"/api/placeholder/snap-0c2feb36-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"阴雨\", \"activity\": \"建筑考察\", \"keywords\": [\"苏州园林\", \"拙政园\", \"留园\", \"空间设计\", \"建筑考察\"], \"companion\": \"独自\"}','PRIVATE',0,0,0,'2026-07-30 11:00:00',NULL,NULL),('0c2febee-97e4-11f1-9bd9-6018957395ba','u7','NOTE',NULL,'DIARY','0c2feb36-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'在拙政园的远香堂坐了一个小时，看雨滴落在荷叶上，滚一圈又滑进池塘。\n\n做了十年建筑设计，第一次真正理解了\"移步换景\"不是设计手法，是一种世界观。造园的人相信，美不是一下子全部给你的，而是让你一步步发现。每扇窗是一个取景框，每个拐角是一个新的开始。\n\n这让我想到做VR空间设计——好的VR体验也不应该一下子把所有东西都给你，而应该让你在移动中发现。古典园林里，藏着最好的UX设计。','拙政园教会我的事：美是让你一步步发现的',NULL,NULL,'苏州拙政园','{\"keywords\":[\"园林\",\"空间哲学\",\"建筑\",\"VR设计\",\"借景\"],\"mood\":\"calm\",\"weather\":\"rainy\",\"insight\":\"古典园林里，藏着最好的UX设计。\",\"style\":\"诗意散文风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,3,'2026-07-30 12:00:00',NULL,NULL),('0c2fec71-97e4-11f1-9bd9-6018957395ba','u7','JOURNEY',NULL,'TRAVELOGUE','0c2febee-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 在苏州园林里，我找到了VR设计的终极答案\n\n## 一个建筑师为什么要去园林？\n\n苏州园林我来了不止一次。但这次不一样——我是带着VR眼镜来的。我想知道，五百年前的造园师和今天的VR设计师，是不是在解决同一个问题：如何在有限的空间里，创造无限的体验？\n\n## 拙政园：空间的魔术\n\n拙政园占地约52亩，不算特别大，但走进去会觉得它有无穷无尽的空间。为什么？\n\n因为造园师用了三个\"魔术\"：\n\n**第一，借景。**从远香堂看出去，北寺塔刚好被框在一扇花窗里——但北寺塔其实在园子外面一公里处。造园师把远处的塔\"借\"了进来，成为园中的一景。这在VR里就是\"环境贴图\"和\"远景层次感\"。\n\n**第二，遮挡。**拙政园没有一条路是直的。每走几步就有假山、廊桥、树木挡住视线，然后绕过障碍，新的画面突然展开。这在VR里就是\"渐进式加载\"——不要一次性展示所有内容，让用户自己探索。\n\n**第三，框景。**园中几乎每一扇窗都是一个\"画框\"，窗外的景色被精心构图。这在VR里就是\"引导线\"和\"焦点设计\"。\n\n## 留园：步步生景\n\n留园比拙政园小，但\"步移景异\"的手法用得更极致。从入口到主厅，短短50米的路，我走了40分钟——因为每走三五步，空间就变一个样。\n\n最妙的是\"冠云峰\"——一块太湖石，从不同角度看，形态完全不同。正面看像一位老者，侧面看像一座山峰。造园师没有告诉你\"应该怎么看\"，而是让你自己发现。\n\n## 园林给VR的启示\n\n回来的路上我一直在想：VR空间设计和园林设计，本质上都是\"体验设计\"。目标不是堆砌内容，而是引导用户在一个有限的空间里，产生\"无限\"的感觉。\n\n五百年前的匠人没有VR眼镜，但他们比我们更懂什么是\"沉浸式体验\"。\n\n> 游览建议：拙政园建议上午9点前入园避开人流，留园建议下午去光线更佳。两园相距约3公里，可步行+公交。建议请导游或者租讲解器，否则很多设计细节会错过。','五百年了，苏州园林依然是沉浸式体验的最好教科书',NULL,NULL,'苏州拙政园/留园','{\"keywords\":[\"苏州园林\",\"建筑考察\",\"VR空间设计\",\"借景\",\"沉浸式体验\"],\"sourceSnapIds\":[\"0c2feb36-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c2febee-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合建筑考察日志和园林感悟日记，写一篇从VR设计师视角解读苏州园林的游记\",\"style\":\"诗意散文风\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-07-30 13:00:00',NULL,NULL),('0c3679f1-97e4-11f1-9bd9-6018957395ba','u8','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年7月29日，三亚蜈支洲岛。潜水日志：第一潜9:30，潜点\"情人桥\"，水深18米，水温27°C，能见度15米，潜水时间42分钟。第二潜11:45，潜点\"珊瑚花园\"，水深22米，水温26°C，能见度12米，潜水时间38分钟。观察到：鹿角珊瑚群、小丑鱼、海龟1只、鳐鱼2条。水下VR拍摄设备：防水壳+Insta360 X4，共拍摄水下VR素材32分钟。',NULL,NULL,NULL,'三亚蜈支洲岛','{\"image\": \"/api/placeholder/snap-0c3679f1-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"weather\": \"晴\", \"activity\": \"潜水\", \"keywords\": [\"潜水\", \"蜈支洲岛\", \"珊瑚\", \"水下摄影\", \"VR\"], \"visibility\": \"15米\", \"water_temp\": \"27°C\"}','PRIVATE',0,0,0,'2026-07-29 10:00:00',NULL,NULL),('0c367af7-97e4-11f1-9bd9-6018957395ba','u8','NOTE',NULL,'DIARY','0c3679f1-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'水下20米的世界是安静的。除了一呼一吸的气泡声，什么都没有。\n\n那只海龟从珊瑚礁后面游出来的时候，我们在水中对视了几秒。它的眼神很平静，像是在说：\"你又来了啊。\"\n\n每次潜入海里，我都觉得陆地上的那些焦虑和烦恼变得很轻。不是消失了，而是——当你在一个比足球场还大的珊瑚礁面前，你会意识到自己多渺小，而世界多大。\n\n这是大海每次给我的礼物：放小自己，烦恼就小了。','海龟看了我一眼，然后慢悠悠地游走了',NULL,NULL,'三亚蜈支洲岛','{\"keywords\":[\"潜水\",\"海龟\",\"宁静\",\"大海\",\"渺小\"],\"mood\":\"calm\",\"weather\":\"sunny\",\"insight\":\"放小自己，烦恼就小了。\",\"style\":\"温柔治愈风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-07-29 11:00:00',NULL,NULL),('0c367b7e-97e4-11f1-9bd9-6018957395ba','u8','JOURNEY',NULL,'TRAVELOGUE','0c367af7-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 潜入蜈支洲岛：在20米深的海底，我找到了真正的宁静\n\n## 为什么是蜈支洲岛？\n\n海南不缺潜水点，但蜈支洲岛是公认的\"中国最佳潜水地\"之一。这里水质清澈，珊瑚保育良好，最重要的是——海洋生物种类非常多。对于水下VR拍摄来说，丰富的前景和生动的海洋生物是绝佳素材。\n\n## 第一潜：情人桥（9:30-10:12）\n\n入水的那一刻，27°C的海水包裹全身，所有噪音瞬间消失。下潜到约15米的时候，第一片鹿角珊瑚群出现了——密密麻麻的珊瑚枝像一片水下森林，小丑鱼在枝丫间钻进钻出。\n\nVR相机在水下的表现出乎意料地好。防水壳没有影响拼接画质，360度的画面里，珊瑚、鱼群、从海面透下来的光束同时被记录下来。\n\n## 第二潜：珊瑚花园（11:45-12:23）\n\n这是我最喜欢的潜点。一片巨大的珊瑚礁从海底拔地而起，上面覆盖着各种颜色的软珊瑚和海葵。\n\n在水下待了大约20分钟后，一只海龟出现了。它从珊瑚礁后面慢悠悠地游出来，看了我一眼，然后朝着更深的海域游去。我用VR相机拍下了这个瞬间——虽然可能距离有点远，但那个画面太珍贵了。\n\n后来又看到两条鳐鱼，贴着海底滑行，姿态优雅得不像话。\n\n## 大海教我的事\n\n在水下的时候，你不能说话，不能刷手机，不能想今天还有什么任务没完成。你只能呼吸，只能看，只能存在于那一刻。\n\n这种\"被迫的专注\"，是陆地上永远体验不到的。\n\n> 潜水攻略：①蜈支洲岛潜水需提前一天预约；②初学者可以选择体验潜水（6-8米），不需潜水证；③水下拍摄建议使用红色滤镜矫正色差；④最佳潜水季节：4-10月，水温适宜能见度高；⑤注意保护珊瑚，不要触碰海洋生物。','蔚蓝之下：蜈支洲岛潜水日记',NULL,NULL,'三亚蜈支洲岛','{\"keywords\":[\"潜水攻略\",\"蜈支洲岛\",\"水下VR\",\"珊瑚礁\",\"海龟\"],\"sourceSnapIds\":[\"0c3679f1-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c367af7-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合潜水技术日志和海底感悟日记，写一篇蜈支洲岛潜水游记，包含潜水攻略和海洋保护意识\",\"style\":\"温柔治愈风\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-07-29 12:00:00',NULL,NULL),('0c3a5279-97e4-11f1-9bd9-6018957395ba','u9','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年7月28日，西安秦始皇兵马俑博物馆。参观路线：一号坑→三号坑→二号坑→文物陈列厅。一号坑：东西长230米，宽62米，约有6000个陶俑，已修复约1000余件。重点观察了兵俑的面部细节——每个俑的面部表情和发髻都不同，印证了\"千人千面\"的说法。拍摄VR近景素材重点：铠甲纹理、发髻结构、排列阵型。三号坑较小但有指挥车，二号坑有彩色陶俑遗迹。',NULL,NULL,NULL,'秦始皇兵马俑博物馆','{\"image\": \"/api/placeholder/snap-0c3a5279-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"activity\": \"历史考察\", \"keywords\": [\"兵马俑\", \"秦朝\", \"考古\", \"千人千面\", \"历史\"], \"companion\": \"独自\"}','PRIVATE',0,0,2,'2026-07-28 12:00:00',NULL,NULL),('0c3a5378-97e4-11f1-9bd9-6018957395ba','u9','NOTE',NULL,'DIARY','0c3a5279-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'站在一号坑前，看着那排列整齐的陶俑军队，两千多年的时间好像一下子被抹掉了。\n\n我盯着其中一个兵俑的脸看了很久——他的眉毛微微上挑，嘴唇紧闭，表情严肃但年轻。两千多年前，有一个真实的工匠，用他的手捏出了这张脸。他不知道这张脸会在两千年后被无数人注视。\n\n他可能只是一个普通的工匠，但他的作品比他活得更久。这让我想到：我们做的每一件认真的事，也许都会在某个遥远的未来，被某个素未谋面的人看见。','两千年前的工匠，比我们想象的更懂\"永恒\"',NULL,NULL,'秦始皇兵马俑博物馆','{\"keywords\":[\"兵马俑\",\"工匠\",\"永恒\",\"历史\",\"传承\"],\"mood\":\"calm\",\"weather\":\"cloudy\",\"insight\":\"我们做的每一件认真的事，也许都会在某个遥远的未来被看见。\",\"style\":\"诗意散文风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-07-28 13:00:00',NULL,NULL),('0c3a5400-97e4-11f1-9bd9-6018957395ba','u9','JOURNEY',NULL,'TRAVELOGUE','0c3a5378-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 兵马俑：两千年前的\"千人千面\"，今天依然震撼\n\n## 序\n\n做了十五年历史教师，教过无数次\"秦朝的兵马俑\"，但每次真正站在它们面前，还是会觉得课本上的描述太苍白了。\n\n这一次，我带上了VR相机，想用360度的方式，把那种\"被六千个陶俑注视\"的感觉记录下来。\n\n## 一号坑：帝国的面孔\n\n一号坑是最大的一个，也是最先被发现的。东西长230米，宽62米——比两个足球场还大。站在看台上往下看，六千个陶俑列队站立，气势之恢弘让人本能地屏住了呼吸。\n\n但最震撼的不是\"多\"，而是——**每个俑的面部都不一样。**\n\n我用VR相机的近景模式拍了几组兵俑面部的照片。有的眉头紧锁，有的嘴角微扬，有的眼神坚毅，有的表情温和。这不仅仅是\"千人千面\"——这是两千年前的工匠，对每一个生命个体的尊重。\n\n他们没有把这些士兵当成\"炮灰\"，而是给每一张脸都赋予了独一无二的尊严。\n\n## 二号坑：色彩的遗憾\n\n二号坑最有名的是彩色陶俑。刚出土的时候，陶俑身上还保留着两千年前的彩绘——红色、绿色、紫色、蓝色。但接触空气后，颜料在几分钟内氧化褪色。\n\n讲解员说：\"我们现在的技术还不够好，所以很多区域暂停了挖掘——宁愿让它们多睡几年，也不要因为我们的心急，毁掉两千年的颜色。\"\n\n这句话让我很感动。保护历史，有时候需要的不是技术，而是克制。\n\n## 三号坑：指挥部的秘密\n\n三号坑最小，但最有意思——它是整个军队的指挥部。坑中有一辆指挥车，周围站着手持武器的警卫。考古学家由此推断：这支陶俑军队不仅有士兵，还有完整的指挥体系。\n\n## 工匠与永恒\n\n走出博物馆的时候，我一直在想一个问题：那些制作兵马俑的工匠，他们知道自己做的东西会留存两千年吗？\n\n大概率不知道。他们可能只是在做一份\"工作\"——认真捏好每一张脸，刻好每一片甲片。但他们做出来的东西，比任何一个帝王的功绩碑都活得长久。\n\n这大概就是\"永恒\"的真正含义：不是刻意追求不朽，而是把眼前的事做好，好到时间也不忍心带走。\n\n> 游览攻略：①旺季（3-11月）门票120元，建议提前在公众号预约；②强烈建议请官方讲解员（150元/次），没有讲解会错过90%的细节；③参观顺序：一号坑→三号坑→二号坑→陈列厅；④VR拍摄建议使用中长焦镜头拍面部特写，广角拍全景阵列；⑤游览时间建议预留3-4小时。','站在兵马俑前，我看到了两千年前的\"工匠精神\"',NULL,NULL,'秦始皇兵马俑博物馆','{\"keywords\":[\"兵马俑\",\"秦朝\",\"工匠精神\",\"历史旅行\",\"西安\"],\"sourceSnapIds\":[\"0c3a5279-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c3a5378-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合历史考察日志和个人感悟日记，写一篇兵马俑深度游记，包含历史文化解读和游览建议\",\"style\":\"诗意散文风\",\"aiGenerated\":true}','PUBLIC',0,0,1,'2026-07-28 14:00:00','2026-08-16 12:52:17',NULL),('0c3e51da-97e4-11f1-9bd9-6018957395ba','u10','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'2026年7月27日，亚布力滑雪场（夏季旱雪道）。训练内容：高级道技巧练习——大回转+小回转+急停。天气：晴，28°C。训练时间3小时。使用装备：Atomic Redster S9滑雪板+Atomic Hawx Ultra 130雪鞋。VR拍摄：头盔GoPro Max拍摄第一视角VR素材共45分钟，完整记录了高级道全程。滑行数据：最高时速72km/h，共完成12趟。',NULL,NULL,NULL,'亚布力滑雪场','{\"image\": \"/api/placeholder/snap-0c3e51da-97e4-11f1-9bd9-6018957395ba?type=landscape\", \"speed\": \"72km/h\", \"weather\": \"晴\", \"activity\": \"滑雪训练\", \"keywords\": [\"滑雪\", \"亚布力\", \"高级道\", \"训练\", \"VR第一视角\"], \"companion\": \"独自\"}','PRIVATE',0,0,0,'2026-07-27 09:00:00',NULL,NULL),('0c3e5290-97e4-11f1-9bd9-6018957395ba','u10','NOTE',NULL,'DIARY','0c3e51da-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'今天在高级道冲下来的时候，速度到了72。风在耳边呼啸，整个世界只剩下我和雪道。\n\n有人说滑雪是\"白色鸦片\"——上瘾。但对我来说，上瘾的不是速度本身，是在高速中必须保持的那种\"绝对的专注\"。生活中很少有这样的时刻：你必须百分之百地活在当下，因为一秒钟的分神就可能摔出去。\n\n这种专注，让我从所有的压力和焦虑中解脱出来。在雪道上，我不需要想任何事——只需要感受风和重力，还有自己呼吸的节奏。','时速72公里的自由：滑雪教我的绝对专注',NULL,NULL,'亚布力滑雪场','{\"keywords\":[\"滑雪\",\"速度\",\"专注\",\"自由\",\"极限运动\"],\"mood\":\"excited\",\"weather\":\"sunny\",\"insight\":\"在雪道上，我不需要想任何事——只需要感受风和重力。\",\"style\":\"轻松口语风\",\"status\":\"public\",\"aiGenerated\":true}','PUBLIC',0,0,0,'2026-07-27 10:00:00',NULL,NULL),('0c3e5314-97e4-11f1-9bd9-6018957395ba','u10','JOURNEY',NULL,'TRAVELOGUE','0c3e5290-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 在亚布力追逐速度：一个滑雪爱好者的72km/h日记\n\n## 夏天也能滑雪？\n\n很多人以为滑雪只是冬天的运动，其实亚布力有全国最好的旱雪道——一种特殊材料模拟雪地滑行感觉，夏天也能训练。\n\n## 训练日记\n\n今天的目标是高级道大回转+小回转组合练习。\n\n热身两趟之后正式开始。第一趟大回转——从山顶出发，身体压低，膝盖弯曲，雪板切过弯道的感觉干脆利落。头盔上的GoPro Max在拍第一视角VR，画面应该很有沉浸感——希望看的人能感受到那种\"人在画中\"的速度感。\n\n第五趟挑战了全速。从山顶直冲而下，最高时速到了72公里。在这个速度上，你的视野会变窄，只剩下前方的雪道和自己的呼吸声。是一种非常奇妙的体验——不是恐惧，是一种\"被清空\"的感觉。\n\n## 为什么我热爱滑雪\n\n有人问过我：\"摔了不疼吗？\"\n\n当然疼。但每一次摔跤之后站起来继续滑，那种\"我还能行\"的感觉，比摔倒本身强烈一百倍。\n\n滑雪和生活很像——重要的不是你摔倒了几次，而是你有没有从雪地上爬起来，说一句\"再来一趟\"。\n\n> 滑雪攻略：①亚布力滑雪场距哈尔滨约3小时车程；②初学者建议请教练，2小时约400元，比医院便宜；③夏季旱雪道同样适合训练，人还少；④VR第一视角拍摄建议使用头盔固定支架，画面更稳定；⑤必备装备：头盔（必须戴！）、护膝、护臀、滑雪镜。','夏天在亚布力滑雪是一种什么体验？',NULL,NULL,'亚布力滑雪场','{\"keywords\":[\"亚布力\",\"滑雪攻略\",\"旱雪\",\"VR第一视角\",\"极限运动\"],\"sourceSnapIds\":[\"0c3e51da-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaries\":[\"0c3e5290-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"结合滑雪训练日志和运动感悟日记，写一篇亚布力滑雪游记，包含夏季滑雪攻略和极限运动感悟\",\"style\":\"轻松口语风\",\"aiGenerated\":true}','PUBLIC',0,0,0,'2026-07-27 11:00:00',NULL,NULL),('2aeb247d-105e-4bb8-bae2-90ab0dcf39dc','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-2aeb247d-105e-4bb8-bae2-90ab0dcf39dc?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:52',NULL,NULL),('2c98c6a3-611f-4a06-ae5b-ee5d9e9c4e6e','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787566230830',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-2c98c6a3-611f-4a06-ae5b-ee5d9e9c4e6e?type=landscape\"}','PUBLIC',0,0,103,'2026-08-24 10:10:31',NULL,NULL),('2d85df5c-773b-4241-9a40-f6a5677c0a6d','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-2d85df5c-773b-4241-9a40-f6a5677c0a6d?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:51',NULL,NULL),('71dfc500-8b42-4e97-92c1-8569e3064eba','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787567572273',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-71dfc500-8b42-4e97-92c1-8569e3064eba?type=landscape\"}','PUBLIC',0,0,92,'2026-08-24 10:32:52',NULL,NULL),('83773003-ea8b-45ff-8d91-d77e67b2719c','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'测试图片',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-83773003-ea8b-45ff-8d91-d77e67b2719c?type=landscape\"}','PRIVATE',0,0,1,'2026-08-27 10:26:34',NULL,NULL),('855cd173-9cd3-46e1-be6e-d52232534845','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787566902394',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-855cd173-9cd3-46e1-be6e-d52232534845?type=landscape\"}','PUBLIC',0,0,97,'2026-08-24 10:21:43',NULL,NULL),('9617defc-02e2-4ba5-9920-0d43edc24ea3','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-9617defc-02e2-4ba5-9920-0d43edc24ea3?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:50',NULL,NULL),('a245f057-d789-4e13-b023-4e92d602079f','u2','JOURNEY',NULL,'TRAVELOGUE','0c162e57-97e4-11f1-9bd9-6018957395ba',NULL,NULL,'# 漓江边的十五小时：与光同行的等待\n\n> 一个人在漓江边从漆黑等到漆黑，用15个小时的坚守，换一场日升月落的光影独白。\n\n目的地：阳朔兴坪镇 · 出行方式：未知 · 人均：未知 · 主题：摄影、独处、自然光影\n\n## Day 1｜阳朔兴坪镇漓江边（2026-08-04）\n\n凌晨四点半的兴坪镇还沉在墨色的梦里，我独自踩着露水走到漓江边，架好Insta360 X4时，天幕仍缀着几粒疏星。空气里浮着湿热的水汽，江面静得像一块未打磨的玄玉。5点12分，东方的天际线开始有了动静，先是极淡的蟹壳青，随后晨雾如薄纱从江心缓缓升起，喀斯特的山峦剪影在金色光线里一层层显影，像古老的画卷徐徐展开。我按下快门，听见自己和江水一同呼吸。这漓江边的一块礁石成了我的禅座，从蓝调时刻到烈日当空，再到晚霞把群山染成鎏金，我守着取景框里的每一帧变幻，直到19点30分最后一缕暮光隐入山脊。整整十五个小时，三块电池耗尽电量，十四组延时素材安静地躺在储存卡里，像被驯服的光影标本。气温34°C，湿度高得能把衣服拧出水来，可我竟不觉得煎熬——当一个人真正沉浸在等待中，时间便不再是敌人。\n其实真正让我动容的，不是那张完美的日出照片，而是日出前那二十分钟——天空从深蓝渐变为浅紫，再被橘红浸染，整个过程安静得只听得见快门声和水流声。那种美不张扬，却让人眼眶发热。我忽然明白，摄影教会我的从来不是如何构图、如何调参数，而是如何等待。光不会因我着急就提前亮起，云不会因我渴望就停留片刻，万事万物都有自己的节律，我唯一能做的，就是把自己安放在这里，让时间流淌过我的镜头。傍晚收工时整理素材，三千多张照片里可能最终只会留下十张，但这份看似“浪费”的奢侈，却让我感到前所未有的富足。独处的这十五个小时里，我听到江水反复吟唱古老歌谣，看到白鹭从薄雾中掠过，也看见自己的内心从焦躁走向澄明。原来独处不是孤独，而是与自己最温柔的相处。\n\n**推荐亮点**：漓江日出观景位（兴坪镇段），兴坪古镇黄昏漫步\n\n**实用贴士**：户外拍摄需备足电池和饮用水，注意防暑降温；清晨江边湿滑，建议穿防滑鞋。\n\n## 旅行贴士\n\n拍摄日出日落需提前踩点并预留充足时间；夏季漓江边湿热，建议携带防暑药品；延时摄影请备足存储卡和电池；若想独享安静，不妨选择工作日前往；拍摄间隙记得抬头看看实景，别让取景框框住了旅行的意义。\n\n## 写在最后\n\n当我在夜色中收拾器材准备离开时，江面已恢复了凌晨的墨色，仿佛这一天的光影盛宴从未发生。可我明白，那些被记录的光已经长进我的身体里。漓江教会我的，不是如何抓住美，而是如何诚实地等待美。这十五个小时的独处，像一场无声的修行，让我在快门的嗒嗒声中，找到了内心最安稳的节拍。下一次当城市的喧嚣让我喘不过气时，我会记得，在阳朔的某个江边，曾有一个人用整整一天的光阴，只为等待一场完美的日落。\n\n---\n*本文由 AI 辅助生成，素材来源于个人日志和日记。*','漓江边的十五小时：与光同行的等待',NULL,NULL,'阳朔兴坪镇','{\"sourceSnapIds\":[\"0c162849-97e4-11f1-9bd9-6018957395ba\"],\"sourceDiaryIds\":[\"0c162e57-97e4-11f1-9bd9-6018957395ba\"],\"prompt\":\"???????\",\"style\":\"??\",\"tone\":\"??\",\"keywords\":[\"漓江\",\"延时摄影\",\"日出\",\"日落\",\"喀斯特\",\"等待\",\"摄影哲学\",\"独处\",\"光影\"],\"aiGenerated\":true}','PRIVATE',0,0,0,'2026-09-09 08:47:22',NULL,NULL),('a27b8537-ab1e-4d30-84f6-352381758489','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787565683991',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-a27b8537-ab1e-4d30-84f6-352381758489?type=landscape\"}','PUBLIC',0,0,102,'2026-08-24 10:01:24',NULL,NULL),('b40cecbe-9d18-4fb7-85d5-255183e22924','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-b40cecbe-9d18-4fb7-85d5-255183e22924?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:51',NULL,NULL),('baa998cb-3dd7-490a-a03a-b706aceccdf8','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787564470567',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-baa998cb-3dd7-490a-a03a-b706aceccdf8?type=landscape\"}','PUBLIC',0,0,99,'2026-08-24 09:41:11',NULL,NULL),('c02c5cda-9bd3-43e3-853b-9fc3889e0dc4','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-c02c5cda-9bd3-43e3-853b-9fc3889e0dc4?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:51',NULL,NULL),('d49d8d81-1808-4e07-962a-ed95e6983a1c','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-d49d8d81-1808-4e07-962a-ed95e6983a1c?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:50',NULL,NULL),('eb5b041e-a432-4d46-96fb-85881c578c34','u6','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-eb5b041e-a432-4d46-96fb-85881c578c34?type=landscape\"}','PRIVATE',0,0,1,'2026-08-24 09:20:50',NULL,NULL),('fd1dde95-f2a4-479b-9bde-f8be2ba6871c','u2','NOTE',NULL,'SNAPSHOT',NULL,NULL,NULL,'E2E 测试帖子内容 1787565067409',NULL,NULL,NULL,NULL,'{\"image\": \"/api/placeholder/snap-fd1dde95-f2a4-479b-9bde-f8be2ba6871c?type=landscape\"}','PUBLIC',0,0,100,'2026-08-24 09:51:08',NULL,NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendation_feedback`
--

DROP TABLE IF EXISTS `recommendation_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendation_feedback` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` enum('COMMUNITY','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('NOT_INTERESTED','INTERESTED','CLICK','VIEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_feedback_unique` (`user_id`,`target_id`,`target_type`),
  KEY `idx_feedback_user` (`user_id`),
  KEY `idx_feedback_target` (`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendation_feedback`
--

LOCK TABLES `recommendation_feedback` WRITE;
/*!40000 ALTER TABLE `recommendation_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendation_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','RESOLVED','DISMISSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `resolved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_report_status` (`status`),
  KEY `idx_report_post` (`post_id`),
  KEY `fk_report_reporter` (`reporter_id`),
  KEY `fk_report_resolver` (`resolved_by`),
  CONSTRAINT `fk_report_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_details`
--

DROP TABLE IF EXISTS `route_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联帖子ID',
  `distance_km` decimal(10,2) DEFAULT NULL COMMENT '距离（公里）',
  `duration_minutes` int DEFAULT NULL COMMENT '时长（分钟）',
  `elevation_gain_m` int DEFAULT NULL COMMENT '累计爬升（米）',
  `difficulty` enum('EASY','MODERATE','HARD','EXPERT') COLLATE utf8mb4_unicode_ci DEFAULT 'MODERATE' COMMENT '难度等级',
  `route_type` enum('HIKE','BIKE','DRIVE','PADDLE','CLIMB') COLLATE utf8mb4_unicode_ci DEFAULT 'HIKE' COMMENT '路线类型',
  `gpx_data` text COLLATE utf8mb4_unicode_ci COMMENT 'GPX轨迹文件内容',
  `waypoints` json DEFAULT NULL COMMENT '途经点JSON数组[{lat,lng,name,description}]',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_route_post` (`post_id`),
  CONSTRAINT `fk_route_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_details`
--

LOCK TABLES `route_details` WRITE;
/*!40000 ALTER TABLE `route_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `post_count` int NOT NULL DEFAULT '0',
  `is_hot` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_topic_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES ('topic-001','东京自由行','🗼','东京旅行攻略、美食、购物、文化体验分享',NULL,0,1,'2026-08-04 12:00:34'),('topic-002','云南之旅','🌸','昆明大理丽江香格里拉，彩云之南的旅行记忆',NULL,0,1,'2026-08-04 12:00:34'),('topic-003','VR拍摄技巧','📷','VR全景拍摄、360视频制作经验分享',NULL,2,1,'2026-08-04 12:00:34'),('topic-004','周末露营','⛺','城市周边露营地推荐、露营装备、露营美食',NULL,0,1,'2026-08-04 12:00:34'),('topic-005','古镇探秘','🏘️','中国古镇古村落探访，感受历史沉淀',NULL,2,1,'2026-08-04 12:00:34'),('topic-006','海岛度假','🏖️','海岛旅行、潜水、沙滩、日落',NULL,1,0,'2026-08-04 12:00:34'),('topic-007','徒步挑战','🥾','户外徒步路线、装备、经验分享',NULL,3,1,'2026-08-04 12:00:34'),('topic-008','美食地图','🍜','各地美食探店、特色小吃、餐厅推荐',NULL,1,1,'2026-08-04 12:00:34');
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_community_interactions`
--

DROP TABLE IF EXISTS `user_community_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_community_interactions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` enum('VIEW','LIKE','COMMENT','SHARE','JOIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` int NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uci_user` (`user_id`),
  KEY `idx_uci_community` (`community_id`),
  KEY `idx_uci_user_community` (`user_id`,`community_id`),
  KEY `idx_uci_action` (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_community_interactions`
--

LOCK TABLES `user_community_interactions` WRITE;
/*!40000 ALTER TABLE `user_community_interactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_community_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_follows`
--

DROP TABLE IF EXISTS `user_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_follows` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `follower_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `following_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_follow_unique` (`follower_id`,`following_id`),
  KEY `idx_follow_follower` (`follower_id`),
  KEY `idx_follow_following` (`following_id`),
  CONSTRAINT `fk_follow_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follow_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_follows`
--

LOCK TABLES `user_follows` WRITE;
/*!40000 ALTER TABLE `user_follows` DISABLE KEYS */;
INSERT INTO `user_follows` VALUES ('f1','u1','u2','2026-08-04 12:00:34'),('f10','u6','u1','2026-08-04 12:00:34'),('f11','u7','u1','2026-08-04 12:00:34'),('f12','u8','u1','2026-08-04 12:00:34'),('f13','u9','u1','2026-08-04 12:00:34'),('f14','u10','u1','2026-08-04 12:00:34'),('f15','u2','u3','2026-08-04 12:00:34'),('f16','u3','u2','2026-08-04 12:00:34'),('f17','u4','u5','2026-08-04 12:00:34'),('f18','u5','u4','2026-08-04 12:00:34'),('f19','u6','u7','2026-08-04 12:00:34'),('f2','u1','u3','2026-08-04 12:00:34'),('f20','u7','u6','2026-08-04 12:00:34'),('f21','u8','u9','2026-08-04 12:00:34'),('f22','u9','u8','2026-08-04 12:00:34'),('f23','u10','u2','2026-08-04 12:00:34'),('f24','u2','u10','2026-08-04 12:00:34'),('f25','u3','u5','2026-08-04 12:00:34'),('f26','u4','u6','2026-08-04 12:00:34'),('f27','u5','u7','2026-08-04 12:00:34'),('f28','u6','u8','2026-08-04 12:00:34'),('f29','u7','u9','2026-08-04 12:00:34'),('f3','u2','u1','2026-08-04 12:00:34'),('f30','u8','u10','2026-08-04 12:00:34'),('f4','u3','u1','2026-08-04 12:00:34'),('f5','u4','u1','2026-08-04 12:00:34'),('f6','u2','u4','2026-08-04 12:00:34'),('f7','u1','u5','2026-08-04 12:00:34'),('f8','u1','u6','2026-08-04 12:00:34'),('f9','u5','u1','2026-08-04 12:00:34');
/*!40000 ALTER TABLE `user_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_interests`
--

DROP TABLE IF EXISTS `user_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_interests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_tag_unique` (`user_id`,`tag_id`),
  KEY `idx_ui_user` (`user_id`),
  KEY `idx_ui_tag` (`tag_id`),
  CONSTRAINT `fk_ui_tag` FOREIGN KEY (`tag_id`) REFERENCES `interest_tags` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ui_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_interests`
--

LOCK TABLES `user_interests` WRITE;
/*!40000 ALTER TABLE `user_interests` DISABLE KEYS */;
INSERT INTO `user_interests` VALUES ('ui1','u1','tag-001','2026-08-04 12:00:34'),('ui10','u2','tag-001','2026-08-04 12:00:34'),('ui11','u3','tag-014','2026-08-04 12:00:34'),('ui12','u3','tag-009','2026-08-04 12:00:34'),('ui13','u3','tag-013','2026-08-04 12:00:34'),('ui14','u4','tag-001','2026-08-04 12:00:34'),('ui15','u4','tag-003','2026-08-04 12:00:34'),('ui16','u4','tag-021','2026-08-04 12:00:34'),('ui17','u4','tag-015','2026-08-04 12:00:34'),('ui18','u5','tag-007','2026-08-04 12:00:34'),('ui19','u5','tag-015','2026-08-04 12:00:34'),('ui2','u1','tag-002','2026-08-04 12:00:34'),('ui20','u5','tag-018','2026-08-04 12:00:34'),('ui21','u5','tag-001','2026-08-04 12:00:34'),('ui22','u6','tag-021','2026-08-04 12:00:34'),('ui23','u6','tag-003','2026-08-04 12:00:34'),('ui24','u6','tag-008','2026-08-04 12:00:34'),('ui25','u7','tag-003','2026-08-04 12:00:34'),('ui26','u7','tag-002','2026-08-04 12:00:34'),('ui27','u7','tag-024','2026-08-04 12:00:34'),('ui28','u8','tag-019','2026-08-04 12:00:34'),('ui29','u8','tag-005','2026-08-04 12:00:34'),('ui3','u1','tag-003','2026-08-04 12:00:34'),('ui30','u8','tag-020','2026-08-04 12:00:34'),('ui31','u9','tag-002','2026-08-04 12:00:34'),('ui32','u9','tag-024','2026-08-04 12:00:34'),('ui33','u9','tag-022','2026-08-04 12:00:34'),('ui34','u9','tag-023','2026-08-04 12:00:34'),('ui35','u10','tag-007','2026-08-04 12:00:34'),('ui36','u10','tag-015','2026-08-04 12:00:34'),('ui37','u10','tag-016','2026-08-04 12:00:34'),('ui4','u1','tag-009','2026-08-04 12:00:34'),('ui5','u1','tag-010','2026-08-04 12:00:34'),('ui6','u1','tag-020','2026-08-04 12:00:34'),('ui7','u2','tag-009','2026-08-04 12:00:34'),('ui8','u2','tag-010','2026-08-04 12:00:34'),('ui9','u2','tag-011','2026-08-04 12:00:34');
/*!40000 ALTER TABLE `user_interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `xxk_number` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '徐霞客号，11位随机数字',
  `role` enum('USER','MODERATOR','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER' COMMENT '角色',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER','PRIVATE') COLLATE utf8mb4_unicode_ci DEFAULT 'PRIVATE' COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地区',
  `occupation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '职业',
  `vr_device_model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vr_device_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','BANNED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  UNIQUE KEY `idx_users_username` (`username`),
  UNIQUE KEY `idx_users_xxk_number` (`xxk_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('u1','xuxiake@example.com','xuxiake','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','徐霞客','10000000001','ADMIN',NULL,'带着VR眼镜看世界 🌍 记录每一段旅程','https://api.dicebear.com/9.x/avataaars/svg?seed=xuxiake','https://xuxiake.com','MALE','1990-03-15','江苏','旅行博主','Apple Vision Pro','2.0','ACTIVE','2026-08-04 12:00:34',NULL),('u10','qianyi@example.com','qianyi','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','钱一','10000000010','USER',NULL,'滑雪爱好者 ⛷️ 冬天在雪山上','https://api.dicebear.com/9.x/avataaars/svg?seed=qianyi',NULL,'MALE','1994-02-14','黑龙江','体育教练','Apple Vision Pro','2.0','ACTIVE','2026-08-04 12:00:34',NULL),('u2','zhangshan@example.com','zhangshan','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','张三','10000000002','USER',NULL,'VR摄影师 | 旅行爱好者','https://api.dicebear.com/9.x/avataaars/svg?seed=zhangshan',NULL,'MALE','1992-07-22','北京','摄影师','Insta360 X4','3.1','ACTIVE','2026-08-04 12:00:34',NULL),('u3','lisi@example.com','lisi','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','李四','10000000003','MODERATOR',NULL,'科技评测 | VR内容创作者','https://api.dicebear.com/9.x/avataaars/svg?seed=lisi','https://techblog.example.com','MALE','1988-11-05','广东','科技博主','Meta Quest 3','v67','ACTIVE','2026-08-04 12:00:34',NULL),('u4','wangwu@example.com','wangwu','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','王五','10000000004','USER',NULL,'环球旅行者 🌏 用VR记录世界','https://api.dicebear.com/9.x/avataaars/svg?seed=wangwu',NULL,'MALE','1995-01-30','四川','自由职业','Apple Vision Pro','2.0','ACTIVE','2026-08-04 12:00:34',NULL),('u5','zhaoliu@example.com','zhaoliu','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','赵六','10000000005','USER',NULL,'户外探险家 | 登山爱好者 🏔️','https://api.dicebear.com/9.x/avataaars/svg?seed=zhaoliu',NULL,'MALE','1985-09-12','云南','户外教练','GoPro Max','2.0','ACTIVE','2026-08-04 12:00:34',NULL),('u6','sunqi@example.com','sunqi','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','孙七','10000000006','USER',NULL,'美食旅行家 🍜 用味蕾丈量世界','http://localhost:3001/uploads/avatars/3773f6aa-fc31-4fd7-8192-07e4171bd989.png?v=1787824842175',NULL,'FEMALE','1993-05-18','湖南','美食博主',NULL,NULL,'ACTIVE','2026-08-04 12:00:34','2026-08-27 10:00:42'),('u7','zhouba@example.com','zhouba','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','周八','10000000007','USER',NULL,'建筑设计师 | 城市漫步者 🏛️','https://api.dicebear.com/9.x/avataaars/svg?seed=zhouba','https://arch-design.com','FEMALE','1991-12-08','上海','建筑师','Samsung Gear VR','3.0','ACTIVE','2026-08-04 12:00:34',NULL),('u8','wujiu@example.com','wujiu','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','吴九','10000000008','USER',NULL,'潜水教练 🤿 探索海底世界','https://api.dicebear.com/9.x/avataaars/svg?seed=wujiu',NULL,'MALE','1987-04-25','海南','潜水教练','Insta360 X4','3.1','ACTIVE','2026-08-04 12:00:34',NULL),('u9','zhengshi@example.com','zhengshi','$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe','郑十','10000000009','USER',NULL,'历史教师 | 文化遗产守护者 📜','https://api.dicebear.com/9.x/avataaars/svg?seed=zhengshi',NULL,'FEMALE','1986-08-03','陕西','历史教师',NULL,NULL,'ACTIVE','2026-08-04 12:00:34',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_comments`
--

DROP TABLE IF EXISTS `video_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_offset` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT '视频时间位置',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vc_post` (`post_id`),
  KEY `idx_vc_post_time` (`post_id`,`time_offset`),
  KEY `fk_vc_user` (`user_id`),
  CONSTRAINT `fk_vc_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_comments`
--

LOCK TABLES `video_comments` WRITE;
/*!40000 ALTER TABLE `video_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-11 13:23:30
