// Firebase Configuration

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCLrEceXProG4jQaZOnC6QlkpM_x7C-LOk",
  authDomain: "metas-2cc55.firebaseapp.com",
  projectId: "metas-2cc55",
  storageBucket: "metas-2cc55.firebasestorage.app",
  messagingSenderId: "72829379006",
  appId: "1:72829379006:web:382fdf92a0aaa42b99d9ef"
};

// Validar que Firebase esté configurado
const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY" && 
                              firebaseConfig.projectId !== "TU_PROJECT_ID";

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

