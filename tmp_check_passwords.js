require('dotenv').config();
const prisma = require('./db');
const bcrypt = require('bcrypt');

async function checkPasswords() {
  try {
    const users = await prisma.user.findMany();
    const results = users.map(u => ({
      id: u.id,
      username: u.username,
      isHashed: u.password.startsWith('$2a$') || u.password.startsWith('$2b$')
    }));
    console.log('--- USER PASSWORD STATUS ---');
    console.table(results);

    const unhashedUsers = results.filter(r => !r.isHashed);
    if (unhashedUsers.length > 0) {
      console.log(`Encontrados ${unhashedUsers.length} usuários com senha aberta. Migrando...`);
      for (const unh of unhashedUsers) {
        const fullUser = users.find(u => u.id === unh.id);
        const hashedPassword = await bcrypt.hash(fullUser.password, 10);
        await prisma.user.update({
          where: { id: fullUser.id },
          data: { password: hashedPassword }
        });
        console.log(`[OK] Senha do usuário '${fullUser.username}' criptografada.`);
      }
    } else {
      console.log('Todos os usuários já possuem senhas criptografadas.');
    }
  } catch (err) {
    console.error('Erro ao verificar/migrar senhas:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkPasswords();
