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
- ESLint
- Jest
- Supertest

## Requisitos previos

- Node.js 18 o superior (trae NPM)
- Git

## Instalación

Desde una clonación limpia del repositorio:

```bash
git clone https://github.com/Yahel33/Proyecto-web-sprint0.git
cd Proyecto-web-sprint0
npm install
```

## Ejecución

Para levantar el servidor:

```bash
npm start
```

Queda corriendo en `http://localhost:3000` y la API en `http://localhost:3000/api`. Para
desarrollar con recarga automática al guardar cambios:

```bash
npm run dev
```

## Scripts / comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Levanta la aplicación (`node ./bin/www`). |
| `npm run dev` | Levanta la aplicación con Nodemon (recarga automática). |
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
|-- controllers/
|   |-- resourceControllerFactory.js
|   |-- users.js
|   |-- roles.js
|   |-- permissions.js
|   |-- products.js
|   |-- variants.js
|   |-- inventory.js
|   |-- customers.js
|   `-- orders.js
|-- routes/
|   |-- apiResourceRoutes.js
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
|-- app.js
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
| `POST` | `/api/auth/register` | Crea un usuario con