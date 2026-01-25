const API_BASE_URL = 'http://localhost:3001/api';

// === Authentication & Users ===

export const loginUser = async (email, password) => {
    // Mock authentication logic
    // In a real app, this would hit /auth/login

    const users = [
        { id: 1, name: 'Maressa', role: 'admin_vet', email: 'maressa@bichinhomimado.com', access: 'full' },
        { id: 2, name: 'Giovana', role: 'admin_business', email: 'giovana@bichinhomimado.com', access: 'business' },
        { id: 3, name: 'Dr. Saulo', role: 'vet', email: 'saulo@bichinhomimado.com', access: 'clinical' },
        { id: 4, name: 'Recepção', role: 'reception', email: 'recepcao@bichinhomimado.com', access: 'frontdesk' }
    ];

    const user = users.find(u => u.email === email);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (user) {
        return user;
    } else {
        throw new Error('Credenciais inválidas');
    }
};

export const fetchTutors = async () => {
    const response = await fetch(`${API_BASE_URL}/tutors`);
    if (!response.ok) throw new Error('Failed to fetch tutors');
    return response.json();
};

export const fetchPets = async () => {
    const response = await fetch(`${API_BASE_URL}/pets`);
    if (!response.ok) throw new Error('Failed to fetch pets');
    return response.json();
};

export const fetchBills = async () => {
    const response = await fetch(`${API_BASE_URL}/bills`);
    if (!response.ok) throw new Error('Failed to fetch bills');
    return response.json();
};

export const fetchAppointments = async () => {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
};

// === New Professional Endpoints ===

export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const fetchMedicalRecords = async (petId) => {
    const response = await fetch(`${API_BASE_URL}/medical-records/${petId}`);
    if (!response.ok) throw new Error('Failed to fetch medical records');
    return response.json();
};

export const createMedicalRecord = async (recordData) => {
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
    });
    if (!response.ok) throw new Error('Failed to create medical record');
    return response.json();
};

export const fetchDailyFinance = async () => {
    const response = await fetch(`${API_BASE_URL}/finance/daily`);
    if (!response.ok) throw new Error('Failed to fetch daily finance');
    return response.json();
};
