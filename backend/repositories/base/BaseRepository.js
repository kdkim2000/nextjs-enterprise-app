/**
 * Base Repository
 *
 * 모든 Repository의 부모 클래스
 * 공통 CRUD 메서드를 제공하여 코드 중복을 최소화
 *
 * @example
 * class UserRepository extends BaseRepository {
 *   constructor() {
 *     super('users');
 *   }
 * }
 */

const db = require('../../config/database');

class BaseRepository {
  /**
   * @param {string} tableName - 데이터베이스 테이블 이름
   */
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * ID로 단일 레코드 조회
   * @param {string} id - 레코드 ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * 조건으로 단일 레코드 조회
   * @param {Object} conditions - 검색 조건 (key-value)
   * @returns {Promise<Object|null>}
   */
  async findOne(conditions) {
    const { query, params } = this.buildWhereClause(conditions);
    const sql = `SELECT * FROM ${this.tableName} ${query} LIMIT 1`;
    const result = await db.query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * 모든 레코드 조회
   * @param {Object} options - 쿼리 옵션
   * @param {number} options.limit - 최대 레코드 수
   * @param {number} options.offset - 건너뛸 레코드 수
   * @param {string} options.orderBy - 정렬 필드
   * @param {string} options.order - 정렬 방향 (ASC/DESC)
   * @returns {Promise<Array>}
   */
  async findAll(options = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];
    let paramIndex = 1;

    // WHERE 조건
    if (options.where) {
      const whereClause = this.buildWhereClause(options.where);
      query += ` ${whereClause.query}`;
      params.push(...whereClause.params);
      paramIndex += whereClause.params.length;
    }

    // ORDER BY
    if (options.orderBy) {
      const order = options.order || 'ASC';
      query += ` ORDER BY ${options.orderBy} ${order}`;
    }

    // LIMIT
    if (options.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
      paramIndex++;
    }

    // OFFSET
    if (options.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(options.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * 레코드 생성
   * @param {Object} data - 생성할 데이터
   * @returns {Promise<Object>}
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * 여러 레코드 일괄 생성
   * @param {Array<Object>} dataArray - 생성할 데이터 배열
   * @returns {Promise<Array>}
   */
  async createMany(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }

    const keys = Object.keys(dataArray[0]);
    const valueGroups = [];
    const params = [];
    let paramIndex = 1;

    dataArray.forEach(data => {
      const placeholders = keys.map(() => `$${paramIndex++}`).join(', ');
      valueGroups.push(`(${placeholders})`);
      params.push(...keys.map(key => data[key]));
    });

    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES ${valueGroups.join(', ')}
      RETURNING *
    `;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * 레코드 업데이트
   * @param {string} id - 레코드 ID
   * @param {Object} data - 업데이트할 데이터
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id, ...values]);
    return result.rows[0];
  }

  /**
   * 조건으로 여러 레코드 업데이트
   * @param {Object} conditions - WHERE 조건
   * @param {Object} data - 업데이트할 데이터
   * @returns {Promise<Array>}
   */
  async updateMany(conditions, data) {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);

    let paramIndex = 1;
    const setClause = dataKeys.map(key => `${key} = $${paramIndex++}`).join(', ');

    const whereClause = this.buildWhereClause(conditions, paramIndex);

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      ${whereClause.query}
      RETURNING *
    `;

    const result = await db.query(query, [...dataValues, ...whereClause.params]);
    return result.rows;
  }

  /**
   * 레코드 삭제
   * @param {string} id - 레코드 ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await db.query(query, [id]);
  }

  /**
   * 조건으로 여러 레코드 삭제
   * @param {Object} conditions - WHERE 조건
   * @returns {Promise<number>} 삭제된 레코드 수
   */
  async deleteMany(conditions) {
    const { query, params } = this.buildWhereClause(conditions);
    const sql = `DELETE FROM ${this.tableName} ${query}`;
    const result = await db.query(sql, params);
    return result.rowCount;
  }

  /**
   * 레코드 수 조회
   * @param {Object} conditions - WHERE 조건
   * @returns {Promise<number>}
   */
  async count(conditions = {}) {
    const { query, params } = this.buildWhereClause(conditions);
    const sql = `SELECT COUNT(*) FROM ${this.tableName} ${query}`;
    const result = await db.query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * 레코드 존재 여부 확인
   * @param {Object} conditions - WHERE 조건
   * @returns {Promise<boolean>}
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * WHERE 절 생성 헬퍼
   * @private
   * @param {Object} conditions - 조건 객체
   * @param {number} startIndex - 파라미터 시작 인덱스
   * @returns {Object} { query, params }
   */
  buildWhereClause(conditions, startIndex = 1) {
    const keys = Object.keys(conditions);

    if (keys.length === 0) {
      return { query: '', params: [] };
    }

    const whereClauses = keys.map((key, i) => `${key} = $${startIndex + i}`);
    const params = keys.map(key => conditions[key]);

    return {
      query: `WHERE ${whereClauses.join(' AND ')}`,
      params
    };
  }

  /**
   * 트랜잭션 실행 헬퍼
   * @param {Function} callback - 트랜잭션 콜백
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    return await db.transaction(callback);
  }

  /**
   * Raw SQL 실행 (복잡한 쿼리용)
   * @param {string} sql - SQL 쿼리
   * @param {Array} params - 파라미터
   * @returns {Promise<Array>}
   */
  async raw(sql, params = []) {
    const result = await db.query(sql, params);
    return result.rows;
  }
}

module.exports = BaseRepository;
