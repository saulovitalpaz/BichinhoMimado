// Core Entity Types

export interface Tutor {
    id: number;
    name: string; // @db.VarChar(100)
    cpf: string; // @db.VarChar(14)
    phone: string | null; // @db.VarChar(20)
    email: string | null; // @db.VarChar(100)
    address: string | null; // @db.VarChar(255)
    notes: string | null;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
    deletedAt: string | null; // ISO Date
}

export interface Pet {
    id: number;
    name: string; // @db.VarChar(100)
    species: string; // @db.VarChar(50)
    breed: string | null; // @db.VarChar(50)
    age: number | null;
    weight: number | null; // @db.Decimal(5, 2)
    tutorId: number;
    tutor?: Tutor;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface User {
    id: number;
    name: string; // @db.VarChar(100)
    email: string; // @db.VarChar(100)
    role: 'admin_business' | 'admin_vet' | 'vet' | 'receptionist' | 'groomer';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface Product {
    id: number;
    name: string; // @db.VarChar(100)
    category: string; // @db.VarChar(50)
    purchasePrice: number; // @db.Decimal(10, 2)
    salePrice: number; // @db.Decimal(10, 2)
    stock: number;
    minStock: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface Appointment {
    id: number;
    date: string; // ISO Date
    type: 'Clinical' | 'Petshop';
    service: string; // @db.VarChar(100)
    status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
    petshopStatus: 'Aguardando' | 'Banho' | 'Secagem' | 'Tosa' | 'Pronto' | null;
    petId: number;
    pet?: Pet;
    userId: number;
    user?: User;
    taxiDog: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface MedicalRecord {
    id: number;
    date: string; // ISO Date
    petId: number;
    pet?: Pet;
    veterinarian: string; // @db.VarChar(100)
    chiefComplaint: string;
    soapData: string; // JSON string
    diagnosis: string | null;
    treatment: string | null;
    status: 'Draft' | 'Finalized';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface InvoiceItem {
    id: number;
    category: 'CLINICAL' | 'PETSHOP' | 'PDV';
    description: string;
    amount: number;
    productId: number | null;
    petId: number | null;
    billId: number | null;
    bill?: Bill;
    quantity: number;
    createdAt: string;
}

export interface Bill {
    id: number;
    tutorId: number;
    tutor?: Tutor;
    description: string;
    amount: number;
    dueDate: string; // ISO Date
    status: 'PENDING' | 'PAID' | 'CANCELED';
    type: 'Payable' | 'Receivable';
    category: string;
    paymentMethod: string | null;
    installment: number; // default 1
    totalInstallments: number; // default 1
    items?: InvoiceItem[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// API Response Wrappers
export interface TimelineEvent {
    id: string; // e.g., "appt-1", "rec-5"
    date: string;
    type: 'APPOINTMENT' | 'MEDICAL_RECORD' | 'INVOICE';
    title: string;
    subtitle: string;
    status?: string | null;
    amount?: number;
}
