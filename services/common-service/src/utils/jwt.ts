/**
 * JWT Utilities for Common Service
 */

import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
