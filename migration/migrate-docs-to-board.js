const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { marked } = require('marked');

// Database configuration
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Board type ID for manual board
const MANUAL_BOARD_TYPE_ID = '78516af9-bd41-4d98-a553-f64dfa9eef5e';

// Author information
const AUTHOR_ID = 1; // admin user
const AUTHOR_NAME = '관리자';
const AUTHOR_DEPARTMENT = 'IT';

// Docs directory
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Extract title from markdown content
 */
function extractTitle(content) {
  // Try to find first # heading
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }

  // If no heading found, return filename without extension
  return null;
}

/**
 * Convert markdown to HTML
 */
function markdownToHtml(markdown) {
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    headerIds: true,
    mangle: false,
    sanitize: false
  });

  return marked.parse(markdown);
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Insert post into database
 */
async function insertPost(title, htmlContent, filename) {
  const client = await pool.connect();

  try {
    const postId = generateUUID();
    const now = new Date();

    const query = `
      INSERT INTO posts (
        id,
        board_type_id,
        title,
        content,
        author_id,
        author_name,
        author_department,
        is_anonymous,
        post_type,
        status,
        is_pinned,
        is_secret,
        is_approved,
        view_count,
        comment_count,
        like_count,
        attachment_count,
        show_popup,
        created_at,
        updated_at,
        published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
    `;

    const values = [
      postId,                    // id
      MANUAL_BOARD_TYPE_ID,     // board_type_id
      title,                     // title
      htmlContent,               // content
      AUTHOR_ID,                 // author_id
      AUTHOR_NAME,               // author_name
      AUTHOR_DEPARTMENT,         // author_department
      false,                     // is_anonymous
      'normal',                  // post_type
      'published',               // status
      false,                     // is_pinned
      false,                     // is_secret
      true,                      // is_approved
      0,                         // view_count
      0,                         // comment_count
      0,                         // like_count
      0,                         // attachment_count
      false,                     // show_popup
      now,                       // created_at
      now,                       // updated_at
      now                        // published_at
    ];

    await client.query(query, values);

    console.log(`✓ Inserted: ${title} (from ${filename})`);
    return postId;

  } catch (error) {
    console.error(`✗ Failed to insert ${filename}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Process a single markdown file
 */
async function processMarkdownFile(filepath) {
  const filename = path.basename(filepath);

  try {
    // Read markdown file
    const markdownContent = fs.readFileSync(filepath, 'utf8');

    if (!markdownContent.trim()) {
      console.log(`⊘ Skipped (empty): ${filename}`);
      return null;
    }

    // Extract title
    let title = extractTitle(markdownContent);
    if (!title) {
      // Use filename without extension as title
      title = path.basename(filename, '.md')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');
    }

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(markdownContent);

    // Insert into database
    const postId = await insertPost(title, htmlContent, filename);

    return { filename, title, postId };

  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Markdown to Manual Board Migration');
  console.log('='.repeat(60));
  console.log(`Docs directory: ${DOCS_DIR}`);
  console.log(`Board type ID: ${MANUAL_BOARD_TYPE_ID}`);
  console.log('='.repeat(60));
  console.log();

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected');
    console.log();

    // Get all markdown files
    const files = fs.readdirSync(DOCS_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(DOCS_DIR, file))
      .sort();

    console.log(`Found ${files.length} markdown files`);
    console.log();

    // Process each file
    const results = [];
    for (const filepath of files) {
      const result = await processMarkdownFile(filepath);
      if (result) {
        results.push(result);
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total files: ${files.length}`);
    console.log(`Successfully migrated: ${results.length}`);
    console.log(`Failed: ${files.length - results.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processMarkdownFile, markdownToHtml, extractTitle };
