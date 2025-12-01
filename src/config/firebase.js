import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const config = {
  apiKey: "AIzaSyAgO7fmihU2sYbj21G2zGmc62uHEuV3YpQ",
  authDomain: "syuamya-ayurveda.firebaseapp.com",
  projectId: "syuamya-ayurveda",
  storageBucket: "syuamya-ayurveda.appspot.com",
  messagingSenderId: "309859345157",
  appId: "1:309859345157:web:59d5dad9c1ca78738c0d6c",
  measurementId: "G-M6K9TMFWMM"
  };


const m_app = initializeApp(config);

const app = firebase.initializeApp(config);

const db = firebase.firestore();

const m_db = getFirestore(m_app);
const realDb = getDatabase(m_app);

export { db, firebase, realDb,m_db,m_app }