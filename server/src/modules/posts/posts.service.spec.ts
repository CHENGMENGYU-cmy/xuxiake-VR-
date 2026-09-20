import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service.js';

jest.mock('uuid', () => ({ v4: () => 'test-id' }));

describe('PostsService diary source boundary', () => {
  const makeService = (postRepo: Record<string, jest.Mock>, mediaRepo: Record<string, jest.Mock> = {}) =>
    new PostsService(
      postRepo as any,
      mediaRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

  it('rejects creating a diary from another account private snapshot', async () => {
    const postRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      save: jest.fn(),
    };
    const mediaRepo = { create: jest.fn(), save: jest.fn() };
    const service = makeService(postRepo, mediaRepo);

    await expect(service.saveDiary('reader-user', {
      snapId: 'author-snapshot',
      title: '越权来源验收',
      content: '只用于权限检查',
      status: 'private',
    })).rejects.toBeInstanceOf(NotFoundException);

    expect(postRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 'author-snapshot',
        authorId: 'reader-user',
        contentLevel: 'SNAPSHOT',
      }),
    }));
    expect(postRepo.create).not.toHaveBeenCalled();
    expect(postRepo.save).not.toHaveBeenCalled();
    expect(mediaRepo.save).not.toHaveBeenCalled();
  });

  it('stores the source snapshot id when creating a diary from a snapshot', async () => {
    const sourceSnap = {
      id: 'snap-1',
      authorId: 'author-user',
      contentLevel: 'SNAPSHOT',
      locationLat: 31.2,
      locationLng: 121.4,
      locationName: '测试地点',
      mediaItems: [],
      vrMetadata: '{}',
    };
    const createdPost = {
      id: 'test-id',
      authorId: 'author-user',
      contentLevel: 'DIARY',
      mediaItems: [],
    };
    const postRepo = {
      findOne: jest.fn().mockResolvedValue(sourceSnap),
      create: jest.fn().mockReturnValue(createdPost),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const mediaRepo = { create: jest.fn(), save: jest.fn() };
    const service = makeService(postRepo, mediaRepo);
    jest.spyOn(service, 'getPostById').mockResolvedValue(createdPost as any);

    await service.saveDiary('author-user', {
      snapId: 'snap-1',
      title: '来源日记',
      content: '验证来源保留',
      status: 'private',
    });

    const createArg = postRepo.create.mock.calls[0][0];
    expect(JSON.parse(createArg.vrMetadata).sourceSnapIds).toEqual(['snap-1']);
  });
});
