import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateTaxRate(taxId: string, taxData: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }
        const taxRate = await stripe.taxRates.update(taxId, {
            ...taxData
        });
        return { success: true, taxRate };
    } catch (error: any) {
        console.error('Error updating tax rate:', error.message);
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
        const taxData = await req.json();
        const response = await updateTaxRate(id, taxData);
        const taxRate = response instanceof Response ? await response.json() : response;
        return NextResponse.json({ success: true, taxRate: taxRate?.taxRate });
    } catch (error: any) {
        console.error('Error updating tax rate in Stripe:', error);
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
        // Attempt to deactivate the price via Stripe API
        const response = await updateTaxRate(id, {
            active: false,
            metadata: {
                deleted: true
            }
        });
        const deletedTaxRate = response instanceof Response ? await response.json() : response;
        return NextResponse.json({ success: true, taxRate: deletedTaxRate?.taxRate });
    } catch (error: any) {
        console.error('Error handling DELETE request:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}