// Firebase Configuration
// Usa variables de entorno para mayor seguridad
// En desarrollo local, crea un archivo .env.local con tus credenciales
// En producción (GitHub Actions), las variables se pasan desde secrets

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase desde variables de entorno
// NO incluye valores por defecto por seguridad
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
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
    const errorMsg = '⚠️ ERROR: Firebase no está configurado. ' +
      'En desarrollo local, crea un archivo .env.local con las variables VITE_FIREBASE_*. ' +
      'En producción, asegúrate de que los secrets estén configurados en GitHub Actions.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  // No crear objetos null, lanzar el error para que sea visible
  throw error;
}

export { db, auth };
export default app;

