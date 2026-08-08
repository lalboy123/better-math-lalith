import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBcYqD8JdyV_ygudbwxsPG5dx7w_D4rzGU',
  authDomain: 'mathlift-63f6e.firebaseapp.com',
  projectId: 'mathlift-63f6e',
  storageBucket: 'mathlift-63f6e.firebasestorage.app',
  messagingSenderId: '966174585807',
  appId: '1:966174585807:web:a66c12e44df257e322d8ba',
  measurementId: 'G-T6RHG8WB1Z',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/** Analytics only when the environment supports it (skips many native WebViews). */
export let analytics: Analytics | null = null;
void isSupported()
  .then((ok) => {
    if (ok) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    analytics = null;
  });
