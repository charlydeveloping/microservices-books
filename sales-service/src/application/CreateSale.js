// src/application/CreateSale.js

import { Sale } from '../domain/Sale.js';

export class CreateSale {
  constructor({ saleRepository, catalogGateway }) {
    this.saleRepository = saleRepository;
    this.catalogGateway = catalogGateway;
  }

  async execute({ bookId, quantity }) {
    if (!bookId) throw new Error('bookId is required');
    const book = await this.catalogGateway.getBookById(bookId);
    if (!book) {
      const err = new Error('Book not found');
      err.code = 'BOOK_NOT_FOUND';
      throw err;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      const err = new Error('quantity must be a positive integer');
      err.code = 'INVALID_QTY';
      throw err;
    }
    if (typeof book.quantity === 'number' && book.quantity < qty) {
      const err = new Error('Insufficient stock');
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }
    const sale = Sale.create({ bookId, quantity: qty, unitPrice: book.price });
    await this.saleRepository.save(sale);
    return sale;
  }
}
