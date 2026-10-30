/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WP_DOMAIN: string;
  readonly VITE_WP_GRAPHQL_ENDPOINT?: string;
  readonly VITE_CONTACT_FORM_ID?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
