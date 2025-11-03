// src/application/GetBookById.js

export class GetBookById {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute({ id }) {
    if (!id) throw new Error('id is required');
    const book = await this.bookRepository.findById(id);
    return book; // puede ser null
  }
}
