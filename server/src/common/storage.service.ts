import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';

export interface UploadResult {
  url: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

@Injectable()
export class StorageService {
  private readonly storageType: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.storageType = config.get('STORAGE_TYPE', 'local');
    this.baseUrl = config.get('STORAGE_BASE_URL', '/uploads');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = ['avatars', 'images', 'videos', 'audio', 'thumbnails'].map(d =>
      join(process.cwd(), 'uploads', d),
    );
    for (const dir of dirs) {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  /** 生成存储路径 */
  private makePath(category: string, filename: string): string {
    return join(process.cwd(), 'uploads', category, filename);
  }

  /** 保存文件（本地存储） */
  async saveFile(
    buffer: Buffer,
    category: string,
    originalName: string,
    mimeType?: string,
  ): Promise<UploadResult> {
    const ext = extname(originalName) || (mimeType ? `.${mimeType.split('/')[1]}` : '');
    const filename = `${uuidv4()}${ext}`;
    const filePath = this.makePath(category, filename);

    await pipeline(
      require('stream').Readable.from(buffer),
      createWriteStream(filePath),
    );

    return {
      url: `${this.baseUrl}/${category}/${filename}`,
      originalName,
      size: buffer.length,
    };
  }

  /** 获取文件内容 */
  getFilePath(url: string): string | null {
    const path = url.replace(this.baseUrl, '');
    const fullPath = join(process.cwd(), path);
    return existsSync(fullPath) ? fullPath : null;
  }

  /** 生成预签名上传URL */
  getPresignedUrl(userId: string, fileName: string, fileType: string, mediaType: string) {
    const uploadId = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    const key = `${userId}/${date}/${uploadId}-${fileName}`;

    if (this.storageType === 'oss' || this.storageType === 'cos') {
      // 云存储预签名 — 需要配置对应SDK，返回真实的预签名URL
      const region = this.config.get('OSS_REGION', '');
      const bucket = this.config.get('OSS_BUCKET', '');
      const endpoint = this.config.get('OSS_ENDPOINT', '');
      return {
        uploadId,
        uploadUrl: `https://${bucket}.${endpoint}/${key}`,
        publicUrl: `https://${bucket}.${endpoint}/${key}`,
      };
    }

    // 本地存储 — 返回本地上传地址
    return {
      uploadId,
      uploadUrl: `${this.baseUrl}/${mediaType}s/${uploadId}${extname(fileName)}`,
      publicUrl: `${this.baseUrl}/${mediaType}s/${uploadId}${extname(fileName)}`,
    };
  }

  /** 删除文件 */
  async deleteFile(url: string): Promise<void> {
    const { unlink } = require('fs/promises');
    const fullPath = this.getFilePath(url);
    if (fullPath) {
      try { await unlink(fullPath); } catch {}
    }
  }
}
