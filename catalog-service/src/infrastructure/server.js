// src/infrastructure/server.js
// Punto de entrada del microservicio de catálogo

import express from 'express';
import { InMemoryBookRepository } from './InMemoryBookRepository.js';
import { buildCatalogRouter } from './routes.js';
import { startConsumer } from "./kafka/consumer.js";

// Start Kafka consumer but don't block express startup
startConsumer().catch((e) => {
  console.error("Initial Kafka consumer start failed", e);
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${process.env.HOSTNAME}] ${req.method} ${req.url}`);
  next();
});

const bookRepository = new InMemoryBookRepository();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', buildCatalogRouter({ bookRepository }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Catalog service listening on port ${PORT}`);
});
