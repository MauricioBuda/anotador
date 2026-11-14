import { escaparHTML, compararCategorias } from '../utilidades/normalizacion.js';

function mostrarModal(contenido, clase = '') {
  const contenedor = document.getElementById('contenedor-modales');
  contenedor.innerHTML = `
    <div class="fondo-modal" data-cerrar-fondo="true">
      <section class="modal ${clase}" role="dialog" aria-modal="true">
        ${contenido}
      </section>
    </div>`;
  const fondo = contenedor.querySelector('.fondo-modal');
  fondo.addEventListener('click', (evento) => {
    if (evento.target === fondo || evento.target.dataset.cerrarFondo === 'true') {
      cerrarModal();
    }
  });
  contenedor.querySelectorAll('[data-cerrar-modal]').forEach((boton) => boton.addEventListener('click', cerrarModal));
  contenedor.querySelector('input:not([type="hidden"]), textarea, select, button:not([data-cerrar-modal])')?.focus();
  return contenedor;
}

export function cerrarModal() {
  document.getElementById('contenedor-modales').innerHTML = '';
}

export function confirmarAccion({ titulo, mensaje, textoConfirmar = 'Confirmar', peligro = false }) {
  return new Promise((resolver) => {
    const contenedor = mostrarModal(`
      <div class="modal-encabezado">
        <div><span class="modal-kicker">Confirmación</span><h2>${escaparHTML(titulo)}</h2></div>
        <button class="boton-icono" type="button" data-cerrar-modal aria-label="Cerrar">${iconoCerrar()}</button>
      </div>
      <p class="modal-mensaje">${escaparHTML(mensaje)}</p>
      <div class="modal-acciones">
        <button class="boton boton-secundario" type="button" data-respuesta="no">Cancelar</button>
        <button class="boton ${peligro ? 'boton-peligro' : 'boton-principal'}" type="button" data-respuesta="si">${escaparHTML(textoConfirmar)}</button>
      </div>`, 'modal-confirmacion');
    contenedor.querySelectorAll('[data-respuesta]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const respuesta = boton.dataset.respuesta === 'si';
        cerrarModal();
        resolver(respuesta);
      });
    });
    contenedor.querySelectorAll('[data-cerrar-modal]').forEach((boton) => boton.addEventListener('click', () => resolver(false)));
    const fondo = contenedor.querySelector('.fondo-modal');
    fondo?.addEventListener('click', (evento) => {
      if (evento.target === fondo) resolver(false);
    });
  });
}

export function abrirFormularioDato({ registro, categorias, renderizarIcono, editar = false }) {
  const opciones = categorias
    .filter((categoria) => (categoria.activa && categoria.visibleEnFormulario) || categoria.id === registro?.categoriaId)
    .sort(compararCategorias)
    .map((categoria) => `<option value="${escaparHTML(categoria.id)}" ${categoria.id === registro?.categoriaId ? 'selected' : ''}>${escaparHTML(categoria.nombre)}${!categoria.activa ? ' (eliminada)' : !categoria.visibleEnFormulario ? ' (oculta)' : ''}</option>`)
    .join('');

  const contenido = `
    <div class="modal-encabezado">
      <div><span class="modal-kicker">${editar ? 'Modificar información' : 'Nuevo registro'}</span><h2>${editar ? 'Editar dato' : 'Agregar dato'}</h2></div>
      <button class="boton-icono" type="button" data-cerrar-modal aria-label="Cerrar">${iconoCerrar()}</button>
    </div>
    <form id="formulario-modal-dato" class="formulario-modal">
      <label class="campo"><span>Categoría</span><select name="categoriaId" required>${opciones}</select></label>
      <label class="campo"><span>Nombre o identificación</span><input name="nombre" type="text" maxlength="100" required value="${escaparHTML(registro?.nombre || '')}" placeholder="Ej.: Banco Galicia" /></label>
      <label class="campo"><span>Dato</span><textarea name="dato" rows="4"  required placeholder="Escribí o pegá el dato">${escaparHTML(registro?.dato || '')}</textarea></label>
      <label class="campo"><span>Observación <small>(opcional)</small></span><textarea name="observacion" rows="2"  placeholder="Información adicional">${escaparHTML(registro?.observacion || '')}</textarea></label>
      <div class="modal-acciones">
        <button class="boton boton-secundario" type="button" data-cerrar-modal>Cancelar</button>
        <button class="boton boton-principal" type="submit">${editar ? 'Revisar cambios' : 'Guardar dato'}</button>
      </div>
    </form>`;
  return mostrarModal(contenido, 'modal-formulario');
}

function iconoCerrar() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>';
}
