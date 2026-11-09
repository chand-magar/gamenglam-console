import { cleanEnv, str, url } from 'envalid';

const env = cleanEnv(import.meta.env, {
  VITE_API_BASE_URL: url({ default: 'http://localhost:8080/api/v1' }),
  VITE_APP_ENV: str({ choices: ['development', 'staging', 'production'], default: 'development' }),
});

export default env;