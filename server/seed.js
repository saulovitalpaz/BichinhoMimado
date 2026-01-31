const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // SAFETY CHECK: Only seed if database is empty
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log('✅ Database already populated. Skipping seed to preserve data.');
        return;
    }

    // 0. Create Users
    console.log('👥 Creating users...');
    await prisma.user.createMany({
        data: [
            { name: 'Giovana', email: 'giovana@bichinhomimado.com.br', passwordHash: 'Hope123', role: 'admin_business' },
            { name: 'Recepção', email: 'recepcao@bichinhomimado.com.br', passwordHash: 'BichinhoMimado', role: 'receptionist' }
        ]
    });

    // 1. Create Tutors and Pets
    console.log('🐾 Creating tutors and pets...');
    const tutors = [
        {
            name: 'Maria Silva',
            email: 'maria@email.com',
            phone: '11999999999',
            address: 'Rua das Flores, 123',
            lgpdConsent: true,
            patients: {
                create: [
                    { name: 'Rex', species: 'Cão', breed: 'Golden Retriever', gender: 'M', weight: 32.5, tags: '#Cardiopatia,#Vacinacao' },
                    { name: 'Mel', species: 'Cão', breed: 'Poodle', gender: 'F', weight: 6.2, tags: '#Alergia' }
                ]
            }
        },
        {
            name: 'João Pereira',
            email: 'joao@email.com',
            phone: '11888888888',
            lgpdConsent: true,
            patients: {
                create: [
                    { name: 'Luna', species: 'Gato', breed: 'Persa', gender: 'F', weight: 4.1 }
                ]
            }
        }
    ];

    for (const t of tutors) {
        await prisma.tutor.create({ data: t });
    }

    // 2. Create Products (Inventory)
    console.log('📦 Creating products...');
    const products = [
        { name: 'Vacina V10', category: 'Medications', salePrice: 85.0, stock: 3, minStock: 10, sku: 'VAC-001' },
        { name: 'Simparic 20kg', category: 'Medications', salePrice: 120.0, stock: 15, minStock: 5, sku: 'SIM-020' },
        { name: 'Banho - Porte Grande', category: 'Petshop', salePrice: 90.0, stock: 999, sku: 'SRV-BNH-L' },
        { name: 'Tosa Higiênica', category: 'Petshop', salePrice: 45.0, stock: 999, sku: 'SRV-TSA-H' }
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    // 3. Create Daily Cash Flow
    await prisma.dailyCashFlow.create({
        data: {
            date: new Date(),
            openingBalance: 250.00,
            status: 'OPEN'
        }
    });

    // 4. Create Appointments
    const rex = await prisma.pet.findFirst({ where: { name: 'Rex' } });
    const mel = await prisma.pet.findFirst({ where: { name: 'Mel' } });

    if (rex) {
        await prisma.appointment.create({
            data: {
                date: new Date(),
                type: 'Petshop',
                service: 'Banho + Tosa',
                status: 'IN_PROGRESS',
                petshopStatus: 'Secagem',
                groomer: 'Ana',
                petId: rex.id,
                price: 135.0
            }
        });
    }

    if (mel) {
        await prisma.appointment.create({
            data: {
                date: new Date(),
                type: 'Clinical',
                service: 'Consulta',
                status: 'SCHEDULED',
                petId: mel.id,
                price: 150.0
            }
        });
    }

    console.log('✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
