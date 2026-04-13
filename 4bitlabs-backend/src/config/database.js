const { createClient } = require('@supabase/supabase-js');

// ─── Supabase Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://wkyqxhoqukhliljbvcbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreXF4aG9xdWtobGlsamJ2Y2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODYyMTQsImV4cCI6MjA5MTY2MjIxNH0.m6WffVzVXWBVJ4G8YQx02kfjMLyrc59sCa78pM3yxPM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── pool.query() wrapper — same API as node-postgres ─────────────────────────
// All controllers use: const { rows } = await pool.query(sql, params)
// This wrapper sends SQL via HTTPS to the exec_sql() Postgres function
const pool = {
  async query(text, params = []) {
    const cleanParams = (params || []).map(v => (v === undefined || v === null) ? null : String(v));

    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: text,
      query_params: cleanParams,
    });

    if (error) throw new Error(error.message);

    const rows = Array.isArray(data) ? data : [];
    return { rows, rowCount: rows.length };
  },

  async connect() {
    return {
      query: (text, params) => pool.query(text, params),
      release: () => {},
    };
  },
};

// ─── Connect & Verify ─────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const { rows } = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ PostgreSQL Connected via Supabase HTTPS`);
    console.log(`   Database: ${rows[0].db}`);
    console.log(`   Server time: ${rows[0].now}`);
    console.log(`🔗 ${SUPABASE_URL}`);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') process.exit(1);
    console.warn('⚠️  Server will continue without database.');
  }
};

module.exports = { connectDB, pool, supabase };
