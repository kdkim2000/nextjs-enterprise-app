/**
 * Common Validation Schemas
 *
 * Reusable validation schemas for common data types
 */

const { z } = require('zod');

/**
 * ID Schema - for UUID or custom IDs
 */
const idSchema = z
  .string()
  .min(1, 'ID is required')
  .max(50, 'ID must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format');

/**
 * Code Schema - for entity codes (DEPT-001, MENU-001, etc.)
 */
const codeSchema = z
  .string()
  .min(1, 'Code is required')
  .max(100, 'Code must not exceed 100 characters')
  .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, underscore, and hyphen');

/**
 * Multi-language Name Schema
 */
const multiLangNameSchema = z.object({
  name_en: z
    .string()
    .min(1, 'English name is required')
    .max(200, 'English name must not exceed 200 characters')
    .optional(),

  name_ko: z
    .string()
    .max(200, 'Korean name must not exceed 200 characters')
    .optional(),

  name_zh: z
    .string()
    .max(200, 'Chinese name must not exceed 200 characters')
    .optional(),

  name_vi: z
    .string()
    .max(200, 'Vietnamese name must not exceed 200 characters')
    .optional(),
});

/**
 * Multi-language Description Schema
 */
const multiLangDescriptionSchema = z.object({
  description_en: z
    .string()
    .max(1000, 'English description must not exceed 1000 characters')
    .optional(),

  description_ko: z
    .string()
    .max(1000, 'Korean description must not exceed 1000 characters')
    .optional(),

  description_zh: z
    .string()
    .max(1000, 'Chinese description must not exceed 1000 characters')
    .optional(),

  description_vi: z
    .string()
    .max(1000, 'Vietnamese description must not exceed 1000 characters')
    .optional(),
});

/**
 * Pagination Schema
 */
const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(10000)),

  limit: z
    .string()
    .optional()
    .default('50')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),
});

/**
 * Search Query Schema
 */
const searchSchema = z.object({
  search: z
    .string()
    .max(100, 'Search term must not exceed 100 characters')
    .transform((str) => str.trim())
    .optional(),
});

/**
 * Date Range Schema
 */
const dateRangeSchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Invalid start date format' })
    .optional(),

  endDate: z
    .string()
    .datetime({ message: 'Invalid end date format' })
    .optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'Start date must be before end date' }
);

/**
 * Status Schema
 */
const statusSchema = z.enum(['active', 'inactive', 'pending', 'deleted'], {
  errorMap: () => ({ message: 'Invalid status' }),
});

/**
 * Boolean Query Parameter Schema
 */
const booleanQuerySchema = (fieldName) => z
  .string()
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return undefined;
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    throw new Error(`${fieldName} must be true or false`);
  });

/**
 * Email Schema
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(100, 'Email must not exceed 100 characters')
  .transform((email) => email.toLowerCase().trim());

/**
 * URL Schema
 */
const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(500, 'URL must not exceed 500 characters');

/**
 * JSON Schema - validates JSON string
 */
const jsonStringSchema = z
  .string()
  .refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid JSON format' })
  .transform((val) => JSON.parse(val));

/**
 * Sanitize Input - remove dangerous characters
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\x20-\x7E\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g, '') // Allow printable ASCII, Japanese, Korean
    .substring(0, 1000); // Limit length
}

/**
 * Validate UUID
 */
const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

/**
 * Validate Positive Integer
 */
const positiveIntSchema = z.number().int().positive();

/**
 * File Name Schema - safe file names only
 */
const fileNameSchema = z
  .string()
  .max(255, 'File name must not exceed 255 characters')
  .regex(
    /^[a-zA-Z0-9_\-\.]+$/,
    'File name can only contain letters, numbers, underscore, hyphen, and dot'
  )
  .refine(
    (name) => !name.includes('..'),
    { message: 'File name cannot contain ..' }
  );

module.exports = {
  idSchema,
  codeSchema,
  multiLangNameSchema,
  multiLangDescriptionSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema,
  statusSchema,
  booleanQuerySchema,
  emailSchema,
  urlSchema,
  jsonStringSchema,
  uuidSchema,
  positiveIntSchema,
  fileNameSchema,
  sanitizeInput,
};
