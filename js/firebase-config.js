// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdpyhK9C5yDDuEAvMPreU6HUgT2PdFMsI",
  authDomain: "hem-portfolio-3292a.firebaseapp.com",
  projectId: "hem-portfolio-3292a",
  storageBucket: "hem-portfolio-3292a.firebasestorage.app",
  messagingSenderId: "494670409826",
  appId: "1:494670409826:web:5bf400cc9f3044ca54213b",
  measurementId: "G-0JYT73QJPG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);