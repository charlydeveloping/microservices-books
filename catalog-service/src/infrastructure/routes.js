// src/infrastructure/routes.js
// Rutas HTTP para el microservicio de catálogo

import { Router } from 'express';
import { ListBooks } from '../application/ListBooks.js';
import { GetBookById } from '../application/GetBookById.js';
import { RegisterBook } from '../application/RegisterBook.js';

export function buildCatalogRouter({ bookRepository }) {
  const router = Router();

  const listBooks = new ListBooks({ bookRepository });
  const getBookById = new GetBookById({ bookRepository });
  const registerBook = new RegisterBook({ bookRepository });

  // GET /books
  router.get('/books', async (req, res) => {
    const books = await listBooks.execute();
    res.json(books);
  });

  // GET /books/:id
  router.get('/books/:id', async (req, res) => {
    const book = await getBookById.execute({ id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  });

  // POST /books
  router.post('/books', async (req, res) => {
    try {
      const { title, price, quantity = 0 } = req.body || {};
      const created = await registerBook.execute({ title, price, quantity });
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  return router;
}
