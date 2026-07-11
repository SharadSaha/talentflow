import type {
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  SalaryPeriod,
} from '@/generated/prisma/enums';

import type { JobWithRelations } from './job.repository';

interface JobCompanyDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  location: string | null;
  industry: string | null;
}

interface JobSkillDto {
  id: string;
  name: string;
  slug: string;
  isRequired: boolean;
}

/** Public representation of a job posting. `workMode` maps to the schema's `locationType`. */
export interface JobDto {
  id: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workMode: LocationType;
  location: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  openings: number;
  status: JobStatus;
  applicationCount: number;
  company: JobCompanyDto;
  skills: JobSkillDto[];
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Maps a job (with relations) to its public DTO. */
export function toJobDto(job: JobWithRelations): JobDto {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    workMode: job.locationType,
    location: job.location,
    minExperienceYears: job.minExperienceYears,
    maxExperienceYears: job.maxExperienceYears,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod,
    openings: job.openings,
    status: job.status,
    applicationCount: job._count.applications,
    company: {
      id: job.company.id,
      name: job.company.name,
      slug: job.company.slug,
      logoUrl: job.company.logoUrl,
      location: job.company.location,
      industry: job.company.industry,
    },
    skills: job.skills.map((jobSkill) => ({
      id: jobSkill.skill.id,
      name: jobSkill.skill.name,
      slug: jobSkill.skill.slug,
      isRequired: jobSkill.isRequired,
    })),
    publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
    expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
