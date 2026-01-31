const express = require('express');
const path = require('path'); // Added for static serving
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Robust for Production
const corsOptions = {
    origin: function (origin, callback) {
        // Core Whitelist
        const whitelist = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://192.168.5.136:5173'
        ];

        // Normalize FRONTEND_URL from environment
        const envFrontend = process.env.FRONTEND_URL?.replace(/\/$/, ""); // Remove trailing slash
        if (envFrontend) {
            whitelist.push(envFrontend);
        }

        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);

        // Check if origin is in whitelist or matches Railway pattern
        const isWhitelisted = whitelist.includes(origin) ||
            whitelist.includes(origin + "/") ||
            (origin.endsWith('.railway.app')); // Extra safety for Railway deployment

        if (isWhitelisted || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.error(`CORS blocked for origin: ${origin}. Expected one of: ${whitelist.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers crash on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// === Health Check & Root ===
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Bichinho Mimado API is running', environment: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

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
        console.error('Login Error:', e);
        res.status(500).json({ error: 'Login failed', message: e.message });
    }
});

// === Services (New) ===
app.get('/api/services', async (req, res) => {
    try {
        const services = await prisma.service.findMany();
        res.json(services);
    } catch (e) {
        // If Service table doesn't exist yet, return mock or empty
        res.json([]);
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const { name, description, price, duration, category, active, sku } = req.body;
        const finalSku = sku || `SRV-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const service = await prisma.service.create({
            data: { name, description, price, duration, category, active, sku: finalSku }
        });
        res.json(service);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.put('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, category, active } = req.body;
        const service = await prisma.service.update({
            where: { id: parseInt(id) },
            data: { name, description, price, duration, category, active }
        });
        res.json(service);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update service' });
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
        const { petId, date, type, service, veterinarianId, groomer, petshopStatus, price, notes } = req.body;

        if (!petId && (!notes || !notes.includes('PROVISÓRIO'))) {
            return res.status(400).json({ error: 'Pet is required for non-provisional appointments' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                petId: petId ? parseInt(petId) : null,
                tutorId: req.body.tutorId ? parseInt(req.body.tutorId) : null, // Save tutorId if provided
                date: new Date(date),
                type,
                service,
                groomer,
                petshopStatus,
                price: parseFloat(price) || 0,
                status: 'SCHEDULED',
                notes,
                deletedAt: null
            }
        });
        res.json(appointment);
    } catch (e) {
        console.error('Appointment Create Error:', e);
        res.status(500).json({
            error: 'Failed to create appointment',
            details: e.message,
            code: e.code,
            meta: e.meta
        });
    }
});

app.get('/api/petshop/billable-services', async (req, res) => {
    try {
        const services = await prisma.appointment.findMany({
            where: {
                OR: [
                    // Petshop: Must be 'Pronto' and not paid
                    { type: 'Petshop', petshopStatus: 'Pronto', status: { not: 'PAID' } },
                    // Clinical: Must be 'COMPLETED' (doctor finished) and not paid
                    { type: 'Clinical', status: 'COMPLETED' }, // Assuming Clinical sets COMPLETED
                    // OR if status is IN_PROGRESS but clearly done (safety net)
                    { type: 'Petshop', petshopStatus: 'Pronto', status: 'IN_PROGRESS' }
                ]
            },
            include: {
                pet: { include: { tutor: true } },
                tutor: true // Also include direct tutor link
            }
        });
        res.json(services);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch billable services' });
    }
});

// === Tutors & Pets ===
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await prisma.tutor.findMany({ include: { patients: true } });
        res.json(tutors);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch tutors' });
    }
});

app.post('/api/tutors', async (req, res) => {
    try {
        const { name, cpf, phone, email, address, notes } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

        const tutor = await prisma.tutor.create({
            data: {
                name,
                cpf,
                phone,
                email,
                address,
                observations: notes, // Map notes to observations
                deletedAt: null
            }
        });
        res.json(tutor);
    } catch (e) {
        console.error('Tutor Create Error:', e);
        res.status(500).json({ error: e.message || 'Failed to create tutor' });
    }
});

app.delete('/api/tutors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.tutor.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete tutor' });
    }
});

app.post('/api/pets', async (req, res) => {
    try {
        const { name, species, breed, age, weight, gender, tutorId, notes, allergies } = req.body;

        if (!name || !tutorId) {
            return res.status(400).json({ error: 'Nome do Pet e Vínculo com Tutor são obrigatórios' });
        }

        // Calculate approx birthDate from age if provided
        let birthDate = null;
        if (age) {
            const today = new Date();
            birthDate = new Date(today.setFullYear(today.getFullYear() - parseInt(age)));
        }

        // Combine notes and allergies into observations
        let observations = notes || '';
        if (allergies) observations += `\n[Alergias]: ${allergies}`;

        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                birthDate, // Map age to birthDate
                weight: weight ? parseFloat(weight) : null,
                gender,
                tutorId: parseInt(tutorId),
                observations, // Map notes to observations
                deletedAt: null
            }
        });
        res.json(pet);
    } catch (e) {
        console.error('Pet Create Error:', e);
        res.status(500).json({ error: e.message || 'Failed to create pet' });
    }
});

app.delete('/api/pets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.pet.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete pet' });
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
                tutorId: (await prisma.pet.findUnique({ where: { id: petId } }))?.tutorId,
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
    if (!q) return res.json([]);

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
                select: { id: true, name: true, tutorId: true, tutor: { select: { name: true } } },
                take: 20
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
                take: 20
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
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, sku, category, stock, minStock, costPrice, salePrice, expiry, userId } = req.body;
        const initialStock = parseInt(stock) || 0;
        const finalSku = sku || `PRD-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku: finalSku,
                category,
                stock: initialStock,
                minStock: parseInt(minStock) || 5,
                costPrice: parseFloat(costPrice) || 0,
                salePrice: parseFloat(salePrice) || 0,
                expiry: expiry ? new Date(expiry) : null,
                deletedAt: null,
                stockMovements: {
                    create: {
                        type: 'ENTRY',
                        quantity: initialStock,
                        reason: 'Estoque Inicial',
                        userId: userId || null
                    }
                }
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
        const { name, description, sku, category, stock, minStock, costPrice, salePrice, expiry, userId, reason } = req.body;

        // 1. Get current product to check stock change
        const currentProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });

        if (!currentProduct) return res.status(404).json({ error: 'Product not found' });

        const newStock = stock !== undefined ? parseInt(stock) : currentProduct.stock;
        const stockDiff = newStock - currentProduct.stock;

        // 2. Prepare Update Data
        const updateData = {
            name,
            description,
            sku,
            category,
            stock: newStock,
            minStock: minStock !== undefined ? parseInt(minStock) : undefined,
            costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
            salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
            expiry: expiry ? new Date(expiry) : undefined
        };

        // 3. Update and potentially create movement
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                ...updateData,
                stockMovements: stockDiff !== 0 ? {
                    create: {
                        type: stockDiff > 0 ? 'ENTRY' : 'EXIT',
                        quantity: Math.abs(stockDiff),
                        reason: reason || 'Ajuste Manual',
                        userId: userId || null
                    }
                } : undefined
            }
        });
        res.json(product);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.get('/api/products/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const history = await prisma.stockMovement.findMany({
            where: { productId: parseInt(id) },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });
        res.json(history);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch product history' });
    }
});

app.post('/api/sales', async (req, res) => {
    const { items, paymentMethod, tutorId, userId } = req.body;
    // items: [{ productId, quantity, price, name }]

    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 1. Create the Bill with item details (including cost snapshots)
        const itemsWithCosts = await Promise.all(items.map(async item => {
            let costAmount = null;
            if (item.productId) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { costPrice: true }
                });
                costAmount = product?.costPrice || 0;
            }
            return { ...item, costAmount };
        }));

        const bill = await prisma.bill.create({
            data: {
                tutorId,
                description: 'Venda Petshop / PDV',
                amount: totalAmount,
                dueDate: new Date(),
                paidDate: new Date(),
                status: 'PAID',
                paymentMethod,
                category: 'Retail',
                items: {
                    create: itemsWithCosts.map(item => ({
                        category: 'PDV',
                        description: item.name,
                        amount: item.price,
                        costAmount: item.costAmount,
                        quantity: item.quantity,
                        serviceId: item.serviceId ? parseInt(item.serviceId) : null
                    }))
                }
            }
        });

        // 2. Reduce Stock & Update Appointments & Record Movement
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                await prisma.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'EXIT',
                        quantity: item.quantity,
                        reason: 'Venda PDV',
                        userId: userId || null
                    }
                });
            }

            if (item.serviceId) {
                await prisma.appointment.update({
                    where: { id: parseInt(item.serviceId) },
                    data: { status: 'PAID' }
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

app.get('/api/sales', async (req, res) => {
    try {
        const sales = await prisma.bill.findMany({
            where: {
                category: 'Retail',
                deletedAt: null
            },
            include: {
                tutor: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add date field for frontend compatibility (some parts use .date)
        const formattedSales = sales.map(s => ({
            ...s,
            date: s.createdAt,
            total: s.amount
        }));

        res.json(formattedSales);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch sales' });
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


// === Health Check & Root ===
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Bichinho Mimado API is running',
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// === Fiscal & NFe Module ===
app.get('/api/company', async (req, res) => {
    try {
        const company = await prisma.company.findFirst();
        res.json(company || {});
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch company' });
    }
});

app.post('/api/company', async (req, res) => {
    try {
        // Upsert logic: if exists update, else create
        const count = await prisma.company.count();
        if (count > 0) {
            const first = await prisma.company.findFirst();
            const company = await prisma.company.update({
                where: { id: first.id },
                data: req.body
            });
            res.json(company);
        } else {
            const company = await prisma.company.create({ data: req.body });
            res.json(company);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save company' });
    }
});

app.post('/api/nfe/validate', async (req, res) => {
    const { saleId } = req.body;
    try {
        const sale = await prisma.bill.findUnique({
            where: { id: parseInt(saleId) },
            include: {
                tutor: true,
                items: {
                    include: {
                        service: true
                    }
                }
            }
        });

        if (!sale) return res.status(404).json({ error: 'Sale not found' });

        const errors = [];

        // 1. Validator: Company
        const company = await prisma.company.findFirst();
        if (!company?.cnpj) errors.push('Empresa: CNPJ não configurado.');
        if (!company?.ie) errors.push('Empresa: Inscrição Estadual ausente.');
        if (!company?.address) errors.push('Empresa: Endereço completo obrigatório.');

        // 2. Validator: Client (Tutor)
        if (!sale.tutor) {
            errors.push('Cliente: Venda sem cliente vinculado (Consumidor Final?).');
        } else {
            if (!sale.tutor.cpf) errors.push('Cliente: CPF obrigatório para NFe.');
            if (!sale.tutor.address || !sale.tutor.zipCode || !sale.tutor.city) {
                errors.push('Cliente: Endereço completo (Rua, CEP, Cidade) obrigatório.');
            }
        }

        // 3. Validator: Products/Services
        let hasNcmError = false;
        for (const item of sale.items) {
            // In a real scenario we would fetch Product details to check NCM if not stored in item
            // For now we assume items have what we need or we check the source
        }

        if (errors.length > 0) {
            return res.json({ valid: false, errors });
        }

        // If valid, return a preview structure
        return res.json({
            valid: true,
            preview: {
                issuer: company.name,
                recipient: sale.tutor?.name || 'Consumidor',
                total: sale.amount,
                taxTotal: sale.amount * 0.18 // Mock tax calc
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Validation failed' });
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
