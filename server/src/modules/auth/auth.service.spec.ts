import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { CaptchaService } from './captcha.service.js';

jest.mock('uuid', () => ({ v4: () => 'test-id' }));

describe('AuthService token contract', () => {
  let userRepo: { findOne: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    userRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'active-user', status: 'ACTIVE' }),
    };
    service = new AuthService(
      userRepo as any,
      new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '15m' } }),
      {} as any,
      {} as any,
    );
  });

  it('keeps access and refresh tokens from being used interchangeably', async () => {
    const tokens = (service as any).generateTokens('active-user');

    expect(service.validateAccessToken(tokens.accessToken)).toBe('active-user');
    expect(service.validateAccessToken(tokens.refreshToken)).toBeNull();
    await expect(service.refreshToken(tokens.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('checks account state before refreshing or accepting an access token', async () => {
    const tokens = (service as any).generateTokens('inactive-user');

    userRepo.findOne.mockResolvedValueOnce({ id: 'inactive-user', status: 'DEACTIVATED' });
    await expect(service.refreshToken(tokens.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);

    userRepo.findOne.mockResolvedValueOnce({ id: 'inactive-user', status: 'BANNED' });
    await expect(service.requireActiveAccessToken(tokens.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('CaptchaService test-code gate', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowTestCaptcha = process.env.ALLOW_TEST_CAPTCHA;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOW_TEST_CAPTCHA = originalAllowTestCaptcha;
  });

  it('accepts the fixed test captcha only outside production by default', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOW_TEST_CAPTCHA;

    expect(new CaptchaService().validate('missing-key', 'TEST1234')).toBe(true);
  });

  it('rejects the fixed test captcha in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_TEST_CAPTCHA;

    expect(new CaptchaService().validate('missing-key', 'TEST1234')).toBe(false);
  });
});
