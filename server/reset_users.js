const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('👥 Resetting Users...');

    // 0. Handle Dependencies (AuditLog, StockMovement)
    console.log('🧹 Cleaning user dependencies...');
    await prisma.auditLog.deleteMany(); // logs can be wiped
    await prisma.stockMovement.updateMany({
        data: { userId: null } // unlink stock movements
    });

    // Delete all existing users
    await prisma.user.deleteMany();
    console.log('✅ Deleted existing users.');

    // Create specific users
    await prisma.user.createMany({
        data: [
            {
                name: 'Giovana',
                email: 'giovana@bichinhomimado.com.br',
                passwordHash: 'Hope123',
                role: 'admin_business'
            },
            {
                name: 'Recepção',
                email: 'recepcao@bichinhomimado.com.br',
                passwordHash: 'BichinhoMimado',
                role: 'receptionist'
            }
        ]
    });
    console.log('✅ Created "Giovana" (Admin) and "Recepção" users.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
