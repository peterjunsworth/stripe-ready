'use client';

import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CheckoutFormProps } from '@/types/interfaces';

export default function CheckoutForm({ clientSecret }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) return;

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret, {
            payment_method: {
                card: cardElement,
            },
        }
        );

        if (error) {
            console.error(error);
        } else if (paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
                Pay
            </button>
        </form>
    );
}
