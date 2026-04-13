-- ============================================================
-- 4Bit Labs PostgreSQL Schema
-- Run this once in your Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Schools ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  admin_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,            -- Firebase UID
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'student' CHECK (role IN ('student','mentor','teacher','school_admin','super_admin')),
  school_id UUID REFERENCES schools(id),
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date TIMESTAMPTZ,
  fcm_tokens TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Courses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  school_id UUID REFERENCES schools(id) NOT NULL,
  teacher_id UUID REFERENCES users(id),
  category TEXT DEFAULT 'General',
  enrolled_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Course IDs (many-to-many join) ──────────────────
CREATE TABLE IF NOT EXISTS user_courses (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, course_id)
);

-- ─── Lectures (child of Course) ───────────────────────────
CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  topic TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Quizzes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  school_id UUID REFERENCES schools(id),
  created_by UUID REFERENCES users(id),
  duration INTEGER DEFAULT 15,       -- minutes
  total_marks INTEGER DEFAULT 0,
  passing_marks INTEGER DEFAULT 0,
  category TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','closed')),
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_options BOOLEAN DEFAULT FALSE,
  show_results_immediately BOOLEAN DEFAULT TRUE,
  attempt_limit INTEGER DEFAULT 1,
  available_from TIMESTAMPTZ,
  available_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Quiz Questions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT DEFAULT 'mcq' CHECK (type IN ('mcq', 'written')),
  options JSONB DEFAULT '[]',        -- [{key:'A', text:'...'}, ...]
  correct_answer TEXT DEFAULT '',
  explanation TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  points INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0
);

-- ─── Quiz Attempts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quiz_id UUID REFERENCES quizzes(id),
  course_id UUID REFERENCES courses(id),
  school_id UUID REFERENCES schools(id),
  answers JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  max_points INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  time_taken_seconds INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending_review')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Enrollments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  school_id UUID REFERENCES schools(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','dropped','paused')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress NUMERIC(5,2) DEFAULT 0,
  completed_lectures UUID[] DEFAULT ARRAY[]::UUID[],
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- ─── Attendance ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  lecture_id UUID,
  school_id UUID REFERENCES schools(id),
  date TEXT NOT NULL,                -- 'YYYY-MM-DD'
  status TEXT DEFAULT 'present' CHECK (status IN ('present','absent','late')),
  watched_duration_seconds INTEGER DEFAULT 0,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lecture_id)
);

-- ─── Leaderboard Entries ───────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  school_id UUID REFERENCES schools(id),
  user_id UUID REFERENCES users(id),
  uid TEXT DEFAULT '',
  name TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

-- ─── Mentor Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'Mentor',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience TEXT DEFAULT '',
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  session_price INTEGER DEFAULT 50,  -- INR
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  available_slots JSONB DEFAULT '[]', -- [{day:'Monday', times:['09:00 AM']}]
  total_sessions_completed INTEGER DEFAULT 0,
  fcm_token TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mentor Bookings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  mentor_id UUID REFERENCES mentor_profiles(id),
  slot_date TEXT NOT NULL,           -- 'YYYY-MM-DD'
  slot_time TEXT NOT NULL,           -- 'HH:MM AM/PM'
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT DEFAULT '',
  razorpay_signature TEXT DEFAULT '',
  amount_paid INTEGER DEFAULT 5000,  -- paise
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','confirmed','completed','cancelled','refunded')),
  notes TEXT DEFAULT '',
  meeting_link TEXT DEFAULT '',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Announcements ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general','quiz','course','event','maintenance','urgent')),
  school_id UUID REFERENCES schools(id),
  course_id UUID REFERENCES courses(id),
  created_by UUID REFERENCES users(id),
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  target_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chat Messages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,             -- e.g. 'mentor_<bookingId>' or 'course_<courseId>'
  sender_id UUID REFERENCES users(id),
  sender_name TEXT NOT NULL,
  sender_avatar TEXT DEFAULT '',
  sender_role TEXT DEFAULT 'student',
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file')),
  read_by UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_school ON courses(school_id, is_published);
CREATE INDEX IF NOT EXISTS idx_lectures_course ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_school ON quizzes(school_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_course ON leaderboard_entries(course_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON mentor_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor ON mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id, is_active, created_at DESC);
