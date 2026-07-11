/// <reference types="vite/client" />

/** Typed access to the client-exposed (`VITE_`) environment variables. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
