/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Font Awesome CSS side-effect import
declare module '@fortawesome/fontawesome-free/css/all.min.css' {
  const content: Record<string, string>;
  export default content;
}

// Bootstrap CSS side-effect import
declare module 'bootstrap/dist/css/bootstrap.min.css' {
  const content: Record<string, string>;
  export default content;
}