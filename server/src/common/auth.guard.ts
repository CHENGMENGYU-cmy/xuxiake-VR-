import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { getTokenSubject } from './auth-token.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '') || null;
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }
    const userId = getTokenSubject(this.jwtService, token, 'access');
    if (!userId) {
      throw new UnauthorizedException('Token 已过期或无效');
    }
    (request as any).userId = userId;
    return true;
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '') || null;
    if (token) {
      const userId = getTokenSubject(this.jwtService, token, 'access');
      if (userId) (request as any).userId = userId;
    }
    return true;
  }
}
