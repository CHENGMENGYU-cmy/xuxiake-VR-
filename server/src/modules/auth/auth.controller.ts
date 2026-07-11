import { Controller, Post, Get, Body, Headers, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CaptchaService } from './captcha.service.js';
import { SmsService } from './sms.service.js';
import { JwtAuthGuard } from '../../common/auth.guard.js';
import type { LoginDto, LoginSmsDto, RegisterDto, RegisterPhoneDto, SendSmsCodeDto, ChangePasswordDto } from '../../common/interfaces.js';
import type { Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly smsService: SmsService,
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

  // 注册（邮箱）
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { success: true, data: result };
  }

  // 发送短信验证码
  @Post('send-sms-code')
  async sendSmsCode(@Body() dto: SendSmsCodeDto) {
    await this.smsService.sendCode(dto.phone);
    return { success: true, message: '验证码已发送' };
  }

  // 手机号验证码登录
  @Post('login-sms')
  async loginBySms(@Body() dto: LoginSmsDto) {
    const result = await this.authService.loginBySms(dto);
    return { success: true, data: result };
  }

  // 手机号注册
  @Post('register-phone')
  async registerByPhone(@Body() dto: RegisterPhoneDto) {
    const result = await this.authService.registerByPhone(dto);
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

  // 修改密码
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException('请先登录');
    return this.authService.changePassword(userId, dto);
  }

  @Post('logout')
  async logout() {
    return { success: true, message: '已退出登录' };
  }
}
