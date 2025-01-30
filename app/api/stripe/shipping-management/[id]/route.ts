import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

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

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Extract the ID from the params
        const { id } = await params;
        const updateRate = await stripe.shippingRates.update(id, { active: false });
        return NextResponse.json({ success: true, shippingRate: updateRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}
