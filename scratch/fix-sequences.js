import prisma from '../src/lib/db.js';

async function fixSequences() {
  console.log('Iniciando correção de sequências...');
  try {
    const tables = ['User', 'Client', 'Category', 'Subcategory', 'Ticket', 'TicketLog'];
    
    for (const table of tables) {
      console.log(`Corrigindo sequência para ${table}...`);
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${table}";
      `);
    }
    
    console.log('Todas as sequências foram corrigidas com sucesso!');
  } catch (error) {
    console.error('Erro ao corrigir sequências:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequences();
