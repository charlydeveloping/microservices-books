// src/domain/Book.js
// Entidad de dominio Book (DDD simplificado)

import crypto from 'node:crypto';

export class Book {
  constructor({ id, title, price }) {
    this.id = id;
    this.title = title;
    this.price = price;
  }

  static create({ title, price }) {
    if (!title || typeof title !== 'string') {
      throw new Error('Invalid title');
    }
    const nPrice = Number(price);
    if (!Number.isFinite(nPrice) || nPrice < 0) {
      throw new Error('Invalid price');
    }
    return new Book({ id: crypto.randomUUID(), title: title.trim(), price: nPrice });
  }
}
