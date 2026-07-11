import { NotFoundError } from '@/errors';
import { ApplicationStatus } from '@/generated/prisma/enums';

import {
  buildApplicationWithJob,
  buildJob,
  CANDIDATE_PROFILE_ID,
  CANDIDATE_USER_ID,
  HR_USER_ID,
} from '../../../tests/fixtures';
import { DashboardService } from './dashboard.service';
import type {
  CandidateProfileSnapshot,
  DashboardRepository,
  HrRecentApplication,
} from './dashboard.repository';

const fullProfile: CandidateProfileSnapshot = {
  id: CANDIDATE_PROFILE_ID,
  headline: 'Engineer',
  about: 'About me',
  phone: '+91 90000 00000',
  currentLocation: 'Bengaluru',
  preferredLocation: 'Remote',
  currentCompany: 'Techwave',
  currentTitle: 'SSE',
  totalExperienceMonths: 72,
  highestEducation: 'MASTERS',
  expectedSalaryMin: 2800000,
  resumeUrl: 'https://example.com/resume.pdf',
  skillSlugs: ['react'],
  skillCount: 1,
  educationCount: 1,
};

describe('DashboardService', () => {
  const buildRepository = () =>
    ({
      getCandidateDashboard: jest.fn(),
      getHrDashboard: jest.fn(),
    }) satisfies DashboardRepository;

  describe('getCandidateDashboard', () => {
    it('composes completion, counts, recommendations, and recent data', async () => {
      const repository = buildRepository();
      repository.getCandidateDashboard.mockResolvedValue({
        profile: fullProfile,
        recentApplications: [buildApplicationWithJob()],
        statusCounts: [
          { status: ApplicationStatus.APPLIED, count: 2 },
          { status: ApplicationStatus.HIRED, count: 1 },
        ],
        recommendedJobs: [buildJob()],
        recentJobs: [buildJob()],
      });
      const service = new DashboardService(repository);

      const dashboard = await service.getCandidateDashboard(CANDIDATE_USER_ID);

      expect(dashboard.profileCompletion).toBe(100);
      expect(dashboard.applicationCounts.total).toBe(3);
      expect(dashboard.applicationCounts.byStatus.APPLIED).toBe(2);
      expect(dashboard.applicationCounts.byStatus.HIRED).toBe(1);
      expect(dashboard.applicationCounts.byStatus.REJECTED).toBe(0);
      expect(dashboard.recommendedJobs).toHaveLength(1);
      expect(dashboard.recentApplications).toHaveLength(1);
      expect(dashboard.savedCount).toBe(0);
    });

    it('throws NotFound when the candidate profile does not exist', async () => {
      const repository = buildRepository();
      repository.getCandidateDashboard.mockResolvedValue({
        profile: null,
        recentApplications: [],
        statusCounts: [],
        recommendedJobs: [],
        recentJobs: [],
      });
      const service = new DashboardService(repository);

      await expect(service.getCandidateDashboard(CANDIDATE_USER_ID)).rejects.toThrow(NotFoundError);
    });

    it('computes a partial completion score', async () => {
      const repository = buildRepository();
      repository.getCandidateDashboard.mockResolvedValue({
        profile: {
          ...fullProfile,
          about: null,
          phone: null,
          resumeUrl: null,
          expectedSalaryMin: null,
        },
        recentApplications: [],
        statusCounts: [],
        recommendedJobs: [],
        recentJobs: [],
      });
      const service = new DashboardService(repository);

      const dashboard = await service.getCandidateDashboard(CANDIDATE_USER_ID);

      expect(dashboard.profileCompletion).toBeGreaterThan(0);
      expect(dashboard.profileCompletion).toBeLessThan(100);
    });
  });

  describe('getHrDashboard', () => {
    const hrRecentApplication: HrRecentApplication = {
      id: 'app-1',
      status: ApplicationStatus.APPLIED,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      job: { id: 'job-1', title: 'Senior Full-Stack Engineer' },
      candidateProfile: {
        id: CANDIDATE_PROFILE_ID,
        user: { firstName: 'Test', lastName: 'Candidate' },
      },
    };

    it('composes HR job/applicant aggregates and the top job', async () => {
      const repository = buildRepository();
      repository.getHrDashboard.mockResolvedValue({
        totalJobs: 5,
        activeJobs: 4,
        closedJobs: 1,
        totalApplicants: 9,
        statusCounts: [{ status: ApplicationStatus.APPLIED, count: 9 }],
        recentApplications: [hrRecentApplication],
        recentJobs: [buildJob()],
        topPerformingJob: buildJob(),
      });
      const service = new DashboardService(repository);

      const dashboard = await service.getHrDashboard(HR_USER_ID);

      expect(dashboard.totalJobs).toBe(5);
      expect(dashboard.activeJobs).toBe(4);
      expect(dashboard.closedJobs).toBe(1);
      expect(dashboard.totalApplicants).toBe(9);
      expect(dashboard.applicantStatusBreakdown.APPLIED).toBe(9);
      expect(dashboard.recentApplications[0]?.candidateName).toBe('Test Candidate');
      expect(dashboard.topPerformingJob?.title).toBe('Senior Full-Stack Engineer');
    });

    it('returns a null top job when the HR user has none', async () => {
      const repository = buildRepository();
      repository.getHrDashboard.mockResolvedValue({
        totalJobs: 0,
        activeJobs: 0,
        closedJobs: 0,
        totalApplicants: 0,
        statusCounts: [],
        recentApplications: [],
        recentJobs: [],
        topPerformingJob: null,
      });
      const service = new DashboardService(repository);

      const dashboard = await service.getHrDashboard(HR_USER_ID);

      expect(dashboard.topPerformingJob).toBeNull();
    });
  });
});
