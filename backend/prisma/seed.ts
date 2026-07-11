/**
 * Database seed script.
 *
 * Generates a large, realistic development dataset so every screen of the
 * application has meaningful content and the filters/pagination have enough
 * volume to exercise:
 *   * 24 companies + 105 skills (shared reference data)
 *   * 48 HR users (one+ per company) and 112 candidate users (160 users total)
 *   * 112 candidate profiles with skills, education and filterable attributes
 *   * 320 jobs distributed across companies and their HR owners
 *   * 900+ applications spread realistically across jobs / candidates / time,
 *     each with an append-only status-event audit trail
 *
 * Design notes:
 *   * All randomness flows through a single seeded PRNG (`rng`) so repeated runs
 *     produce the SAME dataset — reproducible demos and stable screenshots. The
 *     previous seed used only static literals; this keeps that determinism while
 *     scaling up volume. (`Math.random` is intentionally avoided.)
 *   * Rows are inserted with `createMany` in batches for performance. Because
 *     Prisma's `createMany` cannot return generated ids, primary keys are minted
 *     up-front with `crypto.randomUUID()` so foreign keys can be pre-wired.
 *   * The script is idempotent: it clears the relevant tables (in FK-safe order)
 *     before inserting, so it can be run repeatedly.
 *
 * The well-known demo accounts documented for the project are preserved exactly:
 *   * HR        — admin@test.com     / Admin@1234
 *   * Candidate — candidate@test.com / Candidate@1234
 * plus the named secondary HR/candidate accounts (…@test.com / Password@123).
 *
 * Run with: `npm run prisma:seed`  (or `npx prisma db seed`)
 */
import 'dotenv/config';

import { randomUUID } from 'node:crypto';

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
import type { Prisma } from '../src/generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Configure it in the environment before seeding.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const BCRYPT_SALT_ROUNDS = 12;
const INSERT_BATCH_SIZE = 500;

// Well-known demo accounts (kept stable so documented logins keep working).
const PRIMARY_HR_EMAIL = 'admin@test.com';
const PRIMARY_HR_PASSWORD = 'Admin@1234';
const PRIMARY_CANDIDATE_EMAIL = 'candidate@test.com';
const PRIMARY_CANDIDATE_PASSWORD = 'Candidate@1234';
const DEMO_USER_PASSWORD = 'Password@123';

// Target volumes (kept above every requested minimum).
const TARGET_HR_USERS = 48;
const TARGET_CANDIDATES = 112;
const TARGET_JOBS = 320;

// ---------------------------------------------------------------------------
// Seeded pseudo-random number generator + small sampling helpers
// ---------------------------------------------------------------------------

/**
 * mulberry32 — a tiny, fast, deterministic PRNG. Given the same seed it always
 * yields the same sequence, which keeps the generated dataset reproducible.
 */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(0x7a1e5f10);

/** Random integer in the inclusive range [min, max]. */
function randInt(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Returns true with probability `p` (0..1). */
function chance(p: number): boolean {
  return rng() < p;
}

/** Picks one element from a non-empty array. */
function pick<T>(items: readonly T[]): T {
  const value = items[Math.floor(rng() * items.length)];
  if (value === undefined) {
    throw new Error('pick() called on an empty array.');
  }
  return value;
}

/** Returns a shuffled shallow copy (Fisher–Yates with the seeded RNG). */
function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

/** Picks `count` distinct elements (clamped to the array length). */
function pickDistinct<T>(items: readonly T[], count: number): T[] {
  return shuffled(items).slice(0, Math.min(count, items.length));
}

/** Weighted pick from `[value, weight]` pairs. */
function weightedPick<T>(entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let threshold = rng() * total;
  for (const [value, weight] of entries) {
    threshold -= weight;
    if (threshold <= 0) {
      return value;
    }
  }
  const last = entries[entries.length - 1];
  if (!last) {
    throw new Error('weightedPick() called with no entries.');
  }
  return last[0];
}

/** A date `daysAgo` days before now (with an optional intra-day offset). */
function daysAgo(days: number): Date {
  const millis = Date.now() - days * 24 * 60 * 60 * 1000 - randInt(0, 23) * 60 * 60 * 1000;
  return new Date(millis);
}

/** Inserts rows in fixed-size batches to avoid oversized single statements. */
async function insertInBatches<T>(
  rows: readonly T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    await insert(rows.slice(i, i + INSERT_BATCH_SIZE));
  }
}

// ---------------------------------------------------------------------------
// Vocabulary pools (composed to avoid obvious repetition)
// ---------------------------------------------------------------------------

const FIRST_NAMES: readonly string[] = [
  'Priya',
  'Rahul',
  'Ananya',
  'Mohammed',
  'Sneha',
  'Arjun',
  'Kavya',
  'Ishita',
  'Rohan',
  'Aditya',
  'Neha',
  'Vikram',
  'Divya',
  'Karan',
  'Pooja',
  'Siddharth',
  'Meera',
  'Aryan',
  'Riya',
  'Nikhil',
  'Sanya',
  'Harsh',
  'Tanvi',
  'Aman',
  'Shreya',
  'Varun',
  'Aisha',
  'Manish',
  'Deepika',
  'Rajesh',
  'Anjali',
  'Suresh',
  'Nisha',
  'Gaurav',
  'Swati',
  'Abhishek',
  'Ritika',
  'Sameer',
  'Preeti',
  'Yash',
  'Farah',
  'Imran',
  'Zoya',
  'Kabir',
  'Lakshmi',
  'Naveen',
  'Ojas',
  'Trisha',
  'Uday',
  'Vaishnavi',
];

const LAST_NAMES: readonly string[] = [
  'Sharma',
  'Verma',
  'Iyer',
  'Khan',
  'Reddy',
  'Nair',
  'Menon',
  'Gupta',
  'Patel',
  'Desai',
  'Deshmukh',
  'Pillai',
  'Rao',
  'Singh',
  'Chopra',
  'Kapoor',
  'Mehta',
  'Joshi',
  'Banerjee',
  'Chatterjee',
  'Mukherjee',
  'Bose',
  'Das',
  'Ghosh',
  'Kulkarni',
  'Bhat',
  'Shetty',
  'Naidu',
  'Pandey',
  'Mishra',
  'Agarwal',
  'Jain',
  'Malhotra',
  'Sinha',
  'Roy',
  'Bhatt',
  'Chauhan',
  'Saxena',
  'Trivedi',
  'Prasad',
];

const LOCATIONS: readonly string[] = [
  'Bengaluru, India',
  'Mumbai, India',
  'Pune, India',
  'Hyderabad, India',
  'Chennai, India',
  'Gurgaon, India',
  'Noida, India',
  'Delhi, India',
  'Kolkata, India',
  'Ahmedabad, India',
  'Jaipur, India',
  'Kochi, India',
  'Coimbatore, India',
  'Indore, India',
  'Chandigarh, India',
  'Remote (India)',
];

const COLLEGES: readonly string[] = [
  'Indian Institute of Technology, Bombay',
  'Indian Institute of Technology, Delhi',
  'Indian Institute of Technology, Madras',
  'Indian Institute of Technology, Kanpur',
  'National Institute of Technology, Trichy',
  'National Institute of Technology, Surathkal',
  'Birla Institute of Technology and Science, Pilani',
  'Delhi Technological University',
  'College of Engineering, Pune',
  'PES University',
  'RV College of Engineering',
  'Vellore Institute of Technology',
  'Manipal Institute of Technology',
  'Anna University',
  'Veermata Jijabai Technological Institute',
  'Jadavpur University',
  'Amrita School of Engineering',
  'SRM Institute of Science and Technology',
  'Thapar Institute of Engineering and Technology',
  'International Institute of Information Technology, Hyderabad',
  'BMS College of Engineering',
  'Netaji Subhas University of Technology',
  'Indian Institute of Science, Bengaluru',
  'Symbiosis Institute of Technology',
  'Christ University',
];

const FIELDS_OF_STUDY: readonly string[] = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Computer Engineering',
  'Mathematics & Computing',
  'Information Systems',
];

// Fragments composed into non-repetitive candidate "about" text.
const ABOUT_OPENERS: readonly string[] = [
  'Engineer who enjoys turning ambiguous problems into shipped product.',
  'Pragmatic builder focused on clean, well-tested code.',
  'Product-minded developer who cares about the end-user experience.',
  'Curious problem-solver who thrives in fast-moving teams.',
  'Backend-leaning generalist who likes owning features end to end.',
  'Detail-oriented engineer with a bias for reliability and observability.',
  'Full-stack developer comfortable across the entire delivery pipeline.',
];
const ABOUT_MIDDLES: readonly string[] = [
  'I have shipped features used by large, growing user bases.',
  'I care deeply about performance, accessibility and maintainability.',
  'I enjoy mentoring peers and improving team engineering practices.',
  'I like collaborating closely with design and product partners.',
  'I have led migrations and incremental rewrites without downtime.',
  'I gravitate towards well-instrumented, testable systems.',
];
const ABOUT_CLOSERS: readonly string[] = [
  'Looking for a role with real ownership and growth.',
  'Excited to work on problems at meaningful scale.',
  'Open to teams that value craft and continuous learning.',
  'Keen to join a mission-driven, high-trust team.',
  'Seeking a collaborative environment with strong engineering culture.',
];

// Fragments composed into non-repetitive job descriptions.
const JOB_INTROS: readonly string[] = [
  'We are looking for a driven engineer to join our team and help build the next generation of our product.',
  'Join a small, focused team shipping high-impact features to a fast-growing user base.',
  'This role sits at the heart of our product and offers a high degree of ownership and autonomy.',
  'We need a hands-on builder who can move fast without compromising on quality.',
  'You will work alongside senior engineers on systems that operate at real scale.',
];
const JOB_RESPONSIBILITIES: readonly string[] = [
  'Design, build and ship features across the stack in close collaboration with product and design.',
  'Own services end to end — from data modelling and API design through deployment and monitoring.',
  'Write clean, well-tested code and participate actively in code reviews.',
  'Improve reliability, performance and developer experience across our platform.',
  'Partner with cross-functional teams to translate requirements into robust technical solutions.',
];
const JOB_CLOSINGS: readonly string[] = [
  'You will have a direct impact on the product roadmap and the people who use it every day.',
  'We offer a supportive culture, competitive compensation and room to grow into leadership.',
  'If you enjoy autonomy, ownership and continuous learning, we would love to hear from you.',
  'This is a great opportunity to grow your craft in a high-trust engineering environment.',
];

interface RoleTemplate {
  readonly base: string;
  readonly skillSlugs: readonly string[];
}

// Role archetypes; a seniority label is composed onto the base at generation time.
const ROLE_TEMPLATES: readonly RoleTemplate[] = [
  {
    base: 'Frontend Engineer',
    skillSlugs: [
      'react',
      'typescript',
      'javascript',
      'nextjs',
      'tailwind-css',
      'redux',
      'html5',
      'css3',
    ],
  },
  {
    base: 'Backend Engineer',
    skillSlugs: [
      'nodejs',
      'express',
      'postgresql',
      'redis',
      'nestjs',
      'graphql',
      'rest-api',
      'microservices',
    ],
  },
  {
    base: 'Full-Stack Engineer',
    skillSlugs: ['react', 'typescript', 'nodejs', 'postgresql', 'nextjs', 'prisma', 'graphql'],
  },
  {
    base: 'Platform Engineer',
    skillSlugs: ['docker', 'kubernetes', 'aws', 'terraform', 'go', 'ci-cd', 'linux'],
  },
  {
    base: 'DevOps Engineer',
    skillSlugs: ['docker', 'kubernetes', 'aws', 'terraform', 'ci-cd', 'ansible', 'prometheus'],
  },
  {
    base: 'Site Reliability Engineer',
    skillSlugs: ['kubernetes', 'aws', 'prometheus', 'grafana', 'go', 'linux', 'system-design'],
  },
  {
    base: 'Data Engineer',
    skillSlugs: ['python', 'spark', 'airflow', 'postgresql', 'aws', 'kafka', 'sql'],
  },
  {
    base: 'Data Scientist',
    skillSlugs: [
      'python',
      'pandas',
      'scikit-learn',
      'tensorflow',
      'sql',
      'statistics',
      'machine-learning',
    ],
  },
  {
    base: 'Machine Learning Engineer',
    skillSlugs: ['python', 'pytorch', 'tensorflow', 'mlops', 'machine-learning', 'aws', 'docker'],
  },
  {
    base: 'Android Engineer',
    skillSlugs: ['kotlin', 'android', 'java', 'rest-api', 'jetpack-compose'],
  },
  { base: 'iOS Engineer', skillSlugs: ['swift', 'ios', 'swiftui', 'rest-api'] },
  { base: 'Mobile Engineer', skillSlugs: ['react-native', 'typescript', 'javascript', 'rest-api'] },
  {
    base: 'QA Engineer',
    skillSlugs: ['selenium', 'cypress', 'playwright', 'jest', 'test-automation'],
  },
  { base: 'Security Engineer', skillSlugs: ['security', 'linux', 'python', 'aws', 'cryptography'] },
  {
    base: 'Product Manager',
    skillSlugs: ['product-strategy', 'roadmapping', 'agile', 'analytics', 'user-research'],
  },
  {
    base: 'Product Designer',
    skillSlugs: ['figma', 'ui-design', 'ux-research', 'prototyping', 'design-systems'],
  },
  {
    base: 'UX Researcher',
    skillSlugs: ['ux-research', 'user-research', 'usability-testing', 'analytics'],
  },
  {
    base: 'Engineering Manager',
    skillSlugs: ['system-design', 'agile', 'leadership', 'architecture'],
  },
  {
    base: 'Solutions Architect',
    skillSlugs: ['aws', 'system-design', 'microservices', 'architecture', 'kubernetes'],
  },
  {
    base: 'Java Engineer',
    skillSlugs: ['java', 'spring-boot', 'postgresql', 'redis', 'kafka', 'microservices'],
  },
  {
    base: 'Python Engineer',
    skillSlugs: ['python', 'django', 'fastapi', 'postgresql', 'celery', 'rest-api'],
  },
  { base: 'Go Engineer', skillSlugs: ['go', 'grpc', 'postgresql', 'kubernetes', 'microservices'] },
  { base: '.NET Engineer', skillSlugs: ['csharp', 'dotnet', 'azure', 'sql-server'] },
  { base: 'Cloud Engineer', skillSlugs: ['aws', 'gcp', 'terraform', 'kubernetes', 'ci-cd'] },
  {
    base: 'Analytics Engineer',
    skillSlugs: ['sql', 'dbt', 'python', 'snowflake', 'data-modeling'],
  },
];

const SENIORITY_BY_LEVEL: Record<ExperienceLevel, readonly string[]> = {
  [ExperienceLevel.INTERNSHIP]: ['Intern'],
  [ExperienceLevel.ENTRY_LEVEL]: ['Junior', 'Associate', ''],
  [ExperienceLevel.MID_LEVEL]: ['', ''],
  [ExperienceLevel.SENIOR]: ['Senior', 'Senior'],
  [ExperienceLevel.LEAD]: ['Lead', 'Staff', 'Principal'],
  [ExperienceLevel.EXECUTIVE]: ['Head of', 'Director of', 'VP of'],
};

interface SalaryBand {
  readonly min: number;
  readonly max: number;
  readonly minExp: number;
  readonly maxExp: number;
}
// Yearly INR bands, keyed by seniority.
const SALARY_BY_LEVEL: Record<ExperienceLevel, SalaryBand> = {
  [ExperienceLevel.INTERNSHIP]: { min: 300000, max: 720000, minExp: 0, maxExp: 1 },
  [ExperienceLevel.ENTRY_LEVEL]: { min: 600000, max: 1200000, minExp: 0, maxExp: 2 },
  [ExperienceLevel.MID_LEVEL]: { min: 1200000, max: 2500000, minExp: 2, maxExp: 6 },
  [ExperienceLevel.SENIOR]: { min: 2500000, max: 4500000, minExp: 5, maxExp: 10 },
  [ExperienceLevel.LEAD]: { min: 4000000, max: 6500000, minExp: 8, maxExp: 14 },
  [ExperienceLevel.EXECUTIVE]: { min: 6000000, max: 12000000, minExp: 10, maxExp: 20 },
};

const DEGREE_BY_LEVEL: Record<EducationLevel, string> = {
  [EducationLevel.HIGH_SCHOOL]: 'Higher Secondary',
  [EducationLevel.DIPLOMA]: 'Diploma',
  [EducationLevel.BACHELORS]: 'B.Tech',
  [EducationLevel.MASTERS]: 'M.Tech',
  [EducationLevel.DOCTORATE]: 'Ph.D.',
  [EducationLevel.OTHER]: 'Certificate',
};

// ---------------------------------------------------------------------------
// Reference data: companies + skills
// ---------------------------------------------------------------------------

interface CompanyDef {
  readonly name: string;
  readonly slug: string;
  readonly industry: string;
  readonly size: CompanySize;
  readonly location: string;
}

const COMPANY_DEFS: readonly CompanyDef[] = [
  {
    name: 'Acme Cloud',
    slug: 'acme-cloud',
    industry: 'Cloud Infrastructure',
    size: CompanySize.LARGE,
    location: 'Bengaluru, India',
  },
  {
    name: 'Fintrek',
    slug: 'fintrek',
    industry: 'Financial Services',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, India',
  },
  {
    name: 'HealthSync',
    slug: 'healthsync',
    industry: 'Healthcare Technology',
    size: CompanySize.MEDIUM,
    location: 'Pune, India',
  },
  {
    name: 'DataForge',
    slug: 'dataforge',
    industry: 'Data & Analytics',
    size: CompanySize.STARTUP,
    location: 'Remote (India)',
  },
  {
    name: 'Nimbus Retail',
    slug: 'nimbus-retail',
    industry: 'E-commerce',
    size: CompanySize.LARGE,
    location: 'Bengaluru, India',
  },
  {
    name: 'Voltride Mobility',
    slug: 'voltride-mobility',
    industry: 'Mobility & Transport',
    size: CompanySize.MEDIUM,
    location: 'Gurgaon, India',
  },
  {
    name: 'Lumen Media',
    slug: 'lumen-media',
    industry: 'Media & Entertainment',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, India',
  },
  {
    name: 'AgriNova',
    slug: 'agrinova',
    industry: 'AgriTech',
    size: CompanySize.SMALL,
    location: 'Hyderabad, India',
  },
  {
    name: 'EduSpark',
    slug: 'eduspark',
    industry: 'EdTech',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, India',
  },
  {
    name: 'SecurePay',
    slug: 'securepay',
    industry: 'Payments',
    size: CompanySize.LARGE,
    location: 'Chennai, India',
  },
  {
    name: 'CloudKart',
    slug: 'cloudkart',
    industry: 'E-commerce',
    size: CompanySize.ENTERPRISE,
    location: 'Bengaluru, India',
  },
  {
    name: 'Meridian Labs',
    slug: 'meridian-labs',
    industry: 'Artificial Intelligence',
    size: CompanySize.STARTUP,
    location: 'Remote (India)',
  },
  {
    name: 'Skyline Games',
    slug: 'skyline-games',
    industry: 'Gaming',
    size: CompanySize.SMALL,
    location: 'Pune, India',
  },
  {
    name: 'GreenGrid Energy',
    slug: 'greengrid-energy',
    industry: 'CleanTech',
    size: CompanySize.MEDIUM,
    location: 'Ahmedabad, India',
  },
  {
    name: 'Trailhead Logistics',
    slug: 'trailhead-logistics',
    industry: 'Logistics',
    size: CompanySize.LARGE,
    location: 'Noida, India',
  },
  {
    name: 'Beacon Health',
    slug: 'beacon-health',
    industry: 'Healthcare Technology',
    size: CompanySize.SMALL,
    location: 'Kochi, India',
  },
  {
    name: 'Quantex Systems',
    slug: 'quantex-systems',
    industry: 'Enterprise Software',
    size: CompanySize.ENTERPRISE,
    location: 'Hyderabad, India',
  },
  {
    name: 'Pixelbloom Studio',
    slug: 'pixelbloom-studio',
    industry: 'Design & Creative',
    size: CompanySize.STARTUP,
    location: 'Bengaluru, India',
  },
  {
    name: 'Orbit Telecom',
    slug: 'orbit-telecom',
    industry: 'Telecommunications',
    size: CompanySize.LARGE,
    location: 'Delhi, India',
  },
  {
    name: 'BrightHire HR',
    slug: 'brighthire-hr',
    industry: 'HR Technology',
    size: CompanySize.MEDIUM,
    location: 'Gurgaon, India',
  },
  {
    name: 'Cobalt Security',
    slug: 'cobalt-security',
    industry: 'Cybersecurity',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, India',
  },
  {
    name: 'Harborview Travel',
    slug: 'harborview-travel',
    industry: 'Travel & Hospitality',
    size: CompanySize.SMALL,
    location: 'Jaipur, India',
  },
  {
    name: 'Northwind Bank',
    slug: 'northwind-bank',
    industry: 'Banking',
    size: CompanySize.ENTERPRISE,
    location: 'Mumbai, India',
  },
  {
    name: 'Zephyr Analytics',
    slug: 'zephyr-analytics',
    industry: 'Data & Analytics',
    size: CompanySize.STARTUP,
    location: 'Remote (India)',
  },
];

interface SkillDef {
  readonly name: string;
  readonly slug: string;
}

// The original 20 skills — slugs MUST stay identical (the frontend depends on them).
const CORE_SKILLS: readonly SkillDef[] = [
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

// 85 additional realistic tech / data / design / product skills (unique slugs).
const EXTRA_SKILLS: readonly SkillDef[] = [
  { name: 'Vue.js', slug: 'vuejs' },
  { name: 'Angular', slug: 'angular' },
  { name: 'Svelte', slug: 'svelte' },
  { name: 'Redux', slug: 'redux' },
  { name: 'HTML5', slug: 'html5' },
  { name: 'CSS3', slug: 'css3' },
  { name: 'Sass', slug: 'sass' },
  { name: 'Webpack', slug: 'webpack' },
  { name: 'Vite', slug: 'vite' },
  { name: 'React Native', slug: 'react-native' },
  { name: 'NestJS', slug: 'nestjs' },
  { name: 'FastAPI', slug: 'fastapi' },
  { name: 'Flask', slug: 'flask' },
  { name: 'Ruby on Rails', slug: 'ruby-on-rails' },
  { name: 'Laravel', slug: 'laravel' },
  { name: 'ASP.NET', slug: 'dotnet' },
  { name: 'C#', slug: 'csharp' },
  { name: 'C++', slug: 'cpp' },
  { name: 'Rust', slug: 'rust' },
  { name: 'Kotlin', slug: 'kotlin' },
  { name: 'Swift', slug: 'swift' },
  { name: 'SwiftUI', slug: 'swiftui' },
  { name: 'Jetpack Compose', slug: 'jetpack-compose' },
  { name: 'Android', slug: 'android' },
  { name: 'iOS', slug: 'ios' },
  { name: 'Scala', slug: 'scala' },
  { name: 'PHP', slug: 'php' },
  { name: 'Ruby', slug: 'ruby' },
  { name: 'MySQL', slug: 'mysql' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'Cassandra', slug: 'cassandra' },
  { name: 'Elasticsearch', slug: 'elasticsearch' },
  { name: 'SQL Server', slug: 'sql-server' },
  { name: 'SQL', slug: 'sql' },
  { name: 'Snowflake', slug: 'snowflake' },
  { name: 'dbt', slug: 'dbt' },
  { name: 'Apache Kafka', slug: 'kafka' },
  { name: 'Apache Spark', slug: 'spark' },
  { name: 'Apache Airflow', slug: 'airflow' },
  { name: 'Hadoop', slug: 'hadoop' },
  { name: 'Data Modeling', slug: 'data-modeling' },
  { name: 'Terraform', slug: 'terraform' },
  { name: 'Ansible', slug: 'ansible' },
  { name: 'Jenkins', slug: 'jenkins' },
  { name: 'CI/CD', slug: 'ci-cd' },
  { name: 'GitHub Actions', slug: 'github-actions' },
  { name: 'Prometheus', slug: 'prometheus' },
  { name: 'Grafana', slug: 'grafana' },
  { name: 'Linux', slug: 'linux' },
  { name: 'gRPC', slug: 'grpc' },
  { name: 'REST APIs', slug: 'rest-api' },
  { name: 'Microservices', slug: 'microservices' },
  { name: 'Architecture', slug: 'architecture' },
  { name: 'GCP', slug: 'gcp' },
  { name: 'Azure', slug: 'azure' },
  { name: 'Celery', slug: 'celery' },
  { name: 'Pandas', slug: 'pandas' },
  { name: 'NumPy', slug: 'numpy' },
  { name: 'scikit-learn', slug: 'scikit-learn' },
  { name: 'TensorFlow', slug: 'tensorflow' },
  { name: 'PyTorch', slug: 'pytorch' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Deep Learning', slug: 'deep-learning' },
  { name: 'MLOps', slug: 'mlops' },
  { name: 'Statistics', slug: 'statistics' },
  { name: 'Selenium', slug: 'selenium' },
  { name: 'Cypress', slug: 'cypress' },
  { name: 'Playwright', slug: 'playwright' },
  { name: 'Jest', slug: 'jest' },
  { name: 'Test Automation', slug: 'test-automation' },
  { name: 'Cryptography', slug: 'cryptography' },
  { name: 'Security', slug: 'security' },
  { name: 'Figma', slug: 'figma' },
  { name: 'UI Design', slug: 'ui-design' },
  { name: 'UX Research', slug: 'ux-research' },
  { name: 'User Research', slug: 'user-research' },
  { name: 'Usability Testing', slug: 'usability-testing' },
  { name: 'Prototyping', slug: 'prototyping' },
  { name: 'Design Systems', slug: 'design-systems' },
  { name: 'Product Strategy', slug: 'product-strategy' },
  { name: 'Roadmapping', slug: 'roadmapping' },
  { name: 'Agile', slug: 'agile' },
  { name: 'Leadership', slug: 'leadership' },
  { name: 'Analytics', slug: 'analytics' },
];

const ALL_SKILLS: readonly SkillDef[] = [...CORE_SKILLS, ...EXTRA_SKILLS];

// ---------------------------------------------------------------------------
// Named demo accounts (preserved exactly — documented logins keep working)
// ---------------------------------------------------------------------------

interface NamedCandidate {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly headline: string;
  readonly currentLocation: string;
  readonly currentCompany: string;
  readonly currentTitle: string;
  readonly totalExperienceMonths: number;
  readonly highestEducation: EducationLevel;
  readonly skillSlugs: readonly string[];
}

// The primary candidate (candidate@test.com / Candidate@1234).
const PRIMARY_CANDIDATE: NamedCandidate = {
  email: PRIMARY_CANDIDATE_EMAIL,
  firstName: 'Priya',
  lastName: 'Sharma',
  headline: 'Senior Full-Stack Engineer · React + Node.js',
  currentLocation: 'Bengaluru, India',
  currentCompany: 'Techwave Solutions',
  currentTitle: 'Senior Software Engineer',
  totalExperienceMonths: 72,
  highestEducation: EducationLevel.MASTERS,
  skillSlugs: ['react', 'typescript', 'nodejs', 'express', 'postgresql', 'prisma', 'aws'],
};

// Named secondary candidates (…@test.com / Password@123) from the original seed.
const NAMED_CANDIDATES: readonly NamedCandidate[] = [
  {
    email: 'rahul.verma@test.com',
    firstName: 'Rahul',
    lastName: 'Verma',
    headline: 'Backend Engineer · Node.js & PostgreSQL',
    currentLocation: 'Pune, India',
    currentCompany: 'Infosys',
    currentTitle: 'Software Engineer',
    totalExperienceMonths: 48,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['nodejs', 'express', 'postgresql', 'redis', 'docker'],
  },
  {
    email: 'ananya.iyer@test.com',
    firstName: 'Ananya',
    lastName: 'Iyer',
    headline: 'Frontend Engineer · React & TypeScript',
    currentLocation: 'Bengaluru, India',
    currentCompany: 'Flipkart',
    currentTitle: 'Frontend Engineer',
    totalExperienceMonths: 36,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['react', 'typescript', 'javascript', 'nextjs', 'tailwind-css'],
  },
  {
    email: 'mohammed.khan@test.com',
    firstName: 'Mohammed',
    lastName: 'Khan',
    headline: 'Platform Engineer · Kubernetes & AWS',
    currentLocation: 'Hyderabad, India',
    currentCompany: 'Amazon',
    currentTitle: 'Systems Development Engineer',
    totalExperienceMonths: 84,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['docker', 'kubernetes', 'aws', 'go', 'system-design'],
  },
  {
    email: 'sneha.reddy@test.com',
    firstName: 'Sneha',
    lastName: 'Reddy',
    headline: 'Junior Full-Stack Developer',
    currentLocation: 'Chennai, India',
    currentCompany: 'Zoho',
    currentTitle: 'Associate Software Engineer',
    totalExperienceMonths: 14,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['javascript', 'react', 'nodejs', 'postgresql'],
  },
  {
    email: 'arjun.nair@test.com',
    firstName: 'Arjun',
    lastName: 'Nair',
    headline: 'Data Engineer · Python & Analytics',
    currentLocation: 'Bengaluru, India',
    currentCompany: 'Swiggy',
    currentTitle: 'Data Engineer',
    totalExperienceMonths: 60,
    highestEducation: EducationLevel.MASTERS,
    skillSlugs: ['python', 'django', 'postgresql', 'aws', 'system-design'],
  },
  {
    email: 'kavya.menon@test.com',
    firstName: 'Kavya',
    lastName: 'Menon',
    headline: 'Backend Engineer · Java & Spring Boot',
    currentLocation: 'Mumbai, India',
    currentCompany: 'ICICI Bank',
    currentTitle: 'Senior Engineer',
    totalExperienceMonths: 96,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['java', 'spring-boot', 'postgresql', 'redis', 'system-design'],
  },
  {
    email: 'ishita.gupta@test.com',
    firstName: 'Ishita',
    lastName: 'Gupta',
    headline: 'Full-Stack Engineer · Next.js & Node.js',
    currentLocation: 'Gurgaon, India',
    currentCompany: 'Paytm',
    currentTitle: 'Software Engineer II',
    totalExperienceMonths: 54,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['react', 'nextjs', 'nodejs', 'typescript', 'graphql'],
  },
];

// Named secondary HR accounts (…@test.com / Password@123) from the original seed.
interface NamedHr {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly companySlug: string;
  readonly designation: string;
}
const NAMED_HR: readonly NamedHr[] = [
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

const HR_DESIGNATIONS: readonly string[] = [
  'Recruiter',
  'Senior Recruiter',
  'Talent Acquisition Specialist',
  'Talent Acquisition Lead',
  'Technical Recruiter',
  'HR Manager',
  'People Operations Lead',
  'Head of Talent',
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Reads a required value from a lookup map, throwing if the key is missing. */
function requireId(lookup: Map<string, string>, key: string): string {
  const value = lookup.get(key);
  if (!value) {
    throw new Error(`Seed lookup failed: no id found for "${key}".`);
  }
  return value;
}

async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

// ---------------------------------------------------------------------------
// Cleanup (FK-safe order) — extends the original approach.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

async function seedCompanies(): Promise<Map<string, string>> {
  const companyIdBySlug = new Map<string, string>();
  const rows: Prisma.CompanyCreateManyInput[] = COMPANY_DEFS.map((company) => {
    const id = randomUUID();
    companyIdBySlug.set(company.slug, id);
    return {
      id,
      name: company.name,
      slug: company.slug,
      website: `https://${company.slug}.example.com`,
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}`,
      about: `${company.name} is a ${company.size.toLowerCase()} ${company.industry.toLowerCase()} company headquartered in ${company.location}, building products loved by their customers.`,
      industry: company.industry,
      size: company.size,
      location: company.location,
    };
  });
  await prisma.company.createMany({ data: rows });
  return companyIdBySlug;
}

async function seedSkills(): Promise<Map<string, string>> {
  const skillIdBySlug = new Map<string, string>();
  const rows: Prisma.SkillCreateManyInput[] = ALL_SKILLS.map((skill) => {
    const id = randomUUID();
    skillIdBySlug.set(skill.slug, id);
    return { id, name: skill.name, slug: skill.slug };
  });
  await prisma.skill.createMany({ data: rows });
  return skillIdBySlug;
}

// ---------------------------------------------------------------------------
// HR users
// ---------------------------------------------------------------------------

interface HrRecord {
  readonly userId: string;
  readonly companySlug: string;
}

/**
 * Creates HR users: the primary admin, the named secondaries, then enough
 * generated recruiters to reach the target — each linked to a company so every
 * company has at least one HR owner. Returns the primary HR id and the full
 * roster grouped by company.
 */
async function seedHrUsers(companyIdBySlug: Map<string, string>): Promise<{
  primaryHrUserId: string;
  hrUserIdsByCompanySlug: Map<string, string[]>;
}> {
  const primaryHash = await hashPassword(PRIMARY_HR_PASSWORD);
  const demoHash = await hashPassword(DEMO_USER_PASSWORD);

  const userRows: Prisma.UserCreateManyInput[] = [];
  const profileRows: Prisma.HrProfileCreateManyInput[] = [];
  const hrRecords: HrRecord[] = [];
  const usedEmails = new Set<string>();

  const addHr = (params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companySlug: string;
    designation: string;
    createdAt: Date;
  }): string => {
    const userId = randomUUID();
    usedEmails.add(params.email);
    userRows.push({
      id: userId,
      email: params.email,
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      role: UserRole.HR,
      createdAt: params.createdAt,
    });
    profileRows.push({
      id: randomUUID(),
      userId,
      companyId: requireId(companyIdBySlug, params.companySlug),
      designation: params.designation,
    });
    hrRecords.push({ userId, companySlug: params.companySlug });
    return userId;
  };

  // Primary HR — Acme Cloud.
  const primaryHrUserId = addHr({
    email: PRIMARY_HR_EMAIL,
    passwordHash: primaryHash,
    firstName: 'Aisha',
    lastName: 'Khan',
    companySlug: 'acme-cloud',
    designation: 'Talent Acquisition Lead',
    createdAt: daysAgo(300),
  });

  // Named secondary HR accounts.
  for (const hr of NAMED_HR) {
    addHr({
      email: hr.email,
      passwordHash: demoHash,
      firstName: hr.firstName,
      lastName: hr.lastName,
      companySlug: hr.companySlug,
      designation: hr.designation,
      createdAt: daysAgo(randInt(200, 300)),
    });
  }

  // Ensure every remaining company has at least one HR, then fill to target.
  const remainingSlugs = COMPANY_DEFS.map((company) => company.slug).filter(
    (slug) => !hrRecords.some((record) => record.companySlug === slug),
  );

  let counter = 0;
  const nextGeneratedHr = (companySlug: string): void => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    let email = `hr.${firstName}.${lastName}.${companySlug}`.toLowerCase().replace(/\s+/g, '');
    email = `${email}@talentflow.dev`;
    while (usedEmails.has(email)) {
      counter += 1;
      email =
        `hr.${firstName}.${lastName}.${companySlug}.${counter}`.toLowerCase().replace(/\s+/g, '') +
        '@talentflow.dev';
    }
    addHr({
      email,
      passwordHash: demoHash,
      firstName,
      lastName,
      companySlug,
      designation: pick(HR_DESIGNATIONS),
      createdAt: daysAgo(randInt(120, 300)),
    });
  };

  for (const slug of remainingSlugs) {
    nextGeneratedHr(slug);
  }
  const companySlugs = COMPANY_DEFS.map((company) => company.slug);
  while (userRows.length < TARGET_HR_USERS) {
    nextGeneratedHr(pick(companySlugs));
  }

  await insertInBatches(userRows, (batch) => prisma.user.createMany({ data: batch }));
  await insertInBatches(profileRows, (batch) => prisma.hrProfile.createMany({ data: batch }));

  const hrUserIdsByCompanySlug = new Map<string, string[]>();
  for (const record of hrRecords) {
    const list = hrUserIdsByCompanySlug.get(record.companySlug) ?? [];
    list.push(record.userId);
    hrUserIdsByCompanySlug.set(record.companySlug, list);
  }

  return { primaryHrUserId, hrUserIdsByCompanySlug };
}

// ---------------------------------------------------------------------------
// Candidates (users + profiles + skills + education)
// ---------------------------------------------------------------------------

interface CandidateRecord {
  readonly candidateProfileId: string;
  readonly email: string;
  readonly totalExperienceMonths: number;
  readonly skillSlugs: readonly string[];
}

function composeAbout(): string {
  return `${pick(ABOUT_OPENERS)} ${pick(ABOUT_MIDDLES)} ${pick(ABOUT_CLOSERS)}`;
}

function experienceToLevel(months: number): ExperienceLevel {
  if (months < 12) return ExperienceLevel.INTERNSHIP;
  if (months < 30) return ExperienceLevel.ENTRY_LEVEL;
  if (months < 78) return ExperienceLevel.MID_LEVEL;
  if (months < 132) return ExperienceLevel.SENIOR;
  return ExperienceLevel.LEAD;
}

function educationForCandidate(
  candidateProfileId: string,
  highestEducation: EducationLevel,
  totalExperienceMonths: number,
): Prisma.EducationEntryCreateManyInput[] {
  const graduationYear = new Date().getFullYear() - Math.floor(totalExperienceMonths / 12) - 1;
  const rows: Prisma.EducationEntryCreateManyInput[] = [];

  const bachelorsEnd =
    highestEducation === EducationLevel.MASTERS ? graduationYear - 2 : graduationYear;
  rows.push({
    id: randomUUID(),
    candidateProfileId,
    institution: pick(COLLEGES),
    degree: DEGREE_BY_LEVEL[EducationLevel.BACHELORS],
    level: EducationLevel.BACHELORS,
    fieldOfStudy: pick(FIELDS_OF_STUDY),
    startYear: bachelorsEnd - 4,
    endYear: bachelorsEnd,
    grade: `${(7 + rng() * 3).toFixed(1)} CGPA`,
  });

  if (
    highestEducation === EducationLevel.MASTERS ||
    highestEducation === EducationLevel.DOCTORATE
  ) {
    rows.push({
      id: randomUUID(),
      candidateProfileId,
      institution: pick(COLLEGES),
      degree: DEGREE_BY_LEVEL[EducationLevel.MASTERS],
      level: EducationLevel.MASTERS,
      fieldOfStudy: pick(FIELDS_OF_STUDY),
      startYear: graduationYear - 2,
      endYear: graduationYear,
      grade: `${(7.5 + rng() * 2.5).toFixed(1)} CGPA`,
    });
  }

  return rows;
}

function candidateSkillsFor(
  candidateProfileId: string,
  skillSlugs: readonly string[],
  skillIdBySlug: Map<string, string>,
): Prisma.CandidateSkillCreateManyInput[] {
  const proficiencies: readonly ProficiencyLevel[] = [
    ProficiencyLevel.BEGINNER,
    ProficiencyLevel.INTERMEDIATE,
    ProficiencyLevel.ADVANCED,
    ProficiencyLevel.EXPERT,
  ];
  return skillSlugs.map((slug) => ({
    id: randomUUID(),
    candidateProfileId,
    skillId: requireId(skillIdBySlug, slug),
    proficiency: pick(proficiencies),
    yearsOfExperience: randInt(1, 8),
  }));
}

async function seedCandidates(skillIdBySlug: Map<string, string>): Promise<CandidateRecord[]> {
  const demoHash = await hashPassword(DEMO_USER_PASSWORD);
  const primaryHash = await hashPassword(PRIMARY_CANDIDATE_PASSWORD);

  const userRows: Prisma.UserCreateManyInput[] = [];
  const profileRows: Prisma.CandidateProfileCreateManyInput[] = [];
  const skillRows: Prisma.CandidateSkillCreateManyInput[] = [];
  const educationRows: Prisma.EducationEntryCreateManyInput[] = [];
  const records: CandidateRecord[] = [];
  const usedEmails = new Set<string>();

  const allSkillSlugs = ALL_SKILLS.map((skill) => skill.slug);

  const addCandidate = (params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    headline: string;
    currentLocation: string;
    currentCompany: string;
    currentTitle: string;
    totalExperienceMonths: number;
    highestEducation: EducationLevel;
    skillSlugs: readonly string[];
    createdAt: Date;
  }): void => {
    const userId = randomUUID();
    const candidateProfileId = randomUUID();
    usedEmails.add(params.email);

    userRows.push({
      id: userId,
      email: params.email,
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      role: UserRole.CANDIDATE,
      createdAt: params.createdAt,
    });

    const expectedMin = 600000 + Math.round(params.totalExperienceMonths * 22000);
    profileRows.push({
      id: candidateProfileId,
      userId,
      headline: params.headline,
      about: composeAbout(),
      phone: `+91 ${randInt(70, 99)}${randInt(100, 999)} ${randInt(10000, 99999)}`,
      currentLocation: params.currentLocation,
      preferredLocation: chance(0.35) ? 'Remote' : pick(LOCATIONS),
      currentCompany: params.currentCompany,
      currentTitle: params.currentTitle,
      totalExperienceMonths: params.totalExperienceMonths,
      highestEducation: params.highestEducation,
      expectedSalaryMin: expectedMin,
      expectedSalaryMax: expectedMin + randInt(400000, 1200000),
      noticePeriodDays: pick([0, 15, 30, 45, 60, 90] as const),
      isOpenToWork: chance(0.82),
      resumeUrl: `https://resumes.talentflow.dev/${userId}.pdf`,
      createdAt: params.createdAt,
    });

    skillRows.push(...candidateSkillsFor(candidateProfileId, params.skillSlugs, skillIdBySlug));
    educationRows.push(
      ...educationForCandidate(
        candidateProfileId,
        params.highestEducation,
        params.totalExperienceMonths,
      ),
    );

    records.push({
      candidateProfileId,
      email: params.email,
      totalExperienceMonths: params.totalExperienceMonths,
      skillSlugs: params.skillSlugs,
    });
  };

  // Primary + named candidates (preserved exactly).
  const namedList: ReadonlyArray<{ candidate: NamedCandidate; hash: string }> = [
    { candidate: PRIMARY_CANDIDATE, hash: primaryHash },
    ...NAMED_CANDIDATES.map((candidate) => ({ candidate, hash: demoHash })),
  ];
  for (const { candidate, hash } of namedList) {
    addCandidate({
      email: candidate.email,
      passwordHash: hash,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      headline: candidate.headline,
      currentLocation: candidate.currentLocation,
      currentCompany: candidate.currentCompany,
      currentTitle: candidate.currentTitle,
      totalExperienceMonths: candidate.totalExperienceMonths,
      highestEducation: candidate.highestEducation,
      skillSlugs: candidate.skillSlugs,
      createdAt: daysAgo(randInt(120, 320)),
    });
  }

  // Generated candidates to reach the target volume.
  const titlePool = ROLE_TEMPLATES.map((role) => role.base);
  const companyNamePool = [
    ...COMPANY_DEFS.map((company) => company.name),
    'Infosys',
    'TCS',
    'Wipro',
    'Accenture',
    'Cognizant',
    'Google',
    'Microsoft',
    'Freelance',
  ];
  let counter = 0;
  while (userRows.length < TARGET_CANDIDATES) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    let email = `${firstName}.${lastName}${counter}`.toLowerCase() + '@mail.talentflow.dev';
    while (usedEmails.has(email)) {
      counter += 1;
      email = `${firstName}.${lastName}${counter}`.toLowerCase() + '@mail.talentflow.dev';
    }
    counter += 1;

    const totalExperienceMonths = randInt(0, 168);
    const level = experienceToLevel(totalExperienceMonths);
    const highestEducation = weightedPick<EducationLevel>([
      [EducationLevel.BACHELORS, 6],
      [EducationLevel.MASTERS, 3],
      [EducationLevel.DIPLOMA, 1],
      [EducationLevel.DOCTORATE, 1],
    ]);
    const role = pick(ROLE_TEMPLATES);
    const seniority = pick(SENIORITY_BY_LEVEL[level]);
    const currentTitle = `${seniority} ${role.base}`.trim();
    const primarySkills = pickDistinct(
      role.skillSlugs,
      randInt(3, Math.min(6, role.skillSlugs.length)),
    );
    const extraSkills = pickDistinct(allSkillSlugs, randInt(0, 3));
    const skillSlugs = [...new Set([...primarySkills, ...extraSkills])];

    addCandidate({
      email,
      passwordHash: demoHash,
      firstName,
      lastName,
      headline: `${currentTitle} · ${pick(titlePool)} background`,
      currentLocation: pick(LOCATIONS),
      currentCompany: pick(companyNamePool),
      currentTitle,
      totalExperienceMonths,
      highestEducation,
      skillSlugs,
      createdAt: daysAgo(randInt(30, 340)),
    });
  }

  await insertInBatches(userRows, (batch) => prisma.user.createMany({ data: batch }));
  await insertInBatches(profileRows, (batch) =>
    prisma.candidateProfile.createMany({ data: batch }),
  );
  await insertInBatches(skillRows, (batch) => prisma.candidateSkill.createMany({ data: batch }));
  await insertInBatches(educationRows, (batch) =>
    prisma.educationEntry.createMany({ data: batch }),
  );

  return records;
}

// ---------------------------------------------------------------------------
// Jobs (+ job skills)
// ---------------------------------------------------------------------------

interface JobRecord {
  readonly jobId: string;
  readonly postedById: string;
  readonly status: JobStatus;
  readonly createdAt: Date;
}

function composeJobDescription(roleBase: string, companyName: string): string {
  return [
    pick(JOB_INTROS),
    `As a ${roleBase} at ${companyName}, you will:`,
    `• ${pick(JOB_RESPONSIBILITIES)}`,
    `• ${pick(JOB_RESPONSIBILITIES)}`,
    `• ${pick(JOB_RESPONSIBILITIES)}`,
    pick(JOB_CLOSINGS),
  ].join('\n');
}

async function seedJobs(
  companyIdBySlug: Map<string, string>,
  skillIdBySlug: Map<string, string>,
  hrUserIdsByCompanySlug: Map<string, string[]>,
): Promise<JobRecord[]> {
  const jobRows: Prisma.JobCreateManyInput[] = [];
  const jobSkillRows: Prisma.JobSkillCreateManyInput[] = [];
  const records: JobRecord[] = [];

  const companySlugs = COMPANY_DEFS.map((company) => company.slug);
  const companyNameBySlug = new Map(COMPANY_DEFS.map((company) => [company.slug, company.name]));

  const levels: ReadonlyArray<readonly [ExperienceLevel, number]> = [
    [ExperienceLevel.INTERNSHIP, 1],
    [ExperienceLevel.ENTRY_LEVEL, 2],
    [ExperienceLevel.MID_LEVEL, 4],
    [ExperienceLevel.SENIOR, 4],
    [ExperienceLevel.LEAD, 2],
    [ExperienceLevel.EXECUTIVE, 1],
  ];
  const employmentTypes: ReadonlyArray<readonly [EmploymentType, number]> = [
    [EmploymentType.FULL_TIME, 8],
    [EmploymentType.CONTRACT, 2],
    [EmploymentType.INTERNSHIP, 1],
    [EmploymentType.PART_TIME, 1],
    [EmploymentType.FREELANCE, 1],
  ];
  const locationTypes: ReadonlyArray<readonly [LocationType, number]> = [
    [LocationType.ONSITE, 3],
    [LocationType.HYBRID, 4],
    [LocationType.REMOTE, 3],
  ];
  const statuses: ReadonlyArray<readonly [JobStatus, number]> = [
    [JobStatus.PUBLISHED, 7],
    [JobStatus.DRAFT, 2],
    [JobStatus.CLOSED, 1],
  ];

  for (let i = 0; i < TARGET_JOBS; i += 1) {
    // Bias a healthy share of jobs to Acme Cloud so the primary HR has a full board.
    const companySlug = i < 24 ? 'acme-cloud' : pick(companySlugs);
    const companyName = companyNameBySlug.get(companySlug) ?? companySlug;
    const hrPool = hrUserIdsByCompanySlug.get(companySlug) ?? [];
    if (hrPool.length === 0) {
      throw new Error(`No HR user available for company "${companySlug}".`);
    }
    const postedById = pick(hrPool);

    const role = pick(ROLE_TEMPLATES);
    const experienceLevel = weightedPick(levels);
    const employmentType =
      experienceLevel === ExperienceLevel.INTERNSHIP
        ? EmploymentType.INTERNSHIP
        : weightedPick(employmentTypes);
    const locationType = weightedPick(locationTypes);
    const status = i < 24 ? JobStatus.PUBLISHED : weightedPick(statuses);
    const band = SALARY_BY_LEVEL[experienceLevel];
    const salaryMin = band.min + randInt(0, 3) * 100000;
    const salaryMax = salaryMin + randInt(3, 12) * 100000;

    const seniority = pick(SENIORITY_BY_LEVEL[experienceLevel]);
    const title =
      experienceLevel === ExperienceLevel.EXECUTIVE
        ? `${seniority} ${role.base.replace(/ (Engineer|Manager|Designer|Researcher|Architect)$/, '')}`.trim()
        : `${seniority} ${role.base}`.trim();

    const createdAt = daysAgo(randInt(1, 240));
    const jobId = randomUUID();

    jobRows.push({
      id: jobId,
      companyId: requireId(companyIdBySlug, companySlug),
      postedById,
      title,
      description: composeJobDescription(role.base, companyName),
      employmentType,
      experienceLevel,
      locationType,
      location: locationType === LocationType.REMOTE ? 'Remote (India)' : pick(LOCATIONS),
      minExperienceYears: band.minExp,
      maxExperienceYears: band.maxExp,
      salaryMin,
      salaryMax,
      salaryPeriod: SalaryPeriod.YEARLY,
      openings: randInt(1, 5),
      status,
      publishedAt: status === JobStatus.PUBLISHED || status === JobStatus.CLOSED ? createdAt : null,
      createdAt,
    });

    // 3–8 connected skills with a required/optional mix.
    const skillCount = randInt(3, Math.min(8, role.skillSlugs.length));
    const chosen = pickDistinct(role.skillSlugs, skillCount);
    chosen.forEach((slug, index) => {
      jobSkillRows.push({
        id: randomUUID(),
        jobId,
        skillId: requireId(skillIdBySlug, slug),
        // First ~half are required (must-haves), the rest are nice-to-haves.
        isRequired: index < Math.ceil(skillCount / 2),
      });
    });

    records.push({ jobId, postedById, status, createdAt });
  }

  await insertInBatches(jobRows, (batch) => prisma.job.createMany({ data: batch }));
  await insertInBatches(jobSkillRows, (batch) => prisma.jobSkill.createMany({ data: batch }));

  return records;
}

// ---------------------------------------------------------------------------
// Applications (+ status-event audit trail)
// ---------------------------------------------------------------------------

// Ordered hiring pipeline; a flow is a prefix ending at the chosen final status.
const PIPELINE_ORDER: readonly ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
  ApplicationStatus.HIRED,
];

const COVER_LETTERS: readonly string[] = [
  'I am excited about this role and believe my experience is a strong match for the team.',
  'This opportunity aligns closely with my skills and the kind of impact I want to have.',
  'I have shipped similar systems before and would love to bring that experience to your team.',
  'Your product resonates with me and I am confident I can contribute from day one.',
  'I enjoy the problem space you are working in and would be thrilled to help you scale it.',
];

/** Builds the ordered status flow that terminates at `finalStatus`. */
function buildStatusFlow(finalStatus: ApplicationStatus): ApplicationStatus[] {
  if (finalStatus === ApplicationStatus.REJECTED || finalStatus === ApplicationStatus.WITHDRAWN) {
    // Progress a little way down the pipeline, then terminate.
    const depth = randInt(1, 3);
    return [...PIPELINE_ORDER.slice(0, depth), finalStatus];
  }
  const endIndex = PIPELINE_ORDER.indexOf(finalStatus);
  return PIPELINE_ORDER.slice(0, endIndex + 1);
}

async function seedApplications(
  candidates: readonly CandidateRecord[],
  jobs: readonly JobRecord[],
): Promise<number> {
  const applicationRows: Prisma.ApplicationCreateManyInput[] = [];
  const eventRows: Prisma.ApplicationStatusEventCreateManyInput[] = [];

  const openJobs = jobs.filter(
    (job) => job.status === JobStatus.PUBLISHED || job.status === JobStatus.CLOSED,
  );
  if (openJobs.length === 0) {
    throw new Error('No open jobs available to receive applications.');
  }

  // Give each job an intrinsic "popularity" weight so some jobs attract many
  // applicants and others few (realistic long-tail distribution).
  const jobWeights = new Map<string, number>();
  for (const job of openJobs) {
    jobWeights.set(
      job.jobId,
      weightedPick<number>([
        [1, 5],
        [3, 3],
        [6, 2],
        [12, 1],
      ]),
    );
  }
  const jobById = new Map(jobs.map((job) => [job.jobId, job]));

  const finalStatusDistribution: ReadonlyArray<readonly [ApplicationStatus, number]> = [
    [ApplicationStatus.APPLIED, 34],
    [ApplicationStatus.UNDER_REVIEW, 22],
    [ApplicationStatus.SHORTLISTED, 12],
    [ApplicationStatus.INTERVIEW, 9],
    [ApplicationStatus.OFFERED, 4],
    [ApplicationStatus.HIRED, 3],
    [ApplicationStatus.REJECTED, 13],
    [ApplicationStatus.WITHDRAWN, 3],
  ];

  const taken = new Set<string>(); // `${jobId}:${candidateProfileId}` — enforces the unique constraint.

  const addApplication = (params: {
    jobId: string;
    candidateProfileId: string;
    finalStatus: ApplicationStatus;
  }): boolean => {
    const key = `${params.jobId}:${params.candidateProfileId}`;
    if (taken.has(key)) {
      return false;
    }
    const job = jobById.get(params.jobId);
    if (!job) {
      return false;
    }
    taken.add(key);

    // Application is created after the job went live; spread across recent months.
    const jobAgeDays = Math.max(
      1,
      Math.floor((Date.now() - job.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const appliedDaysAgo = randInt(0, Math.min(jobAgeDays, 180));
    const createdAt = daysAgo(appliedDaysAgo);

    const applicationId = randomUUID();
    const flow = buildStatusFlow(params.finalStatus);

    applicationRows.push({
      id: applicationId,
      jobId: params.jobId,
      candidateProfileId: params.candidateProfileId,
      status: params.finalStatus,
      coverLetter: chance(0.7) ? pick(COVER_LETTERS) : null,
      resumeUrl: `https://resumes.talentflow.dev/${params.candidateProfileId}.pdf`,
      createdAt,
    });

    // One audit event per transition, timestamps marching forward from apply.
    flow.forEach((status, index) => {
      eventRows.push({
        id: randomUUID(),
        applicationId,
        status,
        note: null,
        // The initial APPLIED event is the candidate's action; later transitions
        // are recorded by the HR who owns the job.
        changedById: status === ApplicationStatus.APPLIED ? null : job.postedById,
        createdAt: new Date(createdAt.getTime() + index * 3 * 24 * 60 * 60 * 1000),
      });
    });
    return true;
  };

  // 1) Guarantee the primary candidate a rich, varied application board on the
  //    primary HR's (Acme Cloud) jobs so the demo screens are populated.
  const primaryCandidate = candidates.find(
    (candidate) => candidate.email === PRIMARY_CANDIDATE_EMAIL,
  );
  if (primaryCandidate) {
    const demoStatuses: readonly ApplicationStatus[] = [
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFERED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.APPLIED,
      ApplicationStatus.REJECTED,
    ];
    const jobsForPrimary = shuffled(openJobs).slice(0, demoStatuses.length);
    jobsForPrimary.forEach((job, index) => {
      addApplication({
        jobId: job.jobId,
        candidateProfileId: primaryCandidate.candidateProfileId,
        finalStatus: demoStatuses[index] ?? ApplicationStatus.APPLIED,
      });
    });
  }

  // 2) Popularity-driven bulk generation. Each job draws applicants up to its
  //    weight; candidates are sampled without replacement per job.
  for (const job of openJobs) {
    const targetApplicants = jobWeights.get(job.jobId) ?? 1;
    const applicantPool = pickDistinct(candidates, targetApplicants + randInt(0, 2));
    for (const candidate of applicantPool) {
      addApplication({
        jobId: job.jobId,
        candidateProfileId: candidate.candidateProfileId,
        finalStatus: weightedPick(finalStatusDistribution),
      });
    }
  }

  // 3) Candidate-driven top-up so most candidates have several applications and
  //    the total comfortably clears the target volume.
  for (const candidate of candidates) {
    const desired = randInt(3, 10);
    const jobsForCandidate = pickDistinct(openJobs, desired);
    for (const job of jobsForCandidate) {
      addApplication({
        jobId: job.jobId,
        candidateProfileId: candidate.candidateProfileId,
        finalStatus: weightedPick(finalStatusDistribution),
      });
    }
  }

  await insertInBatches(applicationRows, (batch) => prisma.application.createMany({ data: batch }));
  await insertInBatches(eventRows, (batch) =>
    prisma.applicationStatusEvent.createMany({ data: batch }),
  );

  return applicationRows.length;
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

  const { primaryHrUserId, hrUserIdsByCompanySlug } = await seedHrUsers(companyIdBySlug);
  void primaryHrUserId;
  const hrCount = [...hrUserIdsByCompanySlug.values()].reduce((sum, list) => sum + list.length, 0);
  console.info(`  ✓ ${hrCount} HR users across ${hrUserIdsByCompanySlug.size} companies`);

  const candidates = await seedCandidates(skillIdBySlug);
  console.info(`  ✓ ${candidates.length} candidates (with profiles, skills, education)`);

  const jobs = await seedJobs(companyIdBySlug, skillIdBySlug, hrUserIdsByCompanySlug);
  console.info(`  ✓ ${jobs.length} jobs`);

  const applicationCount = await seedApplications(candidates, jobs);
  console.info(`  ✓ ${applicationCount} applications (with status-event history)`);

  console.info('✅ Seed complete.');
  console.info(`   HR login:        ${PRIMARY_HR_EMAIL} / ${PRIMARY_HR_PASSWORD}`);
  console.info(`   Candidate login: ${PRIMARY_CANDIDATE_EMAIL} / ${PRIMARY_CANDIDATE_PASSWORD}`);
  console.info(`   Other demo accounts use the password: ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
