/**
 * Winston 로거 설정
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// 로그 포맷 정의
const logFormat = printf(({ level, message, timestamp, service, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${service || 'app'}] ${level}: ${message} ${metaStr}`;
});

// 환경별 로그 레벨
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
};

// 기본 로거 생성
const createLogger = (serviceName: string = 'app') => {
  const transports: winston.transport[] = [
    // 콘솔 출력
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ];

  // 프로덕션 환경에서는 파일로도 출력
  if (process.env.NODE_ENV === 'production') {
    const logDir = process.env.LOG_DIR || 'logs';

    transports.push(
      // 에러 로그 파일
      new winston.transports.File({
        filename: path.join(logDir, `${serviceName}-error.log`),
        level: 'error',
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          logFormat
        ),
      }),
      // 전체 로그 파일
      new winston.transports.File({
        filename: path.join(logDir, `${serviceName}-combined.log`),
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          logFormat
        ),
      })
    );
  }

  return winston.createLogger({
    level: getLogLevel(),
    defaultMeta: { service: serviceName },
    transports,
  });
};

// 로거 캐시
const loggerCache: Map<string, winston.Logger> = new Map();

/**
 * 서비스별 로거 가져오기
 */
export function getLogger(serviceName: string = 'app'): winston.Logger {
  if (!loggerCache.has(serviceName)) {
    loggerCache.set(serviceName, createLogger(serviceName));
  }
  return loggerCache.get(serviceName)!;
}

// 기본 로거 export
export const logger = getLogger();

export default logger;
