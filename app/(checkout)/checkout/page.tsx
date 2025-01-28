'use client';

import { useState, useEffect } from 'react';
import { stripePromise } from '@/lib/stripeClient';
import { Elements } from '@stripe/react-stripe-js';
import { LineItem  } from '@/types/interfaces';
import CheckoutForm from '@/app/components/checkout/form';

export default function PaymentPage() {
    const [clientSecret, setClientSecret] = useState(null);

    const calculateTotalPrice = async () => {
        const storedValue = JSON.parse(localStorage.getItem('stripe-ready-cart') || '[]');
        const total = storedValue.reduce((sum: number, item: LineItem) => {
            return sum + (item.unit_amount * item.quantity);
        }, 0);
        return total;
    };

    useEffect(() => {
        const fetchClientSecret = async () => {
            const totalPrice = await calculateTotalPrice();
            const response = await fetch('/api/stripe/checkout-management', {
                method: 'POST',
                body: JSON.stringify({ amount: totalPrice }), // amount in the smallest currency unit, e.g., cents
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
        };

        fetchClientSecret();
    }, []);

    return (
        <div>
            {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} />
                </Elements>
            )}
        </div>
    );
}
