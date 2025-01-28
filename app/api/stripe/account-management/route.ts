import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// POST request to create PaymentIntent
export async function GET(req: NextRequest) {
    try {
        const account = await stripe.accounts.retrieve();
        return NextResponse.json({ success: true, account });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
