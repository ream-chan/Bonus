
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDygUVsz5D0wa5BIqNGym0TOMrNJcMSzc8",
  authDomain: "todo-4c2c3.firebaseapp.com",
  projectId: "todo-4c2c3",
  storageBucket: "todo-4c2c3.appspot.com",
  messagingSenderId: "670795603787",
  appId: "1:670795603787:web:0f67104eab4b9aa36a12ce",
  measurementId: "G-G932ZQC8FM"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};