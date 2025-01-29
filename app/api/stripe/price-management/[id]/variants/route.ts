import { NextRequest, NextResponse } from 'next/server';
import { updatePrice } from '@/app/api/stripe/price-management/[id]/route';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        await updatePrice(id, {
            active: false,
            metadata: {
                deleted: true
            }
        });

        // Return the created price data
        return NextResponse.json({ success: true, message: "Successfully deleted price" }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching products from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}