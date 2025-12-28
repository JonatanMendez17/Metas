// Servicio para manejar las metas en Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const GOALS_COLLECTION = 'goals';
const OBJECTIVES_COLLECTION = 'yearlyObjectives';

// ========== METAS ==========

// Obtener todas las metas
export async function getGoals() {
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const querySnapshot = await getDocs(goalsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo metas:', error);
    return [];
  }
}

// Escuchar cambios en las metas en tiempo real (filtradas por usuario)
export function subscribeToGoals(userId, callback) {
  if (!db) {
    console.warn('Firebase no está configurado');
    callback([]);
    return () => {};
  }
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const q = query(goalsRef, where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convertir Timestamps a fechas si existen
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        };
      });
      callback(goals);
    }, (error) => {
      console.error('Error en suscripción de metas:', error);
      // Si Firebase no está configurado, devolver array vacío
      if (error.code === 'failed-precondition' || error.code === 'unavailable') {
        console.warn('Firebase no está configurado o no está disponible');
      }
      callback([]);
    });
  } catch (error) {
    console.error('Error inicializando suscripción de metas:', error);
    callback([]);
    return () => {}; // Retornar función vacía para unsubscribe
  }
}

// Agregar una nueva meta
export async function addGoal(goal, userId) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const docRef = await addDoc(goalsRef, {
      ...goal,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando meta:', error);
    throw error;
  }
}

// Actualizar una meta
export async function updateGoal(goalId, updates) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando meta:', error);
    throw error;
  }
}

// Eliminar una meta
export async function deleteGoal(goalId) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error eliminando meta:', error);
    throw error;
  }
}

// ========== OBJETIVOS ANUALES ==========

// Obtener objetivos anuales de un año específico
export async function getYearlyObjectives(year) {
  try {
    const objectivesRef = collection(db, OBJECTIVES_COLLECTION);
    const q = query(
      objectivesRef, 
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const allObjectives = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Filtrar por año
    return allObjectives.filter(obj => obj.year === year);
  } catch (error) {
    console.error('Error obteniendo objetivos anuales:', error);
    return [];
  }
}

// Escuchar cambios en los objetivos anuales de un año (filtrados por usuario)
export function subscribeToYearlyObjectives(year, userId, callback) {
  if (!db) {
    console.warn('Firebase no está configurado');
    callback([]);
    return () => {};
  }
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const objectivesRef = collection(db, OBJECTIVES_COLLECTION);
    const q = query(
      objectivesRef, 
      where('userId', '==', userId),
      where('year', '==', year)
    );
    return onSnapshot(q, (snapshot) => {
      const objectives = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        };
      });
      callback(objectives);
    }, (error) => {
      console.error('Error en suscripción de objetivos:', error);
      // Si Firebase no está configurado, devolver array vacío
      if (error.code === 'failed-precondition' || error.code === 'unavailable') {
        console.warn('Firebase no está configurado o no está disponible');
      }
      callback([]);
    });
  } catch (error) {
    console.error('Error inicializando suscripción de objetivos:', error);
    callback([]);
    return () => {}; // Retornar función vacía para unsubscribe
  }
}

// Agregar un objetivo anual
export async function addYearlyObjective(objective, year, userId) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }
  try {
    const objectivesRef = collection(db, OBJECTIVES_COLLECTION);
    const docRef = await addDoc(objectivesRef, {
      ...objective,
      year,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando objetivo anual:', error);
    throw error;
  }
}

// Actualizar un objetivo anual
export async function updateYearlyObjective(objectiveId, updates) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  try {
    const objectiveRef = doc(db, OBJECTIVES_COLLECTION, objectiveId);
    await updateDoc(objectiveRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando objetivo anual:', error);
    throw error;
  }
}

// Eliminar un objetivo anual
export async function deleteYearlyObjective(objectiveId) {
  if (!db) {
    throw new Error('Firebase no está configurado');
  }
  try {
    const objectiveRef = doc(db, OBJECTIVES_COLLECTION, objectiveId);
    await deleteDoc(objectiveRef);
  } catch (error) {
    console.error('Error eliminando objetivo anual:', error);
    throw error;
  }
}

