import { ServiceUnavailableException } from '@nestjs/common';
import { SmsService } from './sms.service.js';

describe('SMS release boundary', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevSms = process.env.ALLOW_DEV_SMS;
  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalDevSms === undefined) delete process.env.ALLOW_DEV_SMS;
    else process.env.ALLOW_DEV_SMS = originalDevSms;
    jest.restoreAllMocks();
  });
  it('rejects sending and verification by default without logging a code', async () => {
    delete process.env.ALLOW_DEV_SMS;
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const sms = new SmsService();
    await expect(sms.sendCode('13800000000')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(() => sms.verify('13800000000', '123456')).toThrow(ServiceUnavailableException);
    expect(log).not.toHaveBeenCalled();
  });
  it('rejects the development override in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEV_SMS = 'true';
    const sms = new SmsService();
    await expect(sms.sendCode('13800000000')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(() => sms.verify('13800000000', '123456')).toThrow(ServiceUnavailableException);
  });
  it('allows explicit development simulation with single-use codes', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEV_SMS = 'true';
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const sms = new SmsService();
    jest.spyOn(sms, 'generateCode').mockReturnValue('123456');
    await sms.sendCode('13800000000');
    expect(sms.verify('13800000000', '123456')).toBe(true);
    expect(() => sms.verify('13800000000', '123456')).toThrow('请先获取验证码');
  });
});
