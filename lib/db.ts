import { Pool } from "pg";

// Use a single Pool with pgbouncer — safe for serverless
const globalForPool = globalThis as unknown as { pool: Pool | undefined };

export const db =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = db;

export default db;
