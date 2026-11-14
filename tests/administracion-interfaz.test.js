import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const directorio = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(directorio, '..');
const [main, plantillas, css] = await Promise.all([
  readFile(resolve(raiz, 'src/main.js'), 'utf8'),
  readFile(resolve(raiz, 'src/interfaz/plantillas.js'), 'utf8'),
  readFile(resolve(raiz, 'src/estilos.css'), 'utf8'),
]);

test('la rueda abre siempre la pestaña Categorías', () => {
  assert.match(main, /boton-administrar[\s\S]{0,100}=> abrirAdministracion\('categorias'\)/);
});

test('tocar la pestaña ya activa no vuelve a renderizar el modal', () => {
  assert.match(main, /if \(pestanaSolicitada === pestanaAdministracionActual\) return;/);
  assert.match(main, /boton\.dataset\.adminPestana/);
});

test('el modal conserva su estructura al cambiar de pestaña', () => {
  assert.match(main, /id="panel-contenido-administracion"/);
  assert.match(main, /const pestanaRenderizada = panel\.dataset\.pestana/);
  assert.match(main, /panel\.innerHTML = pestana === 'categorias'/);
  assert.match(main, /El modal, las pestañas, el formulario abierto y su foco permanecen intactos/);
  assert.doesNotMatch(main, /contenedor\.innerHTML = `\s*<div class="fondo-modal"[\s\S]*data-admin-pestana[\s\S]*?\$\{pestana === 'categorias'/);
});

test('las actualizaciones de Firestore modifican solo las listas internas', () => {
  assert.match(main, /lista\.innerHTML = plantillaListaCategoriasAdministracion\(\)/);
  assert.match(main, /lista\.innerHTML = plantillaListaPapeleraAdministracion\(\)/);
  assert.match(main, /const modalExiste = Boolean\(contenedor\.querySelector\('\.modal-administracion'\)\)/);
});

test('el formulario de nueva categoría permanece montado y se pliega con estado accesible', () => {
  assert.match(main, /id="desplegable-nueva-categoria-admin"/);
  assert.match(main, /formulario\.inert = !formularioCategoriaAdminAbierto/);
  assert.match(main, /data-toggle-nueva-categoria/);
  assert.match(main, /actualizarDesplegableNuevaCategoria\(\)/);
  assert.match(main, /setTimeout\([\s\S]*formularioCategoriaAdminAbierto[\s\S]*\.focus\(\)/);
});

test('el modal de administración conserva dimensiones y desplaza solo el contenido interno', () => {
  assert.match(css, /\.modal-administracion\s*\{[^}]*height:\s*min\(82dvh,\s*790px\)[^}]*overflow:\s*hidden/);
  assert.match(css, /\.panel-contenido-administracion\s*\{[^}]*flex:\s*1 1 0[^}]*overflow-y:\s*auto/);
});

test('el cambio entre pestañas anima solo el panel, sin animar ni reconstruir el modal', () => {
  assert.match(css, /\.panel-contenido-administracion\s*>\s*\.contenido-administracion\s*\{[^}]*animation:/);
  assert.match(main, /panel\.dataset\.pestana = pestana/);
});

test('los desplegables usan transiciones suaves de apertura y cierre', () => {
  assert.match(css, /\.envoltorio-acordeon\s*\{[^}]*grid-template-rows:\s*0fr[^}]*transition:\s*grid-template-rows \.58s/);
  assert.match(css, /\.envoltorio-acordeon\.abierto\s*\{[^}]*grid-template-rows:\s*1fr/);
  assert.match(css, /\.desplegable-formulario-categoria\s*\{[^}]*grid-template-rows:\s*0fr[^}]*transition:\s*grid-template-rows \.52s/);
  assert.match(css, /\.desplegable-formulario-categoria\.abierto\s*\{[^}]*grid-template-rows:\s*1fr/);
});

test('el selector de iconos realiza una transición de visibilidad sin alterar el flujo', () => {
  assert.match(css, /\.panel-opciones-iconos\s*\{[^}]*position:\s*absolute/);
  assert.match(css, /\.panel-opciones-iconos\s*\{[^}]*visibility:\s*hidden[^}]*opacity:\s*0/);
  assert.match(css, /\.selector-iconos-abierto \.panel-opciones-iconos\s*\{[^}]*visibility:\s*visible[^}]*opacity:\s*1/);
});

test('las dos secciones principales mantienen los nuevos envoltorios accesibles', () => {
  assert.match(plantillas, /id="envoltorio-nuevo-dato" aria-hidden="true" inert/);
  assert.match(plantillas, /id="envoltorio-datos" aria-hidden="false"/);
});
