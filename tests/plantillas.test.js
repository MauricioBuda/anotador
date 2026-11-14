import test from 'node:test';
import assert from 'node:assert/strict';
import {
  plantillaAplicacion,
  plantillaBotonCategoria,
  plantillaRegistros,
  plantillaResultadosBusqueda,
} from '../src/interfaz/plantillas.js';

const usuarioPrueba = {
  displayName: 'Persona de prueba',
  email: 'persona@example.com',
};

const categoriaPrueba = {
  id: 'claves',
  nombre: 'Claves',
  icono: { tipo: 'vector', valor: 'key-round' },
};

const registroPrueba = {
  id: 'registro-1',
  categoriaId: 'claves',
  nombre: 'Banco de prueba',
  dato: 'clave-de-prueba',
  observacion: 'Observación visible',
  creadoEn: new Date('2026-11-14T13:35:00.000Z'),
  editadoEn: new Date('2026-11-15T15:45:00.000Z'),
};

test('la pantalla principal contiene las dos secciones plegables', () => {
  const html = plantillaAplicacion(usuarioPrueba);
  assert.match(html, /Nuevo dato/);
  assert.match(html, /Datos cargados/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /data-abrir-iconos/);
});

test('cada botón de categoría muestra su nombre e indicador de cantidad', () => {
  const html = plantillaBotonCategoria(categoriaPrueba, 3, true);
  assert.match(html, /Claves/);
  assert.match(html, />3</);
  assert.match(html, /seleccionada/);
});

test('una categoría vacía muestra el estado acordado', () => {
  const html = plantillaRegistros({ categoria: categoriaPrueba, registros: [], revelados: new Set() });
  assert.match(html, /Aún no hay datos en esta categoría/);
});

test('los registros no revelados muestran exactamente ocho asteriscos', () => {
  const html = plantillaRegistros({ categoria: categoriaPrueba, registros: [registroPrueba], revelados: new Set() });
  assert.match(html, /\*{8}/);
  assert.doesNotMatch(html, /clave-de-prueba/);
});

test('revelar un registro muestra el dato y mantiene visible la observación', () => {
  const html = plantillaRegistros({ categoria: categoriaPrueba, registros: [registroPrueba], revelados: new Set(['registro-1']) });
  assert.match(html, /clave-de-prueba/);
  assert.match(html, /Observación visible/);
  assert.match(html, /Ocultar dato/);
});

test('el registro editado conserva la fecha de creación y muestra el globo de edición', () => {
  const html = plantillaRegistros({ categoria: categoriaPrueba, registros: [registroPrueba], revelados: new Set() });
  assert.match(html, /14\/11\/2026 - 10:35/);
  assert.match(html, /Editado en 15\/11\/2026 - 12:45/);
});

test('los resultados de búsqueda identifican la categoría', () => {
  const html = plantillaResultadosBusqueda([registroPrueba], [categoriaPrueba]);
  assert.match(html, /Banco de prueba/);
  assert.match(html, /Claves/);
});
