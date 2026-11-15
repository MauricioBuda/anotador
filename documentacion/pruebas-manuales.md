# Pruebas manuales de aceptación

Estas pruebas deben realizarse después de configurar Firebase y publicar las reglas de Firestore.

## Acceso

- [ ] Ingresar con cada cuenta autorizada configurada.
- [ ] Verificar que una cuarta cuenta de Google no pueda ingresar.
- [ ] Verificar que cerrar sesión vuelva a la pantalla de ingreso.
- [ ] Verificar que al actualizar la página no aparezca fugazmente el formulario de acceso mientras Firebase restaura la sesión.

## Categorías

- [ ] Confirmar que se creen las cinco categorías iniciales una sola vez.
- [ ] Abrir la ruedita y comprobar que ingrese primero en la pestaña Categorías, sin abrir el teclado.
- [ ] Comprobar que «Agregar nueva categoría» aparezca como tarjeta plegada.
- [ ] Abrir la tarjeta y comprobar que recién entonces se despliegue el formulario y aparezca el teclado en celular.
- [ ] Abrir el selector de iconos y comprobar que sus opciones queden centradas y que el panel no desplace los campos ni el botón Agregar.
- [ ] Crear una categoría desde Administración sin elegir icono y comprobar que use la carpeta genérica.
- [ ] Crear una categoría desde Administración con un icono vectorial.
- [ ] Crear otra categoría con un emoji.
- [ ] Crear una categoría desde el formulario y comprobar que se utilice en ese registro, pero no aparezca en futuras cargas hasta habilitarla.
- [ ] Verificar que dos nombres que solo difieren por mayúsculas, tildes o espacios se detecten como duplicados.
- [ ] Cambiar el nombre o icono de una categoría y comprobar que los registros históricos sigan asociados.
- [ ] Ocultar una categoría del formulario y comprobar que sus registros sigan consultables.
- [ ] Archivar una categoría con registros y comprobar que sus datos sigan visibles.
- [ ] Recuperar una categoría archivada.
- [ ] Archivar varias categorías y comprobar que queden agrupadas al final de la lista de Administración.

## Registros

- [ ] Guardar un dato con observación vacía.
- [ ] Guardar otro dato con observación y saltos de línea.
- [ ] Comprobar que los registros se ordenen por fecha original, más recientes primero.
- [ ] Comprobar que todos los datos ocultos se representen con ocho asteriscos.
- [ ] Revelar un registro y comprobar que los demás sigan ocultos.
- [ ] Cambiar de categoría y comprobar que se oculten todos los datos revelados.
- [ ] Copiar y pegar el dato, verificando que no se copien el nombre ni la observación.
- [ ] Editar un registro y comprobar que la fecha original no cambie y que aparezca la fecha de edición al pasar el cursor o tocar la fecha.

## Búsqueda

- [ ] Buscar por nombre de registro.
- [ ] Buscar por nombre de categoría.
- [ ] Probar búsquedas sin distinguir mayúsculas, minúsculas ni tildes.
- [ ] Comprobar que no se busque dentro del dato ni de la observación.
- [ ] Abrir un resultado y verificar que se seleccione la categoría correcta.

## Papelera

- [ ] Enviar un registro a la papelera y comprobar que la confirmación informe del plazo de recuperación.
- [ ] Restaurar un dato antes del vencimiento.
- [ ] Eliminar definitivamente un dato con confirmación.
- [ ] En un entorno de prueba, asignar un `eliminarEn` pasado y verificar que la interfaz no permita restaurarlo.
- [ ] Verificar que, al iniciar sesión, la aplicación elimine físicamente los registros vencidos de la colección `papelera`, sin requerir una política TTL.

## Interfaz

- [ ] Probar ambas secciones plegables.
- [ ] Confirmar que «Nuevo dato» inicie cerrado y «Datos cargados» abierto.
- [ ] Confirmar que no se muestre ninguna categoría hasta seleccionarla.
- [ ] Probar notificaciones, diálogos, spinners y bloqueo de controles durante las operaciones.
- [ ] Comprobar que las notificaciones de éxito muestren una tilde y que los iconos de mostrar, ocultar, copiar, editar, eliminar y restaurar sean distintos y correctos.
- [ ] Comprobar que el acordeón «Nuevo dato» se despliegue de forma pausada.
- [ ] Probar escritorio y móvil, incluyendo 320 px de ancho.


## Verificación de transiciones y administración (Etapa 1.4)

1. Abrir la rueda de configuración y comprobar que el modal aparece en Categorías sin enfocar automáticamente el formulario de alta.
2. Tocar Categorías mientras ya está activa: no debe cambiar el contenido ni parpadear.
3. Cambiar a Papelera y volver a Categorías: el marco del modal debe mantener el mismo tamaño y posición; solo debe cambiar el panel interior.
4. Abrir y cerrar «Agregar nueva categoría»: la tarjeta y el resto del modal deben permanecer en su lugar. Al abrirse el formulario, el foco debe pasar al campo de nombre.
5. Mientras el formulario está abierto, abrir el selector de iconos y comprobar que su panel se superpone sin empujar otros campos.
6. Dejar la configuración abierta y, desde otra sesión autorizada, modificar una categoría o un elemento de la papelera. La actualización en tiempo real debe refrescar solo la lista correspondiente, sin cerrar el formulario ni perder el texto que se está escribiendo.
7. Cerrar y abrir los acordeones principales en escritorio y celular; apertura y cierre deben ser graduales y no deben dejar contenido oculto enfocable.
8. Repetir las pruebas en un navegador móvil y en escritorio, verificando que el modal tenga desplazamiento interno cuando su contenido supera el espacio disponible.

- [ ] En Administración → Categorías, comprobar que las categorías eliminadas están agrupadas en un desplegable al final.
- [ ] Recuperar una categoría archivada y comprobar que vuelve a la lista activa.
- [ ] Intentar eliminar definitivamente una categoría con registros activos: debe impedirlo e indicar el motivo.
- [ ] Intentar eliminar definitivamente una categoría con registros en papelera: debe impedirlo e indicar el motivo.
- [ ] Eliminar definitivamente una categoría sin registros asociados y comprobar que desaparece.
- [ ] Si se elimina definitivamente una categoría inicial, cerrar sesión y volver a ingresar: no debe reaparecer por la inicialización automática.
- [ ] En una categoría nueva, no elegir icono y comprobar que se guarda con la carpeta genérica.
- [ ] Comprobar que la interfaz no muestra mensajes sobre la cantidad de cuentas o usuarios habilitados.


## Etapa 1.6 — creación de registros y campo opcional de categoría

1. Publicar el archivo `firestore.rules` actualizado.
2. Iniciar sesión con una cuenta autorizada.
3. Crear un registro dentro de una categoría inicial existente (por ejemplo, Claves).
4. Confirmar que el registro se guarda y aparece en la categoría.
5. Crear un registro con una categoría nueva desde el formulario y confirmar que la categoría y el registro se crean juntos.
6. Confirmar que las categorías marcadas temporalmente con `eliminandoDefinitivamente: true` no aceptan registros nuevos ni cambios de categoría.

La prueba manual con Firebase real es necesaria; las pruebas automáticas del repositorio verifican el contenido de las reglas, pero no sustituyen al emulador o a una prueba contra el proyecto real.


## Etapa 1.7 — favoritos, autoría, categoría recordada, observaciones y búsqueda

**Antes de probar:** publicar el nuevo `firestore.rules`. La regla nueva habilita la subcolección de favoritos privada por UID; no requiere configurar índices compuestos ni activar facturación.

### Favoritos personales
- [ ] Iniciar sesión y marcar un registro con la estrella.
- [ ] Comprobar que aparece en la carpeta Favoritos (el comportamiento de bloque superior de la etapa 1.7 fue reemplazado en la etapa 1.8).
- [ ] Quitar el favorito desde la carpeta Favoritos y comprobar que desaparece de allí.
- [ ] Marcarlo desde la categoría y comprobar que la estrella queda activa en ambas vistas.
- [ ] Ingresar desde otra sesión/navegador con la misma cuenta y comprobar que conserva sus favoritos.
- [ ] Ingresar con otra cuenta autorizada y comprobar que no ve la lista personal de favoritos de la primera.
- [ ] Mover un registro favorito a la papelera y restaurarlo; comprobar que conserva su favorito personal.

### Autoría y modificación
- [ ] Crear un registro y tocar la fecha: debe mostrar el correo de quien lo creó.
- [ ] Editar ese registro con otra cuenta y tocar la fecha: debe mostrar fecha y correo de quien hizo la última modificación.
- [ ] Comprobar que la fecha original de creación no cambia.
- [ ] Verificar que un registro antiguo sin correo guardado no invente un autor: debe indicar que no está disponible, salvo que el UID corresponda a la cuenta actual.
- [ ] Enviar un registro a papelera y restaurarlo; comprobar que se conservan los datos de creación y última edición.

### Última categoría utilizada
- [ ] Seleccionar una categoría en «Nuevo dato», guardar un registro y cerrar el formulario.
- [ ] Volver a abrir «Nuevo dato» y comprobar que la categoría se precarga.
- [ ] Cambiar de cuenta en el mismo navegador y comprobar que la preferencia queda separada por UID.
- [ ] Probar en otro navegador/dispositivo: la preferencia comienza vacía, porque se guarda localmente y no en Firestore.
- [ ] Ocultar la última categoría utilizada y comprobar que no se precarga si ya no está disponible para nuevas cargas.

### Observaciones plegables
- [ ] Crear un registro con una observación larga.
- [ ] Comprobar que inicialmente se muestran dos líneas y aparece «Ver más».
- [ ] Expandir y volver a contraer la observación.
- [ ] Comprobar una observación breve: no debe mostrar el control «Ver más».
- [ ] Repetir desde la carpeta Favoritos y desde la categoría original; ambos lugares deben conservar el mismo estado expandido/contraído.

### Búsqueda mejorada
- [ ] Buscar un fragmento del nombre y comprobar que aparece resaltado.
- [ ] Buscar una categoría y comprobar que su nombre aparece resaltado.
- [ ] Probar con tildes y mayúsculas distintas al texto guardado.
- [ ] Comprobar el contador singular para un resultado y plural para varios.
- [ ] Verificar que sigue sin buscar en el contenido del dato ni en la observación.
- [ ] Probar entradas que incluyan caracteres como `<`, `>`, comillas y ampersand: no deben interpretarse como HTML.

La prueba manual con Firebase real sigue siendo necesaria. Las pruebas automáticas del repositorio no sustituyen una comprobación de permisos contra el proyecto real ni una revisión visual en celular y escritorio.


## Etapa 1.8 — carpeta Favoritos

- [ ] Verificar que Favoritos aparezca como botón dentro de «Datos cargados», antes de las categorías normales, con una estrella rosada y contador.
- [ ] Confirmar que la carpeta aparezca incluso cuando no hay favoritos y muestre un estado vacío claro.
- [ ] Marcar un registro en una categoría: debe aparecer en la carpeta Favoritos.
- [ ] Comprobar que dentro de Favoritos se pueda revelar y copiar el dato, expandir observaciones y quitar el favorito con la estrella.
- [ ] Comprobar que dentro de Favoritos no aparezcan botones para editar ni enviar a papelera.
- [ ] Abrir la categoría original y verificar que allí sigan disponibles editar y eliminar.
- [ ] Verificar que, al quitar el favorito desde la carpeta, el registro desaparezca de esa carpeta y siga en su categoría original.
- [ ] Verificar que la estrella aparezca a pocos píxeles del nombre tanto en escritorio como en celular, incluso con nombres extensos.
- [ ] Confirmar que los favoritos sigan separados por cuenta y sincronizados entre dispositivos de la misma cuenta.
