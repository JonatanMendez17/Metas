// Servicio de autenticación con Firebase

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';

// Registrar nuevo usuario
export async function register(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Actualizar el nombre de usuario
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Error registrando usuario:', error);
    return { user: null, error: getErrorMessage(error.code) };
  }
}

// Iniciar sesión
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Error iniciando sesión:', error);
    return { user: null, error: getErrorMessage(error.code) };
  }
}

// Cerrar sesión
export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return { error: getErrorMessage(error.code) };
  }
}

// Escuchar cambios en el estado de autenticación
export function onAuthStateChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Obtener usuario actual
export function getCurrentUser() {
  return auth?.currentUser;
}

// Convertir códigos de error a mensajes en español
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo electrónico ya está en uso',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No se encontró una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Por favor, intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
  };
  return errorMessages[errorCode] || 'Ocurrió un error. Por favor, intenta de nuevo';
}

