let temporizadorNotificacion = null;

export function mostrarNotificacion(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('contenedor-notificaciones');
  if (!contenedor) return;
  window.clearTimeout(temporizadorNotificacion);
  const iconoNotificacion = tipo === 'error'
    ? '<path d="M6 6l12 12M18 6 6 18"/>'
    : tipo === 'advertencia'
      ? '<path d="M12 8v5m0 3h.01"/><path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0z"/>'
      : '<path d="m5 12 4 4L19 6"/>';
  contenedor.innerHTML = `
    <div class="fondo-notificacion" role="presentation">
      <div class="notificacion notificacion-${tipo}" role="status">
        <svg class="notificacion-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconoNotificacion}</svg>
        <p>${String(mensaje).replace(/[&<>"']/g, (caracter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter])}</p>
      </div>
    </div>`;
  temporizadorNotificacion = window.setTimeout(() => {
    contenedor.innerHTML = '';
  }, 2000);
}

export function mostrarCarga(mensaje = 'Procesando…') {
  const capa = document.getElementById('capa-carga');
  const texto = document.getElementById('texto-carga');
  if (texto) texto.textContent = mensaje;
  capa?.classList.remove('oculto');
  document.body.classList.add('ocupada');
}

export function ocultarCarga() {
  document.getElementById('capa-carga')?.classList.add('oculto');
  document.body.classList.remove('ocupada');
}
