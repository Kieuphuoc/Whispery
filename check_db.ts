import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const prisma = new PrismaClient();

async function main() {
  const reportCount = await prisma.report.count();
  console.log('--- REPORTS ---');
  console.log('Count:', reportCount);
  if (reportCount > 0) {
    const reports = await prisma.report.findMany();
    console.dir(reports, { depth: null });
  }

  const auditLogCount = await prisma.auditLog.count();
  console.log('\n--- AUDIT LOGS ---');
  console.log('Count:', auditLogCount);
  if (auditLogCount > 0) {
    const auditLogs = await prisma.auditLog.findMany();
    console.dir(auditLogs, { depth: null });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
