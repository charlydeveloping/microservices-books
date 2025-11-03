# microservices-books

Ejemplo completo de arquitectura de microservicios con Node.js + Express y un enfoque DDD simplificado. Incluye:

- catalog-service (Catálogo de Libros)
- sales-service (Ventas)
- NGINX como balanceador de carga entre dos réplicas del catálogo
- `docker-compose.yml` para orquestación

## Estructura

- `catalog-service/`
  - `src/domain/` Entidades (Book)
  - `src/application/` Casos de uso (listar, obtener por id, registrar)
  - `src/infrastructure/` Repositorio en memoria, rutas y servidor Express
- `sales-service/`
  - `src/domain/` Entidades (Sale)
  - `src/application/` Casos de uso (listar, crear)
  - `src/infrastructure/` Repositorio en memoria, cliente HTTP (axios + retry + circuit breaker), rutas y servidor Express
- `load-balancer/nginx.conf` Config de NGINX para balancear `catalog1` y `catalog2`
- `docker-compose.yml`

## Requisitos

- Docker y Docker Compose

## Levantar todo

```bash
docker compose up --build
```

Servicios expuestos:
- Catálogo (a través del balanceador): http://localhost:3000
- Ventas: http://localhost:4000

## Endpoints principales

Catálogo (vía balanceador):
- GET `http://localhost:3000/books`
- GET `http://localhost:3000/books/:id`
- POST `http://localhost:3000/books`  Body JSON: `{ "title": "Nombre", "price": 10.5 }`

Ventas:
- GET `http://localhost:4000/sales`
- POST `http://localhost:4000/sales`  Body JSON: `{ "bookId": "1", "quantity": 2 }`

Al crear una venta, el servicio de ventas consulta el catálogo con HTTP (GET /books/:id), aplicando patrones Retry (axios-retry) y Circuit Breaker (opossum). Si el catálogo responde 404, la venta devuelve 404. Si el circuito está abierto o el catálogo está caído, devuelve 503.

## Notas de implementación

- ES Modules habilitado con `"type": "module"` en cada `package.json`.
- Repositorios en memoria para simplificar la demo.
- Semilla de libros opcional activando `SEED_BOOKS=true` (ya configurado en docker-compose).
- El servicio de ventas usa `CATALOG_BASE_URL` (por defecto `http://load-balancer:3000`).

## Pruebas rápidas (opcionales)

Después de `docker compose up --build`:

```bash
# Listar libros (vienen algunos sembrados)
curl http://localhost:3000/books

# Registrar un libro
curl -X POST http://localhost:3000/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Node in Action","price":25.4}'

# Crear una venta (usar un bookId existente)
curl -X POST http://localhost:4000/sales \
  -H 'Content-Type: application/json' \
  -d '{"bookId":"1","quantity":3}'

# Listar ventas
curl http://localhost:4000/sales
```

## Licencia

Uso educativo/demostrativo.