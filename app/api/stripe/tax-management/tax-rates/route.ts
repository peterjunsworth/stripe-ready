import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getTaxRates() {
    try {
        const taxRates = await stripe.taxRates.list({
            limit: 100,
            active: true
        });
        return taxRates.data;
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { taxRate } = await req.json();
    try {
        const createdRate = await stripe.taxRates.create(taxRate);
        return NextResponse.json({ success: true, taxRate: createdRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}

export async function GET(req: NextRequest) {
    try {
        let taxRates = await getTaxRates();
        return NextResponse.json({ success: true, taxRates });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}