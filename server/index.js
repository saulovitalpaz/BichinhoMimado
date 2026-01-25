const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Tutores
app.get('/api/tutors', async (req, res) => {
    const tutors = await prisma.tutor.findMany({ include: { patients: true } });
    res.json(tutors);
});

// Pets
app.get('/api/pets', async (req, res) => {
    const pets = await prisma.pet.findMany({ include: { tutor: true } });
    res.json(pets);
});

// Financeiro / Bills
app.get('/api/bills', async (req, res) => {
    const bills = await prisma.bill.findMany({ include: { tutor: true } });
    res.json(bills);
});

// Appointments
app.get('/api/appointments', async (req, res) => {
    const appointments = await prisma.appointment.findMany({ include: { pet: true } });
    res.json(appointments);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// === Professional Endpoints ===

// Medical Records
app.get('/api/medical-records/:petId', async (req, res) => {
    const records = await prisma.medicalRecord.findMany({
        where: { petId: parseInt(req.params.petId) },
        include: { prescriptions: true },
        orderBy: { date: 'desc' }
    });
    res.json(records);
});

app.post('/api/medical-records', async (req, res) => {
    const { petId, veterinarian, triagemData, anamnesisData, physicalExam, diagnosis, treatment, prescriptions } = req.body;

    // Create record with nested prescriptions
    const record = await prisma.medicalRecord.create({
        data: {
            petId,
            veterinarian,
            triagemData: JSON.stringify(triagemData),
            anamnesisData: JSON.stringify(anamnesisData),
            physicalExam: JSON.stringify(physicalExam),
            diagnosis,
            treatment,
            prescriptions: {
                create: prescriptions
            }
        }
    });

    // Reduce stock for prescribed products
    for (const presc of prescriptions) {
        if (presc.productId) {
            await prisma.product.update({
                where: { id: presc.productId },
                data: { stock: { decrement: 1 } }
            });
        }
    }

    res.json(record);
});

// Products & Inventory
app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

// Financial - Daily Cash Flow
app.get('/api/finance/daily', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get Cash Flow Entry
    const cashFlow = await prisma.dailyCashFlow.findFirst({
        where: { date: { gte: today } }
    });

    // Get Transactions
    const transactions = await prisma.bill.findMany({
        where: {
            createdAt: { gte: today },
            status: 'Paid'
        }
    });

    res.json({ cashFlow, transactions });
});
