import { Injectable } from '@nestjs/common';
import svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

interface CaptchaEntry {
  text: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly store = new Map<string, CaptchaEntry>();
  private readonly EXPIRE_MS = 2 * 60 * 1000; // 2 分钟有效期

  generate(): { key: string; svg: string } {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1il',
      noise: 2,
      color: true,
      background: '#f8f9fa',
    });

    const key = uuidv4();
    this.store.set(key, {
      text: captcha.text,
      expiresAt: Date.now() + this.EXPIRE_MS,
    });

    // 清理过期
    this.cleanup();

    return { key, svg: captcha.data };
  }

  validate(key: string, answer: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    // 验证后立即删除，防止重复使用
    this.store.delete(key);
    if (Date.now() > entry.expiresAt) return false;
    return entry.text === answer;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
