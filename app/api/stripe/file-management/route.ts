import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
    try {
        const files = await stripe.files.list({
            limit: 100,
        });
        return NextResponse.json({ success: true, files });
    } catch (error: any) {
        console.error('Error fetching product from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
