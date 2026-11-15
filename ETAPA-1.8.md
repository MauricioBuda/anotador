# Mi anotador — Etapa 1.8

## Cambios

1. Se incorporó «Favoritos» como carpeta virtual dentro de «Datos cargados», con icono de estrella rosada y contador.
2. La carpeta aparece aunque esté vacía.
3. Los favoritos muestran el nombre de su categoría de origen y conservan el orden por fecha original de creación.
4. Dentro de Favoritos se permite revelar, copiar, expandir observaciones y quitar el favorito con la estrella; no se ofrecen acciones de editar ni enviar a papelera. Para editar o eliminar, se debe abrir la categoría original.
5. La estrella de cada registro ahora queda inmediatamente después del nombre y fluye con el texto cuando el nombre ocupa más de una línea.

## Datos y Firebase

- Se mantiene el almacenamiento personal por UID en `usuarios/{uid}/favoritos/{datoId}`.
- No se agregan colecciones ni campos a los datos existentes.
- No se modifican las reglas de Firestore. No hace falta volver a publicarlas por esta etapa.
- No se agregan dependencias ni se requiere un plan pago.

## Actualización

Reemplazar los archivos del proyecto por los incluidos en el ZIP, conservando `.env`, `package-lock.json` y `node_modules`. No se requiere modificar variables de entorno ni Firebase.
