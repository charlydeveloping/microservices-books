import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'catalog-db',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || 'catalog',
        password: process.env.PGPASSWORD || 'catalog',
        database: process.env.PGDATABASE || 'catalogdb',
      }
);

export async function ensureSchema() {
  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
    );
  `);

  if (process.env.SEED_BOOKS === 'true') {
    // Upsert sample data
    await pool.query(`
      INSERT INTO books (id, title, price, quantity) VALUES
        ('00000000-0000-0000-0000-000000000001','Clean Architecture',39.90,10),
        ('00000000-0000-0000-0000-000000000002','Domain-Driven Design',49.50,8),
        ('00000000-0000-0000-0000-000000000003','Refactoring',44.00,12)
      ON CONFLICT (id) DO NOTHING;
    `);
  }
}
