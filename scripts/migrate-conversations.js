/**
 * Claude Code Conversation Migration Script
 *
 * Claude Code 대화 내역을 DB 및 Markdown으로 마이그레이션합니다.
 *
 * 사용법:
 *   node scripts/migrate-conversations.js [options]
 *
 * 옵션:
 *   --db-only      DB에만 저장
 *   --md-only      Markdown으로만 저장
 *   --limit=N      처리할 세션 수 제한
 *   --session=ID   특정 세션만 처리
 *   --force        이미 처리된 세션도 다시 처리
 *   --incremental  새로운 세션만 처리 (기본값)
 *   --status       현재 마이그레이션 상태 출력
 *   --reset        추적 파일 초기화
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Configuration
const CLAUDE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');
const PROJECT_DIR = path.join(CLAUDE_DIR, 'projects', 'E--apps-nextjs-enterprise-app');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'claude-sessions');
const TRACKING_FILE = path.join(__dirname, '..', '.migrated-sessions.json');

// Parse command line arguments
const args = process.argv.slice(2);
const dbOnly = args.includes('--db-only');
const mdOnly = args.includes('--md-only');
const forceMode = args.includes('--force');
const statusMode = args.includes('--status');
const resetMode = args.includes('--reset');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const sessionArg = args.find(a => a.startsWith('--session='));
const sessionId = sessionArg ? sessionArg.split('=')[1] : null;

/**
 * 추적 파일 로드
 */
function loadTrackingData() {
  if (fs.existsSync(TRACKING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Warning: Could not parse tracking file, starting fresh');
    }
  }
  return {
    migratedSessions: [],
    lastMigration: null,
    totalMigrated: 0,
    stats: {
      byCategory: {},
      byDifficulty: {},
      byMonth: {}
    }
  };
}

/**
 * 추적 파일 저장
 */
function saveTrackingData(data) {
  data.lastMigration = new Date().toISOString();
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * 세션이 이미 처리되었는지 확인
 */
function isAlreadyMigrated(trackingData, sessionId) {
  return trackingData.migratedSessions.includes(sessionId);
}

/**
 * 세션을 처리 완료로 표시
 */
function markAsMigrated(trackingData, sessionId, category, difficulty, month) {
  if (!trackingData.migratedSessions.includes(sessionId)) {
    trackingData.migratedSessions.push(sessionId);
    trackingData.totalMigrated++;

    // 통계 업데이트
    trackingData.stats.byCategory[category] = (trackingData.stats.byCategory[category] || 0) + 1;
    trackingData.stats.byDifficulty[difficulty] = (trackingData.stats.byDifficulty[difficulty] || 0) + 1;
    trackingData.stats.byMonth[month] = (trackingData.stats.byMonth[month] || 0) + 1;
  }
}

/**
 * 현재 상태 출력
 */
function showStatus() {
  const data = loadTrackingData();

  console.log('='.repeat(60));
  console.log('Claude Code Migration Status');
  console.log('='.repeat(60));
  console.log(`\n📊 총 마이그레이션된 세션: ${data.totalMigrated}`);
  console.log(`📅 마지막 마이그레이션: ${data.lastMigration || 'Never'}`);

  if (Object.keys(data.stats.byCategory).length > 0) {
    console.log('\n📁 카테고리별:');
    for (const [cat, count] of Object.entries(data.stats.byCategory)) {
      console.log(`   ${cat}: ${count}`);
    }
  }

  if (Object.keys(data.stats.byDifficulty).length > 0) {
    console.log('\n📈 난이도별:');
    for (const [diff, count] of Object.entries(data.stats.byDifficulty)) {
      console.log(`   ${diff}: ${count}`);
    }
  }

  if (Object.keys(data.stats.byMonth).length > 0) {
    console.log('\n📆 월별:');
    for (const [month, count] of Object.entries(data.stats.byMonth).sort()) {
      console.log(`   ${month}: ${count}`);
    }
  }

  // 처리되지 않은 파일 확인
  if (fs.existsSync(PROJECT_DIR)) {
    const allFiles = fs.readdirSync(PROJECT_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));
    const pendingCount = allFiles.length - data.migratedSessions.length;
    console.log(`\n⏳ 대기 중인 세션: ${Math.max(0, pendingCount)}`);
  }

  console.log('='.repeat(60));
}

/**
 * 추적 파일 초기화
 */
function resetTracking() {
  if (fs.existsSync(TRACKING_FILE)) {
    fs.unlinkSync(TRACKING_FILE);
    console.log('✅ Tracking file has been reset');
  } else {
    console.log('ℹ️ No tracking file to reset');
  }
}

/**
 * JSONL 파일을 읽어서 대화 내용을 파싱
 */
async function parseJsonlFile(filePath) {
  const messages = [];
  const metadata = {
    sessionId: null,
    branch: null,
    cwd: null,
    startTime: null,
    endTime: null,
    version: null
  };

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line);

      // 메타데이터 추출
      if (data.sessionId && !metadata.sessionId) {
        metadata.sessionId = data.sessionId;
      }
      if (data.gitBranch) {
        metadata.branch = data.gitBranch;
      }
      if (data.cwd) {
        metadata.cwd = data.cwd;
      }
      if (data.version) {
        metadata.version = data.version;
      }
      if (data.timestamp) {
        const ts = new Date(data.timestamp);
        if (!metadata.startTime || ts < metadata.startTime) {
          metadata.startTime = ts;
        }
        if (!metadata.endTime || ts > metadata.endTime) {
          metadata.endTime = ts;
        }
      }

      // 메시지 추출
      if (data.type === 'user' && data.message) {
        messages.push({
          role: 'user',
          content: data.message.content || '',
          timestamp: data.timestamp,
          uuid: data.uuid
        });
      } else if (data.message && data.message.role === 'assistant') {
        let content = '';
        if (Array.isArray(data.message.content)) {
          // content 배열에서 text 타입만 추출
          content = data.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');
        } else if (typeof data.message.content === 'string') {
          content = data.message.content;
        }

        if (content) {
          messages.push({
            role: 'assistant',
            content: content,
            timestamp: data.timestamp,
            uuid: data.uuid,
            model: data.message.model
          });
        }
      }
    } catch (e) {
      // JSON 파싱 에러 무시
    }
  }

  return { messages, metadata };
}

/**
 * 문자열로 변환 (안전하게)
 */
function ensureString(content) {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  if (Array.isArray(content)) {
    return content
      .filter(c => c && c.type === 'text')
      .map(c => c.text || '')
      .join('\n');
  }
  return String(content);
}

/**
 * 대화 내용에서 제목 생성
 */
function generateTitle(messages) {
  // 첫 번째 사용자 메시지에서 제목 추출
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'Untitled Session';

  const content = ensureString(firstUserMessage.content);
  let title = content.substring(0, 100);
  // 줄바꿈 제거
  title = title.replace(/[\r\n]+/g, ' ').trim();
  // 특수문자 정리
  title = title.replace(/[<>:"/\\|?*]/g, '');

  if (content.length > 100) {
    title += '...';
  }

  return title || 'Untitled Session';
}

/**
 * 카테고리 자동 분류
 */
function categorize(messages) {
  const allContent = messages.map(m => ensureString(m.content).toLowerCase()).join(' ');

  if (allContent.includes('버그') || allContent.includes('bug') || allContent.includes('fix')) {
    return 'bug-fix';
  }
  if (allContent.includes('리팩토') || allContent.includes('refactor')) {
    return 'refactor';
  }
  if (allContent.includes('디버') || allContent.includes('debug') || allContent.includes('오류')) {
    return 'debugging';
  }
  if (allContent.includes('기능') || allContent.includes('feature') || allContent.includes('구현')) {
    return 'feature';
  }
  if (allContent.includes('성능') || allContent.includes('performance') || allContent.includes('최적화')) {
    return 'performance';
  }

  return 'general';
}

/**
 * 난이도 추정
 */
function estimateDifficulty(messages) {
  const totalLength = messages.reduce((sum, m) => sum + ensureString(m.content).length, 0);
  const messageCount = messages.length;

  if (messageCount > 20 || totalLength > 50000) {
    return 'hard';
  }
  if (messageCount > 10 || totalLength > 20000) {
    return 'medium';
  }
  return 'easy';
}

/**
 * Markdown으로 변환
 */
function convertToMarkdown(messages, metadata, title) {
  const category = categorize(messages);
  const difficulty = estimateDifficulty(messages);
  const startDate = metadata.startTime ? metadata.startTime.toISOString().split('T')[0] : 'Unknown';
  const duration = metadata.startTime && metadata.endTime
    ? Math.round((metadata.endTime - metadata.startTime) / 60000)
    : 0;

  let md = `# ${title}\n\n`;
  md += `## 메타데이터\n\n`;
  md += `| 항목 | 값 |\n`;
  md += `|------|---|\n`;
  md += `| **날짜** | ${startDate} |\n`;
  md += `| **프로젝트** | nextjs-enterprise-app |\n`;
  md += `| **브랜치** | ${metadata.branch || 'unknown'} |\n`;
  md += `| **카테고리** | ${category} |\n`;
  md += `| **난이도** | ${difficulty} |\n`;
  md += `| **소요시간** | ${duration}분 |\n`;
  md += `| **메시지 수** | ${messages.length} |\n`;
  md += `| **세션 ID** | ${metadata.sessionId} |\n\n`;

  md += `---\n\n`;
  md += `## 대화 내용\n\n`;

  for (const msg of messages) {
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR') : '';
    const content = ensureString(msg.content);

    if (msg.role === 'user') {
      md += `### 👤 사용자 ${timestamp ? `(${timestamp})` : ''}\n\n`;
      md += `${content}\n\n`;
    } else {
      md += `### 🤖 Claude ${timestamp ? `(${timestamp})` : ''}\n\n`;
      md += `${content}\n\n`;
    }
  }

  return md;
}

/**
 * 파일명 생성
 */
function generateFilename(metadata, title) {
  const date = metadata.startTime
    ? metadata.startTime.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // 제목에서 파일명 안전한 문자만 추출
  let safeName = title.substring(0, 50)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!safeName) {
    safeName = metadata.sessionId ? metadata.sessionId.substring(0, 8) : 'session';
  }

  return `${date}-${safeName}.md`;
}

/**
 * DB용 SQL 생성 (psql에서 실행)
 */
function generateInsertSQL(messages, metadata, title) {
  const id = metadata.sessionId || uuidv4();
  const category = categorize(messages);
  const difficulty = estimateDifficulty(messages);
  const startTime = metadata.startTime ? metadata.startTime.toISOString() : new Date().toISOString();
  const endTime = metadata.endTime ? metadata.endTime.toISOString() : startTime;

  const escapedTitle = title.replace(/'/g, "''");

  let sql = `-- Session: ${id}\n`;
  sql += `INSERT INTO conversations (id, title, project_path, project_name, branch_name, category, difficulty_level, total_messages, status, source, original_session_id, started_at, ended_at, created_at) VALUES (\n`;
  sql += `  '${id}',\n`;
  sql += `  '${escapedTitle}',\n`;
  sql += `  '${(metadata.cwd || '').replace(/'/g, "''")}',\n`;
  sql += `  'nextjs-enterprise-app',\n`;
  sql += `  '${metadata.branch || 'unknown'}',\n`;
  sql += `  '${category}',\n`;
  sql += `  '${difficulty}',\n`;
  sql += `  ${messages.length},\n`;
  sql += `  'active',\n`;
  sql += `  'claude-code',\n`;
  sql += `  '${id}',\n`;
  sql += `  '${startTime}',\n`;
  sql += `  '${endTime}',\n`;
  sql += `  NOW()\n`;
  sql += `) ON CONFLICT (id) DO NOTHING;\n\n`;

  // 메시지 삽입
  messages.forEach((msg, index) => {
    const msgId = uuidv4();
    const content = ensureString(msg.content);
    const escapedContent = content.replace(/'/g, "''").replace(/\\/g, '\\\\');
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toISOString() : startTime;

    sql += `INSERT INTO conversation_messages (id, conversation_id, role, content, "order", created_at) VALUES (\n`;
    sql += `  '${msgId}',\n`;
    sql += `  '${id}',\n`;
    sql += `  '${msg.role}',\n`;
    sql += `  E'${escapedContent}',\n`;
    sql += `  ${index},\n`;
    sql += `  '${timestamp}'\n`;
    sql += `) ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += '\n';
  return sql;
}

/**
 * 메인 실행
 */
async function main() {
  // 상태 모드
  if (statusMode) {
    showStatus();
    return;
  }

  // 리셋 모드
  if (resetMode) {
    resetTracking();
    return;
  }

  console.log('='.repeat(60));
  console.log('Claude Code Conversation Migration');
  console.log('='.repeat(60));
  console.log(`Mode: ${forceMode ? 'Force (reprocess all)' : 'Incremental (new only)'}`);

  // 디렉토리 확인
  if (!fs.existsSync(PROJECT_DIR)) {
    console.error(`❌ Project directory not found: ${PROJECT_DIR}`);
    process.exit(1);
  }

  // 출력 디렉토리 확인
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 추적 데이터 로드
  const trackingData = loadTrackingData();
  console.log(`📊 Previously migrated: ${trackingData.totalMigrated} sessions`);

  // JSONL 파일 목록
  const files = fs.readdirSync(PROJECT_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'))
    .filter(f => {
      const stats = fs.statSync(path.join(PROJECT_DIR, f));
      return stats.size > 0; // 빈 파일 제외
    });

  console.log(`\n📁 Found ${files.length} conversation files`);

  // 특정 세션만 처리
  let targetFiles = files;
  if (sessionId) {
    targetFiles = files.filter(f => f.includes(sessionId));
    console.log(`🎯 Filtering for session: ${sessionId}`);
  }

  // 제한 적용
  if (limit) {
    targetFiles = targetFiles.slice(0, limit);
    console.log(`📊 Limited to ${limit} sessions`);
  }

  console.log(`\n🔄 Processing ${targetFiles.length} sessions...\n`);

  let sqlOutput = `-- Claude Code Conversations Migration (Incremental)\n`;
  sqlOutput += `-- Generated: ${new Date().toISOString()}\n\n`;

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let newSessionsCount = 0;

  for (const file of targetFiles) {
    const filePath = path.join(PROJECT_DIR, file);

    // 파일명에서 세션 ID 추출 (파일명이 세션 ID.jsonl 형태)
    const fileSessionId = file.replace('.jsonl', '');

    // 중복 체크 (force 모드가 아닐 때)
    if (!forceMode && isAlreadyMigrated(trackingData, fileSessionId)) {
      skippedCount++;
      continue;
    }

    console.log(`Processing: ${file}`);

    try {
      const { messages, metadata } = await parseJsonlFile(filePath);

      if (messages.length === 0) {
        console.log(`  ⏭️  Skipped (no messages)`);
        skippedCount++;
        continue;
      }

      // 실제 세션 ID 사용 (메타데이터에서 추출된 것 또는 파일명)
      const actualSessionId = metadata.sessionId || fileSessionId;

      // 메타데이터 기반 중복 체크
      if (!forceMode && isAlreadyMigrated(trackingData, actualSessionId)) {
        console.log(`  ⏭️  Skipped (already migrated)`);
        skippedCount++;
        continue;
      }

      const title = generateTitle(messages);
      const category = categorize(messages);
      const difficulty = estimateDifficulty(messages);
      const month = metadata.startTime
        ? metadata.startTime.toISOString().substring(0, 7)
        : new Date().toISOString().substring(0, 7);

      console.log(`  📝 Title: ${title.substring(0, 50)}...`);
      console.log(`  💬 Messages: ${messages.length}`);
      console.log(`  🏷️  Category: ${category}, Difficulty: ${difficulty}`);

      // Markdown 저장
      if (!dbOnly) {
        const markdown = convertToMarkdown(messages, metadata, title);
        const filename = generateFilename(metadata, title);

        // 월별 폴더 생성
        const monthDir = path.join(OUTPUT_DIR, month);

        if (!fs.existsSync(monthDir)) {
          fs.mkdirSync(monthDir, { recursive: true });
        }

        const outputPath = path.join(monthDir, filename);
        fs.writeFileSync(outputPath, markdown, 'utf8');
        console.log(`  ✅ Saved: ${filename}`);
      }

      // SQL 생성
      if (!mdOnly) {
        sqlOutput += generateInsertSQL(messages, metadata, title);
      }

      // 추적 데이터 업데이트
      markAsMigrated(trackingData, actualSessionId, category, difficulty, month);
      // 파일명 기반 ID도 추가 (중복 방지)
      if (fileSessionId !== actualSessionId) {
        trackingData.migratedSessions.push(fileSessionId);
      }

      processedCount++;
      newSessionsCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  // 추적 데이터 저장
  saveTrackingData(trackingData);

  // SQL 파일 저장 (새로운 세션이 있을 때만)
  if (!mdOnly && newSessionsCount > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const sqlPath = path.join(__dirname, '..', 'migration', `insert_conversations_${timestamp}.sql`);
    fs.writeFileSync(sqlPath, sqlOutput, 'utf8');
    console.log(`\n💾 SQL saved to: ${sqlPath}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ New sessions processed: ${processedCount}`);
  console.log(`⏭️  Skipped (already migrated): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total migrated (all time): ${trackingData.totalMigrated}`);
  console.log('='.repeat(60));

  if (!mdOnly && newSessionsCount > 0) {
    console.log('\n📋 To import new sessions to database, run:');
    console.log(`   psql -h localhost -U app_user -d app_db -f migration/insert_conversations_*.sql`);
  } else if (newSessionsCount === 0) {
    console.log('\nℹ️  No new sessions to process. Use --force to reprocess all.');
  }
}

main().catch(console.error);
