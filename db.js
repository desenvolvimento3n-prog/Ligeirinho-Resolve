const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERRO: A variável de ambiente DATABASE_URL ou PRISMA_DATABASE_URL não está definida!');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
