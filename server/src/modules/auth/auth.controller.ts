import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CaptchaService } from './captcha.service.js';
import type { LoginDto, RegisterDto } from '../../common/interfaces.js';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  // 获取图形验证码
  @Get('captcha')
  getCaptcha() {
    const { key, svg } = this.captchaService.generate();
    return { success: true, data: { key, svg } };
  }

  // 登录（邮箱/用户名 + 密码 + 图形验证码）
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { success: true, data: result };
  }

  // 注册
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { success: true, data: result };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('缺少 refresh token');
    const tokens = await this.authService.refreshToken(refreshToken);
    return { success: true, data: tokens };
  }

  @Get('me')
  async me(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    const userId = this.authService.validateAccessToken(token || '');
    if (!userId) throw new UnauthorizedException('未登录或 token 已过期');
    const user = await this.authService.getProfile(userId);
    if (!user) throw new UnauthorizedException('用户不存在');
    return { success: true, data: user };
  }

  @Post('logout')
  async logout() {
    return { success: true, message: '已退出登录' };
  }
}
