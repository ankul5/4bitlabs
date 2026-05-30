-- ============================================================
-- 4Bit Labs PostgreSQL Schema (Clean Slate)
-- ============================================================

-- Enable UUID extension if needed, though we use auto-increment serial ids now
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing enum type if it exists
DROP TYPE IF EXISTS content_type CASCADE;

-- Create enum type for content
CREATE TYPE content_type AS ENUM ('video', 'code', 'connection');

-- ─── Schools ──────────────────────────────────────────────
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Students ─────────────────────────────────────────────
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Content ──────────────────────────────────────────────
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  url_or_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Announcements ────────────────────────────────────────
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
