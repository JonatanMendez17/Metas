// Firebase Configuration - EJEMPLO
// Copia este archivo como config.js y reemplaza los valores con tus credenciales

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
// Obtén estos valores desde la consola de Firebase: https://console.firebase.google.com
// Ve a: Tu proyecto > Configuración del proyecto > Tus aplicaciones > SDK setup y configuración
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Validar que Firebase esté configurado
const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY" && 
                              firebaseConfig.projectId !== "TU_PROJECT_ID";

let app;
let db;

try {
  if (isFirebaseConfigured) {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    // Inicializar Firestore
    db = getFirestore(app);
  } else {
    console.warn('⚠️ Firebase no está configurado. Por favor, configura tus credenciales en src/firebase/config.js');
    // Crear objetos mock para evitar errores
    db = null;
    app = null;
  }
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  db = null;
  app = null;
}

export { db };
export default app;

