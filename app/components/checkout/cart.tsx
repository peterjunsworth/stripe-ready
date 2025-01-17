"use client";

import React, { useState, useEffect } from "react";
import { CartParams, PriceParams, ProductParams } from "@/types/interfaces";
import ButtonRouter from "@/app/components/elements/button-route";
import ChevronDownIcon from "@/app/components/icons/icon-chevron-down";
import { Button, Divider,Image, Select, SelectItem } from "@nextui-org/react";
import { parse } from "path";
import CartItem from "@/app/components/checkout/cart-item";

const CartManager = () => {

    const [cart, setCart] = useState<CartParams[]>([]);
    const [canCheckout, setCanCheckout] = useState<boolean>(true);
    const [Subtotal, setSubtotal] = useState<number>(0);
    const [shipping, setShipping] = useState<number>(0);
    const [shippingRateId, setShippingRateId] = useState<string>('');

    useEffect(() => {
        setCanCheckout(cart.find((item: any) => item.available === false) ? false : true);
        const total = cart.reduce((sum: number, item: CartParams) => {
            const unitAmount = item.unit_amount ?? 0;
            return sum + (unitAmount * item.quantity);
        }, 0);
        setSubtotal(total);
        getCombinedProductWeight();
    }, [cart]);

    useEffect(() => {
        const storedValue = localStorage.getItem('stripe-ready-cart') || '[]';
        const parsedCart = JSON.parse(storedValue).map((item: PriceParams) => ({ ...item, quantity: item.quantity || 1 }));
        setCart(parsedCart);
    }, []);

    const getCombinedProductWeight = async() => {
        const ids = cart
            .map(item => typeof item.product === 'object' ? item.product.id : item.product) // Handle object or string
            .join(',');
        if (!ids) return;
        const response = await fetch(`/api/stripe/product-management/combined-weight?ids=${ids}`);
        const data = await response.json();
        const shippingRatesData = await fetch(`/api/stripe/shipping-management?weight=${data.totalWeight}`);
        const shippingRates = await shippingRatesData.json();
        setShipping(shippingRates.shippingRates[0].fixed_amount.amount);
        setShippingRateId(shippingRates.shippingRates[0].id);
    }


    const checkout = async() => {
        const response = await fetch('/api/stripe/checkout-management', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart, shippingRateId }),
        });

        const data = await response.json();

        if (data.success) {
            // Redirect to Stripe Checkout
            window.location.href = data.session.url; // Redirect to the checkout session URL
        } else {
            console.error(data.error);
            // Handle error (e.g., show a message to the user)
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gray-100 p-4 rounded-md">
                <h2 className="text-2xl font-bold text-gray-800">Cart</h2>
                <Divider className="my-4" />
                {cart.length === 0 ?
                    <div className="text-center text-gray-800">
                        <p className="text-lg font-bold mb-2">Your cart is empty</p>
                        <p className="text-sm">Start shopping to add items to your cart.</p>
                    </div>
                :
                    <div className="space-y-4">
                        {cart.map((item: CartParams, index: number) => (
                            <CartItem
                                key={item.id}
                                price={item}
                                cart={cart}
                                setCart={setCart}
                            />
                        ))}
                    </div>
                }
            </div>

            <div className="bg-gray-100 rounded-md p-4 md:sticky top-0">
                <div className="flex border border-blue-600 overflow-hidden rounded-md">
                    <input type="email" placeholder="Promo code"
                        className="w-full outline-none bg-white text-gray-600 text-sm px-4 py-2.5" />
                    <button type='button' className="flex items-center justify-center font-semibold tracking-wide bg-blue-600 hover:bg-blue-700 px-4 text-sm text-white">
                        Apply
                    </button>
                </div>

                <ul className="text-gray-800 mt-8 space-y-4">
                    <li className="flex flex-wrap gap-4 text-base">Subtotal 
                        <span className="ml-auto font-bold">
                            {Subtotal ? `$${(Subtotal / 100).toFixed(2)}` : 'Calculating...'}
                        </span></li>
                    <li className="flex flex-wrap gap-4 text-base">Shipping <span className="ml-auto font-bold">{shipping ? `$${(shipping / 100).toFixed(2)}` : 'Calculating...'}</span></li>
                    <li className="flex flex-wrap gap-4 text-base">Tax <span className="ml-auto font-bold">Calculated at Checkout</span></li>
                    <li className="flex flex-wrap gap-4 text-base font-bold">Total <span className="ml-auto">Calculated at Checkout</span></li>
                </ul>

                <div className="mt-8 space-y-2">
                    {/* <ButtonRouter
                        path="/checkout"
                        title="Checkout"
                        classes="ttext-sm px-4 py-2.5 w-full font-semibold tracking-wide bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        isDisabled={!canCheckout}
                    /> */}
                    <Button
                        className="text-sm px-4 py-2.5 w-full font-semibold tracking-wide bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        isDisabled={!canCheckout}
                        onClick={checkout}
                    >
                        Checkout
                    </Button>
                    <ButtonRouter
                        path="/products"
                        title="Continue Shopping"
                        classes="text-sm px-4 py-2.5 w-full font-semibold tracking-wide bg-transparent text-gray-800 border border-gray-300 rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default CartManager;
