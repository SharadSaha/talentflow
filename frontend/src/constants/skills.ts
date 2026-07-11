import type { SelectOption } from '@/utils/options';

/**
 * The canonical skill vocabulary, mirroring the backend seed. Job create/update
 * connect skills by slug and reject unknown slugs, and no skills-list endpoint
 * is exposed — so the job form selects from this fixed reference set. A skill
 * is `{ name, slug }`.
 */
export interface Skill {
  name: string;
  slug: string;
}

export const SKILLS: Skill[] = [
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

/** Lookup from slug to display name for rendering skill chips. */
export const SKILL_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  SKILLS.map((skill) => [skill.slug, skill.name]),
);

/** Options for skill multi-selects (value = slug). */
export const SKILL_OPTIONS: SelectOption<string>[] = SKILLS.map((skill) => ({
  value: skill.slug,
  label: skill.name,
}));

/** Resolves a slug to its display name, falling back to the slug itself. */
export function getSkillName(slug: string): string {
  return SKILL_NAME_BY_SLUG[slug] ?? slug;
}
