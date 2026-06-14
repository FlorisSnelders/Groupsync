import { Pool } from 'pg';
import { config } from './env';

export const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err);
});

export async function testConnection(): Promise<void> {
  const client = await db.connect();
  await client.query('SELECT 1');
  client.release();
  console.log('✅ Database connected');
}
