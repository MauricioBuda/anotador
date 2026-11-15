import { escaparHTML } from './normalizacion.js';

const ICONOS_VECTORIALES = {
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 9h18"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z"/>',
  'key-round': '<circle cx="8" cy="15" r="5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/><path d="m12.5 10.5 3 3"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  'id-card': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/>',
  contact: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c.8-1.5 2.1-2.2 4-2.2s3.2.7 4 2.2"/>',
  'credit-card': '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M7 15h3"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  car: '<path d="m5 17-1 2v2h3v-2h10v2h3v-2l-1-2"/><path d="m5 17 1.5-7h11L19 17M3 14h18M7 14h.01M17 14h.01"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  receipt: '<path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z"/><path d="M8 9h8M8 13h6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1L11 7.3h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  pencil: '<path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>',
  'trash-2': '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="m18 6-12 12M6 6l12 12"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'log-out': '<path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  'refresh-ccw': '<path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16m0 5v-5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
  'folder-plus': '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v6M9 14h6"/>',
};

export const OPCIONES_ICONOS = [
  { tipo: 'vector', valor: 'folder', etiqueta: 'Carpeta (genérico)' },
  { tipo: 'vector', valor: 'key-round', etiqueta: 'Llave' },
  { tipo: 'vector', valor: 'hash', etiqueta: 'Numeral' },
  { tipo: 'vector', valor: 'id-card', etiqueta: 'Documento' },
  { tipo: 'vector', valor: 'contact', etiqueta: 'Contacto' },
  { tipo: 'vector', valor: 'credit-card', etiqueta: 'Tarjeta' },
  { tipo: 'vector', valor: 'smartphone', etiqueta: 'Celular' },
  { tipo: 'vector', valor: 'shield', etiqueta: 'Escudo' },
  { tipo: 'vector', valor: 'home', etiqueta: 'Casa' },
  { tipo: 'vector', valor: 'wifi', etiqueta: 'Wi-Fi' },
  { tipo: 'vector', valor: 'mail', etiqueta: 'Correo' },
  { tipo: 'vector', valor: 'car', etiqueta: 'Vehículo' },
  { tipo: 'vector', valor: 'globe', etiqueta: 'Internet' },
  { tipo: 'vector', valor: 'user', etiqueta: 'Persona' },
  { tipo: 'vector', valor: 'briefcase', etiqueta: 'Trabajo' },
  { tipo: 'vector', valor: 'receipt', etiqueta: 'Comprobante' },
  { tipo: 'vector', valor: 'lock', etiqueta: 'Candado' },
  { tipo: 'vector', valor: 'file-text', etiqueta: 'Archivo' },
  { tipo: 'emoji', valor: '🔑', etiqueta: '🔑 Llave' },
  { tipo: 'emoji', valor: '🗂️', etiqueta: '🗂️ Carpeta' },
  { tipo: 'emoji', valor: '💳', etiqueta: '💳 Tarjeta' },
  { tipo: 'emoji', valor: '📱', etiqueta: '📱 Celular' },
  { tipo: 'emoji', valor: '🏦', etiqueta: '🏦 Banco' },
  { tipo: 'emoji', valor: '🪪', etiqueta: '🪪 Identificación' },
  { tipo: 'emoji', valor: '📄', etiqueta: '📄 Documento' },
  { tipo: 'emoji', valor: '🏠', etiqueta: '🏠 Hogar' },
  { tipo: 'emoji', valor: '🚗', etiqueta: '🚗 Vehículo' },
  { tipo: 'emoji', valor: '📧', etiqueta: '📧 Correo' },
  { tipo: 'emoji', valor: '🛡️', etiqueta: '🛡️ Seguridad' },
  { tipo: 'emoji', valor: '🧾', etiqueta: '🧾 Comprobante' },
];

export function renderizarIcono(icono, clase = '') {
  const tipo = icono?.tipo;
  const valor = icono?.valor;
  if (tipo === 'emoji') return `<span class="icono-emoji ${escaparHTML(clase)}" aria-hidden="true">${escaparHTML(valor || '📁')}</span>`;
  const dibujo = ICONOS_VECTORIALES[valor] || ICONOS_VECTORIALES.folder;
  return `<svg class="icono-vector ${escaparHTML(clase)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dibujo}</svg>`;
}

export function renderizarSelectorIconos(nombreCampo, seleccionado = '') {
  const claveSeleccionada = String(seleccionado || '');
  const opcionSeleccionada = OPCIONES_ICONOS.find((opcion) => `${opcion.tipo}:${opcion.valor}` === claveSeleccionada) || null;
  const opcionesVectoriales = OPCIONES_ICONOS.filter((opcion) => opcion.tipo === 'vector');
  const opcionesEmoji = OPCIONES_ICONOS.filter((opcion) => opcion.tipo === 'emoji');

  const renderizarOpcion = (opcion) => {
    const clave = `${opcion.tipo}:${opcion.valor}`;
    const activa = clave === claveSeleccionada;
    return `<button class="opcion-icono ${activa ? 'seleccionada' : ''}" type="button" data-elegir-icono="${escaparHTML(clave)}" title="${escaparHTML(opcion.etiqueta)}" aria-label="${escaparHTML(opcion.etiqueta)}" aria-pressed="${activa ? 'true' : 'false'}">${renderizarIcono(opcion)}</button>`;
  };

  return `<div class="selector-iconos">
    <input type="hidden" name="${escaparHTML(nombreCampo)}" value="${escaparHTML(claveSeleccionada)}" />
    <button class="boton-seleccion-icono ${opcionSeleccionada ? 'icono-elegido' : 'sin-icono-elegido'}" type="button" data-abrir-iconos aria-expanded="false">
      <span class="vista-previa-icono ${opcionSeleccionada ? '' : 'oculto'}">${opcionSeleccionada ? renderizarIcono(opcionSeleccionada) : ''}</span>
      <span class="texto-seleccion-icono">${opcionSeleccionada ? escaparHTML(opcionSeleccionada.etiqueta) : 'Si no elegís un icono, se usará uno genérico'}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="panel-opciones-iconos">
      <div class="grupo-opciones-iconos"><span>Iconos de línea</span><div>${opcionesVectoriales.map(renderizarOpcion).join('')}</div></div>
      <div class="grupo-opciones-iconos"><span>Emojis</span><div>${opcionesEmoji.map(renderizarOpcion).join('')}</div></div>
    </div>
  </div>`;
}

function aplicarSeleccionIcono(selector, clave) {
  if (!selector) return;
  const entrada = selector.querySelector('input[type="hidden"]');
  const boton = selector.querySelector('[data-abrir-iconos]');
  const vistaPrevia = selector.querySelector('.vista-previa-icono');
  const texto = selector.querySelector('.texto-seleccion-icono');
  if (!entrada || !boton || !vistaPrevia || !texto) return;

  const claveLimpia = String(clave || '');
  const elegida = OPCIONES_ICONOS.find((item) => `${item.tipo}:${item.valor}` === claveLimpia) || null;
  entrada.value = elegida ? claveLimpia : '';
  selector.querySelectorAll('[data-elegir-icono]').forEach((elemento) => {
    const activa = Boolean(elegida) && elemento.dataset.elegirIcono === claveLimpia;
    elemento.classList.toggle('seleccionada', activa);
    elemento.setAttribute('aria-pressed', String(activa));
  });

  if (elegida) {
    vistaPrevia.innerHTML = renderizarIcono(elegida);
    vistaPrevia.classList.remove('oculto');
    texto.textContent = elegida.etiqueta;
    boton.classList.add('icono-elegido');
    boton.classList.remove('sin-icono-elegido');
  } else {
    vistaPrevia.innerHTML = '';
    vistaPrevia.classList.add('oculto');
    texto.textContent = 'Si no elegís un icono, se usará uno genérico';
    boton.classList.remove('icono-elegido');
    boton.classList.add('sin-icono-elegido');
  }

  selector.classList.remove('selector-iconos-abierto');
  boton.setAttribute('aria-expanded', 'false');
}

export function establecerIconoSelector(contenedor, nombreCampo, clave) {
  const entrada = contenedor?.querySelector(`input[name="${nombreCampo}"]`);
  if (!entrada) return;
  aplicarSeleccionIcono(entrada.closest('.selector-iconos'), clave);
}

export function conectarSelectorIconos(contenedor) {
  if (!contenedor || contenedor.dataset.selectoresIconosConectados === 'true') return;
  contenedor.dataset.selectoresIconosConectados = 'true';
  contenedor.addEventListener('click', (evento) => {
    const abrir = evento.target.closest('[data-abrir-iconos]');
    if (abrir && contenedor.contains(abrir)) {
      const selector = abrir.closest('.selector-iconos');
      const abierto = selector.classList.toggle('selector-iconos-abierto');
      abrir.setAttribute('aria-expanded', String(abierto));
      return;
    }

    const opcion = evento.target.closest('[data-elegir-icono]');
    if (!opcion || !contenedor.contains(opcion)) return;
    const selector = opcion.closest('.selector-iconos');
    const clave = opcion.dataset.elegirIcono;
    aplicarSeleccionIcono(selector, clave);
  });
}

export function interpretarValorIcono(valor) {
  const texto = String(valor || 'vector:folder');
  const separador = texto.indexOf(':');
  if (separador < 0) return { tipo: 'vector', valor: 'folder' };
  return {
    tipo: texto.slice(0, separador) === 'emoji' ? 'emoji' : 'vector',
    valor: texto.slice(separador + 1),
  };
}
