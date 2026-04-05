require('dotenv').config();
const prisma = require('./db');

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true } });
  console.log('Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
