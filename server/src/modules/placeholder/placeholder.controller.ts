import { Controller, Get, Param, Query, Res, Header } from '@nestjs/common';
import type { Response } from 'express';

/**
 * 动态占位图端点：根据 seed 确定性生成 SVG 渐变图。
 * 用于头像/封面/素材图在未上传真实图片时的默认占位。
 * 修改占位图风格只需改本文件。
 */
@Controller('api/placeholder')
export class PlaceholderController {
  // 预置渐变色板（按 seed 哈希取一组，保证同一 seed 颜色稳定）
  private readonly PALETTES = [
    { from: '#f97316', to: '#f43f5e' }, // 橙红
    { from: '#22c55e', to: '#14b8a6' }, // 绿青
    { from: '#3b82f6', to: '#8b5cf6' }, // 蓝紫
    { from: '#06b6d4', to: '#3b82f6' }, // 青蓝
    { from: '#a855f7', to: '#ec4899' }, // 紫粉
    { from: '#f59e0b', to: '#f97316' }, // 金橙
    { from: '#10b981', to: '#059669' }, // 翡翠
    { from: '#6366f1', to: '#a855f7' }, // 靛紫
  ];

  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private pickPalette(seed: string) {
    return this.PALETTES[this.hashSeed(seed) % this.PALETTES.length];
  }

  @Get(':seed')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'public, max-age=86400')
  async getPlaceholder(
    @Param('seed') seed: string,
    @Query('type') type: string = 'avatar',
    @Query('text') text?: string,
    @Res() res: Response,
  ) {
    const { from, to } = this.pickPalette(seed);
    const label = text || seed.charAt(0).toUpperCase();
    // 展示用的文字：优先用传入 text，否则取 seed 前 4 个字符
    const displayText = text ? text.slice(0, 8) : seed.slice(0, 8);

    let svg: string;
    if (type === 'landscape') {
      svg = this.landscapeSvg(from, to, displayText, label);
    } else {
      svg = this.avatarSvg(from, to, label);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  }

  /** 方形/圆形头像：渐变底 + 首字 */
  private avatarSvg(from: string, to: string, label: string): string {
    const safe = this.escapeXml(label);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <text x="100" y="120" font-family="system-ui,sans-serif" font-size="80" font-weight="600"
        fill="rgba(255,255,255,0.92)" text-anchor="middle" dominant-baseline="middle">${safe}</text>
</svg>`;
  }

  /** 横版风景图：渐变天空 + 山峦剪影 + 地点文字 */
  private landscapeSvg(from: string, to: string, displayText: string, label: string): string {
    const safeText = this.escapeXml(displayText);
    const safeLabel = this.escapeXml(label);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.15)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#sky)"/>
  <circle cx="620" cy="130" r="90" fill="url(#sun)"/>
  <polygon points="0,450 0,320 140,230 260,330 400,220 540,320 660,260 800,330 800,450" fill="rgba(0,0,0,0.18)"/>
  <polygon points="0,450 0,370 180,290 320,380 470,280 620,370 800,300 800,450" fill="rgba(0,0,0,0.30)"/>
  <text x="40" y="90" font-family="system-ui,sans-serif" font-size="40" font-weight="700"
        fill="rgba(255,255,255,0.95)">${safeLabel}</text>
  <text x="40" y="135" font-family="system-ui,sans-serif" font-size="20"
        fill="rgba(255,255,255,0.85)">${safeText}</text>
</svg>`;
  }

  private escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
