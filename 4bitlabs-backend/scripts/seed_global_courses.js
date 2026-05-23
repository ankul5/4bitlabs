const { pool } = require('../src/config/database');
require('dotenv').config({ path: '../.env' });

async function seedCourses() {
  try {
    console.log('Seeding courses...');
    // Delete existing courses
    await pool.query('DELETE FROM courses WHERE 1=1');
    console.log('Deleted existing courses.');

    // Insert Robotics
    await pool.query(
      `INSERT INTO courses (id, title, description, category, is_published) 
       VALUES (gen_random_uuid(), 'ROBOTICS', 'Learn Robotics from scratch.', 'Robotics', true)`
    );
    
    // Insert IOT
    await pool.query(
      `INSERT INTO courses (id, title, description, category, is_published) 
       VALUES (gen_random_uuid(), 'IOT', 'Internet of Things fundamentals.', 'IoT', true)`
    );

    console.log('Successfully seeded ROBOTICS and IOT courses.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
