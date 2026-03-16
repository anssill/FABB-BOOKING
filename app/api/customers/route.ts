import { NextResponse } from 'next/server';

// Mocked database for customer profiles
let customers = [];

// Handler for GET requests to retrieve customer profiles
export async function GET(request) {
    return NextResponse.json(customers);
}

// Handler for POST requests to create a new customer profile
export async function POST(request) {
    const customerData = await request.json();
    customers.push(customerData);
    return NextResponse.json({ message: 'Customer profile created!', customer: customerData }, { status: 201 });
}

// Handler for PUT requests to update an existing customer profile
export async function PUT(request) {
    const { id, ...updateData } = await request.json();
    const customerIndex = customers.findIndex(customer => customer.id === id);

    if (customerIndex !== -1) {
        customers[customerIndex] = { ...customers[customerIndex], ...updateData };
        return NextResponse.json({ message: 'Customer profile updated!', customer: customers[customerIndex] });
    }
    return NextResponse.json({ message: 'Customer not found!' }, { status: 404 });
}

// Handler for DELETE requests to remove a customer profile
export async function DELETE(request) {
    const { id } = await request.json();
    const customerIndex = customers.findIndex(customer => customer.id === id);

    if (customerIndex !== -1) {
        customers.splice(customerIndex, 1);
        return NextResponse.json({ message: 'Customer profile deleted!' });
    }
    return NextResponse.json({ message: 'Customer not found!' }, { status: 404 });
}