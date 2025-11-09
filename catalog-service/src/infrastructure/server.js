// src/infrastructure/server.js
// Punto de entrada del microservicio de catálogo

import express from 'express';
import { InMemoryBookRepository } from './InMemoryBookRepository.js';
import { PostgresBookRepository } from './PostgresBookRepository.js';
import { ensureSchema } from './db/pool.js';
import { buildCatalogRouter } from './routes.js';
import { startConsumer } from "./kafka/consumer.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${process.env.HOSTNAME}] ${req.method} ${req.url}`);
  next();
});

// Choose repository: Postgres by default if DATABASE_URL/PG* vars provided
let bookRepository;
if (process.env.DATABASE_URL || process.env.PGHOST) {
  await ensureSchema();
  bookRepository = new PostgresBookRepository();
  console.log('Using PostgresBookRepository');
} else {
  bookRepository = new InMemoryBookRepository();
  console.log('Using InMemoryBookRepository');
}
// Expose repository globally for Kafka consumer side-effect (simple approach; alternatively use DI/container)
global.bookRepository = bookRepository;

// Start Kafka consumer after repository is ready
startConsumer().catch((e) => {
  console.error("Initial Kafka consumer start failed", e);
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', buildCatalogRouter({ bookRepository }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Catalog service listening on port ${PORT}`);
});
