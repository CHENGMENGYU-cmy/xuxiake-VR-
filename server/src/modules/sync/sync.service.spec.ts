import { SyncService } from './sync.service.js';

jest.mock('uuid', () => ({ v4: () => 'test-id' }));

describe('SyncService snapshot import boundaries', () => {
  function makeService() {
    const postRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      update: jest.fn(),
    };
    const mediaRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    return { service: new SyncService(postRepo as any, mediaRepo as any), postRepo, mediaRepo };
  }

  it('deduplicates repeated original ids inside the same batch', async () => {
    const { service, postRepo } = makeService();
    const result = await service.syncSnapshots('u1', {
      moments: [
        { id: 'same-local-id', textNote: '第一次' },
        { id: 'same-local-id', textNote: '重复' },
      ],
    });

    expect(result).toEqual({ imported: 1, skipped: 1 });
    expect(postRepo.save).toHaveBeenCalledTimes(1);
  });

  it('marks pure audio snapshots as audio instead of text', async () => {
    const { service, postRepo, mediaRepo } = makeService();
    await service.syncSnapshots('u1', {
      moments: [{ id: 'audio-local-id', mediaType: 'AUDIO' }],
      reflections: [{ momentId: 'audio-local-id', audioPath: '/uploads/audio/test.wav', recognizedText: '语音记录' }],
    });

    const savedPost = postRepo.save.mock.calls[0][0];
    expect(JSON.parse(savedPost.vrMetadata).mediaType).toBe('AUDIO');
    expect(mediaRepo.save.mock.calls[0][0][0]).toEqual(expect.objectContaining({
      type: 'AUDIO',
      url: '/uploads/audio/test.wav',
    }));
  });
});
