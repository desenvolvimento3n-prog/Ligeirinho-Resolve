import 'dotenv/config';
import prisma from './src/lib/db.js';

async function test() {
  try {
    const clients = await prisma.client.findMany();
    const categories = await prisma.category.findMany();
    const subcategories = await prisma.subcategory.findMany();
    const users = await prisma.user.findMany();
    
    console.log('--- Database Check ---');
    console.log('Users:', users.map(u => u.username));
    console.log('Clients:', clients.map(c => c.name));
    console.log('Categories:', categories.map(c => c.name));
    console.log('Subcategories:', subcategories.map(s => s.name));
    
    if (clients.length === 0 || users.length === 0) {
      console.log('Cannot perform full test: Missing clients or users.');
      return;
    }

    console.log('Attempting to create a test ticket...');
    const data = {
      title: 'Teste Minimo',
      description: 'Desc',
      clientId: clients[0].id,
      userId: users[0].id,
    };
    console.log('Creating minimal ticket with data:', data);
    const ticket = await prisma.ticket.create({ data });
    
    console.log('Successfully created ticket:', ticket.id);
    
    // Clean up
    await prisma.ticket.delete({ where: { id: ticket.id } });
    console.log('Cleaned up test ticket.');
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

test();
