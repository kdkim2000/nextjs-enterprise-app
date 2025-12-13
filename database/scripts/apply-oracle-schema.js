/* eslint-disable @typescript-eslint/no-require-imports */
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

const config = {
  user: process.env.DB_USER || 'corenext',
  password: process.env.DB_PASSWORD || 'CoreNext2025#',
  connectString: process.env.DB_CONNECT_STRING || '123.37.36.45:3200/XEPDB1'
};

async function main() {
  let conn;
  try {
    conn = await oracledb.getConnection(config);
    console.log('Oracle 연결됨');

    // Read schema file
    const schemaPath = path.join(__dirname, 'original-schema-oracle.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon, handling PL/SQL blocks
    const statements = [];
    let current = '';
    let inPlsql = false;

    for (const line of schema.split('\n')) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('--') || trimmed === '') {
        continue;
      }

      // Check for PL/SQL block start
      if (trimmed.toUpperCase().startsWith('BEGIN') ||
          trimmed.toUpperCase().startsWith('DECLARE')) {
        inPlsql = true;
      }

      current += line + '\n';

      // Check for statement end
      if (inPlsql && trimmed === '/') {
        statements.push(current.replace(/\/\s*$/, ''));
        current = '';
        inPlsql = false;
      } else if (!inPlsql && trimmed.endsWith(';')) {
        statements.push(current.trim().replace(/;$/, ''));
        current = '';
      }
    }

    console.log(`총 ${statements.length}개 문장 실행 예정`);

    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
      if (!stmt.trim()) continue;

      try {
        await conn.execute(stmt);
        success++;

        // Log CREATE statements
        const match = stmt.match(/^(CREATE\s+(?:TABLE|INDEX|UNIQUE INDEX))\s+(\w+)/i);
        if (match) {
          process.stdout.write(`\r${match[1]} ${match[2]} - OK (${success}/${statements.length})`);
        }
      } catch (err) {
        failed++;
        // Only log errors for non-drop statements
        if (!stmt.toUpperCase().includes('DROP')) {
          console.error(`\nError: ${err.message.split('\n')[0]}`);
          console.error(`  SQL: ${stmt.substring(0, 100)}...`);
        }
      }
    }

    await conn.commit();
    console.log(`\n\n완료: 성공 ${success}, 실패 ${failed}`);

    // Verify tables
    const result = await conn.execute('SELECT COUNT(*) FROM user_tables');
    console.log(`생성된 테이블 수: ${result.rows[0][0]}`);

  } catch (err) {
    console.error('오류:', err);
  } finally {
    if (conn) await conn.close();
  }
}

main();
