import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const { taxRate } = await req.json();
        const { active_from, expires_at } = taxRate;
        let updateObject: any = {};
        if (active_from) updateObject.active_from = active_from;
        if (expires_at) updateObject.expires_at = expires_at;
        const updateRate = await stripe.tax.registrations.update(id, updateObject);
        return NextResponse.json({ success: true, taxRate: updateRate });
    } catch (error) {
        console.error('Error creating shipping rates:', error);
        return NextResponse.json({ success: false, status: 500, error });
    }
}