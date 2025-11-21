/**
 * Enhanced Logging System
 *
 * Provides structured logging with multiple transports:
 * - Console (development)
 * - File (production)
 * - Database (audit logs)
 *
 * Installation Required:
 * npm install winston winston-daily-rotate-file
 */

import path from 'path';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors, json, metadata } = format;

/**
 * Log Levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

/**
 * Log Context Interface
 */
export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Custom Log Format
 */
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

/**
 * Console Format (for development)
 */
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  customFormat
);

/**
 * File Format (for production)
 */
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  json()
);

/**
 * Create Logger Instance
 */
class Logger {
  private logger: WinstonLogger;
  private isWinstonAvailable: boolean;

  constructor() {
    this.isWinstonAvailable = this.checkWinstonAvailability();

    if (this.isWinstonAvailable) {
      this.logger = this.createWinstonLogger();
    } else {
      // Fallback to console logging
      console.warn('Winston not available. Using console fallback.');
      this.logger = this.createFallbackLogger();
    }
  }

  /**
   * Check if Winston is available
   */
  private checkWinstonAvailability(): boolean {
    try {
      require.resolve('winston');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create Winston Logger
   */
  private createWinstonLogger(): WinstonLogger {
    const logTransports: any[] = [];

    // Console transport (always enabled in development)
    if (process.env.NODE_ENV !== 'production') {
      logTransports.push(
        new transports.Console({
          format: consoleFormat,
          level: process.env.LOG_LEVEL || 'debug',
        })
      );
    }

    // File transports (production)
    if (process.env.NODE_ENV === 'production') {
      const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

      // Error logs
      logTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: fileFormat,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        })
      );

      // Combined logs
      logTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: fileFormat,
          maxSize: '20m',
          maxFiles: '7d',
          zippedArchive: true,
        })
      );

      // Console transport in production (errors only)
      logTransports.push(
        new transports.Console({
          format: consoleFormat,
          level: 'error',
        })
      );
    }

    return createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: logTransports,
      exitOnError: false,
    });
  }

  /**
   * Create Fallback Logger (when Winston is not available)
   */
  private createFallbackLogger(): any {
    const levels = ['error', 'warn', 'info', 'http', 'debug'];
    const logger: any = {};

    levels.forEach((level) => {
      logger[level] = (message: string, context?: LogContext) => {
        const timestamp = new Date().toISOString();
        const contextStr = context ? JSON.stringify(context) : '';
        console.log(`${timestamp} [${level.toUpperCase()}]: ${message} ${contextStr}`);
      };
    });

    return logger;
  }

  /**
   * Log Error
   */
  error(message: string, context?: LogContext | Error): void {
    if (context instanceof Error) {
      this.logger.error(message, { error: context.message, stack: context.stack });
    } else {
      this.logger.error(message, context);
    }
  }

  /**
   * Log Warning
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  /**
   * Log Info
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  /**
   * Log HTTP Request
   */
  http(message: string, context?: LogContext): void {
    this.logger.http(message, context);
  }

  /**
   * Log Debug
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  /**
   * Log Performance Metric
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration,
      type: 'performance',
    });

    // Warn if operation is slow
    if (duration > 1000) {
      this.warn(`Slow operation detected: ${operation} (${duration}ms)`, context);
    }
  }

  /**
   * Log Security Event
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, {
      ...context,
      type: 'security',
    });
  }

  /**
   * Log Audit Event
   */
  audit(action: string, context?: LogContext): void {
    this.info(`Audit: ${action}`, {
      ...context,
      type: 'audit',
    });
  }

  /**
   * Get Logger Instance
   */
  getLogger(): WinstonLogger {
    return this.logger;
  }
}

/**
 * Create Singleton Logger Instance
 */
const logger = new Logger();

/**
 * Export Logger Functions
 */
export const log = {
  error: (message: string, context?: LogContext | Error) => logger.error(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  http: (message: string, context?: LogContext) => logger.http(message, context),
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  performance: (operation: string, duration: number, context?: LogContext) =>
    logger.performance(operation, duration, context),
  security: (event: string, context?: LogContext) => logger.security(event, context),
  audit: (action: string, context?: LogContext) => logger.audit(action, context),
};

/**
 * Export Logger Class
 */
export default logger;
