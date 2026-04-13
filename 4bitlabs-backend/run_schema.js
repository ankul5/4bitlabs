const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:AnkulTiwari%4005@db.zzwivxbslbrmoajhsszm.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function runSchema() {
  const schemaPath = path.join(__dirname, 'src/config/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Connecting to Supabase...');
  const client = await pool.connect();
  console.log('Connected!');

  try {
    console.log('Running schema.sql...');
    await client.query(sql);
    console.log('✅ Schema applied successfully! All tables created.');

    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
    );
    console.log('\n📋 Tables now in database:');
    rows.forEach(r => console.log('  ✓', r.tablename));
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
