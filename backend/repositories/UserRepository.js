/**
 * User Repository
 *
 * User 테이블에 대한 데이터 접근을 담당
 * SQL 쿼리를 중앙화하여 유지보수성 향상
 *
 * @example
 * const userRepository = require('./repositories/UserRepository');
 *
 * // 사용자 조회
 * const user = await userRepository.findById('user-id');
 *
 * // 사용자 생성
 * const newUser = await userRepository.create({...});
 */

const BaseRepository = require('./base/BaseRepository');
const queries = require('../queries/users');
const db = require('../config/database');
const { buildUserSearchCondition, cleanSearchTerm } = require('../utils/searchHelper');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  // ==================== 조회 메서드 ====================

  /**
   * ID로 사용자 조회 (비밀번호 제외)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object|null>}
   */
  async findById(userId) {
    const result = await db.query(queries.SELECT_BY_ID, [userId]);
    return result.rows[0] || null;
  }

  /**
   * ID로 사용자 조회 (비밀번호 포함 - 인증용)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithPassword(userId) {
    const result = await db.query(queries.SELECT_BY_ID_WITH_PASSWORD, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 로그인 ID로 사용자 조회
   * @param {string} loginId - 로그인 ID
   * @returns {Promise<Object|null>}
   */
  async findByLoginId(loginId) {
    const result = await db.query(queries.SELECT_BY_LOGIN_ID, [loginId]);
    return result.rows[0] || null;
  }

  /**
   * 이메일로 사용자 조회
   * @param {string} email - 이메일
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const result = await db.query(queries.SELECT_BY_EMAIL, [email]);
    return result.rows[0] || null;
  }

  /**
   * 직원번호로 사용자 조회
   * @param {string} employeeNumber - 직원번호
   * @returns {Promise<Object|null>}
   */
  async findByEmployeeNumber(employeeNumber) {
    const result = await db.query(queries.SELECT_BY_EMPLOYEE_NUMBER, [employeeNumber]);
    return result.rows[0] || null;
  }

  /**
   * 사용자와 역할 정보 함께 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRoles(userId) {
    const result = await db.query(queries.SELECT_WITH_ROLES, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 부서별 사용자 목록 조회
   * @param {string} departmentId - 부서 ID
   * @returns {Promise<Array>}
   */
  async findByDepartment(departmentId) {
    const result = await db.query(queries.SELECT_BY_DEPARTMENT, [departmentId]);
    return result.rows;
  }

  /**
   * 검색 조건으로 사용자 목록 조회
   * @param {Object} filters - 검색 필터
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    const { query, params } = this.buildSearchQuery(filters);
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Full-Text Search로 사용자 검색
   * @param {string} searchTerm - 검색어
   * @param {Object} options - 옵션 (limit, offset)
   * @returns {Promise<Array>}
   */
  async search(searchTerm, options = {}) {
    const cleanedTerm = cleanSearchTerm(searchTerm);
    let query = queries.SEARCH_USERS;
    const params = [cleanedTerm];
    let paramIndex = 2;

    if (options.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
      paramIndex++;
    }

    if (options.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(options.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * 최근 로그인한 사용자 목록
   * @param {number} limit - 최대 개수
   * @returns {Promise<Array>}
   */
  async findRecentLogins(limit = 10) {
    const result = await db.query(queries.SELECT_RECENT_LOGINS, [limit]);
    return result.rows;
  }

  // ==================== 생성 메서드 ====================

  /**
   * 사용자 생성
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<Object>}
   */
  async create(userData) {
    const {
      id, loginid, password, name_ko, name_en,
      email, employee_number, phone_number, mobile_number,
      status, department, role, position, user_category,
      mfa_enabled = false
    } = userData;

    const result = await db.query(queries.INSERT_USER, [
      id, loginid, password, name_ko, name_en,
      email, employee_number, phone_number, mobile_number,
      status, department, role, position, user_category,
      mfa_enabled
    ]);

    return result.rows[0];
  }

  /**
   * 간단한 사용자 생성 (필수 필드만)
   * @param {Object} userData - 최소 사용자 데이터
   * @returns {Promise<Object>}
   */
  async createSimple(userData) {
    const { id, loginid, password, name_ko, email, status = 'active' } = userData;
    const result = await db.query(queries.INSERT_USER_SIMPLE, [
      id, loginid, password, name_ko, email, status
    ]);
    return result.rows[0];
  }

  // ==================== 업데이트 메서드 ====================

  /**
   * 사용자 기본 정보 업데이트
   * @param {string} userId - 사용자 ID
   * @param {Object} updates - 업데이트할 데이터
   * @returns {Promise<Object>}
   */
  async update(userId, updates) {
    const {
      name_ko, name_en, email,
      phone_number, mobile_number,
      position, user_category
    } = updates;

    const result = await db.query(queries.UPDATE_USER, [
      userId, name_ko, name_en, email,
      phone_number, mobile_number,
      position, user_category
    ]);

    return result.rows[0];
  }

  /**
   * 비밀번호 업데이트
   * @param {string} userId - 사용자 ID
   * @param {string} hashedPassword - 해시된 비밀번호
   */
  async updatePassword(userId, hashedPassword) {
    await db.query(queries.UPDATE_PASSWORD, [userId, hashedPassword]);
  }

  /**
   * 사용자 상태 업데이트
   * @param {string} userId - 사용자 ID
   * @param {string} status - 상태 (active, inactive, locked)
   */
  async updateStatus(userId, status) {
    await db.query(queries.UPDATE_STATUS, [userId, status]);
  }

  /**
   * 부서 변경
   * @param {string} userId - 사용자 ID
   * @param {string} departmentId - 부서 ID
   */
  async updateDepartment(userId, departmentId) {
    await db.query(queries.UPDATE_DEPARTMENT, [userId, departmentId]);
  }

  /**
   * 마지막 로그인 시간 업데이트
   * @param {string} userId - 사용자 ID
   */
  async updateLastLogin(userId) {
    await db.query(queries.UPDATE_LAST_LOGIN, [userId]);
  }

  /**
   * MFA 설정 업데이트
   * @param {string} userId - 사용자 ID
   * @param {boolean} enabled - MFA 활성화 여부
   * @param {string} secret - MFA 시크릿 (옵션)
   */
  async updateMFA(userId, enabled, secret = null) {
    await db.query(queries.UPDATE_MFA, [userId, enabled, secret]);
  }

  /**
   * 로그인 실패 횟수 증가
   * @param {string} userId - 사용자 ID
   */
  async incrementLoginFailures(userId) {
    await db.query(queries.INCREMENT_LOGIN_FAILURES, [userId]);
  }

  /**
   * 로그인 실패 횟수 리셋
   * @param {string} userId - 사용자 ID
   */
  async resetLoginFailures(userId) {
    await db.query(queries.RESET_LOGIN_FAILURES, [userId]);
  }

  // ==================== 삭제 메서드 ====================

  /**
   * 사용자 삭제 (실제 삭제)
   * @param {string} userId - 사용자 ID
   */
  async delete(userId) {
    await db.query(queries.DELETE_USER, [userId]);
  }

  /**
   * 사용자 비활성화 (Soft Delete)
   * @param {string} userId - 사용자 ID
   */
  async softDelete(userId) {
    await db.query(queries.SOFT_DELETE_USER, [userId]);
  }

  // ==================== 통계/분석 메서드 ====================

  /**
   * 상태별 사용자 수
   * @returns {Promise<Array>}
   */
  async countByStatus() {
    const result = await db.query(queries.COUNT_BY_STATUS);
    return result.rows;
  }

  /**
   * 부서별 사용자 수
   * @returns {Promise<Array>}
   */
  async countByDepartment() {
    const result = await db.query(queries.COUNT_BY_DEPARTMENT);
    return result.rows;
  }

  /**
   * 역할별 사용자 수
   * @returns {Promise<Array>}
   */
  async countByRole() {
    const result = await db.query(queries.COUNT_BY_ROLE);
    return result.rows;
  }

  /**
   * 활성 사용자 수
   * @returns {Promise<number>}
   */
  async countActiveUsers() {
    const result = await db.query(queries.COUNT_ACTIVE_USERS);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * 최근 30일 생성된 사용자 수
   * @returns {Promise<number>}
   */
  async countRecentUsers() {
    const result = await db.query(queries.COUNT_RECENT_USERS);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * MFA 활성화 통계
   * @returns {Promise<Object>}
   */
  async getMFAStats() {
    const result = await db.query(queries.COUNT_MFA_ENABLED);
    return result.rows[0];
  }

  // ==================== 유효성 검사 메서드 ====================

  /**
   * 로그인 ID 중복 체크
   * @param {string} loginId - 로그인 ID
   * @returns {Promise<boolean>}
   */
  async isLoginIdExists(loginId) {
    const result = await db.query(queries.CHECK_LOGINID_EXISTS, [loginId]);
    return result.rows[0].exists;
  }

  /**
   * 이메일 중복 체크
   * @param {string} email - 이메일
   * @returns {Promise<boolean>}
   */
  async isEmailExists(email) {
    const result = await db.query(queries.CHECK_EMAIL_EXISTS, [email]);
    return result.rows[0].exists;
  }

  /**
   * 직원번호 중복 체크
   * @param {string} employeeNumber - 직원번호
   * @returns {Promise<boolean>}
   */
  async isEmployeeNumberExists(employeeNumber) {
    const result = await db.query(queries.CHECK_EMPLOYEE_NUMBER_EXISTS, [employeeNumber]);
    return result.rows[0].exists;
  }

  // ==================== Private 헬퍼 메서드 ====================

  /**
   * 동적 검색 쿼리 빌드
   * @private
   * @param {Object} filters - 검색 필터
   * @returns {Object} { query, params }
   */
  buildSearchQuery(filters) {
    let query = queries.SELECT_ALL;
    const params = [];
    let paramIndex = 1;

    // Full-Text Search
    if (filters.search) {
      const cleanedSearch = cleanSearchTerm(filters.search);
      const { condition, param } = buildUserSearchCondition(cleanedSearch, paramIndex);

      if (condition) {
        query += ` AND ${condition}`;
        params.push(param);
        paramIndex++;
      }
    }

    // 개별 필드 검색
    if (filters.loginid) {
      query += ` AND loginid ILIKE $${paramIndex}`;
      params.push(`%${filters.loginid}%`);
      paramIndex++;
    }

    if (filters.name_ko) {
      query += ` AND name_ko ILIKE $${paramIndex}`;
      params.push(`%${filters.name_ko}%`);
      paramIndex++;
    }

    if (filters.name_en) {
      query += ` AND name_en ILIKE $${paramIndex}`;
      params.push(`%${filters.name_en}%`);
      paramIndex++;
    }

    if (filters.email) {
      query += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.department) {
      query += ` AND department = $${paramIndex}`;
      params.push(filters.department);
      paramIndex++;
    }

    if (filters.departments && Array.isArray(filters.departments)) {
      query += ` AND department = ANY($${paramIndex})`;
      params.push(filters.departments);
      paramIndex++;
    }

    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    // 정렬
    query += ' ORDER BY created_at DESC';

    // 페이지네이션
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    return { query, params };
  }
}

// Singleton 인스턴스 export
module.exports = new UserRepository();
