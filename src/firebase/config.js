// Firebase Configuration
// Usa variables de entorno para mayor seguridad
// En desarrollo local, crea un archivo .env.local con tus credenciales
// En producción (GitHub Actions), las variables se pasan desde secrets

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase desde variables de entorno
// Si las variables de entorno no están disponibles, usa valores por defecto
// En producción (GitHub Actions), las variables se pasan desde secrets durante el build
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCLrEceXProG4jQaZOnC6QlkpM_x7C-LOk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "metas-2cc55.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "metas-2cc55",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "metas-2cc55.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "72829379006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:72829379006:web:382fdf92a0aaa42b99d9ef"
};

// Validar que Firebase esté configurado
const isFirebaseConfigured = firebaseConfig.apiKey && 
                              firebaseConfig.apiKey !== "" &&
                              firebaseConfig.projectId && 
                              firebaseConfig.projectId !== "";

let app;
let db;
let auth;

try {
  if (isFirebaseConfigured) {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    // Inicializar Firestore
    db = getFirestore(app);
    // Inicializar Auth
    auth = getAuth(app);
  } else {
    console.warn('⚠️ Firebase no está configurado. Por favor, configura tus credenciales en src/firebase/config.js');
    // Crear objetos mock para evitar errores
    db = null;
    app = null;
    auth = null;
  }
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  db = null;
  app = null;
  auth = null;
}

export { db, auth };
export default app;

