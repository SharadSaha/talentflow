import packageJson from '../../package.json';

/**
 * Static application metadata sourced from `package.json`, so the version is
 * defined in a single place and surfaced by the `/version` endpoint.
 */
export const APP_VERSION: string = packageJson.version;
