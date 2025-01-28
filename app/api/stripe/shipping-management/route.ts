import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function getShippingRates() {
    try {
        const shippingRates = await stripe.shippingRates.list({
            active: true, // Fetch only active products
            limit: 100,
        });
        return shippingRates;
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        throw error;
    }
}

// POST request to create PaymentIntent
export async function POST(req: NextRequest) {
    const { shippingRate } = await req.json();
    try {
        const createdRate = await stripe.shippingRates.create({
            display_name: shippingRate.display_name,
            fixed_amount: shippingRate.fixed_amount,
            type: 'fixed_amount',
            metadata: shippingRate.metadata,
            delivery_estimate: {
                minimum: { unit: 'business_day', value: 3 },
                maximum: { unit: 'business_day', value: 5 },
            },
        });
        return NextResponse.json({ success: true, shippingRate: createdRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const weight = parseFloat(url.searchParams.get('weight') ?? '0'); // Convert weight to a number
        let shippingRates = (await getShippingRates()).data;

        if (weight) {
            console.log(shippingRates);
            const matchingRates = shippingRates.filter(rate => {
                const minWeight = parseFloat(rate.metadata.minWeight);
                const maxWeight = parseFloat(rate.metadata.maxWeight);
                return weight >= minWeight && (weight <= maxWeight || maxWeight === -1);
            });
            shippingRates = [...matchingRates];
        }
        return NextResponse.json({ success: true, shippingRates });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}