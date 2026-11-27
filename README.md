# Stride & Co. Backend

Backend REST para Stride & Co., desarrollado con Node.js y Express. El proyecto integra persistencia relacional y documental, autenticacion JWT, autorizacion basada en roles, internacionalizacion, configuracion por entornos y pruebas automatizadas.

## Entregable

Proyecto integrador - Entregable 3. Interfaz web con renderizado del lado del servidor (SSR), construida sobre el Entregable 2 (backend completo, internacionalizado y desplegado sin costo).

| Campo | Detalle |
| --- | --- |
| Universidad | Universidad Autonoma de Chihuahua |
| Facultad | Facultad de Ingenieria |
| Carrera | Ingenieria en Computacion |
| Materia | Desarrollo de Aplicaciones Web |
| Docente | Mtro. Luis Antonio Ramirez Martinez |

## Tecnologias

- Node.js, Express y Morgan.
- Pug para las vistas renderizadas del lado del servidor (SSR).
- PostgreSQL con Sequelize.
- MongoDB Atlas con Mongoose.
- JSON Web Tokens, bcrypt y express-jwt.
- cookie-parser para la cookie de sesion (JWT) y la cookie de idioma.
- express-validator para la validacion de formularios en el servidor.
- AccessControl para RBAC.
- i18n para mensajes en espanol e ingles.
- config para la configuracion por entornos.
- Jest y Supertest para pruebas unitarias y E2E.
- Docker y Render para el despliegue.

## Funcionalidades SSR

| ID | Funcionalidad | Rutas | Permiso | Responsable | Evidencia |
| --- | --- | --- | --- | --- | --- |
| F1 | Inicio y cierre de sesion | `GET/POST /login`, `POST /logout` | Publica | Santiago de la Mora Martinez | [docs/ssr/README.md#f1](docs/ssr/README.md#f1) |
| F2 | Inicio y catalogo | `GET /`, `GET /products` | Publica | Emilio Gallardo Medrano | pendiente |
| F3 | Detalle de producto | `GET /products/:id` | Publica | Emilio Gallardo Medrano | pendiente |
| F8 | Administracion de productos | `/admin/products` y sus rutas | `products:*:any` | Yahel Santiago Uribe Mendoza | pendiente |
| F10 | Inventario | `GET /admin/inventory`, `POST /admin/inventory/:variantId` | `inventory:update:any` | Yahel Santiago Uribe Mendoza | pendiente |

## Arquitectura de datos

| Persistencia | Recursos |
| --- | --- |
| PostgreSQL / Sequelize | users, roles, permissions, products, variants e inventory |
| MongoDB Atlas / Mongoose | customers y orders |

Asociaciones relacionales: `User -> Role`, `Role <-> Permission` (mediante `Role_Permission`), `Product -> Variant` y `Variant -> Inventory`.

La propiedad de una orden (alcance `own`) se valida resolviendo:

```text
Order.customerId -> Customer.userId
```

Es decir, una orden es "propia" del usuario dueno del cliente que la realizo.

## Instalacion local

Requisitos:

- Node.js 20 o superior y npm.
- PostgreSQL y MongoDB disponibles localmente (por ejemplo con Docker).

Clonar e instalar:

```bash
git clone https://github.com/Yahel33/Proyecto-web-sprint0.git
cd Proyecto-web-sprint0
npm install
```

Levantar las bases en Docker (opcional, para desarrollo local):

```bash
docker run --name stride-postgres -e POSTGRES_PASSWORD=abcd1234 -e POSTGRES_DB=stride-co -p 5432:5432 -d postgres:16
docker run --name stride-mongo -p 27017:27017 -d mongo:7
```

Copiar la plantilla de secretos de desarrollo y completar los valores:

```powershell
Copy-Item config/local-development.example.json config/local-development.json
```

Ejemplo de `config/local-development.json` (no se sube al repositorio):

```json
{
  "jwt": { "secret": "un-secreto-largo-de-desarrollo" },
  "database": {
    "sql": { "password": "abcd1234" },
    "mongo": { "uri": "mongodb://localhost:27017/stride-co" }
  }
}
```

`config/local-development.json` y `config/local-production.json` estan ignorados por Git y por Docker: contienen secretos y nunca deben subirse.

Cargar los datos iniciales y arrancar en desarrollo:

```bash
npm run seed
npm run dev
```

## Configuracion por entornos

La configuracion se lee con la libreria `config`; el codigo nunca lee `process.env` directamente.

| Donde | Que |
| --- | --- |
| Variables de entorno | Solo el modo (`NODE_ENV`) y el puerto (`PORT`). |
| `config/*.json` en Git | Configuracion no secreta (hosts, expiracion del JWT, costo de bcrypt, flag de SSL). |
| `config/local*.json` fuera de Git | Secretos: `jwt.secret`, contrasenas y URIs de las bases. |

Entornos disponibles: `development`, `test` y `production`, seleccionados con `NODE_ENV`. `PORT` se enlaza con `server.port` mediante `config/custom-environment-variables.json`. Si falta `jwt.secret`, el servidor no arranca y muestra un mensaje claro.

## Configuracion de produccion (Render)

Render proporciona `NODE_ENV=production` y el puerto mediante `PORT`. Las credenciales de PostgreSQL, MongoDB y JWT se entregan como un Secret File llamado `local-production.json`.

Al iniciar el contenedor, `docker-entrypoint.sh` copia el archivo desde `/etc/secrets/local-production.json` hacia `config/local-production.json`. El secreto no queda en la imagen Docker ni en GitHub. En produccion la conexion a PostgreSQL usa SSL (`config/production.json` activa `database.sql.ssl`).

## Scripts

| Comando | Descripcion |
| --- | --- |
| `npm start` | Inicia la aplicacion (produccion, `NODE_ENV` lo provee el entorno). |
| `npm run dev` | Inicia la aplicacion en desarrollo con Nodemon. |
| `npm run seed` | Recrea los datos iniciales (roles, permisos, usuarios demo y ejemplos). |
| `npm test` | Ejecuta las pruebas unitarias con mocks. |
| `npm run test:e2e` | Ejecuta las pruebas E2E contra la API en ejecucion. |
| `npm run lint` | Ejecuta ESLint. |

## Endpoints

Las rutas protegidas requieren el encabezado:

```text
Authorization: Bearer <token>
```

### Sistema y autenticacion (sin RBAC)

| Metodo | Ruta | Proteccion | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/health` | Publica | Estado del servicio: `{ "status": "UP" }`. |
| `POST` | `/api/auth/register` | Publica | Crea un usuario con la contrasena hasheada. |
| `POST` | `/api/auth/login` | Publica | Valida credenciales y devuelve un JWT. |
| `GET` | `/api/auth/me` | Solo authenticate | Devuelve el usuario autenticado. |

### Recursos relacionales y documentales (con RBAC)

Cada uno de estos recursos (`users`, `roles`, `permissions`, `products`, `variants`, `inventory`, `customers`) expone el mismo patron REST, protegido con `authenticate` + `authorize`:

| Metodo | Ruta | Permiso requerido | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/<recurso>` | `<recurso>:read:any` | Lista los registros. |
| `GET` | `/api/<recurso>/:id` | `<recurso>:read:any` | Obtiene un registro por id. |
| `POST` | `/api/<recurso>` | `<recurso>:create:any` | Crea un registro. |
| `PUT` | `/api/<recurso>/:id` | `<recurso>:update:any` | Actualiza un registro. |
| `DELETE` | `/api/<recurso>/:id` | `<recurso>:delete:any` | Elimina un registro. |

### Ordenes (`/api/orders`, con alcance own)

| Metodo | Ruta | Permiso requerido | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/orders` | `orders:read:any` | Lista todas las ordenes. |
| `GET` | `/api/orders/:id` | `orders:read:own` | Consulta una orden propia (valida `Customer.userId`). |
| `POST` | `/api/orders` | `orders:create:any` | Crea una orden. |
| `PUT` | `/api/orders/:id` | `orders:update:own` | Actualiza una orden propia. |
| `DELETE` | `/api/orders/:id` | `orders:delete:any` | Elimina una orden. |

Codigos de respuesta: `200` consulta o actualizacion correcta, `201` creacion, `400` datos invalidos, `401` sin token o token invalido, `403` sin el permiso requerido, `404` recurso inexistente, `500` error del servidor.

## Control de acceso basado en roles (RBAC)

Los permisos se obtienen de la base de datos (`Role -> Role_Permission -> Permission`), no de arreglos ni condicionales en el codigo. Cada permiso sigue la convencion `recurso:accion:alcance` (por ejemplo `products:delete:any` u `orders:read:own`). El middleware `authorize(recurso, accion, alcance)` se coloca despues de `authenticate`. Un usuario autenticado sin el permiso recibe `403` con el mensaje traducido.

El seed registra el permiso de todos los recursos y acciones. La matriz de roles es:

| Rol | Permisos |
| --- | --- |
| `admin` | Todos los `recurso:accion:any` de todos los recursos. |
| `sales` | `products:read:any`, `variants:read:any`, `inventory:read:any`, `customers:create:any`, `customers:read:any`, `customers:update:any`, `orders:create:any`, `orders:read:own`, `orders:update:own`. |
| `user` | `products:read:any`, `variants:read:any`, `orders:create:any`, `orders:read:own`, `orders:update:own`. |

Esta matriz coincide con `scripts/seed.js` y con el comportamiento de la API.

## Autenticacion

`POST /api/auth/login` devuelve un JWT para credenciales validas. Las contrasenas se almacenan con bcrypt (`salt_key` + `password_hash`); las respuestas nunca exponen `password_hash` ni `salt_key`. El token lleva el id del usuario en `sub`, se firma con `HS256` y valida `issuer` y `audience`.

## Sesion en la interfaz web

Las rutas web (`routes/web/`) reutilizan el mismo JWT que la API, pero viaja en una cookie en vez del encabezado `Authorization`:

- `POST /login` valida las credenciales con `services/auth.service.js` (el mismo servicio que usa `/api/auth/login`) y, si son correctas, guarda el JWT en la cookie `access_token` (`httpOnly`, `sameSite: 'lax'`, `secure` en produccion, `maxAge` igual a la expiracion del token).
- El middleware `authenticate` acepta el token desde la cookie `access_token` o desde el encabezado `Authorization`; la API sigue funcionando igual con el header.
- Si una ruta web protegida se visita sin sesion o con el token vencido, redirige (`302`) a `/login?next=<ruta solicitada>`; al iniciar sesion se regresa a esa misma ruta.
- `POST /logout` borra la cookie `access_token` y redirige a la tienda (`/`).
- El idioma elegido con el selector ES/EN se guarda en la cookie `lang` y se mantiene al navegar entre paginas.

## Como agregar una pantalla nueva

Para agregar una pantalla SSR nueva:

1. Agregar la ruta en `routes/web/<store|admin|auth>.js` (GET para consultar, POST para modificar).
2. Agregar el controller en `controllers/web/`, que responde con `res.render()` o `res.redirect()` y pasa los errores con `next(err)`.
3. Si falta, agregar el servicio correspondiente en `services/` (Sequelize o Mongoose); el controller web y el de la API deben usar el mismo servicio.
4. Agregar la vista Pug en `views/store/` o `views/admin/`, que extiende el layout correspondiente (`views/layouts/store.pug` o `views/layouts/admin.pug`) y reutiliza los mixins y partials existentes.
5. Agregar las claves de traduccion en `locales/es.json` y `locales/en.json` (misma clave en ambos archivos).
6. Si la pantalla es protegida, agregar `authenticate` y `authorize(recurso, accion, alcance)` en la ruta, con los permisos ya definidos en la base de datos.
7. Agregar la prueba correspondiente en `test/` (y en `test/e2e/web.e2e.test.js` si el flujo requiere sesion real).

## Internacionalizacion

La API responde en espanol (`es`, idioma por defecto) e ingles (`en`). El idioma se detecta en este orden:

```text
?lang=es  ->  Accept-Language  ->  idioma por defecto (es)
```

Las variantes regionales (por ejemplo `es-MX`) se resuelven al idioma base (`es`). Todos los `message` de la API estan traducidos, incluidos los errores `401`, `403` y `404`. Las traducciones viven en `locales/es.json` y `locales/en.json`, organizadas por recurso. Para agregar un idioma se crea un nuevo archivo en `locales/` con las mismas claves y se registra en `config/i18n.js`. Una prueba verifica que ambos archivos tengan exactamente las mismas claves.

## Pruebas

Pruebas unitarias con mocks (no requieren bases de datos):

```bash
npm test
npm run lint
```

Ademas de las pruebas de la API, las pruebas unitarias con mocks cubren la interfaz web SSR: `test/ssr.test.js` (layouts, paginas de error 404/403/500, selector de idioma, title por pantalla y exclusion de datos sensibles) y `test/ssr-auth.test.js` (login, logout y redirecciones por sesion y permisos en las rutas web).

Pruebas E2E contra la API en ejecucion (local o Render):

```powershell
$env:E2E_BASE_URL="https://stride-co-api-jxd0.onrender.com"
npm run test:e2e
```

Las suites E2E cubren health check, autenticacion, RBAC, los cinco recursos relacionales y los dos documentales, relaciones (una orden devuelve su cliente, un producto sus variantes), i18n, validaciones `400` y la exclusion de campos sensibles. Cada suite limpia los datos que crea. El codigo E2E se genero con Google Antigravity y fue revisado por el equipo; la evidencia esta en [docs/e2e-antigravity.md](docs/e2e-antigravity.md).

`test/e2e/web.e2e.test.js` recorre el flujo de sesion de la interfaz web contra la aplicacion en ejecucion, usando `request.agent()` de Supertest para conservar las cookies: `POST /login` -> abrir una pagina protegida -> `POST /logout` -> la misma pagina protegida vuelve a redirigir a `/login`.

## API publica

| Dato | Contenido |
| --- | --- |
| URL publica | `https://stride-co-api-jxd0.onrender.com` |
| Tienda (SSR) | `https://stride-co-api-jxd0.onrender.com/` |
| Panel administrativo (SSR) | `https://stride-co-api-jxd0.onrender.com/admin` |
| Health Check | `GET /health` |
| Render PostgreSQL | Plan gratuito (caduca a los 30 dias). Region: Oregon (US West). Creada el 15/11/2026. |
| MongoDB Atlas | Cluster M0 gratuito. Proveedor: AWS, region Oregon (us-west-2). Network Access abierto para Render (0.0.0.0/0). |
| Secretos | Se entregan a Render como Secret File `local-production.json`; no se publican valores reales. |

Usuarios de demostracion creados por el seed (datos ficticios):

| Email | Contrasena | Rol |
| --- | --- | --- |
| `admin@stride.co` | `Admin123` | admin |
| `sales@stride.co` | `Sales123` | sales |
| `user@stride.co` | `User123` | user |

Que usuario demo usar para probar cada funcionalidad SSR:

| Funcionalidad | Usuario demo |
| --- | --- |
| F1 Inicio y cierre de sesion | Cualquiera de los usuarios demo de la tabla anterior |
| F2 Inicio y catalogo, F3 Detalle de producto | Publicas, sin iniciar sesion |
| F8 Administracion de productos, F10 Inventario | `admin@stride.co` / `Admin123` |
| Ver la pagina de error 403 (sin permiso) | `user@stride.co` / `User123` entrando a `/admin/products` o `/admin/inventory` |

Ejemplo de uso:

```bash
# 1. Login (devuelve un token)
curl -X POST https://stride-co-api-jxd0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stride.co","password":"Admin123"}'

# 2. Consultar un recurso con el token y el idioma deseado
curl https://stride-co-api-jxd0.onrender.com/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Accept-Language: en"
```

## Estructura relevante

```text
config/                 Configuracion por ambiente
controllers/api/        Logica de los recursos de la API (JSON)
controllers/web/        Controllers de la interfaz web, responden res.render/res.redirect
middlewares/            Autenticacion y autorizacion RBAC
models/sql/             Modelos Sequelize
models/mongo/           Modelos Mongoose
routes/api/             Endpoints REST (/api/...)
routes/web/             Rutas de la interfaz web (store.js, auth.js, admin.js)
services/               Capa de servicios compartida entre la API y la web
scripts/seed.js         Datos iniciales
views/layouts/          Layouts de la tienda y del panel (store.pug, admin.pug)
views/mixins/           Mixins reutilizables (productCard, table, formField, statusBadge)
views/partials/         Partials reutilizables (flash, paginacion, errores de formulario)
views/store/            Vistas de la tienda
views/admin/            Vistas del panel administrativo
views/auth/             Vista de inicio de sesion
views/errors/           Paginas de error (403, 404, 500)
public/css/             Estilos extraidos del prototipo (stride.css)
test/                   Pruebas unitarias
test/e2e/               Pruebas E2E
docs/                   Evidencia y documentacion complementaria
Dockerfile              Imagen de produccion
docker-entrypoint.sh    Carga segura del Secret File de Render
```

## Integrantes

- Yahel Santiago Uribe Mendoza - 382849
- Emilio Gallardo Medrano - 385530
- Santiago de la Mora Martinez - 385613