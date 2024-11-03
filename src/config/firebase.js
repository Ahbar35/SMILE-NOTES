// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCp4rlG3RhNLQ1ALJeiCikSgPc130a9YEU",
  authDomain: "ahbar-web.firebaseapp.com",
  projectId: "ahbar-web",
  storageBucket: "ahbar-web.appspot.com",
  messagingSenderId: "146972526403",
  appId: "1:146972526403:web:3b87d718f6d4a9af5311f6",
  measurementId: "G-CL6K0YM8TT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app)
export { analytics, auth, firestore, storage };
