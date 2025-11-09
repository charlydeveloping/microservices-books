import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'sales-db',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || 'sales',
        password: process.env.PGPASSWORD || 'sales',
        database: process.env.PGDATABASE || 'salesdb',
      }
);

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY,
      book_id UUID NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
