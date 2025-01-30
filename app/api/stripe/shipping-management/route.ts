import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getShippingRates(type: string) {
    try {
        const shippingRates = await stripe.shippingRates.list({
            active: true,
            limit: 100,
        });
        return shippingRates.data.filter(rate => rate.display_name === type);
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        throw error;
    }
}

// POST request to create PaymentIntent
export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

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
        const weight = parseFloat(url.searchParams.get('weight') ?? '0');
        const type = url.searchParams.get('type') ?? '';
        let shippingRates = await getShippingRates(type);

        if (weight) {
            console.log(shippingRates);
            const matchingRates = shippingRates.filter(rate => {
                const minValue = parseFloat(rate.metadata.minValue);
                const maxValue = parseFloat(rate.metadata.maxValue);
                return weight >= minValue && (weight <= maxValue || maxValue === -1) && rate.display_name === type;
            });
            shippingRates = [...matchingRates];
        }
        return NextResponse.json({ success: true, shippingRates });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}