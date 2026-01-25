const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || 'file:./dev.db'
            }
        }
    });
    console.log('Prisma Client initialized');
    prisma.$connect()
        .then(() => {
            console.log('Connected to DB');
            process.exit(0);
        })
        .catch((e) => {
            console.error('Connection error:', e);
            process.exit(1);
        });
} catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
}
