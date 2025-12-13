/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'corenext',
  password: process.env.DB_PASSWORD || 'CoreNext2025#',
  database: process.env.DB_NAME || 'corenextdb',
  charset: 'utf8mb4'
};

// Data files configuration
const DATA_FILES = {
  master: { file: 'master-data.sql', desc: 'Master Data (필수)' },
  content: { file: 'content-data.sql', desc: 'Content Data (게시글, 댓글 등)' },
  comm: { file: 'comm-data.sql', desc: 'Communication Data (메일, 메시지 등)' }
};

// MySQL reserved words that need backtick escaping
const RESERVED_WORDS = ['ORDER', 'TYPE', 'LEVEL', 'KEY', 'VALUE', 'POSITION', 'RANK', 'STATUS'];

// Parse PostgreSQL COPY data
function parseCopyData(content) {
  const tables = [];
  const lines = content.split('\n');
  let currentTable = null;
  let columns = [];
  let rows = [];
  let inData = false;

  for (const line of lines) {
    // Match COPY statement
    const copyMatch = line.match(/^COPY\s+(?:public\.)?(\w+)\s*\(([^)]+)\)\s*FROM\s+stdin/i);
    if (copyMatch) {
      if (currentTable && rows.length > 0) {
        tables.push({ table: currentTable, columns, rows });
      }
      currentTable = copyMatch[1].toLowerCase();
      columns = copyMatch[2].split(',').map(c => {
        let col = c.trim().replace(/"/g, '').toLowerCase();
        // Escape MySQL reserved words with backticks
        if (RESERVED_WORDS.includes(col.toUpperCase())) {
          col = `\`${col}\``;
        }
        return col;
      });
      rows = [];
      inData = true;
      continue;
    }

    // End of data
    if (line.trim() === '\\.' || line.trim() === '\\.') {
      if (currentTable && rows.length > 0) {
        tables.push({ table: currentTable, columns, rows });
      }
      currentTable = null;
      inData = false;
      continue;
    }

    // Data row
    if (inData && currentTable && line.trim()) {
      const values = line.split('\t').map(v => {
        if (v === '\\N') return null;
        return v;
      });
      if (values.length === columns.length) {
        rows.push(values);
      }
    }
  }

  return tables;
}

// Check if column is a timestamp type
function isTimestampColumn(col) {
  const tsColumns = [
    'created_at', 'updated_at', 'deleted_at', 'last_login', 'expires_at',
    'started_at', 'ended_at', 'viewed_at', 'sent_at', 'read_at', 'archived_at',
    'pinned_until', 'published_at', 'resolved_at', 'accepted_at', 'assigned_at',
    'last_password_changed', 'display_start_date', 'display_end_date',
    'used_at', 'blacklisted_at'
  ];
  const colLower = col.replace(/`/g, '').toLowerCase();
  return tsColumns.includes(colLower) || colLower.endsWith('_at');
}

async function loadData(conn, tables) {
  let totalInserted = 0;

  for (const { table, columns, rows } of tables) {
    if (rows.length === 0) continue;

    console.log(`\n${table}: ${rows.length}건 입력 중...`);

    const batchSize = 100;
    let inserted = 0;

    // Build SQL with placeholders
    const cols = columns.join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      for (const values of batch) {
        // Convert values for MySQL
        const bindValues = values.map((v, idx) => {
          if (v === null) return null;

          const col = columns[idx];

          // Boolean columns (TINYINT(1))
          if (v === 't' || v === 'true') return 1;
          if (v === 'f' || v === 'false') return 0;

          // Timestamp columns - convert PostgreSQL format to MySQL
          if (isTimestampColumn(col)) {
            // PostgreSQL: 2024-01-15 10:30:00.123456+09
            // MySQL: 2024-01-15 10:30:00
            const match = v.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
            if (match) {
              return `${match[1]} ${match[2]}`;
            }
            return v;
          }

          return v;
        });

        try {
          await conn.execute(sql, bindValues);
          inserted++;
        } catch (err) {
          // Ignore duplicate key errors (MySQL error 1062)
          if (!err.message.includes('Duplicate entry')) {
            console.error(`  Error: ${err.message.split('\n')[0]}`);
          }
        }
      }

      process.stdout.write(`\r  ${inserted}/${rows.length} 완료`);
    }

    totalInserted += inserted;
    console.log(`\r  ${inserted}/${rows.length} 완료 ✓`);
  }

  return totalInserted;
}

// Load a single data file
async function loadDataFile(conn, key) {
  const { file, desc } = DATA_FILES[key];
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠ ${file} 파일이 없습니다. 건너뜁니다.`);
    return 0;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`=== ${desc} 로딩 ===`);
  console.log(`${'='.repeat(50)}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const tables = parseCopyData(content);

  if (tables.length === 0) {
    console.log('파싱된 테이블이 없습니다.');
    return 0;
  }

  console.log(`파싱된 테이블: ${tables.map(t => t.table).join(', ')}`);
  const inserted = await loadData(conn, tables);
  console.log(`\n${desc} 완료: ${inserted}건 입력됨`);

  return inserted;
}

// Show usage
function showUsage() {
  console.log(`
MySQL/MariaDB 데이터 로드 스크립트

사용법: node load-mysql-data.js [옵션]

옵션:
  --master    Master Data 로드 (기본값)
  --content   Content Data 로드 (게시글, 댓글, 첨부파일)
  --comm      Communication Data 로드 (메일, 메시지)
  --all       모든 데이터 로드
  --help      도움말 표시

환경변수:
  DB_HOST     MySQL 호스트 (기본: localhost)
  DB_PORT     MySQL 포트 (기본: 3306)
  DB_USER     MySQL 사용자 (기본: corenext)
  DB_PASSWORD MySQL 비밀번호 (기본: CoreNext2025#)
  DB_NAME     데이터베이스 이름 (기본: corenextdb)

예제:
  node load-mysql-data.js --master
  node load-mysql-data.js --all
  DB_HOST=192.168.1.100 node load-mysql-data.js --master --content
`);
}

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  // Determine which files to load
  let filesToLoad = [];

  if (args.includes('--all')) {
    filesToLoad = ['master', 'content', 'comm'];
  } else {
    if (args.includes('--master') || args.length === 0) filesToLoad.push('master');
    if (args.includes('--content')) filesToLoad.push('content');
    if (args.includes('--comm')) filesToLoad.push('comm');
  }

  let conn;
  try {
    console.log('MySQL/MariaDB 데이터 로드 스크립트');
    console.log(`연결: ${config.host}:${config.port}/${config.database}`);
    console.log(`사용자: ${config.user}`);
    console.log(`로드할 데이터: ${filesToLoad.join(', ')}`);

    conn = await mysql.createConnection(config);
    console.log('\nMySQL 연결됨');

    // Disable foreign key checks for faster loading
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    let totalInserted = 0;

    for (const key of filesToLoad) {
      const inserted = await loadDataFile(conn, key);
      totalInserted += inserted;
    }

    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Verify
    console.log(`\n${'='.repeat(50)}`);
    console.log('=== 검증 ===');
    console.log(`${'='.repeat(50)}`);

    const tables = ['users', 'departments', 'roles', 'posts', 'comments', 'mail_messages'];
    for (const table of tables) {
      try {
        const [rows] = await conn.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
        console.log(`${table}: ${rows[0].cnt}건`);
      } catch {
        // Table may not exist or be empty
      }
    }

    console.log(`\n총 ${totalInserted}건 입력 완료`);

  } catch (err) {
    console.error('오류:', err);
  } finally {
    if (conn) await conn.end();
  }
}

main();
