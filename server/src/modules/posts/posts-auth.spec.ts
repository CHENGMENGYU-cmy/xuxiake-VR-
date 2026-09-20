import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';
import { PostsController } from './posts.controller.js';

jest.mock('uuid', () => ({ v4: () => 'test-id' }));

describe('Posts account-state boundary', () => {
  const jwt = new JwtService({ secret: 'posts-auth-test-secret' });
  let users: { findOne: jest.Mock };
  let posts: { publishPost: jest.Mock; createPost: jest.Mock; getPosts: jest.Mock };
  let ai: { getJobStatus: jest.Mock };
  let controller: PostsController;
  beforeEach(() => {
    users = { findOne: jest.fn().mockResolvedValue({ id: 'u1', status: 'ACTIVE' }) };
    posts = { publishPost: jest.fn().mockResolvedValue({ id: 'p1' }), createPost: jest.fn(), getPosts: jest.fn().mockResolvedValue({ data: [] }) };
    ai = { getJobStatus: jest.fn() };
    const auth = new AuthService(users as any, jwt, {} as any, {} as any);
    controller = new PostsController(posts as any, {} as any, auth, ai as any, {} as any, users as any, {} as any, {} as any);
  });
  const header = (tokenType = 'access') => `Bearer ${jwt.sign({ sub: 'u1', tokenType })}`;
  it.each(['BANNED', 'DEACTIVATED'])('blocks an existing token after the account becomes %s', async status => {
    users.findOne.mockResolvedValue({ id: 'u1', status });
    await expect(controller.publishPost(header(), 'p1', { communityId: 'com1', visibility: 'PUBLIC' })).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(controller.createPost(header(), { content: 'blocked' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(posts.publishPost).not.toHaveBeenCalled();
    expect(posts.createPost).not.toHaveBeenCalled();
  });
  it('rejects deleted accounts and refresh tokens before publication', async () => {
    users.findOne.mockResolvedValue(null);
    await expect(controller.publishPost(header(), 'p1', {})).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(controller.publishPost(header('refresh'), 'p1', {})).rejects.toBeInstanceOf(UnauthorizedException);
    expect(posts.publishPost).not.toHaveBeenCalled();
  });
  it('permits active users to publish', async () => {
    await controller.publishPost(header(), 'p1', { communityId: 'com1' });
    expect(posts.publishPost).toHaveBeenCalledWith('u1', 'p1', { communityId: 'com1' });
  });
  it('falls back to public browsing when an optional token belongs to an inactive user', async () => {
    users.findOne.mockResolvedValue({ id: 'u1', status: 'DEACTIVATED' });
    await controller.getPosts(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, header());
    expect(posts.getPosts).toHaveBeenCalledWith(expect.objectContaining({ currentUserId: undefined }));
  });
  it('requires the job owner to read AI diary task status', async () => {
    ai.getJobStatus.mockReturnValue({ id: 'j1', userId: 'u2', status: 'DONE', progress: 100 });
    await expect(controller.getJobStatus(header(), 'j1')).rejects.toBeInstanceOf(NotFoundException);
    users.findOne.mockResolvedValue(null);
    await expect(controller.getJobStatus(header(), 'j1')).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('requires the job owner to read AI travelogue task status', async () => {
    ai.getJobStatus.mockReturnValue({ id: 'j1', userId: 'u2', status: 'DONE', progress: 100 });
    await expect(controller.getTravelogueJobStatus(header(), 'j1')).rejects.toBeInstanceOf(NotFoundException);
    ai.getJobStatus.mockReturnValue({ id: 'j1', userId: 'u1', status: 'DONE', progress: 100 });
    await expect(controller.getTravelogueJobStatus(header(), 'j1')).resolves.toEqual({
      success: true,
      data: { id: 'j1', userId: 'u1', status: 'DONE', progress: 100 },
    });
  });
});
