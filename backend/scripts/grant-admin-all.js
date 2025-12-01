const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nextjs_enterprise_app',
  user: 'app_user',
  password: 'AppUser2024!'
});

async function grantAll() {
  try {
    // admin 역할에 모든 프로그램 권한 부여
    const r1 = await pool.query(`
      INSERT INTO role_program_mappings (id, role_id, program_code, can_view, can_create, can_update, can_delete, created_at)
      SELECT
        'rpm-admin-' || LEFT(md5(p.code), 10),
        'role-001',
        p.code,
        true, true, true, true,
        NOW()
      FROM programs p
      WHERE NOT EXISTS (
        SELECT 1 FROM role_program_mappings rpm
        WHERE rpm.program_code = p.code AND rpm.role_id = 'role-001'
      )
      RETURNING id, program_code
    `);
    console.log('=== 추가된 프로그램 매핑:', r1.rowCount, '개 ===');

    // 결과 확인
    const r2 = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM role_program_mappings WHERE role_id = 'role-001') as program_count,
        (SELECT COUNT(*) FROM programs) as total_programs
    `);
    console.log('\n=== admin 역할 권한 현황 ===');
    console.table(r2.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

grantAll();
