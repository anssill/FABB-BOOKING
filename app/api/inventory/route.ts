import { NextResponse } from 'next/server';

// Sample data for rental items
let rentalItems = [
    { id: 1, name: 'Bike', stock: 10 },
    { id: 2, name: 'Kayak', stock: 5 },
    { id: 3, name: 'Tennis Racket', stock: 8 }
];

export async function GET(request) {
    return NextResponse.json(rentalItems);
}

export async function POST(request) {
    const newItem = await request.json();
    rentalItems.push({ id: rentalItems.length + 1, ...newItem });
    return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request) {
    const updatedItem = await request.json();
    const index = rentalItems.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        rentalItems[index] = updatedItem;
        return NextResponse.json(updatedItem);
    }
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
}

export async function DELETE(request) {
    const { id } = await request.json();
    rentalItems = rentalItems.filter(item => item.id !== id);
    return NextResponse.json({ message: 'Item deleted' }, { status: 204 });
}