import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PriceParams } from '@/types/interfaces';

// Create a Stripe Price
export async function createPrice(priceParams: PriceParams) {
    try {
        delete priceParams.id;
        const body = {
            ...priceParams,
            unit_amount: priceParams.unit_amount ?? undefined,
            product: typeof priceParams.product === 'string' ? priceParams.product : priceParams.product.id,
            recurring: priceParams.recurring ? { 
                interval: priceParams.recurring.interval,
                interval_count: priceParams.recurring.interval_count
            } : undefined,
        }
        if (typeof priceParams.recurring === 'string') {
            delete body.recurring;
        }
        const price = await stripe.prices.create({
            ...body
        });
        return Response.json({ success: true, price });
    } catch (error: any) {
        console.error('Error creating price:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function getProductPrices(productId: string) {
    try {
        /* const prices = await stripe.prices.list({
            product: productId,
            expand: ['data.product'],
        }); */
        const searchQuery = `product:'${productId}' AND -metadata['deleted']:'true'`;
        //const searchQuery = `name~\'${query}\' OR description~\'${query}\'`;

        // Use the Stripe products search method
        const prices = await stripe.prices.search({
            query: searchQuery,
            expand: ['data.product'],
            limit: 100,  // Adjust the number of results as needed
        });

        return Response.json({ success: true, prices });
    } catch (error: any) {
        console.error('Error getting product prices:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        // Parse the incoming JSON request body
        const url = new URL(req.url);
        const productId = url.searchParams.get('productId') ?? '';
        // Create a new price using the Stripe API
        const prices = await getProductPrices(productId);
        const data = await prices.json();
        // Return the created price data
        return NextResponse.json({ ...data });
    } catch (error: any) {
        console.error('Error creating price in Stripe:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON request body
        const priceData = await req.json();
        // Validate required fields
        if (!priceData.unit_amount || !priceData.currency || !priceData.product) {
            return NextResponse.json(
                { success: false, error: 'unit_amount, currency, and product are required' },
                { status: 400 }
            );
        }

        // Create a new price using the Stripe API
        const price = await createPrice(priceData);
        const data = await price.json();
        // Return the created price data
        return NextResponse.json({ ...data });
    } catch (error: any) {
        console.error('Error creating price in Stripe:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}