// src/infrastructure/InMemoryBookRepository.js
// Repositorio en memoria para libros

import { Book } from '../domain/Book.js';

export class InMemoryBookRepository {
  constructor() {
    this.store = new Map();

    // Semilla opcional de datos para facilitar pruebas manuales
    if (process.env.SEED_BOOKS === 'true') {
      this.save(new Book({ id: '1', title: 'Clean Architecture', price: 39.9, quantity: 10 }));
      this.save(new Book({ id: '2', title: 'Domain-Driven Design', price: 49.5, quantity: 8 }));
      this.save(new Book({ id: '3', title: 'Refactoring', price: 44.0, quantity: 12 }));
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

  async decrementQuantity(bookId, qty) {
    const id = String(bookId);
    const book = this.store.get(id);
    if (!book) {
      const err = new Error('Book not found');
      err.code = 'BOOK_NOT_FOUND';
      throw err;
    }
    const n = Number(qty);
    if (!Number.isInteger(n) || n <= 0) {
      const err = new Error('Invalid quantity to decrement');
      err.code = 'INVALID_QTY';
      throw err;
    }
    if (book.quantity < n) {
      const err = new Error('Insufficient stock');
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }
    book.quantity -= n;
    this.store.set(id, book);
    return book;
  }
}
