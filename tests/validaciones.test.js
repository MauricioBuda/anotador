import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarTexto,
  crearIdCategoria,
  escaparHTML,
  fechaAFechaJS,
  diasRestantes,
  estaVencido,
  obtenerIdsPapeleraVencida,
  formatearFechaArgentina,
  compararCategorias,
  compararCategoriasAdministracion,
} from '../src/utilidades/normalizacion.js';

 test('normalización ignora mayúsculas, tildes y espacios', () => {
  assert.equal(normalizarTexto('  VETERINARÍA  '), 'veterinaria');
  assert.equal(normalizarTexto('Números   de CLIENTE'), 'numeros de cliente');
  assert.equal(normalizarTexto('CUIL'), normalizarTexto('cuil'));
});

test('la generación de identificadores es estable para nombres equivalentes', () => {
  assert.equal(crearIdCategoria('Veterinaria'), crearIdCategoria(' veterinaria '));
  assert.equal(crearIdCategoria('Números de cliente'), crearIdCategoria('Numeros  de cliente'));
  assert.notEqual(crearIdCategoria('DNI'), crearIdCategoria('CUIL'));
});

test('los nombres similares producen un mismo identificador de categoría', () => {
  const nombres = ['Área común', 'area comun', ' ÁREA   COMÚN '];
  const ids = nombres.map(crearIdCategoria);
  assert.equal(new Set(ids).size, 1);
});

test('el escape HTML neutraliza caracteres que podrían formar etiquetas', () => {
  assert.equal(escaparHTML('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(escaparHTML("A&B 'C'"), 'A&amp;B &#39;C&#39;');
});

test('la conversión de fechas acepta Date y rechaza valores inválidos', () => {
  const fecha = new Date('2026-11-14T15:00:00.000Z');
  assert.equal(fechaAFechaJS(fecha).getTime(), fecha.getTime());
  assert.equal(fechaAFechaJS('fecha incorrecta'), null);
  assert.equal(fechaAFechaJS(null), null);
});

test('el conteo de días restantes redondea hacia arriba y no devuelve negativos', () => {
  const ahora = new Date('2026-11-14T12:00:00.000Z');
  assert.equal(diasRestantes(new Date('2026-11-15T11:00:00.000Z'), ahora), 1);
  assert.equal(diasRestantes(new Date('2026-11-16T13:00:00.000Z'), ahora), 3);
  assert.equal(diasRestantes(new Date('2026-11-13T12:00:00.000Z'), ahora), 0);
});

test('la detección de vencimiento toma el momento exacto como vencido', () => {
  const ahora = new Date('2026-11-14T12:00:00.000Z');
  assert.equal(estaVencido(ahora, ahora), true);
  assert.equal(estaVencido(new Date('2026-11-14T12:00:01.000Z'), ahora), false);
  assert.equal(estaVencido(null, ahora), true);
});


test('la limpieza de papelera selecciona registros vencidos a los diez días', () => {
  const ahora = new Date('2026-11-24T12:00:00.000Z');
  const registros = [
    { id: 'vencido', eliminadoEn: new Date('2026-11-14T12:00:00.000Z') },
    { id: 'vigente', eliminadoEn: new Date('2026-11-20T12:00:00.000Z') },
    { id: 'sin-fecha', eliminadoEn: null },
  ];
  assert.deepEqual(obtenerIdsPapeleraVencida(registros, 10, ahora), ['vencido', 'sin-fecha']);
});

test('el formato visible de fecha usa la zona horaria argentina', () => {
  const fecha = new Date('2026-11-14T13:35:00.000Z');
  assert.equal(formatearFechaArgentina(fecha), '14/11/2026 - 10:35');
});

import { OPCIONES_ICONOS, renderizarIcono, renderizarSelectorIconos, interpretarValorIcono } from '../src/utilidades/iconos.js';
import { CATEGORIAS_INICIALES, DIAS_PAPELERA } from '../src/configuracion.js';

test('el catálogo contiene iconos vectoriales y emojis, con carpeta genérica', () => {
  assert.ok(OPCIONES_ICONOS.some((opcion) => opcion.tipo === 'vector' && opcion.valor === 'folder'));
  assert.ok(OPCIONES_ICONOS.some((opcion) => opcion.tipo === 'emoji'));
  assert.match(renderizarIcono({ tipo: 'vector', valor: 'folder' }), /<svg/);
  assert.match(renderizarIcono({ tipo: 'emoji', valor: '🔑' }), /🔑/);
  const selector = renderizarSelectorIconos('icono', 'vector:folder');
  assert.match(selector, /data-abrir-iconos/);
  assert.match(selector, /data-elegir-icono="emoji:/);
  assert.match(selector, /data-elegir-icono="vector:folder/);
  assert.deepEqual(interpretarValorIcono('emoji:📱'), { tipo: 'emoji', valor: '📱' });
});

test('las categorías iniciales mantienen nombre, orden e iconos propios', () => {
  assert.deepEqual(CATEGORIAS_INICIALES.map((categoria) => categoria.nombre), [
    'Claves', 'Números de cliente', 'DNI', 'CUIL', 'Otros',
  ]);
  assert.deepEqual(CATEGORIAS_INICIALES.map((categoria) => categoria.orden), [1, 2, 3, 4, 5]);
  assert.equal(new Set(CATEGORIAS_INICIALES.map((categoria) => categoria.icono.valor)).size, 5);
});

test('el plazo inicial configurado para la papelera es de diez días', () => {
  assert.equal(DIAS_PAPELERA, 10);
});


test('las categorías iniciales conservan su posición y las personalizadas siguen el orden de creación', () => {
  const categorias = [
    { id: 'nueva-b', inicial: false, creadoEn: new Date('2026-11-16T00:00:00Z'), nombre: 'Nueva B' },
    { id: 'otros', inicial: true, orden: 5, nombre: 'Otros' },
    { id: 'nueva-a', inicial: false, creadoEn: new Date('2026-11-15T00:00:00Z'), nombre: 'Nueva A' },
    { id: 'claves', inicial: true, orden: 1, nombre: 'Claves' },
  ];
  assert.deepEqual(categorias.sort(compararCategorias).map((categoria) => categoria.id), [
    'claves', 'otros', 'nueva-a', 'nueva-b',
  ]);
});


test('las categorías eliminadas se muestran después de las categorías activas en administración', () => {
  const categorias = [
    { id: 'archivada-nueva', activa: false, inicial: false, creadoEn: new Date('2026-11-10T00:00:00Z'), nombre: 'Archivada nueva' },
    { id: 'activa-personalizada', activa: true, inicial: false, creadoEn: new Date('2026-11-16T00:00:00Z'), nombre: 'Activa personalizada' },
    { id: 'archivada-inicial', activa: false, inicial: true, orden: 1, nombre: 'Claves archivada' },
    { id: 'activa-inicial', activa: true, inicial: true, orden: 2, nombre: 'DNI' },
  ];
  assert.deepEqual(categorias.sort(compararCategoriasAdministracion).map((categoria) => categoria.id), [
    'activa-inicial', 'activa-personalizada', 'archivada-inicial', 'archivada-nueva',
  ]);
});
