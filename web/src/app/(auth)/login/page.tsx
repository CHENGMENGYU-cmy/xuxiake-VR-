'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Loader2, AlertCircle, Eye, EyeOff, RefreshCw, Shield, Smartphone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

// 登录方式类型
type LoginMethod = 'account' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('account');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // 手机号验证码相关
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [smsLoading, setSmsLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    account?: string;
    password?: string;
    captchaCode?: string;
    phone?: string;
    smsCode?: string;
  }>({});

  // 获取图形验证码
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const { data } = await apiClient.get('/auth/captcha');
      setCaptchaSvg(data.data.svg);
      setCaptchaKey(data.data.key);
      setCaptchaCode('');
      if (validationErrors.captchaCode) {
        setValidationErrors((prev) => ({ ...prev, captchaCode: undefined }));
      }
    } catch {
      // 忽略
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loginMethod === 'account') {
      fetchCaptcha();
    }
  }, [loginMethod, fetchCaptcha]);

  // 发送短信验证码
  const handleSendSmsCode = async () => {
    if (!phone.trim()) {
      setValidationErrors((prev) => ({ ...prev, phone: '请输入手机号' }));
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setValidationErrors((prev) => ({ ...prev, phone: '请输入有效的手机号' }));
      return;
    }

    setSmsLoading(true);
    try {
      await apiClient.post('/auth/send-sms-code', { phone });
      setSmsCountdown(60);
      const timer = setInterval(() => {
        setSmsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // 忽略
    } finally {
      setSmsLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (loginMethod === 'account') {
      if (!account.trim()) {
        errors.account = '请输入邮箱或用户名';
      }
      if (!password) {
        errors.password = '请输入密码';
      } else if (password.length < 6) {
        errors.password = '密码长度至少6位';
      }
      if (!captchaCode.trim()) {
        errors.captchaCode = '请输入验证码';
      }
    } else {
      if (!phone.trim()) {
        errors.phone = '请输入手机号';
      } else if (!/^1[3-9]\d{9}$/.test(phone)) {
        errors.phone = '请输入有效的手机号';
      }
      if (!smsCode.trim()) {
        errors.smsCode = '请输入验证码';
      } else if (smsCode.length !== 6) {
        errors.smsCode = '验证码为6位数字';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      if (loginMethod === 'account') {
        await login(account, password, captchaKey, captchaCode);
      } else {
        // 手机号验证码登录
        await apiClient.post('/auth/login-sms', { phone, smsCode });
      }
      router.push('/feed');
    } catch {
      if (loginMethod === 'account') {
        fetchCaptcha();
      }
    }
  };

  const captchaImageSrc = captchaSvg
    ? `data:image/svg+xml,${encodeURIComponent(captchaSvg)}`
    : '';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">登录徐霞客系统</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 登录方式切换 */}
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={loginMethod === 'account' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { setLoginMethod('account'); setValidationErrors({}); }}
          >
            <User className="mr-1.5 h-3.5 w-3.5" />
            邮箱/用户名
          </Button>
          <Button
            type="button"
            variant={loginMethod === 'phone' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { setLoginMethod('phone'); setValidationErrors({}); }}
          >
            <Smartphone className="mr-1.5 h-3.5 w-3.5" />
            手机号登录
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 全局错误 */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loginMethod === 'account' ? (
            <>
              {/* 邮箱或用户名 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">邮箱或用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="输入邮箱或用户名"
                    className={`pl-10 ${validationErrors.account ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    value={account}
                    onChange={(e) => {
                      setAccount(e.target.value);
                      if (validationErrors.account) setValidationErrors((prev) => ({ ...prev, account: undefined }));
                    }}
                  />
                </div>
                {validationErrors.account && (
                  <p className="text-xs text-destructive">{validationErrors.account}</p>
                )}
              </div>

              {/* 密码 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="输入密码"
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-destructive">{validationErrors.password}</p>
                )}
              </div>

              {/* 图形验证码 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">验证码</label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="请输入4位验证码"
                      className={`h-11 pl-10 ${validationErrors.captchaCode ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={captchaCode}
                      onChange={(e) => {
                        setCaptchaCode(e.target.value);
                        if (validationErrors.captchaCode) setValidationErrors((prev) => ({ ...prev, captchaCode: undefined }));
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="group relative flex-shrink-0 overflow-hidden rounded-lg border-2 border-border bg-muted transition-colors hover:border-primary hover:bg-primary/5"
                    onClick={fetchCaptcha}
                    title="看不清？点击刷新"
                  >
                    {captchaLoading ? (
                      <div className="flex h-11 w-[140px] items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : captchaImageSrc ? (
                      <>
                        <img src={captchaImageSrc} alt="验证码" className="block h-11 w-[140px]" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <RefreshCw className="h-5 w-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-11 w-[140px] items-center justify-center text-muted-foreground">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                </div>
                {validationErrors.captchaCode && (
                  <p className="text-xs text-destructive">{validationErrors.captchaCode}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 手机号 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">手机号</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="请输入手机号"
                    className={`pl-10 ${validationErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-destructive">{validationErrors.phone}</p>
                )}
              </div>

              {/* 短信验证码 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">验证码</label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="请输入6位验证码"
                      className={`h-11 pl-10 ${validationErrors.smsCode ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={smsCode}
                      onChange={(e) => {
                        setSmsCode(e.target.value);
                        if (validationErrors.smsCode) setValidationErrors((prev) => ({ ...prev, smsCode: undefined }));
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-shrink-0 px-4"
                    disabled={smsCountdown > 0 || smsLoading}
                    onClick={handleSendSmsCode}
                  >
                    {smsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : smsCountdown > 0 ? (
                      `${smsCountdown}s`
                    ) : (
                      '获取验证码'
                    )}
                  </Button>
                </div>
                {validationErrors.smsCode && (
                  <p className="text-xs text-destructive">{validationErrors.smsCode}</p>
                )}
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>

          {/* 第三方登录 */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">其他登录方式</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            {/* 微信登录 */}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07C160] text-white transition-transform hover:scale-110 hover:shadow-lg"
              onClick={() => {
                // TODO: 实现微信登录
                console.log('微信登录');
              }}
              title="微信登录"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.329 6.329 0 0 1-.253-1.786c0-3.54 3.29-6.41 7.34-6.41.343 0 .674.033 1.009.062C17.07 4.588 13.3 2.188 8.691 2.188zm-2.6 4.17a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24zm5.19 0a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24zM16.59 9.59c-3.49 0-6.32 2.42-6.32 5.41 0 2.99 2.83 5.41 6.32 5.41a7.46 7.46 0 0 0 2.19-.32.65.65 0 0 1 .54.07l1.44.84a.24.24 0 0 0 .12.04.21.21 0 0 0 .21-.21c0-.05-.02-.1-.03-.15l-.29-1.12a.44.44 0 0 1 .16-.5c1.38-1.02 2.26-2.5 2.26-4.16 0-2.99-2.83-5.41-6.32-5.41zm-2.08 3.3a.84.84 0 1 1 0 1.68.84.84 0 0 1 0-1.68zm4.16 0a.84.84 0 1 1 0 1.68.84.84 0 0 1 0-1.68z" />
              </svg>
            </button>

            {/* 支付宝登录 */}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1677FF] text-white transition-transform hover:scale-110 hover:shadow-lg"
              onClick={() => {
                // TODO: 实现支付宝登录
                console.log('支付宝登录');
              }}
              title="支付宝登录"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.422 15.358c-3.32-1.272-6.022-2.954-6.022-2.954s.908-2.368 1.224-4.554H14.08V6.16h4.056V5.09h-4.056V3.158H12.28V5.09H8.224v1.07h4.056v1.69H9.48v1.07h7.968c-.256 1.496-.848 3.104-.848 3.104s-3.064-1.328-5.744-1.328c-2.68 0-4.12 1.568-4.12 3.44 0 2.2 1.84 3.6 4.2 3.6 2.76 0 4.88-1.68 6.64-3.68.88 1.04 2.48 2.48 4.2 3.68l1.64-1.04c-1.68-1.16-3.04-2.52-3.04-2.52s1.56-.48 3.04-1.2zM9.28 14.25c-1.48 0-2.44-.84-2.44-2.04 0-1.08.8-2.04 2.52-2.04 1.52 0 3.28.72 4.88 1.8-1.48 1.28-3.36 2.28-4.96 2.28zM24 12c0 6.624-5.376 12-12 12S0 18.624 0 12 5.376 0 12 0s12 5.376 12 12zm-3.2 0c0-4.848-3.952-8.8-8.8-8.8S3.2 7.152 3.2 12s3.952 8.8 8.8 8.8 8.8-3.952 8.8-8.8z" />
              </svg>
            </button>
          </div>

        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          还没有账号？{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}