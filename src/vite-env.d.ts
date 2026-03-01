/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_POCKETBASE_URL?: string;
  readonly VITE_PB_STAFF_COLLECTION?: string;
  readonly VITE_PB_USERS_COLLECTION?: string;
  readonly VITE_PB_STATE_COLLECTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
