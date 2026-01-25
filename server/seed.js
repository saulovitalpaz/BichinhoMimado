const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Tutors and Pets
    const tutors = [
        {
            name: 'Maria Silva',
            email: 'maria@email.com',
            phone: '11999999999',
            address: 'Rua das Flores, 123',
            pets: [
                { name: 'Rex', species: 'Cão', breed: 'Golden Retriever', gender: 'M', weight: 32.5, tags: '#Cardiopatia,#Vacinacao' },
                { name: 'Mel', species: 'Cão', breed: 'Poodle', gender: 'F', weight: 6.2, tags: '#Alergia' }
            ]
        },
        {
            name: 'João Pereira',
            email: 'joao@email.com',
            phone: '11888888888',
            pets: [
                { name: 'Luna', species: 'Gato', breed: 'Persa', gender: 'F', weight: 4.1 }
            ]
        }
    ];

    for (const t of tutors) {
        await prisma.tutor.create({
            data: {
                name: t.name,
                email: t.email,
                phone: t.phone,
                address: t.address,
                patients: {
                    create: t.pets
                }
            }
        });
    }

    // 2. Create Products (Inventory)
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
            status: 'Open'
        }
    });

    // 4. Create Appointments (Kanban Petshop)
    const rex = await prisma.pet.findFirst({ where: { name: 'Rex' } });
    const mel = await prisma.pet.findFirst({ where: { name: 'Mel' } });

    if (rex) {
        await prisma.appointment.create({
            data: {
                date: new Date(),
                type: 'Petshop',
                service: 'Banho + Tosa',
                status: 'InProgress',
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
                type: 'Petshop',
                service: 'Banho',
                status: 'InProgress',
                petshopStatus: 'Banho',
                groomer: 'Carlos',
                petId: mel.id,
                price: 60.0
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
