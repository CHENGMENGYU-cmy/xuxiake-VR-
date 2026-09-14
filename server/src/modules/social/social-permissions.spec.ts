import { ForbiddenException } from '@nestjs/common';
import { SocialService } from './social.service.js';
import { SocialController } from './social.controller.js';

jest.mock('uuid', () => ({ v4: () => 'test-id' }));

describe('community permission contract', () => {
  const community = { id: 'c1', creatorId: 'owner', conversationId: 'chat1', name: 'Test' };
  let service: SocialService;
  let controller: SocialController;

  beforeEach(() => {
    service = Object.assign(Object.create(SocialService.prototype), {
      communityRepo: { findOne: jest.fn().mockResolvedValue({ ...community }), save: jest.fn() },
      partRepo: { findOne: jest.fn().mockResolvedValue({ userId: 'viewer' }) },
      roleRepo: { findOne: jest.fn().mockResolvedValue(null) },
    });
    controller = Object.assign(Object.create(SocialController.prototype), {
      communityRepo: { findOne: jest.fn().mockResolvedValue(community) },
      communityTagRepo: { find: jest.fn().mockResolvedValue([]) },
      userRepo: { findOne: jest.fn().mockResolvedValue(null), findBy: jest.fn().mockResolvedValue([]) },
      partRepo: { find: jest.fn().mockResolvedValue([]) },
      postRepo: {
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
          getCount: jest.fn().mockResolvedValue(0),
        }),
      },
      jwtService: { verify: jest.fn((token: string) => ({ sub: token, tokenType: 'access' })) },
      socialService: service,
    });
  });

  it.each([
    ['owner', null, true, true],
    ['viewer', 'ADMIN', true, true],
    ['viewer', 'MODERATOR', false, true],
    ['viewer', null, false, false],
  ])('returns effective permissions for %s / %s', async (id, role, isAdmin, isModerator) => {
    (service as any).roleRepo.findOne.mockResolvedValue(role ? { role } : null);
    const result = await controller.getCommunity(`Bearer ${id}`, 'c1');
    expect(result.data).toMatchObject({ isCreator: id === 'owner', isAdmin, isModerator });
  });

  it('does not grant management permissions to an anonymous visitor', async () => {
    const result = await controller.getCommunity('', 'c1');
    expect(result.data).toMatchObject({ isCreator: false, isAdmin: false, isModerator: false });
  });

  it('allows an administrator to edit but not dissolve or assign roles', async () => {
    (service as any).roleRepo.findOne.mockResolvedValue({ role: 'ADMIN' });
    await service.updateCommunity('c1', 'viewer', { name: 'Updated' });
    expect((service as any).communityRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated' }));
    await expect(service.dissolveCommunity('c1', 'viewer')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.assignRole('c1', 'viewer', 'target', 'ADMIN')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects settings changes by a moderator or ordinary member', async () => {
    for (const role of ['MODERATOR', null]) {
      (service as any).roleRepo.findOne.mockResolvedValue(role ? { role } : null);
      await expect(service.updateCommunity('c1', 'viewer', { name: 'Denied' })).rejects.toBeInstanceOf(ForbiddenException);
    }
    expect((service as any).communityRepo.save).not.toHaveBeenCalled();
  });
});
