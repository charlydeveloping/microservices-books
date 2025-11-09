// src/infrastructure/server.js
// Punto de entrada del microservicio de ventas

import express from 'express';
import { InMemorySaleRepository } from './InMemorySaleRepository.js';
import { PostgresSaleRepository } from './PostgresSaleRepository.js';
import { ensureSchema } from './db/pool.js';
import { createCatalogGateway } from './http/catalogClient.js';
import { buildSalesRouter } from './routes.js';
import { connectProducer } from './kafka/producer.js';

// Start Kafka producer but don't block express startup
connectProducer().catch((e) => {
  console.error("Initial Kafka producer start failed", e);
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let saleRepository;
if (process.env.DATABASE_URL || process.env.PGHOST) {
  await ensureSchema();
  saleRepository = new PostgresSaleRepository();
  console.log('Using PostgresSaleRepository');
} else {
  saleRepository = new InMemorySaleRepository();
  console.log('Using InMemorySaleRepository');
}
const catalogGateway = createCatalogGateway();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', buildSalesRouter({ saleRepository, catalogGateway }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Sales service listening on port ${PORT}`);
  console.log(`Using catalog at ${process.env.CATALOG_BASE_URL || 'http://load-balancer:3000'}`);
});
