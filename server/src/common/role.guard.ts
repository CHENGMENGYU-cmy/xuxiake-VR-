import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';

export const ROLES_KEY = 'roles';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const auth = request.headers?.authorization || '';
    const token = auth.replace('Bearer ', '');
    if (!token) throw new ForbiddenException('需要登录');

    try {
      const jwtService = (global as any).__jwtService;
      const payload = jwtService?.verify(token);
      const userId = payload?.sub;
      if (!userId) throw new ForbiddenException('Token无效');

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user || !requiredRoles.includes(user.role)) {
        throw new ForbiddenException('权限不足');
      }
      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Token无效');
    }
  }
}
