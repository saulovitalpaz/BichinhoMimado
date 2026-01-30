const express = require('express');
const path = require('path'); // Added for static serving
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
        const { petId, date, type, service, veterinarianId, groomer, petshopStatus, price } = req.body;
        const appointment = await prisma.appointment.create({
            data: {
                petId,
                date: new Date(date),
                type,
                service,
                groomer,
                petshopStatus,
                price: parseFloat(price) || 0,
                status: 'SCHEDULED'
            }
        });
        res.json(appointment);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

app.get('/api/petshop/billable-services', async (req, res) => {
    try {
        const services = await prisma.appointment.findMany({
            where: {
                type: 'Petshop',
                petshopStatus: 'Pronto',
                // We consider it billable if it hasn't been completed/billed yet
                status: 'SCHEDULED'
            },
            include: { pet: { include: { tutor: true } } }
        });
        res.json(services);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch billable services' });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { status, petshopStatus, groomer, date, service } = req.body;
        const appointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: {
                status,
                petshopStatus,
                groomer,
                date: date ? new Date(date) : undefined,
                service
            }
        });
        res.json(appointment);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update appointment' });
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

    try {
        const billId = parseInt(id);

        // 1. Find items associated with this bill that reduced stock
        const bill = await prisma.bill.findUnique({
            where: { id: billId },
            include: { items: true }
        });

        if (bill) {
            // 2. Reverse Stock
            for (const item of bill.items) {
                if (item.category === 'CLINICAL' && item.description && item.amount > 0) {
                    // Try to find product by name match (since we didn't store productId in InvoiceItem initially, though we should have)
                    // Hardening: Future-proof by assuming description matches product name
                    const product = await prisma.product.findFirst({ where: { name: item.description } });
                    if (product) {
                        await prisma.product.update({
                            where: { id: product.id },
                            data: { stock: { increment: item.quantity || 1 } }
                        });
                    }
                }
            }
        }

        // Soft Delete
        await prisma.bill.update({
            where: { id: billId },
            data: { deletedAt: new Date() }
        });

        if (userId) createAuditLog(userId, 'Bill', billId, 'SOFT_DELETE', null, req.ip, req.headers['user-agent']);

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete bill' });
    }
});

// === Global Search ===
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const query = q.toString();

    try {
        const [pets, tutors, bills] = await Promise.all([
            prisma.pet.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { tutor: { name: { contains: query } } }
                    ],
                    deletedAt: null
                },
                select: { id: true, name: true, tutor: { select: { name: true } } },
                take: 5
            }),
            prisma.tutor.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { cpf: { contains: query } }
                    ],
                    deletedAt: null
                },
                select: { id: true, name: true, cpf: true },
                take: 5
            }),
            prisma.bill.findMany({
                where: {
                    OR: [
                        { description: { contains: query } },
                        // Only search ID if query is numeric to prevent DB casting errors
                        ...(!isNaN(parseInt(query)) ? [{ id: parseInt(query) }] : [])
                    ],
                    deletedAt: null
                },
                select: { id: true, description: true, amount: true, status: true },
                take: 5
            })
        ]);

        const results = [
            ...pets.map(p => ({
                type: 'pet',
                id: p.id,
                title: p.name,
                subtitle: `Tutor: ${p.tutor?.name}`
            })),
            ...tutors.map(t => ({
                type: 'tutor',
                id: t.id,
                title: t.name,
                subtitle: `CPF: ${t.cpf}`
            })),
            ...bills.map(b => ({
                type: 'bill',
                id: b.id,
                title: `Fatura #${b.id}`,
                subtitle: `${b.description} - R$ ${b.amount} (${b.status})`
            }))
        ];

        res.json(results);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Search failed' });
    }
});

// === Pet Timeline ===
app.get('/api/pets/:id/timeline', async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const petId = parseInt(id);

        const [appointments, records, invoices] = await Promise.all([
            prisma.appointment.findMany({
                where: { petId },
                take: limit,
                skip: offset,
                orderBy: { date: 'desc' },
                select: { id: true, date: true, type: true, service: true, status: true }
            }),
            prisma.medicalRecord.findMany({
                where: { petId, deletedAt: null },
                take: limit,
                skip: offset,
                orderBy: { date: 'desc' },
                select: { id: true, date: true, chiefComplaint: true, status: true } // Excludes heavy soapData
            }),
            prisma.invoiceItem.findMany({
                where: { petId },
                include: { bill: { select: { status: true } } },
                take: limit,
                skip: offset,
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
                amount: i.amount,
                status: i.bill?.status
            }))
        ]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit); // Ensure overall limit after merge

        res.json(timeline);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch pet timeline' });
    }
});

// === Petshop / Retail ===
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, sku, category, stock, minStock, costPrice, salePrice, expiry } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                category,
                stock: parseInt(stock) || 0,
                minStock: parseInt(minStock) || 5,
                costPrice: parseFloat(costPrice) || 0,
                salePrice: parseFloat(salePrice) || 0,
                expiry: expiry ? new Date(expiry) : null
            }
        });
        res.json(product);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, sku, category, stock, minStock, costPrice, salePrice, expiry } = req.body;
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                sku,
                category,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                minStock: minStock !== undefined ? parseInt(minStock) : undefined,
                costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
                salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
                expiry: expiry ? new Date(expiry) : undefined
            }
        });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.post('/api/sales', async (req, res) => {
    const { items, paymentMethod, tutorId, userId } = req.body;
    // items: [{ productId, quantity, price, name }]

    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 1. Create the Bill
        const bill = await prisma.bill.create({
            data: {
                tutorId,
                description: 'Venda Petshop / PDV',
                amount: totalAmount,
                dueDate: new Date(),
                paidDate: new Date(), // Sales are usually paid instantly
                status: 'PAID',
                paymentMethod,
                category: 'Retail',
                items: {
                    create: items.map(item => ({
                        category: 'PDV',
                        description: item.name,
                        amount: item.price,
                        quantity: item.quantity
                    }))
                }
            }
        });

        // 2. Reduce Stock
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
        }

        if (userId) createAuditLog(userId, 'Bill', bill.id, 'CREATE', { items }, req.ip, req.headers['user-agent']);

        res.json(bill);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to process sale' });
    }
});

app.get('/api/petshop/stats', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const salesToday = await prisma.bill.findMany({
            where: {
                category: 'Retail',
                createdAt: { gte: startOfDay },
                status: 'PAID'
            }
        });

        const totalRevenue = salesToday.reduce((sum, b) => sum + b.amount, 0);
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: { lte: prisma.product.fields.minStock }
            },
            take: 5
        });

        res.json({
            revenueToday: totalRevenue,
            salesCount: salesToday.length,
            lowStock: lowStockProducts
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});


// === Tutors ===
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await prisma.tutor.findMany({
            where: { deletedAt: null },
            include: { pets: true },
            orderBy: { name: 'asc' }
        });
        res.json(tutors);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch tutors' });
    }
});

app.post('/api/tutors', async (req, res) => {
    try {
        const { name, cpf, phone, email, address, notes } = req.body;
        const tutor = await prisma.tutor.create({
            data: { name, cpf, phone, email, address, notes }
        });
        res.json(tutor);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create tutor' });
    }
});

app.put('/api/tutors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { name, cpf, phone, email, address, notes } = req.body;
        const tutor = await prisma.tutor.update({
            where: { id: parseInt(id) },
            data: { name, cpf, phone, email, address, notes }
        });
        res.json(tutor);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update tutor' });
    }
});

// === Pets ===
app.get('/api/pets', async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({
            where: { deletedAt: null },
            include: { tutor: true },
            orderBy: { name: 'asc' }
        });
        res.json(pets);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

app.post('/api/pets', async (req, res) => {
    try {
        const { name, species, breed, age, weight, gender, tutorId, notes, allergies } = req.body;
        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                age: parseInt(age) || 0,
                weight: parseFloat(weight) || 0,
                gender,
                tutorId: parseInt(tutorId),
                notes,
                allergies
            }
        });
        res.json(pet);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create pet' });
    }
});


// === Services ===
app.get('/api/services', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        res.json(services);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const { name, description, price, duration, category } = req.body;
        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                duration: parseInt(duration) || 30,
                category
            }
        });
        res.json(service);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.put('/api/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, price, duration, category, active } = req.body;
        const service = await prisma.service.update({
            where: { id: parseInt(id) },
            data: {
                name, description, price: price ? parseFloat(price) : undefined,
                duration: duration ? parseInt(duration) : undefined,
                category, active
            }
        });
        res.json(service);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// === Core Data ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// === Production Static Serving ===
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../web/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
