const { connectDB, pool } = require('./src/config/database');

async function run() {
  await connectDB();
  try {
    await pool.query(`ALTER TABLE quiz_questions ADD COLUMN type TEXT DEFAULT 'mcq' CHECK (type IN ('mcq', 'written'))`);
    console.log('Added type to quiz_questions');
  } catch(e) {
    console.log(e.message);
  }
  try {
    await pool.query(`ALTER TABLE quiz_attempts ADD COLUMN status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending_review'))`);
    console.log('Added status to quiz_attempts');
  } catch(e) {
    console.log(e.message);
  }
  process.exit(0);
}
run();
