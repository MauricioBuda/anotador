import './estilos.css';
import { firebaseConfigurado, VARIABLES_FIREBASE_FALTANTES } from './firebase.js';
import { DIAS_PAPELERA } from './configuracion.js';
import { iniciarSesionGoogle, escucharAutenticacion, cerrarSesion } from './servicios/autenticacion.js';
import {
  observarCategorias,
  inicializarCategorias,
  crearCategoria,
  actualizarCategoria,
  cambiarVisibilidadCategoria,
  archivarCategoria,
  recuperarCategoria,
} from './servicios/categorias.js';
import { observarDatos, crearDato, crearDatoConCategoriaNueva, actualizarDato } from './servicios/datos.js';
import { observarPapelera, obtenerFechaVencimiento, eliminarPapeleraVencida, enviarAPapelera, restaurarDato, eliminarDefinitivamente } from './servicios/papelera.js';
import { normalizarTexto, escaparHTML, formatearFechaArgentina, diasRestantes, compararCategorias, compararCategoriasAdministracion } from './utilidades/normalizacion.js';
import { renderizarIcono, renderizarSelectorIconos, conectarSelectorIconos, establecerIconoSelector, interpretarValorIcono } from './utilidades/iconos.js';
import { mostrarNotificacion, mostrarCarga, ocultarCarga } from './interfaz/notificaciones.js';
import { confirmarAccion, abrirFormularioDato, cerrarModal } from './interfaz/dialogos.js';
import {
  plantillaLogin,
  plantillaAplicacion,
  plantillaBotonCategoria,
  plantillaRegistros,
  plantillaResultadosBusqueda,
  icono,
} from './interfaz/plantillas.js';

const raiz = document.getElementById('app');

let usuarioActual = null;
let canceladores = [];
let categorias = [];
let datos = [];
let papelera = [];
let categoriaSeleccionada = null;
let datosAbiertos = true;
let formularioAbierto = false;
let busquedaAbierta = false;
let textoBusqueda = '';
let registrosRevelados = new Set();
let primerSnapshot = { categorias: false, datos: false, papelera: false };
let bloqueoInicialActivo = false;
let pestanaAdministracionActual = 'categorias';
let formularioCategoriaAdminAbierto = false;

function mostrarConfiguracionPendiente() {
  raiz.innerHTML = `
    <main class="pantalla-configuracion">
      <section class="tarjeta-configuracion">
        <img class="marca-login" src="/favicon.png" alt="" />
        <p class="sobretitulo">PRIMERA CONFIGURACIÓN</p>
        <h1>Conectá Mi anotador con Firebase</h1>
        <p>La aplicación está preparada, pero faltan variables de configuración del proyecto Firebase o sus nombres no coinciden.</p>
        <p>Variables que Vite no encontró:</p>
        <ul class="lista-configuracion">${VARIABLES_FIREBASE_FALTANTES.map((variable) => `<li><code>${escaparHTML(variable)}</code></li>`).join('')}</ul>
        <ol>
          <li>Creá un proyecto Firebase nuevo y registrá una aplicación web.</li>
          <li>Copiá los valores de configuración en un archivo llamado <code>.env</code>.</li>
          <li>Activá Google en Authentication, creá Firestore y publicá <code>firestore.rules</code>.</li>
        </ol>
        <p class="texto-configuracion">En <code>.env</code> no pegues el objeto JavaScript de Firebase. Usá el formato <code>VITE_FIREBASE_NOMBRE=valor</code>, sin comas. Después guardá el archivo y reiniciá Vite con <code>Ctrl + C</code> y <code>npm run dev</code>. Los pasos completos están en <strong>README.md</strong>.</p>
      </section>
    </main>`;
}

function mostrarLogin(error = '') {
  ocultarCarga();
  detenerObservadores();
  usuarioActual = null;
  raiz.innerHTML = plantillaLogin({ correoNoAutorizado: error });
  document.getElementById('boton-ingresar')?.addEventListener('click', async () => {
    try {
      mostrarCarga('Conectando con Google…');
      await iniciarSesionGoogle();
    } catch (errorInicio) {
      mostrarNotificacion(mensajeError(errorInicio), 'error');
    } finally {
      ocultarCarga();
    }
  });
}

function detenerObservadores() {
  canceladores.forEach((cancelar) => cancelar?.());
  canceladores = [];
  primerSnapshot = { categorias: false, datos: false, papelera: false };
}

function mostrarAplicacion(usuario) {
  usuarioActual = usuario;
  categorias = [];
  datos = [];
  papelera = [];
  categoriaSeleccionada = null;
  registrosRevelados.clear();
  datosAbiertos = true;
  formularioAbierto = false;
  busquedaAbierta = false;
  textoBusqueda = '';
  primerSnapshot = { categorias: false, datos: false, papelera: false };
  bloqueoInicialActivo = true;

  raiz.innerHTML = plantillaAplicacion(usuario);
  conectarEventosAplicacion();
  conectarSelectorIconos(raiz);
  renderizarEstadoInterfaz();
  mostrarCarga('Preparando tu espacio compartido…');

  const resolverPrimeraCarga = () => {
    if (Object.values(primerSnapshot).every(Boolean) && bloqueoInicialActivo) {
      bloqueoInicialActivo = false;
      ocultarCarga();
    }
  };
  const manejarError = (error) => {
    console.error('Error de sincronización:', error);
    if (bloqueoInicialActivo) {
      bloqueoInicialActivo = false;
      ocultarCarga();
    }
    mostrarNotificacion(mensajeError(error), 'error');
  };

  inicializarCategorias(usuario).then(async () => {
    // La limpieza se ejecuta con una sesión autorizada, sin depender de TTL.
    // Si falla por conectividad, la aplicación sigue disponible y la papelera
    // igualmente oculta los registros vencidos y bloquea su restauración.
    try {
      const eliminados = await eliminarPapeleraVencida();
      if (eliminados > 0) {
        console.info(`Papelera: ${eliminados} registro(s) vencido(s) eliminado(s).`);
      }
    } catch (errorLimpieza) {
      console.warn('No se pudo completar la limpieza de la papelera en este ingreso:', errorLimpieza);
      mostrarNotificacion('No se pudo completar la limpieza de la papelera. Se volverá a intentar en el próximo ingreso.', 'error');
    }
    if (usuarioActual?.uid !== usuario.uid) return;
    canceladores = [
      observarCategorias((resultado) => {
        categorias = resultado;
        primerSnapshot.categorias = true;
        renderizarEstadoInterfaz();
        if (document.querySelector('.modal-administracion')) renderizarModalAdministracion(pestanaAdministracionActual);
        resolverPrimeraCarga();
      }, manejarError),
      observarDatos((resultado) => {
        datos = resultado;
        primerSnapshot.datos = true;
        renderizarEstadoInterfaz();
        resolverPrimeraCarga();
      }, manejarError),
      observarPapelera((resultado) => {
        papelera = resultado.filter((registro) => diasRestantes(obtenerFechaVencimiento(registro)) > 0);
        primerSnapshot.papelera = true;
        renderizarEstadoInterfaz();
        if (document.querySelector('.modal-administracion')) renderizarModalAdministracion(pestanaAdministracionActual);
        resolverPrimeraCarga();
      }, manejarError),
    ];
  }).catch((error) => {
    console.error('No se pudieron preparar las categorías iniciales:', error);
    if (bloqueoInicialActivo) {
      bloqueoInicialActivo = false;
      ocultarCarga();
    }
    mostrarNotificacion(`No se pudieron preparar las categorías. ${mensajeError(error)}`, 'error');
  });
}

function conectarEventosAplicacion() {
  document.getElementById('boton-cerrar-sesion')?.addEventListener('click', async () => {
    try {
      mostrarCarga('Cerrando sesión…');
      await cerrarSesion();
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
    } finally {
      ocultarCarga();
    }
  });

  document.getElementById('boton-administrar')?.addEventListener('click', () => abrirAdministracion('categorias'));
  document.getElementById('boton-busqueda')?.addEventListener('click', () => {
    busquedaAbierta = !busquedaAbierta;
    textoBusqueda = '';
    const panel = document.getElementById('panel-busqueda');
    panel?.classList.toggle('oculto', !busquedaAbierta);
    if (busquedaAbierta) {
      registrosRevelados.clear();
      renderizarContenidoCategoria();
    }
    const entrada = document.getElementById('entrada-busqueda');
    if (busquedaAbierta) entrada?.focus();
    else if (entrada) entrada.value = '';
    renderizarBusqueda();
  });

  document.getElementById('cerrar-busqueda')?.addEventListener('click', () => {
    busquedaAbierta = false;
    textoBusqueda = '';
    document.getElementById('panel-busqueda')?.classList.add('oculto');
    const entrada = document.getElementById('entrada-busqueda');
    if (entrada) entrada.value = '';
  });

  document.getElementById('entrada-busqueda')?.addEventListener('input', (evento) => {
    textoBusqueda = evento.target.value;
    renderizarBusqueda();
  });

  raiz.addEventListener('click', manejarClickAplicacion);
  raiz.addEventListener('keydown', manejarTecladoAplicacion);
  document.getElementById('formulario-nuevo-dato')?.addEventListener('submit', guardarNuevoDato);
  document.getElementById('categoria-nuevo-dato')?.addEventListener('change', (evento) => {
    const campoNuevo = document.getElementById('campo-categoria-nueva');
    const crearNueva = evento.target.value === '__agregar_categoria__';
    campoNuevo?.classList.toggle('oculto', !crearNueva);
    document.getElementById('nombre-categoria-nueva')?.toggleAttribute('required', crearNueva);
    if (crearNueva) document.getElementById('nombre-categoria-nueva')?.focus();
  });
}

function manejarClickAplicacion(evento) {
  if (evento.target.closest('[data-crear-categoria]')) {
    abrirAdministracion('categorias', true);
    return;
  }

  const botonAcordeon = evento.target.closest('[data-acordeon]');
  if (botonAcordeon) {
    const tipo = botonAcordeon.dataset.acordeon;
    if (tipo === 'formulario') {
      formularioAbierto = !formularioAbierto;
      if (formularioAbierto) registrosRevelados.clear();
    } else {
      datosAbiertos = !datosAbiertos;
      if (!datosAbiertos) {
        categoriaSeleccionada = null;
        registrosRevelados.clear();
      }
    }
    renderizarEstadoInterfaz();
    return;
  }

  const botonCategoria = evento.target.closest('[data-categoria]');
  if (botonCategoria) {
    const id = botonCategoria.dataset.categoria;
    categoriaSeleccionada = categoriaSeleccionada === id ? null : id;
    registrosRevelados.clear();
    renderizarEstadoInterfaz();
    return;
  }

  const resultadoBusqueda = evento.target.closest('[data-abrir-resultado]');
  if (resultadoBusqueda) {
    const registro = datos.find((item) => item.id === resultadoBusqueda.dataset.abrirResultado);
    if (!registro) return;
    categoriaSeleccionada = registro.categoriaId;
    registrosRevelados.clear();
    datosAbiertos = true;
    busquedaAbierta = false;
    textoBusqueda = '';
    document.getElementById('panel-busqueda')?.classList.add('oculto');
    const entrada = document.getElementById('entrada-busqueda');
    if (entrada) entrada.value = '';
    renderizarEstadoInterfaz();
    return;
  }

  const accion = evento.target.closest('[data-accion]');
  if (accion) {
    if (accion.dataset.accion === 'tooltip') {
      accion.classList.toggle('tooltip-visible');
      return;
    }
    const tarjeta = accion.closest('[data-registro]');
    if (!tarjeta) return;
    const registro = datos.find((item) => item.id === tarjeta.dataset.registro);
    if (!registro) return;
    ejecutarAccionDato(accion.dataset.accion, registro);
  }
}

function manejarTecladoAplicacion(evento) {
  if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('[data-accion="tooltip"]')) {
    evento.preventDefault();
    evento.target.classList.toggle('tooltip-visible');
  }
}

async function guardarNuevoDato(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const valores = new FormData(formulario);
  try {
    mostrarCarga('Guardando dato…');
    const categoriaIdSeleccionada = String(valores.get('categoriaId') || '');
    const datosNuevoRegistro = {
      nombre: valores.get('nombre'),
      dato: valores.get('dato'),
      observacion: valores.get('observacion'),
      usuario: usuarioActual,
    };
    if (categoriaIdSeleccionada === '__agregar_categoria__') {
      await crearDatoConCategoriaNueva({
        ...datosNuevoRegistro,
        nombreCategoria: valores.get('nombreCategoriaNueva'),
        icono: interpretarValorIcono(String(valores.get('iconoCategoriaNueva') || 'vector:folder')),
      });
    } else {
      await crearDato({ ...datosNuevoRegistro, categoriaId: categoriaIdSeleccionada });
    }
    formulario.reset();
    const campoNuevo = document.getElementById('campo-categoria-nueva');
    campoNuevo?.classList.add('oculto');
    document.getElementById('nombre-categoria-nueva')?.removeAttribute('required');
    establecerIconoSelector(raiz, 'iconoCategoriaNueva', 'vector:folder');
    mostrarNotificacion('El dato se guardó correctamente.');
  } catch (error) {
    mostrarNotificacion(mensajeError(error), 'error');
  } finally {
    ocultarCarga();
  }
}

function ejecutarAccionDato(accion, registro) {
  if (accion === 'revelar') {
    if (registrosRevelados.has(registro.id)) registrosRevelados.delete(registro.id);
    else registrosRevelados.add(registro.id);
    renderizarContenidoCategoria();
    return;
  }
  if (accion === 'copiar') {
    copiarDato(registro.dato);
    return;
  }
  if (accion === 'editar') {
    editarRegistro(registro);
    return;
  }
  if (accion === 'eliminar') {
    eliminarRegistro(registro);
  }
}

async function copiarDato(valor) {
  try {
    mostrarCarga('Copiando dato…');
    if (!navigator.clipboard?.writeText) throw new Error('El navegador no permite copiar desde esta página. Abrí la aplicación mediante HTTPS o localhost.');
    await navigator.clipboard.writeText(valor);
    mostrarNotificacion('Dato copiado al portapapeles.');
  } catch (error) {
    mostrarNotificacion(mensajeError(error), 'error');
  } finally {
    ocultarCarga();
  }
}

function editarRegistro(registro) {
  abrirFormularioDato({ registro, categorias, editar: true });
  const formulario = document.getElementById('formulario-modal-dato');
  formulario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const valores = new FormData(formulario);
    const cambios = {
      categoriaId: String(valores.get('categoriaId') || ''),
      nombre: valores.get('nombre'),
      dato: valores.get('dato'),
      observacion: valores.get('observacion'),
      usuario: usuarioActual,
    };
    const confirmado = await confirmarAccion({
      titulo: 'Confirmar edición',
      mensaje: '¿Querés guardar los cambios de este dato? La fecha original de creación se va a conservar.',
      textoConfirmar: 'Guardar cambios',
    });
    if (!confirmado) {
      editarRegistro({ ...registro, ...cambios });
      return;
    }
    try {
      mostrarCarga('Actualizando dato…');
      await actualizarDato(registro.id, cambios);
      registrosRevelados.delete(registro.id);
      cerrarModal();
      mostrarNotificacion('Los cambios se guardaron correctamente.');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
      editarRegistro({ ...registro, ...cambios });
    } finally {
      ocultarCarga();
    }
  });
}

async function eliminarRegistro(registro) {
  const confirmado = await confirmarAccion({
    titulo: 'Enviar a la papelera',
    mensaje: `¿Querés eliminar «${registro.nombre}»? El dato se podrá restaurar desde la papelera durante ${DIAS_PAPELERA} días. Después dejará de estar disponible.`,
    textoConfirmar: 'Enviar a papelera',
    peligro: true,
  });
  if (!confirmado) return;
  try {
    mostrarCarga('Moviendo dato a la papelera…');
    await enviarAPapelera(registro);
    registrosRevelados.delete(registro.id);
    mostrarNotificacion(`Dato enviado a la papelera. Podés restaurarlo durante ${DIAS_PAPELERA} días.`);
  } catch (error) {
    mostrarNotificacion(mensajeError(error), 'error');
  } finally {
    ocultarCarga();
  }
}

function renderizarEstadoInterfaz() {
  if (!usuarioActual) return;
  renderizarAcordeones();
  renderizarSelectorCategorias();
  renderizarBotonesCategorias();
  renderizarContenidoCategoria();
  renderizarBusqueda();
}

function actualizarEstadoDesplegable(envoltorio, abierto) {
  if (!envoltorio) return;
  const yaEstabaAbierto = envoltorio.classList.contains('abierto');
  const contenido = envoltorio.firstElementChild;
  envoltorio.setAttribute('aria-hidden', String(!abierto));
  envoltorio.inert = !abierto;

  // Las actualizaciones de Firestore no deben reiniciar una transición ya terminada.
  if (yaEstabaAbierto === abierto) {
    if (!abierto) {
      envoltorio.style.overflow = 'hidden';
      if (contenido) contenido.style.overflow = 'hidden';
    }
    return;
  }

  envoltorio.classList.toggle('abierto', abierto);
  envoltorio.style.overflow = 'hidden';
  if (contenido) contenido.style.overflow = 'hidden';
  if (!abierto) return;

  const permitirDesbordeAlFinalizar = (evento) => {
    if (evento.target !== envoltorio || evento.propertyName !== 'grid-template-rows') return;
    envoltorio.style.overflow = 'visible';
    if (contenido) contenido.style.overflow = 'visible';
    envoltorio.removeEventListener('transitionend', permitirDesbordeAlFinalizar);
  };
  envoltorio.addEventListener('transitionend', permitirDesbordeAlFinalizar);
}

function renderizarAcordeones() {
  const botonFormulario = document.querySelector('[data-acordeon="formulario"]');
  const envoltorioFormulario = document.getElementById('envoltorio-nuevo-dato');
  botonFormulario?.setAttribute('aria-expanded', String(formularioAbierto));
  actualizarEstadoDesplegable(envoltorioFormulario, formularioAbierto);
  botonFormulario?.classList.toggle('acordeon-abierto', formularioAbierto);

  const botonDatos = document.querySelector('[data-acordeon="datos"]');
  const envoltorioDatos = document.getElementById('envoltorio-datos');
  botonDatos?.setAttribute('aria-expanded', String(datosAbiertos));
  actualizarEstadoDesplegable(envoltorioDatos, datosAbiertos);
  botonDatos?.classList.toggle('acordeon-abierto', datosAbiertos);
}

function categoriasVisiblesEnFormulario() {
  return categorias
    .filter((categoria) => categoria.activa && categoria.visibleEnFormulario)
    .sort(compararCategorias);
}

function renderizarSelectorCategorias() {
  const selector = document.getElementById('categoria-nuevo-dato');
  if (!selector) return;
  const valorActual = selector.value;
  const opciones = categoriasVisiblesEnFormulario().map((categoria) => (
    `<option value="${escaparHTML(categoria.id)}">${escaparHTML(categoria.nombre)}</option>`
  )).join('');
  selector.innerHTML = `<option value="">Seleccionar categoría</option>${opciones}<option value="__agregar_categoria__">＋ Agregar categoría</option>`;
  if ([...selector.options].some((opcion) => opcion.value === valorActual)) selector.value = valorActual;

}

function categoriasParaPantalla() {
  const idsConDatos = new Set(datos.map((registro) => registro.categoriaId));
  return categorias
    .filter((categoria) => categoria.activa || idsConDatos.has(categoria.id))
    .sort(compararCategorias);
}

function categoriaNombre(categoria) {
  return categoria.nombre || 'Categoría';
}

function renderizarBotonesCategorias() {
  const contenedor = document.getElementById('botones-categorias');
  if (!contenedor) return;
  const lista = categoriasParaPantalla();
  contenedor.innerHTML = lista.map((categoria) => {
    const cantidad = datos.filter((registro) => registro.categoriaId === categoria.id).length;
    return plantillaBotonCategoria(categoria, cantidad, categoriaSeleccionada === categoria.id);
  }).join('') + `<button class="boton-categoria boton-nueva-categoria" type="button" data-crear-categoria aria-label="Crear nueva categoría"><span class="icono-categoria">${icono('plus')}</span><span class="texto-categoria">Nueva categoría</span></button>`;
}

function renderizarContenidoCategoria() {
  const contenedor = document.getElementById('contenido-categoria');
  if (!contenedor) return;
  if (!categoriaSeleccionada) {
    contenedor.innerHTML = `<div class="estado-sin-seleccion"><span class="estado-icono">${icono('folder')}</span><p>Seleccioná una categoría para consultar sus datos.</p></div>`;
    return;
  }
  const categoria = categorias.find((item) => item.id === categoriaSeleccionada);
  if (!categoria) {
    categoriaSeleccionada = null;
    contenedor.innerHTML = `<div class="estado-sin-seleccion"><p>La categoría seleccionada ya no está disponible.</p></div>`;
    return;
  }
  const registros = datos
    .filter((registro) => registro.categoriaId === categoriaSeleccionada)
    .sort((a, b) => fechaEnMilisegundos(b.creadoEn) - fechaEnMilisegundos(a.creadoEn));
  contenedor.innerHTML = plantillaRegistros({ categoria, registros, revelados: registrosRevelados });
}

function fechaEnMilisegundos(valor) {
  if (!valor) return 0;
  if (typeof valor.toMillis === 'function') return valor.toMillis();
  if (typeof valor.toDate === 'function') return valor.toDate().getTime();
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? 0 : fecha.getTime();
}

function renderizarBusqueda() {
  const contenedor = document.getElementById('resultados-busqueda');
  if (!contenedor || !busquedaAbierta) return;
  const termino = normalizarTexto(textoBusqueda);
  if (!termino) {
    contenedor.innerHTML = '<p class="sin-resultados">Escribí una categoría o el nombre de un dato para buscar.</p>';
    return;
  }
  const coincidencias = datos.filter((registro) => {
    const categoria = categorias.find((item) => item.id === registro.categoriaId);
    return normalizarTexto(registro.nombre).includes(termino) || normalizarTexto(categoria?.nombre || '').includes(termino);
  }).sort((a, b) => fechaEnMilisegundos(b.creadoEn) - fechaEnMilisegundos(a.creadoEn));
  contenedor.innerHTML = plantillaResultadosBusqueda(coincidencias, categorias);
}

function abrirAdministracion(pestana = 'categorias', abrirFormularioNuevaCategoria = false) {
  registrosRevelados.clear();
  formularioCategoriaAdminAbierto = pestana === 'categorias' && abrirFormularioNuevaCategoria;
  renderizarContenidoCategoria();
  renderizarModalAdministracion(pestana);
}

function renderizarModalAdministracion(pestana = 'categorias') {
  const contenedor = document.getElementById('contenedor-modales');
  const modalExiste = Boolean(contenedor.querySelector('.modal-administracion'));

  if (!modalExiste) {
    pestanaAdministracionActual = pestana;
    contenedor.innerHTML = `
      <div class="fondo-modal" data-cerrar-fondo="true">
        <section class="modal modal-administracion" role="dialog" aria-modal="true" aria-labelledby="titulo-administracion">
          <div class="modal-encabezado">
            <div><span class="modal-kicker">Configuración</span><h2 id="titulo-administracion">Administrar Mi anotador</h2></div>
            <button class="boton-icono" type="button" data-cerrar-modal aria-label="Cerrar">${icono('x')}</button>
          </div>
          <div class="pestanas-administracion">
            <button type="button" class="pestana" data-admin-pestana="categorias" aria-pressed="false">Categorías</button>
            <button type="button" class="pestana" data-admin-pestana="papelera" aria-pressed="false">Papelera <span data-conteo-papelera>${papelera.length}</span></button>
          </div>
          <div class="panel-contenido-administracion" id="panel-contenido-administracion" data-pestana=""></div>
        </section>
      </div>`;

    contenedor.querySelector('[data-cerrar-modal]')?.addEventListener('click', cerrarModal);
    contenedor.querySelector('.fondo-modal')?.addEventListener('click', (evento) => {
      if (evento.target.classList.contains('fondo-modal')) cerrarModal();
    });
    contenedor.querySelectorAll('[data-admin-pestana]').forEach((boton) => boton.addEventListener('click', () => {
      const pestanaSolicitada = boton.dataset.adminPestana;
      // Una pestaña activa no debe volver a renderizarse ni provocar parpadeos.
      if (pestanaSolicitada === pestanaAdministracionActual) return;
      formularioCategoriaAdminAbierto = false;
      renderizarModalAdministracion(pestanaSolicitada);
    }));

    const panel = contenedor.querySelector('#panel-contenido-administracion');
    panel.addEventListener('click', manejarClickPanelAdministracion);
    panel.addEventListener('submit', (evento) => {
      if (evento.target?.id === 'formulario-nueva-categoria-admin') {
        crearCategoriaDesdeAdministracion(evento);
      }
    });
  } else if (pestana !== pestanaAdministracionActual) {
    formularioCategoriaAdminAbierto = false;
    pestanaAdministracionActual = pestana;
  }

  actualizarPestanasAdministracion(contenedor);
  const panel = contenedor.querySelector('#panel-contenido-administracion');
  const pestanaRenderizada = panel.dataset.pestana;

  if (pestanaRenderizada !== pestana) {
    panel.dataset.pestana = pestana;
    panel.scrollTop = 0;
    panel.innerHTML = pestana === 'categorias'
      ? plantillaPanelCategoriasAdministracion()
      : plantillaPanelPapeleraAdministracion();

    if (pestana === 'categorias') {
      conectarSelectorIconos(panel);
      actualizarDesplegableNuevaCategoria();
    }
    return;
  }

  // En las actualizaciones de Firestore se reemplaza únicamente la lista.
  // El modal, las pestañas, el formulario abierto y su foco permanecen intactos.
  if (pestana === 'categorias') {
    const lista = panel.querySelector('.lista-administracion-categorias');
    if (lista) lista.innerHTML = plantillaListaCategoriasAdministracion();
  } else {
    const lista = panel.querySelector('.lista-papelera');
    if (lista) lista.innerHTML = plantillaListaPapeleraAdministracion();
  }
  const conteoPapelera = contenedor.querySelector('[data-conteo-papelera]');
  if (conteoPapelera) conteoPapelera.textContent = String(papelera.length);
}

function actualizarPestanasAdministracion(contenedor) {
  contenedor.querySelectorAll('[data-admin-pestana]').forEach((boton) => {
    const activa = boton.dataset.adminPestana === pestanaAdministracionActual;
    boton.classList.toggle('activa', activa);
    boton.setAttribute('aria-pressed', String(activa));
  });
  const conteoPapelera = contenedor.querySelector('[data-conteo-papelera]');
  if (conteoPapelera) conteoPapelera.textContent = String(papelera.length);
}

function plantillaListaCategoriasAdministracion() {
  const listaCategorias = categorias.slice().sort(compararCategoriasAdministracion);
  if (!listaCategorias.length) return '<p class="sin-resultados">Todavía no hay categorías.</p>';
  return listaCategorias.map((categoria) => {
    const archivada = !categoria.activa;
    return `<article class="fila-administracion-categoria ${archivada ? 'categoria-inactiva' : ''}">
      <span class="icono-admin-categoria">${renderizarIcono(categoria.icono)}</span>
      <div class="texto-admin-categoria"><strong>${escaparHTML(categoria.nombre)}</strong><small>${archivada ? 'Eliminada · recuperable' : categoria.visibleEnFormulario ? 'Visible en nuevas cargas' : 'Oculta en nuevas cargas'}</small></div>
      <div class="acciones-admin-categoria">
        ${!archivada ? `<button type="button" class="boton-icono" data-admin-accion="visibilidad" data-id="${escaparHTML(categoria.id)}" aria-label="${categoria.visibleEnFormulario ? 'Ocultar' : 'Mostrar'} en formulario" title="${categoria.visibleEnFormulario ? 'Ocultar en formulario' : 'Mostrar en formulario'}">${icono(categoria.visibleEnFormulario ? 'eye' : 'eye-off')}</button><button type="button" class="boton-icono" data-admin-accion="editar" data-id="${escaparHTML(categoria.id)}" aria-label="Editar categoría" title="Editar">${icono('pencil')}</button><button type="button" class="boton-icono accion-eliminar" data-admin-accion="archivar" data-id="${escaparHTML(categoria.id)}" aria-label="Eliminar categoría" title="Eliminar">${icono('trash-2')}</button>` : `<button type="button" class="boton boton-secundario boton-chico" data-admin-accion="recuperar" data-id="${escaparHTML(categoria.id)}">Recuperar</button>`}
      </div>
    </article>`;
  }).join('');
}

function plantillaListaPapeleraAdministracion() {
  if (!papelera.length) {
    return '<div class="estado-vacio-papelera"><span class="estado-icono">' + icono('archive') + '</span><strong>La papelera está vacía</strong><span>Los datos que elimines van a aparecer acá durante 10 días.</span></div>';
  }
  return papelera.slice()
    .sort((a, b) => fechaEnMilisegundos(b.eliminadoEn) - fechaEnMilisegundos(a.eliminadoEn))
    .map((registro) => {
      const categoria = categorias.find((item) => item.id === registro.categoriaId);
      const restantes = diasRestantes(obtenerFechaVencimiento(registro));
      return `<article class="fila-papelera">
        <div class="texto-papelera"><strong>${escaparHTML(registro.nombre)}</strong><span>${escaparHTML(categoria?.nombre || 'Categoría no disponible')}</span><small>Eliminado: ${escaparHTML(formatearFechaArgentina(registro.eliminadoEn))} · Quedan ${restantes} ${restantes === 1 ? 'día' : 'días'}</small></div>
        <div class="acciones-papelera"><button class="boton boton-secundario boton-chico" type="button" data-papelera-accion="restaurar" data-id="${escaparHTML(registro.id)}">${icono('refresh-ccw')} Restaurar</button><button class="boton-icono accion-eliminar" type="button" data-papelera-accion="eliminar" data-id="${escaparHTML(registro.id)}" aria-label="Eliminar definitivamente" title="Eliminar definitivamente">${icono('trash-2')}</button></div>
      </article>`;
    }).join('');
}

function plantillaPanelCategoriasAdministracion() {
  return `<div class="contenido-administracion">
    <button class="fila-administracion-categoria tarjeta-agregar-categoria" type="button" data-toggle-nueva-categoria aria-expanded="${formularioCategoriaAdminAbierto}">
      <span class="icono-admin-categoria icono-agregar-categoria">${icono('plus')}</span>
      <span class="texto-admin-categoria"><strong>Agregar nueva categoría</strong></span>
      <span class="flecha-formulario-categoria">${icono('chevron-down')}</span>
    </button>
    <div class="desplegable-formulario-categoria ${formularioCategoriaAdminAbierto ? 'abierto' : ''}" id="desplegable-nueva-categoria-admin" aria-hidden="${!formularioCategoriaAdminAbierto}">
      <div class="desplegable-formulario-categoria-interior">
        <form id="formulario-nueva-categoria-admin" class="formulario-nueva-categoria" ${formularioCategoriaAdminAbierto ? '' : 'inert'}>
          <label class="campo"><span>Nombre de la categoría</span><input name="nombre" type="text" maxlength="50" required placeholder="Nombre de la categoría" /></label>
          <div class="campo campo-icono-nueva-categoria"><span>Icono</span>${renderizarSelectorIconos('icono')}</div>
          <div class="acciones-nueva-categoria"><button class="boton boton-secundario" type="button" data-cancelar-nueva-categoria>Cancelar</button><button class="boton boton-principal" type="submit">${icono('plus')} Agregar</button></div>
        </form>
      </div>
    </div>
    <div class="lista-administracion-categorias">${plantillaListaCategoriasAdministracion()}</div>
  </div>`;
}

function plantillaPanelPapeleraAdministracion() {
  return `<div class="contenido-administracion contenido-papelera">
    <p class="texto-ayuda-papelera">Los registros se conservan durante 10 días desde su eliminación. Después dejan de poder restaurarse y la aplicación los elimina cuando alguno de ustedes vuelve a ingresar.</p>
    <div class="lista-papelera">${plantillaListaPapeleraAdministracion()}</div>
  </div>`;
}

function actualizarDesplegableNuevaCategoria() {
  const envoltorio = document.getElementById('desplegable-nueva-categoria-admin');
  const tarjeta = document.querySelector('[data-toggle-nueva-categoria]');
  const formulario = document.getElementById('formulario-nueva-categoria-admin');
  if (!envoltorio || !formulario) return;
  envoltorio.classList.toggle('abierto', formularioCategoriaAdminAbierto);
  envoltorio.setAttribute('aria-hidden', String(!formularioCategoriaAdminAbierto));
  formulario.inert = !formularioCategoriaAdminAbierto;
  tarjeta?.setAttribute('aria-expanded', String(formularioCategoriaAdminAbierto));
  const interior = envoltorio.querySelector('.desplegable-formulario-categoria-interior');
  envoltorio.style.overflow = 'hidden';
  if (interior) interior.style.overflow = 'hidden';
  if (formularioCategoriaAdminAbierto) {
    const permitirDesbordeAlFinalizar = (evento) => {
      if (evento.target !== envoltorio || evento.propertyName !== 'grid-template-rows') return;
      envoltorio.style.overflow = 'visible';
      if (interior) interior.style.overflow = 'visible';
      envoltorio.removeEventListener('transitionend', permitirDesbordeAlFinalizar);
    };
    envoltorio.addEventListener('transitionend', permitirDesbordeAlFinalizar);
  }
}

function manejarClickPanelAdministracion(evento) {
  const toggleNueva = evento.target.closest('[data-toggle-nueva-categoria]');
  if (toggleNueva) {
    formularioCategoriaAdminAbierto = !formularioCategoriaAdminAbierto;
    actualizarDesplegableNuevaCategoria();
    if (formularioCategoriaAdminAbierto) {
      window.setTimeout(() => {
        if (formularioCategoriaAdminAbierto) document.querySelector('#formulario-nueva-categoria-admin input[name="nombre"]')?.focus();
      }, 600);
    }
    return;
  }

  if (evento.target.closest('[data-cancelar-nueva-categoria]')) {
    formularioCategoriaAdminAbierto = false;
    const formulario = document.getElementById('formulario-nueva-categoria-admin');
    formulario?.reset();
    establecerIconoSelector(document.getElementById('panel-contenido-administracion'), 'icono', 'vector:folder');
    actualizarDesplegableNuevaCategoria();
    return;
  }

  const accionCategoria = evento.target.closest('[data-admin-accion]');
  if (accionCategoria) {
    ejecutarAccionCategoria(accionCategoria.dataset.adminAccion, accionCategoria.dataset.id);
    return;
  }

  const accionPapelera = evento.target.closest('[data-papelera-accion]');
  if (accionPapelera) {
    ejecutarAccionPapelera(accionPapelera.dataset.papeleraAccion, accionPapelera.dataset.id);
  }
}

async function crearCategoriaDesdeAdministracion(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const valores = new FormData(formulario);
  try {
    mostrarCarga('Creando categoría…');
    await crearCategoria({
      nombre: valores.get('nombre'),
      icono: interpretarValorIcono(String(valores.get('icono') || 'vector:folder')),
      visibleEnFormulario: true,
      usuario: usuarioActual,
    });
    formularioCategoriaAdminAbierto = false;
    formulario.reset();
    establecerIconoSelector(document.getElementById('panel-contenido-administracion'), 'icono', 'vector:folder');
    actualizarDesplegableNuevaCategoria();
    mostrarNotificacion('La categoría se creó correctamente.');
    renderizarModalAdministracion('categorias');
  } catch (error) {
    mostrarNotificacion(mensajeError(error), 'error');
  } finally {
    ocultarCarga();
  }
}

async function ejecutarAccionCategoria(accion, id) {
  const categoria = categorias.find((item) => item.id === id);
  if (!categoria) return;

  if (accion === 'visibilidad') {
    try {
      mostrarCarga('Actualizando categoría…');
      await cambiarVisibilidadCategoria(id, !categoria.visibleEnFormulario);
      mostrarNotificacion(categoria.visibleEnFormulario ? 'La categoría se ocultó en nuevas cargas.' : 'La categoría ya está disponible en nuevas cargas.');
      renderizarModalAdministracion('categorias');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
    } finally {
      ocultarCarga();
    }
    return;
  }

  if (accion === 'editar') {
    editarCategoria(categoria);
    return;
  }

  if (accion === 'archivar') {
    const cantidad = datos.filter((registro) => registro.categoriaId === id).length;
    const confirmado = await confirmarAccion({
      titulo: 'Eliminar categoría',
      mensaje: `¿Querés eliminar «${categoria.nombre}»? ${cantidad ? `${cantidad} ${cantidad === 1 ? 'registro seguirá' : 'registros seguirán'} guardado${cantidad === 1 ? '' : 's'} y consultable${cantidad === 1 ? '' : 's'}.` : 'La categoría no tiene registros y dejará de aparecer en la pantalla principal.'} Podés recuperarla desde Administración.`,
      textoConfirmar: 'Eliminar categoría',
      peligro: true,
    });
    if (!confirmado) {
      renderizarModalAdministracion('categorias');
      return;
    }
    try {
      mostrarCarga('Eliminando categoría…');
      await archivarCategoria(id);
      if (categoriaSeleccionada === id) {
        categoriaSeleccionada = null;
        registrosRevelados.clear();
      }
      mostrarNotificacion('Categoría eliminada. Los registros asociados se conservaron.');
      renderizarModalAdministracion('categorias');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
    } finally {
      ocultarCarga();
    }
    return;
  }

  if (accion === 'recuperar') {
    try {
      mostrarCarga('Recuperando categoría…');
      await recuperarCategoria(id);
      mostrarNotificacion('La categoría se recuperó correctamente.');
      renderizarModalAdministracion('categorias');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
    } finally {
      ocultarCarga();
    }
  }
}

function editarCategoria(categoria) {
  const iconoActual = `${categoria.icono?.tipo || 'vector'}:${categoria.icono?.valor || 'folder'}`;
  const contenedor = document.getElementById('contenedor-modales');
  contenedor.innerHTML = `
    <div class="fondo-modal"><section class="modal modal-editar-categoria" role="dialog" aria-modal="true">
      <div class="modal-encabezado"><div><span class="modal-kicker">Administración</span><h2>Editar categoría</h2></div><button class="boton-icono" type="button" data-cerrar-modal aria-label="Cerrar">${icono('x')}</button></div>
      <form id="formulario-editar-categoria" class="formulario-modal">
        <label class="campo"><span>Nombre</span><input name="nombre" type="text" maxlength="50" required value="${escaparHTML(categoria.nombre)}" /></label>
        <div class="campo"><span>Icono</span>${renderizarSelectorIconos('icono', iconoActual)}</div>
        <div class="modal-acciones"><button class="boton boton-secundario" type="button" data-cerrar-modal>Cancelar</button><button class="boton boton-principal" type="submit">Revisar cambios</button></div>
      </form>
    </section></div>`;
  conectarSelectorIconos(contenedor);
  contenedor.querySelector('input[name="nombre"]')?.focus();
  contenedor.querySelectorAll('[data-cerrar-modal]').forEach((boton) => boton.addEventListener('click', () => renderizarModalAdministracion('categorias')));
  contenedor.querySelector('#formulario-editar-categoria')?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const valores = new FormData(evento.currentTarget);
    const cambios = {
      nombre: String(valores.get('nombre') || ''),
      icono: interpretarValorIcono(String(valores.get('icono') || 'vector:folder')),
    };
    const confirmado = await confirmarAccion({
      titulo: 'Confirmar cambios',
      mensaje: '¿Querés guardar el nuevo nombre y el icono de esta categoría? Los datos existentes seguirán asociados.',
      textoConfirmar: 'Guardar cambios',
    });
    if (!confirmado) {
      editarCategoria({ ...categoria, ...cambios });
      return;
    }
    try {
      mostrarCarga('Actualizando categoría…');
      await actualizarCategoria(categoria.id, cambios);
      mostrarNotificacion('La categoría se actualizó correctamente.');
      renderizarModalAdministracion('categorias');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
      editarCategoria({ ...categoria, ...cambios });
    } finally {
      ocultarCarga();
    }
  });
}

async function ejecutarAccionPapelera(accion, id) {
  const registro = papelera.find((item) => item.id === id);
  if (!registro) return;
  if (accion === 'restaurar') {
    try {
      mostrarCarga('Restaurando dato…');
      await restaurarDato(registro);
      mostrarNotificacion('El dato se restauró correctamente.');
      renderizarModalAdministracion('papelera');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
      renderizarModalAdministracion('papelera');
    } finally {
      ocultarCarga();
    }
    return;
  }

  if (accion === 'eliminar') {
    const confirmado = await confirmarAccion({
      titulo: 'Eliminar definitivamente',
      mensaje: `¿Querés eliminar definitivamente «${registro.nombre}»? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar definitivamente',
      peligro: true,
    });
    if (!confirmado) {
      renderizarModalAdministracion('papelera');
      return;
    }
    try {
      mostrarCarga('Eliminando definitivamente…');
      await eliminarDefinitivamente(id);
      mostrarNotificacion('El dato se eliminó definitivamente.');
      renderizarModalAdministracion('papelera');
    } catch (error) {
      mostrarNotificacion(mensajeError(error), 'error');
    } finally {
      ocultarCarga();
    }
  }
}

function mensajeError(error) {
  const codigo = error?.code || '';
  if (codigo === 'permission-denied') return 'Firebase rechazó la operación. Revisá que las reglas de Firestore estén publicadas y que la cuenta esté autorizada.';
  if (codigo === 'auth/popup-closed-by-user') return 'Se cerró la ventana de Google antes de completar el ingreso.';
  if (codigo === 'auth/popup-blocked') return 'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes para este sitio e intentá nuevamente.';
  if (codigo === 'unavailable' || codigo === 'deadline-exceeded') return 'No se pudo conectar con Firebase. Revisá la conexión e intentá nuevamente.';
  if (error?.message) return error.message;
  return 'Ocurrió un error inesperado. Revisá la conexión e intentá nuevamente.';
}

if (!firebaseConfigurado) {
  mostrarConfiguracionPendiente();
} else {
  raiz.innerHTML = `
    <main class="pantalla-inicial">
      <div class="spinner spinner-grande" aria-label="Cargando"></div>
      <p>Comprobando el acceso…</p>
    </main>`;
  let estadoInicialAutenticacionResuelto = false;
  const temporizadorAutenticacion = window.setTimeout(() => {
    if (estadoInicialAutenticacionResuelto) return;
    console.error('La autenticación de Firebase no informó el estado inicial dentro de 15 segundos.');
    mostrarLogin('La comprobación de tu sesión está tardando más de lo esperado. Revisá la conexión y la configuración de Firebase; después podés volver a intentar ingresar.');
  }, 15000);

  escucharAutenticacion((usuario, error) => {
    estadoInicialAutenticacionResuelto = true;
    window.clearTimeout(temporizadorAutenticacion);
    if (usuario) mostrarAplicacion(usuario);
    else mostrarLogin(error || '');
  }, (error) => {
    estadoInicialAutenticacionResuelto = true;
    window.clearTimeout(temporizadorAutenticacion);
    console.error('No se pudo comprobar el estado de autenticación:', error);
    mostrarLogin(`No se pudo comprobar el acceso con Google. ${mensajeError(error)}`);
  });
}

