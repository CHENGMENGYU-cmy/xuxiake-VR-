import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '') || null;
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }
    try {
      const payload = this.jwtService.verify(token);
      (request as any).userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token 已过期或无效');
    }
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '') || null;
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        (request as any).userId = payload.sub;
      } catch {
        // ignore invalid token for optional auth
      }
    }
    return true;
  }
}
