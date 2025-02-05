import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parse } from 'path';

export async function getTaxRegistrations() {
    try {
        const taxRegisrations = await stripe.tax.registrations.list({
            limit: 100,
        });
        return taxRegisrations.data;
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

    const { taxRegistration } = await req.json();
    try {
        const createdRate = await stripe.tax.registrations.create({
            
                ...taxRegistration,
                "active_from": parseInt(taxRegistration.active_from),
                "expires_at": parseInt(taxRegistration.expires_at)
            
        });
        return NextResponse.json({ success: true, taxRegistration: createdRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}

export async function GET(req: NextRequest) {
    try {
        const taxRegistration = await getTaxRegistrations();
        return NextResponse.json({ success: true, taxRegistration });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}