#!/usr/bin/env node
/**
 * 실패한 테이블 재마이그레이션 스크립트
 * 수정사항:
 * 1. text[] 배열 컬럼 → PostgreSQL ARRAY[...] 리터럴로 변환
 * 2. tsvector 컬럼 제외 (트리거가 재생성)
 * 3. inspection_results.photo_urls → NULL (로컬 파일 경로라 이식 불가, 용량 초과)
 * 4. 오류 메시지 전체 출력 (1000자)
 */
const { Client } = require('pg');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC = { host: process.env.SRC_DB_HOST || 'localhost', port: parseInt(process.env.SRC_DB_PORT || '5050'), database: process.env.SRC_DB_NAME || 'corenextdb', user: process.env.SRC_DB_USER || 'corenext', password: process.env.SRC_DB_PASSWORD || '' };
const BATCH_SIZE = 100; // 소규모 테이블이라 100으로 충분
const TMP_DIR = path.join(__dirname, 'supabase-import-tmp');
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

// 실패한 테이블만 (FK 순서 유지)
const FAILED_TABLES = [
  'posts',                // tsvector 버그 + 대용량 content (413) + jsonb array 버그
];

// 테이블별 배치 크기 오버라이드
const TABLE_BATCH_SIZES = {
  'posts': 1,  // 대용량 HTML content, 413 방지
};

// tsvector 컬럼 제외 (BEFORE INSERT 트리거가 재생성)
const SKIP_COLUMN_TYPES = new Set(['tsvector']);

// 특정 컬럼을 NULL로 대체 (이식 불가능한 대용량 데이터)
const NULLIFY_COLS = {
  'inspection_results': new Set(['photo_urls']),
};

// udtName: PostgreSQL udt_name (e.g. 'jsonb', '_text', 'text', 'int4', ...)
function escapeVal(val, udtName) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Buffer.isBuffer(val)) return `E'\\\\x${val.toString('hex')}'`;
  if (Array.isArray(val)) {
    // jsonb 컬럼: JS 배열을 JSON 문자열로 → '["a","b"]'
    if (udtName === 'jsonb') {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    // text[] 등 PostgreSQL 배열 컬럼: ARRAY['a', 'b']
    if (val.length === 0) return "ARRAY[]::text[]";
    const items = val.map(v => {
      if (v === null) return 'NULL';
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `ARRAY[${items.join(', ')}]`;
  }
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

// colDefs: [{name, udtName}, ...]
function rowsToInsert(table, colDefs, rows) {
  if (rows.length === 0) return '';
  const nullifyCols = NULLIFY_COLS[table] || new Set();
  const colList = colDefs.map(c => `"${c.name}"`).join(', ');
  const values = rows.map(row =>
    `(${colDefs.map(c => nullifyCols.has(c.name) ? 'NULL' : escapeVal(row[c.name], c.udtName)).join(', ')})`
  ).join(',\n');
  return `INSERT INTO public."${table}" (${colList}) VALUES\n${values}\nON CONFLICT DO NOTHING;\n`;
}

const PROJECT_DIR = path.resolve(__dirname, '..');

async function importFile(filePath) {
  const result = spawnSync(
    'npx', ['supabase', 'db', 'query', '--linked', '--file', filePath],
    {
      shell: true,
      cwd: PROJECT_DIR,
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN },
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120000
    }
  );
  if (result.error) throw new Error(`spawn error: ${result.error.message}`);
  if (result.status !== 0) {
    const err = (result.stderr || '') + (result.stdout || '');
    if (err.includes('duplicate key') || err.includes('already exists') || err.includes('ON CONFLICT')) {
      return true;
    }
    throw new Error(err.substring(0, 1000) || `exit code ${result.status}`);
  }
  return true;
}

async function migrateTable(client, table) {
  const countRes = await client.query(`SELECT COUNT(*) FROM public."${table}"`);
  const total = parseInt(countRes.rows[0].count);
  if (total === 0) {
    console.log(`  ✓ ${table}: 0행 (건너뜀)`);
    return;
  }

  // 컬럼 타입 포함 조회 (tsvector 등 제외)
  const colRes = await client.query(
    `SELECT column_name, udt_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
    [table]
  );
  const colDefs = colRes.rows
    .filter(r => !SKIP_COLUMN_TYPES.has(r.udt_name))
    .map(r => ({ name: r.column_name, udtName: r.udt_name }));

  const skipped = colRes.rows.filter(r => SKIP_COLUMN_TYPES.has(r.udt_name)).map(r => r.column_name);
  const nullified = [...(NULLIFY_COLS[table] || [])];
  if (skipped.length) console.log(`    [제외 컬럼: ${skipped.join(', ')} (tsvector)]`);
  if (nullified.length) console.log(`    [NULL 처리 컬럼: ${nullified.join(', ')} (대용량/이식불가)]`);

  const batchSize = TABLE_BATCH_SIZES[table] || BATCH_SIZE;
  const selectCols = colDefs.map(c => `"${c.name}"`).join(', ');
  const batches = Math.ceil(total / batchSize);
  console.log(`  → ${table}: ${total}행, ${batches}배치 (배치크기=${batchSize})`);

  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const rows = await client.query(
      `SELECT ${selectCols} FROM public."${table}" ORDER BY 1 LIMIT $1 OFFSET $2`,
      [batchSize, offset]
    );
    const sql = rowsToInsert(table, colDefs, rows.rows);

    const tmpFile = path.join(TMP_DIR, `${table}_batch${i}.sql`);
    fs.writeFileSync(tmpFile, sql, 'utf8');

    try {
      await importFile(tmpFile);
      process.stdout.write(`    배치 ${i+1}/${batches} ✓\r`);
    } catch (e) {
      console.error(`\n    ✗ 배치 ${i+1} 실패: ${e.message}`);
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }
  console.log(`  ✅ ${table}: ${total}행 완료`);
}

async function main() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

  const client = new Client(SRC);
  await client.connect();
  console.log('✅ 로컬 DB 연결 성공\n');

  console.log(`실패 테이블 재임포트: ${FAILED_TABLES.length}개\n`);

  for (const table of FAILED_TABLES) {
    try {
      await migrateTable(client, table);
    } catch (e) {
      console.error(`  ✗ ${table} 실패: ${e.message || JSON.stringify(e)}`);
    }
  }

  await client.end();
  console.log('\n✅ 재마이그레이션 완료');
}

main().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
