const { pool } = require('../src/config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  try {
    const res = await pool.query("SELECT uid, id, role FROM users WHERE role IN ('super_admin', 'mentor') LIMIT 1");
    if (res.rows[0]) {
      const user = res.rows[0];
      console.log('USER:', user);
      const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET || 'fallback_secret_if_env_fails');
      console.log('TOKEN:', token);
      
      const http = require('http');
      
      // Test Create School
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/schools',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      }, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => console.log('CREATE SCHOOL:', r.statusCode, d));
      });
      req.write(JSON.stringify({ name: 'Api Test School', code: 'API01' }));
      req.end();
      
      // Test Create Course
      const req2 = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/courses',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      }, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => console.log('CREATE COURSE:', r.statusCode, d));
      });
      req2.write(JSON.stringify({ title: 'Api Test Course' }));
      req2.end();
      
    }
  } catch(e) { console.error(e); }
}
test();
