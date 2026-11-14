export function normalizarTexto(valor = '') {
  return String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-AR')
    .replace(/\s+/g, ' ');
}

export function crearIdCategoria(nombre) {
  const normalizado = normalizarTexto(nombre);
  const slug = normalizado
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'categoria';
  let hash = 2166136261;
  for (let indice = 0; indice < normalizado.length; indice += 1) {
    hash ^= normalizado.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return `categoria-${slug}-${(hash >>> 0).toString(16)}`;
}

export function escaparHTML(valor = '') {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caracter]);
}

export function fechaAFechaJS(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate();
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearFechaArgentina(valor, incluirHora = true) {
  const fecha = fechaAFechaJS(valor);
  if (!fecha) return 'Fecha no disponible';
  const opciones = incluirHora
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' }
    : { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' };
  return new Intl.DateTimeFormat('es-AR', opciones).format(fecha).replace(',', ' -');
}

export function diasRestantes(fechaVencimiento, ahora = new Date()) {
  const fecha = fechaAFechaJS(fechaVencimiento);
  if (!fecha) return 0;
  const diferencia = fecha.getTime() - ahora.getTime();
  return Math.max(0, Math.ceil(diferencia / 86_400_000));
}

export function estaVencido(fechaVencimiento, ahora = new Date()) {
  const fecha = fechaAFechaJS(fechaVencimiento);
  return !fecha || fecha.getTime() <= ahora.getTime();
}

export function obtenerIdsPapeleraVencida(registros, dias, ahora = new Date()) {
  const plazo = Number(dias);
  if (!Number.isFinite(plazo) || plazo < 0) {
    throw new Error('El plazo de vencimiento debe ser un número de días válido.');
  }
  const milisegundosPorDia = 86_400_000;
  return registros
    .filter((registro) => {
      const fechaEliminacion = fechaAFechaJS(registro?.eliminadoEn);
      if (!fechaEliminacion) return true;
      const vencimiento = fechaEliminacion.getTime() + plazo * milisegundosPorDia;
      return vencimiento <= ahora.getTime();
    })
    .map((registro) => registro.id);
}

export function compararCategorias(a, b) {
  const inicialA = Boolean(a?.inicial);
  const inicialB = Boolean(b?.inicial);
  if (inicialA && inicialB) return Number(a.orden || 0) - Number(b.orden || 0);
  if (inicialA) return -1;
  if (inicialB) return 1;
  const fechaA = fechaAFechaJS(a?.creadoEn)?.getTime() || 0;
  const fechaB = fechaAFechaJS(b?.creadoEn)?.getTime() || 0;
  return fechaA - fechaB || String(a?.nombre || '').localeCompare(String(b?.nombre || ''), 'es');
}
