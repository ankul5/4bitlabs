# 4Bit Labs — EdTech Platform

4Bit Labs is a comprehensive, production-ready educational technology platform featuring a robust Node.js backend and a React Native mobile application. Built using a true monorepo strategy, this project handles everything from user administration and AI-driven quizzes to real-time leaderboards and course progress tracking.

## Architecture & Repositories

This project is organized into two primary subsystems located in their respective folders:

* **[4bit-labs-app](./4bit-labs-app)** — The React Native (Expo) frontend for student interactions.
* **[4bitlabs-backend](./4bitlabs-backend)** — The Node.js/Express backend powering the API, DB, and Real-Time sockets.

## Global Tech Stack

*   **Frontend**: React Native, Expo, React Navigation, Axios
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ORM)
*   **Identity & Auth**: Firebase Authentication, Admin SDK, JSON Web Tokens (JWT)
*   **Real-time Features**: Socket.IO
*   **Storage & Media**: Cloudinary
*   **Payment Gateway**: Razorpay
*   **AI Integrations**: Google Gemini API

## Getting Started

To get the full stack up and running locally, follow these steps:

### 1. Start the Backend
Navigate to the backend directory, ensure you have your `.env` configured properly (following `4bitlabs-backend/README.md`), and start the server:
```bash
cd 4bitlabs-backend
npm install
npm run dev
```

### 2. Configure Local Network
If testing on a physical mobile device, locate your machine's current local IPv4 address (e.g. `10.x.x.x` via `ipconfig`) and update `API_BASE_URL` in `4bit-labs-app/src/services/api.js`.

### 3. Start the Frontend
Navigate to the frontend directory and start the Expo dev server:
```bash
cd 4bit-labs-app
npm install
npx expo start --clear
```

## Security & Best Practices
- **Security Contexts:** Double-layered security is implemented taking advantage of both Firebase ID tokens for the initial handshake and custom short-lived JWTs for subsequent backend authorization.
- **Role-Based Access Control:** Routes and privileges differ between `student`, `teacher`, `school_admin` and `super_admin`.
- **Environment Exclusions:** API keys, certificates (`bit-labs-app-firebase-adminsdk-fbsvc-*.json`), and environment variables (`.env`) are explicitly ignored via `.gitignore` and must be securely configured per deployment.
