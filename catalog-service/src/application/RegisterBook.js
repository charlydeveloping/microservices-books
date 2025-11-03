// src/application/RegisterBook.js

import { Book } from '../domain/Book.js';

export class RegisterBook {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute({ title, price }) {
    const book = Book.create({ title, price });
    return this.bookRepository.save(book);
  }
}
