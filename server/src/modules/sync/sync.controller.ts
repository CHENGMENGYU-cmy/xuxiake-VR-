import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SyncService, type SyncSnapshotsInput } from './sync.service.js';

@Controller('api/sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly jwtService: JwtService,
  ) {}

  private getUserId(auth?: string): string {
    const token = auth?.replace('Bearer ', '') || null;
    if (!token) throw new UnauthorizedException('请先登录');
    try {
      return this.jwtService.verify(token).sub;
    } catch {
      throw new UnauthorizedException('Token 已过期或无效');
    }
  }

  /** 同步闪拍数据 */
  @Post('snapshots')
  async syncSnapshots(@Headers('authorization') auth: string, @Body() body: SyncSnapshotsInput) {
    const userId = this.getUserId(auth);
    const data = await this.syncService.syncSnapshots(userId, body || {});
    return { success: true, data };
  }
}
