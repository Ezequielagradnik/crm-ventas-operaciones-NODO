import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres.usqzfdczgmvjlddttuga:eYMsPBwAGakTr3em@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
