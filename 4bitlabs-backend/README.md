# 4Bit Labs Backend

Production-ready Node.js + Express.js backend for the **4Bit Labs** EdTech mobile application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | Firebase Admin SDK + JWT |
| Real-time | Socket.IO |
| Payments | Razorpay |
| File Uploads | Cloudinary (via Multer) |
| Push Notifications | Firebase Cloud Messaging (FCM) |

## Quick Start

### 1. Prerequisites

- Node.js v18+ installed
- MongoDB Atlas account (free tier works)
- Firebase project with Auth enabled
- Razorpay test account
- Cloudinary account (free tier)

### 2. Install Dependencies

```bash
cd 4bitlabs-backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- **MONGO_URI**: MongoDB Atlas connection string
- **JWT_SECRET**: A random 32+ character secret key
- **FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY**: From Firebase Admin SDK service account
- **RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET**: From Razorpay dashboard
- **CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET**: From Cloudinary dashboard

### 4. Seed the Database (Optional)

```bash
node src/utils/seeder.js          # Seed sample data
node src/utils/seeder.js --clear  # Clear all data
node src/utils/seeder.js --reset  # Clear + re-seed
```

### 5. Start the Server

```bash
npm run dev    # Development (with nodemon auto-reload)
npm start      # Production
```

Server runs at `http://localhost:5000`. Health check: `GET /health`

## Project Structure

```
4bitlabs-backend/
├── server.js                    → Entry point
├── .env                         → Environment variables
├── package.json
└── src/
    ├── config/
    │   ├── database.js          → MongoDB Atlas connection
    │   ├── firebase-admin.js    → Firebase Admin SDK init
    │   └── cloudinary.js        → Cloudinary upload config
    ├── models/
    │   ├── User.js              → Users (students, mentors, admins)
    │   ├── School.js            → Schools
    │   ├── Course.js            → Courses with nested lectures
    │   ├── Enrollment.js        → Student-course enrollment tracking
    │   ├── Quiz.js              → Quizzes (MCQ)
    │   ├── QuizAttempt.js       → Quiz submission records
    │   ├── Leaderboard.js       → Course leaderboards
    │   ├── Mentor.js            → Mentor profiles
    │   ├── MentorBooking.js     → Paid booking records
    │   ├── Attendance.js        → Lecture attendance
    │   └── Announcement.js      → School/course announcements
    ├── controllers/
    │   ├── authController.js
    │   ├── courseController.js
    │   ├── quizController.js
    │   ├── leaderboardController.js
    │   ├── mentorController.js
    │   ├── paymentController.js
    │   ├── attendanceController.js
    │   ├── schoolController.js
    │   ├── enrollmentController.js
    │   ├── announcementController.js
    │   └── userController.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── course.routes.js
    │   ├── quiz.routes.js
    │   ├── leaderboard.routes.js
    │   ├── mentor.routes.js
    │   ├── payment.routes.js
    │   ├── attendance.routes.js
    │   ├── school.routes.js
    │   ├── upload.routes.js
    │   ├── enrollment.routes.js
    │   ├── announcement.routes.js
    │   └── user.routes.js
    ├── middleware/
    │   ├── authMiddleware.js     → JWT verify + optional auth
    │   ├── roleMiddleware.js     → Role-based access control
    │   ├── errorMiddleware.js    → Global error handler
    │   └── validators.js         → express-validator rules
    ├── services/
    │   ├── paymentService.js     → Razorpay operations
    │   └── notificationService.js→ FCM push notifications
    ├── sockets/
    │   ├── index.js              → Socket.IO event registry
    │   ├── leaderboardSocket.js  → Real-time leaderboard
    │   └── chatSocket.js         → Real-time chat
    └── utils/
        ├── responseHelper.js     → Standardized API responses
        └── seeder.js             → Database seeder
```

## Authentication Flow

```
Mobile App                     Backend                    Firebase
    │                             │                          │
    ├─── signIn(email, pw) ──────>│                          │
    │                             │                          │
    │<─── Firebase ID Token ──────┤                          │
    │                             │                          │
    ├─── POST /auth/verify-token ─>│                          │
    │    { idToken }              │── verifyIdToken(token) ──>│
    │                             │<── decoded user ──────────┤
    │                             │── find/create in MongoDB  │
    │<── { jwt, user } ──────────┤                          │
    │                             │                          │
    ├─── GET /courses ────────────>│                          │
    │    Authorization: Bearer jwt│── verify JWT ─────────── │
    │<── { courses } ─────────────┤                          │
```

## Connecting Frontend

In your React Native app, update `src/services/api.js`:

```javascript
// Replace with your machine's local IP (not 'localhost')
// Find IP: Windows → ipconfig | Mac → ifconfig
const API_BASE_URL = 'http://192.168.x.x:5000/api/v1';
```

Both your phone (Expo Go) and laptop must be on the **same WiFi network**.

## Roles & Permissions

| Role | Access |
|------|--------|
| `student` | View courses, take quizzes, view leaderboard, book mentors, chat |
| `mentor` | Update own profile, view bookings |
| `teacher` | Create/edit courses, create quizzes, add points, view attendance |
| `school_admin` | All teacher permissions + manage school, manage users |
| `super_admin` | Full platform access across all schools |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:leaderboard(courseId)` | Client → Server | Join a course leaderboard room |
| `leave:leaderboard(courseId)` | Client → Server | Leave leaderboard room |
| `leaderboard:update` | Server → Client | Real-time leaderboard entry update |
| `join:chat(courseId)` | Client → Server | Join course chat room |
| `leave:chat(courseId)` | Client → Server | Leave chat room |
| `message:send({ courseId, message })` | Client → Server | Send chat message |
| `message:receive(message)` | Server → Client | Receive chat message |

## Scripts

```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Production start
npm test          # Run tests (placeholder)
```
