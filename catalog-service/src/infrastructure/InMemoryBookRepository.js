// src/infrastructure/InMemoryBookRepository.js
// Repositorio en memoria para libros

import { Book } from '../domain/Book.js';

export class InMemoryBookRepository {
  constructor() {
    this.store = new Map();

    // Semilla opcional de datos para facilitar pruebas manuales
    if (process.env.SEED_BOOKS === 'true') {
      this.save(new Book({ id: '1', title: 'Clean Architecture', price: 39.9 }));
      this.save(new Book({ id: '2', title: 'Domain-Driven Design', price: 49.5 }));
      this.save(new Book({ id: '3', title: 'Refactoring', price: 44.0 }));
    }
  }

  async listAll() {
    return Array.from(this.store.values());
  }

  async findById(id) {
    return this.store.get(String(id)) || null;
  }

  async save(book) {
    this.store.set(String(book.id), book);
    return book;
  }
}
