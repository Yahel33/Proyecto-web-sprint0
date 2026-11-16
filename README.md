# Stride & Co. Backend

Backend REST para Stride & Co., desarrollado con Node.js y Express. El proyecto integra persistencia relacional y documental, autenticacion JWT, autorizacion basada en roles, internacionalizacion y pruebas automatizadas.

## Entregable

Proyecto integrador - Entregable 2.

| Campo | Detalle |
| --- | --- |
| Universidad | Universidad Autonoma de Chihuahua |
| Facultad | Facultad de Ingenieria |
| Carrera | Ingenieria en Computacion |
| Materia | Desarrollo de Aplicaciones Web |
| Docente | Mtro. Luis Antonio Ramirez Martinez |

## Despliegue

La API esta desplegada en Render:

```text
https://stride-co-api-jxd0.onrender.com
```

Health check: `GET /health`

```json
{ "status": "UP" }
```

## Tecnologias

- Node.js, Express y Morgan.
- PostgreSQL con Sequelize.
- MongoDB Atlas con Mongoose.
- JSON Web Tokens, bcrypt y express-jwt.
- AccessControl para RBAC.
- i18n para mensajes en espanol e ingles.
- Jest y Supertest para pruebas unitarias y E2E.
- Docker y Render para el despliegue.

## Arquitectura de datos

| Persistencia | Recursos |
| --- | --- |
| PostgreSQL / Sequelize | users, roles, permissions, products, product variants e inventory |
| MongoDB Atlas / Mongoose | customers y orders |

La propiedad de una orden se valida mediante:

```text
Order.customerId -> Customer.userId
```

## Instalacion local

Requisitos:

- Node.js 20 o superior.
- npm.
- PostgreSQL y MongoDB disponibles localmente, o credenciales de entornos de desarrollo autorizados.

```bash
git clone https://github.com/Yahel33/Proyecto-web-sprint0.git
cd Proyecto-web-sprint0
npm install
```

Copiar la plantilla local y completar solo las credenciales de desarrollo:

```powershell
Copy-Item config/local-development.example.json config/local-development.json
```

`config/local-development.json` y `config/local-production.json` estan ignorados por Git. Nunca deben agregarse al repositorio porque contienen secretos.

Para iniciar en desarrollo:

```bash
npm run dev
```

Para cargar los datos iniciales en desarrollo:

```bash
npm run seed
```

## Configuracion de produccion

Render proporciona `NODE_ENV=production` y el puerto mediante `PORT`. Las credenciales de PostgreSQL, MongoDB y JWT se guardan como un Secret File llamado `local-production.json`.

Al iniciar el contenedor, `docker-entrypoint.sh` carga el archivo desde `/etc/secrets/local-production.json` hacia la configuracion local de la aplicacion. El secreto no se copia en la imagen Docker ni se sube a GitHub.

El servicio usa PostgreSQL de Render y MongoDB Atlas. Atlas debe permitir la conectividad del servicio de Render mediante su lista de acceso de red.

## Scripts

| Comando | Descripcion |
| --- | --- |
| `npm start` | Inicia la aplicacion en produccion. |
| `npm run dev` | Inicia la aplicacion en desarrollo con Nodemon. |
| `npm run seed` | Recrea los datos iniciales de desarrollo. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run test:e2e` | Ejecuta las pruebas E2E configuradas en `jest.e2e.json`. |
| `npm run lint` | Ejecuta ESLint. |

## Pruebas

Pruebas unitarias y de integracion local:

```bash
npm test
npm run lint
```

Pruebas E2E contra Render:

```powershell
$env:NODE_ENV="test"
$env:E2E_BASE_URL="https://stride-co-api-jxd0.onrender.com"
npm run test:e2e
```

Las suites E2E cubren health check, autenticacion, RBAC, productos, clientes, ordenes, variantes, inventario, roles, permisos y la exclusion de campos sensibles de usuarios. Los datos creados durante las pruebas se eliminan al finalizar.

La evidencia del uso y revision de Google Antigravity se documenta en [docs/e2e-antigravity.md](docs/e2e-antigravity.md).

## API

Recursos disponibles:

- `/api/auth`
- `/api/users`
- `/api/roles`
- `/api/permissions`
- `/api/products`
- `/api/variants`
- `/api/inventory`
- `/api/customers`
- `/api/orders`

Las rutas de recursos siguen el patron REST: `GET`, `POST`, `PUT` y `DELETE`. Las rutas protegidas requieren:

```text
Authorization: Bearer <token>
```

## Autenticacion y autorizacion

`POST /api/auth/login` devuelve un JWT para las credenciales validas. Las contrasenas se almacenan con bcrypt; las respuestas no exponen `password_hash` ni `salt_key`.

Los roles iniciales son `admin`, `sales` y `user`. Los permisos usan el formato `recurso:accion:alcance`, por ejemplo `products:delete:any` u `orders:read:own`.

Las rutas ejecutan autenticacion antes de autorizacion. Un token ausente o invalido devuelve `401`; un usuario autenticado sin permiso recibe `403`.

## Internacionalizacion

Los mensajes pueden solicitarse con `?lang=es` o `?lang=en`. Las traducciones estan en `locales/es.json` y `locales/en.json`.

## Estructura relevante

```text
config/                 Configuracion por ambiente
controllers/            Logica de recursos
middlewares/            Autenticacion y autorizacion RBAC
models/sql/             Modelos Sequelize
models/mongo/           Modelos Mongoose
routes/                 Endpoints REST
scripts/seed.js         Datos iniciales
test/                   Pruebas unitarias y E2E
docs/                   Evidencia y documentacion complementaria
Dockerfile              Imagen de produccion
docker-entrypoint.sh    Carga segura del Secret File de Render
```

## Integrantes

- Yahel Santiago Uribe Mendoza - 382849
- Emilio Gallardo Medrano - 385530
- Santiago de la Mora Martinez - 385613
