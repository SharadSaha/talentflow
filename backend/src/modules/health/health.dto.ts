/** Connectivity results for the service's downstream dependencies. */
export interface HealthChecks {
  database: 'up' | 'down';
  redis: 'up' | 'down' | 'disabled';
}

/** Structured health payload returned by `GET /health`. */
export interface HealthDto {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  checks: HealthChecks;
}

/** Build/version payload returned by `GET /version`. */
export interface VersionDto {
  version: string;
  environment: string;
  timestamp: string;
  commit: string;
}
