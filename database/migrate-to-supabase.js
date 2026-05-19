#!/usr/bin/env node
/**
 * Supabase 데이터 마이그레이션 스크립트
 * - 로컬 PostgreSQL에서 테이블별로 INSERT SQL 생성
 * - supabase db query --linked로 Supabase에 임포트
 * - 대용량 테이블은 1000행씩 배치 처리
 */
const { Client } = require('pg');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC = { host: process.env.SRC_DB_HOST || 'localhost', port: parseInt(process.env.SRC_DB_PORT || '5050'), database: process.env.SRC_DB_NAME || 'corenextdb', user: process.env.SRC_DB_USER || 'corenext', password: process.env.SRC_DB_PASSWORD || '' };
const BATCH_SIZE = 1000;
const TMP_DIR = path.join(__dirname, 'supabase-import-tmp');
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

// FK 의존성을 고려한 테이블 임포트 순서
const TABLE_ORDER = [
  'code_types', 'codes',
  'departments',
  'roles', 'permissions', 'programs',
  'users',
  'menus',
  'user_role_mappings', 'role_program_mappings',
  'attachment_types',
  'board_types',
  'posts', 'comments', 'post_likes', 'post_views', 'answer_helpful',
  'attachments', 'attachment_files',
  'mail_messages', 'mail_recipients', 'mail_user_messages',
  'conversations', 'conversation_messages', 'conversation_tags', 'conversation_tag_mappings', 'conversation_code_changes',
  'messages',
  'help',
  'checksheet_templates', 'checksheet_items',
  'inspections', 'inspection_results', 'sync_queue',
  'app_settings', 'user_preferences',
  'logs', 'token_blacklist', 'mfa_codes'
];

function escapeVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function rowsToInsert(table, cols, rows) {
  if (rows.length === 0) return '';
  const colList = cols.map(c => `"${c}"`).join(', ');
  const values = rows.map(row =>
    `(${cols.map(c => escapeVal(row[c])).join(', ')})`
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
    throw new Error(err.substring(0, 500) || `exit code ${result.status}`);
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

  const colRes = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
    [table]
  );
  const cols = colRes.rows.map(r => r.column_name);

  const batches = Math.ceil(total / BATCH_SIZE);
  console.log(`  → ${table}: ${total}행, ${batches}배치`);

  for (let i = 0; i < batches; i++) {
    const offset = i * BATCH_SIZE;
    const rows = await client.query(`SELECT * FROM public."${table}" ORDER BY 1 LIMIT $1 OFFSET $2`, [BATCH_SIZE, offset]);
    const sql = rowsToInsert(table, cols, rows.rows);

    const tmpFile = path.join(TMP_DIR, `${table}_batch${i}.sql`);
    fs.writeFileSync(tmpFile, sql, 'utf8');

    try {
      await importFile(tmpFile);
      process.stdout.write(`    배치 ${i+1}/${batches} ✓\r`);
    } catch (e) {
      console.error(`\n    ✗ 배치 ${i+1} 실패: ${e.message}`);
    } finally {
      fs.unlinkSync(tmpFile);
    }
  }
  console.log(`  ✅ ${table}: ${total}행 완료`);
}

async function main() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

  const client = new Client(SRC);
  await client.connect();
  console.log('✅ 로컬 DB 연결 성공\n');

  // 실제 존재하는 테이블만 처리
  const existRes = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`
  );
  const existing = new Set(existRes.rows.map(r => r.table_name));
  const tables = TABLE_ORDER.filter(t => existing.has(t));
  const extra = [...existing].filter(t => !TABLE_ORDER.includes(t));
  if (extra.length) console.log(`⚠ 순서 미지정 테이블 (마지막 처리): ${extra.join(', ')}\n`);

  const allTables = [...tables, ...extra];
  console.log(`총 ${allTables.length}개 테이블 임포트 시작\n`);

  for (const table of allTables) {
    try {
      await migrateTable(client, table);
    } catch (e) {
      console.error(`  ✗ ${table} 실패: ${e.message || JSON.stringify(e)}`);
    }
  }

  await client.end();
  console.log('\n✅ 전체 마이그레이션 완료');
}

main().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
