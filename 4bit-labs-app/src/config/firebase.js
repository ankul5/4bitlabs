import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC-cDcsPmvos_SZAUXFFrof10856X_2i94',
  authDomain: 'bit-labs-app.firebaseapp.com',
  projectId: 'bit-labs-app',
  storageBucket: 'bit-labs-app.firebasestorage.app',
  messagingSenderId: '542034664184',
  appId: '1:542034664184:web:20b97c954cb0882683790d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
