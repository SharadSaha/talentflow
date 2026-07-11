/**
 * Database seed script.
 *
 * Generates realistic demo data so that every screen of the application has
 * meaningful content:
 *   * Companies, skills (shared reference data)
 *   * One HR user per company (primary: admin@test.com)
 *   * A pool of candidates with varied, filterable attributes
 *   * Jobs across companies (varied type / level / salary / skills)
 *   * Applications with varied statuses and audit trails
 *
 * The script is idempotent: it clears the relevant tables (in FK-safe order)
 * before inserting, so it can be run repeatedly.
 *
 * Run with: `npm run prisma:seed`  (or `npx prisma db seed`)
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import {
  ApplicationStatus,
  CompanySize,
  EducationLevel,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  PrismaClient,
  ProficiencyLevel,
  SalaryPeriod,
  UserRole,
} from '../src/generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Configure it in the environment before seeding.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const BCRYPT_SALT_ROUNDS = 12;

const PRIMARY_HR_EMAIL = 'admin@test.com';
const PRIMARY_HR_PASSWORD = 'Admin@1234';
const PRIMARY_CANDIDATE_EMAIL = 'candidate@test.com';
const PRIMARY_CANDIDATE_PASSWORD = 'Candidate@1234';
const DEMO_USER_PASSWORD = 'Password@123';

// ---------------------------------------------------------------------------
// Seed data definitions (strongly typed literals)
// ---------------------------------------------------------------------------

interface CompanySeed {
  name: string;
  slug: string;
  website: string;
  logoUrl: string;
  about: string;
  industry: string;
  size: CompanySize;
  location: string;
}

interface SkillSeed {
  name: string;
  slug: string;
}

interface EducationSeed {
  institution: string;
  degree: string;
  level: EducationLevel;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

interface CandidateSeed {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  headline: string;
  about: string;
  phone: string;
  currentLocation: string;
  preferredLocation: string;
  currentCompany: string;
  currentTitle: string;
  totalExperienceMonths: number;
  highestEducation: EducationLevel;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  noticePeriodDays: number;
  skillSlugs: readonly string[];
  education: readonly EducationSeed[];
}

interface JobSeed {
  companySlug: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  locationType: LocationType;
  location: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  status: JobStatus;
  requiredSkillSlugs: readonly string[];
  optionalSkillSlugs: readonly string[];
}

const COMPANIES: readonly CompanySeed[] = [
  {
    name: 'Acme Cloud',
    slug: 'acme-cloud',
    website: 'https://acmecloud.example.com',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Acme%20Cloud',
    about:
      'Acme Cloud builds developer-first infrastructure and platform tooling used by thousands of engineering teams worldwide.',
    industry: 'Cloud Infrastructure',
    size: CompanySize.LARGE,
    location: 'Bengaluru, India',
  },
  {
    name: 'Fintrek',
    slug: 'fintrek',
    website: 'https://fintrek.example.com',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Fintrek',
    about:
      'Fintrek is a fast-growing fintech building payments and lending products for emerging markets.',
    industry: 'Financial Services',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, India',
  },
  {
    name: 'HealthSync',
    slug: 'healthsync',
    website: 'https://healthsync.example.com',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HealthSync',
    about:
      'HealthSync develops interoperable healthcare software that connects providers, labs, and patients.',
    industry: 'Healthcare Technology',
    size: CompanySize.MEDIUM,
    location: 'Pune, India',
  },
  {
    name: 'DataForge',
    slug: 'dataforge',
    website: 'https://dataforge.example.com',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DataForge',
    about:
      'DataForge is an early-stage startup building an AI-native analytics platform for product teams.',
    industry: 'Data & Analytics',
    size: CompanySize.STARTUP,
    location: 'Remote (India)',
  },
];

const SKILLS: readonly SkillSeed[] = [
  { name: 'React', slug: 'react' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'Express', slug: 'express' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Prisma', slug: 'prisma' },
  { name: 'GraphQL', slug: 'graphql' },
  { name: 'Docker', slug: 'docker' },
  { name: 'Kubernetes', slug: 'kubernetes' },
  { name: 'AWS', slug: 'aws' },
  { name: 'Python', slug: 'python' },
  { name: 'Django', slug: 'django' },
  { name: 'Redis', slug: 'redis' },
  { name: 'Tailwind CSS', slug: 'tailwind-css' },
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'Java', slug: 'java' },
  { name: 'Spring Boot', slug: 'spring-boot' },
  { name: 'Go', slug: 'go' },
  { name: 'System Design', slug: 'system-design' },
];

const PRIMARY_CANDIDATE: CandidateSeed = {
  email: PRIMARY_CANDIDATE_EMAIL,
  password: PRIMARY_CANDIDATE_PASSWORD,
  firstName: 'Priya',
  lastName: 'Sharma',
  headline: 'Senior Full-Stack Engineer · React + Node.js',
  about:
    'Full-stack engineer with 6 years of experience building scalable web applications. I enjoy working across the stack, from React front-ends to Node.js services and PostgreSQL data models.',
  phone: '+91 98765 43210',
  currentLocation: 'Bengaluru, India',
  preferredLocation: 'Bengaluru, India',
  currentCompany: 'Techwave Solutions',
  currentTitle: 'Senior Software Engineer',
  totalExperienceMonths: 72,
  highestEducation: EducationLevel.MASTERS,
  expectedSalaryMin: 2800000,
  expectedSalaryMax: 3600000,
  noticePeriodDays: 60,
  skillSlugs: ['react', 'typescript', 'nodejs', 'express', 'postgresql', 'prisma', 'aws'],
  education: [
    {
      institution: 'Indian Institute of Technology, Bombay',
      degree: 'M.Tech',
      level: EducationLevel.MASTERS,
      fieldOfStudy: 'Computer Science',
      startYear: 2016,
      endYear: 2018,
    },
    {
      institution: 'National Institute of Technology, Trichy',
      degree: 'B.Tech',
      level: EducationLevel.BACHELORS,
      fieldOfStudy: 'Information Technology',
      startYear: 2012,
      endYear: 2016,
    },
  ],
};

const ADDITIONAL_CANDIDATES: readonly CandidateSeed[] = [
  {
    email: 'rahul.verma@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Rahul',
    lastName: 'Verma',
    headline: 'Backend Engineer · Node.js & PostgreSQL',
    about: 'Backend-focused engineer who loves designing clean APIs and reliable data pipelines.',
    phone: '+91 90000 10001',
    currentLocation: 'Pune, India',
    preferredLocation: 'Bengaluru, India',
    currentCompany: 'Infosys',
    currentTitle: 'Software Engineer',
    totalExperienceMonths: 48,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 1800000,
    expectedSalaryMax: 2400000,
    noticePeriodDays: 30,
    skillSlugs: ['nodejs', 'express', 'postgresql', 'redis', 'docker'],
    education: [
      {
        institution: 'College of Engineering, Pune',
        degree: 'B.E.',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Computer Engineering',
        startYear: 2015,
        endYear: 2019,
      },
    ],
  },
  {
    email: 'ananya.iyer@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Ananya',
    lastName: 'Iyer',
    headline: 'Frontend Engineer · React & TypeScript',
    about: 'Frontend engineer passionate about accessible, high-performance user interfaces.',
    phone: '+91 90000 10002',
    currentLocation: 'Bengaluru, India',
    preferredLocation: 'Remote',
    currentCompany: 'Flipkart',
    currentTitle: 'Frontend Engineer',
    totalExperienceMonths: 36,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 2000000,
    expectedSalaryMax: 2600000,
    noticePeriodDays: 45,
    skillSlugs: ['react', 'typescript', 'javascript', 'nextjs', 'tailwind-css'],
    education: [
      {
        institution: 'PES University',
        degree: 'B.Tech',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Computer Science',
        startYear: 2016,
        endYear: 2020,
      },
    ],
  },
  {
    email: 'mohammed.khan@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Mohammed',
    lastName: 'Khan',
    headline: 'Platform Engineer · Kubernetes & AWS',
    about:
      'Platform and DevOps engineer focused on developer productivity and reliable infrastructure.',
    phone: '+91 90000 10003',
    currentLocation: 'Hyderabad, India',
    preferredLocation: 'Bengaluru, India',
    currentCompany: 'Amazon',
    currentTitle: 'Systems Development Engineer',
    totalExperienceMonths: 84,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 3200000,
    expectedSalaryMax: 4200000,
    noticePeriodDays: 90,
    skillSlugs: ['docker', 'kubernetes', 'aws', 'go', 'system-design'],
    education: [
      {
        institution: 'Birla Institute of Technology and Science, Pilani',
        degree: 'B.E.',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Electronics & Computer Science',
        startYear: 2011,
        endYear: 2015,
      },
    ],
  },
  {
    email: 'sneha.reddy@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Sneha',
    lastName: 'Reddy',
    headline: 'Junior Full-Stack Developer',
    about: 'Recent graduate excited to build products end to end and grow as an engineer.',
    phone: '+91 90000 10004',
    currentLocation: 'Chennai, India',
    preferredLocation: 'Chennai, India',
    currentCompany: 'Zoho',
    currentTitle: 'Associate Software Engineer',
    totalExperienceMonths: 14,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 900000,
    expectedSalaryMax: 1400000,
    noticePeriodDays: 30,
    skillSlugs: ['javascript', 'react', 'nodejs', 'postgresql'],
    education: [
      {
        institution: 'Anna University',
        degree: 'B.E.',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Computer Science',
        startYear: 2019,
        endYear: 2023,
      },
    ],
  },
  {
    email: 'arjun.nair@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Arjun',
    lastName: 'Nair',
    headline: 'Data Engineer · Python & Analytics',
    about: 'Data engineer with a strong background in building batch and streaming data platforms.',
    phone: '+91 90000 10005',
    currentLocation: 'Bengaluru, India',
    preferredLocation: 'Remote',
    currentCompany: 'Swiggy',
    currentTitle: 'Data Engineer',
    totalExperienceMonths: 60,
    highestEducation: EducationLevel.MASTERS,
    expectedSalaryMin: 2600000,
    expectedSalaryMax: 3400000,
    noticePeriodDays: 60,
    skillSlugs: ['python', 'django', 'postgresql', 'aws', 'system-design'],
    education: [
      {
        institution: 'Indian Institute of Technology, Madras',
        degree: 'M.Tech',
        level: EducationLevel.MASTERS,
        fieldOfStudy: 'Data Science',
        startYear: 2015,
        endYear: 2017,
      },
    ],
  },
  {
    email: 'kavya.menon@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Kavya',
    lastName: 'Menon',
    headline: 'Backend Engineer · Java & Spring Boot',
    about: 'Enterprise backend engineer experienced with high-throughput financial systems.',
    phone: '+91 90000 10006',
    currentLocation: 'Mumbai, India',
    preferredLocation: 'Mumbai, India',
    currentCompany: 'ICICI Bank',
    currentTitle: 'Senior Engineer',
    totalExperienceMonths: 96,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 3000000,
    expectedSalaryMax: 3800000,
    noticePeriodDays: 90,
    skillSlugs: ['java', 'spring-boot', 'postgresql', 'redis', 'system-design'],
    education: [
      {
        institution: 'Veermata Jijabai Technological Institute',
        degree: 'B.Tech',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Information Technology',
        startYear: 2010,
        endYear: 2014,
      },
    ],
  },
  {
    email: 'ishita.gupta@test.com',
    password: DEMO_USER_PASSWORD,
    firstName: 'Ishita',
    lastName: 'Gupta',
    headline: 'Full-Stack Engineer · Next.js & Node.js',
    about: 'Product-minded full-stack engineer who ships features quickly without cutting corners.',
    phone: '+91 90000 10007',
    currentLocation: 'Gurgaon, India',
    preferredLocation: 'Bengaluru, India',
    currentCompany: 'Paytm',
    currentTitle: 'Software Engineer II',
    totalExperienceMonths: 54,
    highestEducation: EducationLevel.BACHELORS,
    expectedSalaryMin: 2200000,
    expectedSalaryMax: 2900000,
    noticePeriodDays: 60,
    skillSlugs: ['react', 'nextjs', 'nodejs', 'typescript', 'graphql'],
    education: [
      {
        institution: 'Delhi Technological University',
        degree: 'B.Tech',
        level: EducationLevel.BACHELORS,
        fieldOfStudy: 'Software Engineering',
        startYear: 2015,
        endYear: 2019,
      },
    ],
  },
];

const JOBS: readonly JobSeed[] = [
  {
    companySlug: 'acme-cloud',
    title: 'Senior Full-Stack Engineer',
    description:
      'Own end-to-end delivery of features across our React front-end and Node.js platform services. You will design APIs, model data in PostgreSQL, and mentor other engineers.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    locationType: LocationType.HYBRID,
    location: 'Bengaluru, India',
    minExperienceYears: 5,
    maxExperienceYears: 9,
    salaryMin: 2800000,
    salaryMax: 4000000,
    openings: 2,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['react', 'typescript', 'nodejs', 'postgresql'],
    optionalSkillSlugs: ['prisma', 'aws'],
  },
  {
    companySlug: 'acme-cloud',
    title: 'Platform / DevOps Engineer',
    description:
      'Build and operate the infrastructure that powers Acme Cloud. Work with Kubernetes, AWS, and internal tooling to keep our platform fast and reliable.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    locationType: LocationType.REMOTE,
    location: 'Remote (India)',
    minExperienceYears: 4,
    maxExperienceYears: 8,
    salaryMin: 2600000,
    salaryMax: 3800000,
    openings: 1,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['docker', 'kubernetes', 'aws'],
    optionalSkillSlugs: ['go', 'system-design'],
  },
  {
    companySlug: 'acme-cloud',
    title: 'Frontend Engineer',
    description:
      'Craft delightful, accessible user interfaces for our developer dashboard using React, TypeScript, and Tailwind CSS.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    locationType: LocationType.HYBRID,
    location: 'Bengaluru, India',
    minExperienceYears: 2,
    maxExperienceYears: 5,
    salaryMin: 1800000,
    salaryMax: 2800000,
    openings: 2,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['react', 'typescript', 'tailwind-css'],
    optionalSkillSlugs: ['nextjs'],
  },
  {
    companySlug: 'acme-cloud',
    title: 'Backend Engineering Intern',
    description:
      'A 6-month internship building backend services with Node.js and PostgreSQL. Great opportunity to learn production engineering.',
    employmentType: EmploymentType.INTERNSHIP,
    experienceLevel: ExperienceLevel.INTERNSHIP,
    locationType: LocationType.ONSITE,
    location: 'Bengaluru, India',
    minExperienceYears: 0,
    maxExperienceYears: 1,
    salaryMin: 480000,
    salaryMax: 600000,
    openings: 3,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['nodejs', 'javascript'],
    optionalSkillSlugs: ['postgresql'],
  },
  {
    companySlug: 'acme-cloud',
    title: 'Engineering Manager (Platform)',
    description:
      'Lead a team of platform engineers. This role blends people leadership with hands-on architecture and system design.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.EXECUTIVE,
    locationType: LocationType.HYBRID,
    location: 'Bengaluru, India',
    minExperienceYears: 9,
    maxExperienceYears: 15,
    salaryMin: 5000000,
    salaryMax: 7000000,
    openings: 1,
    status: JobStatus.DRAFT,
    requiredSkillSlugs: ['system-design', 'kubernetes'],
    optionalSkillSlugs: ['aws'],
  },
  {
    companySlug: 'fintrek',
    title: 'Senior Backend Engineer (Payments)',
    description:
      'Design and build resilient payment systems in Java and Spring Boot. Reliability, correctness, and scale are at the heart of this role.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    locationType: LocationType.ONSITE,
    location: 'Mumbai, India',
    minExperienceYears: 5,
    maxExperienceYears: 10,
    salaryMin: 3000000,
    salaryMax: 4200000,
    openings: 2,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['java', 'spring-boot', 'postgresql'],
    optionalSkillSlugs: ['redis', 'system-design'],
  },
  {
    companySlug: 'fintrek',
    title: 'Full-Stack Engineer',
    description: 'Ship features across our lending product using Next.js, Node.js, and GraphQL.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    locationType: LocationType.HYBRID,
    location: 'Mumbai, India',
    minExperienceYears: 3,
    maxExperienceYears: 6,
    salaryMin: 2000000,
    salaryMax: 3000000,
    openings: 1,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['react', 'nextjs', 'nodejs', 'graphql'],
    optionalSkillSlugs: ['typescript'],
  },
  {
    companySlug: 'healthsync',
    title: 'Backend Engineer (Interoperability)',
    description:
      'Build healthcare data integrations and APIs in Python and Django. Work with clinical data standards and large datasets.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    locationType: LocationType.HYBRID,
    location: 'Pune, India',
    minExperienceYears: 3,
    maxExperienceYears: 7,
    salaryMin: 1900000,
    salaryMax: 2900000,
    openings: 2,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['python', 'django', 'postgresql'],
    optionalSkillSlugs: ['aws', 'redis'],
  },
  {
    companySlug: 'healthsync',
    title: 'Contract React Developer',
    description:
      'A 6-month contract to help build patient-facing web experiences with React and TypeScript.',
    employmentType: EmploymentType.CONTRACT,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    locationType: LocationType.REMOTE,
    location: 'Remote (India)',
    minExperienceYears: 3,
    maxExperienceYears: 8,
    salaryMin: 1600000,
    salaryMax: 2400000,
    openings: 1,
    status: JobStatus.CLOSED,
    requiredSkillSlugs: ['react', 'typescript'],
    optionalSkillSlugs: ['tailwind-css'],
  },
  {
    companySlug: 'dataforge',
    title: 'Founding Data Engineer',
    description:
      'Join as an early engineer to build our AI-native analytics platform. You will own the data infrastructure end to end.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    locationType: LocationType.REMOTE,
    location: 'Remote (India)',
    minExperienceYears: 4,
    maxExperienceYears: 9,
    salaryMin: 2800000,
    salaryMax: 4000000,
    openings: 1,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['python', 'postgresql', 'aws', 'system-design'],
    optionalSkillSlugs: ['docker'],
  },
  {
    companySlug: 'dataforge',
    title: 'Full-Stack Engineer (Early Team)',
    description:
      'Build our product surface with React and Node.js. High ownership, fast iteration, direct impact.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    locationType: LocationType.REMOTE,
    location: 'Remote (India)',
    minExperienceYears: 2,
    maxExperienceYears: 6,
    salaryMin: 1800000,
    salaryMax: 2800000,
    openings: 2,
    status: JobStatus.PUBLISHED,
    requiredSkillSlugs: ['react', 'nodejs', 'typescript'],
    optionalSkillSlugs: ['prisma', 'postgresql'],
  },
];

/**
 * Applications the primary candidate has submitted, keyed by job title, so the
 * candidate "Applied Jobs" screen is populated with varied statuses.
 */
const PRIMARY_CANDIDATE_APPLICATIONS: ReadonlyArray<{
  jobTitle: string;
  statusFlow: readonly ApplicationStatus[];
}> = [
  {
    jobTitle: 'Senior Full-Stack Engineer',
    statusFlow: [
      ApplicationStatus.APPLIED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.SHORTLISTED,
    ],
  },
  {
    jobTitle: 'Platform / DevOps Engineer',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED],
  },
  { jobTitle: 'Full-Stack Engineer (Early Team)', statusFlow: [ApplicationStatus.APPLIED] },
  {
    jobTitle: 'Founding Data Engineer',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW],
  },
];

/**
 * Applications submitted by other candidates to Acme Cloud jobs (posted by the
 * primary HR), so the HR "View Applicants" + filter screens are populated.
 */
const APPLICANT_PIPELINE: ReadonlyArray<{
  candidateEmail: string;
  jobTitle: string;
  statusFlow: readonly ApplicationStatus[];
}> = [
  {
    candidateEmail: 'rahul.verma@test.com',
    jobTitle: 'Senior Full-Stack Engineer',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW],
  },
  {
    candidateEmail: 'ananya.iyer@test.com',
    jobTitle: 'Frontend Engineer',
    statusFlow: [
      ApplicationStatus.APPLIED,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
    ],
  },
  {
    candidateEmail: 'mohammed.khan@test.com',
    jobTitle: 'Platform / DevOps Engineer',
    statusFlow: [
      ApplicationStatus.APPLIED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.SHORTLISTED,
    ],
  },
  {
    candidateEmail: 'sneha.reddy@test.com',
    jobTitle: 'Backend Engineering Intern',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.OFFERED],
  },
  {
    candidateEmail: 'arjun.nair@test.com',
    jobTitle: 'Platform / DevOps Engineer',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED],
  },
  {
    candidateEmail: 'ishita.gupta@test.com',
    jobTitle: 'Frontend Engineer',
    statusFlow: [ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW],
  },
  {
    candidateEmail: 'ananya.iyer@test.com',
    jobTitle: 'Senior Full-Stack Engineer',
    statusFlow: [ApplicationStatus.APPLIED],
  },
];

// ---------------------------------------------------------------------------
// Seeding steps
// ---------------------------------------------------------------------------

async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

/**
 * Removes all seeded data in FK-safe order so the script is idempotent.
 */
async function clearDatabase(): Promise<void> {
  await prisma.applicationStatusEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.educationEntry.deleteMany();
  await prisma.job.deleteMany();
  await prisma.hrProfile.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.company.deleteMany();
}

async function seedCompanies(): Promise<Map<string, string>> {
  const companyIdBySlug = new Map<string, string>();

  for (const company of COMPANIES) {
    const created = await prisma.company.create({ data: company });
    companyIdBySlug.set(company.slug, created.id);
  }

  return companyIdBySlug;
}

async function seedSkills(): Promise<Map<string, string>> {
  const skillIdBySlug = new Map<string, string>();

  for (const skill of SKILLS) {
    const created = await prisma.skill.create({ data: skill });
    skillIdBySlug.set(skill.slug, created.id);
  }

  return skillIdBySlug;
}

/**
 * Creates one HR user per company. Returns the primary HR user id (Acme Cloud),
 * which is used as the poster for all jobs and the actor for status changes.
 */
async function seedHrUsers(companyIdBySlug: Map<string, string>): Promise<string> {
  const primaryHrPasswordHash = await hashPassword(PRIMARY_HR_PASSWORD);
  const demoPasswordHash = await hashPassword(DEMO_USER_PASSWORD);

  const primaryHr = await prisma.user.create({
    data: {
      email: PRIMARY_HR_EMAIL,
      passwordHash: primaryHrPasswordHash,
      firstName: 'Aisha',
      lastName: 'Khan',
      role: UserRole.HR,
      hrProfile: {
        create: {
          companyId: requireId(companyIdBySlug, 'acme-cloud'),
          designation: 'Talent Acquisition Lead',
        },
      },
    },
  });

  const otherHrDefinitions: ReadonlyArray<{
    email: string;
    firstName: string;
    lastName: string;
    companySlug: string;
    designation: string;
  }> = [
    {
      email: 'hr.fintrek@test.com',
      firstName: 'Rohit',
      lastName: 'Deshmukh',
      companySlug: 'fintrek',
      designation: 'Recruiter',
    },
    {
      email: 'hr.healthsync@test.com',
      firstName: 'Meera',
      lastName: 'Pillai',
      companySlug: 'healthsync',
      designation: 'Recruiter',
    },
    {
      email: 'hr.dataforge@test.com',
      firstName: 'Vikram',
      lastName: 'Rao',
      companySlug: 'dataforge',
      designation: 'Founder',
    },
  ];

  for (const hr of otherHrDefinitions) {
    await prisma.user.create({
      data: {
        email: hr.email,
        passwordHash: demoPasswordHash,
        firstName: hr.firstName,
        lastName: hr.lastName,
        role: UserRole.HR,
        hrProfile: {
          create: {
            companyId: requireId(companyIdBySlug, hr.companySlug),
            designation: hr.designation,
          },
        },
      },
    });
  }

  return primaryHr.id;
}

/**
 * Creates a candidate user with its 1:1 profile, skills, and education in a
 * single nested write. Returns the created CandidateProfile id.
 */
async function seedCandidate(
  candidate: CandidateSeed,
  skillIdBySlug: Map<string, string>,
): Promise<string> {
  const passwordHash = await hashPassword(candidate.password);

  const user = await prisma.user.create({
    data: {
      email: candidate.email,
      passwordHash,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      role: UserRole.CANDIDATE,
      candidateProfile: {
        create: {
          headline: candidate.headline,
          about: candidate.about,
          phone: candidate.phone,
          currentLocation: candidate.currentLocation,
          preferredLocation: candidate.preferredLocation,
          currentCompany: candidate.currentCompany,
          currentTitle: candidate.currentTitle,
          totalExperienceMonths: candidate.totalExperienceMonths,
          highestEducation: candidate.highestEducation,
          expectedSalaryMin: candidate.expectedSalaryMin,
          expectedSalaryMax: candidate.expectedSalaryMax,
          noticePeriodDays: candidate.noticePeriodDays,
          skills: {
            create: candidate.skillSlugs.map((slug) => ({
              skillId: requireId(skillIdBySlug, slug),
              proficiency: ProficiencyLevel.ADVANCED,
            })),
          },
          education: {
            create: candidate.education.map((entry) => ({ ...entry })),
          },
        },
      },
    },
    include: { candidateProfile: true },
  });

  if (!user.candidateProfile) {
    throw new Error(`Failed to create candidate profile for ${candidate.email}`);
  }

  return user.candidateProfile.id;
}

async function seedCandidates(skillIdBySlug: Map<string, string>): Promise<Map<string, string>> {
  const candidateProfileIdByEmail = new Map<string, string>();

  const allCandidates: readonly CandidateSeed[] = [PRIMARY_CANDIDATE, ...ADDITIONAL_CANDIDATES];

  for (const candidate of allCandidates) {
    const profileId = await seedCandidate(candidate, skillIdBySlug);
    candidateProfileIdByEmail.set(candidate.email, profileId);
  }

  return candidateProfileIdByEmail;
}

async function seedJobs(
  companyIdBySlug: Map<string, string>,
  skillIdBySlug: Map<string, string>,
  postedById: string,
): Promise<Map<string, string>> {
  const jobIdByTitle = new Map<string, string>();

  for (const job of JOBS) {
    const requiredSkills = job.requiredSkillSlugs.map((slug) => ({
      skillId: requireId(skillIdBySlug, slug),
      isRequired: true,
    }));
    const optionalSkills = job.optionalSkillSlugs.map((slug) => ({
      skillId: requireId(skillIdBySlug, slug),
      isRequired: false,
    }));

    const created = await prisma.job.create({
      data: {
        companyId: requireId(companyIdBySlug, job.companySlug),
        postedById,
        title: job.title,
        description: job.description,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        locationType: job.locationType,
        location: job.location,
        minExperienceYears: job.minExperienceYears,
        maxExperienceYears: job.maxExperienceYears,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryPeriod: SalaryPeriod.YEARLY,
        openings: job.openings,
        status: job.status,
        publishedAt: job.status === JobStatus.PUBLISHED ? new Date() : null,
        skills: { create: [...requiredSkills, ...optionalSkills] },
      },
    });

    jobIdByTitle.set(job.title, created.id);
  }

  return jobIdByTitle;
}

/**
 * Creates one application and its status-event audit trail. The final status in
 * the flow becomes the application's current status.
 */
async function createApplicationWithHistory(params: {
  jobId: string;
  candidateProfileId: string;
  statusFlow: readonly ApplicationStatus[];
  changedById: string;
}): Promise<void> {
  const { jobId, candidateProfileId, statusFlow, changedById } = params;
  const currentStatus = statusFlow[statusFlow.length - 1] ?? ApplicationStatus.APPLIED;

  await prisma.application.create({
    data: {
      jobId,
      candidateProfileId,
      status: currentStatus,
      coverLetter:
        'I am excited about this role and believe my experience is a strong match for the team.',
      statusEvents: {
        create: statusFlow.map((status) => ({
          status,
          // The initial APPLIED event is recorded by the candidate; later
          // transitions are recorded by the HR reviewing the application.
          changedById: status === ApplicationStatus.APPLIED ? null : changedById,
        })),
      },
    },
  });
}

async function seedApplications(
  jobIdByTitle: Map<string, string>,
  candidateProfileIdByEmail: Map<string, string>,
  primaryHrUserId: string,
): Promise<void> {
  const primaryCandidateProfileId = requireId(candidateProfileIdByEmail, PRIMARY_CANDIDATE_EMAIL);

  for (const application of PRIMARY_CANDIDATE_APPLICATIONS) {
    await createApplicationWithHistory({
      jobId: requireId(jobIdByTitle, application.jobTitle),
      candidateProfileId: primaryCandidateProfileId,
      statusFlow: application.statusFlow,
      changedById: primaryHrUserId,
    });
  }

  for (const application of APPLICANT_PIPELINE) {
    await createApplicationWithHistory({
      jobId: requireId(jobIdByTitle, application.jobTitle),
      candidateProfileId: requireId(candidateProfileIdByEmail, application.candidateEmail),
      statusFlow: application.statusFlow,
      changedById: primaryHrUserId,
    });
  }
}

/**
 * Reads a required value from a lookup map, throwing a descriptive error if the
 * key is missing. Guarantees a non-null id without weakening type safety.
 */
function requireId(lookup: Map<string, string>, key: string): string {
  const value = lookup.get(key);
  if (!value) {
    throw new Error(`Seed lookup failed: no id found for "${key}".`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.info('🌱 Seeding database…');

  await clearDatabase();

  const companyIdBySlug = await seedCompanies();
  console.info(`  ✓ ${companyIdBySlug.size} companies`);

  const skillIdBySlug = await seedSkills();
  console.info(`  ✓ ${skillIdBySlug.size} skills`);

  const primaryHrUserId = await seedHrUsers(companyIdBySlug);
  console.info('  ✓ HR users');

  const candidateProfileIdByEmail = await seedCandidates(skillIdBySlug);
  console.info(`  ✓ ${candidateProfileIdByEmail.size} candidates`);

  const jobIdByTitle = await seedJobs(companyIdBySlug, skillIdBySlug, primaryHrUserId);
  console.info(`  ✓ ${jobIdByTitle.size} jobs`);

  await seedApplications(jobIdByTitle, candidateProfileIdByEmail, primaryHrUserId);
  console.info('  ✓ applications');

  console.info('✅ Seed complete.');
  console.info(`   HR login:        ${PRIMARY_HR_EMAIL} / ${PRIMARY_HR_PASSWORD}`);
  console.info(`   Candidate login: ${PRIMARY_CANDIDATE_EMAIL} / ${PRIMARY_CANDIDATE_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
