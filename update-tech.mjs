import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { role: 'TECHNICIAN' },
    data: { name: 'ช่างยอดเยี่ยม' },
  });
  console.log('Updated technicians');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
