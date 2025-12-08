/**
 * HTTP 요청 로깅 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from './logger';

const logger = getLogger('HTTP');

/**
 * 요청 로깅 미들웨어
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // 요청 정보 로깅
  logger.info(`→ ${req.method} ${req.path}`, {
    query: Object.keys(req.query).length ? req.query : undefined,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent')?.substring(0, 100),
  });

  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`← ${req.method} ${req.path} ${statusCode} ${duration}ms`, {
      statusCode,
      duration,
    });
  });

  next();
}

/**
 * 느린 요청 경고 미들웨어
 * @param threshold 밀리초 단위 임계값
 */
export function slowRequestWarning(threshold: number = 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (duration > threshold) {
        logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          duration,
          threshold,
        });
      }
    });

    next();
  };
}

/**
 * 요청 본문 로깅 미들웨어 (개발용)
 * 주의: 프로덕션에서는 민감한 정보가 로깅될 수 있음
 */
export function requestBodyLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === 'development' && req.body) {
    // 비밀번호 등 민감한 필드 마스킹
    const sanitizedBody = { ...req.body };
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'secret'];

    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '***';
      }
    });

    logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }
  next();
}
