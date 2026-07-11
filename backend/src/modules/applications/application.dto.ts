import type {
  ApplicationStatus,
  EducationLevel,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  SalaryPeriod,
} from '@/generated/prisma/enums';

import type { ApplicantWithProfile, ApplicationWithJob } from './application.repository';

interface JobSummaryDto {
  id: string;
  title: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workMode: LocationType;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  status: JobStatus;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    location: string | null;
  };
}

/** A candidate's application to a job, as shown on the "Applied Jobs" screen. */
export interface ApplicationDto {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  updatedAt: string;
  job: JobSummaryDto;
}

/** Maps a candidate's application (with its job) to a public DTO. */
export function toApplicationDto(application: ApplicationWithJob): ApplicationDto {
  const { job } = application;
  return {
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    resumeUrl: application.resumeUrl,
    appliedAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    job: {
      id: job.id,
      title: job.title,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      workMode: job.locationType,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      status: job.status,
      company: {
        id: job.company.id,
        name: job.company.name,
        slug: job.company.slug,
        logoUrl: job.company.logoUrl,
        location: job.company.location,
      },
    },
  };
}

interface ApplicantSkillDto {
  id: string;
  name: string;
  slug: string;
}

interface ApplicantEducationDto {
  id: string;
  institution: string;
  degree: string | null;
  level: EducationLevel;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
}

interface ApplicantCandidateDto {
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
  skills: ApplicantSkillDto[];
  education: ApplicantEducationDto[];
}

/** The job an applicant applied to, shown alongside each applicant. */
interface ApplicantJobDto {
  id: string;
  title: string;
}

/** An applicant (application + candidate profile), as shown on the HR applicant board. */
export interface ApplicantDto {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  updatedAt: string;
  job: ApplicantJobDto;
  candidate: ApplicantCandidateDto;
}

/** Maps an application (with candidate profile and job) to a public applicant DTO. */
export function toApplicantDto(application: ApplicantWithProfile): ApplicantDto {
  const { candidateProfile, job } = application;
  return {
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    resumeUrl: application.resumeUrl,
    appliedAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    job: {
      id: job.id,
      title: job.title,
    },
    candidate: {
      id: candidateProfile.id,
      firstName: candidateProfile.user.firstName,
      lastName: candidateProfile.user.lastName,
      email: candidateProfile.user.email,
      headline: candidateProfile.headline,
      currentLocation: candidateProfile.currentLocation,
      preferredLocation: candidateProfile.preferredLocation,
      currentCompany: candidateProfile.currentCompany,
      currentTitle: candidateProfile.currentTitle,
      totalExperienceMonths: candidateProfile.totalExperienceMonths,
      highestEducation: candidateProfile.highestEducation,
      skills: candidateProfile.skills.map((candidateSkill) => ({
        id: candidateSkill.skill.id,
        name: candidateSkill.skill.name,
        slug: candidateSkill.skill.slug,
      })),
      education: candidateProfile.education.map((entry) => ({
        id: entry.id,
        institution: entry.institution,
        degree: entry.degree,
        level: entry.level,
        fieldOfStudy: entry.fieldOfStudy,
        startYear: entry.startYear,
        endYear: entry.endYear,
      })),
    },
  };
}
