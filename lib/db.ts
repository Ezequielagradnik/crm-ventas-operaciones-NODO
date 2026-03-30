import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pool: Pool | undefined };

const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

export const db = pool;
export default pool;
