__4BIT LABS__

Full\-Stack Mobile Application

*Master Project Plan & Execution Guide*

__Tech Stack__

React Native \+ Node\.js

__Backend__

Express\.js \+ Firebase

__Type__

EdTech ┬╖ Multi\-School ┬╖ SaaS

__Version__

v1\.0 ΓÇö 2025

# __1\. Project Overview & Vision__

4Bit Labs is a full\-stack EdTech mobile application designed to serve multiple schools, thousands of students, and an ecosystem of mentors, courses, quizzes, and gamified learning\. The platform is inspired by the Physics Wallah model ΓÇö clean, fast, content\-first ΓÇö with a bold red and white brand identity\.

The application ships as a React Native \(Expo Go\) mobile app with a Node\.js \+ Express\.js backend, Firebase for authentication and real\-time features, and Razorpay for payments\. It is architected to be modular and horizontally scalable from day one\.

## __1\.1  Core Goals__

- Serve multiple schools and their students under one platform
- Deliver recorded courses, live leaderboards, and quiz\-based gamification
- Enable free and paid \(Γé╣50\) 1\-on\-1 mentor sessions
- Provide a Project Build section with guided project tracks
- Integrate a merchandise/store page linked to an external website
- Support real\-time chat and leaderboard via Socket\.IO / Firebase
- Send push notifications via Firebase Cloud Messaging \(FCM\)

## __1\.2  Design Philosophy__

- Clean, card\-based UI similar to Physics Wallah
- Primary palette: Red \(\#C0392B\) \+ White; minimal Blue/Black
- Consistent spacing, rounded corners \(12ΓÇô16px radius\), and subtle shadows
- Mobile\-first ΓÇö optimised for Expo Go on Android and iOS

## __1\.3  Key Stakeholders__

__Students__

Core end users ΓÇö consume content, take quizzes, book mentors

__Mentors__

Upload sessions, accept bookings, receive payments

__School Admins__

Manage schools, courses, announcements, attendance

__Super Admin__

Platform\-level management, analytics, user approvals

# __2\. System Architecture__

## __2\.1  High\-Level Architecture Diagram \(Text\)__

__The system follows a three\-tier architecture:__

__TIER 1 ΓÇö Mobile Client \(React Native / Expo Go\)__

Γû╕  Screens, navigation, and UI components

Γû╕  Axios for REST API calls to Node\.js backend

Γû╕  Firebase SDK for Auth, Firestore real\-time, FCM notifications

Γû╕  Socket\.IO client for live leaderboard and chat updates

Γû╕  Razorpay React Native SDK for payment checkout

__TIER 2 ΓÇö Application Server \(Node\.js \+ Express\.js\)__

Γû╕  RESTful API endpoints ΓÇö versioned under /api/v1/

Γû╕  JWT middleware for protected routes

Γû╕  Role\-based access control \(Student / Mentor / School Admin / Super Admin\)

Γû╕  Socket\.IO server for real\-time events

Γû╕  Firebase Admin SDK for FCM push notifications

Γû╕  Razorpay server\-side payment order creation and verification

Γû╕  MongoDB via Mongoose for primary persistent data

__TIER 3 ΓÇö Cloud Services__

Γû╕  Firebase Authentication ΓÇö email/password \+ phone OTP

Γû╕  Firestore ΓÇö real\-time chat messages and leaderboard deltas

Γû╕  Firebase Cloud Messaging ΓÇö push notifications

Γû╕  MongoDB Atlas ΓÇö primary database \(users, courses, quizzes, bookings\)

Γû╕  Cloudinary / Firebase Storage ΓÇö video thumbnails and profile images

Γû╕  Razorpay ΓÇö payment gateway for mentor bookings

## __2\.2  Communication Flow__

1. Student opens the app ΓåÆ Expo Go loads React Native bundle
2. Login screen calls Firebase Auth ΓåÆ gets ID token
3. ID token sent to Node\.js backend ΓåÆ backend verifies with Firebase Admin SDK
4. Backend issues a JWT to the client for subsequent API calls
5. Protected screens call Node\.js REST APIs with JWT in Authorization header
6. Real\-time data \(chat, leaderboard\) comes via Socket\.IO or Firestore listener
7. FCM push notifications sent from backend via Firebase Admin SDK

## __2\.3  Database Schema Summary__

__Collection__

__Key Fields__

__Notes__

User

uid, name, email, phone, role, schoolId, courseIds, points

Firebase UID as primary key

School

schoolId, name, address, adminId, courses\[ \]

One admin per school

Course

courseId, schoolId, title, lectures\[ \], leaderboard

Lectures are nested objects

Quiz

quizId, courseId, questions\[ \], duration, totalMarks

MCQ format

QuizAttempt

attemptId, userId, quizId, score, completedAt

One attempt per user per quiz

Leaderboard

leaderboardId, courseId, entries\[ \{userId, points, rank\} \]

Updated on quiz submission

MentorBooking

bookingId, studentId, mentorId, slot, razorpayOrderId, status

Paid sessions via Razorpay

Attendance

attendanceId, userId, courseId, date, status

Tracked per lecture

# __3\. Complete Folder Structure__

## __3\.1  Frontend ΓÇö React Native \(Expo\)__

All frontend code lives inside the src/ directory of your existing Expo project\. Do not touch the root expo config files\.

__4bitlabs\-app/__

Γö£ΓöÇΓöÇ app\.json                    ΓåÉ Expo config \(already exists\)

Γö£ΓöÇΓöÇ App\.js                      ΓåÉ Entry point

Γö£ΓöÇΓöÇ babel\.config\.js

Γö£ΓöÇΓöÇ package\.json

ΓööΓöÇΓöÇ src/

    Γö£ΓöÇΓöÇ components/             ΓåÉ Reusable UI components

    Γöé   Γö£ΓöÇΓöÇ Card\.jsx

    Γöé   Γö£ΓöÇΓöÇ Button\.jsx

    Γöé   Γö£ΓöÇΓöÇ InputField\.jsx

    Γöé   Γö£ΓöÇΓöÇ SectionHeader\.jsx

    Γöé   Γö£ΓöÇΓöÇ Avatar\.jsx

    Γöé   Γö£ΓöÇΓöÇ Badge\.jsx

    Γöé   ΓööΓöÇΓöÇ LoadingSpinner\.jsx

    Γö£ΓöÇΓöÇ screens/                ΓåÉ All app screens

    Γöé   Γö£ΓöÇΓöÇ auth/

    Γöé   Γöé   Γö£ΓöÇΓöÇ LoginScreen\.jsx

    Γöé   Γöé   Γö£ΓöÇΓöÇ RegisterScreen\.jsx

    Γöé   Γöé   ΓööΓöÇΓöÇ OtpScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ main/

    Γöé   Γöé   ΓööΓöÇΓöÇ HomeScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ course/

    Γöé   Γöé   Γö£ΓöÇΓöÇ CourseListScreen\.jsx

    Γöé   Γöé   ΓööΓöÇΓöÇ CourseDetailScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ quiz/

    Γöé   Γöé   Γö£ΓöÇΓöÇ QuizListScreen\.jsx

    Γöé   Γöé   Γö£ΓöÇΓöÇ QuizScreen\.jsx

    Γöé   Γöé   ΓööΓöÇΓöÇ ResultScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ leaderboard/

    Γöé   Γöé   ΓööΓöÇΓöÇ LeaderboardScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ mentor/

    Γöé   Γöé   ΓööΓöÇΓöÇ MentorScreen\.jsx

    Γöé   Γö£ΓöÇΓöÇ build/

    Γöé   Γöé   ΓööΓöÇΓöÇ BuildScreen\.jsx

    Γöé   ΓööΓöÇΓöÇ store/

    Γöé       ΓööΓöÇΓöÇ StoreScreen\.jsx

    Γö£ΓöÇΓöÇ navigation/

    Γöé   Γö£ΓöÇΓöÇ AppNavigator\.jsx    ΓåÉ Root switch \(auth vs main\)

    Γöé   Γö£ΓöÇΓöÇ AuthNavigator\.jsx   ΓåÉ Stack for login/register

    Γöé   ΓööΓöÇΓöÇ BottomTabs\.jsx      ΓåÉ Main tab bar

    Γö£ΓöÇΓöÇ services/               ΓåÉ All API/Firebase calls

    Γöé   Γö£ΓöÇΓöÇ api\.js              ΓåÉ Axios instance

    Γöé   Γö£ΓöÇΓöÇ authService\.js

    Γöé   Γö£ΓöÇΓöÇ courseService\.js

    Γöé   Γö£ΓöÇΓöÇ quizService\.js

    Γöé   Γö£ΓöÇΓöÇ leaderboardService\.js

    Γöé   Γö£ΓöÇΓöÇ mentorService\.js

    Γöé   ΓööΓöÇΓöÇ notificationService\.js

    Γö£ΓöÇΓöÇ context/

    Γöé   Γö£ΓöÇΓöÇ AuthContext\.jsx

    Γöé   Γö£ΓöÇΓöÇ CourseContext\.jsx

    Γöé   ΓööΓöÇΓöÇ SocketContext\.jsx

    Γö£ΓöÇΓöÇ hooks/

    Γöé   Γö£ΓöÇΓöÇ useAuth\.js

    Γöé   Γö£ΓöÇΓöÇ useLeaderboard\.js

    Γöé   ΓööΓöÇΓöÇ useSocket\.js

    Γö£ΓöÇΓöÇ utils/

    Γöé   Γö£ΓöÇΓöÇ formatters\.js

    Γöé   Γö£ΓöÇΓöÇ validators\.js

    Γöé   ΓööΓöÇΓöÇ constants\.js

    ΓööΓöÇΓöÇ config/

        Γö£ΓöÇΓöÇ firebase\.js         ΓåÉ Firebase SDK init

        ΓööΓöÇΓöÇ theme\.js            ΓåÉ Colors, fonts, spacing

## __3\.2  Backend ΓÇö Node\.js \+ Express\.js__

__4bitlabs\-backend/__

Γö£ΓöÇΓöÇ server\.js                   ΓåÉ Entry point

Γö£ΓöÇΓöÇ \.env                        ΓåÉ Environment variables

Γö£ΓöÇΓöÇ package\.json

ΓööΓöÇΓöÇ src/

    Γö£ΓöÇΓöÇ config/

    Γöé   Γö£ΓöÇΓöÇ database\.js         ΓåÉ MongoDB connection

    Γöé   ΓööΓöÇΓöÇ firebase\-admin\.js   ΓåÉ Firebase Admin SDK init

    Γö£ΓöÇΓöÇ models/

    Γöé   Γö£ΓöÇΓöÇ User\.js

    Γöé   Γö£ΓöÇΓöÇ School\.js

    Γöé   Γö£ΓöÇΓöÇ Course\.js

    Γöé   Γö£ΓöÇΓöÇ Quiz\.js

    Γöé   Γö£ΓöÇΓöÇ QuizAttempt\.js

    Γöé   Γö£ΓöÇΓöÇ Leaderboard\.js

    Γöé   Γö£ΓöÇΓöÇ MentorBooking\.js

    Γöé   ΓööΓöÇΓöÇ Attendance\.js

    Γö£ΓöÇΓöÇ controllers/

    Γöé   Γö£ΓöÇΓöÇ authController\.js

    Γöé   Γö£ΓöÇΓöÇ courseController\.js

    Γöé   Γö£ΓöÇΓöÇ quizController\.js

    Γöé   Γö£ΓöÇΓöÇ leaderboardController\.js

    Γöé   Γö£ΓöÇΓöÇ mentorController\.js

    Γöé   ΓööΓöÇΓöÇ attendanceController\.js

    Γö£ΓöÇΓöÇ routes/

    Γöé   Γö£ΓöÇΓöÇ auth\.routes\.js

    Γöé   Γö£ΓöÇΓöÇ course\.routes\.js

    Γöé   Γö£ΓöÇΓöÇ quiz\.routes\.js

    Γöé   Γö£ΓöÇΓöÇ leaderboard\.routes\.js

    Γöé   Γö£ΓöÇΓöÇ mentor\.routes\.js

    Γöé   ΓööΓöÇΓöÇ payment\.routes\.js

    Γö£ΓöÇΓöÇ middleware/

    Γöé   Γö£ΓöÇΓöÇ authMiddleware\.js   ΓåÉ JWT verify

    Γöé   ΓööΓöÇΓöÇ roleMiddleware\.js   ΓåÉ Role\-based guard

    Γö£ΓöÇΓöÇ services/

    Γöé   Γö£ΓöÇΓöÇ paymentService\.js   ΓåÉ Razorpay logic

    Γöé   ΓööΓöÇΓöÇ notificationService\.js ΓåÉ FCM push

    Γö£ΓöÇΓöÇ sockets/

    Γöé   Γö£ΓöÇΓöÇ leaderboardSocket\.js

    Γöé   ΓööΓöÇΓöÇ chatSocket\.js

    ΓööΓöÇΓöÇ utils/

        Γö£ΓöÇΓöÇ responseHelper\.js

        ΓööΓöÇΓöÇ errorHandler\.js

# __4\. Phased Execution Plan__

The project is broken into 6 phases\. Each phase builds on the previous\. Complete each phase fully before moving to the next\.

## __PHASE 0 ΓÇö Project Bootstrap & Configuration__

__Duration: 1ΓÇô2 Days__

__\#__

__Area__

__Task__

__Priority__

1

Firebase

Create Firebase project, enable Email/Password \+ Phone Auth

__Critical__

2

Firebase

Enable Firestore database in test mode

__Critical__

3

Firebase

Enable Firebase Cloud Messaging

__Critical__

4

Firebase

Download google\-services\.json \(Android\) and GoogleService\-Info\.plist \(iOS\)

__Critical__

5

Expo App

Add Firebase SDK: expo install firebase

__Critical__

6

Expo App

Create src/config/firebase\.js with Firebase init code

__Critical__

7

Expo App

Create src/config/theme\.js with color palette, fonts, spacing constants

__High__

8

Backend

Create 4bitlabs\-backend/ folder, run npm init \-y

__Critical__

9

Backend

Install core packages: express mongoose dotenv cors jsonwebtoken firebase\-admin

__Critical__

10

Backend

Create \.env file with MONGO\_URI, JWT\_SECRET, FIREBASE credentials, RAZORPAY keys

__Critical__

11

Backend

Create src/config/database\.js ΓÇö MongoDB Atlas connection

__Critical__

12

Backend

Create src/config/firebase\-admin\.js ΓÇö Firebase Admin SDK init

__Critical__

13

Backend

Create server\.js with Express setup, CORS, and Socket\.IO attach

__Critical__

14

MongoDB

Create MongoDB Atlas cluster, whitelist all IPs \(0\.0\.0\.0/0\) for dev

__Critical__

15

Razorpay

Create Razorpay Test account, copy key\_id and key\_secret to \.env

__High__

## __PHASE 1 ΓÇö Authentication System__

__Duration: 2ΓÇô3 Days__

__\#__

__Area__

__Task__

__Priority__

1

Frontend

Build LoginScreen\.jsx ΓÇö email/phone field, password, submit button \(red theme\)

__Critical__

2

Frontend

Build RegisterScreen\.jsx ΓÇö name, email, phone, school dropdown, course multi\-select

__Critical__

3

Frontend

Build OtpScreen\.jsx ΓÇö 6\-digit OTP input for phone verification

__High__

4

Frontend

Create AuthContext\.jsx ΓÇö currentUser, login\(\), logout\(\), register\(\) methods

__Critical__

5

Frontend

Create src/services/authService\.js ΓÇö wrap Firebase signIn, createUser, sendOTP

__Critical__

6

Frontend

Create AppNavigator\.jsx ΓÇö check auth state, route to AuthNavigator or BottomTabs

__Critical__

7

Frontend

Create AuthNavigator\.jsx ΓÇö Stack navigator for Login ΓåÆ Register ΓåÆ OTP

__Critical__

8

Backend

Create POST /api/v1/auth/verify\-token ΓÇö verify Firebase ID token, issue JWT

__Critical__

9

Backend

Create POST /api/v1/auth/register ΓÇö save user to MongoDB with role=student

__Critical__

10

Backend

Create authMiddleware\.js ΓÇö decode JWT, attach req\.user to all protected routes

__Critical__

11

Backend

Create roleMiddleware\.js ΓÇö guard routes by role: student, mentor, admin, superadmin

__High__

12

Backend

Create User Mongoose model with all fields including schoolId, courseIds, points

__Critical__

13

Testing

Test login flow end\-to\-end: Firebase ΓåÆ backend verify ΓåÆ JWT returned to app

__Critical__

## __PHASE 2 ΓÇö Core Screens & Navigation__

__Duration: 3ΓÇô4 Days__

__\#__

__Area__

__Task__

__Priority__

1

Components

Build Card\.jsx ΓÇö shadow, rounded corners, red accent stripe, title \+ subtitle

__Critical__

2

Components

Build Button\.jsx ΓÇö primary \(red fill\), secondary \(white \+ red border\), disabled states

__Critical__

3

Components

Build InputField\.jsx ΓÇö label, red focus border, error message slot

__Critical__

4

Components

Build SectionHeader\.jsx ΓÇö title on left, optional 'See All' link on right

__Critical__

5

Components

Build Avatar\.jsx ΓÇö circular image with fallback initials

__High__

6

Navigation

Build BottomTabs\.jsx ΓÇö Home, Courses, Leaderboard, Mentor, More \(5 tabs\)

__Critical__

7

Screen

Build HomeScreen\.jsx ΓÇö greeting card, attendance widget, announcements, quick\-action cards

__Critical__

8

Screen

Build CourseListScreen\.jsx ΓÇö filtered by enrolled courses, card grid

__Critical__

9

Screen

Build CourseDetailScreen\.jsx ΓÇö progress bar, lecture list, leaderboard tab, build tab

__High__

10

Screen

Build BuildScreen\.jsx ΓÇö project track cards with step\-by\-step guides \(dummy data\)

__High__

11

Screen

Build StoreScreen\.jsx ΓÇö product cards, 'Visit Store' button using Linking\.openURL\(\)

__High__

12

Backend

Create GET /api/v1/courses ΓÇö list courses for a school

__Critical__

13

Backend

Create GET /api/v1/courses/:id ΓÇö single course with lectures

__Critical__

14

Backend

Create GET /api/v1/schools ΓÇö list all schools \(for registration dropdown\)

__High__

15

Backend

Create Course and School Mongoose models

__Critical__

## __PHASE 3 ΓÇö Quiz System & Leaderboard__

__Duration: 3ΓÇô4 Days__

__\#__

__Area__

__Task__

__Priority__

1

Screen

Build QuizListScreen\.jsx ΓÇö list quizzes for a course with attempt status badge

__Critical__

2

Screen

Build QuizScreen\.jsx ΓÇö MCQ question cards, option selection, countdown timer \(red\), prev/next nav

__Critical__

3

Screen

Build ResultScreen\.jsx ΓÇö score card, correct/wrong breakdown, points earned, CTA to leaderboard

__Critical__

4

Screen

Build LeaderboardScreen\.jsx ΓÇö ranked list, current user highlighted in red, real\-time updates

__Critical__

5

Backend

Create Quiz and QuizAttempt Mongoose models

__Critical__

6

Backend

Create GET /api/v1/quizzes?courseId=x ΓÇö list quizzes

__Critical__

7

Backend

Create GET /api/v1/quizzes/:id ΓÇö quiz with questions \(shuffle options\)

__Critical__

8

Backend

Create POST /api/v1/quiz\-attempts ΓÇö submit answers, auto\-grade, update points, update leaderboard

__Critical__

9

Backend

Create GET /api/v1/leaderboard/:courseId ΓÇö paginated ranked list

__Critical__

10

Backend

Create Leaderboard Mongoose model ΓÇö sorted entries with rank

__Critical__

11

Sockets

Create leaderboardSocket\.js ΓÇö emit leaderboard:update event when quiz submitted

__High__

12

Frontend

Create useLeaderboard\.js hook ΓÇö subscribe to Socket\.IO leaderboard:update event

__High__

13

Frontend

Create quizService\.js ΓÇö getQuizzes\(\), getQuiz\(\), submitQuiz\(\) API wrappers

__Critical__

14

Testing

Test: submit quiz ΓåÆ score computed ΓåÆ points added ΓåÆ leaderboard updates live

__Critical__

## __PHASE 4 ΓÇö Mentor System & Payments__

__Duration: 2ΓÇô3 Days__

__\#__

__Area__

__Task__

__Priority__

1

Screen

Build MentorScreen\.jsx ΓÇö two tabs: Free Chat | Paid 1\-on\-1

__Critical__

2

Screen

Free Chat tab ΓÇö real\-time chat UI using Firestore collection per course

__High__

3

Screen

Paid tab ΓÇö mentor cards with photo, bio, rating, available slots, Book \(Γé╣50\) button

__Critical__

4

Screen

Booking flow ΓÇö slot picker, Razorpay payment sheet, confirmation screen

__Critical__

5

Backend

Create MentorBooking Mongoose model

__Critical__

6

Backend

Create POST /api/v1/payments/create\-order ΓÇö Razorpay order creation \(Γé╣50\)

__Critical__

7

Backend

Create POST /api/v1/payments/verify ΓÇö Razorpay signature verification, save booking

__Critical__

8

Backend

Create GET /api/v1/mentors ΓÇö list available mentors for a course

__Critical__

9

Backend

Create GET /api/v1/mentor\-bookings/my ΓÇö student's booking history

__High__

10

Sockets

Create chatSocket\.js ΓÇö join/leave room, message:send, message:receive events

__High__

11

Frontend

Wire Razorpay RN SDK ΓÇö useRazorpay hook, open checkout on Book tap

__Critical__

12

Frontend

Create mentorService\.js ΓÇö getMentors\(\), createOrder\(\), verifyPayment\(\)

__Critical__

13

Firebase

Create Firestore collection: chats/\{courseId\}/messages ΓÇö real\-time chat listener

__High__

14

Backend

Send FCM push to mentor when booking is confirmed

__High__

## __PHASE 5 ΓÇö Notifications, Polish & Production Prep__

__Duration: 2ΓÇô3 Days__

__\#__

__Area__

__Task__

__Priority__

1

Notifications

Register FCM device token on app launch, save to User model in backend

__Critical__

2

Notifications

Backend notificationService\.js ΓÇö sendToUser\(uid, title, body\), sendToTopic\(topic\)

__High__

3

Notifications

Trigger notifications: quiz posted, booking confirmed, new announcement

__High__

4

Frontend

Add notification permission request on first launch using expo\-notifications

__Critical__

5

Attendance

Build attendance tracking ΓÇö mark present when lecture video is opened

__High__

6

Attendance

Backend: POST /api/v1/attendance and GET /api/v1/attendance/my

__High__

7

UI Polish

Add loading skeletons to all list screens

__High__

8

UI Polish

Add pull\-to\-refresh on Home, Course, Leaderboard screens

__High__

9

UI Polish

Add empty state illustrations for courses, quizzes, leaderboard

__Medium__

10

UI Polish

Ensure consistent red/white theme across all screens ΓÇö no stray blues

__Critical__

11

Error

Add global error boundary in App\.js

__High__

12

Error

Backend: unified error handler middleware in utils/errorHandler\.js

__High__

13

Security

Rate limiting on auth routes \(express\-rate\-limit\)

__High__

14

Security

Helmet\.js on backend for HTTP security headers

__High__

15

Security

Input validation using express\-validator on all POST routes

__High__

16

Perf

Add API response caching for course list \(node\-cache, 5 min TTL\)

__Medium__

17

Perf

Lazy load screens in navigation \(React\.lazy equivalent for RN\)

__Medium__

# __5\. Complete Dependency Lists__

## __5\.1  Frontend ΓÇö package\.json dependencies__

__Run inside your existing Expo project folder:__

__Expo & React Native Core__

Γû╕  expo ΓÇö already installed

Γû╕  react\-native ΓÇö already installed

Γû╕  expo\-status\-bar

Γû╕  expo\-notifications ΓÇö FCM push notifications

Γû╕  expo\-linking ΓÇö for opening external Store URL

Γû╕  expo\-image\-picker ΓÇö profile picture upload

__Navigation__

Γû╕  @react\-navigation/native

Γû╕  @react\-navigation/stack

Γû╕  @react\-navigation/bottom\-tabs

Γû╕  react\-native\-screens

Γû╕  react\-native\-safe\-area\-context

Γû╕  @react\-navigation/native\-stack

__Firebase__

Γû╕  firebase ΓÇö client SDK \(Auth, Firestore, FCM\)

Γû╕  @react\-native\-firebase/app ΓÇö native Firebase \(optional, for deeper FCM\)

__Networking & State__

Γû╕  axios ΓÇö HTTP client for backend API calls

Γû╕  socket\.io\-client ΓÇö real\-time leaderboard and chat

__UI & Animations__

Γû╕  react\-native\-vector\-icons ΓÇö icons throughout the app

Γû╕  react\-native\-linear\-gradient ΓÇö card gradient backgrounds

Γû╕  react\-native\-progress ΓÇö progress bars for courses

Γû╕  react\-native\-modal ΓÇö bottom sheet modals

Γû╕  react\-native\-toast\-message ΓÇö in\-app toasts

Γû╕  lottie\-react\-native ΓÇö animations for results/empty states

__Payments__

Γû╕  react\-native\-razorpay ΓÇö Razorpay checkout integration

__Video__

Γû╕  expo\-av ΓÇö video playback for recorded lectures

## __5\.2  Backend ΓÇö package\.json dependencies__

__Run inside 4bitlabs\-backend/:__

__Core Server__

Γû╕  express ΓÇö web framework

Γû╕  cors ΓÇö cross\-origin resource sharing

Γû╕  helmet ΓÇö HTTP security headers

Γû╕  dotenv ΓÇö environment variables

Γû╕  morgan ΓÇö HTTP request logging

Γû╕  express\-rate\-limit ΓÇö rate limiting for auth routes

Γû╕  express\-validator ΓÇö input validation

__Database__

Γû╕  mongoose ΓÇö MongoDB ODM

__Authentication & Security__

Γû╕  firebase\-admin ΓÇö Firebase Admin SDK \(token verify, FCM send\)

Γû╕  jsonwebtoken ΓÇö issue and verify JWTs

Γû╕  bcryptjs ΓÇö password hashing \(if storing passwords in MongoDB\)

__Real\-Time__

Γû╕  socket\.io ΓÇö WebSocket server for chat and leaderboard

__Payments__

Γû╕  razorpay ΓÇö server\-side Razorpay SDK

__Utilities__

Γû╕  node\-cache ΓÇö in\-memory API response caching

Γû╕  uuid ΓÇö generate unique IDs

Γû╕  nodemon \(dev\) ΓÇö auto\-restart on file change

# __6\. Step\-by\-Step Setup Instructions__

## __Step 1: Firebase Project Setup__

1. Go to https://console\.firebase\.google\.com and create a new project named '4BitLabs'
2. In Authentication ΓåÆ Sign\-in method: enable Email/Password and Phone
3. In Firestore Database: create a database in test mode \(us\-central1 region\)
4. In Cloud Messaging: note your Server Key
5. In Project Settings ΓåÆ General: add an Android app \(com\.fourbitlabs\.app\)
6. Download google\-services\.json and place it in your Expo project root
7. In Project Settings ΓåÆ Service Accounts: generate a new private key ΓåÆ download JSON ΓåÆ rename to firebase\-admin\-key\.json ΓåÆ place in backend root

## __Step 2: MongoDB Atlas Setup__

1. Go to https://cloud\.mongodb\.com and create a free cluster \(M0\)
2. Create a database user with readWrite permissions
3. In Network Access: add IP 0\.0\.0\.0/0 \(for development\)
4. Click Connect ΓåÆ Drivers ΓåÆ copy the connection string
5. Replace <password> with your DB user password in the string
6. Paste the string as MONGO\_URI in your backend \.env file

## __Step 3: Razorpay Setup__

1. Go to https://dashboard\.razorpay\.com and create an account
2. Switch to Test Mode
3. In API Keys: generate a new key pair
4. Copy Key ID as RAZORPAY\_KEY\_ID in \.env
5. Copy Key Secret as RAZORPAY\_KEY\_SECRET in \.env
6. Use test card 4111 1111 1111 1111 / any future date / any CVV for testing

## __Step 4: Backend Environment File__

__Create 4bitlabs\-backend/\.env with these variables:__

PORT=5000

NODE\_ENV=development

MONGO\_URI=mongodb\+srv://username:password@cluster\.mongodb\.net/4bitlabs

JWT\_SECRET=your\_super\_secret\_jwt\_key\_minimum\_32\_chars

JWT\_EXPIRES\_IN=7d

RAZORPAY\_KEY\_ID=rzp\_test\_xxxxxxxxxxxxxxxxxx

RAZORPAY\_KEY\_SECRET=your\_razorpay\_secret

FIREBASE\_PROJECT\_ID=your\-firebase\-project\-id

FIREBASE\_CLIENT\_EMAIL=firebase\-adminsdk@project\.iam\.gserviceaccount\.com

FIREBASE\_PRIVATE\_KEY="\-\-\-\-\-BEGIN PRIVATE KEY\-\-\-\-\-\\n\.\.\.\\n\-\-\-\-\-END PRIVATE KEY\-\-\-\-\-\\n"

CLIENT\_URL=http://localhost:19006

## __Step 5: Install Backend Dependencies__

Run these commands inside 4bitlabs\-backend/:

npm install express cors helmet dotenv morgan express\-rate\-limit express\-validator mongoose firebase\-admin jsonwebtoken bcryptjs socket\.io razorpay node\-cache uuid

npm install \-\-save\-dev nodemon

__Add to package\.json scripts:__

"scripts": \{

  "dev": "nodemon server\.js",

  "start": "node server\.js"

\}

## __Step 6: Install Frontend Dependencies__

Run these commands inside your Expo project root:

npx expo install expo\-notifications expo\-linking expo\-image\-picker expo\-av

npm install @react\-navigation/native @react\-navigation/stack @react\-navigation/bottom\-tabs @react\-navigation/native\-stack

npx expo install react\-native\-screens react\-native\-safe\-area\-context

npm install firebase axios socket\.io\-client

npm install react\-native\-vector\-icons react\-native\-toast\-message

npm install react\-native\-razorpay

## __Step 7: Configure Firebase in the App__

__Create src/config/firebase\.js:__

import \{ initializeApp \} from 'firebase/app';

import \{ getAuth \} from 'firebase/auth';

import \{ getFirestore \} from 'firebase/firestore';

const firebaseConfig = \{

  apiKey: 'YOUR\_API\_KEY',

  authDomain: 'YOUR\_PROJECT\.firebaseapp\.com',

  projectId: 'YOUR\_PROJECT\_ID',

  storageBucket: 'YOUR\_PROJECT\.appspot\.com',

  messagingSenderId: 'YOUR\_SENDER\_ID',

  appId: 'YOUR\_APP\_ID',

\};

const app = initializeApp\(firebaseConfig\);

export const auth = getAuth\(app\);

export const db = getFirestore\(app\);

export default app;

## __Step 8: Create Theme Config__

__Create src/config/theme\.js:__

export const COLORS = \{

  primary: '\#C0392B',

  primaryDark: '\#922B21',

  primaryLight: '\#FADBD8',

  white: '\#FFFFFF',

  background: '\#F8F9FA',

  card: '\#FFFFFF',

  text: '\#2C3E50',

  textSecondary: '\#7F8C8D',

  border: '\#E5E5E5',

\};

export const FONTS = \{ regular: 'System', medium: 'System', bold: 'System' \};

export const SPACING = \{ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 \};

export const RADIUS = \{ sm: 8, md: 12, lg: 16, xl: 24 \};

## __Step 9: Create Axios Instance__

__Create src/services/api\.js:__

import axios from 'axios';

import AsyncStorage from '@react\-native\-async\-storage/async\-storage';

const API\_BASE\_URL = 'http://YOUR\_LOCAL\_IP:5000/api/v1';

// Use your machine's local IP \(e\.g\. 192\.168\.x\.x\), not localhost

// Expo Go on a physical device cannot reach localhost

const api = axios\.create\(\{ baseURL: API\_BASE\_URL \}\);

api\.interceptors\.request\.use\(async \(config\) => \{

  const token = await AsyncStorage\.getItem\('jwt'\);

  if \(token\) config\.headers\.Authorization = \`Bearer $\{token\}\`;

  return config;

\}\);

export default api;

## __Step 10: Run Both Projects__

- Terminal 1 \(Backend\): cd 4bitlabs\-backend && npm run dev
- Terminal 2 \(Frontend\): cd your\-expo\-project && npx expo start
- Scan the QR code with the Expo Go app on your phone
- Both your phone and your laptop must be on the same WiFi network
- Replace 'localhost' in API\_BASE\_URL with your machine's local IP address

# __7\. Key Code Patterns & Implementation Notes__

## __7\.1  Authentication Flow Code Pattern__

__Frontend ΓÇö Login with Firebase \+ get JWT from backend__

// In authService\.js

import \{ signInWithEmailAndPassword \} from 'firebase/auth';

import \{ auth \} from '\.\./config/firebase';

import api from '\./api';

import AsyncStorage from '@react\-native\-async\-storage/async\-storage';

export const loginWithEmail = async \(email, password\) => \{

  const userCred = await signInWithEmailAndPassword\(auth, email, password\);

  const idToken = await userCred\.user\.getIdToken\(\);

  const res = await api\.post\('/auth/verify\-token', \{ idToken \}\);

  await AsyncStorage\.setItem\('jwt', res\.data\.token\);

  return res\.data\.user;

\};

__Backend ΓÇö Verify Firebase token and issue JWT__

// In authController\.js

const admin = require\('\.\./config/firebase\-admin'\);

const jwt = require\('jsonwebtoken'\);

const User = require\('\.\./models/User'\);

exports\.verifyToken = async \(req, res\) => \{

  const \{ idToken \} = req\.body;

  const decoded = await admin\.auth\(\)\.verifyIdToken\(idToken\);

  let user = await User\.findOne\(\{ uid: decoded\.uid \}\);

  if \(\!user\) \{ return res\.status\(404\)\.json\(\{ message: 'User not registered' \}\); \}

  const token = jwt\.sign\(\{ uid: user\.uid, role: user\.role \}, process\.env\.JWT\_SECRET, \{ expiresIn: '7d' \}\);

  res\.json\(\{ token, user \}\);

\};

## __7\.2  Quiz Submission & Leaderboard Update__

__Backend ΓÇö Auto\-grade and update leaderboard in one transaction__

// In quizController\.js

exports\.submitQuiz = async \(req, res\) => \{

  const \{ quizId, answers \} = req\.body;

  const quiz = await Quiz\.findById\(quizId\);

  let score = 0;

  quiz\.questions\.forEach\(\(q, i\) => \{

    if \(q\.correctOption === answers\[i\]\) score\+\+;

  \}\);

  const points = score \* 10;

  await User\.findOneAndUpdate\(\{ uid: req\.user\.uid \}, \{ $inc: \{ points \} \}\);

  await Leaderboard\.findOneAndUpdate\(

    \{ courseId: quiz\.courseId, 'entries\.userId': req\.user\.uid \},

    \{ $inc: \{ 'entries\.$\.points': points \} \},

    \{ upsert: true \}

  \);

  // Emit real\-time update

  req\.io\.to\(quiz\.courseId\)\.emit\('leaderboard:update', \{ userId: req\.user\.uid, points \}\);

  res\.json\(\{ score, points, total: quiz\.questions\.length \}\);

\};

## __7\.3  Real\-Time Leaderboard Socket Pattern__

__Backend ΓÇö Attach io to Express request__

// In server\.js ΓÇö pass io to all routes

app\.use\(\(req, res, next\) => \{ req\.io = io; next\(\); \}\);

__Frontend ΓÇö Subscribe to leaderboard updates__

// In useLeaderboard\.js

import \{ useEffect, useState \} from 'react';

import \{ io \} from 'socket\.io\-client';

export const useLeaderboard = \(courseId\) => \{

  const \[entries, setEntries\] = useState\(\[\]\);

  useEffect\(\(\) => \{

    const socket = io\('http://YOUR\_IP:5000'\);

    socket\.emit\('join:leaderboard', courseId\);

    socket\.on\('leaderboard:update', \(data\) => \{

      setEntries\(prev => prev\.map\(e => e\.userId === data\.userId ? \{\.\.\.e, points: e\.points \+ data\.points\} : e\)\.sort\(\(a,b\) => b\.points \- a\.points\)\);

    \}\);

    return \(\) => socket\.disconnect\(\);

  \}, \[courseId\]\);

  return entries;

\};

## __7\.4  Razorpay Payment Flow__

__Step 1: Frontend ΓÇö Trigger Razorpay Checkout__

import RazorpayCheckout from 'react\-native\-razorpay';

const bookMentor = async \(mentorId, slot\) => \{

  const order = await api\.post\('/payments/create\-order', \{ mentorId, slot \}\);

  RazorpayCheckout\.open\(\{

    key: 'YOUR\_RAZORPAY\_KEY\_ID',

    amount: order\.data\.amount,

    currency: 'INR',

    order\_id: order\.data\.id,

    name: '4Bit Labs',

    description: 'Mentor Session',

    theme: \{ color: '\#C0392B' \}

  \}\)\.then\(data => api\.post\('/payments/verify', data\)\);

\};

__Step 2: Backend ΓÇö Create Razorpay Order__

const Razorpay = require\('razorpay'\);

const razorpay = new Razorpay\(\{ key\_id: process\.env\.RAZORPAY\_KEY\_ID, key\_secret: process\.env\.RAZORPAY\_KEY\_SECRET \}\);

exports\.createOrder = async \(req, res\) => \{

  const order = await razorpay\.orders\.create\(\{ amount: 5000, currency: 'INR', receipt: uuid\(\) \}\);

  res\.json\(order\);

\};

## __7\.5  Firebase Firestore Real\-Time Chat__

// In MentorScreen\.jsx ΓÇö listen to chat messages

import \{ collection, onSnapshot, addDoc, serverTimestamp \} from 'firebase/firestore';

import \{ db \} from '\.\./config/firebase';

useEffect\(\(\) => \{

  const ref = collection\(db, 'chats', courseId, 'messages'\);

  const unsub = onSnapshot\(ref, snap => \{

    setMessages\(snap\.docs\.map\(d => \(\{id: d\.id, \.\.\.d\.data\(\)\}\)\)\);

  \}\);

  return unsub;

\}, \[courseId\]\);

const sendMessage = async \(text\) => \{

  await addDoc\(collection\(db, 'chats', courseId, 'messages'\), \{

    text, senderId: currentUser\.uid, senderName: currentUser\.name,

    timestamp: serverTimestamp\(\)

  \}\);

\};

# __8\. Screen\-by\-Screen UI Specification__

__Screen__

__Key UI Elements__

__Data Source__

LoginScreen

Red header logo, email \+ password inputs, Login CTA button, 'Register' link at bottom

Firebase Auth

RegisterScreen

Name, email, phone, school picker \(dropdown\), course multi\-select checkboxes, Register button

GET /api/v1/schools, POST /auth/register

OtpScreen

6\-box OTP input, countdown timer \(60s\), Resend OTP link, Verify button

Firebase Phone Auth

HomeScreen

Top bar with name \+ avatar, attendance card \(%\), announcements carousel, quick\-action cards \(Course, Quiz, Mentor, Build\)

GET /api/v1/home\-summary

CourseListScreen

Grid of course cards with thumbnail, title, progress bar, lecture count

GET /api/v1/courses

CourseDetailScreen

Tab bar \(Lectures | Leaderboard | Build\), video list, each item shows duration \+ completion tick

GET /api/v1/courses/:id

QuizListScreen

Cards per quiz ΓÇö title, question count, duration, status badge \(New / Completed / Locked\)

GET /api/v1/quizzes

QuizScreen

Question card, 4 option radio buttons \(red selected\), progress bar, countdown timer, Prev/Next/Submit

GET /api/v1/quizzes/:id

ResultScreen

Score circle \(red\), points earned badge, correct/wrong count, 'View Leaderboard' CTA

POST /api/v1/quiz\-attempts

LeaderboardScreen

Podium for top 3, ranked list with avatar \+ name \+ points, current user row highlighted in red

GET /api/v1/leaderboard/:courseId \+ Socket\.IO

MentorScreen

Tab: Free Chat \(Firestore real\-time\) | Paid 1\-on\-1 \(mentor cards \+ Book Γé╣50 button\)

Firestore \+ GET /api/v1/mentors

BuildScreen

Project track cards \(Beginner / Intermediate / Advanced\) with step\-by\-step guide inside

Static or GET /api/v1/projects

StoreScreen

Product cards with image \+ name \+ price \(display only\), 'Visit Store' button ΓåÆ Linking\.openURL\(\)

Hardcoded URL / GET /api/v1/store\-url

# __9\. Complete API Endpoint Reference__

__Method__

__Endpoint__

__Auth__

__Description__

POST

/api/v1/auth/verify\-token

None

Verify Firebase ID token, return JWT

POST

/api/v1/auth/register

None

Create user record in MongoDB

GET

/api/v1/schools

None

List all schools

GET

/api/v1/courses

JWT

List courses for user's school

GET

/api/v1/courses/:id

JWT

Single course with lectures

GET

/api/v1/quizzes?courseId=x

JWT

List quizzes for a course

GET

/api/v1/quizzes/:id

JWT

Single quiz with shuffled questions

POST

/api/v1/quiz\-attempts

JWT

Submit quiz, auto\-grade, award points

GET

/api/v1/leaderboard/:courseId

JWT

Paginated leaderboard entries

GET

/api/v1/mentors

JWT

List mentors for a course

POST

/api/v1/payments/create\-order

JWT

Create Razorpay order \(Γé╣50\)

POST

/api/v1/payments/verify

JWT

Verify Razorpay signature, save booking

GET

/api/v1/mentor\-bookings/my

JWT

Student's booking history

POST

/api/v1/attendance

JWT

Mark attendance for a lecture

GET

/api/v1/attendance/my

JWT

Student's attendance records

GET

/api/v1/home\-summary

JWT

Dashboard summary data

# __10\. Scalability & Production Checklist__

## __10\.1  Multi\-School Architecture__

- Every data model includes a schoolId field ΓÇö all queries are scoped to the requesting user's schoolId
- Super Admin can view and manage data across all schools without schoolId filter
- Courses, quizzes, and leaderboards are isolated per school ΓÇö no data leaks between schools
- Firebase Authentication is shared, but MongoDB records carry the schoolId for segregation

## __10\.2  Scaling to Thousands of Users__

- Use MongoDB indexes on userId, schoolId, courseId, and timestamp fields
- Paginate all list endpoints \(default page size: 20\) ΓÇö never return unbounded arrays
- Cache course lists and leaderboard snapshots in node\-cache \(5\-minute TTL\)
- Use Socket\.IO rooms per courseId ΓÇö clients only receive events relevant to their course
- Firestore rules: allow read/write only if request\.auth\.uid == resource\.data\.senderId
- Use Razorpay webhook instead of polling for payment confirmation in production

## __10\.3  Security Hardening__

- Never return quiz correct answers in GET /quizzes/:id ΓÇö only return on POST quiz\-attempts response
- Rate limit /auth/verify\-token to 10 requests/minute per IP
- Validate all request bodies with express\-validator before hitting controllers
- Rotate JWT\_SECRET every 90 days ΓÇö issue new tokens on next login
- Use HTTPS in production ΓÇö configure SSL on your hosting \(Render, Railway, or EC2\)
- Store firebase\-admin\-key\.json content as environment variables, never commit to Git

## __10\.4  Deployment Checklist__

1. Backend: Deploy to Render\.com or Railway ΓÇö set all \.env variables in the dashboard
2. MongoDB: Switch Atlas to a dedicated M10\+ cluster for production
3. Frontend: Build with eas build for standalone APK/IPA via Expo EAS Build
4. FCM: In production, use FCM topics for broadcast notifications instead of individual tokens
5. Monitoring: Add Sentry \(expo\-sentry\) for crash reporting on mobile
6. Analytics: Add Firebase Analytics for screen tracking and user funnel analysis

## __10\.5  Future Feature Roadmap__

- Live classes via Agora\.io or Daily\.co RTC SDK
- Doubt forums with threading \(Firestore sub\-collections\)
- Admin dashboard web app \(React \+ Vite\) for school admins
- AI\-generated quiz hints using OpenAI API
- Offline lecture downloads using expo\-file\-system
- Dark mode with system preference detection
- Multi\-language support \(i18n with i18next\)

# __11\. Suggested Execution Timeline__

__Week__

__Phase__

__Deliverable__

Week 1

Phase 0 \+ Phase 1

Firebase setup, backend scaffolded, auth working end\-to\-end

Week 2

Phase 2 \(Part 1\)

All components built, navigation wired, Home \+ Course screens live with dummy data

Week 3

Phase 2 \(Part 2\) \+ Phase 3 \(Part 1\)

Store, Build, and Leaderboard screens done; Quiz list and quiz UI built

Week 4

Phase 3 \(Part 2\)

Full quiz flow: take quiz ΓåÆ see result ΓåÆ leaderboard updates in real\-time

Week 5

Phase 4

Mentor screen with chat, booking UI, Razorpay payment flow working in test mode

Week 6

Phase 5

Push notifications, attendance, UI polish, error handling, security hardening

Week 7

QA \+ Deploy

Full test on Android \+ iOS devices, backend deployed, Expo EAS build generated

__4Bit Labs ΓÇö Build Something That Matters__

*This document is your single source of truth\. Execute phase by phase\. Ship with confidence\.*

