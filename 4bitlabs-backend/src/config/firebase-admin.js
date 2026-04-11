const admin = require('firebase-admin');

let firebaseApp;
let firebaseInitialized = false;

const initFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;

  // Check if Firebase credentials are configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️  Firebase Admin SDK credentials not configured. Firebase features (auth verify, FCM) will not work.');
    console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped \n in env var with real newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin SDK init failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('⚠️  Server will continue without Firebase. Auth endpoints will return errors.');
  }

  return firebaseApp;
};

initFirebaseAdmin();

module.exports = admin;
