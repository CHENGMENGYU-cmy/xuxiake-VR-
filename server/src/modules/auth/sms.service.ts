import { Injectable, BadRequestException } from '@nestjs/common';

interface SmsCodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class SmsService {
  // 内存存储验证码，生产环境建议使用Redis
  private codeStore = new Map<string, SmsCodeEntry>();

  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRE_MS = 5 * 60 * 1000; // 5分钟过期
  private readonly MAX_ATTEMPTS = 5; // 最大验证尝试次数

  // 生成验证码
  generateCode(): string {
    return Array.from({ length: this.CODE_LENGTH }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
  }

  // 发送短信验证码
  async sendCode(phone: string): Promise<void> {
    // 检查是否频繁发送（60秒内不能重复发送）
    const existing = this.codeStore.get(phone);
    if (existing && existing.expiresAt > Date.now() + (this.CODE_EXPIRE_MS - 60000)) {
      throw new BadRequestException('验证码已发送，请稍后再试');
    }

    const code = this.generateCode();

    // 存储验证码
    this.codeStore.set(phone, {
      code,
      expiresAt: Date.now() + this.CODE_EXPIRE_MS,
      attempts: 0,
    });

    // TODO: 调用实际的短信服务API发送验证码
    // 这里暂时使用console.log模拟
    console.log(`[SMS] 向 ${phone} 发送验证码: ${code}`);

    // 生产环境示例：
    // await this.httpService.post('https://api.sms-provider.com/send', {
    //   phone,
    //   templateId: 'login_code',
    //   params: { code },
    // });
  }

  // 验证验证码
  verify(phone: string, code: string): boolean {
    const entry = this.codeStore.get(phone);

    if (!entry) {
      throw new BadRequestException('请先获取验证码');
    }

    if (entry.expiresAt < Date.now()) {
      this.codeStore.delete(phone);
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.codeStore.delete(phone);
      throw new BadRequestException('验证码尝试次数过多，请重新获取');
    }

    // 增加尝试次数
    entry.attempts++;

    if (entry.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功，删除验证码
    this.codeStore.delete(phone);
    return true;
  }

  // 清理过期验证码（可定期调用）
  cleanup(): void {
    const now = Date.now();
    for (const [phone, entry] of this.codeStore.entries()) {
      if (entry.expiresAt < now) {
        this.codeStore.delete(phone);
      }
    }
  }
}