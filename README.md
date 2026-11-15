# Mi anotador

Aplicación web de una sola página para guardar información escrita en un espacio privado compartido.

## Tecnologías

- Vite.
- HTML único (`index.html`).
- CSS y JavaScript vanilla (sin React ni otros frameworks de interfaz).
- Firebase Authentication con Google.
- Cloud Firestore.
- Vercel para el despliegue.

Se utiliza el SDK modular de Firebase para JavaScript. Las dependencias declaradas se instalan mediante npm.

## Antes de iniciar

El ZIP no incluye credenciales de Firebase ni reutiliza el proyecto Firebase anterior. Hay que crear un proyecto Firebase nuevo y configurar sus propios datos.

Requisitos de ejecución local: Node.js `20.19+` o `22.12+` y npm. Vite 8 requiere una versión de Node compatible; si npm informa una versión insuficiente, actualizá Node antes de continuar.

## Instalación local

1. Descomprimí el ZIP en una carpeta de trabajo.
2. Abrí esa carpeta en Visual Studio Code.
3. Abrí una terminal en la carpeta del proyecto.
4. Ejecutá:

   ```bash
   npm install
   ```

5. Copiá `.env.example` y renombrá la copia a `.env`.
6. Completá las seis variables de configuración web de Firebase indicadas más abajo.
7. Ejecutá:

   ```bash
   npm run dev
   ```

8. Abrí la dirección local que informe Vite (normalmente `http://localhost:5173`).

## Crear y configurar Firebase

### 1. Proyecto y aplicación web

1. Entrá en [Firebase Console](https://console.firebase.google.com/).
2. Creá un proyecto nuevo para **Mi anotador**. No reutilices el proyecto de Gastos.
3. Registrá una aplicación web dentro del proyecto.
4. Copiá la configuración que Firebase muestra para esa aplicación web.

### 2. Variables de entorno

Completá el archivo `.env` local con estos valores:

```dotenv
VITE_FIREBASE_API_KEY=valor_de_firebase
VITE_FIREBASE_AUTH_DOMAIN=proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=id_del_proyecto
VITE_FIREBASE_STORAGE_BUCKET=proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=valor_de_firebase
VITE_FIREBASE_APP_ID=valor_de_firebase
```

Los nombres deben coincidir exactamente. No agregues comillas ni comas. **No pegues el objeto JavaScript completo** que muestra Firebase (con `apiKey:`, llaves y comas): hay que copiar cada valor a la variable `VITE_FIREBASE_*` correspondiente, como en el ejemplo. El archivo `.env` está excluido del repositorio mediante `.gitignore`.

Después de crear o modificar `.env`, detené Vite con `Ctrl + C` y volvé a ejecutar `npm run dev`. Vite lee las variables al iniciar el servidor.

Los valores `VITE_` forman parte de la configuración que recibe el navegador; no son secretos. No coloques contraseñas privadas ni credenciales de cuentas en ese archivo.

### 3. Authentication (autenticación)

1. En Firebase Console, abrí **Authentication → Sign-in method**.
2. Habilitá el proveedor **Google**.
3. En **Authentication → Settings → Authorized domains**, verificá que figure `localhost`.
4. Después de publicar la aplicación, agregá también el dominio exacto asignado por Vercel.

La aplicación admite únicamente las direcciones incluidas en `src/configuracion.js`. La misma lista se encuentra en `firestore.rules`; ambas listas deben mantenerse sincronizadas si en el futuro se modifica el acceso. Tanto la interfaz como las reglas del servidor exigen que el proveedor de inicio de sesión sea Google.

### 4. Cloud Firestore (base de datos)

1. En Firebase Console, abrí **Firestore Database**.
2. Creá la base de datos en el modo y la región que elijas para este proyecto. La región no está fijada en el código.
3. Abrí la pestaña **Rules**.
4. Reemplazá el contenido por el archivo `firestore.rules` incluido en el ZIP.
5. Publicá las reglas.

La primera sesión autorizada crea automáticamente las categorías iniciales que todavía no existan y que no hayan sido eliminadas definitivamente. Firestore utiliza las colecciones `categorias`, `indicesCategorias` (control de nombres duplicados), `categoriasEliminadasDefinitivamente` (marcadores internos), `datos` y `papelera`.

**Importante:** desplegar la página web no publica las reglas de Firestore. Siempre que se modifique `firestore.rules`, hay que publicarlas por separado desde Firebase Console o mediante Firebase CLI.

Para usar Firebase CLI, después de asociar el proyecto correcto, desde la carpeta del proyecto se puede ejecutar:

```bash
firebase deploy --only firestore:rules
```

No ejecutes ese comando hasta haber seleccionado el proyecto Firebase nuevo correcto.

### 5. Vencimiento de la papelera (sin TTL ni facturación adicional)

La aplicación conserva los registros eliminados durante **10 días**. La fecha `eliminadoEn` se genera con el reloj del servidor de Firestore. No hay que crear una política TTL ni habilitar facturación para esta función.

En cada inicio de sesión autorizado, la aplicación consulta la papelera y elimina físicamente los documentos cuyo plazo de 10 días ya venció. La papelera también oculta los registros vencidos y bloquea su restauración aunque la limpieza física no haya podido completarse por falta de conexión. Si la limpieza falla, se informa el problema y se vuelve a intentar en el siguiente ingreso.

**Alcance de esta modalidad:** si nadie abre la aplicación, los documentos vencidos pueden permanecer almacenados en Firestore hasta el próximo ingreso autorizado. No se usa un proceso de borrado en segundo plano de Google. Esta decisión evita depender de TTL y de su facturación.

## Corrección de reglas de Firestore — Etapa 1.6

Esta etapa corrige la comprobación de disponibilidad de categorías en `firestore.rules`.
Los documentos de categorías creados por la aplicación no tienen necesariamente el campo opcional `eliminandoDefinitivamente`. Las reglas deben leerlo con `Map.get('eliminandoDefinitivamente', false)` para que la ausencia del campo se interprete como `false` y no provoque un rechazo de permisos.

Después de reemplazar el proyecto con esta entrega, hay que volver a publicar el archivo `firestore.rules` desde **Firestore Database → Rules → Publicar**. El despliegue del sitio en Vercel no publica reglas de Firestore.

Si la aplicación ya está desplegada, también hay que generar un nuevo deployment de Vercel para incorporar los archivos de la entrega.

## Despliegue en Vercel

1. Subí el proyecto a un repositorio Git privado (sin `.env`).
2. Importá ese repositorio en Vercel.
3. Usá los valores predeterminados de Vite:
   - Build command: `npm run build`
   - Output directory: `dist`
4. En **Project → Settings → Environment Variables**, cargá las seis variables `VITE_FIREBASE_*` con los valores del proyecto Firebase nuevo.
5. Aplicá las variables a los entornos que correspondan (Production, Preview y Development, según tu uso).
6. Guardá y generá un nuevo despliegue.
7. Copiá el dominio asignado por Vercel y agregalo a **Firebase Authentication → Settings → Authorized domains**.

Si modificás una variable de entorno en Vercel, necesitás generar un nuevo despliegue para que la compilación la reciba.

## Funcionamiento definido

- Una sola página HTML, sin redirecciones entre HTML.
- Inicio de sesión con Google limitado a las direcciones autorizadas en la configuración.
- Bóveda compartida con permisos iguales para los usuarios habilitados.
- Categorías iniciales: Claves, Números de cliente, DNI, CUIL y Otros.
- Categorías personalizadas con iconos vectoriales o emojis. Si no se elige uno, se usa una carpeta genérica.
- El formulario permite agregar una categoría nueva para el registro actual; queda oculta en el selector de futuras cargas hasta habilitarla desde Administración.
- Categorías ocultas o archivadas con registros continúan siendo consultables. Archivar una categoría no elimina los datos asociados.
- Los registros tienen categoría, nombre/identificación, un dato de texto libre y observación opcional.
- Los datos se ocultan inicialmente con ocho asteriscos. Cada registro se revela por separado.
- El botón de copiar copia únicamente el campo Dato.
- La fecha original de creación se conserva al editar. La última edición se muestra en un globo informativo.
- Los registros se ordenan por fecha original de creación, más recientes primero.
- La búsqueda global contempla solamente nombre del registro y nombre de categoría; no busca en el valor del dato ni en la observación.
- Los registros eliminados pasan a la papelera durante 10 días. Se pueden restaurar o eliminar definitivamente antes del vencimiento.
- Las categorías eliminadas se archivan y pueden recuperarse desde Administración, sin vencimiento automático.
- No se implementaron copias de seguridad ni exportaciones, de acuerdo con lo solicitado.

## Seguridad y alcance del cifrado

El acceso se limita en dos lugares: la interfaz verifica la cuenta iniciada y las reglas de Firestore vuelven a verificar la autenticación, el correo verificado y la lista de correos permitidos. Las reglas del servidor son la protección efectiva; ocultar botones o secciones en JavaScript no reemplaza esa protección.

Firebase cifra las comunicaciones y los datos almacenados en su infraestructura. **Esta versión no implementa cifrado de extremo a extremo ni cifrado adicional en el navegador**: cualquier usuario autorizado puede leer los datos de la bóveda. Los datos se guardan como contenido legible para las aplicaciones cliente autenticadas. Esta decisión coincide con la modalidad confirmada para el proyecto.

No compartas el acceso a tu espacio con terceros y cerrá la sesión si utilizás un dispositivo que no sea de confianza.

## Estructura del proyecto

```text
mi-anotador/
├── index.html
├── package.json
├── .env.example
├── firestore.rules
├── firebase.json
├── firestore.indexes.json
├── public/
│   └── favicon.png
├── src/
│   ├── main.js
│   ├── firebase.js
│   ├── configuracion.js
│   ├── estilos.css
│   ├── servicios/
│   │   ├── autenticacion.js
│   │   ├── categorias.js
│   │   ├── datos.js
│   │   └── papelera.js
│   ├── interfaz/
│   │   ├── dialogos.js
│   │   ├── notificaciones.js
│   │   └── plantillas.js
│   └── utilidades/
│       ├── iconos.js
│       └── normalizacion.js
├── tests/
│   ├── validaciones.test.js
│   └── plantillas.test.js
└── documentacion/
    └── pruebas-manuales.md
```

## Pruebas locales

Ejecutá:

```bash
npm test
npm run build
```

Las pruebas automáticas cubren normalización de nombres, detección de equivalencias, identificadores de categorías, escape de HTML, fechas y plantillas de interfaz. No sustituyen una prueba real contra el proyecto Firebase ni una revisión visual en navegadores y teléfonos.


## Actualización 1.2

Se corrigió la clase CSS de la capa de carga: ahora `index.html`, `notificaciones.js` y `estilos.css` utilizan `oculto` de forma consistente. Esto evita que el fondo borroso y el spinner permanezcan visibles después de finalizar una operación. Se agregó una prueba de regresión para esta coincidencia.


## Ajustes de interfaz — Etapa 1.3

Esta entrega corrige los iconos de acciones (mostrar, ocultar, copiar, editar, eliminar, restaurar y papelera), hace que la rueda de configuración abra siempre en Categorías, y reemplaza el formulario permanente de alta por una tarjeta plegable «Agregar nueva categoría». El selector de iconos se superpone al formulario sin empujar los demás campos, con sus dibujos centrados. Las categorías eliminadas se agrupan al final de la lista de administración. Las notificaciones exitosas muestran una tilde y el acordeón «Nuevo dato» tiene una apertura más pausada.

En la etapa 1.3 no se modificaron las reglas de Firestore ni las variables de Firebase. En la etapa 1.5 sí se actualizó `firestore.rules`; consultá la instrucción específica de publicación al final de este README. Al actualizar, conservá `.env`, `package-lock.json` y `node_modules`.


## Ajustes de transiciones y administración — Etapa 1.4

Se mantiene el modal de administración montado al cambiar entre Categorías y Papelera. El cambio de pestaña actualiza únicamente el contenido interno; volver a tocar la pestaña activa no ejecuta ninguna acción. El modal conserva dimensiones constantes y su contenido dispone de desplazamiento independiente.

El formulario «Agregar nueva categoría» permanece montado dentro de un desplegable animado, sin desmontar la ventana de configuración. Las actualizaciones en tiempo real de Firestore reemplazan únicamente la lista de categorías o de papelera, por lo que no reinician el formulario ni su foco. Los acordeones principales y el selector de iconos utilizan transiciones más suaves.


## Eliminación definitiva de categorías — Etapa 1.5

Las categorías archivadas se agrupan en un desplegable al final de la administración. Desde ese grupo se pueden recuperar o eliminar definitivamente. La eliminación definitiva se bloquea si hay registros activos o registros en la papelera asociados a la categoría. Antes de completar la operación, la aplicación marca temporalmente la categoría como bloqueada; las reglas de Firestore verifican ese estado para impedir que se creen nuevas referencias durante el proceso.

Si se elimina definitivamente una categoría inicial, queda un marcador interno en `categoriasEliminadasDefinitivamente` para evitar que la inicialización automática vuelva a crearla. Ese marcador no aparece en la interfaz y no interfiere con índices de otras categorías que puedan usar el mismo nombre más adelante.

**Importante:** esta etapa modifica `firestore.rules`. Después de reemplazar los archivos del proyecto, hay que publicar las reglas nuevas desde Firebase Console → Firestore Database → Rules. Hasta publicarlas, la interfaz tendrá la nueva función, pero Firestore no aplicará la protección adicional contra nuevas referencias durante el borrado.

En los formularios de alta, el selector de iconos no inicia con una opción seleccionada. Si no se elige ninguna, se guarda la carpeta genérica. En la edición de una categoría se muestra su icono actual.
