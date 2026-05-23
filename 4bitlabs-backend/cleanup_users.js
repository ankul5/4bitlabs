require('dotenv').config();
const { pool } = require('./src/config/database');

(async () => {
  try {
    // Remove old @4bitslabs.com mentor_profiles
    await pool.query("DELETE FROM mentor_profiles WHERE uid IN (SELECT uid FROM users WHERE email LIKE '%4bitslabs.com')");
    // Remove old @4bitslabs.com users
    await pool.query("DELETE FROM users WHERE email LIKE '%4bitslabs.com'");
    console.log('Cleaned old @4bitslabs.com accounts');
    
    const { rows } = await pool.query('SELECT name, email, role FROM users WHERE 1=1');
    rows.forEach(u => console.log(`  ${u.name} | ${u.email} | ${u.role}`));
    console.log(`Total: ${rows.length}`);
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
