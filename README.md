# TP13 -- Consultas web y API de reservas con MongoDB

Aplicación web para administrar reservas de salas de estudio, desarrollada con **Node.js, Express, EJS y MongoDB** mediante Mongoose.

Este trabajo práctico amplía las funcionalidades del TP12 incorporando consultas de reservas con **búsqueda textual, filtros, ordenamiento y paginación**, tanto desde la interfaz web como desde la API REST.

Las dos interfaces comparten los criterios de búsqueda y el mismo método del servicio de persistencia, evitando duplicar la lógica de consulta.

Se conservan las funcionalidades CRUD web y los endpoints de la API REST desarrollados en los trabajos prácticos anteriores.

## Tecnologías utilizadas

- **Node.js:** >= 22.13.0 (entorno de ejecución).
- **Express:** 5.2.1 (servidor y enrutamiento HTTP).
- **MongoDB Atlas y Mongoose:** rango declarado `^9.11.2` (persistencia y validación de documentos). Base de datos `reservas_salas_u13`.
- **EJS:** 6.0.1 y **express-ejs-layouts:** 2.5.1 (vistas HTML renderizadas en el servidor).
- **Morgan:** 1.12.1 (registro de solicitudes HTTP).
- **Prettier:** 3.9.9 y **ESLint:** 10.12.0 (formato y análisis estático del código).
- **Postman:** herramienta opcional para probar la API REST.

## Requisitos previos

- Node.js 22.13.0 o superior.
- npm.
- Una cuenta y un clúster de MongoDB Atlas.
- Acceso de red al clúster de MongoDB Atlas.

## Instalación

Clonar el repositorio y entrar en la carpeta del proyecto:

```bash
git clone https://github.com/marcos-batallan/tp-13-salas-consultas-web-mongodb.git
cd tp-13-salas-consultas-web-mongodb
```

Instalar las dependencias declaradas en `package-lock.json`:

```bash
npm ci
```

## Configuración del entorno

Crear un archivo `.env` a partir de `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u13?retryWrites=true&w=majority
```

Reemplazar `USUARIO`, `CLAVE` y `HOST` por los datos de conexión correspondientes. La URI debe apuntar a la base de datos `reservas_salas_u13`.

**Importante:** el archivo `.env` contiene credenciales y no debe subirse al repositorio. El archivo `.env.example` utiliza valores de ejemplo y no contiene secretos.

El archivo `.gitignore` excluye `node_modules` y `.env`, conservando `.env.example`.

### Comprobar la conexión

Ejecutar:

```bash
node --env-file=.env scripts/comprobar-conexion.js
```

Si la conexión es correcta, se informa:

```text
Conexión con MongoDB establecida
```

## Ejecución

Iniciar la aplicación cargando las variables del archivo `.env`:

```bash
npm run start:local
```

También se puede ejecutar directamente:

```bash
node --env-file=.env src/index.js
```

Por defecto, la aplicación queda disponible en:

```text
http://localhost:3000
```

## Estructura del proyecto

```text
tp-13-salas-consultas-web-mongodb/
│
├── public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
│       ├── favicon.svg
│       └── salas-estudio.svg
│
├── scripts/
│   ├── comprobar-conexion.js
│   ├── crear-reservas.js
│   ├── listar-reservas.js
│   └── validar-reserva.js
│
├── src/
│   ├── config/
│   │   ├── base-datos.js
│   │   └── entorno.js
│   │
│   ├── controladores/
│   │   └── reservas.js
│   │
│   ├── middleware/
│   │   ├── cambios-reservas.js
│   │   ├── errores.js
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   │
│   ├── modelos/
│   │   └── reserva.js
│   │
│   ├── rutas/
│   │   ├── reservas-api.js
│   │   └── reservas.js
│   │
│   ├── servicios/
│   │   ├── criterios-reservas.js
│   │   ├── reservas-mongo.js
│   │   └── reservas.js
│   │
│   ├── app.js
│   └── index.js
│
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── partials/
│   │   ├── encabezado.ejs
│   │   └── pie.ejs
│   ├── reservas/
│   │   ├── detalle.ejs
│   │   ├── editar.ejs
│   │   ├── eliminar.ejs
│   │   ├── estado.ejs
│   │   ├── lista.ejs
│   │   └── nueva.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package-lock.json
├── package.json
└── README.md
```

La aplicación mantiene una separación por responsabilidades:

- **Configuración:** lectura y validación de variables de entorno, conexión y desconexión de MongoDB.
- **Modelo:** esquema Mongoose y reglas de validación de los documentos.
- **Servicio:** operaciones de persistencia, consultas, reemplazos, actualizaciones parciales y eliminaciones.
- **Criterios de consulta:** lectura y validación de los parámetros recibidos para las búsquedas.
- **Controlador:** coordinación entre solicitudes HTTP, servicios y respuestas.
- **Rutas:** definición de endpoints web y API REST.
- **Middleware:** validación de entradas, preparación de datos para las vistas, identificación y medición de solicitudes, y manejo centralizado de errores.
- **Vistas:** formularios, listado, detalle, cambio de estado, confirmación de eliminación y mensajes HTML.

Se conserva `reservas.js`, el servicio en memoria de versiones anteriores, como parte de la evolución del proyecto. La aplicación actual utiliza `reservas-mongo.js` para trabajar con MongoDB.

## Modelo de reserva

La aplicación utiliza la base de datos `reservas_salas_u13` y la colección `reservas`.

Cada documento contiene los siguientes campos:

| Campo | Tipo | Regla |
|---|---|---|
| `id` | ObjectId representado como texto | Identificador generado por MongoDB |
| `estudiante` | String | Obligatorio |
| `email` | String | Obligatorio; debe contener `@` |
| `sala` | String | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| `fecha` | String | Obligatoria |
| `turno` | String | `Mañana`, `Tarde` o `Noche` |
| `personas` | Number | Número entero entre 1 y 6 |
| `estado` | String | `pendiente` o `confirmada`; valor predeterminado `pendiente` |

El identificador se genera automáticamente mediante MongoDB y no se modifica desde los formularios.

Al crear una reserva desde la web o la API, el estado se establece inicialmente en `pendiente` mediante el valor predeterminado del modelo.

## Funcionalidades web

La interfaz permite consultar reservas, crear nuevas, visualizar su detalle, editar sus campos, modificar su estado y eliminar registros mediante una confirmación explícita.

### Consultar reservas

La ruta:

```text
GET /reservas
```

permite consultar las reservas almacenadas en MongoDB.

El listado incorpora los siguientes criterios:

- **Búsqueda por estudiante:** permite buscar coincidencias parciales en el nombre.
- **Filtro por sala:** permite seleccionar una sala específica.
- **Ordenamiento:** permite ordenar por nombre del estudiante o por cantidad de personas.
- **Paginación:** permite establecer la cantidad de resultados por página y navegar entre páginas.

Los criterios se envían mediante parámetros de consulta GET.

Ejemplo:

```text
/reservas?q=Ana&sala=Sala%20Norte&orden=personas-asc&limite=2&pagina=1
```

El formulario conserva los criterios seleccionados al navegar entre páginas. También permite limpiar los filtros y volver al listado general.

Cuando no existen coincidencias, se muestra un mensaje informativo. Si se solicita una página sin registros, pero existen resultados en otras páginas, se ofrece un enlace para regresar a la primera.

### Criterios de búsqueda

| Parámetro | Descripción | Valor predeterminado |
|---|---|---|
| `q` | Texto para buscar en el nombre del estudiante | Vacío |
| `sala` | Nombre exacto de la sala | Vacío |
| `orden` | Criterio de ordenamiento | `estudiante` |
| `pagina` | Número de página | `1` |
| `limite` | Cantidad de resultados por página | `2` |

Los criterios admitidos para `orden` son:

| Valor | Comportamiento |
|---|---|
| `estudiante` | Orden alfabético por estudiante, ascendente |
| `personas-asc` | Cantidad de personas, de menor a mayor |
| `personas-desc` | Cantidad de personas, de mayor a menor |

El límite admite valores enteros entre 1 y 20. La página admite valores enteros entre 1 y 1000.

La búsqueda textual no distingue entre mayúsculas y minúsculas y trata el texto ingresado de forma literal, sin interpretar caracteres especiales como expresiones regulares.

### Resto de las funcionalidades web

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Página de inicio |
| GET | `/estado` | Estado del servicio, cantidad de reservas e identificador de solicitud |
| GET | `/reservas` | Listado, búsqueda, filtros, ordenamiento y paginación |
| GET | `/reservas/nueva` | Mostrar formulario de creación |
| POST | `/reservas` | Crear una reserva |
| GET | `/reservas/:id` | Mostrar el detalle de una reserva |
| GET | `/reservas/:id/editar` | Mostrar formulario de edición |
| POST | `/reservas/:id/editar` | Guardar el reemplazo completo |
| GET | `/reservas/:id/estado` | Mostrar formulario para modificar el estado |
| POST | `/reservas/:id/estado` | Actualizar únicamente el estado |
| GET | `/reservas/:id/eliminar` | Mostrar confirmación de eliminación |
| POST | `/reservas/:id/eliminar` | Confirmar y ejecutar la eliminación |

La edición reemplaza los siete campos de la reserva. El cambio de estado utiliza una operación parcial que modifica únicamente `estado`. La eliminación web requiere confirmación explícita.

## API REST

La API conserva las operaciones desarrolladas en los trabajos prácticos anteriores e incorpora un endpoint específico para las nuevas consultas.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reservas` | Consultar reservas mediante los criterios anteriores |
| GET | `/api/reservas/consulta` | Buscar, filtrar, ordenar y paginar reservas |
| GET | `/api/reservas/:id` | Obtener una reserva por identificador |
| POST | `/api/reservas` | Crear una reserva |
| PUT | `/api/reservas/:id` | Reemplazar completamente una reserva |
| PATCH | `/api/reservas/:id` | Actualizar parcialmente campos permitidos |
| DELETE | `/api/reservas/:id` | Eliminar una reserva |

### Consulta de reservas

El nuevo endpoint:

```http
GET /api/reservas/consulta
```

utiliza los mismos criterios de búsqueda que el listado web.

Admite los parámetros:

- `q`: búsqueda parcial por estudiante.
- `sala`: filtro exacto por sala.
- `orden`: criterio de ordenamiento.
- `pagina`: número de página.
- `limite`: cantidad de resultados por página.

Ejemplo:

```text
http://localhost:3000/api/reservas/consulta?q=Ana&sala=Sala%20Norte&orden=personas-asc&limite=2&pagina=1
```

Respuesta exitosa:

```json
{
  "datos": [
    {
      "id": "ID_REAL",
      "estudiante": "Ana Alba",
      "email": "ana.alba@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-11-18",
      "turno": "Mañana",
      "personas": 1,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 1,
  "paginas": 1
}
```

Los valores del ejemplo son ilustrativos. Los resultados reales dependen de los documentos almacenados en MongoDB.

La respuesta incluye:

- `datos`: reservas correspondientes a la página solicitada.
- `pagina`: página actual.
- `limite`: cantidad máxima de resultados por página.
- `total`: cantidad total de reservas que cumplen los criterios.
- `paginas`: cantidad total de páginas disponibles.

Cuando la página solicitada no contiene resultados, `datos` es un arreglo vacío. Si no existen coincidencias, `total` y `paginas` son cero.

### Consulta anterior de la API

Se conserva:

```http
GET /api/reservas
```

Este endpoint mantiene la consulta anterior, con sus criterios de sala, ordenamiento y paginación, sin incorporar el nuevo parámetro de búsqueda textual `q`.

De esta manera, se mantiene la compatibilidad con las funcionalidades existentes.

### Validación de criterios

Los parámetros de consulta se validan antes de ejecutar la búsqueda.

Se rechazan:

- Parámetros no permitidos.
- Parámetros repetidos.
- Valores que no sean un único texto.
- Búsquedas de más de 60 caracteres.
- Filtros de sala de más de 80 caracteres.
- Criterios de ordenamiento no admitidos.
- Páginas fuera del rango de 1 a 1000.
- Límites fuera del rango de 1 a 20.
- Valores decimales o no enteros para página y límite.

Los errores de entrada inválida se responden con HTTP 400. La API devuelve los mensajes correspondientes en formato JSON.

### Reemplazo completo con PUT

El endpoint:

```http
PUT /api/reservas/:id
```

permite reemplazar los siete campos de una reserva:

- `estudiante`
- `email`
- `sala`
- `fecha`
- `turno`
- `personas`
- `estado`

El identificador se obtiene de la URL y no forma parte del cuerpo editable.

La operación valida los datos y devuelve la reserva actualizada con HTTP 200.

Si el identificador es inválido, se responde con HTTP 400. Si la reserva no existe, se responde con HTTP 404.

### Actualización parcial con PATCH

El endpoint:

```http
PATCH /api/reservas/:id
```

permite modificar únicamente:

- `personas`
- `estado`

No permite modificar `estudiante`, `email`, `sala` ni `fecha`.

Ejemplo:

```http
PATCH http://localhost:3000/api/reservas/ID_REAL
Content-Type: application/json
```

```json
{
  "personas": 4
}
```

También se puede actualizar el estado:

```json
{
  "estado": "confirmada"
}
```

La solicitud debe incluir al menos uno de los campos permitidos. Los campos adicionales, los valores inválidos y los cuerpos vacíos se rechazan con HTTP 400.

La actualización utiliza una operación parcial, conservando los campos que no se enviaron.

### Eliminación mediante DELETE

La API conserva:

```http
DELETE /api/reservas/:id
```

Si la reserva existe, se elimina y se responde con:

```text
204 No Content
```

La respuesta no contiene cuerpo.

Si el identificador es válido pero la reserva no existe, se responde con HTTP 404 y un mensaje JSON.

## Validaciones y manejo de errores

La aplicación valida los datos tanto en los formularios web como en la API.

Reglas generales:

- Los textos obligatorios deben contener información.
- El email debe incluir `@`.
- La sala debe pertenecer a las opciones permitidas.
- El turno debe pertenecer a las opciones permitidas.
- La fecha es obligatoria.
- `personas` debe ser un número entero entre 1 y 6.
- `estado` debe ser `pendiente` o `confirmada`.
- Los identificadores deben tener formato ObjectId válido.

Para las nuevas consultas se validan los parámetros admitidos, su contenido, longitud y rango.

El manejo centralizado de errores distingue entre solicitudes web y solicitudes de la API:

- Los errores de formularios web se muestran mediante vistas HTML.
- Los errores de la API se responden en formato JSON.
- Los errores de entrada e identificadores inválidos se clasifican como HTTP 400.
- Los recursos inexistentes se responden con HTTP 404.
- Los errores internos del servidor se clasifican como HTTP 500.

## Persistencia y datos de prueba

La aplicación utiliza MongoDB Atlas con:

- Base de datos: `reservas_salas_u13`.
- Colección: `reservas`.

Los documentos permanecen almacenados en MongoDB al detener y volver a iniciar el servidor.

La aplicación no realiza una carga automática de reservas al iniciar. Los registros de prueba se pueden crear desde el formulario web o mediante la API.

Los scripts auxiliares permiten comprobar la conexión, crear registros de prueba, listar documentos y validar instancias del modelo.

**Precaución:** `scripts/crear-reservas.js` inserta nuevas reservas cada vez que se ejecuta. No es un proceso idempotente; utilizarlo conscientemente para evitar registros duplicados.

## Pruebas realizadas

Las verificaciones funcionales se realizaron con la aplicación conectada a MongoDB Atlas, utilizando el navegador y Postman.

### Búsqueda, filtros y ordenamiento

| Caso | Verificación |
|---|---|
| Listado general | GET `/reservas` muestra las reservas existentes |
| Búsqueda parcial | Se buscan coincidencias por nombre de estudiante |
| Búsqueda sin distinguir mayúsculas | `Ana` y `ana` producen coincidencias equivalentes |
| Búsqueda literal | Se comprueba el texto `A+B` |
| Caracteres especiales | Se comprueban búsquedas con `[` y `.*` sin interpretarlos como expresiones regulares |
| Filtro por sala | Se obtienen únicamente reservas de la sala seleccionada |
| Criterios combinados | Se combinan búsqueda textual y filtro por sala |
| Orden predeterminado | Se ordena alfabéticamente por estudiante |
| Orden ascendente | Se ordena por cantidad de personas de menor a mayor |
| Orden descendente | Se ordena por cantidad de personas de mayor a menor |
| Desempate | Se utiliza el identificador para estabilizar el orden |

### Paginación y validaciones

| Caso | Verificación |
|---|---|
| Valores predeterminados | Página 1 y límite 2 |
| Navegación | Los enlaces anterior y siguiente conservan los criterios |
| Límite configurable | Se comprueban diferentes cantidades por página |
| Página sin resultados | Se devuelve un arreglo vacío y se conservan los metadatos |
| Sin coincidencias | Se muestra el mensaje correspondiente |
| Página máxima | `pagina=1000` es aceptada |
| Página fuera de rango | `pagina=1001` devuelve HTTP 400 |
| Página decimal | `pagina=1.5` devuelve HTTP 400 |
| Página repetida | Dos parámetros `pagina` devuelven HTTP 400 |
| Límite fuera de rango | `limite=21` devuelve HTTP 400 |
| Orden inválido | Un criterio no permitido devuelve HTTP 400 |
| Texto demasiado largo | Se rechazan búsquedas y filtros que superan sus longitudes máximas |
| Parámetro repetido | Se rechazan parámetros duplicados |
| Parámetro desconocido | Se rechazan criterios no admitidos |
| Validación web | Los criterios inválidos muestran la página de error con HTTP 400 |

### API y compatibilidad

| Caso | Verificación |
|---|---|
| Nueva consulta API | GET `/api/reservas/consulta` devuelve resultados y metadatos |
| Búsqueda y filtros combinados | Se comprueba la combinación de criterios desde Postman |
| Página sin resultados | Se devuelve `datos: []` con los metadatos correspondientes |
| Consulta anterior | GET `/api/reservas` conserva su comportamiento |
| Consulta individual | GET `/api/reservas/:id` devuelve una reserva existente |
| Reemplazo completo | PUT modifica los campos admitidos |
| Actualización parcial | PATCH modifica `personas` o `estado` |
| Eliminación API | DELETE responde HTTP 204 |
| Consulta posterior al borrado | GET del identificador eliminado responde HTTP 404 |

### Regresión de funcionalidades CRUD

También se verificó que las funcionalidades anteriores continúan funcionando:

- Creación de reservas desde la web.
- Edición completa desde la web.
- Cambio de estado desde la web.
- Confirmación y cancelación de la eliminación web.
- Creación, consulta, PUT, PATCH y DELETE desde la API.
- Conservación de los demás campos durante las actualizaciones parciales.
- Respuestas adecuadas para identificadores inválidos y reservas inexistentes.

### Persistencia

Se reinició el servidor y se repitieron consultas sobre los documentos almacenados.

Se comprobó que:

- Las reservas existentes permanecen almacenadas.
- Los cambios realizados desde la web y la API persisten.
- Los documentos eliminados no reaparecen.
- Las consultas y la paginación continúan funcionando después del reinicio.

## Ejecución de controles de calidad

Formatear los archivos:

```bash
npm run format
```

Comprobar formato y lint:

```bash
npm run check
```

El script `check` ejecuta:

```bash
prettier --check src scripts
eslint src scripts
```

También se verificó la instalación limpia de las dependencias:

```bash
npm ci
```

Y la auditoría de seguridad:

```bash
npm audit
```

Durante la revisión se actualizó Mongoose dentro del rango declarado en `package.json`. La versión instalada y verificada es 9.12.1.

La auditoría posterior informó:

```text
found 0 vulnerabilities
```

Después de la actualización se volvió a ejecutar `npm run check`, que finalizó correctamente.

También se comprobó la conexión con MongoDB y el arranque de la aplicación.

## Scripts disponibles

| Comando | Función |
|---|---|
| `npm start` | Inicia `src/index.js` utilizando las variables disponibles en el entorno |
| `npm run start:local` | Inicia la aplicación cargando las variables de `.env` |
| `npm run format` | Formatea los archivos de `src` y `scripts` |
| `npm run format:check` | Comprueba el formato de `src` y `scripts` |
| `npm run lint` | Ejecuta ESLint sobre `src` y `scripts` |
| `npm run check` | Ejecuta la comprobación de formato y lint |

Scripts auxiliares:

```bash
node --env-file=.env scripts/comprobar-conexion.js
node --env-file=.env scripts/crear-reservas.js
node --env-file=.env scripts/listar-reservas.js
node --env-file=.env scripts/validar-reserva.js
```

- `comprobar-conexion.js`: establece y cierra una conexión con MongoDB para verificar su disponibilidad.
- `crear-reservas.js`: crea reservas de prueba en la base de datos.
- `listar-reservas.js`: consulta y muestra las reservas almacenadas.
- `validar-reserva.js`: valida una instancia del modelo sin guardarla en MongoDB.

## Alcance del TP13

El trabajo práctico incorpora consultas de reservas mediante búsqueda textual, filtros, ordenamiento y paginación, tanto desde la interfaz web como desde la API REST.

Los criterios de consulta se centralizan y son compartidos por ambas interfaces, mientras que el servicio de persistencia ejecuta las operaciones sobre MongoDB.

Se mantienen las funcionalidades CRUD desarrolladas en los trabajos prácticos anteriores, junto con los endpoints de la API REST.

La aplicación conserva la separación de responsabilidades entre configuración, modelo, servicios, controladores, rutas, middleware y vistas.

**Proyecto correspondiente al TP13 -- Consultas web y API de reservas con MongoDB.**