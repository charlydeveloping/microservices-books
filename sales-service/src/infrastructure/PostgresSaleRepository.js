import { pool } from './db/pool.js';

export class PostgresSaleRepository {
  async listAll() {
    const { rows } = await pool.query('SELECT id, book_id as "bookId", quantity, total, created_at as "createdAt" FROM sales ORDER BY created_at DESC');
    return rows.map((r) => ({ id: String(r.id), bookId: String(r.bookId), quantity: Number(r.quantity), total: Number(r.total), createdAt: r.createdAt }));
  }

  async save(sale) {
    await pool.query(
      'INSERT INTO sales (id, book_id, quantity, total) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING',
      [sale.id, sale.bookId, sale.quantity, sale.total]
    );
    return sale;
  }
}
