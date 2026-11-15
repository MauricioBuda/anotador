import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { plantillaRegistros, plantillaFavoritos, plantillaResultadosBusqueda, resaltarCoincidencia } from '../src/interfaz/plantillas.js';

const directorio = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(directorio, '..');
const leer = (ruta) => readFile(resolve(raiz, ruta), 'utf8');

const registroEjemplo = {
  id: 'dato-1',
  categoriaId: 'claves',
  nombre: 'Banco Galicia',
  dato: 'clave-secreta',
  observacion: 'Primera línea de información adicional. Segunda línea con más detalles. Tercera línea.',
  creadoEn: new Date('2026-11-15T12:00:00Z'),
  creadoPor: 'uid-mauri',
  creadoPorCorreo: 'mauricio.ariel.buda@gmail.com',
  editadoEn: new Date('2026-11-15T13:00:00Z'),
  editadoPor: 'uid-ro',
  editadoPorCorreo: 'moniacevedo1970@gmail.com',
};

test('el servicio de favoritos observa y guarda favoritos separados por usuario', async () => {
  const servicio = await leer('src/servicios/favoritos.js');
  assert.match(servicio, /collection\(db, 'usuarios', usuarioId, 'favoritos'\)/);
  assert.match(servicio, /doc\(db, 'usuarios', usuarioId, 'favoritos', datoId\)/);
  assert.match(servicio, /export function observarFavoritos/);
  assert.match(servicio, /export async function guardarFavorito/);
  assert.match(servicio, /export async function quitarFavorito/);
});

test('las reglas aíslan cada lista de favoritos por UID', async () => {
  const rules = await leer('firestore.rules');
  assert.match(rules, /match \/usuarios\/\{usuarioId\}\/favoritos\/\{datoId\}/);
  assert.match(rules, /request\.auth\.uid == usuarioId/);
  assert.match(rules, /request\.resource\.data\.datoId == datoId/);
});

test('Favoritos se integra como botón de categoría y no como bloque superior separado', async () => {
  const plantillas = await leer('src/interfaz/plantillas.js');
  const main = await leer('src/main.js');
  assert.doesNotMatch(plantillas, /id="seccion-favoritos"/);
  assert.match(plantillas, /export function plantillaFavoritos/);
  assert.match(main, /CATEGORIA_FAVORITOS_ID = '__favoritos__'/);
  assert.match(main, /botonFavoritos \+ lista/);
});

test('los registros permiten marcar y desmarcar favoritos sin sumar otro campo de acción lateral', () => {
  const html = plantillaRegistros({
    categoria: { id: 'claves', nombre: 'Claves', icono: { tipo: 'vector', valor: 'key' } },
    registros: [registroEjemplo],
    revelados: new Set(),
    favoritos: new Set(['dato-1']),
    observacionesExpandidas: new Set(),
    usuario: { uid: 'uid-mauri', email: 'mauricio.ariel.buda@gmail.com' },
  });
  assert.match(html, /data-accion="favorito"/);
  assert.match(html, /Quitar de favoritos/);
  assert.match(html, /estrella-activa/);
  assert.match(html, /Creado por: mauricio\.ariel\.buda@gmail\.com/);
  assert.match(html, /Editado por: moniacevedo1970@gmail\.com/);
});

test('la carpeta Favoritos muestra la categoría de origen y no permite editar ni enviar a papelera', () => {
  const html = plantillaFavoritos({
    registros: [registroEjemplo],
    categorias: [{ id: 'claves', nombre: 'Claves' }],
    revelados: new Set(),
    favoritos: new Set(['dato-1']),
    observacionesExpandidas: new Set(),
    usuario: { uid: 'uid-mauri', email: 'mauricio.ariel.buda@gmail.com' },
  });
  assert.match(html, /Favoritos/);
  assert.match(html, /Claves/);
  assert.match(html, /data-accion="copiar"/);
  assert.match(html, /data-accion="revelar"/);
  assert.match(html, /data-accion="favorito"/);
  assert.doesNotMatch(html, /data-accion="editar"/);
  assert.doesNotMatch(html, /data-accion="eliminar"/);
});

test('las observaciones largas se pliegan y se pueden expandir o contraer', () => {
  const html = plantillaRegistros({
    categoria: { id: 'claves', nombre: 'Claves', icono: { tipo: 'vector', valor: 'key' } },
    registros: [registroEjemplo],
    revelados: new Set(),
    favoritos: new Set(),
    observacionesExpandidas: new Set(),
  });
  assert.match(html, /observacion-dato/);
  assert.match(html, /data-accion="observacion">Ver más/);
  const expandido = plantillaRegistros({
    categoria: { id: 'claves', nombre: 'Claves', icono: { tipo: 'vector', valor: 'key' } },
    registros: [registroEjemplo],
    revelados: new Set(),
    favoritos: new Set(),
    observacionesExpandidas: new Set(['dato-1']),
  });
  assert.match(expandido, /observacion-expandida/);
  assert.match(expandido, /data-accion="observacion">Ver menos/);
});

test('la búsqueda resalta coincidencias ignorando tildes y escapando HTML', () => {
  assert.equal(
    resaltarCoincidencia('Banco Galicia', 'galícia'),
    'Banco <mark class="coincidencia-busqueda">Galicia</mark>',
  );
  const seguro = resaltarCoincidencia('<script>alert(1)</script>', 'script');
  assert.doesNotMatch(seguro, /<script>/);
  assert.match(seguro, /&lt;/);
  assert.match(seguro, /<mark class="coincidencia-busqueda">script<\/mark>/);
});

test('los resultados de búsqueda muestran la cantidad y resaltan nombre o categoría', () => {
  const html = plantillaResultadosBusqueda(
    [registroEjemplo],
    [{ id: 'claves', nombre: 'Claves' }],
    'galicia',
  );
  assert.match(html, /1 resultado encontrado/);
  assert.match(html, /<mark class="coincidencia-busqueda">Galicia<\/mark>/);
});

test('se recuerda la categoría usada en el navegador y se precarga al abrir el formulario', async () => {
  const main = await leer('src/main.js');
  assert.match(main, /localStorage\.getItem\(claveUltimaCategoria\(usuarioId\)\)/);
  assert.match(main, /localStorage\.setItem\(claveUltimaCategoria\(usuarioActual\.uid\), categoriaId\)/);
  assert.match(main, /aplicarUltimaCategoriaEnFormulario\(\)/);
  assert.match(main, /guardarUltimaCategoria\(valorElegido\)/);
});

test('los datos nuevos y editados guardan correo del autor y del último editor', async () => {
  const datos = await leer('src/servicios/datos.js');
  assert.match(datos, /creadoPorCorreo: usuario\.email \|\| ''/);
  assert.match(datos, /editadoPorCorreo: usuario\.email \|\| ''/);
});

test('la restauración conserva los datos de autor y último editor', async () => {
  const papelera = await leer('src/servicios/papelera.js');
  assert.match(papelera, /creadoPorCorreo: datosActuales\.creadoPorCorreo \|\| ''/);
  assert.match(papelera, /editadoPorCorreo: datosActuales\.editadoPorCorreo \|\| null/);
});

test('la nueva lógica de favoritos, categoría recordada y búsqueda se integra en la aplicación', async () => {
  const main = await leer('src/main.js');
  assert.match(main, /observarFavoritos\(usuario\.uid/);
  assert.match(main, /categoriaSeleccionada === CATEGORIA_FAVORITOS_ID/);
  assert.match(main, /alternarFavorito\(registro\)/);
  assert.match(main, /plantillaResultadosBusqueda\(coincidencias, categorias, textoBusqueda\)/);
});


test('Favoritos vacío conserva su contenido de carpeta y la estrella queda junto al nombre', async () => {
  const vacio = plantillaFavoritos({
    registros: [], categorias: [], revelados: new Set(), favoritos: new Set(),
    observacionesExpandidas: new Set(), usuario: { uid: 'uid-mauri' },
  });
  assert.match(vacio, /Aún no hay favoritos/);
  assert.match(vacio, /estrella-encabezado/);
  const plantilla = await leer('src/interfaz/plantillas.js');
  assert.match(plantilla, /encabezado-identificacion-dato[\s\S]*<strong>\$\{escaparHTML\(registro.nombre\)\}<\/strong>[\s\S]*boton-favorito/);
  const css = await leer('src/estilos.css');
  assert.match(css, /\.boton-favorito \{[^}]*margin: 0 0 0 4px/);
  assert.doesNotMatch(css, /\.boton-favorito \{[^}]*margin-left: auto/);
});


test('el icono vectorial estrella existe y no cae en el icono genérico de carpeta', async () => {
  const iconos = await leer('src/utilidades/iconos.js');
  assert.match(iconos, /star: '<path d=/);
  assert.match(iconos, /const dibujo = ICONOS_VECTORIALES\[valor\] \|\| ICONOS_VECTORIALES\.folder/);
  const main = await leer('src/main.js');
  assert.match(main, /nombre: 'Favoritos'[\s\S]*valor: 'star'/);
});
