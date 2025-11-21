/**
 * User Input Validation Schemas
 *
 * Validates user input to prevent:
 * - SQL Injection
 * - XSS attacks
 * - Invalid data formats
 * - Buffer overflow
 */

const { z } = require('zod');

// Common validation patterns
const PATTERNS = {
  // Alphanumeric + underscore + hyphen
  username: /^[a-zA-Z0-9_-]+$/,

  // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  // Phone number: various formats
  phone: /^[\d\s\-\+\(\)]+$/,

  // Employee number: alphanumeric + hyphen
  employeeNumber: /^[A-Z0-9-]+$/,

  // Korean name: Hangul + space
  koreanName: /^[가-힣\s]+$/,

  // English name: letters + space + hyphen + apostrophe
  englishName: /^[a-zA-Z\s\-']+$/,
};

// Sanitize string: remove potentially dangerous characters
const sanitizeString = (str) => {
  if (!str) return str;
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 500); // Limit length
};

/**
 * Create User Validation Schema
 */
const createUserSchema = z.object({
  loginid: z
    .string()
    .min(3, 'Login ID must be at least 3 characters')
    .max(50, 'Login ID must not exceed 50 characters')
    .regex(PATTERNS.username, 'Login ID can only contain letters, numbers, underscore, and hyphen')
    .transform(sanitizeString),

  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      PATTERNS.password,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  name_ko: z
    .string()
    .min(2, 'Korean name must be at least 2 characters')
    .max(50, 'Korean name must not exceed 50 characters')
    .regex(PATTERNS.koreanName, 'Korean name must contain only Hangul characters')
    .transform(sanitizeString)
    .optional(),

  name_en: z
    .string()
    .min(2, 'English name must be at least 2 characters')
    .max(100, 'English name must not exceed 100 characters')
    .regex(PATTERNS.englishName, 'English name must contain only letters')
    .transform(sanitizeString)
    .optional(),

  employee_number: z
    .string()
    .max(50, 'Employee number must not exceed 50 characters')
    .regex(PATTERNS.employeeNumber, 'Invalid employee number format')
    .optional(),

  phone_number: z
    .string()
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(PATTERNS.phone, 'Invalid phone number format')
    .optional(),

  mobile_number: z
    .string()
    .max(20, 'Mobile number must not exceed 20 characters')
    .regex(PATTERNS.phone, 'Invalid mobile number format')
    .optional(),

  user_category: z
    .enum(['admin', 'regular', 'guest', 'system'], {
      errorMap: () => ({ message: 'Invalid user category' }),
    })
    .default('regular'),

  position: z
    .string()
    .max(100, 'Position must not exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  department: z
    .string()
    .max(50, 'Department ID must not exceed 50 characters')
    .optional(),

  status: z
    .enum(['active', 'inactive', 'locked'], {
      errorMap: () => ({ message: 'Invalid status' }),
    })
    .default('active'),

  mfa_enabled: z.boolean().default(false),
});

/**
 * Update User Validation Schema
 * Similar to create but all fields optional except password validation
 */
const updateUserSchema = z.object({
  loginid: z
    .string()
    .min(3, 'Login ID must be at least 3 characters')
    .max(50, 'Login ID must not exceed 50 characters')
    .regex(PATTERNS.username, 'Login ID can only contain letters, numbers, underscore, and hyphen')
    .transform(sanitizeString)
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .transform((email) => email.toLowerCase().trim())
    .optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      PATTERNS.password,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional(),

  name_ko: z
    .string()
    .min(2, 'Korean name must be at least 2 characters')
    .max(50, 'Korean name must not exceed 50 characters')
    .regex(PATTERNS.koreanName, 'Korean name must contain only Hangul characters')
    .transform(sanitizeString)
    .optional(),

  name_en: z
    .string()
    .min(2, 'English name must be at least 2 characters')
    .max(100, 'English name must not exceed 100 characters')
    .regex(PATTERNS.englishName, 'English name must contain only letters')
    .transform(sanitizeString)
    .optional(),

  employee_number: z
    .string()
    .max(50, 'Employee number must not exceed 50 characters')
    .regex(PATTERNS.employeeNumber, 'Invalid employee number format')
    .optional(),

  phone_number: z
    .string()
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(PATTERNS.phone, 'Invalid phone number format')
    .optional(),

  mobile_number: z
    .string()
    .max(20, 'Mobile number must not exceed 20 characters')
    .regex(PATTERNS.phone, 'Invalid mobile number format')
    .optional(),

  user_category: z
    .enum(['admin', 'regular', 'guest', 'system'], {
      errorMap: () => ({ message: 'Invalid user category' }),
    })
    .optional(),

  position: z
    .string()
    .max(100, 'Position must not exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  department: z
    .string()
    .max(50, 'Department ID must not exceed 50 characters')
    .optional(),

  status: z
    .enum(['active', 'inactive', 'locked'], {
      errorMap: () => ({ message: 'Invalid status' }),
    })
    .optional(),

  mfa_enabled: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Login Validation Schema
 */
const loginSchema = z.object({
  loginid: z
    .string()
    .min(1, 'Login ID is required')
    .max(50, 'Login ID must not exceed 50 characters')
    .transform(sanitizeString),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must not exceed 100 characters'),
});

/**
 * User Query Parameters Validation
 */
const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().max(10000)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().positive().max(1000)),

  search: z
    .string()
    .max(100, 'Search term must not exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  status: z.enum(['active', 'inactive', 'locked']).optional(),

  user_category: z.enum(['admin', 'regular', 'guest', 'system']).optional(),

  department: z
    .string()
    .max(50, 'Department ID must not exceed 50 characters')
    .optional(),
});

/**
 * User ID Parameter Validation
 */
const userIdSchema = z.object({
  id: z
    .string()
    .min(1, 'User ID is required')
    .max(50, 'User ID must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid User ID format'),
});

/**
 * Password Change Schema
 */
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(100, 'Password must not exceed 100 characters'),

  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must not exceed 100 characters')
    .regex(
      PATTERNS.password,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required')
    .max(100, 'Password must not exceed 100 characters'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

module.exports = {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  userQuerySchema,
  userIdSchema,
  changePasswordSchema,
  PATTERNS,
  sanitizeString,
};
