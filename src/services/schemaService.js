import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const SCHEMAS_COLLECTION = 'schemas';

export async function createSchema(userId, schemaData) {
  const docRef = await addDoc(collection(db, SCHEMAS_COLLECTION), {
    userId,
    name: schemaData.name.trim(),
    fields: schemaData.fields,
    rowCount: Number(schemaData.rowCount) || 5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserSchemas(userId) {
  const q = query(
    collection(db, SCHEMAS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function updateSchema(schemaId, schemaData) {
  const schemaRef = doc(db, SCHEMAS_COLLECTION, schemaId);
  await updateDoc(schemaRef, {
    name: schemaData.name.trim(),
    fields: schemaData.fields,
    rowCount: Number(schemaData.rowCount) || 5,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSchema(schemaId) {
  const schemaRef = doc(db, SCHEMAS_COLLECTION, schemaId);
  await deleteDoc(schemaRef);
}
