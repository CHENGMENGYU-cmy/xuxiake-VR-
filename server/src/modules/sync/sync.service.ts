import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';

interface FlashMoment {
  id?: string;
  capturedAt?: number;
  mediaType?: string;
  photoPath?: string;
  videoPath?: string;
  thumbnailPath?: string;
  durationMs?: number | null;
  activityCategoryId?: string;
  categorySource?: string;
  categoryLocked?: boolean;
  source?: string;
  gpsLat?: number;
  gpsLng?: number;
  locationName?: string;
  weather?: string;
  keywords?: string[];
  mood?: string;
  scene?: string;
  tripId?: string;
  tripTitle?: string;
}

interface FlashReflection {
  momentId?: string;
  recognizedText?: string;
  audioPath?: string;
  status?: string;
}

export interface SyncSnapshotsInput {
  trips?: { id?: string; title?: string; startTime?: number; endTime?: number; status?: string }[];
  moments?: FlashMoment[];
  reflections?: FlashReflection[];
  activityCategories?: { id?: string; displayName?: string; iconKey?: string; sortOrder?: number }[];
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
  ) {}

  /** 同步闪拍数据 → SNAPSHOT 帖子（幂等，按 originalId 去重） */
  async syncSnapshots(userId: string, input: SyncSnapshotsInput) {
    const { moments = [], reflections = [] } = input;

    // 建立感悟索引（按 momentId）
    const reflectionMap = new Map<string, FlashReflection>();
    for (const r of reflections) {
      if (r.momentId) reflectionMap.set(r.momentId, r);
    }

    // 查询已导入的 originalId 用于去重
    const existing = await this.postRepo.find({
      where: { authorId: userId, contentLevel: 'SNAPSHOT' },
      select: { id: true, vrMetadata: true },
    });
    const existingOriginals = new Set<string>();
    for (const p of existing) {
      try {
        const meta = p.vrMetadata ? JSON.parse(p.vrMetadata) : {};
        if (meta.originalId) existingOriginals.add(meta.originalId);
      } catch { /* ignore */ }
    }

    const result = { imported: 0, skipped: 0 };

    for (const m of moments) {
      const originalId = m.id;
      if (originalId && existingOriginals.has(originalId)) {
        result.skipped++;
        continue;
      }

      const reflection = originalId ? reflectionMap.get(originalId) : undefined;
      const content = reflection?.recognizedText || null;

      const vrMetadata: Record<string, unknown> = {
        originalId,
        source: m.source || 'GLASSES_BUTTON',
        activityCategoryId: m.activityCategoryId || 'unclassified',
        categorySource: m.categorySource || 'NONE',
        categoryLocked: m.categoryLocked || false,
      };
      if (m.weather) vrMetadata.weather = m.weather;
      if (m.mood) vrMetadata.mood = m.mood;
      if (m.scene) vrMetadata.scene = m.scene;
      if (m.keywords?.length) vrMetadata.keywords = m.keywords;

      const post = this.postRepo.create({
        id: uuidv4(),
        authorId: userId,
        postType: 'NOTE',
        contentLevel: 'SNAPSHOT',
        content,
        locationLat: m.gpsLat ?? null,
        locationLng: m.gpsLng ?? null,
        locationName: m.locationName || null,
        vrMetadata: JSON.stringify(vrMetadata),
        visibility: 'PRIVATE',
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
      });
      if (m.capturedAt) post.createdAt = new Date(m.capturedAt);
      await this.postRepo.save(post);

      // 媒体记录
      const mediaItems: MediaItem[] = [];
      let sort = 0;
      if (m.photoPath) {
        mediaItems.push(this.mediaRepo.create({
          id: uuidv4(), postId: post.id, type: 'IMAGE',
          url: m.photoPath, thumbnailUrl: m.thumbnailPath || null, sortOrder: sort++,
        }));
      }
      if (m.videoPath) {
        mediaItems.push(this.mediaRepo.create({
          id: uuidv4(), postId: post.id, type: 'VIDEO',
          url: m.videoPath, thumbnailUrl: m.thumbnailPath || null,
          duration: m.durationMs ? Math.round(m.durationMs / 1000) : null,
          sortOrder: sort++,
        }));
      }
      if (reflection?.audioPath) {
        mediaItems.push(this.mediaRepo.create({
          id: uuidv4(), postId: post.id, type: 'AUDIO',
          url: reflection.audioPath, sortOrder: sort++,
        }));
      }
      if (mediaItems.length > 0) await this.mediaRepo.save(mediaItems);

      result.imported++;
    }

    return result;
  }
}
