import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// POST request to create PaymentIntent
export async function POST(req: NextRequest) {
    try {
        const { cart, shippingRateId } = await req.json();
        const line_items = cart.map((item: any) => ({
            price: item.id, // Use the price ID from the cart item
            quantity: item.quantity, // Use the quantity from the cart item
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment', // or 'subscription' if you are handling subscriptions
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation`, // Redirect URL after successful payment
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`, // Redirect URL if payment is canceled
            automatic_tax: { enabled: true },
            shipping_options: [
                {
                    shipping_rate: shippingRateId
                }
            ]
        });
        return NextResponse.json({ success: true, session });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
