import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'File ID is required' }, { status: 400 });
        }

        // Fetch the product from Stripe
        const file = await stripe.files.retrieve(id);
        // Return the created product data
        return NextResponse.json({success: true, file });
    } catch (error: any) {
        console.error('Error fetching product from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
