-- ============================================================================
-- Performance Optimization: Add Indexes
-- ============================================================================
-- This script adds indexes to improve query performance across the database.
-- Run this after the main migration script.
--
-- Usage:
--   psql -U app_user -d nextjs_enterprise_app -f add_performance_indexes.sql
--
-- Or via Node.js:
--   node -e "const db=require('./config/database'); db.query(require('fs').readFileSync('sql/add_performance_indexes.sql','utf8'))"
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. LOGS Table Indexes
-- ============================================================================
-- logs table is heavily queried for analytics and reporting
-- Current state: Only has PRIMARY KEY on id

COMMENT ON TABLE logs IS 'System activity logs - high read volume';

-- Index for timestamp-based queries (most common)
-- Used for: date range filters, recent logs, time-based analytics
CREATE INDEX IF NOT EXISTS idx_logs_timestamp
ON logs (timestamp DESC);

COMMENT ON INDEX idx_logs_timestamp IS 'Optimize time-range queries and recent log retrieval';

-- Index for user activity tracking
-- Used for: user-specific logs, user activity reports
CREATE INDEX IF NOT EXISTS idx_logs_user_id
ON logs (user_id)
WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_logs_user_id IS 'Optimize user activity queries (partial index excludes nulls)';

-- Index for program-specific logs
-- Used for: program usage analytics, feature tracking
CREATE INDEX IF NOT EXISTS idx_logs_program_id
ON logs (program_id)
WHERE program_id IS NOT NULL;

COMMENT ON INDEX idx_logs_program_id IS 'Optimize program usage analytics (partial index)';

-- Index for status code filtering
-- Used for: error monitoring, success rate analytics
CREATE INDEX IF NOT EXISTS idx_logs_status_code
ON logs (status_code);

COMMENT ON INDEX idx_logs_status_code IS 'Optimize error monitoring and status-based queries';

-- Composite index for user activity over time
-- Used for: user timeline, user-specific date range queries
CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp
ON logs (user_id, timestamp DESC)
WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_logs_user_timestamp IS 'Optimize user activity timeline queries';

-- Composite index for program analytics over time
-- Used for: program usage trends, feature adoption tracking
CREATE INDEX IF NOT EXISTS idx_logs_program_timestamp
ON logs (program_id, timestamp DESC)
WHERE program_id IS NOT NULL;

COMMENT ON INDEX idx_logs_program_timestamp IS 'Optimize program usage trend analysis';

-- Index for error analysis
-- Used for: error rate monitoring, failed request tracking
CREATE INDEX IF NOT EXISTS idx_logs_errors
ON logs (timestamp DESC)
WHERE status_code >= 400;

COMMENT ON INDEX idx_logs_errors IS 'Optimize error log retrieval (partial index for errors only)';

-- Index for HTTP method analysis
-- Used for: method-based filtering, API usage patterns
CREATE INDEX IF NOT EXISTS idx_logs_method
ON logs (method);

COMMENT ON INDEX idx_logs_method IS 'Optimize queries filtering by HTTP method';

-- ============================================================================
-- 2. USERS Table Indexes
-- ============================================================================
-- users table is frequently queried for authentication and search

-- Index for login authentication
-- Used for: login process, username lookups
CREATE INDEX IF NOT EXISTS idx_users_loginid
ON users (loginid);

COMMENT ON INDEX idx_users_loginid IS 'Optimize login and username lookup queries';

-- Index for email lookups
-- Used for: email-based auth, duplicate email checks
CREATE INDEX IF NOT EXISTS idx_users_email
ON users (email);

COMMENT ON INDEX idx_users_email IS 'Optimize email-based queries and duplicate checks';

-- Index for employee number searches
-- Used for: employee lookups, HR integrations
CREATE INDEX IF NOT EXISTS idx_users_employee_number
ON users (employee_number)
WHERE employee_number IS NOT NULL;

COMMENT ON INDEX idx_users_employee_number IS 'Optimize employee number searches';

-- Index for status filtering
-- Used for: active user queries, user list filtering
CREATE INDEX IF NOT EXISTS idx_users_status
ON users (status);

COMMENT ON INDEX idx_users_status IS 'Optimize user status filtering (active/inactive/locked)';

-- Index for department-based queries
-- Used for: department user lists, organizational queries
CREATE INDEX IF NOT EXISTS idx_users_department
ON users (department)
WHERE department IS NOT NULL;

COMMENT ON INDEX idx_users_department IS 'Optimize department-based user queries';

-- Text search index for user search functionality
-- Used for: search bars, autocomplete, user discovery
-- Searches across: loginid, email, names, employee_number
CREATE INDEX IF NOT EXISTS idx_users_search_gin
ON users USING gin(
  to_tsvector('simple',
    COALESCE(loginid, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(name_ko, '') || ' ' ||
    COALESCE(name_en, '') || ' ' ||
    COALESCE(employee_number, '')
  )
);

COMMENT ON INDEX idx_users_search_gin IS 'Full-text search index for user discovery (GIN index)';

-- Index for created_at sorting
-- Used for: newest users first, user registration tracking
CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users (created_at DESC);

COMMENT ON INDEX idx_users_created_at IS 'Optimize sorting by registration date';

-- ============================================================================
-- 3. USER_ROLE_MAPPINGS Table Indexes
-- ============================================================================
-- Frequently joined for authorization checks

-- Index for user-to-roles lookups
-- Used for: authorization, user permission checks
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_user_id
ON user_role_mappings (user_id);

COMMENT ON INDEX idx_user_role_mappings_user_id IS 'Optimize user authorization queries';

-- Index for role-to-users lookups
-- Used for: role member lists, role management
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_role_id
ON user_role_mappings (role_id);

COMMENT ON INDEX idx_user_role_mappings_role_id IS 'Optimize role member queries';

-- Composite index for efficient joins
-- Used for: checking if user has specific role
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_composite
ON user_role_mappings (user_id, role_id);

COMMENT ON INDEX idx_user_role_mappings_composite IS 'Optimize user-role existence checks';

-- ============================================================================
-- 4. ROLE_MENU_MAPPINGS Table Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_role_id
ON role_menu_mappings (role_id);

COMMENT ON INDEX idx_role_menu_mappings_role_id IS 'Optimize menu access queries by role';

CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_menu_id
ON role_menu_mappings (menu_id);

COMMENT ON INDEX idx_role_menu_mappings_menu_id IS 'Optimize role queries by menu';

-- ============================================================================
-- 5. ROLE_PROGRAM_MAPPINGS Table Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_role_program_mappings_role_id
ON role_program_mappings (role_id);

COMMENT ON INDEX idx_role_program_mappings_role_id IS 'Optimize program permission queries by role';

CREATE INDEX IF NOT EXISTS idx_role_program_mappings_program_id
ON role_program_mappings (program_id);

COMMENT ON INDEX idx_role_program_mappings_program_id IS 'Optimize role queries by program';

-- ============================================================================
-- 6. MENUS Table Indexes
-- ============================================================================

-- Index for parent-child relationships
-- Used for: building menu trees, hierarchical queries
CREATE INDEX IF NOT EXISTS idx_menus_parent_id
ON menus (parent_id)
WHERE parent_id IS NOT NULL;

COMMENT ON INDEX idx_menus_parent_id IS 'Optimize menu tree queries';

-- Index for menu ordering
-- Used for: displaying menus in correct order
CREATE INDEX IF NOT EXISTS idx_menus_order
ON menus ("order");

COMMENT ON INDEX idx_menus_order IS 'Optimize menu ordering queries';

-- Index for path-based lookups
-- Used for: route-to-menu matching
CREATE INDEX IF NOT EXISTS idx_menus_path
ON menus (path)
WHERE path IS NOT NULL;

COMMENT ON INDEX idx_menus_path IS 'Optimize route-based menu lookups';

-- Index for code-based lookups
-- Used for: menu identification by code
CREATE INDEX IF NOT EXISTS idx_menus_code
ON menus (code);

COMMENT ON INDEX idx_menus_code IS 'Optimize menu code lookups';

-- ============================================================================
-- 7. PROGRAMS Table Indexes
-- ============================================================================

-- Index for code-based lookups
-- Used for: program identification, URL routing
CREATE INDEX IF NOT EXISTS idx_programs_code
ON programs (code);

COMMENT ON INDEX idx_programs_code IS 'Optimize program code lookups';

-- ============================================================================
-- 8. DEPARTMENTS Table Indexes
-- ============================================================================

-- Index for parent-child relationships
-- Used for: department tree, organizational hierarchy
CREATE INDEX IF NOT EXISTS idx_departments_parent_id
ON departments (parent_id)
WHERE parent_id IS NOT NULL;

COMMENT ON INDEX idx_departments_parent_id IS 'Optimize department hierarchy queries';

-- Index for code-based lookups
-- Used for: department identification
CREATE INDEX IF NOT EXISTS idx_departments_code
ON departments (code);

COMMENT ON INDEX idx_departments_code IS 'Optimize department code lookups';

-- Index for level-based queries
-- Used for: finding departments at specific hierarchy level
CREATE INDEX IF NOT EXISTS idx_departments_level
ON departments (level);

COMMENT ON INDEX idx_departments_level IS 'Optimize department level queries';

-- ============================================================================
-- 9. TOKEN_BLACKLIST Table Indexes
-- ============================================================================

-- Index for token lookup (most critical)
-- Used for: every authenticated request
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token
ON token_blacklist (token);

COMMENT ON INDEX idx_token_blacklist_token IS 'Critical: Optimize token blacklist checks';

-- Index for cleanup operations
-- Used for: periodic cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
ON token_blacklist (expires_at);

COMMENT ON INDEX idx_token_blacklist_expires_at IS 'Optimize expired token cleanup';

-- Index for user-specific token management
-- Used for: logout all devices, user session management
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id
ON token_blacklist (user_id)
WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_token_blacklist_user_id IS 'Optimize user session management';

-- ============================================================================
-- 10. MFA_CODES Table Indexes
-- ============================================================================

-- Index for MFA verification
-- Used for: MFA code lookup during authentication
CREATE INDEX IF NOT EXISTS idx_mfa_codes_user_id
ON mfa_codes (user_id, created_at DESC);

COMMENT ON INDEX idx_mfa_codes_user_id IS 'Optimize MFA code verification';

-- Index for cleanup
-- Used for: removing expired MFA codes
CREATE INDEX IF NOT EXISTS idx_mfa_codes_created_at
ON mfa_codes (created_at);

COMMENT ON INDEX idx_mfa_codes_created_at IS 'Optimize MFA code cleanup';

-- ============================================================================
-- 11. CODES Table Indexes
-- ============================================================================

-- Index for type-based filtering
-- Used for: retrieving codes by type
CREATE INDEX IF NOT EXISTS idx_codes_type_code
ON codes (type_code);

COMMENT ON INDEX idx_codes_type_code IS 'Optimize code type filtering';

-- Index for code lookup
-- Used for: code validation, dropdown population
CREATE INDEX IF NOT EXISTS idx_codes_code
ON codes (code);

COMMENT ON INDEX idx_codes_code IS 'Optimize code lookups';

-- ============================================================================
-- 12. ROLES Table Indexes
-- ============================================================================

-- Index for role name lookups
-- Used for: role search, duplicate name checks
CREATE INDEX IF NOT EXISTS idx_roles_name_en
ON roles (name_en);

COMMENT ON INDEX idx_roles_name_en IS 'Optimize role name searches';

-- ============================================================================
-- Verify Index Creation
-- ============================================================================

-- Check created indexes
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

  RAISE NOTICE 'Total custom indexes created: %', index_count;
END $$;

COMMIT;

-- ============================================================================
-- Index Usage Statistics Query
-- ============================================================================
-- Run this query after the application has been running to see index usage:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched,
--   pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY idx_scan DESC;
--
-- ============================================================================

-- ============================================================================
-- Performance Impact Notes
-- ============================================================================
-- POSITIVE:
-- - Faster SELECT queries (10x-1000x improvement for indexed columns)
-- - Reduced I/O operations
-- - Lower CPU usage for searches
-- - Better concurrency
--
-- NEGATIVE:
-- - Slower INSERT/UPDATE/DELETE (5-10% overhead per index)
-- - Additional storage (typically 50-100% of table size)
-- - Index maintenance overhead
--
-- RECOMMENDATION:
-- - Monitor index usage after deployment
-- - Drop unused indexes after 1 month
-- - Rebuild indexes monthly: REINDEX INDEX CONCURRENTLY idx_name;
-- - Update statistics weekly: ANALYZE table_name;
-- ============================================================================

VACUUM ANALYZE logs;
VACUUM ANALYZE users;
VACUUM ANALYZE user_role_mappings;
VACUUM ANALYZE role_menu_mappings;
VACUUM ANALYZE role_program_mappings;

-- End of script
