import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的页面
const protectedPaths = [
  '/feed',
  '/explore',
  '/upload',
  '/messages',
  '/notifications',
  '/settings',
  '/profile',
  '/post',
  '/search',
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // 首页直接跳转到登录页
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 已登录用户访问登录/注册页面时，重定向到 feed
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // 受保护页面 - 未登录时跳转到登录页
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/feed/:path*',
    '/explore/:path*',
    '/upload/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/post/:path*',
    '/search/:path*',
    '/login',
    '/register',
  ],
};
