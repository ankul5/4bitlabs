# 4Bit Labs — Complete API Documentation

Base URL: `http://localhost:5000/api/v1`

All responses follow this schema:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "...data": {}
}
```

---

## Authentication

### POST `/auth/verify-token`
Verify Firebase ID token and receive backend JWT.

**Auth:** None

**Body:**
```json
{ "idToken": "firebase_id_token_here" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "jwt_token_here",
  "user": { "uid": "...", "name": "...", "email": "...", "role": "student", ... }
}
```

---

### POST `/auth/register`
Create a new user after Firebase account creation.

**Auth:** None

**Body:**
```json
{
  "idToken": "firebase_id_token",
  "name": "Priya Sharma",
  "email": "priya@student.com",
  "phone": "+919876543210",
  "schoolId": "mongo_school_id",
  "courseIds": ["course_id_1", "course_id_2"],
  "role": "student"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "token": "jwt_token",
  "user": { ... }
}
```

---

### GET `/auth/me`
Get current user profile.

**Auth:** JWT

**Response:**
```json
{
  "success": true,
  "user": { "name": "...", "email": "...", "role": "...", "points": 50, "schoolId": { "name": "...", "code": "..." }, ... }
}
```

---

### PUT `/auth/me`
Update user profile.

**Auth:** JWT

**Body:**
```json
{ "name": "New Name", "phone": "+91...", "avatar": "https://..." }
```

---

### PUT `/auth/fcm-token`
Register FCM push notification token.

**Auth:** JWT

**Body:**
```json
{ "fcmToken": "fcm_device_token_here" }
```

---

## Schools

### GET `/schools`
List all active schools. **Public** — used in registration dropdown.

**Response:**
```json
{
  "success": true,
  "schools": [{ "_id": "...", "name": "4Bit Labs Academy", "code": "4BIT", "city": "Bangalore", ... }],
  "count": 2
}
```

---

### GET `/schools/:id`
Get school detail with its courses.

---

### POST `/schools`
Create a school. **Role:** `super_admin`

**Body:**
```json
{ "name": "School Name", "code": "SCH", "address": "...", "city": "...", "state": "..." }
```

---

### PUT `/schools/:id`
Update a school. **Role:** `super_admin`, `school_admin`

---

### DELETE `/schools/:id`
Delete a school. **Role:** `super_admin`

---

## Courses

### GET `/courses`
List courses scoped to user's school. Cached for 5 minutes.

**Auth:** JWT

**Response:**
```json
{
  "success": true,
  "courses": [{ "_id": "...", "title": "Full-Stack Web Dev", "category": "Web Development", "enrolledCount": 42, ... }],
  "count": 3
}
```

---

### GET `/courses/:id`
Get single course with all lectures and user's completion progress.

**Auth:** JWT

---

### GET `/courses/home-summary`
Dashboard summary for the HomeScreen.

**Auth:** JWT

**Response:**
```json
{
  "success": true,
  "user": { "name": "Priya", "avatar": "...", "points": 50, "streak": 3 },
  "courses": [{ "_id": "...", "title": "...", "progress": 40 }],
  "attendance": 75,
  "lessonsCompleted": 3,
  "totalLessons": 4,
  "announcements": [{ "title": "Welcome!", "body": "...", "type": "general" }],
  "upcomingQuizzes": [{ "title": "HTML Quiz", "duration": 10 }]
}
```

---

### POST `/courses`
Create a course. **Role:** `teacher`, `school_admin`, `super_admin`

**Body:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "schoolId": "...",
  "category": "Web Development",
  "tags": ["html", "css"],
  "isPublished": true
}
```

---

### PUT `/courses/:id`
Update a course. **Role:** `teacher`, `school_admin`, `super_admin`

---

### DELETE `/courses/:id`
Delete a course. **Role:** `teacher`, `school_admin`, `super_admin`

---

### POST `/courses/:id/lectures`
Add a lecture to a course. **Role:** `teacher`, `school_admin`, `super_admin`

**Body:**
```json
{
  "title": "Lecture Title",
  "description": "...",
  "videoUrl": "https://...",
  "duration": "25:30",
  "order": 1,
  "topic": "HTML",
  "isPublished": true
}
```

---

### PUT `/courses/:id/lectures/:lectureId`
Update a lecture.

---

### DELETE `/courses/:id/lectures/:lectureId`
Delete a lecture.

---

## Quizzes

### GET `/quizzes?courseId=xxx`
List quizzes for a course with attempt status per user.

**Auth:** JWT

**Response:**
```json
{
  "quizzes": [{
    "_id": "...", "title": "HTML Quiz", "duration": 10, "totalMarks": 50,
    "attempt": { "score": 4, "percentage": 80, "passed": true } | null,
    "status": "completed" | "failed" | "available"
  }]
}
```

---

### GET `/quizzes/:id`
Get quiz with questions (correct answers hidden).

**Auth:** JWT

---

### POST `/quizzes/:id/submit`
Submit quiz answers for auto-grading. Updates user points and leaderboard.

**Auth:** JWT

**Body:**
```json
{
  "answers": [
    { "questionId": "q1_id", "selectedAnswer": "A" },
    { "questionId": "q2_id", "selectedAnswer": "C" }
  ],
  "timeTakenSeconds": 450
}
```

**Response:**
```json
{
  "success": true,
  "attempt": {
    "score": 4,
    "totalQuestions": 5,
    "totalPoints": 40,
    "maxPoints": 50,
    "percentage": 80,
    "passed": true,
    "answers": [{ "questionId": "...", "selectedAnswer": "A", "correctAnswer": "A", "isCorrect": true, "pointsEarned": 10 }]
  }
}
```

---

### POST `/quizzes`
Create a quiz. **Role:** `teacher`, `school_admin`, `super_admin`

**Body:**
```json
{
  "title": "Quiz Title",
  "courseId": "...",
  "schoolId": "...",
  "duration": 15,
  "questions": [{
    "question": "What is HTML?",
    "options": [
      { "key": "A", "text": "Hyper Text Markup Language" },
      { "key": "B", "text": "..." },
      { "key": "C", "text": "..." },
      { "key": "D", "text": "..." }
    ],
    "correctAnswer": "A",
    "explanation": "HTML stands for...",
    "points": 10
  }]
}
```

---

### PUT `/quizzes/:id`
Update a quiz. **Role:** `teacher`, `school_admin`, `super_admin`

---

### DELETE `/quizzes/:id`
Delete a quiz and all its attempts. **Role:** `teacher`, `school_admin`, `super_admin`

---

### GET `/quizzes/:id/attempts`
View all student attempts for a quiz. **Role:** `teacher`, `school_admin`, `super_admin`

---

### POST `/quizzes/add-points`
Teacher manually adds points to a student. **Role:** `teacher`, `school_admin`, `super_admin`

**Body:**
```json
{ "studentId": "...", "courseId": "...", "points": 20, "reason": "Project submission" }
```

---

## Leaderboard

### GET `/leaderboard/:courseId`
Get paginated leaderboard for a course. Includes current user's rank.

**Auth:** JWT | **Query:** `?page=1&limit=20`

**Response:**
```json
{
  "entries": [{ "userId": "...", "name": "Priya", "points": 120, "rank": 1 }],
  "total": 50,
  "page": 1,
  "currentUserRank": { "rank": 5, "points": 60 }
}
```

---

### GET `/leaderboard/my-ranks`
Get current user's rank across all enrolled courses.

**Auth:** JWT

---

## Mentors

### GET `/mentors`
List available mentors. **Query:** `?skill=React`

**Auth:** JWT

---

### GET `/mentors/:id`
Get mentor profile with available slots.

---

### GET `/mentors/bookings/my`
Get current student's mentor booking history.

**Auth:** JWT

---

### POST `/mentors`
Create a mentor profile. **Role:** `school_admin`, `super_admin`

---

### PUT `/mentors/:id`
Update mentor profile. **Role:** `mentor`, `school_admin`, `super_admin`

---

### DELETE `/mentors/:id`
Delete mentor. **Role:** `school_admin`, `super_admin`

---

### POST `/mentors/:id/review`
Student reviews mentor after completed session.

**Auth:** JWT

**Body:**
```json
{ "bookingId": "...", "rating": 5, "review": "Great session!" }
```

---

## Payments (Razorpay)

### POST `/payments/create-order`
Create a Razorpay order for ₹50 mentor session.

**Auth:** JWT

**Body:**
```json
{
  "mentorId": "...",
  "slot": { "date": "2025-12-25", "time": "02:00 PM" }
}
```

**Response:**
```json
{
  "order": { "id": "order_xyz", "amount": 5000, "currency": "INR" },
  "bookingId": "...",
  "keyId": "rzp_test_xxx"
}
```

---

### POST `/payments/verify`
Verify Razorpay payment signature and confirm booking.

**Auth:** JWT

**Body:**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_xyz",
  "razorpay_signature": "sig_xyz",
  "bookingId": "..."
}
```

---

### POST `/payments/webhook`
Razorpay webhook endpoint. **No auth** — uses webhook secret for verification.

---

## Attendance

### POST `/attendance`
Mark attendance when student opens a lecture.

**Auth:** JWT

**Body:**
```json
{ "courseId": "...", "lectureId": "...", "watchedDurationSeconds": 1500 }
```

---

### GET `/attendance/my`
Get student's attendance records. **Query:** `?courseId=xxx`

**Auth:** JWT

**Response:**
```json
{
  "attendance": [...],
  "summary": [{ "courseId": "...", "present": 3, "total": 5, "percentage": 60 }]
}
```

---

### GET `/attendance/course/:courseId`
Teacher views all students' attendance. **Role:** `teacher`, `school_admin`, `super_admin`

---

## Enrollments

### POST `/enrollments`
Student enrolls in a course.

**Auth:** JWT

**Body:**
```json
{ "courseId": "..." }
```

---

### GET `/enrollments/my`
Get student's enrolled courses with progress.

**Auth:** JWT

---

### GET `/enrollments/course/:courseId`
Teacher views enrolled students for a course. **Role:** `teacher`, `school_admin`, `super_admin`

---

### PUT `/enrollments/:courseId/progress`
Update lecture progress for an enrollment.

**Auth:** JWT

**Body:**
```json
{ "lectureId": "..." }
```

---

### DELETE `/enrollments/:courseId`
Student unenrolls from a course.

**Auth:** JWT

---

## Announcements

### GET `/announcements`
List announcements (school-scoped for students). **Query:** `?type=quiz&page=1&limit=15`

**Auth:** JWT

---

### GET `/announcements/:id`
Get single announcement.

---

### POST `/announcements`
Create an announcement. **Role:** `teacher`, `school_admin`, `super_admin`

**Body:**
```json
{
  "title": "New Quiz Available!",
  "body": "Test your knowledge...",
  "type": "quiz",
  "schoolId": "...",
  "courseId": "..."
}
```

---

### PUT `/announcements/:id`
Update an announcement. **Role:** `teacher`, `school_admin`, `super_admin`

---

### DELETE `/announcements/:id`
Delete an announcement. **Role:** `school_admin`, `super_admin`

---

## User Management (Admin)

### GET `/users`
List all users (paginated, filterable). **Role:** `school_admin`, `super_admin`

**Query:** `?role=student&schoolId=xxx&search=priya&page=1&limit=20&isActive=true`

---

### GET `/users/:id`
Get user detail. **Role:** `school_admin`, `super_admin`

---

### GET `/users/:id/stats`
Get user statistics (enrollments, quiz performance, attendance). **Role:** `school_admin`, `super_admin`

---

### PUT `/users/:id/role`
Change user role. **Role:** `super_admin`

**Body:**
```json
{ "role": "teacher" }
```

---

### PUT `/users/:id/deactivate`
Deactivate a user account. **Role:** `school_admin`, `super_admin`

---

### PUT `/users/:id/activate`
Reactivate a user account. **Role:** `school_admin`, `super_admin`

---

## File Uploads (Cloudinary)

### POST `/upload/image`
Upload an image (avatar, thumbnail). **Auth:** JWT

**Content-Type:** `multipart/form-data` | **Field:** `file`

---

### POST `/upload/video`
Upload a recorded lecture video. **Role:** `teacher`, `school_admin`, `super_admin`

**Content-Type:** `multipart/form-data` | **Field:** `file` | **Max:** 500MB

---

### POST `/upload/document`
Upload PDF/doc/zip file. **Role:** `teacher`, `school_admin`, `super_admin`

**Content-Type:** `multipart/form-data` | **Field:** `file` | **Max:** 50MB

---

## Health Check

### GET `/health`
```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z", "env": "development" }
```
