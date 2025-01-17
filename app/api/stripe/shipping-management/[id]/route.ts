import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;
        const { shippingRate } = await req.json();
        const updateRate = await stripe.shippingRates.update(id, { metadata: shippingRate.metadata });
        return NextResponse.json({ success: true, shippingRate: updateRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;
        const updateRate = await stripe.shippingRates.update(id, { active: false });
        return NextResponse.json({ success: true, shippingRate: updateRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}
