import { NotFoundError } from '@/errors';

import type { CandidateProfileDto } from './profile.dto';
import { toCandidateProfileDto } from './profile.dto';
import { candidateProfileRepository } from './profile.repository';
import type { CandidateProfileRepository } from './profile.repository';
import type { UpdateProfileInput } from './profile.schemas';

/**
 * Business logic for the candidate profile module. A candidate always operates
 * on their own profile, identified by their authenticated user id; ownership is
 * therefore implicit and cannot be targeted at another user's profile.
 */
export class CandidateProfileService {
  constructor(private readonly profiles: CandidateProfileRepository = candidateProfileRepository) {}

  /** Returns the authenticated candidate's own profile. */
  async getOwnProfile(userId: string): Promise<CandidateProfileDto> {
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Candidate profile not found.');
    }

    return toCandidateProfileDto(profile);
  }

  /** Updates the authenticated candidate's own profile with the allowed fields. */
  async updateOwnProfile(userId: string, input: UpdateProfileInput): Promise<CandidateProfileDto> {
    const existingProfile = await this.profiles.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError('Candidate profile not found.');
    }

    const updatedProfile = await this.profiles.updateByUserId(userId, input);
    return toCandidateProfileDto(updatedProfile);
  }
}

export const candidateProfileService = new CandidateProfileService();
