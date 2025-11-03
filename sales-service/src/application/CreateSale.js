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
    const sale = Sale.create({ bookId, quantity, unitPrice: book.price });
    await this.saleRepository.save(sale);
    return sale;
  }
}
