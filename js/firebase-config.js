const firebaseConfig = {
  apiKey: "AIzaSyBdpyhK9C5yDDuEAvMPreU6HUgT2PdFMsI",
  authDomain: "hem-portfolio-3292a.firebaseapp.com",
  projectId: "hem-portfolio-3292a",
  storageBucket: "hem-portfolio-3292a.firebasestorage.app",
  messagingSenderId: "494670409826",
  appId: "1:494670409826:web:7ffa1bfed29a20cc54213b",
  measurementId: "G-1696Q4NMFZ"
};

let firebaseReady = false;
let db = null;
let auth = null;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE")) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    firebaseReady = true;
  }
} catch (e) {
  console.warn("Firebase not initialized — using default local content.", e);
}