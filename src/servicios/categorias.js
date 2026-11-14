import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { CATEGORIAS_INICIALES } from '../configuracion.js';
import { crearIdCategoria, normalizarTexto } from '../utilidades/normalizacion.js';

const COLECCION = 'categorias';
const COLECCION_INDICES = 'indicesCategorias';

export function observarCategorias(alCambiar, alError) {
  return onSnapshot(collection(db, COLECCION), (snapshot) => {
    alCambiar(snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}

export async function inicializarCategorias(usuario) {
  const referencias = CATEGORIAS_INICIALES.map((categoria) => ({
    categoria: doc(db, COLECCION, categoria.id),
    indice: doc(db, COLECCION_INDICES, crearIdCategoria(categoria.nombre)),
  }));

  await runTransaction(db, async (transaccion) => {
    const documentos = await Promise.all(referencias.flatMap((referencia) => [
      transaccion.get(referencia.categoria),
      transaccion.get(referencia.indice),
    ]));

    referencias.forEach((referencia, indice) => {
      const documentoCategoria = documentos[indice * 2];
      const documentoIndice = documentos[indice * 2 + 1];
      const categoria = CATEGORIAS_INICIALES[indice];
      if (!documentoCategoria.exists()) {
        if (documentoIndice.exists() && documentoIndice.data().categoriaId !== categoria.id) {
          throw new Error(`No se pudo inicializar la categoría «${categoria.nombre}» porque su índice ya está ocupado.`);
        }
        transaccion.set(referencia.categoria, {
          nombre: categoria.nombre,
          nombreNormalizado: normalizarTexto(categoria.nombre),
          icono: categoria.icono,
          activa: true,
          visibleEnFormulario: true,
          orden: categoria.orden,
          inicial: true,
          creadoEn: serverTimestamp(),
          actualizadoEn: serverTimestamp(),
          creadoPor: usuario.uid,
        });
        if (!documentoIndice.exists()) {
          transaccion.set(referencia.indice, {
            categoriaId: categoria.id,
            nombreNormalizado: normalizarTexto(categoria.nombre),
            creadoEn: serverTimestamp(),
          });
        }
      }
    });
  });
}

export async function crearCategoria({ nombre, icono, visibleEnFormulario, usuario }) {
  const nombreLimpio = String(nombre || '').trim();
  const normalizado = normalizarTexto(nombreLimpio);
  if (!nombreLimpio) throw new Error('Escribí un nombre para la categoría.');
  if (nombreLimpio.length > 50) throw new Error('El nombre de la categoría no puede superar los 50 caracteres.');

  const id = crearIdCategoria(nombreLimpio);
  const referencia = doc(db, COLECCION, id);
  const referenciaIndice = doc(db, COLECCION_INDICES, id);
  const iconoElegido = icono || { tipo: 'vector', valor: 'folder' };

  await runTransaction(db, async (transaccion) => {
    const [documento, indice] = await Promise.all([
      transaccion.get(referencia),
      transaccion.get(referenciaIndice),
    ]);
    if (documento.exists() || indice.exists()) {
      throw new Error('Ya existe una categoría con ese nombre. Revisá también las categorías ocultas o eliminadas.');
    }
    transaccion.set(referencia, {
      nombre: nombreLimpio,
      nombreNormalizado: normalizado,
      icono: iconoElegido,
      activa: true,
      visibleEnFormulario: Boolean(visibleEnFormulario),
      orden: Date.now(),
      inicial: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: usuario.uid,
    });
    transaccion.set(referenciaIndice, {
      categoriaId: id,
      nombreNormalizado: normalizado,
      creadoEn: serverTimestamp(),
    });
  });
  return { id, nombre: nombreLimpio, nombreNormalizado: normalizado, icono: iconoElegido, activa: true, visibleEnFormulario: Boolean(visibleEnFormulario), orden: Date.now(), inicial: false };
}

export async function actualizarCategoria(id, { nombre, icono }) {
  const nombreLimpio = String(nombre || '').trim();
  const normalizado = normalizarTexto(nombreLimpio);
  if (!nombreLimpio) throw new Error('El nombre no puede estar vacío.');
  if (nombreLimpio.length > 50) throw new Error('El nombre no puede superar los 50 caracteres.');

  const referencia = doc(db, COLECCION, id);
  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe. Actualizá la pantalla e intentá nuevamente.');
    const datosActuales = documento.data();
    const idIndiceAnterior = crearIdCategoria(datosActuales.nombre);
    const idIndiceNuevo = crearIdCategoria(nombreLimpio);
    const referenciaIndiceAnterior = doc(db, COLECCION_INDICES, idIndiceAnterior);
    const referenciaIndiceNuevo = doc(db, COLECCION_INDICES, idIndiceNuevo);
    const [indiceAnterior, indiceNuevo] = await Promise.all([
      transaccion.get(referenciaIndiceAnterior),
      idIndiceNuevo === idIndiceAnterior ? Promise.resolve(null) : transaccion.get(referenciaIndiceNuevo),
    ]);

    if (indiceNuevo?.exists() && indiceNuevo.data().categoriaId !== id) {
      throw new Error('Ya existe otra categoría con ese nombre.');
    }

    if (idIndiceNuevo !== idIndiceAnterior && indiceAnterior?.exists() && indiceAnterior.data().categoriaId === id) {
      transaccion.delete(referenciaIndiceAnterior);
    }
    if (idIndiceNuevo !== idIndiceAnterior) {
      transaccion.set(referenciaIndiceNuevo, {
        categoriaId: id,
        nombreNormalizado: normalizado,
        creadoEn: serverTimestamp(),
      });
    }

    transaccion.update(referencia, {
      nombre: nombreLimpio,
      nombreNormalizado: normalizado,
      icono: icono || datosActuales.icono,
      actualizadoEn: serverTimestamp(),
    });
  });
}

export async function cambiarVisibilidadCategoria(id, visibleEnFormulario) {
  await runTransaction(db, async (transaccion) => {
    const referencia = doc(db, COLECCION, id);
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    if (!documento.data().activa) throw new Error('Primero tenés que recuperar la categoría.');
    transaccion.update(referencia, { visibleEnFormulario: Boolean(visibleEnFormulario), actualizadoEn: serverTimestamp() });
  });
}

export async function archivarCategoria(id) {
  await runTransaction(db, async (transaccion) => {
    const referencia = doc(db, COLECCION, id);
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    transaccion.update(referencia, { activa: false, visibleEnFormulario: false, actualizadoEn: serverTimestamp() });
  });
}

export async function recuperarCategoria(id) {
  await runTransaction(db, async (transaccion) => {
    const referencia = doc(db, COLECCION, id);
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    transaccion.update(referencia, { activa: true, actualizadoEn: serverTimestamp() });
  });
}
