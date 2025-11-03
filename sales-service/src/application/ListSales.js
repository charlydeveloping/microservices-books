// src/application/ListSales.js

export class ListSales {
  constructor({ saleRepository }) {
    this.saleRepository = saleRepository;
  }

  async execute() {
    return this.saleRepository.listAll();
  }
}
