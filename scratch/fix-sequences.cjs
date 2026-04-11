const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixSequences() {
  console.log('Iniciando correção de sequências...');
  try {
    const tables = ['User', 'Client', 'Category', 'Subcategory', 'Ticket', 'TicketLog'];
    
    for (const table of tables) {
      console.log(`Corrigindo sequência para ${table}...`);
      try {
        await prisma.$executeRawUnsafe(`
          SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${table}";
        `);
      } catch (e) {
        console.warn(`Aviso: Não foi possível corrigir sequência para ${table}: ${e.message}`);
      }
    }
    
    console.log('Fim do processo de correção.');
  } catch (error) {
    console.error('Erro ao corrigir sequências:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

fixSequences();
