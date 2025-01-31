import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PriceParams, PartialPriceParams } from '@/types/interfaces';
import { createPrice } from '../route';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updatePrice(priceId: string, priceData: PartialPriceParams) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const price = await stripe.prices.update(priceId, {
            ...priceData
        });

        return { success: true, price };
    } catch (error: any) {
        console.error('Error updating price:', error.message);
        throw new Error(error.message);
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        // Parse the incoming JSON request body
        const priceData = await req.json();

        await updatePrice(id, {
            active: false,
            metadata: {
                deleted: true
            }
        });
        // Update the price using the Stripe API
        const price = await createPrice(priceData);
        const data = await price.json();
        // Return the created price data
        return NextResponse.json({ ...data });
    } catch (error: any) {
        console.error('Error updating price in Stripe:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Extract the priceId from the request URL
        const { id } = await params;

        // Validate priceId
        if (!id) {
            return NextResponse.json({ success: false, error: 'priceId is required' },{ status: 400 });
        }
        // Attempt to deactivate the price via Stripe API
        const deletedPrice = await updatePrice(id, { 
            active: false,
            metadata: {
                deleted: true
            }
        });
        return NextResponse.json({ success: true, price: deletedPrice });
    } catch (error: any) {
        console.error('Error handling DELETE request:', error.message);
        return NextResponse.json({ success: false, error: error.message },{ status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Price ID is required' }, { status: 400 });
        }
        const price = await stripe.prices.retrieve(id);
        return NextResponse.json({ success: true, price });
    } catch (error: any) {
        console.error('Error fetching price from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}