// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";
import {getAuth} from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_eSE1Brdu0AAbFYrYrI-junQJnk-ncVI",
  authDomain: "college-marketplace-e4f40.firebaseapp.com",
  projectId: "college-marketplace-e4f40",
  storageBucket: "college-marketplace-e4f40.appspot.com",
  messagingSenderId: "25886189153",
  appId: "1:25886189153:web:ce5a796181ca8b8d95ec20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const storage = getStorage(app);
const auth = getAuth(app)

export {db, storage, auth}
