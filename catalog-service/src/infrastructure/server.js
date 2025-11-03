// src/infrastructure/server.js
// Punto de entrada del microservicio de catálogo

import express from 'express';
import { InMemoryBookRepository } from './InMemoryBookRepository.js';
import { buildCatalogRouter } from './routes.js';

const app = express();
app.use(express.json());

const bookRepository = new InMemoryBookRepository();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', buildCatalogRouter({ bookRepository }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Catalog service listening on port ${PORT}`);
});
