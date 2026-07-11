/**
 * Database seed script.
 *
 * Generates a large, realistic and fully DETERMINISTIC development dataset so
 * every screen has meaningful content and the filters/pagination/search are
 * exercised at scale. Approximate volumes:
 *   *  ~50 companies + ~300 skills            (shared reference vocabulary)
 *   * ~100 HR users     (each with an HrProfile, spread across companies)
 *   * ~500 candidate users (each with a CandidateProfile, skills & education)
 *   * ~500 jobs         (distributed across companies / HR authors, with skills)
 *   * ~3000 applications (natural long-tail spread), each with a chronologically
 *           consistent ApplicationStatusEvent audit trail
 *
 * Determinism:
 *   * All randomness flows through a single seeded Faker instance
 *     (`faker.seed(FAKER_SEED)`) and a fixed reference date
 *     (`faker.setDefaultRefDate(REFERENCE_DATE)`). Repeated runs therefore
 *     produce byte-identical data — reproducible demos and stable screenshots.
 *     `Math.random`, `Date.now()` and `crypto.randomUUID()` are intentionally
 *     avoided because none of them are reproducible.
 *
 * Performance:
 *   * The shared candidate/HR password is hashed with bcrypt exactly ONCE and
 *     the resulting hash is reused for every generated account (only the small
 *     set of well-known demo accounts are hashed individually).
 *   * Rows are minted with pre-generated ids so foreign keys can be pre-wired,
 *     then inserted with `createMany` in batches — no N+1 awaits in tight loops.
 *
 * The well-known demo accounts documented for the project are preserved exactly:
 *   * HR        — admin@test.com     / Admin@1234
 *   * Candidate — candidate@test.com / Candidate@1234
 *   * Named secondary HR / candidate accounts — <name>@test.com / Password@123
 *
 * The README-documented demo accounts (created explicitly, hashed with their own
 * passwords) are guaranteed to exist and log in:
 *   * Candidate — candidate1@example.com / Candidate@123
 *   * Candidate — candidate2@example.com / Candidate@123
 *   * HR        — hr1@skypoint.com      / Hr@123456   (org: SkyPoint Technologies)
 *   * HR        — hr3@skypoint.com      / Hr@123456   (org: SkyPoint Technologies)
 *   * HR        — hr2@vertexlabs.com    / Hr@123456   (org: Vertex Labs)
 *   hr1 & hr3 share the SkyPoint org (so hr1 sees hr3's jobs); hr2's Vertex Labs
 *   jobs stay invisible to hr1 — org-scoped authorization is demonstrable.
 *
 * Run with: `npm run prisma:seed`  (or `npx prisma db seed`)
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
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

// ---------------------------------------------------------------------------
// Determinism, sizing and tuning constants
// ---------------------------------------------------------------------------

/** Fixed Faker seed — the single source of reproducibility for the whole run. */
const FAKER_SEED = 20260101;
/** Fixed "now": every generated date is anchored to (and precedes) this instant. */
const REFERENCE_DATE = new Date('2026-01-01T00:00:00.000Z');
/** Oldest activity in the dataset (~18 months before the reference date). */
const EARLIEST_ACTIVITY_DAYS_AGO = 540;

const BCRYPT_SALT_ROUNDS = 12;
const INSERT_BATCH_SIZE = 1000;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

// Target volumes (totals, inclusive of the preserved demo accounts).
const TARGET_COMPANIES = 50;
const TARGET_SKILLS = 300;
const TARGET_HR_USERS = 100;
const TARGET_CANDIDATES = 500;
const TARGET_JOBS = 500;
/** Applications generated per candidate; the total lands near ~3000. */
const APPLICATIONS_PER_CANDIDATE = [
  { value: 3, weight: 3 },
  { value: 5, weight: 4 },
  { value: 7, weight: 4 },
  { value: 11, weight: 2 },
  { value: 16, weight: 1 },
] as const;

// Well-known demo accounts (kept stable so documented logins keep working).
const PRIMARY_HR_EMAIL = 'admin@test.com';
const PRIMARY_HR_PASSWORD = 'Admin@1234';
const PRIMARY_CANDIDATE_EMAIL = 'candidate@test.com';
const PRIMARY_CANDIDATE_PASSWORD = 'Candidate@1234';
const DEMO_USER_PASSWORD = 'Password@123';

// README-documented demo accounts (must exist and log in with these exact
// credentials). Passwords are bcrypt-hashed with their real plaintext below.
const DEMO_CANDIDATE_PASSWORD = 'Candidate@123';
const DEMO_HR_PASSWORD = 'Hr@123456';
const DEMO_CANDIDATE_1_EMAIL = 'candidate1@example.com';
const DEMO_CANDIDATE_2_EMAIL = 'candidate2@example.com';
const DEMO_HR_1_EMAIL = 'hr1@skypoint.com';
const DEMO_HR_2_EMAIL = 'hr2@vertexlabs.com';
const DEMO_HR_3_EMAIL = 'hr3@skypoint.com';

// Slugs of the organizations the primary demo recruiters belong to. `hr1` and
// `hr3` share `skypoint-technologies` (so hr1 can see hr3's org-scoped jobs);
// `hr2` sits in a different org (`vertex-labs`) that hr1 must NOT see.
const SKYPOINT_COMPANY_SLUG = 'skypoint-technologies';
const VERTEX_COMPANY_SLUG = 'vertex-labs';

// Company the primary HR recruits for (must exist in the curated company list).
const PRIMARY_HR_COMPANY_SLUG = 'acme-cloud';
/** How many jobs are pinned to the primary HR so the demo HR board is full. */
const PRIMARY_HR_JOB_COUNT = 24;
/** Published jobs pinned to each README demo recruiter so their boards are full. */
const DEMO_HR_1_JOB_COUNT = 18;
const DEMO_HR_2_JOB_COUNT = 16;
const DEMO_HR_3_JOB_COUNT = 8;
/** How many varied applications the primary candidate receives for the demo. */
const PRIMARY_CANDIDATE_DEMO_APPLICATIONS = 6;
/** Varied applications each README demo candidate lodges on the demo HR boards. */
const DEMO_CANDIDATE_DEMO_APPLICATIONS = 5;

// Named org slugs that must carry at least two HR recruiters so org-scoped
// authorization (teammates sharing a company's jobs) is demonstrable everywhere.
const NAMED_ORG_SLUGS: readonly string[] = [
  'skypoint-technologies',
  'acme-solutions',
  'vertex-labs',
  'nova-systems',
  'bluepeak-technologies',
  'quantum-digital',
  'cloudforge',
  'nextgen-analytics',
  'talentbridge',
  'elevate-tech',
];
const MIN_HR_PER_NAMED_ORG = 2;

// Domains for generated (non-demo) accounts — kept distinct from the demo domain.
const GENERATED_HR_EMAIL_DOMAIN = 'talentflow.dev';
const GENERATED_CANDIDATE_EMAIL_DOMAIN = 'mail.talentflow.dev';

faker.seed(FAKER_SEED);
faker.setDefaultRefDate(REFERENCE_DATE);

// ---------------------------------------------------------------------------
// Deterministic sampling helpers (all randomness routes through Faker)
// ---------------------------------------------------------------------------

/** A stable, seeded UUID used to pre-wire foreign keys before insertion. */
function newId(): string {
  return faker.string.uuid();
}

/** URL-safe slug: lowercase, alphanumerics separated by single hyphens. */
function toSlug(text: string): string {
  return faker.helpers
    .slugify(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Random integer in the inclusive range [min, max]. */
function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

/** Returns true with probability `probability` (0..1). */
function chance(probability: number): boolean {
  return faker.datatype.boolean(probability);
}

/** Picks one element from a non-empty array. */
function pickOne<T>(items: readonly T[]): T {
  return faker.helpers.arrayElement(items);
}

/** Picks up to `count` distinct elements (order shuffled). */
function pickDistinct<T>(items: readonly T[], count: number): T[] {
  return faker.helpers.arrayElements(items, Math.min(count, items.length));
}

/** Weighted pick from `[value, weight]` pairs. */
function pickWeighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
  return faker.helpers.weightedArrayElement(entries.map(([value, weight]) => ({ value, weight })));
}

/** The instant `days` days before the fixed reference date. */
function daysBeforeReference(days: number): Date {
  return new Date(REFERENCE_DATE.getTime() - days * MILLIS_PER_DAY);
}

/** A deterministic date uniformly between two instants (inclusive of bounds). */
function dateBetween(from: Date, to: Date): Date {
  if (from.getTime() >= to.getTime()) {
    return new Date(from.getTime());
  }
  return faker.date.between({ from, to });
}

/** Inserts rows in fixed-size batches to avoid oversized single statements. */
async function insertInBatches<T>(
  rows: readonly T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < rows.length; index += INSERT_BATCH_SIZE) {
    await insert(rows.slice(index, index + INSERT_BATCH_SIZE));
  }
}

/** Reads a required value from a lookup map, throwing if the key is missing. */
function requireId(lookup: ReadonlyMap<string, string>, key: string): string {
  const value = lookup.get(key);
  if (!value) {
    throw new Error(`Seed lookup failed: no id found for "${key}".`);
  }
  return value;
}

async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

/**
 * Mints a unique, human-readable email from a person's name. A monotonically
 * increasing counter guarantees uniqueness even when names collide at scale.
 */
function createUniqueEmailFactory(domain: string): (firstName: string, lastName: string) => string {
  const usedEmails = new Set<string>();
  let counter = 0;
  return (firstName: string, lastName: string): string => {
    const localPart = toSlug(`${firstName} ${lastName}`).replace(/-/g, '.');
    let email = `${localPart}@${domain}`;
    while (usedEmails.has(email)) {
      counter += 1;
      email = `${localPart}.${counter}@${domain}`;
    }
    usedEmails.add(email);
    return email;
  };
}

// ---------------------------------------------------------------------------
// Vocabulary pools
// ---------------------------------------------------------------------------

// Real-world tech hubs as "City, Region, Country" so locations read naturally.
const WORLD_LOCATIONS: readonly string[] = [
  'Bengaluru, Karnataka, India',
  'Mumbai, Maharashtra, India',
  'Pune, Maharashtra, India',
  'Hyderabad, Telangana, India',
  'Chennai, Tamil Nadu, India',
  'Gurugram, Haryana, India',
  'Noida, Uttar Pradesh, India',
  'New Delhi, Delhi, India',
  'Kolkata, West Bengal, India',
  'Ahmedabad, Gujarat, India',
  'Jaipur, Rajasthan, India',
  'Kochi, Kerala, India',
  'Singapore, Central Region, Singapore',
  'London, England, United Kingdom',
  'Berlin, Berlin, Germany',
  'Amsterdam, North Holland, Netherlands',
  'Dublin, Leinster, Ireland',
  'Toronto, Ontario, Canada',
  'San Francisco, California, United States',
  'Seattle, Washington, United States',
  'Austin, Texas, United States',
  'New York, New York, United States',
  'Sydney, New South Wales, Australia',
  'Dubai, Dubai, United Arab Emirates',
];

const REMOTE_LOCATION_LABEL = 'Remote';

const UNIVERSITIES: readonly string[] = [
  'Indian Institute of Technology, Bombay',
  'Indian Institute of Technology, Delhi',
  'Indian Institute of Technology, Madras',
  'Indian Institute of Technology, Kanpur',
  'National Institute of Technology, Tiruchirappalli',
  'National Institute of Technology, Surathkal',
  'Birla Institute of Technology and Science, Pilani',
  'Delhi Technological University',
  'College of Engineering, Pune',
  'PES University',
  'R.V. College of Engineering',
  'Vellore Institute of Technology',
  'Manipal Institute of Technology',
  'Anna University',
  'Jadavpur University',
  'International Institute of Information Technology, Hyderabad',
  'Indian Institute of Science, Bengaluru',
  'Indian Institute of Technology, Kharagpur',
  'Indian Institute of Technology, Roorkee',
  'Stanford University',
  'Massachusetts Institute of Technology',
  'Carnegie Mellon University',
  'University of California, Berkeley',
  'University of Oxford',
  'University of Cambridge',
  'National University of Singapore',
  'University of Toronto',
  'Georgia Institute of Technology',
];

const FIELDS_OF_STUDY: readonly string[] = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Computer Engineering',
  'Mathematics & Computing',
  'Information Systems',
  'Machine Learning',
  'Human-Computer Interaction',
];

const INDUSTRIES: readonly string[] = [
  'Cloud Infrastructure',
  'Financial Services',
  'Healthcare Technology',
  'Data & Analytics',
  'E-commerce',
  'Mobility & Transport',
  'Media & Entertainment',
  'AgriTech',
  'EdTech',
  'Payments',
  'Artificial Intelligence',
  'Gaming',
  'CleanTech',
  'Logistics',
  'Enterprise Software',
  'Cybersecurity',
  'Telecommunications',
  'HR Technology',
  'Travel & Hospitality',
  'Banking',
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

const COVER_LETTERS: readonly string[] = [
  'I am excited about this role and believe my experience is a strong match for the team.',
  'This opportunity aligns closely with my skills and the kind of impact I want to have.',
  'I have shipped similar systems before and would love to bring that experience to your team.',
  'Your product resonates with me and I am confident I can contribute from day one.',
  'I enjoy the problem space you are working in and would be thrilled to help you scale it.',
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

const NOTICE_PERIOD_OPTIONS: readonly number[] = [0, 15, 30, 45, 60, 90];

// ---------------------------------------------------------------------------
// Role archetypes → drive coherent titles + skill sets for jobs and candidates
// ---------------------------------------------------------------------------

interface RoleTemplate {
  readonly base: string;
  readonly skillSlugs: readonly string[];
}

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
  readonly minExperienceYears: number;
  readonly maxExperienceYears: number;
}
// Yearly INR bands, keyed by seniority.
const SALARY_BY_LEVEL: Record<ExperienceLevel, SalaryBand> = {
  [ExperienceLevel.INTERNSHIP]: {
    min: 300000,
    max: 720000,
    minExperienceYears: 0,
    maxExperienceYears: 1,
  },
  [ExperienceLevel.ENTRY_LEVEL]: {
    min: 600000,
    max: 1200000,
    minExperienceYears: 0,
    maxExperienceYears: 2,
  },
  [ExperienceLevel.MID_LEVEL]: {
    min: 1200000,
    max: 2500000,
    minExperienceYears: 2,
    maxExperienceYears: 6,
  },
  [ExperienceLevel.SENIOR]: {
    min: 2500000,
    max: 4500000,
    minExperienceYears: 5,
    maxExperienceYears: 10,
  },
  [ExperienceLevel.LEAD]: {
    min: 4000000,
    max: 6500000,
    minExperienceYears: 8,
    maxExperienceYears: 14,
  },
  [ExperienceLevel.EXECUTIVE]: {
    min: 6000000,
    max: 12000000,
    minExperienceYears: 10,
    maxExperienceYears: 20,
  },
};

const DEGREE_BY_LEVEL: Record<EducationLevel, string> = {
  [EducationLevel.HIGH_SCHOOL]: 'Higher Secondary Certificate',
  [EducationLevel.DIPLOMA]: 'Diploma in Engineering',
  [EducationLevel.BACHELORS]: 'Bachelor of Technology',
  [EducationLevel.MASTERS]: 'Master of Technology',
  [EducationLevel.DOCTORATE]: 'Doctor of Philosophy',
  [EducationLevel.OTHER]: 'Professional Certificate',
};

// ---------------------------------------------------------------------------
// Reference data: curated companies (seed the world; more are generated later)
// ---------------------------------------------------------------------------

interface CompanyDef {
  readonly name: string;
  readonly slug: string;
  readonly industry: string;
  readonly size: CompanySize;
  readonly location: string;
}

// Curated anchors. `acme-cloud`, `fintrek`, `healthsync` and `dataforge` MUST
// remain because the preserved demo HR accounts recruit for them. The ten named
// organizations below are explicit, well-known "Organizations" documented in the
// README so org-scoped authorization is demonstrable (`skypoint-technologies`
// and `vertex-labs` back the `hr1`/`hr2`/`hr3` demo recruiters).
const CURATED_COMPANIES: readonly CompanyDef[] = [
  {
    name: 'SkyPoint Technologies',
    slug: 'skypoint-technologies',
    industry: 'Cloud Infrastructure',
    size: CompanySize.LARGE,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Acme Solutions',
    slug: 'acme-solutions',
    industry: 'Enterprise Software',
    size: CompanySize.ENTERPRISE,
    location: 'Pune, Maharashtra, India',
  },
  {
    name: 'Vertex Labs',
    slug: 'vertex-labs',
    industry: 'Artificial Intelligence',
    size: CompanySize.MEDIUM,
    location: 'Hyderabad, Telangana, India',
  },
  {
    name: 'Nova Systems',
    slug: 'nova-systems',
    industry: 'Enterprise Software',
    size: CompanySize.LARGE,
    location: 'Chennai, Tamil Nadu, India',
  },
  {
    name: 'BluePeak Technologies',
    slug: 'bluepeak-technologies',
    industry: 'Cybersecurity',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Quantum Digital',
    slug: 'quantum-digital',
    industry: 'Data & Analytics',
    size: CompanySize.MEDIUM,
    location: 'Gurugram, Haryana, India',
  },
  {
    name: 'CloudForge',
    slug: 'cloudforge',
    industry: 'Cloud Infrastructure',
    size: CompanySize.STARTUP,
    location: 'Remote',
  },
  {
    name: 'NextGen Analytics',
    slug: 'nextgen-analytics',
    industry: 'Data & Analytics',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, Maharashtra, India',
  },
  {
    name: 'TalentBridge',
    slug: 'talentbridge',
    industry: 'HR Technology',
    size: CompanySize.SMALL,
    location: 'Noida, Uttar Pradesh, India',
  },
  {
    name: 'Elevate Tech',
    slug: 'elevate-tech',
    industry: 'EdTech',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Acme Cloud',
    slug: 'acme-cloud',
    industry: 'Cloud Infrastructure',
    size: CompanySize.LARGE,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Fintrek',
    slug: 'fintrek',
    industry: 'Financial Services',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, Maharashtra, India',
  },
  {
    name: 'HealthSync',
    slug: 'healthsync',
    industry: 'Healthcare Technology',
    size: CompanySize.MEDIUM,
    location: 'Pune, Maharashtra, India',
  },
  {
    name: 'DataForge',
    slug: 'dataforge',
    industry: 'Data & Analytics',
    size: CompanySize.STARTUP,
    location: 'Remote',
  },
  {
    name: 'Nimbus Retail',
    slug: 'nimbus-retail',
    industry: 'E-commerce',
    size: CompanySize.LARGE,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Voltride Mobility',
    slug: 'voltride-mobility',
    industry: 'Mobility & Transport',
    size: CompanySize.MEDIUM,
    location: 'Gurugram, Haryana, India',
  },
  {
    name: 'Lumen Media',
    slug: 'lumen-media',
    industry: 'Media & Entertainment',
    size: CompanySize.MEDIUM,
    location: 'Mumbai, Maharashtra, India',
  },
  {
    name: 'AgriNova',
    slug: 'agrinova',
    industry: 'AgriTech',
    size: CompanySize.SMALL,
    location: 'Hyderabad, Telangana, India',
  },
  {
    name: 'EduSpark',
    slug: 'eduspark',
    industry: 'EdTech',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'SecurePay',
    slug: 'securepay',
    industry: 'Payments',
    size: CompanySize.LARGE,
    location: 'Chennai, Tamil Nadu, India',
  },
  {
    name: 'CloudKart',
    slug: 'cloudkart',
    industry: 'E-commerce',
    size: CompanySize.ENTERPRISE,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Meridian Labs',
    slug: 'meridian-labs',
    industry: 'Artificial Intelligence',
    size: CompanySize.STARTUP,
    location: 'Remote',
  },
  {
    name: 'Skyline Games',
    slug: 'skyline-games',
    industry: 'Gaming',
    size: CompanySize.SMALL,
    location: 'Pune, Maharashtra, India',
  },
  {
    name: 'GreenGrid Energy',
    slug: 'greengrid-energy',
    industry: 'CleanTech',
    size: CompanySize.MEDIUM,
    location: 'Ahmedabad, Gujarat, India',
  },
  {
    name: 'Trailhead Logistics',
    slug: 'trailhead-logistics',
    industry: 'Logistics',
    size: CompanySize.LARGE,
    location: 'Noida, Uttar Pradesh, India',
  },
  {
    name: 'Beacon Health',
    slug: 'beacon-health',
    industry: 'Healthcare Technology',
    size: CompanySize.SMALL,
    location: 'Kochi, Kerala, India',
  },
  {
    name: 'Quantex Systems',
    slug: 'quantex-systems',
    industry: 'Enterprise Software',
    size: CompanySize.ENTERPRISE,
    location: 'Hyderabad, Telangana, India',
  },
  {
    name: 'Pixelbloom Studio',
    slug: 'pixelbloom-studio',
    industry: 'Media & Entertainment',
    size: CompanySize.STARTUP,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Orbit Telecom',
    slug: 'orbit-telecom',
    industry: 'Telecommunications',
    size: CompanySize.LARGE,
    location: 'New Delhi, Delhi, India',
  },
  {
    name: 'BrightHire HR',
    slug: 'brighthire-hr',
    industry: 'HR Technology',
    size: CompanySize.MEDIUM,
    location: 'Gurugram, Haryana, India',
  },
  {
    name: 'Cobalt Security',
    slug: 'cobalt-security',
    industry: 'Cybersecurity',
    size: CompanySize.MEDIUM,
    location: 'Bengaluru, Karnataka, India',
  },
  {
    name: 'Harborview Travel',
    slug: 'harborview-travel',
    industry: 'Travel & Hospitality',
    size: CompanySize.SMALL,
    location: 'Jaipur, Rajasthan, India',
  },
  {
    name: 'Northwind Bank',
    slug: 'northwind-bank',
    industry: 'Banking',
    size: CompanySize.ENTERPRISE,
    location: 'Mumbai, Maharashtra, India',
  },
  {
    name: 'Zephyr Analytics',
    slug: 'zephyr-analytics',
    industry: 'Data & Analytics',
    size: CompanySize.STARTUP,
    location: 'Remote',
  },
];

const COMPANY_SIZE_WEIGHTS: ReadonlyArray<readonly [CompanySize, number]> = [
  [CompanySize.STARTUP, 3],
  [CompanySize.SMALL, 3],
  [CompanySize.MEDIUM, 4],
  [CompanySize.LARGE, 3],
  [CompanySize.ENTERPRISE, 2],
];

// ---------------------------------------------------------------------------
// Reference data: skills (~300 unique, deduplicated by slug)
// ---------------------------------------------------------------------------

interface SkillDef {
  readonly name: string;
  readonly slug: string;
}

// The original 20 skills — slugs MUST stay identical (the frontend depends on
// them). Kept first so their explicit slugs always win during deduplication.
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

// Curated skills referenced by ROLE_TEMPLATES (explicit slugs guaranteed).
const ROLE_SKILLS: readonly SkillDef[] = [
  { name: 'Redux', slug: 'redux' },
  { name: 'HTML5', slug: 'html5' },
  { name: 'CSS3', slug: 'css3' },
  { name: 'NestJS', slug: 'nestjs' },
  { name: 'REST APIs', slug: 'rest-api' },
  { name: 'Microservices', slug: 'microservices' },
  { name: 'Terraform', slug: 'terraform' },
  { name: 'CI/CD', slug: 'ci-cd' },
  { name: 'Linux', slug: 'linux' },
  { name: 'Ansible', slug: 'ansible' },
  { name: 'Prometheus', slug: 'prometheus' },
  { name: 'Grafana', slug: 'grafana' },
  { name: 'Apache Spark', slug: 'spark' },
  { name: 'Apache Airflow', slug: 'airflow' },
  { name: 'Apache Kafka', slug: 'kafka' },
  { name: 'SQL', slug: 'sql' },
  { name: 'Pandas', slug: 'pandas' },
  { name: 'scikit-learn', slug: 'scikit-learn' },
  { name: 'TensorFlow', slug: 'tensorflow' },
  { name: 'Statistics', slug: 'statistics' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'PyTorch', slug: 'pytorch' },
  { name: 'MLOps', slug: 'mlops' },
  { name: 'Kotlin', slug: 'kotlin' },
  { name: 'Android', slug: 'android' },
  { name: 'Jetpack Compose', slug: 'jetpack-compose' },
  { name: 'Swift', slug: 'swift' },
  { name: 'iOS', slug: 'ios' },
  { name: 'SwiftUI', slug: 'swiftui' },
  { name: 'React Native', slug: 'react-native' },
  { name: 'Selenium', slug: 'selenium' },
  { name: 'Cypress', slug: 'cypress' },
  { name: 'Playwright', slug: 'playwright' },
  { name: 'Jest', slug: 'jest' },
  { name: 'Test Automation', slug: 'test-automation' },
  { name: 'Security', slug: 'security' },
  { name: 'Cryptography', slug: 'cryptography' },
  { name: 'Product Strategy', slug: 'product-strategy' },
  { name: 'Roadmapping', slug: 'roadmapping' },
  { name: 'Agile', slug: 'agile' },
  { name: 'Analytics', slug: 'analytics' },
  { name: 'User Research', slug: 'user-research' },
  { name: 'Figma', slug: 'figma' },
  { name: 'UI Design', slug: 'ui-design' },
  { name: 'UX Research', slug: 'ux-research' },
  { name: 'Prototyping', slug: 'prototyping' },
  { name: 'Design Systems', slug: 'design-systems' },
  { name: 'Usability Testing', slug: 'usability-testing' },
  { name: 'Leadership', slug: 'leadership' },
  { name: 'Architecture', slug: 'architecture' },
  { name: 'FastAPI', slug: 'fastapi' },
  { name: 'Celery', slug: 'celery' },
  { name: 'gRPC', slug: 'grpc' },
  { name: 'ASP.NET', slug: 'dotnet' },
  { name: 'C#', slug: 'csharp' },
  { name: 'Azure', slug: 'azure' },
  { name: 'SQL Server', slug: 'sql-server' },
  { name: 'GCP', slug: 'gcp' },
  { name: 'dbt', slug: 'dbt' },
  { name: 'Snowflake', slug: 'snowflake' },
  { name: 'Data Modeling', slug: 'data-modeling' },
];

// A broad catalogue of additional realistic tech, data, tooling and soft
// skills. Slugs are derived and deduplicated at build time.
const ADDITIONAL_SKILL_NAMES: readonly string[] = [
  // Languages
  'Vue.js',
  'Angular',
  'Svelte',
  'SolidJS',
  'Rust',
  'C++',
  'Scala',
  'PHP',
  'Ruby',
  'Elixir',
  'Erlang',
  'Clojure',
  'Haskell',
  'F#',
  'Objective-C',
  'Dart',
  'Groovy',
  'Perl',
  'Lua',
  'R',
  'Julia',
  'MATLAB',
  'Solidity',
  'Bash',
  'PowerShell',
  'Zig',
  'Assembly',
  'COBOL',
  'Visual Basic .NET',
  'OCaml',
  // Frontend frameworks & libraries
  'Remix',
  'Astro',
  'Qwik',
  'Nuxt.js',
  'Gatsby',
  'Ember.js',
  'Backbone.js',
  'jQuery',
  'Bootstrap',
  'Material UI',
  'Chakra UI',
  'Ant Design',
  'Styled Components',
  'Emotion',
  'Sass',
  'Less',
  'Storybook',
  'Framer Motion',
  'Three.js',
  'D3.js',
  'WebGL',
  'Progressive Web Apps',
  'Web Components',
  'Zustand',
  'MobX',
  'RxJS',
  'Recoil',
  'React Query',
  'Webpack',
  'Vite',
  'Rollup',
  'Babel',
  'ESLint',
  'Prettier',
  // Backend frameworks
  'Koa',
  'Fastify',
  'Hapi',
  'Flask',
  'Ruby on Rails',
  'Laravel',
  'Symfony',
  'Gin',
  'Echo',
  'Fiber',
  'Actix',
  'Phoenix',
  'Micronaut',
  'Quarkus',
  'Ktor',
  'Vert.x',
  'Sinatra',
  'Tornado',
  'Sanic',
  // Databases & data stores
  'MySQL',
  'MariaDB',
  'SQLite',
  'MongoDB',
  'Cassandra',
  'DynamoDB',
  'CouchDB',
  'Neo4j',
  'Elasticsearch',
  'InfluxDB',
  'TimescaleDB',
  'CockroachDB',
  'ClickHouse',
  'BigQuery',
  'Amazon Redshift',
  'Oracle Database',
  'Firebase',
  'Supabase',
  'Memcached',
  'RabbitMQ',
  'NATS',
  'Apache Pulsar',
  'HashiCorp Vault',
  'Consul',
  // Cloud & DevOps
  'Google Cloud Platform',
  'DigitalOcean',
  'Heroku',
  'Vercel',
  'Netlify',
  'Cloudflare',
  'OpenShift',
  'HashiCorp Nomad',
  'Helm',
  'Argo CD',
  'Istio',
  'Envoy',
  'Packer',
  'Vagrant',
  'CircleCI',
  'GitLab CI',
  'GitHub Actions',
  'Jenkins',
  'TeamCity',
  'Datadog',
  'New Relic',
  'Splunk',
  'Elastic Stack',
  'Kibana',
  'Logstash',
  'Fluentd',
  'OpenTelemetry',
  'PagerDuty',
  'Sentry',
  'Nagios',
  // Data & machine learning
  'Keras',
  'XGBoost',
  'LightGBM',
  'Hugging Face',
  'LangChain',
  'OpenCV',
  'NLTK',
  'spaCy',
  'NumPy',
  'Matplotlib',
  'Seaborn',
  'Plotly',
  'Tableau',
  'Power BI',
  'Looker',
  'Metabase',
  'Apache Flink',
  'Apache Beam',
  'Presto',
  'Trino',
  'Databricks',
  'MLflow',
  'Kubeflow',
  'Amazon SageMaker',
  'Feature Engineering',
  'Data Warehousing',
  'ETL Pipelines',
  'Reinforcement Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Time Series Analysis',
  'A/B Testing',
  'Data Visualization',
  'Big Data',
  'Apache Hadoop',
  'Deep Learning',
  'Recommendation Systems',
  // Mobile
  'Flutter',
  'Xamarin',
  'Ionic',
  'Apache Cordova',
  'Expo',
  'Core Data',
  'RxSwift',
  'Coroutines',
  // Testing & QA
  'Mocha',
  'Chai',
  'Jasmine',
  'Vitest',
  'Testing Library',
  'JUnit',
  'TestNG',
  'PyTest',
  'RSpec',
  'Cucumber',
  'Postman',
  'JMeter',
  'Appium',
  'Robot Framework',
  'Contract Testing',
  'Performance Testing',
  'Regression Testing',
  'Test-Driven Development',
  'Behavior-Driven Development',
  // Security
  'OAuth 2.0',
  'OpenID Connect',
  'SAML',
  'JSON Web Tokens',
  'Penetration Testing',
  'OWASP',
  'TLS',
  'Identity and Access Management',
  'Vulnerability Assessment',
  'Secure Coding',
  'Zero Trust',
  // Architecture & practices
  'Domain-Driven Design',
  'Event-Driven Architecture',
  'Serverless',
  'API Gateway',
  'Message Queues',
  'WebSockets',
  'Distributed Systems',
  'Concurrency',
  'Caching Strategies',
  'Observability',
  'Infrastructure as Code',
  'Site Reliability Engineering',
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jira',
  'Confluence',
  'Trello',
  'Notion',
  'Scrum',
  'Kanban',
  'Pair Programming',
  'Code Review',
  'Continuous Integration',
  'Continuous Delivery',
  // Product & design
  'Wireframing',
  'User Personas',
  'Journey Mapping',
  'Information Architecture',
  'Interaction Design',
  'Motion Design',
  'Accessibility',
  'Responsive Design',
  'Design Thinking',
  'Product Analytics',
  'Go-to-Market Strategy',
  'Competitive Analysis',
  'Backlog Management',
  'Sprint Planning',
  'OKRs',
  'Stakeholder Management',
  'Market Research',
  'Adobe XD',
  'Sketch',
  // Soft skills
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Critical Thinking',
  'Time Management',
  'Adaptability',
  'Collaboration',
  'Mentoring',
  'Conflict Resolution',
  'Negotiation',
  'Presentation Skills',
  'Public Speaking',
  'Emotional Intelligence',
  'Decision Making',
  'Creativity',
  'Attention to Detail',
  'Ownership',
  'Accountability',
  'Strategic Thinking',
  'Cross-functional Leadership',
  // Domains
  'Fintech',
  'Blockchain',
  'Web3',
  'Internet of Things',
  'Augmented Reality',
  'Virtual Reality',
  'Robotics',
  'Cloud Computing',
  'Networking',
  'Operating Systems',
  'Compilers',
  'Embedded Systems',
  'Computer Graphics',
  'Cryptocurrency',
  'SaaS',
  'Data Governance',
];

// Explicit slugs for symbol-heavy names that would otherwise slugify poorly.
const SKILL_SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  'C++': 'cpp',
  'F#': 'fsharp',
};

/** Builds the deduplicated skill catalogue (curated slugs win) up to the target. */
function buildSkillCatalogue(): SkillDef[] {
  const skillsBySlug = new Map<string, SkillDef>();
  const addSkill = (skill: SkillDef): void => {
    if (skill.slug.length > 0 && !skillsBySlug.has(skill.slug)) {
      skillsBySlug.set(skill.slug, skill);
    }
  };

  for (const skill of [...CORE_SKILLS, ...ROLE_SKILLS]) {
    addSkill(skill);
  }
  for (const name of ADDITIONAL_SKILL_NAMES) {
    addSkill({ name, slug: SKILL_SLUG_OVERRIDES[name] ?? toSlug(name) });
  }

  return [...skillsBySlug.values()].slice(0, TARGET_SKILLS);
}

const SKILL_CATALOGUE: readonly SkillDef[] = buildSkillCatalogue();
const ALL_SKILL_SLUGS: readonly string[] = SKILL_CATALOGUE.map((skill) => skill.slug);

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

const PRIMARY_CANDIDATE: NamedCandidate = {
  email: PRIMARY_CANDIDATE_EMAIL,
  firstName: 'Priya',
  lastName: 'Sharma',
  headline: 'Senior Full-Stack Engineer · React + Node.js',
  currentLocation: 'Bengaluru, Karnataka, India',
  currentCompany: 'Techwave Solutions',
  currentTitle: 'Senior Software Engineer',
  totalExperienceMonths: 72,
  highestEducation: EducationLevel.MASTERS,
  skillSlugs: ['react', 'typescript', 'nodejs', 'express', 'postgresql', 'prisma', 'aws'],
};

const NAMED_CANDIDATES: readonly NamedCandidate[] = [
  {
    email: 'rahul.verma@test.com',
    firstName: 'Rahul',
    lastName: 'Verma',
    headline: 'Backend Engineer · Node.js & PostgreSQL',
    currentLocation: 'Pune, Maharashtra, India',
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
    currentLocation: 'Bengaluru, Karnataka, India',
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
    currentLocation: 'Hyderabad, Telangana, India',
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
    currentLocation: 'Chennai, Tamil Nadu, India',
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
    currentLocation: 'Bengaluru, Karnataka, India',
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
    currentLocation: 'Mumbai, Maharashtra, India',
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
    currentLocation: 'Gurugram, Haryana, India',
    currentCompany: 'Paytm',
    currentTitle: 'Software Engineer II',
    totalExperienceMonths: 54,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['react', 'nextjs', 'nodejs', 'typescript', 'graphql'],
  },
];

// README-documented demo candidates (must log in with `Candidate@123`). They
// receive a rich, cross-organization application board in `seedApplications`.
const DEMO_CANDIDATES: readonly NamedCandidate[] = [
  {
    email: DEMO_CANDIDATE_1_EMAIL,
    firstName: 'Aarav',
    lastName: 'Sharma',
    headline: 'Full-Stack Engineer · React + Node.js',
    currentLocation: 'Bengaluru, Karnataka, India',
    currentCompany: 'Freelance',
    currentTitle: 'Full-Stack Engineer',
    totalExperienceMonths: 42,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['react', 'typescript', 'nodejs', 'postgresql', 'nextjs'],
  },
  {
    email: DEMO_CANDIDATE_2_EMAIL,
    firstName: 'Diya',
    lastName: 'Patel',
    headline: 'Backend Engineer · Java & Spring Boot',
    currentLocation: 'Hyderabad, Telangana, India',
    currentCompany: 'Freelance',
    currentTitle: 'Backend Engineer',
    totalExperienceMonths: 30,
    highestEducation: EducationLevel.BACHELORS,
    skillSlugs: ['java', 'spring-boot', 'postgresql', 'redis', 'rest-api'],
  },
];

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

// ---------------------------------------------------------------------------
// Cleanup (FK-safe order: children before parents)
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
// Reference data seeding
// ---------------------------------------------------------------------------

function buildCompanyDefs(): CompanyDef[] {
  const defs: CompanyDef[] = [...CURATED_COMPANIES];
  const usedSlugs = new Set(defs.map((company) => company.slug));

  while (defs.length < TARGET_COMPANIES) {
    const name = faker.company.name();
    const baseSlug = toSlug(name);
    let slug = baseSlug;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${randomInt(1, 999)}`;
    }
    usedSlugs.add(slug);
    defs.push({
      name,
      slug,
      industry: pickOne(INDUSTRIES),
      size: pickWeighted(COMPANY_SIZE_WEIGHTS),
      location: chance(0.2) ? REMOTE_LOCATION_LABEL : pickOne(WORLD_LOCATIONS),
    });
  }

  return defs;
}

async function seedCompanies(companyDefs: readonly CompanyDef[]): Promise<Map<string, string>> {
  const companyIdBySlug = new Map<string, string>();
  const rows: Prisma.CompanyCreateManyInput[] = companyDefs.map((company) => {
    const id = newId();
    companyIdBySlug.set(company.slug, id);
    const createdAt = dateBetween(
      daysBeforeReference(EARLIEST_ACTIVITY_DAYS_AGO),
      daysBeforeReference(120),
    );
    const readableSize = company.size.toLowerCase();
    return {
      id,
      name: company.name,
      slug: company.slug,
      website: `https://${company.slug}.example.com`,
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}`,
      about: `${company.name} is a ${readableSize} ${company.industry.toLowerCase()} company based in ${company.location}. ${faker.company.catchPhrase()}.`,
      industry: company.industry,
      size: company.size,
      location: company.location,
      createdAt,
      updatedAt: createdAt,
    };
  });
  await insertInBatches(rows, (batch) => prisma.company.createMany({ data: batch }));
  return companyIdBySlug;
}

async function seedSkills(): Promise<Map<string, string>> {
  const skillIdBySlug = new Map<string, string>();
  const rows: Prisma.SkillCreateManyInput[] = SKILL_CATALOGUE.map((skill) => {
    const id = newId();
    skillIdBySlug.set(skill.slug, id);
    return { id, name: skill.name, slug: skill.slug };
  });
  await insertInBatches(rows, (batch) => prisma.skill.createMany({ data: batch }));
  return skillIdBySlug;
}

// ---------------------------------------------------------------------------
// HR users (+ profiles)
// ---------------------------------------------------------------------------

/** User ids of the README-documented demo recruiters, for pinning demo jobs. */
interface DemoHrUserIds {
  readonly hr1: string;
  readonly hr2: string;
  readonly hr3: string;
}

interface HrSeedResult {
  readonly primaryHrUserId: string;
  readonly demoHrUserIds: DemoHrUserIds;
  readonly hrUserIdsByCompanySlug: Map<string, string[]>;
}

async function seedHrUsers(
  companyDefs: readonly CompanyDef[],
  companyIdBySlug: ReadonlyMap<string, string>,
): Promise<HrSeedResult> {
  const primaryHash = await hashPassword(PRIMARY_HR_PASSWORD);
  const demoHash = await hashPassword(DEMO_USER_PASSWORD);
  const demoHrHash = await hashPassword(DEMO_HR_PASSWORD);
  const sharedHash = demoHash; // reuse one bcrypt hash for every generated HR account

  const nextEmail = createUniqueEmailFactory(GENERATED_HR_EMAIL_DOMAIN);
  const userRows: Prisma.UserCreateManyInput[] = [];
  const profileRows: Prisma.HrProfileCreateManyInput[] = [];
  const hrUserIdsByCompanySlug = new Map<string, string[]>();

  const addHr = (params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companySlug: string;
    designation: string;
    createdAt: Date;
  }): string => {
    const userId = newId();
    userRows.push({
      id: userId,
      email: params.email,
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      role: UserRole.HR,
      createdAt: params.createdAt,
      updatedAt: params.createdAt,
    });
    profileRows.push({
      id: newId(),
      userId,
      companyId: requireId(companyIdBySlug, params.companySlug),
      designation: params.designation,
      createdAt: params.createdAt,
      updatedAt: params.createdAt,
    });
    const roster = hrUserIdsByCompanySlug.get(params.companySlug) ?? [];
    roster.push(userId);
    hrUserIdsByCompanySlug.set(params.companySlug, roster);
    return userId;
  };

  const addGeneratedHr = (companySlug: string): void => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    addHr({
      email: nextEmail(firstName, lastName),
      passwordHash: sharedHash,
      firstName,
      lastName,
      companySlug,
      designation: pickOne(HR_DESIGNATIONS),
      createdAt: dateBetween(
        daysBeforeReference(EARLIEST_ACTIVITY_DAYS_AGO),
        daysBeforeReference(90),
      ),
    });
  };

  // Primary HR (admin@test.com).
  const primaryHrUserId = addHr({
    email: PRIMARY_HR_EMAIL,
    passwordHash: primaryHash,
    firstName: 'Aisha',
    lastName: 'Khan',
    companySlug: PRIMARY_HR_COMPANY_SLUG,
    designation: 'Talent Acquisition Lead',
    createdAt: daysBeforeReference(300),
  });

  // Named secondary HR accounts.
  for (const hr of NAMED_HR) {
    addHr({
      email: hr.email,
      passwordHash: sharedHash,
      firstName: hr.firstName,
      lastName: hr.lastName,
      companySlug: hr.companySlug,
      designation: hr.designation,
      createdAt: dateBetween(daysBeforeReference(300), daysBeforeReference(120)),
    });
  }

  // README-documented demo recruiters. hr1 + hr3 share SkyPoint Technologies so
  // org-scoped visibility (hr1 sees hr3's jobs) is demonstrable; hr2 is isolated
  // in Vertex Labs (hr1 must NOT see hr2's jobs).
  const demoHr1UserId = addHr({
    email: DEMO_HR_1_EMAIL,
    passwordHash: demoHrHash,
    firstName: 'Sanjay',
    lastName: 'Menon',
    companySlug: SKYPOINT_COMPANY_SLUG,
    designation: 'Talent Acquisition Lead',
    createdAt: daysBeforeReference(300),
  });
  const demoHr3UserId = addHr({
    email: DEMO_HR_3_EMAIL,
    passwordHash: demoHrHash,
    firstName: 'Divya',
    lastName: 'Kapoor',
    companySlug: SKYPOINT_COMPANY_SLUG,
    designation: 'Technical Recruiter',
    createdAt: daysBeforeReference(280),
  });
  const demoHr2UserId = addHr({
    email: DEMO_HR_2_EMAIL,
    passwordHash: demoHrHash,
    firstName: 'Karan',
    lastName: 'Malhotra',
    companySlug: VERTEX_COMPANY_SLUG,
    designation: 'Talent Acquisition Lead',
    createdAt: daysBeforeReference(300),
  });
  const demoHrUserIds: DemoHrUserIds = {
    hr1: demoHr1UserId,
    hr2: demoHr2UserId,
    hr3: demoHr3UserId,
  };

  // Guarantee every named organization has a full recruiting team so org-scoped
  // authorization (teammates sharing a company's jobs) is demonstrable.
  for (const slug of NAMED_ORG_SLUGS) {
    while ((hrUserIdsByCompanySlug.get(slug)?.length ?? 0) < MIN_HR_PER_NAMED_ORG) {
      addGeneratedHr(slug);
    }
  }

  // Guarantee every company has at least one recruiter, then fill to target.
  for (const company of companyDefs) {
    if (!hrUserIdsByCompanySlug.has(company.slug)) {
      addGeneratedHr(company.slug);
    }
  }
  const companySlugs = companyDefs.map((company) => company.slug);
  while (userRows.length < TARGET_HR_USERS) {
    addGeneratedHr(pickOne(companySlugs));
  }

  await insertInBatches(userRows, (batch) => prisma.user.createMany({ data: batch }));
  await insertInBatches(profileRows, (batch) => prisma.hrProfile.createMany({ data: batch }));

  return { primaryHrUserId, demoHrUserIds, hrUserIdsByCompanySlug };
}

// ---------------------------------------------------------------------------
// Candidates (users + profiles + skills + education)
// ---------------------------------------------------------------------------

interface CandidateRecord {
  readonly candidateProfileId: string;
  readonly email: string;
  readonly createdAt: Date;
}

function experienceToLevel(months: number): ExperienceLevel {
  if (months < 12) return ExperienceLevel.INTERNSHIP;
  if (months < 30) return ExperienceLevel.ENTRY_LEVEL;
  if (months < 78) return ExperienceLevel.MID_LEVEL;
  if (months < 132) return ExperienceLevel.SENIOR;
  return ExperienceLevel.LEAD;
}

function composeAbout(): string {
  return `${pickOne(ABOUT_OPENERS)} ${pickOne(ABOUT_MIDDLES)} ${pickOne(ABOUT_CLOSERS)}`;
}

function buildEducationEntries(
  candidateProfileId: string,
  highestEducation: EducationLevel,
  totalExperienceMonths: number,
  createdAt: Date,
): Prisma.EducationEntryCreateManyInput[] {
  const graduationYear =
    REFERENCE_DATE.getUTCFullYear() - Math.floor(totalExperienceMonths / 12) - 1;
  const hasPostgraduate =
    highestEducation === EducationLevel.MASTERS || highestEducation === EducationLevel.DOCTORATE;
  const bachelorsEndYear = hasPostgraduate ? graduationYear - 2 : graduationYear;

  const rows: Prisma.EducationEntryCreateManyInput[] = [
    {
      id: newId(),
      candidateProfileId,
      institution: pickOne(UNIVERSITIES),
      degree: DEGREE_BY_LEVEL[EducationLevel.BACHELORS],
      level: EducationLevel.BACHELORS,
      fieldOfStudy: pickOne(FIELDS_OF_STUDY),
      startYear: bachelorsEndYear - 4,
      endYear: bachelorsEndYear,
      grade: `${(7 + faker.number.float({ min: 0, max: 3, fractionDigits: 1 })).toFixed(1)} CGPA`,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  if (hasPostgraduate) {
    rows.push({
      id: newId(),
      candidateProfileId,
      institution: pickOne(UNIVERSITIES),
      degree: DEGREE_BY_LEVEL[EducationLevel.MASTERS],
      level: EducationLevel.MASTERS,
      fieldOfStudy: pickOne(FIELDS_OF_STUDY),
      startYear: graduationYear - 2,
      endYear: graduationYear,
      grade: `${(7.5 + faker.number.float({ min: 0, max: 2.5, fractionDigits: 1 })).toFixed(1)} CGPA`,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return rows;
}

function buildCandidateSkills(
  candidateProfileId: string,
  skillSlugs: readonly string[],
  skillIdBySlug: ReadonlyMap<string, string>,
  createdAt: Date,
): Prisma.CandidateSkillCreateManyInput[] {
  const proficiencies: readonly ProficiencyLevel[] = [
    ProficiencyLevel.BEGINNER,
    ProficiencyLevel.INTERMEDIATE,
    ProficiencyLevel.ADVANCED,
    ProficiencyLevel.EXPERT,
  ];
  return skillSlugs.map((slug) => ({
    id: newId(),
    candidateProfileId,
    skillId: requireId(skillIdBySlug, slug),
    proficiency: pickOne(proficiencies),
    yearsOfExperience: randomInt(1, 8),
    createdAt,
    updatedAt: createdAt,
  }));
}

interface CandidateSeedInput {
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly headline: string;
  readonly currentLocation: string;
  readonly currentCompany: string;
  readonly currentTitle: string;
  readonly totalExperienceMonths: number;
  readonly highestEducation: EducationLevel;
  readonly skillSlugs: readonly string[];
  readonly createdAt: Date;
}

async function seedCandidates(
  companyNames: readonly string[],
  skillIdBySlug: ReadonlyMap<string, string>,
): Promise<CandidateRecord[]> {
  const primaryHash = await hashPassword(PRIMARY_CANDIDATE_PASSWORD);
  const demoHash = await hashPassword(DEMO_USER_PASSWORD);
  const demoCandidateHash = await hashPassword(DEMO_CANDIDATE_PASSWORD);
  const sharedHash = demoHash; // reuse one bcrypt hash for every generated candidate

  const nextEmail = createUniqueEmailFactory(GENERATED_CANDIDATE_EMAIL_DOMAIN);
  const userRows: Prisma.UserCreateManyInput[] = [];
  const profileRows: Prisma.CandidateProfileCreateManyInput[] = [];
  const skillRows: Prisma.CandidateSkillCreateManyInput[] = [];
  const educationRows: Prisma.EducationEntryCreateManyInput[] = [];
  const records: CandidateRecord[] = [];

  const externalEmployerNames: readonly string[] = [
    ...companyNames,
    'Infosys',
    'Tata Consultancy Services',
    'Wipro',
    'Accenture',
    'Cognizant',
    'Google',
    'Microsoft',
    'Freelance',
  ];

  const addCandidate = (input: CandidateSeedInput): void => {
    const userId = newId();
    const candidateProfileId = newId();

    userRows.push({
      id: userId,
      email: input.email,
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: UserRole.CANDIDATE,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    });

    const expectedSalaryMin = 600000 + Math.round(input.totalExperienceMonths * 22000);
    profileRows.push({
      id: candidateProfileId,
      userId,
      headline: input.headline,
      about: composeAbout(),
      phone: faker.phone.number({ style: 'international' }),
      currentLocation: input.currentLocation,
      preferredLocation: chance(0.35) ? REMOTE_LOCATION_LABEL : pickOne(WORLD_LOCATIONS),
      currentCompany: input.currentCompany,
      currentTitle: input.currentTitle,
      totalExperienceMonths: input.totalExperienceMonths,
      highestEducation: input.highestEducation,
      expectedSalaryMin,
      expectedSalaryMax: expectedSalaryMin + randomInt(400000, 1200000),
      noticePeriodDays: pickOne(NOTICE_PERIOD_OPTIONS),
      isOpenToWork: chance(0.82),
      resumeUrl: `https://resumes.talentflow.dev/${userId}.pdf`,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    });

    skillRows.push(
      ...buildCandidateSkills(candidateProfileId, input.skillSlugs, skillIdBySlug, input.createdAt),
    );
    educationRows.push(
      ...buildEducationEntries(
        candidateProfileId,
        input.highestEducation,
        input.totalExperienceMonths,
        input.createdAt,
      ),
    );

    records.push({ candidateProfileId, email: input.email, createdAt: input.createdAt });
  };

  // Primary + named + README demo candidates (all preserved exactly).
  const namedCandidates: ReadonlyArray<{ candidate: NamedCandidate; hash: string }> = [
    { candidate: PRIMARY_CANDIDATE, hash: primaryHash },
    ...NAMED_CANDIDATES.map((candidate) => ({ candidate, hash: sharedHash })),
    ...DEMO_CANDIDATES.map((candidate) => ({ candidate, hash: demoCandidateHash })),
  ];
  for (const { candidate, hash } of namedCandidates) {
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
      createdAt: dateBetween(daysBeforeReference(320), daysBeforeReference(120)),
    });
  }

  // Generated candidates to reach the target volume.
  while (userRows.length < TARGET_CANDIDATES) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const totalExperienceMonths = randomInt(0, 168);
    const level = experienceToLevel(totalExperienceMonths);
    const highestEducation = pickWeighted<EducationLevel>([
      [EducationLevel.BACHELORS, 6],
      [EducationLevel.MASTERS, 3],
      [EducationLevel.DIPLOMA, 1],
      [EducationLevel.DOCTORATE, 1],
    ]);
    const role = pickOne(ROLE_TEMPLATES);
    const seniority = pickOne(SENIORITY_BY_LEVEL[level]);
    const currentTitle = `${seniority} ${role.base}`.trim();
    const primarySkills = pickDistinct(
      role.skillSlugs,
      randomInt(3, Math.min(6, role.skillSlugs.length)),
    );
    const extraSkills = pickDistinct(ALL_SKILL_SLUGS, randomInt(0, 3));
    const skillSlugs = [...new Set([...primarySkills, ...extraSkills])];

    addCandidate({
      email: nextEmail(firstName, lastName),
      passwordHash: sharedHash,
      firstName,
      lastName,
      headline: `${currentTitle} · ${pickOne(role.skillSlugs)} focus`,
      currentLocation: pickOne(WORLD_LOCATIONS),
      currentCompany: pickOne(externalEmployerNames),
      currentTitle,
      totalExperienceMonths,
      highestEducation,
      skillSlugs,
      createdAt: dateBetween(daysBeforeReference(340), daysBeforeReference(15)),
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
  readonly publishedAt: Date;
}

function composeJobDescription(roleBase: string, companyName: string): string {
  return [
    pickOne(JOB_INTROS),
    `As a ${roleBase} at ${companyName}, you will:`,
    `• ${pickOne(JOB_RESPONSIBILITIES)}`,
    `• ${pickOne(JOB_RESPONSIBILITIES)}`,
    `• ${pickOne(JOB_RESPONSIBILITIES)}`,
    pickOne(JOB_CLOSINGS),
  ].join('\n');
}

function composeJobTitle(roleBase: string, experienceLevel: ExperienceLevel): string {
  const seniority = pickOne(SENIORITY_BY_LEVEL[experienceLevel]);
  if (experienceLevel === ExperienceLevel.EXECUTIVE) {
    const roleWithoutSuffix = roleBase.replace(
      / (Engineer|Manager|Designer|Researcher|Architect)$/,
      '',
    );
    return `${seniority} ${roleWithoutSuffix}`.trim();
  }
  return `${seniority} ${roleBase}`.trim();
}

async function seedJobs(
  companyDefs: readonly CompanyDef[],
  companyIdBySlug: ReadonlyMap<string, string>,
  skillIdBySlug: ReadonlyMap<string, string>,
  hrUserIdsByCompanySlug: ReadonlyMap<string, string[]>,
  primaryHrUserId: string,
  demoHrUserIds: DemoHrUserIds,
): Promise<JobRecord[]> {
  const jobRows: Prisma.JobCreateManyInput[] = [];
  const jobSkillRows: Prisma.JobSkillCreateManyInput[] = [];
  const records: JobRecord[] = [];

  const companyNameBySlug = new Map(companyDefs.map((company) => [company.slug, company.name]));
  const companySlugs = companyDefs.map((company) => company.slug);

  // Pinned assignments guarantee each demo recruiter a healthy PUBLISHED board in
  // their own organization. Slots are consumed by the leading job indices.
  const pinnedAuthors: ReadonlyArray<{
    readonly postedById: string;
    readonly companySlug: string;
    readonly count: number;
  }> = [
    {
      postedById: primaryHrUserId,
      companySlug: PRIMARY_HR_COMPANY_SLUG,
      count: PRIMARY_HR_JOB_COUNT,
    },
    {
      postedById: demoHrUserIds.hr1,
      companySlug: SKYPOINT_COMPANY_SLUG,
      count: DEMO_HR_1_JOB_COUNT,
    },
    {
      postedById: demoHrUserIds.hr3,
      companySlug: SKYPOINT_COMPANY_SLUG,
      count: DEMO_HR_3_JOB_COUNT,
    },
    { postedById: demoHrUserIds.hr2, companySlug: VERTEX_COMPANY_SLUG, count: DEMO_HR_2_JOB_COUNT },
  ];
  const pinnedSlots: ReadonlyArray<{ readonly postedById: string; readonly companySlug: string }> =
    pinnedAuthors.flatMap((author) =>
      Array.from({ length: author.count }, () => ({
        postedById: author.postedById,
        companySlug: author.companySlug,
      })),
    );

  const experienceLevels: ReadonlyArray<readonly [ExperienceLevel, number]> = [
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
    [EmploymentType.PART_TIME, 1],
    [EmploymentType.FREELANCE, 1],
    [EmploymentType.TEMPORARY, 1],
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

  for (let index = 0; index < TARGET_JOBS; index += 1) {
    // Pin an initial block to the primary + demo recruiters (each in their own
    // organization) so every demo HR board is full of PUBLISHED jobs.
    const pinnedSlot = index < pinnedSlots.length ? pinnedSlots[index] : undefined;
    const companySlug = pinnedSlot ? pinnedSlot.companySlug : pickOne(companySlugs);
    const companyName = companyNameBySlug.get(companySlug) ?? companySlug;
    const recruiterPool = hrUserIdsByCompanySlug.get(companySlug) ?? [];
    if (recruiterPool.length === 0) {
      throw new Error(`No HR user available for company "${companySlug}".`);
    }
    const postedById = pinnedSlot ? pinnedSlot.postedById : pickOne(recruiterPool);

    const role = pickOne(ROLE_TEMPLATES);
    const experienceLevel = pickWeighted(experienceLevels);
    const employmentType =
      experienceLevel === ExperienceLevel.INTERNSHIP
        ? EmploymentType.INTERNSHIP
        : pickWeighted(employmentTypes);
    const locationType = pickWeighted(locationTypes);
    const status = pinnedSlot ? JobStatus.PUBLISHED : pickWeighted(statuses);
    const band = SALARY_BY_LEVEL[experienceLevel];
    const salaryMin = band.min + randomInt(0, 3) * 100000;
    const salaryMax = salaryMin + randomInt(3, 12) * 100000;

    const createdAt = dateBetween(daysBeforeReference(240), daysBeforeReference(1));
    const isLive = status === JobStatus.PUBLISHED || status === JobStatus.CLOSED;
    const publishedAt = createdAt;
    const closedAt =
      status === JobStatus.CLOSED ? dateBetween(createdAt, REFERENCE_DATE) : createdAt;
    const jobId = newId();

    jobRows.push({
      id: jobId,
      companyId: requireId(companyIdBySlug, companySlug),
      postedById,
      title: composeJobTitle(role.base, experienceLevel),
      description: composeJobDescription(role.base, companyName),
      employmentType,
      experienceLevel,
      locationType,
      location:
        locationType === LocationType.REMOTE ? REMOTE_LOCATION_LABEL : pickOne(WORLD_LOCATIONS),
      minExperienceYears: band.minExperienceYears,
      maxExperienceYears: band.maxExperienceYears,
      salaryMin,
      salaryMax,
      salaryPeriod: SalaryPeriod.YEARLY,
      openings: randomInt(1, 5),
      status,
      publishedAt: isLive ? publishedAt : null,
      expiresAt:
        status === JobStatus.PUBLISHED && chance(0.5)
          ? new Date(publishedAt.getTime() + randomInt(30, 90) * MILLIS_PER_DAY)
          : null,
      createdAt,
      updatedAt: status === JobStatus.CLOSED ? closedAt : createdAt,
    });

    const skillCount = randomInt(3, Math.min(8, role.skillSlugs.length));
    const chosenSkills = pickDistinct(role.skillSlugs, skillCount);
    const requiredCutoff = Math.ceil(skillCount / 2);
    chosenSkills.forEach((slug, position) => {
      jobSkillRows.push({
        id: newId(),
        jobId,
        skillId: requireId(skillIdBySlug, slug),
        isRequired: position < requiredCutoff,
        createdAt,
        updatedAt: createdAt,
      });
    });

    records.push({ jobId, postedById, status, publishedAt });
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

const FINAL_STATUS_DISTRIBUTION: ReadonlyArray<readonly [ApplicationStatus, number]> = [
  [ApplicationStatus.APPLIED, 34],
  [ApplicationStatus.UNDER_REVIEW, 22],
  [ApplicationStatus.SHORTLISTED, 12],
  [ApplicationStatus.INTERVIEW, 9],
  [ApplicationStatus.OFFERED, 4],
  [ApplicationStatus.HIRED, 3],
  [ApplicationStatus.REJECTED, 13],
  [ApplicationStatus.WITHDRAWN, 3],
];

/** Long-tail popularity weights so a few jobs attract most applicants. */
const JOB_POPULARITY_WEIGHTS: ReadonlyArray<readonly [number, number]> = [
  [1, 5],
  [3, 3],
  [6, 2],
  [12, 1],
];

const MAX_STATUS_STEP_DAYS = 6;

/** Builds the ordered status flow that terminates at `finalStatus`. */
function buildStatusFlow(finalStatus: ApplicationStatus): ApplicationStatus[] {
  if (finalStatus === ApplicationStatus.REJECTED || finalStatus === ApplicationStatus.WITHDRAWN) {
    const depth = randomInt(1, 3);
    return [...PIPELINE_ORDER.slice(0, depth), finalStatus];
  }
  const endIndex = PIPELINE_ORDER.indexOf(finalStatus);
  return PIPELINE_ORDER.slice(0, endIndex + 1);
}

async function seedApplications(
  candidates: readonly CandidateRecord[],
  jobs: readonly JobRecord[],
  primaryCandidateEmail: string,
  demoHrUserIds: DemoHrUserIds,
  demoCandidateEmails: readonly string[],
): Promise<number> {
  const applicationRows: Prisma.ApplicationCreateManyInput[] = [];
  const eventRows: Prisma.ApplicationStatusEventCreateManyInput[] = [];

  const liveJobs = jobs.filter(
    (job) => job.status === JobStatus.PUBLISHED || job.status === JobStatus.CLOSED,
  );
  if (liveJobs.length === 0) {
    throw new Error('No live jobs available to receive applications.');
  }

  // Weight job selection by intrinsic popularity to create a natural long tail.
  const weightedJobEntries: ReadonlyArray<readonly [JobRecord, number]> = liveJobs.map((job) => [
    job,
    pickWeighted(JOB_POPULARITY_WEIGHTS),
  ]);

  const taken = new Set<string>(); // `${jobId}:${candidateProfileId}` — enforces the unique constraint.

  const addApplication = (
    job: JobRecord,
    candidate: CandidateRecord,
    finalStatus: ApplicationStatus,
  ): boolean => {
    const key = `${job.jobId}:${candidate.candidateProfileId}`;
    if (taken.has(key)) {
      return false;
    }
    // A candidate can only apply once the job is live AND their account exists.
    const earliestApply = new Date(
      Math.max(job.publishedAt.getTime(), candidate.createdAt.getTime()),
    );
    if (earliestApply.getTime() >= REFERENCE_DATE.getTime()) {
      return false;
    }
    taken.add(key);

    const appliedAt = dateBetween(earliestApply, REFERENCE_DATE);
    const applicationId = newId();
    const flow = buildStatusFlow(finalStatus);

    // One audit event per transition; timestamps march forward, clamped to the
    // reference date so no event is ever recorded "in the future".
    let eventAt = appliedAt;
    let lastEventAt = appliedAt;
    flow.forEach((status, position) => {
      if (position > 0) {
        const advanced = eventAt.getTime() + randomInt(1, MAX_STATUS_STEP_DAYS) * MILLIS_PER_DAY;
        eventAt = new Date(Math.min(advanced, REFERENCE_DATE.getTime()));
      }
      lastEventAt = eventAt;
      eventRows.push({
        id: newId(),
        applicationId,
        status,
        note: null,
        // The initial APPLIED event is the candidate's own action; later
        // transitions are recorded by the HR who owns the job.
        changedById: status === ApplicationStatus.APPLIED ? null : job.postedById,
        createdAt: eventAt,
        updatedAt: eventAt,
      });
    });

    applicationRows.push({
      id: applicationId,
      jobId: job.jobId,
      candidateProfileId: candidate.candidateProfileId,
      status: finalStatus,
      coverLetter: chance(0.7) ? pickOne(COVER_LETTERS) : null,
      resumeUrl: `https://resumes.talentflow.dev/${candidate.candidateProfileId}.pdf`,
      createdAt: appliedAt,
      updatedAt: lastEventAt,
    });
    return true;
  };

  // 1) Guarantee the primary candidate a rich, varied board on the primary HR's
  //    (published) jobs so the demo screens are populated end to end.
  const primaryCandidate = candidates.find(
    (candidate) => candidate.email === primaryCandidateEmail,
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
    const demoJobs = pickDistinct(liveJobs, PRIMARY_CANDIDATE_DEMO_APPLICATIONS);
    demoJobs.forEach((job, position) => {
      addApplication(job, primaryCandidate, demoStatuses[position] ?? ApplicationStatus.APPLIED);
    });
  }

  // 2) Guarantee the README demo recruiters (hr1 in SkyPoint, hr2 in Vertex Labs)
  //    a populated applicant board by routing the README demo candidates onto
  //    their live jobs, spanning both organizations and varied pipeline states.
  const demoBoardStatuses: readonly ApplicationStatus[] = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.OFFERED,
  ];
  const demoCandidateRecords = demoCandidateEmails
    .map((email) => candidates.find((candidate) => candidate.email === email))
    .filter((candidate): candidate is CandidateRecord => candidate !== undefined);
  const demoRecruiterIds: readonly string[] = [demoHrUserIds.hr1, demoHrUserIds.hr2];
  for (const recruiterId of demoRecruiterIds) {
    const recruiterJobs = liveJobs.filter((job) => job.postedById === recruiterId);
    if (recruiterJobs.length === 0) {
      continue;
    }
    for (const candidate of demoCandidateRecords) {
      const boardJobs = pickDistinct(recruiterJobs, DEMO_CANDIDATE_DEMO_APPLICATIONS);
      boardJobs.forEach((job, position) => {
        addApplication(job, candidate, demoBoardStatuses[position] ?? ApplicationStatus.APPLIED);
      });
    }
  }

  // 3) Candidate-driven generation: each candidate applies to a weighted number
  //    of jobs, picking jobs by popularity so the distribution is realistic.
  for (const candidate of candidates) {
    const applicationCount = pickWeighted(
      APPLICATIONS_PER_CANDIDATE.map((entry) => [entry.value, entry.weight] as const),
    );
    for (let attempt = 0; attempt < applicationCount; attempt += 1) {
      const job = pickWeighted(weightedJobEntries);
      addApplication(job, candidate, pickWeighted(FINAL_STATUS_DISTRIBUTION));
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

  const companyDefs = buildCompanyDefs();
  const companyIdBySlug = await seedCompanies(companyDefs);
  console.info(`  ✓ ${companyIdBySlug.size} companies`);

  const skillIdBySlug = await seedSkills();
  console.info(`  ✓ ${skillIdBySlug.size} skills`);

  const { primaryHrUserId, demoHrUserIds, hrUserIdsByCompanySlug } = await seedHrUsers(
    companyDefs,
    companyIdBySlug,
  );
  const hrCount = [...hrUserIdsByCompanySlug.values()].reduce(
    (sum, roster) => sum + roster.length,
    0,
  );
  console.info(`  ✓ ${hrCount} HR users across ${hrUserIdsByCompanySlug.size} companies`);

  const companyNames = companyDefs.map((company) => company.name);
  const candidates = await seedCandidates(companyNames, skillIdBySlug);
  console.info(`  ✓ ${candidates.length} candidates (with profiles, skills, education)`);

  const jobs = await seedJobs(
    companyDefs,
    companyIdBySlug,
    skillIdBySlug,
    hrUserIdsByCompanySlug,
    primaryHrUserId,
    demoHrUserIds,
  );
  console.info(`  ✓ ${jobs.length} jobs`);

  const applicationCount = await seedApplications(
    candidates,
    jobs,
    PRIMARY_CANDIDATE_EMAIL,
    demoHrUserIds,
    [DEMO_CANDIDATE_1_EMAIL, DEMO_CANDIDATE_2_EMAIL],
  );
  console.info(`  ✓ ${applicationCount} applications (with status-event history)`);

  console.info('✅ Seed complete.');
  console.info(`   HR login:        ${PRIMARY_HR_EMAIL} / ${PRIMARY_HR_PASSWORD}`);
  console.info(`   Candidate login: ${PRIMARY_CANDIDATE_EMAIL} / ${PRIMARY_CANDIDATE_PASSWORD}`);
  console.info('   README demo accounts:');
  console.info(`     Candidate: ${DEMO_CANDIDATE_1_EMAIL} / ${DEMO_CANDIDATE_PASSWORD}`);
  console.info(`     Candidate: ${DEMO_CANDIDATE_2_EMAIL} / ${DEMO_CANDIDATE_PASSWORD}`);
  console.info(`     HR:        ${DEMO_HR_1_EMAIL} / ${DEMO_HR_PASSWORD} (SkyPoint Technologies)`);
  console.info(`     HR:        ${DEMO_HR_3_EMAIL} / ${DEMO_HR_PASSWORD} (SkyPoint Technologies)`);
  console.info(`     HR:        ${DEMO_HR_2_EMAIL} / ${DEMO_HR_PASSWORD} (Vertex Labs)`);
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
