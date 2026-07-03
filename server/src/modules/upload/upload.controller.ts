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

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');

// Ensure avatar upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

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
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
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
}
