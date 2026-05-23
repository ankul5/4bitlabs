/**
 * 4Bit Labs — Seed Mentors Script
 * 
 * Creates the 5 official mentor accounts in Firebase Auth + PostgreSQL.
 * Cleans up any existing dummy mentor data.
 * 
 * Usage: node seed_mentors.js
 */
require('dotenv').config();
const admin = require('./src/config/firebase-admin');
const { pool } = require('./src/config/database');

const MENTORS = [
  {
    name: 'Ankul',
    email: 'Ankul@4bit.com',
    password: '4bitlabs2026',
    role: 'mentor',
    bio: 'Full-Stack Developer & Co-founder at 4Bit Labs. Passionate about building scalable systems.',
    skills: ['React Native', 'Node.js', 'System Design'],
    experience: '3+ years',
    session_price: 50,
  },
  {
    name: 'Devraj',
    email: 'Devraj@4bit.com',
    password: '4bitlabs2026',
    role: 'mentor',
    bio: 'Backend architect & DevOps specialist. Expert in cloud infrastructure and CI/CD pipelines.',
    skills: ['Python', 'AWS', 'Docker', 'CI/CD'],
    experience: '3+ years',
    session_price: 50,
  },
  {
    name: 'Aman',
    email: 'Aman@4bit.com',
    password: '4bitlabs2026',
    role: 'mentor',
    bio: 'UI/UX designer & front-end developer. Creating beautiful, accessible digital experiences.',
    skills: ['Figma', 'React', 'UI/UX', 'CSS'],
    experience: '2+ years',
    session_price: 50,
  },
  {
    name: 'Lokesh',
    email: 'Lokesh@4bit.com',
    password: '4bitlabs2026',
    role: 'mentor',
    bio: 'Data Science & ML engineer. Turning data into actionable insights and intelligent systems.',
    skills: ['Machine Learning', 'Python', 'TensorFlow'],
    experience: '2+ years',
    session_price: 50,
  },
  {
    name: 'Rohit',
    email: 'Rohit@4bit.com',
    password: '4bitlabs2026',
    role: 'mentor',
    bio: 'Mobile app developer & competitive programmer. Building high-performance native applications.',
    skills: ['Flutter', 'Kotlin', 'DSA', 'Firebase'],
    experience: '2+ years',
    session_price: 50,
  },
];

async function seedMentors() {
  console.log('\n🚀 4Bit Labs — Mentor Seeding Tool\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ── Step 1: Clean existing mentor_profiles ──────────────────────────
  console.log('\n🧹 Step 1: Cleaning existing mentor profiles...');
  try {
    await pool.query("DELETE FROM mentor_profiles WHERE 1=1");
    console.log('   ✅ Cleared mentor_profiles table');
  } catch (e) {
    console.warn('   ⚠️  Could not clear mentor_profiles:', e.message);
  }

  // ── Step 2: Create/update each mentor ────────────────────────────────
  console.log('\n👥 Step 2: Creating mentor accounts...\n');

  for (const mentor of MENTORS) {
    try {
      // Try to create Firebase Auth user (or get existing)
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(mentor.email);
        console.log(`   📧 ${mentor.email} — Firebase account exists (uid: ${firebaseUser.uid})`);
        // Update password just in case
        await admin.auth().updateUser(firebaseUser.uid, { password: mentor.password, displayName: mentor.name });
      } catch (fbErr) {
        if (fbErr.code === 'auth/user-not-found') {
          firebaseUser = await admin.auth().createUser({
            email: mentor.email,
            password: mentor.password,
            displayName: mentor.name,
            emailVerified: true,
          });
          console.log(`   ✨ ${mentor.email} — Created new Firebase account (uid: ${firebaseUser.uid})`);
        } else {
          throw fbErr;
        }
      }

      // Check if user already exists in PostgreSQL
      const { rows: existingUsers } = await pool.query(
        'SELECT id FROM users WHERE uid = $1', [firebaseUser.uid]
      );

      let userId;
      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0].id;
        await pool.query(
          'UPDATE users SET name=$1, email=$2, role=$3, is_verified=TRUE, updated_at=NOW() WHERE uid=$4',
          [mentor.name, mentor.email, mentor.role, firebaseUser.uid]
        );
        console.log(`   📝 Updated user record (id: ${userId})`);
      } else {
        // Insert and get the ID back
        const { rows: newUserRows } = await pool.query(
          `INSERT INTO users (uid, name, email, role, is_verified, is_active)
           VALUES ($1, $2, $3, $4, TRUE, TRUE) RETURNING id`,
          [firebaseUser.uid, mentor.name, mentor.email, mentor.role]
        );

        if (newUserRows && newUserRows.length > 0) {
          userId = newUserRows[0].id;
        } else {
          // Fallback: query the ID
          const { rows: lookupRows } = await pool.query(
            'SELECT id FROM users WHERE uid = $1', [firebaseUser.uid]
          );
          userId = lookupRows[0]?.id;
        }
        console.log(`   📝 Created user record (id: ${userId})`);
      }

      if (!userId) {
        console.error(`   ❌ Could not get user ID for ${mentor.email}, skipping mentor_profile`);
        continue;
      }

      // Create mentor_profile
      const skillsArr = `{${mentor.skills.map(s => `"${s}"`).join(',')}}`;
      await pool.query(
        `INSERT INTO mentor_profiles (user_id, uid, name, role, bio, skills, experience, session_price, is_available, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE)`,
        [userId, firebaseUser.uid, mentor.name, 'Platform Mentor', mentor.bio, skillsArr, mentor.experience, mentor.session_price]
      );
      console.log(`   🎓 Created mentor profile for ${mentor.name}`);
      console.log('');

    } catch (error) {
      console.error(`   ❌ Failed for ${mentor.email}:`, error.message);
    }
  }

  // ── Step 3: Summary ────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const { rows: mentorCount } = await pool.query('SELECT COUNT(*) as count FROM mentor_profiles WHERE 1=1');
    const { rows: userCount } = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'mentor'");
    console.log(`\n✅ Seeding Complete!`);
    console.log(`   Mentor profiles: ${mentorCount[0]?.count || 0}`);
    console.log(`   Mentor users: ${userCount[0]?.count || 0}`);
  } catch (e) {
    console.log(`\n✅ Seeding Complete! (Could not verify counts: ${e.message})`);
  }
  console.log(`\n📋 Login Credentials:`);
  MENTORS.forEach(m => {
    console.log(`   ${m.email} / ${m.password}`);
  });
  console.log('\n');

  process.exit(0);
}

seedMentors().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
