/**
 * User 테이블 관련 SQL 쿼리 정의
 *
 * 모든 User 관련 쿼리를 한 곳에서 관리
 * 쿼리 변경 시 이 파일만 수정하면 됨
 */

module.exports = {
  // ==================== SELECT 쿼리 ====================

  /**
   * 기본 사용자 조회 (비밀번호 제외)
   */
  SELECT_ALL: `
    SELECT id, loginid, name_ko, name_en, email,
           employee_number, phone_number, mobile_number,
           status, department, role, position, user_category,
           created_at, updated_at, last_login_at
    FROM users
    WHERE 1=1
  `,

  /**
   * ID로 사용자 조회 (인증용 - 비밀번호 포함)
   */
  SELECT_BY_ID_WITH_PASSWORD: `
    SELECT * FROM users WHERE id = $1
  `,

  /**
   * ID로 사용자 조회 (일반용 - 비밀번호 제외)
   */
  SELECT_BY_ID: `
    SELECT id, loginid, name_ko, name_en, email,
           employee_number, phone_number, mobile_number,
           status, department, role, position, user_category,
           mfa_enabled, mfa_secret,
           created_at, updated_at, last_login_at
    FROM users
    WHERE id = $1
  `,

  /**
   * 로그인 ID로 사용자 조회 (인증용)
   */
  SELECT_BY_LOGIN_ID: `
    SELECT * FROM users WHERE loginid = $1
  `,

  /**
   * 이메일로 사용자 조회
   */
  SELECT_BY_EMAIL: `
    SELECT * FROM users WHERE email = $1
  `,

  /**
   * 직원번호로 사용자 조회
   */
  SELECT_BY_EMPLOYEE_NUMBER: `
    SELECT * FROM users WHERE employee_number = $1
  `,

  /**
   * 사용자와 역할 정보 함께 조회 (JOIN)
   */
  SELECT_WITH_ROLES: `
    SELECT u.id, u.loginid, u.name_ko, u.name_en, u.email,
           u.employee_number, u.status, u.department,
           array_agg(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) as role_ids,
           array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) as role_names,
           array_agg(DISTINCT r.description) FILTER (WHERE r.description IS NOT NULL) as role_descriptions
    FROM users u
    LEFT JOIN user_role_mapping urm ON u.id = urm.user_id
    LEFT JOIN roles r ON urm.role_id = r.id
    WHERE u.id = $1
    GROUP BY u.id
  `,

  /**
   * 부서별 사용자 조회
   */
  SELECT_BY_DEPARTMENT: `
    SELECT id, loginid, name_ko, name_en, email, employee_number, status
    FROM users
    WHERE department = $1
    ORDER BY name_ko
  `,

  /**
   * Full-Text Search 쿼리
   * loginid, name_ko, name_en, email, employee_number 검색
   */
  SEARCH_USERS: `
    SELECT id, loginid, name_ko, name_en, email,
           employee_number, status, department, role,
           ts_rank(search_vector, plainto_tsquery('simple', $1)) as rank
    FROM users
    WHERE search_vector @@ plainto_tsquery('simple', $1)
    ORDER BY rank DESC, name_ko
  `,

  // ==================== INSERT 쿼리 ====================

  /**
   * 사용자 생성
   */
  INSERT_USER: `
    INSERT INTO users (
      id, loginid, password, name_ko, name_en,
      email, employee_number, phone_number, mobile_number,
      status, department, role, position, user_category,
      mfa_enabled, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, $13, $14,
      $15, NOW(), NOW()
    )
    RETURNING id, loginid, name_ko, name_en, email, status
  `,

  /**
   * 간단한 사용자 생성 (필수 필드만)
   */
  INSERT_USER_SIMPLE: `
    INSERT INTO users (
      id, loginid, password, name_ko, email, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    )
    RETURNING *
  `,

  // ==================== UPDATE 쿼리 ====================

  /**
   * 사용자 기본 정보 업데이트
   */
  UPDATE_USER: `
    UPDATE users
    SET name_ko = $2,
        name_en = $3,
        email = $4,
        phone_number = $5,
        mobile_number = $6,
        position = $7,
        user_category = $8,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, loginid, name_ko, name_en, email
  `,

  /**
   * 비밀번호 업데이트
   */
  UPDATE_PASSWORD: `
    UPDATE users
    SET password = $2,
        updated_at = NOW()
    WHERE id = $1
  `,

  /**
   * 사용자 상태 업데이트
   */
  UPDATE_STATUS: `
    UPDATE users
    SET status = $2,
        updated_at = NOW()
    WHERE id = $1
  `,

  /**
   * 부서 변경
   */
  UPDATE_DEPARTMENT: `
    UPDATE users
    SET department = $2,
        updated_at = NOW()
    WHERE id = $1
  `,

  /**
   * 마지막 로그인 시간 업데이트
   */
  UPDATE_LAST_LOGIN: `
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = $1
  `,

  /**
   * MFA 설정 업데이트
   */
  UPDATE_MFA: `
    UPDATE users
    SET mfa_enabled = $2,
        mfa_secret = $3,
        updated_at = NOW()
    WHERE id = $1
  `,

  /**
   * 로그인 실패 횟수 증가
   */
  INCREMENT_LOGIN_FAILURES: `
    UPDATE users
    SET login_failures = login_failures + 1,
        last_login_attempt = NOW()
    WHERE id = $1
  `,

  /**
   * 로그인 실패 횟수 리셋
   */
  RESET_LOGIN_FAILURES: `
    UPDATE users
    SET login_failures = 0,
        last_login_attempt = NULL
    WHERE id = $1
  `,

  // ==================== DELETE 쿼리 ====================

  /**
   * 사용자 삭제 (실제 삭제)
   */
  DELETE_USER: `
    DELETE FROM users WHERE id = $1
  `,

  /**
   * 사용자 비활성화 (Soft Delete)
   */
  SOFT_DELETE_USER: `
    UPDATE users
    SET status = 'inactive',
        updated_at = NOW()
    WHERE id = $1
  `,

  // ==================== 통계/분석 쿼리 ====================

  /**
   * 상태별 사용자 수
   */
  COUNT_BY_STATUS: `
    SELECT status, COUNT(*) as count
    FROM users
    GROUP BY status
    ORDER BY count DESC
  `,

  /**
   * 부서별 사용자 수
   */
  COUNT_BY_DEPARTMENT: `
    SELECT department, COUNT(*) as count
    FROM users
    WHERE department IS NOT NULL
    GROUP BY department
    ORDER BY count DESC
  `,

  /**
   * 역할별 사용자 수
   */
  COUNT_BY_ROLE: `
    SELECT role, COUNT(*) as count
    FROM users
    WHERE role IS NOT NULL
    GROUP BY role
    ORDER BY count DESC
  `,

  /**
   * 활성 사용자 수
   */
  COUNT_ACTIVE_USERS: `
    SELECT COUNT(*) as count
    FROM users
    WHERE status = 'active'
  `,

  /**
   * 최근 30일 생성된 사용자 수
   */
  COUNT_RECENT_USERS: `
    SELECT COUNT(*) as count
    FROM users
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `,

  /**
   * 최근 로그인한 사용자 목록
   */
  SELECT_RECENT_LOGINS: `
    SELECT id, loginid, name_ko, last_login_at
    FROM users
    WHERE last_login_at IS NOT NULL
    ORDER BY last_login_at DESC
    LIMIT $1
  `,

  /**
   * MFA 활성화 통계
   */
  COUNT_MFA_ENABLED: `
    SELECT
      COUNT(*) FILTER (WHERE mfa_enabled = true) as mfa_enabled_count,
      COUNT(*) FILTER (WHERE mfa_enabled = false) as mfa_disabled_count,
      COUNT(*) as total_count
    FROM users
    WHERE status = 'active'
  `,

  // ==================== 유효성 검사 쿼리 ====================

  /**
   * 로그인 ID 중복 체크
   */
  CHECK_LOGINID_EXISTS: `
    SELECT EXISTS(SELECT 1 FROM users WHERE loginid = $1) as exists
  `,

  /**
   * 이메일 중복 체크
   */
  CHECK_EMAIL_EXISTS: `
    SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
  `,

  /**
   * 직원번호 중복 체크
   */
  CHECK_EMPLOYEE_NUMBER_EXISTS: `
    SELECT EXISTS(SELECT 1 FROM users WHERE employee_number = $1) as exists
  `,
};
