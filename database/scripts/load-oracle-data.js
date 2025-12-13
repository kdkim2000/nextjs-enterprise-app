const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

const config = {
  user: process.env.DB_USER || 'corenext',
  password: process.env.DB_PASSWORD || 'CoreNext2025#',
  connectString: process.env.DB_CONNECT_STRING || '123.37.36.45:3200/XEPDB1'
};

// Data files configuration
const DATA_FILES = {
  master: { file: 'master-data.sql', desc: 'Master Data (필수)' },
  content: { file: 'content-data.sql', desc: 'Content Data (게시글, 댓글 등)' },
  comm: { file: 'comm-data.sql', desc: 'Communication Data (메일, 메시지 등)' }
};

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
      currentTable = copyMatch[1].toUpperCase();
      columns = copyMatch[2].split(',').map(c => {
        let col = c.trim().replace(/"/g, '').toUpperCase();
        // Handle Oracle reserved words - wrap with double quotes
        // Schema uses "order", "type", "level", "position" with quotes
        if (col === 'ORDER') col = '"order"';
        if (col === 'TYPE') col = '"type"';
        if (col === 'LEVEL') col = '"level"';
        if (col === 'POSITION') col = '"position"';
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
        // Escape single quotes
        return v.replace(/'/g, "''");
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
    'CREATED_AT', 'UPDATED_AT', 'DELETED_AT', 'LAST_LOGIN', 'EXPIRES_AT',
    'STARTED_AT', 'ENDED_AT', 'VIEWED_AT', 'SENT_AT', 'READ_AT', 'ARCHIVED_AT',
    'PINNED_UNTIL', 'PUBLISHED_AT', 'RESOLVED_AT', 'ACCEPTED_AT', 'ASSIGNED_AT',
    'LAST_PASSWORD_CHANGED', 'DISPLAY_START_DATE', 'DISPLAY_END_DATE',
    'USED_AT', 'BLACKLISTED_AT'
  ];
  const colUpper = col.replace(/"/g, '').toUpperCase();
  return tsColumns.includes(colUpper) || colUpper.endsWith('_AT');
}

async function loadData(conn, tables) {
  let totalInserted = 0;

  for (const { table, columns, rows } of tables) {
    if (rows.length === 0) continue;

    console.log(`\n${table}: ${rows.length}건 입력 중...`);

    const batchSize = 100;
    let inserted = 0;

    // Build SQL with bind variables
    const cols = columns.join(', ');
    const bindPlaceholders = columns.map((col, idx) => {
      if (isTimestampColumn(col)) {
        return `TO_TIMESTAMP_TZ(:${idx + 1}, 'YYYY-MM-DD HH24:MI:SS.FF6TZH:TZM')`;
      }
      return `:${idx + 1}`;
    }).join(', ');

    const sql = `INSERT INTO ${table} (${cols}) VALUES (${bindPlaceholders})`;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      for (const values of batch) {
        // Convert values for bind variables
        const bindValues = values.map((v, idx) => {
          if (v === null) return null;

          const col = columns[idx];

          // Boolean columns (NUMBER(1))
          if (v === 't' || v === 'true') return 1;
          if (v === 'f' || v === 'false') return 0;

          // Timestamp columns - return as string for TO_TIMESTAMP_TZ
          if (isTimestampColumn(col)) {
            return v;
          }

          // Return string value (works for CLOB too)
          return v;
        });

        try {
          await conn.execute(sql, bindValues);
          inserted++;
        } catch (err) {
          if (!err.message.includes('ORA-00001')) { // Ignore duplicate key
            console.error(`  Error: ${err.message.split('\n')[0]}`);
          }
        }
      }

      process.stdout.write(`\r  ${inserted}/${rows.length} 완료`);
    }

    await conn.commit();
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
Oracle 데이터 로드 스크립트

사용법: node load-oracle-data.js [옵션]

옵션:
  --master    Master Data 로드 (기본값)
  --content   Content Data 로드 (게시글, 댓글, 첨부파일)
  --comm      Communication Data 로드 (메일, 메시지)
  --all       모든 데이터 로드
  --help      도움말 표시

환경변수:
  DB_USER           Oracle 사용자 (기본: corenext)
  DB_PASSWORD       Oracle 비밀번호 (기본: CoreNext2025#)
  DB_CONNECT_STRING 연결 문자열 (기본: 123.37.36.45:3200/XEPDB1)

예제:
  node load-oracle-data.js --master
  node load-oracle-data.js --all
  DB_CONNECT_STRING=localhost:1521/XEPDB1 node load-oracle-data.js --master --content
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
    console.log('Oracle 데이터 로드 스크립트');
    console.log(`연결: ${config.connectString}`);
    console.log(`사용자: ${config.user}`);
    console.log(`로드할 데이터: ${filesToLoad.join(', ')}`);

    conn = await oracledb.getConnection(config);
    console.log('\nOracle 연결됨');

    let totalInserted = 0;

    for (const key of filesToLoad) {
      const inserted = await loadDataFile(conn, key);
      totalInserted += inserted;
    }

    // Verify
    console.log(`\n${'='.repeat(50)}`);
    console.log('=== 검증 ===');
    console.log(`${'='.repeat(50)}`);

    const tables = ['USERS', 'DEPARTMENTS', 'ROLES', 'POSTS', 'COMMENTS', 'MAIL_MESSAGES'];
    for (const table of tables) {
      try {
        const result = await conn.execute(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: ${result.rows[0][0]}건`);
      } catch (e) {
        // Table may not exist or be empty
      }
    }

    console.log(`\n총 ${totalInserted}건 입력 완료`);

  } catch (err) {
    console.error('오류:', err);
  } finally {
    if (conn) await conn.close();
  }
}

main();
