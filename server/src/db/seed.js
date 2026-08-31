import { initDatabase, seedDatabase } from './database.js';

console.log('🔄 Initializing and seeding VMC HMI database...');
initDatabase();
seedDatabase(true);
console.log('✅ Database successfully initialized with scenario VMC-01!');
process.exit(0);
