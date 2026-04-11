/**
 * 4Bit Labs Database Seeder
 * 
 * Seeds the database with sample data for testing.
 * Usage:
 *   node src/utils/seeder.js          — Seed all data
 *   node src/utils/seeder.js --clear  — Clear all data
 *   node src/utils/seeder.js --reset  — Clear then seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

// Models
const User = require('../models/User');
const School = require('../models/School');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Mentor = require('../models/Mentor');
const Leaderboard = require('../models/Leaderboard');
const Announcement = require('../models/Announcement');

// ─── Sample Data ─────────────────────────────────────────────────────────────

const schools = [
  {
    name: '4Bit Labs Academy',
    code: '4BIT',
    address: '123 Tech Park, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    isActive: true,
  },
  {
    name: 'Digital Learning Center',
    code: 'DLC',
    address: '456 Knowledge Hub',
    city: 'Mumbai',
    state: 'Maharashtra',
    isActive: true,
  },
];

const createUsers = (schoolId) => [
  {
    uid: 'firebase_admin_001',
    name: 'Super Admin',
    email: 'admin@4bitlabs.com',
    phone: '+919876543210',
    role: 'super_admin',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_teacher_001',
    name: 'Rajesh Kumar',
    email: 'rajesh@4bitlabs.com',
    phone: '+919876543211',
    role: 'teacher',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_student_001',
    name: 'Priya Sharma',
    email: 'priya@student.com',
    phone: '+919876543212',
    role: 'student',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_student_002',
    name: 'Arjun Singh',
    email: 'arjun@student.com',
    phone: '+919876543213',
    role: 'student',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_student_003',
    name: 'Ananya Patel',
    email: 'ananya@student.com',
    phone: '+919876543214',
    role: 'student',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_mentor_001',
    name: 'Devraj Bharti',
    email: 'devraj@mentor.com',
    phone: '+919000000001',
    role: 'mentor',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_mentor_002',
    name: 'Ankul Tiwari',
    email: 'ankul@mentor.com',
    phone: '+919000000002',
    role: 'mentor',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_mentor_003',
    name: 'Aman Patel',
    email: 'aman@mentor.com',
    phone: '+919000000003',
    role: 'mentor',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_mentor_004',
    name: 'Lokesh Bhavsar',
    email: 'lokesh@mentor.com',
    phone: '+919000000004',
    role: 'mentor',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
  {
    uid: 'firebase_mentor_005',
    name: 'Rohit Pranjale',
    email: 'rohit@mentor.com',
    phone: '+919000000005',
    role: 'mentor',
    schoolId,
    points: 0,
    isActive: true,
    isVerified: true,
  },
];

const createCourses = (schoolId, teacherId) => [
  {
    title: 'Full-Stack Web Development',
    description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build 5 real-world projects.',
    schoolId,
    teacherId,
    category: 'Web Development',
    isPublished: true,
    tags: ['html', 'css', 'javascript', 'react', 'nodejs', 'mongodb'],
    lectures: [
      { title: 'Introduction to HTML', description: 'Learn the basics of HTML5', videoUrl: '', duration: '25:30', order: 1, isPublished: true, topic: 'HTML' },
      { title: 'CSS Fundamentals', description: 'Styling your first webpage', videoUrl: '', duration: '32:15', order: 2, isPublished: true, topic: 'CSS' },
      { title: 'JavaScript Basics', description: 'Variables, functions, and DOM', videoUrl: '', duration: '45:00', order: 3, isPublished: true, topic: 'JavaScript' },
      { title: 'React Introduction', description: 'Components, props, and state', videoUrl: '', duration: '55:20', order: 4, isPublished: true, topic: 'React' },
      { title: 'Node.js & Express', description: 'Building REST APIs', videoUrl: '', duration: '48:10', order: 5, isPublished: true, topic: 'Node.js' },
    ],
    buildProjects: [
      {
        title: 'Personal Portfolio Website',
        description: 'Build a responsive portfolio with HTML, CSS, and JavaScript',
        difficulty: 'Beginner',
        steps: [
          { stepNumber: 1, instruction: 'Create the HTML structure', codeSnippet: '' },
          { stepNumber: 2, instruction: 'Add CSS styling with Flexbox', codeSnippet: '' },
          { stepNumber: 3, instruction: 'Add JavaScript for interactivity', codeSnippet: '' },
        ],
      },
    ],
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python, NumPy, Pandas, Matplotlib, and Scikit-Learn. Analyze real datasets.',
    schoolId,
    teacherId,
    category: 'Data Science',
    isPublished: true,
    tags: ['python', 'numpy', 'pandas', 'data-science', 'machine-learning'],
    lectures: [
      { title: 'Python Basics', description: 'Variables, data types, loops', videoUrl: '', duration: '30:00', order: 1, isPublished: true, topic: 'Python' },
      { title: 'NumPy Arrays', description: 'Working with numerical data', videoUrl: '', duration: '35:45', order: 2, isPublished: true, topic: 'NumPy' },
      { title: 'Pandas DataFrames', description: 'Data manipulation and analysis', videoUrl: '', duration: '42:30', order: 3, isPublished: true, topic: 'Pandas' },
      { title: 'Data Visualization', description: 'Charts with Matplotlib and Seaborn', videoUrl: '', duration: '38:20', order: 4, isPublished: true, topic: 'Visualization' },
    ],
    buildProjects: [
      {
        title: 'COVID-19 Data Analysis',
        description: 'Analyze and visualize COVID-19 data using Python',
        difficulty: 'Intermediate',
        steps: [
          { stepNumber: 1, instruction: 'Load the dataset with Pandas', codeSnippet: '' },
          { stepNumber: 2, instruction: 'Clean and preprocess data', codeSnippet: '' },
          { stepNumber: 3, instruction: 'Create visualizations', codeSnippet: '' },
        ],
      },
    ],
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile apps with React Native and Expo.',
    schoolId,
    teacherId,
    category: 'Mobile Development',
    isPublished: true,
    tags: ['react-native', 'expo', 'mobile', 'javascript'],
    lectures: [
      { title: 'React Native Setup', description: 'Setting up Expo and your first app', videoUrl: '', duration: '20:00', order: 1, isPublished: true, topic: 'Setup' },
      { title: 'Components & Navigation', description: 'Building screens and navigating', videoUrl: '', duration: '40:15', order: 2, isPublished: true, topic: 'Components' },
      { title: 'State Management', description: 'Context API and hooks', videoUrl: '', duration: '35:30', order: 3, isPublished: true, topic: 'State' },
    ],
    buildProjects: [],
  },
];

const createQuizzes = (courseId, schoolId, teacherId) => [
  {
    title: 'HTML & CSS Fundamentals Quiz',
    courseId,
    schoolId,
    createdBy: teacherId,
    duration: 10,
    status: 'published',
    shuffleQuestions: true,
    shuffleOptions: false,
    attemptLimit: 2,
    questions: [
      {
        question: 'What does HTML stand for?',
        options: [
          { key: 'A', text: 'Hyper Text Markup Language' },
          { key: 'B', text: 'High Tech Modern Language' },
          { key: 'C', text: 'Hyper Transfer Markup Language' },
          { key: 'D', text: 'Home Tool Markup Language' },
        ],
        correctAnswer: 'A',
        explanation: 'HTML = Hyper Text Markup Language',
        points: 10,
      },
      {
        question: 'Which CSS property is used to change the text color?',
        options: [
          { key: 'A', text: 'text-color' },
          { key: 'B', text: 'font-color' },
          { key: 'C', text: 'color' },
          { key: 'D', text: 'text-style' },
        ],
        correctAnswer: 'C',
        explanation: 'The CSS color property sets the text color.',
        points: 10,
      },
      {
        question: 'Which HTML tag is used for the largest heading?',
        options: [
          { key: 'A', text: '<heading>' },
          { key: 'B', text: '<h6>' },
          { key: 'C', text: '<h1>' },
          { key: 'D', text: '<head>' },
        ],
        correctAnswer: 'C',
        explanation: '<h1> is the largest heading tag in HTML.',
        points: 10,
      },
      {
        question: 'Which CSS property controls the spacing between elements?',
        options: [
          { key: 'A', text: 'spacing' },
          { key: 'B', text: 'margin' },
          { key: 'C', text: 'gap' },
          { key: 'D', text: 'indent' },
        ],
        correctAnswer: 'B',
        explanation: 'margin controls spacing outside elements; gap works inside flex/grid.',
        points: 10,
      },
      {
        question: 'What is the correct way to make text bold in CSS?',
        options: [
          { key: 'A', text: 'font-weight: bold' },
          { key: 'B', text: 'text-weight: bold' },
          { key: 'C', text: 'font-style: bold' },
          { key: 'D', text: 'text-decoration: bold' },
        ],
        correctAnswer: 'A',
        explanation: 'font-weight: bold makes text bold.',
        points: 10,
      },
    ],
  },
];

const createMentors = (mentors) => mentors.map((m) => ({
    userId: m._id,
    uid: m.uid,
    name: m.name,
    bio: 'Senior Professional with 8+ years of experience. Passionate about teaching and mentorship at 4Bit Labs.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'System Design'],
    experience: '8 years',
    rating: 4.8,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    sessionPrice: 50,
    isVerified: true,
    isAvailable: true,
    availableSlots: [
      { day: 'Monday', times: ['10:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Wednesday', times: ['10:00 AM', '02:00 PM'] },
      { day: 'Friday', times: ['11:00 AM', '03:00 PM'] },
      { day: 'Saturday', times: ['10:00 AM', '12:00 PM', '02:00 PM'] },
    ],
    totalSessionsCompleted: Math.floor(Math.random() * 100) + 20,
}));

const createAnnouncements = (schoolId, createdBy) => [
  {
    title: 'Welcome to 4Bit Labs! 🎉',
    body: 'Welcome to the 4Bit Labs learning platform! Start exploring courses, take quizzes, and climb the leaderboard. Happy learning!',
    type: 'general',
    schoolId,
    createdBy,
    isPinned: true,
    isActive: true,
  },
  {
    title: 'New Quiz Available — HTML & CSS Fundamentals',
    body: 'Test your HTML and CSS knowledge with our latest quiz! 5 questions, 10 minutes. Points will be added to the leaderboard.',
    type: 'quiz',
    schoolId,
    createdBy,
    isActive: true,
  },
  {
    title: 'Mentor Sessions Now Available',
    body: 'Book a 1-on-1 mentorship session for just ₹50. Expert guidance on your projects and learning doubts.',
    type: 'general',
    schoolId,
    createdBy,
    isActive: true,
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // 1. Create schools
    const createdSchools = await School.insertMany(schools);
    const mainSchool = createdSchools[0];
    console.log(`✅ ${createdSchools.length} schools created`);

    // 2. Create users
    const userData = createUsers(mainSchool._id);
    const createdUsers = await User.insertMany(userData);
    const admin = createdUsers.find((u) => u.role === 'super_admin');
    const teacher = createdUsers.find((u) => u.role === 'teacher');
    const mentors = createdUsers.filter((u) => u.role === 'mentor');
    const students = createdUsers.filter((u) => u.role === 'student');
    console.log(`✅ ${createdUsers.length} users created (1 admin, 1 teacher, 3 students, 5 mentors)`);

    // Update school admin
    await School.findByIdAndUpdate(mainSchool._id, {
      adminId: admin._id,
      studentCount: students.length,
    });

    // 3. Create courses
    const courseData = createCourses(mainSchool._id, teacher._id);
    const createdCourses = await Course.insertMany(courseData);
    console.log(`✅ ${createdCourses.length} courses created`);

    // Update school with courses
    await School.findByIdAndUpdate(mainSchool._id, {
      courses: createdCourses.map((c) => c._id),
    });

    // Enroll students in first course
    const firstCourse = createdCourses[0];
    for (const student of students) {
      await User.findByIdAndUpdate(student._id, {
        $addToSet: { courseIds: firstCourse._id },
      });
    }

    // 4. Create quizzes
    const quizData = createQuizzes(firstCourse._id, mainSchool._id, teacher._id);
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`✅ ${createdQuizzes.length} quizzes created`);

    // 5. Create mentor profile
    const mentorData = createMentors(mentors);
    const createdMentors = await Mentor.insertMany(mentorData);
    console.log(`✅ ${createdMentors.length} mentors created`);

    // 6. Create leaderboard for first course
    const leaderboard = await Leaderboard.create({
      courseId: firstCourse._id,
      schoolId: mainSchool._id,
      entries: students.map((s, i) => ({
        userId: s._id,
        uid: s.uid,
        name: s.name,
        points: [50, 30, 20][i] || 0,
        rank: i + 1,
        quizzesCompleted: 1,
      })),
    });
    console.log(`✅ Leaderboard created with ${leaderboard.entries.length} entries`);

    // 7. Create announcements
    const announcementData = createAnnouncements(mainSchool._id, admin._id);
    const createdAnnouncements = await Announcement.insertMany(announcementData);
    console.log(`✅ ${createdAnnouncements.length} announcements created`);

    console.log('\n─────────────────────────────────────────────');
    console.log('🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────────────');
    console.log(`\nSchool: ${mainSchool.name} (${mainSchool.code})`);
    console.log(`Admin:  ${admin.email}`);
    console.log(`Teacher: ${teacher.email}`);
    console.log(`Students: ${students.map((s) => s.email).join(', ')}`);
    console.log(`Mentors: ${mentors.map((m) => m.name).join(', ')}`);
    console.log(`Courses: ${createdCourses.map((c) => c.title).join(', ')}`);
    console.log(`Quiz: ${createdQuizzes[0].title}`);
    console.log('─────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// ─── Clear Function ───────────────────────────────────────────────────────────
const clearDB = async () => {
  try {
    await connectDB();
    console.log('\n🗑️  Clearing all database collections...\n');

    await User.deleteMany({});
    await School.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Mentor.deleteMany({});
    await Leaderboard.deleteMany({});
    await Announcement.deleteMany({});

    const QuizAttempt = require('../models/QuizAttempt');
    const MentorBooking = require('../models/MentorBooking');
    const Attendance = require('../models/Attendance');
    const Enrollment = require('../models/Enrollment');

    await QuizAttempt.deleteMany({});
    await MentorBooking.deleteMany({});
    await Attendance.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('✅ All collections cleared.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear failed:', error);
    process.exit(1);
  }
};

// ─── CLI Args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--clear')) {
  clearDB();
} else if (args.includes('--reset')) {
  (async () => {
    await connectDB();
    const collections = ['users', 'schools', 'courses', 'quizzes', 'mentors', 'leaderboards', 'announcements', 'quizattempts', 'mentorbookings', 'attendances', 'enrollments'];
    for (const col of collections) {
      try { await mongoose.connection.db.dropCollection(col); } catch (e) { /* ignore */ }
    }
    console.log('✅ Collections dropped.');
    await seedDB();
  })();
} else {
  seedDB();
}
