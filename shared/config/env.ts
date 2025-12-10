/**
 * 환경 변수 설정 및 검증
 */

import dotenv from 'dotenv';
import path from 'path';

// 환경 변수 로드
export function loadEnv(): void {
  const env = process.env.NODE_ENV || 'development';

  // .env 파일 로드 순서: .env.local -> .env.{NODE_ENV} -> .env
  const envFiles = [
    `.env.${env}.local`,
    `.env.${env}`,
    '.env.local',
    '.env',
  ];

  for (const file of envFiles) {
    dotenv.config({ path: path.resolve(process.cwd(), file) });
  }
}

/**
 * 환경 변수 가져오기 (필수)
 */
export function getEnvRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * 환경 변수 가져오기 (선택)
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * 환경 변수 가져오기 (숫자)
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 환경 변수 가져오기 (불리언)
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * 현재 환경 확인
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * 공통 환경 설정
 */
export interface AppConfig {
  env: string;
  port: number;
  serviceName: string;
  logLevel: string;

  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };

  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  cors: {
    origins: string[];
  };
}

/**
 * 앱 설정 로드
 */
export function loadAppConfig(serviceName: string): AppConfig {
  loadEnv();

  return {
    env: getEnv('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    serviceName,
    logLevel: getEnv('LOG_LEVEL', isDevelopment ? 'debug' : 'info'),

    db: {
      host: getEnv('DB_HOST', 'localhost'),
      port: getEnvNumber('DB_PORT', 5432),
      name: getEnv('DB_NAME', 'corenextdb'),
      user: getEnv('DB_USER', 'postgres'),
      password: getEnv('DB_PASSWORD', ''),
    },

    jwt: {
      secret: getEnv('JWT_SECRET', 'default-secret'),
      refreshSecret: getEnv('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      expiresIn: getEnv('JWT_EXPIRES_IN', '30m'),
      refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    },

    cors: {
      origins: getEnv('CORS_ORIGINS', 'http://localhost:3000').split(','),
    },
  };
}
