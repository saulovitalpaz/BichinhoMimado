const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// === Helper Functions ===
const createAuditLog = async (userId, table, recordId, action, changes = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                table,
                recordId,
                action,
                changes: changes ? JSON.stringify(changes) : null
            }
        });
    } catch (e) {
        console.error('Audit Log Error:', e);
    }
};

// === Auth ===
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // In a real app, use bcrypt to compare passwords.
    // For now, we compare plain text as we are setting up the structure.

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.passwordHash !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { passwordHash, ...userWithoutPassword } = user;

        // Log Login
        // await createAuditLog(user.id, 'User', user.id, 'LOGIN'); 

        res.json(userWithoutPassword);
    } catch (e) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// === Medical ===
app.get('/api/appointments', async (req, res) => {
    const { date } = req.query;
    const where = {};
    if (date) {
        // Filter by date range if needed
    }
    const appointments = await prisma.appointment.findMany({
        where,
        include: { pet: { include: { tutor: true } } },
        orderBy: { date: 'asc' }
    });
    res.json(appointments);
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { petId, date, type, service, veterinarianId } = req.body; // veterinarianId implies userId
        const appointment = await prisma.appointment.create({
            data: {
                petId,
                date: new Date(date),
                type,
                service,
                status: 'SCHEDULED'
            }
        });
        res.json(appointment);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

app.post('/api/medical-records', async (req, res) => {
    const {
        userId, // Current User ID (Vet)
        petId,
        veterinarian,
        chiefComplaint,
        soapData, // JSON Key
        diagnosis,
        treatment,
        prescriptions
    } = req.body;

    try {
        // 1. Create Medical Record
        const record = await prisma.medicalRecord.create({
            data: {
                petId,
                veterinarian,
                chiefComplaint,
                soapData: JSON.stringify(soapData),
                diagnosis,
                treatment,
                status: 'Finalized',
                prescriptions: {
                    create: prescriptions.map(p => ({
                        medicationName: p.medicationName,
                        dosage: p.dosage,
                        frequency: p.frequency,
                        duration: p.duration,
                        productId: p.productId
                    }))
                }
            }
        });

        // 2. Reduce Stock
        for (const presc of prescriptions) {
            if (presc.productId) {
                await prisma.product.update({
                    where: { id: presc.productId },
                    data: { stock: { decrement: 1 } }
                });
            }
        }

        // 3. Trigger Financial Transaction (Bill)
        // Calculate total or create a pending bill to be edited by reception
        await prisma.bill.create({
            data: {
                tutorId: (await prisma.pet.findUnique({ where: { id: petId } })).tutorId,
                description: `Consultation - ${veterinarian}`,
                amount: 150.00, // Base price, logic could be more complex
                dueDate: new Date(),
                type: 'Receivable',
                status: 'PENDING',
                category: 'Clinical'
            }
        });

        // 4. Audit Log
        if (userId) createAuditLog(userId, 'MedicalRecord', record.id, 'CREATE');

        res.json(record);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
});

// === Financial ===
app.get('/api/bills', async (req, res) => {
    const { status } = req.query;
    const where = { deletedAt: null }; // Soft Delete Check
    if (status) where.status = status;

    const bills = await prisma.bill.findMany({
        where,
        include: { tutor: true },
        orderBy: { dueDate: 'asc' }
    });
    res.json(bills);
});

app.put('/api/bills/:id/pay', async (req, res) => {
    const { id } = req.params;
    const { userId, paymentMethod } = req.body;

    try {
        const bill = await prisma.bill.update({
            where: { id: parseInt(id) },
            data: {
                status: 'PAID',
                paidDate: new Date(),
                paymentMethod
            }
        });

        if (userId) createAuditLog(userId, 'Bill', bill.id, 'UPDATE', { status: 'PAID' });

        res.json(bill);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update bill' });
    }
});

app.delete('/api/bills/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Passed for Audit

    // Soft Delete
    await prisma.bill.update({
        where: { id: parseInt(id) },
        data: { deletedAt: new Date() }
    });

    if (userId) createAuditLog(userId, 'Bill', parseInt(id), 'SOFT_DELETE');

    res.json({ success: true });
});

// === Core Data ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
