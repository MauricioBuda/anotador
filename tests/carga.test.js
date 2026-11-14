import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

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
