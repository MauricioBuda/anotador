import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const directorio = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(directorio, '..');
const [main, css, notificaciones] = await Promise.all([
  readFile(resolve(raiz, 'src/main.js'), 'utf8'),
  readFile(resolve(raiz, 'src/estilos.css'), 'utf8'),
  readFile(resolve(raiz, 'src/interfaz/notificaciones.js'), 'utf8'),
]);

test('la rueda de configuración abre la pestaña Categorías', () => {
  assert.match(main, /boton-administrar[\s\S]{0,100}=> abrirAdministracion\('categorias'\)/);
});

test('el alta de categoría de administración inicia plegada y se abre desde su tarjeta', () => {
  assert.match(main, /data-toggle-nueva-categoria/);
  assert.match(main, /formularioCategoriaAdminAbierto \? `<form id="formulario-nueva-categoria-admin"/);
  assert.match(main, /if \(formularioCategoriaAdminAbierto\) contenedor\.querySelector\('#formulario-nueva-categoria-admin input\[name="nombre"\]'\)\?\.focus\(\)/);
  assert.doesNotMatch(main, /else if \(!preservarFormulario\) contenedor\.querySelector\('input'\)\?\.focus\(\)/);
});

test('el selector de iconos se despliega por encima del flujo y no desplaza el formulario', () => {
  assert.match(css, /\.panel-opciones-iconos\s*\{[^}]*position:\s*absolute/);
  assert.match(css, /\.selector-iconos-abierto\s*\{\s*z-index:/);
  assert.match(css, /\.opcion-icono\s*\{[^}]*justify-items:\s*center/);
});

test('el formulario administrativo mantiene separación entre selector y botones', () => {
  assert.match(css, /\.formulario-nueva-categoria\s*\{[^}]*gap:\s*12px/);
  assert.match(css, /\.acciones-nueva-categoria\s*\{[^}]*gap:\s*8px/);
});

test('la apertura del acordeón tiene una animación más pausada', () => {
  assert.match(css, /\.contenido-acordeon\s*\{[^}]*animation:\s*desplegar \.4s/);
});

test('las notificaciones exitosas representan la confirmación con una tilde', () => {
  assert.match(notificaciones, /<path d="m5 12 4 4L19 6"\/>/);
  assert.match(notificaciones, /class="notificacion-icono"/);
});
