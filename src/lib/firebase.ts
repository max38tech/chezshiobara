
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Explicitly check for required environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  const errorMessage = "Missing Firebase API Key. CRITICAL: Check .env.local file in project root & RESTART server.";
  console.error(
    "Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined. " +
    errorMessage
  );
  throw new Error(errorMessage);
}
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  const errorMessage = "Missing Firebase Project ID. CRITICAL: Check .env.local file in project root & RESTART server.";
  console.error(
    "Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined. " +
    errorMessage
  );
  throw new Error(errorMessage);
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
  "Firebase attempting to initialize. Project ID from env: ", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  "API Key from env starts with:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 8) + "..." : "UNDEFINED"
);

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully. Project ID from app options:", app.options.projectId);
  } catch (error) {
    console.error("Firebase SDK initialization error:", error);
    // Re-throw the error to make it clear initialization failed.
    throw new Error(`Firebase SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized. Project ID from app options:", app.options.projectId);
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
