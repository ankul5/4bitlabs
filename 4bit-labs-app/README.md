# 4Bit Labs — Frontend

This is the React Native (Expo) frontend for the 4Bit Labs EdTech platform. It provides a mobile learning experience for students with a focus on editorial tech education, quizzes, and real-time leaderboards.

## Tech Stack
- **Framework:** React Native + Expo
- **Navigation:** React Navigation (Stack + Drawer)
- **State/Auth Context:** React Context API + AsyncStorage
- **Networking:** Axios
- **Authentication:** Firebase Auth
- **Real-time:** Socket.IO Client

## Setup Instructions

1. **Install Dependencies:**
   Make sure you are in the `4bit-labs-app` directory, then run:
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Update the backend API URL if needed. Ensure `src/services/api.js` points to your backend instance or current WiFi IP (e.g. `http://YOUR-IP:5000/api/v1`).

3. **Start the Development Server:**
   ```bash
   npx expo start --clear
   ```
   *Tip: Use the Expo Go app on your phone to scan the QR code and test on a physical device.*

## Key Features
- **User Authentication:** Login and Registration powered by Firebase Auth, with secure JWTs managed securely via the backend.
- **Courses & Quizzes:** View available courses, browse quizzes, take timed quizzes, and receive auto-graded results.
- **Leaderboard:** Real-time school-wide and global tracking of student points via WebSockets.
- **Dynamic UI:** Smooth animations, drawer navigation, and clean, modern themes inspired by editorial aesthetics.

## Folder Structure
- `/src/components` — Reusable UI elements (Buttons, Input Fields, Cards).
- `/src/config` — Theme tokens (colors, spacing, typography).
- `/src/context` — Global state management (AuthContext).
- `/src/screens` — Individual app screens grouped by feature (Auth, Course, Leaderboard, etc).
- `/src/services` — Axios interceptors and individual API service wrappers connecting to the Node backend.
