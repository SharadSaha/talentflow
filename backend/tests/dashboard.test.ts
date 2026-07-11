jest.mock('@/modules/dashboard/dashboard.repository', () => ({
  dashboardRepository: {
    getCandidateDashboard: jest.fn(),
    getHrDashboard: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { signAccessToken } from '@/auth/token.service';
import { ApplicationStatus, UserRole } from '@/generated/prisma/enums';
import { dashboardRepository } from '@/modules/dashboard/dashboard.repository';

import { buildApplicationWithJob, buildJob, CANDIDATE_PROFILE_ID, HR_USER_ID } from './fixtures';

const mockedRepository = dashboardRepository as jest.Mocked<typeof dashboardRepository>;
const app = createApp();

const hrToken = signAccessToken({ id: HR_USER_ID, email: 'hr@example.com', role: UserRole.HR });
const candidateToken = signAccessToken({
  id: 'cand-1',
  email: 'c@example.com',
  role: UserRole.CANDIDATE,
});

describe('Dashboard API', () => {
  describe('GET /api/v1/dashboard/candidate', () => {
    it('returns the candidate dashboard', async () => {
      mockedRepository.getCandidateDashboard.mockResolvedValue({
        profile: {
          id: CANDIDATE_PROFILE_ID,
          headline: 'Engineer',
          about: 'About',
          phone: '+91 90000 00000',
          currentLocation: 'Bengaluru',
          preferredLocation: 'Remote',
          currentCompany: 'Techwave',
          currentTitle: 'SSE',
          totalExperienceMonths: 72,
          highestEducation: 'MASTERS',
          expectedSalaryMin: 2800000,
          resumeUrl: 'https://example.com/cv.pdf',
          skillSlugs: ['react'],
          skillCount: 1,
          educationCount: 1,
        },
        recentApplications: [buildApplicationWithJob()],
        statusCounts: [{ status: ApplicationStatus.APPLIED, count: 1 }],
        recommendedJobs: [buildJob()],
        recentJobs: [buildJob()],
      });

      const response = await request(app)
        .get('/api/v1/dashboard/candidate')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.dashboard.profileCompletion).toBe(100);
      expect(response.body.data.dashboard.applicationCounts.total).toBe(1);
      expect(response.body.data.dashboard.savedCount).toBe(0);
    });

    it('forbids HR users from the candidate dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/candidate')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboard/hr', () => {
    it('returns the HR dashboard', async () => {
      mockedRepository.getHrDashboard.mockResolvedValue({
        totalJobs: 3,
        activeJobs: 2,
        closedJobs: 1,
        totalApplicants: 4,
        statusCounts: [{ status: ApplicationStatus.APPLIED, count: 4 }],
        recentApplications: [],
        recentJobs: [buildJob()],
        topPerformingJob: buildJob(),
      });

      const response = await request(app)
        .get('/api/v1/dashboard/hr')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.dashboard.totalJobs).toBe(3);
      expect(response.body.data.dashboard.applicantStatusBreakdown.APPLIED).toBe(4);
      expect(response.body.data.dashboard.topPerformingJob.title).toBeDefined();
    });

    it('forbids candidates from the HR dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/hr')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(403);
    });
  });
});
