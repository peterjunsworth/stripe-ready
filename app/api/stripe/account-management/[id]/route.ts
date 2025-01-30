import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// POST request to create PaymentIntent
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
        }

        // Fetch the product from Stripe
        const account = await stripe.accounts.retrieve(id);
        // Return the created product data
        return NextResponse.json({ success: true, account });
    } catch (error: any) {
        console.error('Error fetching product from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}