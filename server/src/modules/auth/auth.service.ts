import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity.js';
import { LoginDto, LoginSmsDto, RegisterDto, RegisterPhoneDto, ChangePasswordDto, TokenPair } from '../../common/interfaces.js';
import { CaptchaService } from './captcha.service.js';
import { SmsService } from './sms.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly smsService: SmsService,
  ) {}

  private generateXxkNumber(): string {
    // 生成11位随机数字，第一位不为0
    const first = Math.floor(Math.random() * 9) + 1;
    const rest = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    return first + rest;
  }

  private generateTokens(userId: string): TokenPair {
    const payload = { sub: userId };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  // 登录（支持邮箱或用户名 + 密码 + 图形验证码）
  async login(dto: LoginDto) {
    // 1. 先校验图形验证码
    if (!dto.captchaKey || !dto.captchaCode) {
      throw new BadRequestException('请输入图形验证码');
    }
    if (!this.captchaService.validate(dto.captchaKey, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 2. 按邮箱或用户名查找用户
    const user = await this.userRepo.findOne({
      where: [{ email: dto.account }, { username: dto.account }],
    });
    if (!user) {
      throw new UnauthorizedException('账号不存在');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('该账号未设置密码，请使用验证码登录');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('密码错误');
    }

    const tokens = this.generateTokens(user.id);
    const { passwordHash, ...userDto } = user;
    return {
      user: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' } : null,
      },
      tokens,
    };
  }

  // 注册
  async register(dto: RegisterDto) {
    if (!/[a-zA-Z]/.test(dto.password) || !/[0-9]/.test(dto.password)) {
      throw new BadRequestException('密码必须同时包含字母和数字');
    }

    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      if (existing.email === dto.email) throw new ConflictException('该邮箱已被注册');
      throw new ConflictException('该用户名已被使用');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 生成唯一的徐霞客号
    let xxkNumber: string;
    let exists: boolean;
    do {
      xxkNumber = this.generateXxkNumber();
      exists = !!(await this.userRepo.findOne({ where: { xxkNumber } }));
    } while (exists);

    const user = this.userRepo.create({
      id: uuidv4(),
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName || dto.username,
      xxkNumber,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${dto.username}`,
    });
    await this.userRepo.save(user);

    const tokens = this.generateTokens(user.id);
    const { passwordHash: _, ...userDto } = user;
    return {
      user: {
        ...userDto,
        vrDeviceInfo: null,
      },
      tokens,
    };
  }

  // 手机号验证码登录
  async loginBySms(dto: LoginSmsDto) {
    // 验证短信验证码
    this.smsService.verify(dto.phone, dto.smsCode);

    // 按手机号查找用户
    const user = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    if (!user) {
      throw new UnauthorizedException('该手机号未注册');
    }

    const tokens = this.generateTokens(user.id);
    const { passwordHash, ...userDto } = user;
    return {
      user: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' } : null,
      },
      tokens,
    };
  }

  // 手机号注册
  async registerByPhone(dto: RegisterPhoneDto) {
    // 验证短信验证码
    this.smsService.verify(dto.phone, dto.smsCode);

    // 验证密码格式
    if (!/[a-zA-Z]/.test(dto.password) || !/[0-9]/.test(dto.password)) {
      throw new BadRequestException('密码必须同时包含字母和数字');
    }

    // 检查手机号是否已注册
    const existingPhone = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('该手机号已被注册');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('该用户名已被使用');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 生成唯一的徐霞客号
    let xxkNumber: string;
    let exists: boolean;
    do {
      xxkNumber = this.generateXxkNumber();
      exists = !!(await this.userRepo.findOne({ where: { xxkNumber } }));
    } while (exists);

    const user = this.userRepo.create({
      id: uuidv4(),
      phone: dto.phone,
      email: null,
      username: dto.username,
      displayName: dto.username,
      xxkNumber,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${dto.username}`,
    });
    await this.userRepo.save(user);

    const tokens = this.generateTokens(user.id);
    const { passwordHash: _, ...userDto } = user;
    return {
      user: {
        ...userDto,
        vrDeviceInfo: null,
      },
      tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    const { passwordHash, ...userDto } = user;
    return {
      ...userDto,
      vrDeviceInfo: user.vrDeviceModel ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' } : null,
    };
  }

  // 修改密码
  async changePassword(userId: string, dto: ChangePasswordDto) {
    // 验证新密码格式
    if (!/[a-zA-Z]/.test(dto.newPassword) || !/[0-9]/.test(dto.newPassword)) {
      throw new BadRequestException('新密码必须同时包含字母和数字');
    }
    if (dto.newPassword.length < 6) {
      throw new BadRequestException('新密码长度至少6位');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('该账号未设置密码');
    }

    // 验证当前密码
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('当前密码错误');
    }

    // 检查新密码不能与当前密码相同
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    // 更新密码
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { success: true, message: '密码修改成功' };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return this.generateTokens(payload.sub);
    } catch {
      throw new UnauthorizedException('无效的 refresh token');
    }
  }

  validateAccessToken(token: string): string | null {
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      return null;
    }
  }
}
