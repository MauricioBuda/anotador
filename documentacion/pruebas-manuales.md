# Pruebas manuales de aceptación

Estas pruebas deben realizarse después de configurar Firebase y publicar las reglas de Firestore.

## Acceso

- [ ] Ingresar con cada una de las tres cuentas autorizadas.
- [ ] Verificar que una cuarta cuenta de Google no pueda ingresar.
- [ ] Verificar que cerrar sesión vuelva a la pantalla de ingreso.
- [ ] Verificar que al actualizar la página no aparezca fugazmente el formulario de acceso mientras Firebase restaura la sesión.

## Categorías

- [ ] Confirmar que se creen las cinco categorías iniciales una sola vez.
- [ ] Crear una categoría desde Administración sin elegir icono y comprobar que use la carpeta genérica.
- [ ] Crear una categoría desde Administración con un icono vectorial.
- [ ] Crear otra categoría con un emoji.
- [ ] Crear una categoría desde el formulario y comprobar que se utilice en ese registro, pero no aparezca en futuras cargas hasta habilitarla.
- [ ] Verificar que dos nombres que solo difieren por mayúsculas, tildes o espacios se detecten como duplicados.
- [ ] Cambiar el nombre o icono de una categoría y comprobar que los registros históricos sigan asociados.
- [ ] Ocultar una categoría del formulario y comprobar que sus registros sigan consultables.
- [ ] Archivar una categoría con registros y comprobar que sus datos sigan visibles.
- [ ] Recuperar una categoría archivada.

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
- [ ] Probar escritorio y móvil, incluyendo 320 px de ancho.
