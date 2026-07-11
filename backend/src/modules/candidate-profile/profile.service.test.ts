import { NotFoundError } from '@/errors';

import { buildCandidateProfile } from '../../../tests/fixtures';
import { CandidateProfileService } from './profile.service';
import type { CandidateProfileRepository } from './profile.repository';

describe('CandidateProfileService', () => {
  const userId = '019f0000-0000-7000-8000-000000000001';

  const buildRepository = () =>
    ({
      findByUserId: jest.fn(),
      updateByUserId: jest.fn(),
    }) satisfies CandidateProfileRepository;

  describe('getOwnProfile', () => {
    it('returns the mapped profile for the authenticated candidate', async () => {
      const repository = buildRepository();
      repository.findByUserId.mockResolvedValue(buildCandidateProfile());
      const service = new CandidateProfileService(repository);

      const profile = await service.getOwnProfile(userId);

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(profile.user.email).toBe('candidate@example.com');
      expect(profile.skills).toHaveLength(1);
      expect(profile.skills[0]).toMatchObject({ name: 'React', slug: 'react' });
      expect(profile.education).toHaveLength(1);
    });

    it('throws a NotFoundError when the profile does not exist', async () => {
      const repository = buildRepository();
      repository.findByUserId.mockResolvedValue(null);
      const service = new CandidateProfileService(repository);

      await expect(service.getOwnProfile(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateOwnProfile', () => {
    it('updates and returns the mapped profile', async () => {
      const repository = buildRepository();
      repository.findByUserId.mockResolvedValue(buildCandidateProfile());
      repository.updateByUserId.mockResolvedValue(
        buildCandidateProfile({ headline: 'Staff Engineer' }),
      );
      const service = new CandidateProfileService(repository);

      const profile = await service.updateOwnProfile(userId, { headline: 'Staff Engineer' });

      expect(repository.updateByUserId).toHaveBeenCalledWith(userId, {
        headline: 'Staff Engineer',
      });
      expect(profile.headline).toBe('Staff Engineer');
    });

    it('throws a NotFoundError and does not update when the profile is missing', async () => {
      const repository = buildRepository();
      repository.findByUserId.mockResolvedValue(null);
      const service = new CandidateProfileService(repository);

      await expect(
        service.updateOwnProfile(userId, { headline: 'Staff Engineer' }),
      ).rejects.toThrow(NotFoundError);
      expect(repository.updateByUserId).not.toHaveBeenCalled();
    });
  });
});
