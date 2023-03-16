// Import the functions you need from the SDKs you need
import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwNyIkV5gAh5fi_19KwHSHwgHnal7oUGc",
  authDomain: "nonamebadminton.firebaseapp.com",
  projectId: "nonamebadminton",
  storageBucket: "nonamebadminton.appspot.com",
  messagingSenderId: "798709839870",
  appId: "1:798709839870:web:0ef55636ecbb777f3c32af",
  measurementId: "G-0ESMMGB06R"
};

// Initialize Firebase
export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore()
