require('dotenv').config();
const prisma = require('./db');
const bcrypt = require('bcrypt');

async function main() {
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { username: adminUsername },
      update: { role: 'admin' },
      create: {
        name: 'Administrador do Sistema',
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log(`Usuário Admin criado/atualizado com sucesso!`);
    console.log(`Login: ${adminUsername}`);
    console.log(`Senha: ${adminPassword}`);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
