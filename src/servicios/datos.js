import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { crearIdCategoria, normalizarTexto } from '../utilidades/normalizacion.js';

const COLECCION = 'datos';

export function observarDatos(alCambiar, alError) {
  return onSnapshot(collection(db, COLECCION), (snapshot) => {
    alCambiar(snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}

function validarDatosDato({ categoriaId, nombre, dato, observacion }) {
  const nombreLimpio = String(nombre || '').trim();
  const datoLimpio = String(dato ?? '');
  const observacionLimpia = String(observacion ?? '');
  if (!categoriaId) throw new Error('Seleccioná una categoría.');
  if (!nombreLimpio) throw new Error('Completá el nombre o identificación.');
  if (!datoLimpio.trim()) throw new Error('Completá el dato que querés guardar.');
  if (nombreLimpio.length > 100) throw new Error('El nombre no puede superar los 100 caracteres.');
  return { nombre: nombreLimpio, dato: datoLimpio, observacion: observacionLimpia };
}

export async function crearDato({ categoriaId, nombre, dato, observacion, usuario }) {
  const valores = validarDatosDato({ categoriaId, nombre, dato, observacion });
  const referencia = await addDoc(collection(db, COLECCION), {
    categoriaId,
    ...valores,
    creadoEn: serverTimestamp(),
    creadoPor: usuario.uid,
    creadoPorCorreo: usuario.email || '',
    editadoEn: null,
    editadoPor: null,
    editadoPorCorreo: null,
  });
  return referencia.id;
}

export async function crearDatoConCategoriaNueva({ nombreCategoria, icono, nombre, dato, observacion, usuario }) {
  const valoresDato = validarDatosDato({ categoriaId: 'categoria-nueva', nombre, dato, observacion });
  const nombreCategoriaLimpio = String(nombreCategoria || '').trim();
  const nombreNormalizado = normalizarTexto(nombreCategoriaLimpio);
  if (!nombreCategoriaLimpio) throw new Error('Escribí un nombre para la categoría.');
  if (nombreCategoriaLimpio.length > 50) throw new Error('El nombre de la categoría no puede superar los 50 caracteres.');

  const categoriaId = crearIdCategoria(nombreCategoriaLimpio);
  const referenciaCategoria = doc(db, 'categorias', categoriaId);
  const referenciaIndice = doc(db, 'indicesCategorias', categoriaId);
  const referenciaDato = doc(collection(db, COLECCION));
  const iconoElegido = icono || { tipo: 'vector', valor: 'folder' };

  await runTransaction(db, async (transaccion) => {
    const [documentoCategoria, documentoIndice] = await Promise.all([
      transaccion.get(referenciaCategoria),
      transaccion.get(referenciaIndice),
    ]);
    if (documentoCategoria.exists() || documentoIndice.exists()) {
      throw new Error('Ya existe una categoría con ese nombre. Revisá también las categorías ocultas o eliminadas.');
    }

    transaccion.set(referenciaCategoria, {
      nombre: nombreCategoriaLimpio,
      nombreNormalizado,
      icono: iconoElegido,
      activa: true,
      visibleEnFormulario: false,
      orden: Date.now(),
      inicial: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: usuario.uid,
    });
    transaccion.set(referenciaIndice, {
      categoriaId,
      nombreNormalizado,
      creadoEn: serverTimestamp(),
    });
    transaccion.set(referenciaDato, {
      categoriaId,
      ...valoresDato,
      creadoEn: serverTimestamp(),
      creadoPor: usuario.uid,
      creadoPorCorreo: usuario.email || '',
      editadoEn: null,
      editadoPor: null,
      editadoPorCorreo: null,
    });
  });
  return { categoriaId, datoId: referenciaDato.id };
}

export async function actualizarDato(id, { categoriaId, nombre, dato, observacion, usuario }) {
  const valores = validarDatosDato({ categoriaId, nombre, dato, observacion });
  await updateDoc(doc(db, COLECCION, id), {
    categoriaId,
    ...valores,
    editadoEn: serverTimestamp(),
    editadoPor: usuario.uid,
    editadoPorCorreo: usuario.email || '',
  });
}
