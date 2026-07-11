/**
 * Typed access to build-time environment variables. Reading them in one place
 * keeps `import.meta.env` usage out of feature code and documents every
 * variable the client depends on.
 */
interface AppEnv {
  apiBaseUrl: string;
  appName: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';
const DEFAULT_APP_NAME = 'TalentFlow';

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME ?? DEFAULT_APP_NAME,
};
