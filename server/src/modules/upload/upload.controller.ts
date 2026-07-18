import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const IMAGE_DIR = join(process.cwd(), 'uploads', 'images');
const VIDEO_DIR = join(process.cwd(), 'uploads', 'videos');
const AUDIO_DIR = join(process.cwd(), 'uploads', 'audio');

// Ensure upload directories exist
[AVATAR_DIR, IMAGE_DIR, VIDEO_DIR, AUDIO_DIR].forEach((dir) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

@Controller('api/upload')
export class UploadController {
  constructor(private readonly jwtService: JwtService) {}

  private getUserId(auth?: string): string {
    const token = auth?.replace('Bearer ', '') || null;
    if (!token) throw new UnauthorizedException('请先登录');
    try {
      return this.jwtService.verify(token).sub;
    } catch {
      throw new UnauthorizedException('Token 已过期或无效');
    }
  }

  @Post('presign')
  getPresignedUrl(
    @Headers('authorization') auth: string,
    @Body() body: { fileName: string; fileType: string; mediaType: string },
  ) {
    const userId = this.getUserId(auth);
    const uploadId = uuidv4();
    const key = `${userId}/${new Date().toISOString().split('T')[0]}/${uploadId}-${body.fileName}`;

    return {
      success: true,
      data: {
        uploadId,
        uploadUrl: `https://mock-storage.example.com/${key}?presigned=true`,
        publicUrl: `https://cdn.xuxiake.com/${key}`,
      },
    };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getUserId(auth);

    if (!file) {
      return { success: false, message: '请选择要上传的图片' };
    }

    const url = `/uploads/avatars/${file.filename}`;

    return {
      success: true,
      data: {
        url,
        originalName: file.originalname,
        size: file.size,
      },
    };
  }

  @Post('complete')
  completeUpload(@Headers('authorization') auth: string, @Body() body: { uploadId: string }) {
    const userId = this.getUserId(auth);
    return { success: true, message: '上传完成，正在处理中...' };
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, IMAGE_DIR),
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('仅支持 JPG、PNG、WebP 格式的图片'), false);
        }
      },
    }),
  )
  async uploadImage(
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getUserId(auth);

    if (!file) {
      return { success: false, message: '请选择要上传的图片' };
    }

    const url = `/uploads/images/${file.filename}`;

    return {
      success: true,
      data: {
        url,
        width: 0,
        height: 0,
        originalName: file.originalname,
        size: file.size,
      },
    };
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('仅支持 MP4、WebM、MOV、AVI 格式的视频'), false);
        }
      },
    }),
  )
  async uploadVideo(
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getUserId(auth);

    if (!file) {
      return { success: false, message: '请选择要上传的视频' };
    }

    const url = `/uploads/videos/${file.filename}`;

    return {
      success: true,
      data: {
        url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  }

  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, AUDIO_DIR),
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('仅支持 MP3、WAV、OGG、WebM、AAC 格式的音频'), false);
        }
      },
    }),
  )
  async uploadAudio(
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getUserId(auth);

    if (!file) {
      return { success: false, message: '请选择要上传的音频' };
    }

    const url = `/uploads/audio/${file.filename}`;

    return {
      success: true,
      data: {
        url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  }

  @Post('links/preview')
  async getLinkPreview(
    @Headers('authorization') auth: string,
    @Body() body: { url: string },
  ) {
    this.getUserId(auth);

    if (!body.url) {
      return { success: false, message: '请提供链接地址' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(body.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(timeout);

      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
      const title = ogTitleMatch?.[1] || titleMatch?.[1] || '';

      // Extract description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
      const description = ogDescMatch?.[1] || descMatch?.[1] || '';

      // Extract image
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      const image = ogImageMatch?.[1] || '';

      // Construct favicon URL
      const urlObj = new URL(body.url);
      const favicon = `${urlObj.origin}/favicon.ico`;

      return {
        success: true,
        data: {
          title: title.trim(),
          description: description.trim(),
          favicon,
          image,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '无法获取链接信息，请检查URL是否正确',
      };
    }
  }
}
