/**
 * Seed 5 mentor accounts into Firebase Auth + PostgreSQL
 * Run: node seed_mentors.js
 */
require('dotenv').config();
const admin = require('./src/config/firebase-admin');
const { pool } = require('./src/config/database');

const MENTORS = [
  { name: 'Lokesh', email: 'lokesh@4bitslabs.com' },
  { name: 'Devraj', email: 'devraj@4bitslabs.com' },
  { name: 'Ankul', email: 'ankul@4bitslabs.com' },
  { name: 'Aman', email: 'aman@4bitslabs.com' },
  { name: 'Rohit', email: 'rohit@4bitslabs.com' },
];
const PASSWORD = '4bitlabs2026';

async function seedMentors() {
  console.log('\n🌱 Seeding 5 mentor accounts...\n');

  for (const mentor of MENTORS) {
    try {
      // 1. Create in Firebase Auth (or get existing)
      let fbUser;
      try {
        fbUser = await admin.auth().getUserByEmail(mentor.email);
        console.log(`  ✓ Firebase user exists: ${mentor.email} (uid: ${fbUser.uid})`);
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          fbUser = await admin.auth().createUser({
            email: mentor.email,
            password: PASSWORD,
            displayName: mentor.name,
          });
          console.log(`  ✅ Firebase user created: ${mentor.email} (uid: ${fbUser.uid})`);
        } else {
          throw e;
        }
      }

      // 2. Create in PostgreSQL (upsert)
      await pool.query(
        `INSERT INTO users (uid, name, email, role, is_active, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (uid) DO UPDATE SET role = 'mentor', name = $2, is_active = true`,
        [fbUser.uid, mentor.name, mentor.email, 'mentor', true, true]
      );
      console.log(`  ✅ DB user ready: ${mentor.name} (${mentor.email})`);

    } catch (err) {
      console.error(`  ❌ Failed for ${mentor.email}: ${err.message}`);
    }
  }

  console.log('\n✅ Seeding complete! Mentors can login with password: ' + PASSWORD);
  console.log('\n📋 Mentor emails:');
  MENTORS.forEach(m => console.log(`   ${m.email}`));
  process.exit(0);
}

seedMentors().catch(e => { console.error(e); process.exit(1); });
