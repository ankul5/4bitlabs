const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function runSchema() {
  const schemaPath = path.join(__dirname, 'src/config/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Connecting to database via Supabase HTTPS wrapper...');
  try {
    console.log('Running schema.sql...');
    await pool.query(sql);
    console.log('✅ Schema applied successfully! All tables created.');

    const { rows } = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
    );
    console.log('\n📋 Tables now in database:');
    rows.forEach(r => console.log('  ✓', r.tablename));
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    throw err;
  }
}

runSchema().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
