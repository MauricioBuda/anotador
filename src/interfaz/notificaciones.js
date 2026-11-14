let temporizadorNotificacion = null;

export function mostrarNotificacion(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('contenedor-notificaciones');
  if (!contenedor) return;
  window.clearTimeout(temporizadorNotificacion);
  contenedor.innerHTML = `
    <div class="fondo-notificacion" role="presentation">
      <div class="notificacion notificacion-${tipo}" role="status">
        <span class="notificacion-indicador" aria-hidden="true"></span>
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
