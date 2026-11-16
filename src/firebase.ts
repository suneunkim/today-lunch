import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'today-lunch-68bf2.firebaseapp.com',
  projectId: 'today-lunch-68bf2',
  storageBucket: 'today-lunch-68bf2.firebasestorage.app',
  messagingSenderId: '919746582779',
  appId: '1:919746582779:web:94cd2805221abefaaeb85e',
  measurementId: 'G-EJV6RSSQTZ',
}

// API 키가 없으면(로컬 개발 등) 집계 기능만 꺼지고 앱은 그대로 동작합니다.
export const firebaseEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
