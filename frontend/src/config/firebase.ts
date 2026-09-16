import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVMtFylExQBF5Kz6Qbc3sKBPxEUYxluC8",
  authDomain: "hackmate-777.firebaseapp.com",
  projectId: "hackmate-777",
  storageBucket: "hackmate-777.firebasestorage.app",
  messagingSenderId: "1040801886780",
  appId: "1:1040801886780:web:988775c519385901248939",
  measurementId: "G-NLL3BZZJPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
