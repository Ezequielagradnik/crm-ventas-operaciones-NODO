import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres.usqzfdczgmvjlddttuga:eYMsPBwAGakTr3em@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
