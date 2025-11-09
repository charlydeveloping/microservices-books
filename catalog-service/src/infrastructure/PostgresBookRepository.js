import { pool } from './db/pool.js';
import { Book } from '../domain/Book.js';

export class PostgresBookRepository {
  async listAll() {
    const { rows } = await pool.query('SELECT id, title, price, quantity FROM books ORDER BY title');
    return rows.map((r) => new Book({ id: String(r.id), title: r.title, price: Number(r.price), quantity: Number(r.quantity) }));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT id, title, price, quantity FROM books WHERE id = $1', [id]);
    const r = rows[0];
    return r ? new Book({ id: String(r.id), title: r.title, price: Number(r.price), quantity: Number(r.quantity) }) : null;
  }

  async save(book) {
    await pool.query(
      `INSERT INTO books (id, title, price, quantity) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, quantity = EXCLUDED.quantity`,
      [book.id, book.title, book.price, book.quantity]
    );
    return book;
  }

  async decrementQuantity(bookId, qty) {
    const n = Number(qty);
    if (!Number.isInteger(n) || n <= 0) {
      const err = new Error('Invalid quantity to decrement');
      err.code = 'INVALID_QTY';
      throw err;
    }
    const { rows } = await pool.query(
      `UPDATE books
         SET quantity = quantity - $2
       WHERE id = $1 AND quantity >= $2
       RETURNING id, title, price, quantity`,
      [bookId, n]
    );
    const r = rows[0];
    if (!r) {
      // Check if book exists to differentiate errors
      const exists = await this.findById(bookId);
      if (!exists) {
        const err = new Error('Book not found');
        err.code = 'BOOK_NOT_FOUND';
        throw err;
      }
      const err = new Error('Insufficient stock');
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }
    return new Book({ id: String(r.id), title: r.title, price: Number(r.price), quantity: Number(r.quantity) });
  }
}
