import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    // Allow NodeNext-style `.js` extension imports (used by the generated Prisma
    // client) to resolve to their TypeScript sources under ts-jest.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Keep in sync with the `paths` alias in tsconfig.json.
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/**/*.d.ts', '!src/generated/**'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};

export default config;
