import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ProductParams } from '@/types/interfaces';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const ids = url.searchParams.get('ids')?.split(',');
        if (!ids) {
            return NextResponse.json({ success: false, error: 'Product ID\'s is required' }, { status: 400 });
        }

        // Fetch the product from Stripe
        const products = await stripe.products.list({
            limit: 100,
            ids
        });
        const totalWeight = products.data.reduce((sum, product) => {
            const weight = product.package_dimensions?.weight || 0; // Default to 0 if no weight
            return sum + weight;
        }, 0);
        // Return the created product data
        return NextResponse.json({ success: true, totalWeight });
    } catch (error: any) {
        console.error('Error fetching product from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}