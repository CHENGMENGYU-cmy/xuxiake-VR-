'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const errors: { email?: string; username?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      errors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!username.trim()) {
      errors.username = '请输入用户名';
    } else if (username.trim().length < 2) {
      errors.username = '用户名至少需要2个字符';
    } else if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) {
      errors.username = '用户名只能包含中文、英文、数字和下划线';
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
      await register(email, username, password);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 全局错误 */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
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
                className={`pl-10 ${validationErrors.username ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
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

          {/* 邮箱 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                className={`pl-10 ${validationErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
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

          {/* 密码 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="设置密码（至少3位）"
                className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
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
                className={`pl-10 ${validationErrors.confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
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

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            立即登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
