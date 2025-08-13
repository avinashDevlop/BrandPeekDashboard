import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB63QL5Ma4_V5Xb883Flookisvg2W0aA4Q",
  authDomain: "brandpeek-22360.firebaseapp.com",
  projectId: "brandpeek-22360",
  storageBucket: "brandpeek-22360.firebasestorage.app",
  messagingSenderId: "517603011567",
  appId: "1:517603011567:web:d9c9b5b068ea4b8f5de41a",
  measurementId: "G-FYBK75QWKL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app); // ✅ Export database
export default app;
