# Stride & Co. Backend

## Datos académicos

| Campo | Detalle |
|---|---|
| **Universidad** | Universidad Autónoma de Chihuahua |
| **Facultad** | Facultad de Ingeniería |
| **Carrera** | Ingeniería en Computación |
| **Materia** | Desarrollo de Aplicaciones Web |
| **Docente** | Mtro. Luis Antonio Ramírez Martínez |
| **Actividad** | Proyecto Integrador, Entregable 1. Configuración inicial del backend |
| **Fecha de entrega** | 19/09/2026 |

## Descripción

Backend de Stride & Co. hecho con Node.js y Express. En este primer entregable dejamos lista la
estructura de rutas y controladores de los recursos del sistema, con respuestas mock. Todavía no
hay base de datos ni lógica de negocio; eso llega en los siguientes entregables. Cada petición
pasa por el flujo Request, Route, Controller, Response.

## Objetivo

Dejar armada la estructura inicial del backend: rutas y controladores separados por recurso,
logging de las peticiones HTTP, manejo de rutas que no existen, ESLint para revisar el código y
pruebas con Jest.

## Tecnologías utilizadas

- Node.js
- Express (Express Generator)
- Morgan
- http-errors
- Pug
- Sequelize + MySQL
- Docker
- bcrypt, jsonwebtoken y express-jwt
- dotenv
- config y cross-env
- i18n
- ESLint
- Jest
- Supertest

## Requisitos previos

- Node.js 18 o superior (trae NPM)
- Git
- Docker Desktop (para la base de datos MySQL)

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

| Comando | Descripción |
|---|---|
| `npm start` | Levanta la aplicación en producción (`NODE_ENV=production`), conectada a `stride_co_prod`. |
| `npm run dev` | Levanta la aplicación en desarrollo (`NODE_ENV=development`) con Nodemon, conectada a `stride-co`. |
| `npm test` | Corre las pruebas con Jest. |
| `npm run lint` | Corre ESLint sobre el código. |

## Funcionalidades / uso

Cada recurso maneja estas operaciones REST:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/<recurso>` | Lista los registros. |
| `GET` | `/api/<recurso>/:id` | Obtiene un registro por su id. |
| `POST` | `/api/<recurso>` | Crea un registro. |
| `PUT` | `/api/<recurso>/:id` | Actualiza un registro. |
| `DELETE` | `/api/<recurso>/:id` | Elimina un registro. |

Recursos disponibles:

- `/api/users`
- `/api/roles`
- `/api/permissions`
- `/api/products`
- `/api/variants`
- `/api/inventory`
- `/api/customers`
- `/api/orders`

Por ahora las respuestas son datos mock. Ejemplo de `GET /api/products`:

```json
{
  "message": "Listado de products",
  "data": [
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

- Yahel Santiago Uribe Mendoza - 382849
- Emilio Gallardo Medrano - 385530
- Santiago de la Mora Martinez - 385613

## Base de datos

El proyecto usa MySQL con Sequelize. Los datos de conexión no están escritos en el código: `config/sequelize.js` los toma con la librería `config` según el ambiente.

| Ambiente | Archivo | Base |
|---|---|---|
| Desarrollo (`npm run dev`) | `config/default.json` | `stride-co` |
| Producción (`npm start`) | `config/production.json` | `stride_co_prod` |

`config/production.json` no se sube al repositorio (está en `.gitignore`). Para correr en producción hay que crearlo en la máquina con la misma estructura que `default.json`:

```json
{
  "MySQL": {
    "host": "localhost",
    "port": 3306,
    "database": "stride_co_prod",
    "user": "root",
    "password": "abcd1234"
  }
}
```

Para levantar MySQL con Docker (ya crea la base de desarrollo):

```bash
docker run --name stride-mysql -e MYSQL_ROOT_PASSWORD=abcd1234 -e MYSQL_DATABASE=stride-co -p 3306:3306 -d mysql:8
```

La base de producción se crea aparte, dentro de MySQL:

```bash
docker exec -ti stride-mysql mysql -u root -p
```

```sql
create database stride_co_prod;
```

Al arrancar la app, la tabla `users` se crea sola en la base que corresponda con `sequelize.sync()`.

### Prueba rápida

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"firstName\":\"Ana\",\"lastName\":\"Lopez\",\"email\":\"ana@stride.co\",\"password\":\"Secret123\"}"

curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"ana@stride.co\",\"password\":\"Secret123\"}"

curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

## Autenticación

### Contraseñas

Las contraseñas no se guardan en texto plano. Al registrar un usuario se genera un salt con `bcrypt.genSalt()` y con él se calcula el hash con `bcrypt.hash()`. En la tabla `users` se guardan los dos valores: `salt_key` y `password_hash`. El factor de costo se toma de la variable `BCRYPT_SALT_ROUNDS` (por defecto 10).

Para el login la contraseña se compara con `bcrypt.compare()`. Esta lógica está separada del controller, en `utils/password.js` (`hashPassword` y `verifyPassword`).

Las respuestas de la API nunca incluyen `password_hash` ni `salt_key`, porque el modelo `User` los quita en su `toJSON()`.

### JWT

- `jsonwebtoken`: firma el token en el login (`jwt.sign`).
- `express-jwt`: verifica el token en las rutas protegidas, dentro del middleware `authenticate` (`middlewares/authenticate.js`).

El token solo lleva el id del usuario en `sub`. Se firma con `HS256` y valida `issuer` y `audience`. Expira en **15 minutos** (`JWT_EXPIRES_IN=15m`).

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Crea un usuario con la contraseña hasheada. |
| `POST` | `/api/auth/login` | Valida email y contraseña y devuelve el token. |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado. Requiere token. |

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

| Situación | Código |
|---|---|
| Login correcto | 200 |
| Faltan email o password | 400 |
| Credenciales incorrectas | 401 |
| Usuario inactivo | 401 |
| Sin token | 401 |
| Token inválido o expirado | 401 |
| `/api/auth/me` con token válido | 200 |

### Variables de entorno

Copiar `.env.example` como `.env` y llenar los valores. El `.env` no se sube al repositorio. Los datos de la base de datos no van aquí, sino en `config/default.json` y `config/production.json`.

```
PORT=3000

JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_ISSUER=stride-co
JWT_AUDIENCE=stride-co-api
BCRYPT_SALT_ROUNDS=10
```

## Internacionalización (i18n)

Los mensajes de la API se pueden responder en español o inglés con la librería `i18n`. La configuración está en `config/i18n.js` y los textos en `locales/es.json` y `locales/en.json`.

El idioma se elige de cualquiera de estas formas:

- Con el parámetro `?lang=es` en la URL.
- Con el header `Accept-Language: es`.
- Con una cookie llamada `lang`.

Si no se indica idioma, responde en inglés. En el código los textos se piden con `req.__()`, por ejemplo `req.__('auth.invalidCredentials')` en el login.

Ejemplo, login con contraseña incorrecta en español:

```bash
curl -X POST "http://localhost:3000/api/auth/login?lang=es" -H "Content-Type: application/json" -d "{\"email\":\"ana@stride.co\",\"password\":\"malaclave\"}"
```

Respuesta:

```json
{ "message": "Credenciales inválidas" }
```