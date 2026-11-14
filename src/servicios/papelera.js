import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { DIAS_PAPELERA } from '../configuracion.js';
import { estaVencido, fechaAFechaJS, obtenerIdsPapeleraVencida } from '../utilidades/normalizacion.js';

const MILISEGUNDOS_POR_DIA = 86_400_000;

export function obtenerFechaVencimiento(registro) {
  const fechaEliminacion = fechaAFechaJS(registro?.eliminadoEn);
  if (!fechaEliminacion) return null;
  return new Date(fechaEliminacion.getTime() + DIAS_PAPELERA * MILISEGUNDOS_POR_DIA);
}

export function observarPapelera(alCambiar, alError) {
  return onSnapshot(collection(db, 'papelera'), (snapshot) => {
    alCambiar(snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}


/**
 * Elimina físicamente los registros vencidos al iniciar una sesión autorizada.
 * No requiere políticas TTL ni habilitar facturación adicional.
 * La papelera es pequeña por diseño; las eliminaciones se agrupan en lotes
 * de hasta 450 documentos para respetar los límites de Firestore.
 */
export async function eliminarPapeleraVencida(ahora = new Date()) {
  const referenciaColeccion = collection(db, 'papelera');
  const snapshot = await getDocs(referenciaColeccion);
  const idsVencidos = new Set(obtenerIdsPapeleraVencida(
    snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })),
    DIAS_PAPELERA,
    ahora,
  ));
  const vencidos = snapshot.docs.filter((documento) => idsVencidos.has(documento.id));

  for (let inicio = 0; inicio < vencidos.length; inicio += 450) {
    const lote = writeBatch(db);
    vencidos.slice(inicio, inicio + 450).forEach((documento) => lote.delete(documento.ref));
    await lote.commit();
  }

  return vencidos.length;
}

export async function enviarAPapelera(registro) {
  const referenciaDato = doc(db, 'datos', registro.id);
  const referenciaPapelera = doc(db, 'papelera', registro.id);

  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDato);
    if (!documento.exists()) throw new Error('El dato ya no está disponible. Actualizá la pantalla.');
    const datosActuales = documento.data();
    transaccion.set(referenciaPapelera, {
      ...datosActuales,
      eliminadoEn: serverTimestamp(),
    });
    transaccion.delete(referenciaDato);
  });
}

export async function restaurarDato(registro) {
  if (estaVencido(obtenerFechaVencimiento(registro))) {
    throw new Error('El plazo de recuperación terminó. Este dato ya no se puede restaurar.');
  }
  const referenciaDato = doc(db, 'datos', registro.id);
  const referenciaPapelera = doc(db, 'papelera', registro.id);

  await runTransaction(db, async (transaccion) => {
    const documentoPapelera = await transaccion.get(referenciaPapelera);
    if (!documentoPapelera.exists()) throw new Error('El dato ya no está en la papelera.');
    const datosActuales = documentoPapelera.data();
    if (estaVencido(obtenerFechaVencimiento(datosActuales))) throw new Error('El plazo de recuperación terminó.');
    transaccion.set(referenciaDato, {
      categoriaId: datosActuales.categoriaId,
      nombre: datosActuales.nombre,
      dato: datosActuales.dato,
      observacion: datosActuales.observacion || '',
      creadoEn: datosActuales.creadoEn,
      creadoPor: datosActuales.creadoPor,
      editadoEn: datosActuales.editadoEn || null,
      editadoPor: datosActuales.editadoPor || null,
    });
    transaccion.delete(referenciaPapelera);
  });
}

export async function eliminarDefinitivamente(id) {
  const referencia = doc(db, 'papelera', id);
  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referencia);
    if (!documento.exists()) return;
    transaccion.delete(referencia);
  });
}
