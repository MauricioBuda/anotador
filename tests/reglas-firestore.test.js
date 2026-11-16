import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const reglas = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

test('la disponibilidad de categorías tolera que el campo eliminandoDefinitivamente no exista', () => {
  assert.match(reglas, /getAfter\(rutaCategoria\)\.data\.get\('eliminandoDefinitivamente',\s*false\)\s*!=\s*true/);
  assert.doesNotMatch(reglas, /getAfter\(rutaCategoria\)\.data\.eliminandoDefinitivamente\s*!=\s*true/);
});

test('las reglas mantienen acceso exclusivo para las cuentas configuradas y Google verificado', () => {
  assert.match(reglas, /request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(reglas, /request\.auth\.token\.firebase\.sign_in_provider\s*==\s*'google\.com'/);
  for (const correo of [
    'mauricio.ariel.buda@gmail.com',
    'monicacevedo1970@gmail.com',
    'pablobuda70@gmail.com',
  ]) assert.ok(reglas.includes(correo));
});

test('los datos siguen requiriendo una categoría existente y no marcada para eliminación definitiva', () => {
  assert.match(reglas, /allow create, update: if usuarioAutorizado\(\)\s*&& categoriaDisponible\(request\.resource\.data\.categoriaId\)/);
  assert.match(reglas, /return existsAfter\(rutaCategoria\)/);
});
