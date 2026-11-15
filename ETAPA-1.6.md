# Mi anotador — Etapa 1.6

## Corrección principal

Se corrigió `firestore.rules` en la función `categoriaDisponible(categoriaId)`.

Las categorías normales no guardan el campo opcional `eliminandoDefinitivamente`. La expresión anterior accedía directamente a ese campo y Firestore denegaba la escritura cuando no existía. Ahora se utiliza `Map.get('eliminandoDefinitivamente', false)`, de modo que la ausencia del campo equivale a `false`.

## Archivos modificados

- `firestore.rules`: lectura segura del campo opcional.
- `README.md`: explicación de la corrección y pasos de publicación.
- `documentacion/pruebas-manuales.md`: comprobación de alta de registros.
- `tests/administracion-interfaz.test.js`: actualización de la regresión de reglas.
- `tests/reglas-firestore.test.js`: nuevas pruebas de regresión estática.

## Acción obligatoria

Después de reemplazar los archivos, publicar nuevamente `firestore.rules` en Firebase Console → Firestore Database → Rules → Publicar.
La publicación de Vercel no actualiza las reglas de Firestore.
