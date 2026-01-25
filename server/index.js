const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Security Hardening
const corsOptions = {
    origin: function (origin, callback) {
        const whitelist = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://192.168.5.136:5173'
        ];
        // Allow requests with no origin (like mobile apps or curl requests) in development
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// === Helper Functions ===
const createAuditLog = async (userId, table, recordId, action, changes = null, ipAddress = null, userAgent = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                table,
                recordId,
                action,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress,
                userAgent
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

        // 2. Reduce Stock and create Invoice Items
        const invoiceItems = [];

        for (const presc of prescriptions) {
            if (presc.productId) {
                const product = await prisma.product.update({
                    where: { id: presc.productId },
                    data: { stock: { decrement: 1 } }
                });

                invoiceItems.push({
                    category: 'CLINICAL',
                    description: product.name,
                    amount: product.salePrice,
                    petId: petId,
                    quantity: 1
                });
            }
        }

        // Add consultation fee
        invoiceItems.push({
            category: 'CLINICAL',
            description: `Consulta - ${veterinarian}`,
            amount: 150.00,
            petId: petId,
            quantity: 1
        });

        // 3. Create Bill with unified InvoiceItems
        const bill = await prisma.bill.create({
            data: {
                tutorId: (await prisma.pet.findUnique({ where: { id: petId } })).tutorId,
                description: `Atendimento Clínico - ${veterinarian}`,
                amount: invoiceItems.reduce((sum, item) => sum + item.amount, 0),
                dueDate: new Date(),
                type: 'Receivable',
                status: 'PENDING',
                category: 'Clinical',
                items: {
                    create: invoiceItems
                }
            }
        });

        // 4. Audit Log
        if (userId) createAuditLog(userId, 'MedicalRecord', record.id, 'CREATE', null, req.ip, req.headers['user-agent']);

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

        if (userId) createAuditLog(userId, 'Bill', bill.id, 'UPDATE', { status: 'PAID' }, req.ip, req.headers['user-agent']);

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

    if (userId) createAuditLog(userId, 'Bill', parseInt(id), 'SOFT_DELETE', null, req.ip, req.headers['user-agent']);

    res.json({ success: true });
});

// === Global Search ===
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const query = q.toLowerCase();
    const results = [];

    try {
        // Search Pets
        const pets = await prisma.pet.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { tutor: { name: { contains: query, mode: 'insensitive' } } }
                ]
            },
            include: { tutor: true },
            take: 5
        });
        pets.forEach(pet => {
            results.push({
                type: 'pet',
                id: pet.id,
                title: pet.name,
                subtitle: `${pet.species} • Tutor: ${pet.tutor.name}`
            });
        });

        // Search Tutors
        const tutors = await prisma.tutor.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { cpf: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5
        });
        tutors.forEach(tutor => {
            results.push({
                type: 'tutor',
                id: tutor.id,
                title: tutor.name,
                subtitle: tutor.cpf || tutor.phone || 'Cliente'
            });
        });

        // Search Bills
        const bills = await prisma.bill.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { description: { contains: query, mode: 'insensitive' } },
                    { id: isNaN(parseInt(query)) ? undefined : parseInt(query) }
                ]
            },
            include: { tutor: true },
            take: 5
        });
        bills.forEach(bill => {
            results.push({
                type: 'bill',
                id: bill.id,
                title: `Conta #${bill.id}`,
                subtitle: `R$ ${bill.amount.toFixed(2)} • ${bill.tutor?.name || 'N/A'}`
            });
        });

        res.json(results.slice(0, 10));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Search failed' });
    }
});

// === Pet Timeline ===
app.get('/api/pets/:id/timeline', async (req, res) => {
    const { id } = req.params;

    try {
        const petId = parseInt(id);

        const [appointments, records, invoices] = await Promise.all([
            prisma.appointment.findMany({ where: { petId }, orderBy: { date: 'desc' } }),
            prisma.medicalRecord.findMany({ where: { petId, deletedAt: null }, orderBy: { date: 'desc' } }),
            prisma.invoiceItem.findMany({
                where: { petId },
                include: { bill: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const timeline = [
            ...appointments.map(a => ({
                id: `appt-${a.id}`,
                date: a.date,
                type: 'APPOINTMENT',
                title: a.type === 'Petshop' ? 'Serviço de Estética' : 'Atendimento Clínico',
                subtitle: a.service,
                status: a.status
            })),
            ...records.map(r => ({
                id: `rec-${r.id}`,
                date: r.date,
                type: 'MEDICAL_RECORD',
                title: 'Prontuário Médico',
                subtitle: r.chiefComplaint,
                status: r.status
            })),
            ...invoices.map(i => ({
                id: `inv-${i.id}`,
                date: i.createdAt,
                type: 'INVOICE',
                title: i.category === 'PETSHOP' ? 'Consumo Petshop' : 'Consumo Clínico',
                subtitle: i.description,
                amount: i.amount
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(timeline);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch pet timeline' });
    }
});

// === Core Data ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
