// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'today-lunch-68bf2.firebaseapp.com',
  projectId: 'today-lunch-68bf2',
  storageBucket: 'today-lunch-68bf2.firebasestorage.app',
  messagingSenderId: '919746582779',
  appId: '1:919746582779:web:94cd2805221abefaaeb85e',
  measurementId: 'G-EJV6RSSQTZ',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
// const analytics = getAnalytics(app)
