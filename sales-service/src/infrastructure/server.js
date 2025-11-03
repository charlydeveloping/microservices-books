// src/infrastructure/server.js
// Punto de entrada del microservicio de ventas

import express from 'express';
import { InMemorySaleRepository } from './InMemorySaleRepository.js';
import { createCatalogGateway } from './http/catalogClient.js';
import { buildSalesRouter } from './routes.js';

const app = express();
app.use(express.json());

const saleRepository = new InMemorySaleRepository();
const catalogGateway = createCatalogGateway();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', buildSalesRouter({ saleRepository, catalogGateway }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Sales service listening on port ${PORT}`);
  console.log(`Using catalog at ${process.env.CATALOG_BASE_URL || 'http://load-balancer:3000'}`);
});
