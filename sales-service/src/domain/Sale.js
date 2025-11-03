// src/domain/Sale.js
// Entidad de dominio Sale (DDD simplificado)

import crypto from 'node:crypto';

export class Sale {
  constructor({ id, bookId, quantity, total }) {
    this.id = id;
    this.bookId = bookId;
    this.quantity = quantity;
    this.total = total;
  }

  static create({ bookId, quantity, unitPrice }) {
    if (!bookId) throw new Error('bookId is required');
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) throw new Error('quantity must be a positive integer');
    const price = Number(unitPrice);
    if (!Number.isFinite(price) || price < 0) throw new Error('unitPrice invalid');

    const total = Number((qty * price).toFixed(2));
    return new Sale({ id: crypto.randomUUID(), bookId: String(bookId), quantity: qty, total });
  }
}
