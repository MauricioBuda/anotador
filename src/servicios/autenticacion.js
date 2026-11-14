import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { CORREOS_AUTORIZADOS } from '../configuracion.js';

const proveedorGoogle = new GoogleAuthProvider();
proveedorGoogle.setCustomParameters({ prompt: 'select_account' });

export function escucharAutenticacion(alCambiar, alError = () => {}) {
  return onAuthStateChanged(auth, async (usuario) => {
    try {
      if (!usuario) {
        alCambiar(null, null);
        return;
      }

      const correo = usuario.email?.trim().toLocaleLowerCase('es-AR') || '';
      const ingresoConGoogle = usuario.providerData?.some((proveedor) => proveedor.providerId === 'google.com');
      const autorizado = usuario.emailVerified && ingresoConGoogle && CORREOS_AUTORIZADOS.includes(correo);

      if (!autorizado) {
        await signOut(auth);
        alCambiar(null, 'Esta cuenta de Google no está autorizada para ingresar a Mi anotador.');
        return;
      }

      alCambiar(usuario, null);
    } catch (error) {
      alError(error);
    }
  }, alError);
}

export async function iniciarSesionGoogle() {
  const resultado = await signInWithPopup(auth, proveedorGoogle);
  const correo = resultado.user.email?.trim().toLocaleLowerCase('es-AR') || '';
  const ingresoConGoogle = resultado.user.providerData?.some((proveedor) => proveedor.providerId === 'google.com');
  if (!resultado.user.emailVerified || !ingresoConGoogle || !CORREOS_AUTORIZADOS.includes(correo)) {
    await signOut(auth);
    throw new Error('Esta cuenta de Google no está autorizada para ingresar a Mi anotador.');
  }
  return resultado.user;
}

export function cerrarSesion() {
  return signOut(auth);
}
