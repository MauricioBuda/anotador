import { escaparHTML, formatearFechaArgentina, normalizarTexto } from '../utilidades/normalizacion.js';
import { renderizarIcono, renderizarSelectorIconos } from '../utilidades/iconos.js';

export function plantillaLogin({ correoNoAutorizado = '' } = {}) {
  return `
    <main class="pantalla-login">
      <section class="tarjeta-login">
        <img class="marca-login" src="/favicon.png" alt="" />
        <p class="sobretitulo">UN ESPACIO COMPARTIDO</p>
        <h1>Mi anotador</h1>
        <p class="texto-login">Tus datos importantes, organizados en un solo lugar.</p>
        ${correoNoAutorizado ? `<div class="aviso aviso-error">${escaparHTML(correoNoAutorizado)}</div>` : ''}
        <button class="boton boton-google" id="boton-ingresar" type="button">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.42 38.02 46.98 31.86 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Ingresar con Google
        </button>
        <p class="texto-seguridad">Accedé a tu espacio privado.</p>
      </section>
    </main>`;
}

export function plantillaAplicacion(usuario) {
  const iniciales = (usuario.displayName || usuario.email || 'U').split(' ').slice(0, 2).map((parte) => parte[0]).join('').toLocaleUpperCase('es-AR');
  return `
    <main class="aplicacion">
      <header class="encabezado-principal">
        <div class="identidad-aplicacion">
          <img src="/favicon.png" alt="" class="marca-encabezado" />
          <div><p class="sobretitulo">INFORMACIÓN COMPARTIDA</p><h1>Mi anotador</h1></div>
        </div>
        <div class="acciones-encabezado">
          <button class="boton-icono" id="boton-busqueda" type="button" aria-label="Buscar" title="Buscar">${icono('search')}</button>
          <button class="boton-icono" id="boton-administrar" type="button" aria-label="Administrar categorías y papelera" title="Administrar">${icono('settings')}</button>
          <div class="usuario-actual" title="${escaparHTML(usuario.email || '')}"><span class="avatar-usuario">${escaparHTML(iniciales)}</span><span class="correo-usuario">${escaparHTML(usuario.email || '')}</span></div>
          <button class="boton-icono" id="boton-cerrar-sesion" type="button" aria-label="Cerrar sesión" title="Cerrar sesión">${icono('log-out')}</button>
        </div>
      </header>

      <section class="panel-busqueda oculto" id="panel-busqueda">
        <label class="campo-busqueda"><span class="solo-lectores">Buscar por categoría o nombre</span>${icono('search')}<input id="entrada-busqueda" type="search" autocomplete="off" placeholder="Buscar por categoría o nombre…" /><button class="boton-icono boton-icono-chico" id="cerrar-busqueda" type="button" aria-label="Cerrar búsqueda">${icono('x')}</button></label>
        <div id="resultados-busqueda" class="resultados-busqueda"></div>
      </section>

      <section class="seccion-acordeon seccion-nuevo-dato" id="seccion-nuevo-dato">
        <button class="encabezado-acordeon" type="button" data-acordeon="formulario" aria-expanded="false" aria-controls="contenido-nuevo-dato">
          <span class="icono-acordeon">${icono('plus')}</span><span><strong>Nuevo dato</strong><small>Guardar una nueva información</small></span>${icono('chevron-down', 'flecha-acordeon')}
        </button>
        <div class="envoltorio-acordeon" id="envoltorio-nuevo-dato" aria-hidden="true" inert>
          <div class="contenido-acordeon" id="contenido-nuevo-dato">
          <form id="formulario-nuevo-dato" class="formulario-nuevo-dato">
            <div class="campos-formulario">
              <label class="campo"><span>Categoría</span><select id="categoria-nuevo-dato" name="categoriaId" required><option value="">Seleccionar categoría</option></select></label>
              <div class="campo campo-categoria-nueva oculto" id="campo-categoria-nueva"><label for="nombre-categoria-nueva">Nombre de la nueva categoría</label><input id="nombre-categoria-nueva" name="nombreCategoriaNueva" maxlength="50" placeholder="Ej.: Servicios"/><span class="etiqueta-icono-nueva">Icono</span>${renderizarSelectorIconos('iconoCategoriaNueva')}</div>
              <label class="campo"><span>Nombre o identificación</span><input name="nombre" type="text" maxlength="100" required placeholder="Ej.: Banco Galicia" /></label>
              <label class="campo campo-dato"><span>Dato</span><textarea name="dato" rows="3"  required placeholder="Escribí o pegá la información"></textarea></label>
              <label class="campo campo-observacion"><span>Observación <small>(opcional)</small></span><textarea name="observacion" rows="2"  placeholder="Información adicional"></textarea></label>
            </div>
            <div class="acciones-formulario"><span class="nota-formulario">La información queda guardada en tu espacio.</span><button class="boton boton-principal" type="submit">Guardar dato</button></div>
          </form>
          </div>
        </div>
      </section>

      <section class="seccion-acordeon seccion-datos" id="seccion-datos">
        <button class="encabezado-acordeon" type="button" data-acordeon="datos" aria-expanded="true" aria-controls="contenido-datos">
          <span class="icono-acordeon">${icono('folder')}</span><span><strong>Datos cargados</strong><small>Consultá la información por categoría</small></span>${icono('chevron-down', 'flecha-acordeon')}
        </button>
        <div class="envoltorio-acordeon abierto" id="envoltorio-datos" aria-hidden="false">
          <div class="contenido-acordeon" id="contenido-datos">
          <div id="botones-categorias" class="botones-categorias"></div>
          <div id="contenido-categoria" class="contenido-categoria"><div class="estado-sin-seleccion"><span class="estado-icono">${icono('folder')}</span><p>Seleccioná una categoría para consultar sus datos.</p></div></div>
          </div>
        </div>
      </section>
      <footer class="pie-aplicacion"><span>Mi anotador</span><span>Un espacio compartido para información importante</span></footer>
    </main>`;
}

export function plantillaBotonCategoria(categoria, cantidad, seleccionada) {
  const claseEspecial = categoria.esFavoritos ? ' boton-categoria-favoritos' : '';
  return `<button class="boton-categoria${claseEspecial} ${seleccionada ? 'seleccionada' : ''}" type="button" data-categoria="${escaparHTML(categoria.id)}" aria-pressed="${seleccionada ? 'true' : 'false'}">
    <span class="icono-categoria">${renderizarIcono(categoria.icono)}</span><span class="texto-categoria">${escaparHTML(categoria.nombre)}</span><span class="contador-categoria">${cantidad}</span>
  </button>`;
}

export function plantillaRegistros({ categoria, registros, revelados, favoritos = new Set(), observacionesExpandidas = new Set(), usuario = null }) {
  if (!registros.length) {
    return `<div class="estado-vacio-categoria"><span class="estado-icono">${renderizarIcono(categoria.icono)}</span><strong>Aún no hay datos en esta categoría</strong><span>Cuando agregues información, va a aparecer acá.</span></div>`;
  }
  return `<div class="encabezado-lista"><div><p class="sobretitulo">CATEGORÍA</p><h2>${escaparHTML(categoria.nombre)}</h2></div><span class="cantidad-registros">${registros.length} ${registros.length === 1 ? 'dato' : 'datos'}</span></div>
    <div class="lista-registros">${registros.map((registro) => plantillaRegistro(registro, {
      revelado: revelados.has(registro.id),
      favorito: favoritos.has(registro.id),
      observacionExpandida: observacionesExpandidas.has(registro.id),
      usuario,
    })).join('')}</div>`;
}

export function plantillaFavoritos({ registros, categorias, revelados, favoritos, observacionesExpandidas, usuario }) {
  const encabezado = `<div class="encabezado-lista encabezado-lista-favoritos"><div><p class="sobretitulo">CARPETA</p><h2>${icono('star', 'estrella-encabezado')} Favoritos</h2></div><span class="cantidad-registros">${registros.length} ${registros.length === 1 ? 'dato' : 'datos'}</span></div>`;
  if (!registros.length) {
    return `${encabezado}<div class="estado-vacio-categoria estado-vacio-favoritos"><span class="estado-icono">${icono('star', 'estrella-encabezado')}</span><strong>Aún no hay favoritos</strong><span>Marcá un dato con la estrella para guardarlo en esta carpeta.</span></div>`;
  }
  return `${encabezado}<div class="lista-registros lista-favoritos">${registros.map((registro) => plantillaRegistro(registro, {
    revelado: revelados.has(registro.id),
    favorito: favoritos.has(registro.id),
    observacionExpandida: observacionesExpandidas.has(registro.id),
    usuario,
    categoria: categorias.find((item) => item.id === registro.categoriaId)?.nombre || 'Categoría no disponible',
    modoFavoritos: true,
  })).join('')}</div>`;
}

function plantillaRegistro(registro, { revelado, favorito, observacionExpandida, usuario, categoria = '', modoFavoritos = false }) {
  const creado = formatearFechaArgentina(registro.creadoEn);
  const editado = registro.editadoEn ? formatearFechaArgentina(registro.editadoEn) : '';
  const creador = registro.creadoPorCorreo
    || (registro.creadoPor && registro.creadoPor === usuario?.uid ? usuario?.email : '')
    || 'No disponible';
  const editor = registro.editadoPorCorreo
    || (registro.editadoPor && registro.editadoPor === usuario?.uid ? usuario?.email : '')
    || 'No disponible';
  const observacion = String(registro.observacion || '');
  const observacionLarga = observacion.length > 80 || observacion.includes('\n');
  const tooltip = `<span class="tooltip-edicion"><span>Creado por: ${escaparHTML(creador)}</span>${editado ? `<span>Editado en ${escaparHTML(editado)}</span><span>Editado por: ${escaparHTML(editor)}</span>` : ''}</span>`;
  const tieneTooltip = Boolean(registro.creadoPorCorreo || registro.editadoEn || registro.creadoPor);
  return `<article class="fila-dato ${observacion ? '' : 'sin-observacion'} ${favorito ? 'dato-favorito' : ''}" data-registro="${escaparHTML(registro.id)}">
    <div class="identificacion-dato">
      <div class="encabezado-identificacion-dato">
        <strong>${escaparHTML(registro.nombre)}</strong>
        <button class="boton-icono boton-favorito ${favorito ? 'favorito-activo' : ''}" type="button" data-accion="favorito" aria-label="${favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}" title="${favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${icono('star', favorito ? 'estrella-activa' : '')}</button>
      </div>
      ${categoria ? `<small class="categoria-del-favorito">${escaparHTML(categoria)}</small>` : ''}
      <span class="fecha-registro ${tieneTooltip ? 'tiene-edicion' : ''}" ${tieneTooltip ? `tabindex="0" role="button" data-accion="tooltip" aria-label="Creado ${escaparHTML(creado)}. ${escaparHTML(tooltip.replace(/<[^>]*>/g, ' '))}"` : ''}>${icono('clock')}<span>${escaparHTML(creado)}</span>${tieneTooltip ? tooltip : ''}</span>
    </div>
    <div class="valor-dato"><span class="texto-dato ${revelado ? 'dato-revelado' : 'dato-oculto'}">${revelado ? escaparHTML(registro.dato) : '********'}</span></div>
    ${observacion ? `<div class="envoltorio-observacion"><p class="observacion-dato ${observacionExpandida ? 'observacion-expandida' : ''}">${escaparHTML(observacion)}</p>${observacionLarga ? `<button class="boton-ver-observacion" type="button" data-accion="observacion">${observacionExpandida ? 'Ver menos' : 'Ver más'}</button>` : ''}</div>` : ''}
    <div class="acciones-dato">
      <button class="boton-icono boton-accion-dato" type="button" data-accion="revelar" aria-label="${revelado ? 'Ocultar dato' : 'Mostrar dato'}" title="${revelado ? 'Ocultar' : 'Mostrar'}">${icono(revelado ? 'eye-off' : 'eye')}</button>
      <button class="boton-icono boton-accion-dato" type="button" data-accion="copiar" aria-label="Copiar dato" title="Copiar">${icono('copy')}</button>
      ${modoFavoritos ? '' : `<button class="boton-icono boton-accion-dato" type="button" data-accion="editar" aria-label="Editar dato" title="Editar">${icono('pencil')}</button>
      <button class="boton-icono boton-accion-dato accion-eliminar" type="button" data-accion="eliminar" aria-label="Enviar a papelera" title="Enviar a papelera">${icono('trash-2')}</button>`}
    </div>
  </article>`;
}

export function resaltarCoincidencia(texto, termino) {
  const original = String(texto ?? '');
  const busqueda = normalizarTexto(termino);
  if (!busqueda) return escaparHTML(original);

  let normalizado = '';
  const posiciones = [];
  let desplazamientoOriginal = 0;
  for (const caracter of original) {
    const inicio = desplazamientoOriginal;
    const fin = inicio + caracter.length;
    desplazamientoOriginal = fin;
    if (/^\s+$/u.test(caracter)) {
      if (normalizado && !normalizado.endsWith(' ')) {
        normalizado += ' ';
        posiciones.push({ inicio, fin });
      }
      continue;
    }
    const reducido = caracter.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
    for (let indice = 0; indice < reducido.length; indice += 1) {
      normalizado += reducido[indice];
      posiciones.push({ inicio, fin });
    }
  }
  if (normalizado.endsWith(' ')) {
    normalizado = normalizado.slice(0, -1);
    posiciones.pop();
  }

  const posicion = normalizado.indexOf(busqueda);
  if (posicion < 0) return escaparHTML(original);
  const primera = posiciones[posicion];
  const ultima = posiciones[posicion + busqueda.length - 1];
  if (!primera || !ultima) return escaparHTML(original);
  return `${escaparHTML(original.slice(0, primera.inicio))}<mark class="coincidencia-busqueda">${escaparHTML(original.slice(primera.inicio, ultima.fin))}</mark>${escaparHTML(original.slice(ultima.fin))}`;
}

export function plantillaResultadosBusqueda(resultados, categorias, termino = '') {
  if (!resultados.length) return '<p class="sin-resultados">No se encontraron coincidencias.</p>';
  const resumen = `<div class="cantidad-resultados-busqueda">${resultados.length} ${resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</div>`;
  return resumen + resultados.map((registro) => {
    const categoria = categorias.find((item) => item.id === registro.categoriaId);
    const nombreCategoria = categoria?.nombre || 'Categoría no disponible';
    return `<button class="resultado-busqueda" type="button" data-abrir-resultado="${escaparHTML(registro.id)}"><span class="resultado-icono">${renderizarIcono(categoria?.icono)}</span><span><strong>${resaltarCoincidencia(registro.nombre, termino)}</strong><small>${resaltarCoincidencia(nombreCategoria, termino)}</small></span>${icono('chevron-right')}</button>`;
  }).join('');
}

export function icono(nombre, clase = '') {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>', folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.5-2.4.8a7 7 0 0 0-2.6-1.5L13.5 2h-3l-.5 2.8a7 7 0 0 0-2.6 1.5L5 5.5 3 9l2 1.5a7 7 0 0 0 0 3L3 15l2 3.5 2.4-.8a7 7 0 0 0 2.6 1.5l.5 2.8h3l.5-2.8a7 7 0 0 0 2.6-1.5l2.4.8 2-3.5z"/>',
    x: '<path d="m18 6-12 12M6 6l12 12"/>', 'log-out': '<path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    pencil: '<path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>',
    'trash-2': '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
    'refresh-ccw': '<path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16m0 5v-5h5"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z"/>',
  };
  return `<svg class="icono-interfaz ${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[nombre] || paths.folder}</svg>`;
}
