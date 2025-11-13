import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    JWT_SECRET: str(),
    PORT: port(),
    DB_HOST: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    FRONTEND_URL: str(),
    ADMIN_PANEL_URL: str(),
  });
};

export default validateEnv;
