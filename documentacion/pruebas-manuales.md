# Pruebas manuales de aceptación

Estas pruebas deben realizarse después de configurar Firebase y publicar las reglas de Firestore.

## Acceso

- [ ] Ingresar con cada una de las tres cuentas autorizadas.
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
