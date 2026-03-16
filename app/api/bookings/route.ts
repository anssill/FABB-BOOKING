import { NextResponse } from 'next/server';

// Mock database for booking records
let bookings = [];

export async function POST(request) {
    const bookingData = await request.json();
    const newBooking = { id: bookings.length + 1, ...bookingData };
    bookings.push(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
}

export async function GET() {
    return NextResponse.json(bookings, { status: 200 });
}

export async function DELETE(request) {
    const { id } = await request.json();
    bookings = bookings.filter(booking => booking.id !== id);
    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
}