'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Loader2, AlertCircle, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    account?: string;
    password?: string;
    captchaCode?: string;
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
    fetchCaptcha();
  }, [fetchCaptcha]);

  const validate = (): boolean => {
    const errors: { account?: string; password?: string; captchaCode?: string } = {};
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
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(account, password, captchaKey, captchaCode);
      router.push('/feed');
    } catch {
      // 验证码错误时刷新验证码
      fetchCaptcha();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 全局错误 */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          还没有账号？{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            立即注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
