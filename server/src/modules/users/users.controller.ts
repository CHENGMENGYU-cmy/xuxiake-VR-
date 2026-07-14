import { Controller, Get, Post, Put, Delete, Param, Headers, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { JwtService } from '@nestjs/jwt';

@Controller('api/users')
export class UsersController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    private readonly jwtService: JwtService,
  ) {}

  private getUserId(auth?: string): string | null {
    const token = auth?.replace('Bearer ', '') || null;
    if (!token) return null;
    try {
      return this.jwtService.verify(token).sub;
    } catch {
      return null;
    }
  }

  @Get('profile')
  async getProfile(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');

    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');
    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  @Get(':username/followers')
  async getFollowers(@Param('username') username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const follows = await this.followRepo.find({ where: { followingId: user.id } });
    const followerIds = follows.map((f) => f.followerId);
    const followers = followerIds.length
      ? await this.userRepo.findBy({ id: In(followerIds) })
      : [];

    return {
      success: true,
      data: followers.map((u) => {
        const { passwordHash, ...uDto } = u;
        return uDto;
      }),
      total: followers.length,
    };
  }

  @Get(':username/following')
  async getFollowing(@Param('username') username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const follows = await this.followRepo.find({ where: { followerId: user.id } });
    const followingIds = follows.map((f) => f.followingId);
    const following = followingIds.length
      ? await this.userRepo.findBy({ id: In(followingIds) })
      : [];

    return {
      success: true,
      data: following.map((u) => {
        const { passwordHash, ...uDto } = u;
        return uDto;
      }),
      total: following.length,
    };
  }

  @Put('profile')
  async updateProfile(
    @Headers('authorization') auth: string,
    @Body() body: { displayName?: string; bio?: string; website?: string; avatarUrl?: string; gender?: string; birthday?: string; region?: string; occupation?: string },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');

    if (body.displayName !== undefined) user.displayName = body.displayName;
    if (body.bio !== undefined) user.bio = body.bio;
    if (body.website !== undefined) user.website = body.website;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
    if (body.gender !== undefined) user.gender = body.gender;
    if (body.birthday !== undefined) user.birthday = body.birthday;
    if (body.region !== undefined) user.region = body.region;
    if (body.occupation !== undefined) user.occupation = body.occupation;
    user.updatedAt = new Date();

    await this.userRepo.save(user);

    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  @Post(':id/follow')
  async followUser(@Headers('authorization') auth: string, @Param('id') targetId: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    if (userId === targetId) throw new NotFoundException('不能关注自己');

    const existing = await this.followRepo.findOne({
      where: { followerId: userId, followingId: targetId },
    });
    if (!existing) {
      const follow = this.followRepo.create({ id: uuidv4(), followerId: userId, followingId: targetId });
      await this.followRepo.save(follow);
    }
    return { success: true, message: '关注成功' };
  }

  @Delete(':id/follow')
  async unfollowUser(@Headers('authorization') auth: string, @Param('id') targetId: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    await this.followRepo.delete({ followerId: userId, followingId: targetId });
    return { success: true, message: '已取消关注' };
  }

  @Get('suggested/list')
  async getSuggestedUsers(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);

    // 推荐用户：排除自己，取最新的几个
    const query = this.userRepo.createQueryBuilder('user');
    if (userId) {
      query.where('user.id != :userId', { userId });
    }
    query.orderBy('user.created_at', 'DESC').limit(5);

    const users = await query.getMany();

    // 如果登录了，获取已关注状态
    let followingIds: string[] = [];
    if (userId && users.length > 0) {
      const follows = await this.followRepo.find({
        where: { followerId: userId, followingId: In(users.map((u) => u.id)) },
      });
      followingIds = follows.map((f) => f.followingId);
    }

    return {
      success: true,
      data: users.map((u) => {
        const { passwordHash, ...uDto } = u;
        return {
          ...uDto,
          isFollowing: followingIds.includes(u.id),
          vrDeviceInfo: u.vrDeviceModel
            ? { model: u.vrDeviceModel, version: u.vrDeviceVersion || '' }
            : null,
        };
      }),
    };
  }
}
