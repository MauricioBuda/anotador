import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

function referenciaFavorito(usuarioId, datoId) {
  if (!usuarioId || !datoId) throw new Error('No se pudo identificar el usuario o el dato favorito.');
  return doc(db, 'usuarios', usuarioId, 'favoritos', datoId);
}

export function observarFavoritos(usuarioId, alCambiar, alError) {
  const favoritosUsuario = collection(db, 'usuarios', usuarioId, 'favoritos');
  return onSnapshot(favoritosUsuario, (snapshot) => {
    alCambiar(new Set(snapshot.docs.map((documento) => documento.id)));
  }, alError);
}

export async function guardarFavorito(usuarioId, datoId) {
  await setDoc(referenciaFavorito(usuarioId, datoId), {
    datoId,
    marcadoEn: serverTimestamp(),
  });
}

export async function quitarFavorito(usuarioId, datoId) {
  await deleteDoc(referenciaFavorito(usuarioId, datoId));
}
