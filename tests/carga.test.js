import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderizarSelectorIconos, interpretarValorIcono } from '../src/utilidades/iconos.js';

const directorio = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(directorio, '..');

test('la capa de carga usa la misma clase oculta en HTML, CSS y JavaScript', async () => {
  const [html, css, modulo] = await Promise.all([
    readFile(resolve(raiz, 'index.html'), 'utf8'),
    readFile(resolve(raiz, 'src/estilos.css'), 'utf8'),
    readFile(resolve(raiz, 'src/interfaz/notificaciones.js'), 'utf8'),
  ]);

  assert.match(html, /id="capa-carga" class="capa-carga oculto"/);
  assert.match(css, /\.oculto\s*\{\s*display:\s*none\s*!important;/);
  assert.match(modulo, /classList\.remove\('oculto'\)/);
  assert.match(modulo, /classList\.add\('oculto'\)/);
  assert.doesNotMatch(html, /capa-carga[^>]*\boculta\b/);
  assert.doesNotMatch(modulo, /classList\.(?:add|remove)\('oculta'\)/);
});

test('un selector nuevo no preselecciona la carpeta genérica y explica el valor por defecto', () => {
  const selector = renderizarSelectorIconos('icono');
  assert.match(selector, /Si no elegís un icono, se usará uno genérico/);
  assert.match(selector, /name="icono" value=""/);
  assert.doesNotMatch(selector, /data-elegir-icono="vector:folder"[^>]*aria-pressed="true"/);
});

test('si no se elige un icono, el valor guardado se resuelve a carpeta genérica', () => {
  assert.deepEqual(interpretarValorIcono(''), { tipo: 'vector', valor: 'folder' });
  assert.deepEqual(interpretarValorIcono(null), { tipo: 'vector', valor: 'folder' });
});

test('editar una categoría puede abrir el selector con su icono actual seleccionado', () => {
  const selector = renderizarSelectorIconos('icono', 'vector:wifi');
  assert.match(selector, /texto-seleccion-icono">Wi-Fi/);
  assert.match(selector, /data-elegir-icono="vector:wifi"[^>]*aria-pressed="true"/);
});
