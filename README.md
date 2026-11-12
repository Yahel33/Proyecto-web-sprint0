# Stride \& Co. Backend

## Datos académicos

|Campo|Detalle|
|-|-|
|**Universidad**|Universidad Autónoma de Chihuahua|
|**Facultad**|Facultad de Ingeniería|
|**Carrera**|Ingeniería en Computación|
|**Materia**|Desarrollo de Aplicaciones Web|
|**Docente**|Mtro. Luis Antonio Ramírez Martínez|
|**Actividad**|Proyecto Integrador, Entregable 1. Configuración inicial del backend|
|**Fecha de entrega**|19/09/2026|

## Descripción

Backend de Stride \& Co. hecho con Node.js y Express. En este primer entregable dejamos lista la
estructura de rutas y controladores de los recursos del sistema, con respuestas mock. Todavía no
hay base de datos ni lógica de negocio; eso llega en los siguientes entregables. Cada petición
pasa por el flujo Request, Route, Controller, Response.

## Objetivo

Dejar armada la estructura inicial del backend: rutas y controladores separados por recurso,
logging de las peticiones HTTP, manejo de rutas que no existen, ESLint para revisar el código y
pruebas con Jest.

## Tecnologías utilizadas

* Node.js
* Express (Express Generator)
* Morgan
* http-errors
* Pug
* Sequelize + MySQL
* Docker
* bcrypt, jsonwebtoken y express-jwt
* dotenv
* config y cross-env
* i18n
* ESLint
* Jest
* Supertest

## Requisitos previos

* Node.js 18 o superior (trae NPM)
* Git
* Docker Desktop (para la base de datos MySQL)

## Instalación

Desde una clonación limpia del repositorio:

```bash
git clone https://github.com/Yahel33/Proyecto-web-sprint0.git
cd Proyecto-web-sprint0
npm install
```

## Ejecución

Primero hay que tener la base de datos corriendo (ver la sección **Base de datos**) y el archivo `.env` creado (ver **Variables de entorno**).

Para trabajar en desarrollo, con recarga automática al guardar cambios:

```bash
npm run dev
```

Para levantarlo en modo producción:

```bash
npm start
```

Queda corriendo en `http://localhost:3000` y la API en `http://localhost:3000/api`. Al arrancar se muestra a qué base se conectó y en qué ambiente, por ejemplo `App conectada a stride-co (development)`.

## Scripts / comandos disponibles

|Comando|Descripción|
|-|-|
|`npm start`|Levanta la aplicación en producción (`NODE\_ENV=production`), conectada a `stride\_co\_prod`.|
|`npm run dev`|Levanta la aplicación en desarrollo (`NODE\_ENV=development`) con Nodemon, conectada a `stride-co`.|
|`npm test`|Corre las pruebas con Jest.|
|`npm run lint`|Corre ESLint sobre el código.|

## Funcionalidades / uso

Cada recurso maneja estas operaciones REST:

|Método|Ruta|Descripción|
|-|-|-|
|`GET`|`/api/<recurso>`|Lista los registros.|
|`GET`|`/api/<recurso>/:id`|Obtiene un registro por su id.|
|`POST`|`/api/<recurso>`|Crea un registro.|
|`PUT`|`/api/<recurso>/:id`|Actualiza un registro.|
|`DELETE`|`/api/<recurso>/:id`|Elimina un registro.|

Recursos disponibles:

* `/api/users`
* `/api/roles`
* `/api/permissions`
* `/api/products`
* `/api/variants`
* `/api/inventory`
* `/api/customers`
* `/api/orders`

Por ahora las respuestas son datos mock. Ejemplo de `GET /api/products`:

```json
{
  "message": "Listado de products",
  "data": \[
    { "id": 1, "nombre": "Camiseta blanca", "categoria": "ropa", "precio": 249.9 }
  ]
}
```

Las rutas que no existen bajo `/api` regresan un 404 controlado en JSON:

```json
{
  "message": "Ruta no encontrada",
  "error": "Not Found"
}
```

### Logging

Las peticiones HTTP se registran con Morgan (formato `dev`): método, ruta, código de estado y
tiempo de respuesta.

## Pruebas

Probamos los endpoints con Jest y Supertest. Las pruebas revisan el código de estado, la forma de
la respuesta, los parámetros de ruta (`:id`), los recursos que no existen y las peticiones con
cuerpo inválido. Para correrlas:

```bash
npm test
```

## Análisis de calidad de código

Usamos ESLint para revisar el estilo y detectar errores en el código. Se corre con:

```bash
npm run lint
```

## Estructura general del proyecto

```text
Proyecto-web-sprint0/
|-- bin/
|   `-- www
|-- config/
|   |-- default.json
|   |-- i18n.js
|   `-- sequelize.js
|-- controllers/
|   |-- auth.js
|   |-- resourceControllerFactory.js
|   |-- users.js
|   |-- roles.js
|   |-- permissions.js
|   |-- products.js
|   |-- variants.js
|   |-- inventory.js
|   |-- customers.js
|   `-- orders.js
|-- locales/
|   |-- en.json
|   `-- es.json
|-- middlewares/
|   `-- authenticate.js
|-- models/
|   |-- documents/
|   `-- relationals/
|       |-- index.js
|       |-- Permission.js
|       |-- Role.js
|       `-- User.js
|-- routes/
|   |-- apiResourceRoutes.js
|   |-- auth.js
|   |-- index.js
|   |-- users.js
|   |-- roles.js
|   |-- permissions.js
|   |-- products.js
|   |-- variants.js
|   |-- inventory.js
|   |-- customers.js
|   `-- orders.js
|-- public/
|   `-- stylesheets/
|       `-- style.css
|-- views/
|   |-- error.pug
|   |-- index.pug
|   `-- layout.pug
|-- test/
|   `-- api.test.js
|-- utils/
|   `-- password.js
|-- .env.example
|-- app.js
|-- Dockerfile
|-- eslint.config.js
|-- package.json
|-- package-lock.json
|-- .gitignore
`-- README.md
```

## Integrantes

* Yahel Santiago Uribe Mendoza - 382849
* Emilio Gallardo Medrano - 385530
* Santiago de la Mora Martinez - 385613

## Base de datos

El proyecto usa MySQL con Sequelize. Los datos de conexión no están escritos en el código: `config/sequelize.js` los toma con la librería `config` según el ambiente.

|Ambiente|Archivo|Base|
|-|-|-|
|Desarrollo (`npm run dev`)|`config/default.json`|`stride-co`|
|Producción (`npm start`)|`config/production.json`|`stride\_co\_prod`|

`config/production.json` no se sube al repositorio (está en `.gitignore`). Para correr en producción hay que crearlo en la máquina con la misma estructura que `default.json`:

```json
{
  "MySQL": {
    "host": "localhost",
    "port": 3306,
    "database": "stride\_co\_prod",
    "user": "root",
    "password": "abcd1234"
  }
}
```

Para levantar MySQL con Docker (ya crea la base de desarrollo):

```bash
docker run --name stride-mysql -e MYSQL\_ROOT\_PASSWORD=abcd1234 -e MYSQL\_DATABASE=stride-co -p 3306:3306 -d mysql:8
```

La base de producción se crea aparte, dentro de MySQL:

```bash
docker exec -ti stride-mysql mysql -u root -p
```

```sql
create database stride\_co\_prod;
```

Al arrancar la app, la tabla `users` se crea sola en la base que corresponda con `sequelize.sync()`.

### Prueba rápida

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\\"firstName\\":\\"Ana\\",\\"lastName\\":\\"Lopez\\",\\"email\\":\\"ana@stride.co\\",\\"password\\":\\"Secret123\\"}"

curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"ana@stride.co\\",\\"password\\":\\"Secret123\\"}"

curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

## Autenticación

### Contraseñas

Las contraseñas no se guardan en texto plano. Al registrar un usuario se genera un salt con `bcrypt.genSalt()` y con él se calcula el hash con `bcrypt.hash()`. En la tabla `users` se guardan los dos valores: `salt\_key` y `password\_hash`. El factor de costo se toma de la variable `BCRYPT\_SALT\_ROUNDS` (por defecto 10).

Para el login la contraseña se compara con `bcrypt.compare()`. Esta lógica está separada del controller, en `utils/password.js` (`hashPassword` y `verifyPassword`).

Las respuestas de la API nunca incluyen `password\_hash` ni `salt\_key`, porque el modelo `User` los quita en su `toJSON()`.

### JWT

* `jsonwebtoken`: firma el token en el login (`jwt.sign`).
* `express-jwt`: verifica el token en las rutas protegidas, dentro del middleware `authenticate` (`middlewares/authenticate.js`).

El token solo lleva el id del usuario en `sub`. Se firma con `HS256` y valida `issuer` y `audience`. Expira en **15 minutos** (`JWT\_EXPIRES\_IN=15m`).

### Endpoints

|Método|Ruta|Descripción|
|-|-|-|
|`POST`|`/api/auth/register`|Crea un usuario con la contraseña hasheada.|
|`POST`|`/api/auth/login`|Valida email y contraseña y devuelve el token.|
|`GET`|`/api/auth/me`|Devuelve el usuario autenticado. Requiere token.|

Ejemplo de login:

```json
{
  "email": "ana@stride.co",
  "password": "Secret123"
}
```

Para las rutas protegidas se manda el token en el header:

```
Authorization: Bearer <token>
```

### Códigos de respuesta

|Situación|Código|
|-|-|
|Login correcto|200|
|Faltan email o password|400|
|Credenciales incorrectas|401|
|Usuario inactivo|401|
|Sin token|401|
|Token inválido o expirado|401|
|`/api/auth/me` con token válido|200|

### Variables de entorno

Copiar `.env.example` como `.env` y llenar los valores. El `.env` no se sube al repositorio. Los datos de la base de datos no van aquí, sino en `config/default.json` y `config/production.json`.

```
PORT=3000

JWT\_SECRET=
JWT\_EXPIRES\_IN=15m
JWT\_ISSUER=stride-co
JWT\_AUDIENCE=stride-co-api
BCRYPT\_SALT\_ROUNDS=10
```

## Internacionalización (i18n)

Los mensajes de la API se pueden responder en español o inglés con la librería `i18n`. La configuración está en `config/i18n.js` y los textos en `locales/es.json` y `locales/en.json`.

El idioma se elige de cualquiera de estas formas:

* Con el parámetro `?lang=es` en la URL.
* Con el header `Accept-Language: es`.
* Con una cookie llamada `lang`.

Si no se indica idioma, responde en inglés. En el código los textos se piden con `req.\_\_()`, por ejemplo `req.\_\_('auth.invalidCredentials')` en el login.

Ejemplo, login con contraseña incorrecta en español:

```bash
curl -X POST "http://localhost:3000/api/auth/login?lang=es" -H "Content-Type: application/json" -d "{\\"email\\":\\"ana@stride.co\\",\\"password\\":\\"malaclave\\"}"
```

Respuesta:

```json
{ "message": "Credenciales inválidas" }
```

## Control de acceso basado en roles

La API utiliza RBAC para autorizar las operaciones de acuerdo con el rol del usuario autenticado. Los roles y permisos se guardan en las tablas `roles`, `permissions` y `role\_permissions`; no se asignan permisos directamente en los controladores.

### Roles y permisos

Los roles definidos para el proyecto son `admin`, `sales` y `user`. La propiedad `Permission.key` sigue la convención `recurso:acción:alcance`, donde el alcance puede ser `own` para recursos del usuario o `any` para cualquier recurso.

|Rol|Permisos|
|-|-|
|`admin`|`products:create:any`, `products:read:any`, `products:update:any`, `products:delete:any`, `orders:create:any`, `orders:read:any`, `orders:update:any`|
|`sales`|`products:read:any`, `orders:create:any`, `orders:read:own`, `orders:update:own`|
|`user`|`products:read:any`, `orders:create:any`, `orders:read:own`, `orders:update:own`|

La asignación inicial se encuentra en `scripts/seed-rbac.js`.

### Matriz RBAC

|Recurso / operación|ADMIN|SALES|USER|
|-|:-:|:-:|:-:|
|Products — Read Any|✓|✓|✓|
|Products — Create Any|✓|—|—|
|Products — Update Any|✓|—|—|
|Products — Delete Any|✓|—|—|
|Orders — Create Any|✓|✓|✓|
|Orders — Read Own|✓|✓|✓|
|Orders — Read Any|✓|—|—|
|Orders — Update Own|✓|✓|✓|

### Endpoints protegidos

|Método|Endpoint|Permiso|
|-|-|-|
|`GET`|`/api/products` y `/api/products/:id`|`products:read:any`|
|`POST`|`/api/products`|`products:create:any`|
|`PUT`|`/api/products/:id`|`products:update:any`|
|`DELETE`|`/api/products/:id`|`products:delete:any`|
|`GET`|`/api/orders`|`orders:read:any`|
|`GET`|`/api/orders/:id`|`orders:read:own`|
|`POST`|`/api/orders`|`orders:create:any`|
|`PUT`|`/api/orders/:id`|`orders:update:own`|

Las rutas protegidas ejecutan primero `authenticate` y después `authorize`, antes de llegar al controlador. Si el usuario está autenticado pero no tiene el permiso, la API responde `403 Forbidden`. La falta o invalidez del token se mantiene como `401 Unauthorized`.

### Alcances own y any

`orders:read:own` permite consultar una orden solamente cuando el `userId` guardado en esa orden coincide con el id del usuario autenticado. Por ejemplo, un usuario puede consultar `GET /api/orders/2` si esa orden tiene su mismo `userId`; si pertenece a otra persona, la respuesta es `403`.

`orders:read:any` permite consultar la lista completa de órdenes en `GET /api/orders`. Este permiso está asignado al rol `admin`; los roles `sales` y `user` no lo tienen.

### Carga de permisos

El middleware `middlewares/authorize.js` consulta el rol del usuario mediante `Role.findByPk` e incluye los permisos relacionados mediante `Role\_Permission` y `Permission`. Después separa cada `Permission.key` en recurso, acción y alcance, construye las reglas de `accesscontrol` y verifica la operación solicitada. De esta manera, la base de datos es la fuente de verdad para los permisos.

### Pruebas RBAC

Las pruebas automatizadas están en `test/rbac.test.js` y utilizan Jest y Supertest para comprobar acceso permitido, acceso denegado, consulta de una orden propia, bloqueo de una orden ajena y bloqueo cuando falta el permiso `any`. 

Para ejecutar las pruebas:

```bash
npm test
```

