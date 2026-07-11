import type { ApplicationStatus } from '@/constants/application-status';
import type { EducationLevel } from '@/constants/education';
import type { SortOrder } from '@/types/pagination';

/** A skill on an applicant's profile. */
export interface ApplicantSkill {
  id: string;
  name: string;
  slug: string;
}

/** An education entry on an applicant's profile. */
export interface ApplicantEducation {
  id: string;
  institution: string;
  degree: string | null;
  level: EducationLevel;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
}

/** The candidate portion of an applicant. Mirrors backend `ApplicantCandidateDto`. */
export interface ApplicantCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string | null;
  currentLocation: string | null;
  preferredLocation: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  totalExperienceMonths: number;
  highestEducation: EducationLevel | null;
  skills: ApplicantSkill[];
  education: ApplicantEducation[];
}

/**
 * An applicant to a job (application + candidate profile). `id` is the
 * application id used for status updates. Mirrors backend `ApplicantDto`.
 */
export interface Applicant {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  updatedAt: string;
  candidate: ApplicantCandidate;
}

/** Query parameters + filters for a job's applicant board. */
export interface JobApplicantsParams {
  jobId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  status?: ApplicationStatus;
  minExperienceMonths?: number;
  maxExperienceMonths?: number;
  currentLocation?: string;
  preferredLocation?: string;
  highestEducation?: EducationLevel;
  college?: string;
  currentCompany?: string;
  skills?: string[];
  keyword?: string;
}

/** Payload for advancing an applicant's status. */
export interface UpdateApplicationStatusRequest {
  applicationId: string;
  status: ApplicationStatus;
  note?: string;
}
