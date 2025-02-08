import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateTaxRegistration(taxId: string, taxData: any) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const taxRegistration = await stripe.tax.registrations.update(taxId, {
            ...taxData
        });

        return { success: true, taxRegistration };
    } catch (error: any) {
        console.error('Error updating price:', error.message);
        throw new Error(error.message);
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }
        const { id } = await params;
        const { taxRegistration } = await req.json();
        const response = await updateTaxRegistration(id, taxRegistration);
        const taxRegistrationData = response instanceof Response ? await response.json() : response;
        return NextResponse.json({ success: true, taxRegistration: taxRegistrationData?.taxRegistration });
    } catch (error: any) {
        console.error('Error updating tax registration in Stripe:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'taxId is required' }, { status: 400 });
        }
        const response = await updateTaxRegistration(id, {
            expires_at: Math.floor(Date.now() / 1000)
        });
        const deletedTaxRegistration = response instanceof Response ? await response.json() : response;
        return NextResponse.json({ success: true, taxRegistration: deletedTaxRegistration?.taxRegistration });
    } catch (error: any) {
        console.error('Error handling DELETE request:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}