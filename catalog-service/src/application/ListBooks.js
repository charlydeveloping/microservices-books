// src/application/ListBooks.js

export class ListBooks {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute() {
    return this.bookRepository.listAll();
  }
}
