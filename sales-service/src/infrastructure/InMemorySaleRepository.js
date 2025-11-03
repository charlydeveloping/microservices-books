// src/infrastructure/InMemorySaleRepository.js
// Repositorio en memoria para ventas

export class InMemorySaleRepository {
  constructor() {
    this.store = new Map();
  }

  async listAll() {
    return Array.from(this.store.values());
  }

  async save(sale) {
    this.store.set(String(sale.id), sale);
    return sale;
  }
}
