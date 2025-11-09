// src/domain/Book.js
// Entidad de dominio Book (DDD simplificado)

import crypto from 'node:crypto';

export class Book {
  constructor({ id, title, price, quantity = 0 }) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.quantity = quantity; // stock disponible
  }

  static create({ title, price, quantity = 0 }) {
    if (!title || typeof title !== 'string') {
      throw new Error('Invalid title');
    }
    const nPrice = Number(price);
    if (!Number.isFinite(nPrice) || nPrice < 0) {
      throw new Error('Invalid price');
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0 || !Number.isInteger(qty)) {
      throw new Error('Invalid quantity');
    }
    return new Book({ id: crypto.randomUUID(), title: title.trim(), price: nPrice, quantity: qty });
  }
}
