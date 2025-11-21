/**
 * Express Type Extensions
 *
 * Augments Express types with custom properties
 */

import { JWTPayload, SuccessResponse, ErrorResponse } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      validatedFilename?: string;
      uploadDir?: string;
    }

    interface Response {
      success: <T = any>(data: T | { message: string; data?: T }) => void;
      error: (error: any) => void;
    }
  }
}

export {};
