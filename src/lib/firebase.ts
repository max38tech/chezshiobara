
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Explicitly check for required environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error(
    "Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined. " +
    "Please ensure it is set in your .env.local file and that you have restarted your development server."
  );
  throw new Error(
    "Missing Firebase API Key. Check server logs and .env.local configuration."
  );
}
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error(
    "Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined. " +
    "Please ensure it is set in your .env.local file and that you have restarted your development server."
  );
  throw new Error(
    "Missing Firebase Project ID. Check server logs and .env.local configuration."
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

console.log(
  "Firebase attempting to initialize. Project ID from config:", firebaseConfig.projectId,
  "API Key from config starts with:", firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 8) + "..." : "UNDEFINED"
);

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully. Project ID:", app.options.projectId);
  } catch (error) {
    console.error("Firebase SDK initialization error:", error);
    // Re-throw the error to make it clear initialization failed.
    throw new Error(`Firebase SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Project ID:", app.options.projectId);
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
