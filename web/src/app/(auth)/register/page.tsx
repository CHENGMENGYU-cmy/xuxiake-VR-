'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Check, Smartphone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

// 注册方式类型
type RegisterMethod = 'email' | 'phone';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('email');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [smsLoading, setSmsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    email?: string;
    phone?: string;
    smsCode?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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

    if (!username.trim()) {
      errors.username = '请输入用户名';
    } else if (username.trim().length < 2) {
      errors.username = '用户名至少需要2个字符';
    } else if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) {
      errors.username = '用户名只能包含中文、英文、数字和下划线';
    }

    if (registerMethod === 'email') {
      if (!email.trim()) {
        errors.email = '请输入邮箱地址';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = '请输入有效的邮箱地址';
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

    if (!password) {
      errors.password = '请输入密码';
    } else if (password.length < 6) {
      errors.password = '密码长度至少6位';
    }

    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      if (registerMethod === 'email') {
        await register(email, username, password);
      } else {
        // 手机号注册
        await apiClient.post('/auth/register-phone', { phone, smsCode, username, password });
      }
      router.push('/feed');
    } catch {
      // 错误已在 store 中设置
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">注册徐霞客系统</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 注册方式切换 */}
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={registerMethod === 'email' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { setRegisterMethod('email'); setValidationErrors({}); }}
          >
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            邮箱注册
          </Button>
          <Button
            type="button"
            variant={registerMethod === 'phone' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => { setRegisterMethod('phone'); setValidationErrors({}); }}
          >
            <Smartphone className="mr-1.5 h-3.5 w-3.5" />
            手机号注册
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

          {/* 用户名 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="你的用户名"
                className={`pl-10 ${validationErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (validationErrors.username) setValidationErrors((prev) => ({ ...prev, username: undefined }));
                }}
              />
            </div>
            {validationErrors.username && (
              <p className="text-xs text-destructive">{validationErrors.username}</p>
            )}
          </div>

          {registerMethod === 'email' ? (
            /* 邮箱 */
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className={`pl-10 ${validationErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>
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

          {/* 密码 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="设置密码（至少6位）"
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

          {/* 确认密码 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">确认密码</label>
            <div className="relative">
              <Check className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="再次输入密码"
                className={`pl-10 ${validationErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword)
                    setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-xs text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              '注册'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          已有账号？{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            立即登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}