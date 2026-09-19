# Stride & Co. Backend

Backend inicial del proyecto integrador Stride & Co. construido con Node.js, Express Generator y respuestas de prueba enfocadas en el sistema de control de inventarios definido en el sprint 0.

## Requisitos

- Node.js 24 o superior
- npm

## Instalacion

```bash
npm install
```

## Scripts

```bash
npm start
npm run dev
npm run lint
npm test
```

- `npm start`: ejecuta el servidor con `node ./bin/www`.
- `npm run dev`: ejecuta el servidor con `nodemon`.
- `npm run lint`: valida el codigo con ESLint.
- `npm test`: ejecuta pruebas automatizadas con Jest y Supertest.

## Estructura principal

```text
stride-co/
|-- bin/
|-- controllers/
|-- routes/
|-- test/
|-- public/
|-- views/
|-- app.js
|-- eslint.config.js
|-- package.json
|-- .gitignore
`-- README.md
```

## Flujo

```text
HTTP Request -> Express -> Route -> Controller -> Response de prueba
```

## Endpoints iniciales

Los recursos principales estan disponibles bajo `/api`:

- `/api/users`
- `/api/roles`
- `/api/permissions`
- `/api/products`
- `/api/variants`
- `/api/inventory`
- `/api/customers`
- `/api/orders`

Cada recurso incluye operaciones REST con datos de prueba:

```text
GET /api/resource
GET /api/resource/:id
POST /api/resource
PUT /api/resource/:id
DELETE /api/resource/:id
```

## Calidad y pruebas

El proyecto incluye logging de solicitudes HTTP con Morgan, manejo controlado de rutas inexistentes en formato JSON para la API, configuracion de ESLint y pruebas automatizadas de endpoints y controladores principales.

## Relacion con Sprint 0

El Sprint 0 definio una aplicacion web para pequenos negocios que necesitan controlar productos, existencias, entradas, salidas y usuarios autorizados. Por eso los datos de prueba usan ejemplos de inventario como productos, variantes, cantidades disponibles, stock minimo, clientes y pedidos.

## Relacion con sprint 0

El sprint 0 fue para definir una aplicacion web para pequeños negocios que necesitan controlar sus productos, existencias, entradas, salidas y usuarios autorizados. Por eso los datos de prueba usan ejemplos de inventario como productos, cantidades disponibles, stock minimo, clientes y pedidos.
