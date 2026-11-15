import {
  collection,
  doc,
  getDocsFromServer,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { CATEGORIAS_INICIALES } from '../configuracion.js';
import { crearIdCategoria, normalizarTexto } from '../utilidades/normalizacion.js';

const COLECCION = 'categorias';
const COLECCION_INDICES = 'indicesCategorias';
const COLECCION_ELIMINADAS_DEFINITIVAMENTE = 'categoriasEliminadasDefinitivamente';

export function observarCategorias(alCambiar, alError) {
  return onSnapshot(collection(db, COLECCION), (snapshot) => {
    alCambiar(snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}

export async function inicializarCategorias(usuario) {
  const referencias = CATEGORIAS_INICIALES.map((categoria) => ({
    categoria: doc(db, COLECCION, categoria.id),
    indice: doc(db, COLECCION_INDICES, crearIdCategoria(categoria.nombre)),
    eliminada: doc(db, COLECCION_ELIMINADAS_DEFINITIVAMENTE, categoria.id),
  }));

  await runTransaction(db, async (transaccion) => {
    const documentos = await Promise.all(referencias.flatMap((referencia) => [
      transaccion.get(referencia.categoria),
      transaccion.get(referencia.indice),
      transaccion.get(referencia.eliminada),
    ]));

    referencias.forEach((referencia, indice) => {
      const documentoCategoria = documentos[indice * 3];
      const documentoIndice = documentos[indice * 3 + 1];
      const documentoEliminacion = documentos[indice * 3 + 2];
      const categoria = CATEGORIAS_INICIALES[indice];
      if (!documentoCategoria.exists()) {
        if (documentoEliminacion.exists()) return;
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
    if (datosActuales.eliminandoDefinitivamente === true) throw new Error('La categoría está siendo eliminada definitivamente.');
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
    if (documento.data().eliminandoDefinitivamente === true) throw new Error('La categoría está siendo eliminada definitivamente.');
    if (!documento.data().activa) throw new Error('Primero tenés que recuperar la categoría.');
    transaccion.update(referencia, { visibleEnFormulario: Boolean(visibleEnFormulario), actualizadoEn: serverTimestamp() });
  });
}

export async function archivarCategoria(id) {
  await runTransaction(db, async (transaccion) => {
    const referencia = doc(db, COLECCION, id);
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    if (documento.data().eliminandoDefinitivamente === true) throw new Error('La categoría está siendo eliminada definitivamente.');
    transaccion.update(referencia, { activa: false, visibleEnFormulario: false, actualizadoEn: serverTimestamp() });
  });
}

export async function recuperarCategoria(id) {
  await runTransaction(db, async (transaccion) => {
    const referencia = doc(db, COLECCION, id);
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    if (documento.data().eliminandoDefinitivamente === true) throw new Error('La categoría está siendo eliminada definitivamente.');
    transaccion.update(referencia, { activa: true, actualizadoEn: serverTimestamp() });
  });
}

/**
 * Elimina definitivamente una categoría archivada solo si no quedan registros
 * asociados ni en datos ni en papelera. Primero bloquea nuevas referencias
 * mediante un campo que también comprueban las reglas de Firestore.
 *
 * Las categorías iniciales dejan un marcador de índice para evitar que la
 * inicialización automática vuelva a crearlas en el próximo ingreso.
 */
export async function eliminarCategoriaDefinitivamente(id) {
  const referenciaCategoria = doc(db, COLECCION, id);
  let datosCategoria = null;

  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaCategoria);
    if (!documento.exists()) throw new Error('La categoría ya no existe. Actualizá la pantalla.');
    const actuales = documento.data();
    if (actuales.activa) throw new Error('Primero tenés que eliminar la categoría desde Administración.');
    if (actuales.eliminandoDefinitivamente !== true) {
      transaccion.update(referenciaCategoria, {
        eliminandoDefinitivamente: true,
        actualizadoEn: serverTimestamp(),
      });
    }
    datosCategoria = actuales;
  });

  const liberarBloqueo = async () => {
    try {
      await runTransaction(db, async (transaccion) => {
        const documento = await transaccion.get(referenciaCategoria);
        if (documento.exists() && documento.data().eliminandoDefinitivamente === true) {
          transaccion.update(referenciaCategoria, {
            eliminandoDefinitivamente: false,
            actualizadoEn: serverTimestamp(),
          });
        }
      });
    } catch (error) {
      console.warn('No se pudo liberar el bloqueo temporal de la categoría:', error);
    }
  };

  try {
    const [registrosActivos, registrosPapelera] = await Promise.all([
      getDocsFromServer(query(collection(db, 'datos'), where('categoriaId', '==', id))),
      getDocsFromServer(query(collection(db, 'papelera'), where('categoriaId', '==', id))),
    ]);

    const cantidadActivos = registrosActivos.size;
    const cantidadPapelera = registrosPapelera.size;
    if (cantidadActivos > 0 || cantidadPapelera > 0) {
      await liberarBloqueo();
      const detalle = [];
      if (cantidadActivos > 0) detalle.push(`${cantidadActivos} ${cantidadActivos === 1 ? 'registro activo' : 'registros activos'}`);
      if (cantidadPapelera > 0) detalle.push(`${cantidadPapelera} ${cantidadPapelera === 1 ? 'registro en la papelera' : 'registros en la papelera'}`);
      throw new Error(`No se puede eliminar definitivamente esta categoría porque todavía tiene ${detalle.join(' y ')}. Eliminá esos registros definitivamente o reasignalos a otra categoría.`);
    }

    const idIndiceActual = crearIdCategoria(datosCategoria.nombre);
    const referenciaIndiceActual = doc(db, COLECCION_INDICES, idIndiceActual);
    const categoriaInicial = CATEGORIAS_INICIALES.find((categoria) => categoria.id === id);
    const referenciaEliminacionInicial = categoriaInicial
      ? doc(db, COLECCION_ELIMINADAS_DEFINITIVAMENTE, id)
      : null;

    await runTransaction(db, async (transaccion) => {
      const [documentoCategoria, documentoIndiceActual] = await Promise.all([
        transaccion.get(referenciaCategoria),
        transaccion.get(referenciaIndiceActual),
      ]);
      if (!documentoCategoria.exists()) throw new Error('La categoría ya fue eliminada. Actualizá la pantalla.');
      const actuales = documentoCategoria.data();
      if (actuales.activa) throw new Error('La categoría dejó de estar archivada. Actualizá la pantalla.');
      if (actuales.eliminandoDefinitivamente !== true) throw new Error('No se pudo bloquear la categoría para eliminarla. Intentá nuevamente.');

      transaccion.delete(referenciaCategoria);
      if (documentoIndiceActual.exists() && documentoIndiceActual.data().categoriaId === id) {
        transaccion.delete(referenciaIndiceActual);
      }
      if (actuales.inicial && referenciaEliminacionInicial) {
        transaccion.set(referenciaEliminacionInicial, {
          categoriaId: id,
          nombreInicial: categoriaInicial.nombre,
          eliminadoEn: serverTimestamp(),
        });
      }
    });

    return true;
  } catch (error) {
    await liberarBloqueo();
    throw error;
  }
}

