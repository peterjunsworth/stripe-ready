"use client";

import React, { useState, useEffect } from "react";
import { CartParams, PriceParams } from "@/types/interfaces";
import ButtonRouter from "@/app/components/elements/button-route";
import { Button, Divider, Spinner } from "@nextui-org/react";
import CartItem from "@/app/components/checkout/cart-item";
import { CartSkeleton } from "@/app/components/elements/skeleton-cart-loader";
import { useToast } from "../elements/toast-container";

const CartManager = () => {

    const [cart, setCart] = useState<CartParams[]>([]);
    const [canCheckout, setCanCheckout] = useState<boolean>(true);
    const [Subtotal, setSubtotal] = useState<number>(0);
    const [shipping, setShipping] = useState<number>(0);
    const [shippingRateId, setShippingRateId] = useState<string>('');
    const [shippingSet, setShippingSet] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

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
        setLoading(false);
    }, []);

    const getCombinedProductWeight = async() => {
        const ids = cart
            .map(item => typeof item.product === 'object' ? item.product.id : item.product) // Handle object or string
            .join(',');
        if (!ids) return;
        const response = await fetch(`/api/stripe/product-management/combined-weight?ids=${ids}`);
        const data = await response.json();
        const shippingType = process.env.NEXT_PUBLIC_SHIPPING_TYPE ?? 'WEIGHT_BASED';
        const displayName = shippingType === 'WEIGHT_BASED' ? 'Weight Based Shipping' : 'Cost Based Shipping';
        const shippingRatesData = await fetch(`/api/stripe/shipping-management?weight=${data.totalWeight}&type=${displayName}`);
        const shippingRates = await shippingRatesData.json();
        if (!shippingRates.shippingRates || shippingRates.shippingRates.length === 0) {
            setShipping(0);
            setShippingRateId('');
            setShippingSet(true);
            return;
        }
        setShipping(shippingRates.shippingRates[0].fixed_amount.amount);
        setShippingRateId(shippingRates.shippingRates[0].id);
        setShippingSet(true);
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
            window.location.href = data.session.url;
        } else {
            let toastDisplayed = false;
            for await (const item of cart) {
                const price = await fetch(`/api/stripe/price-management/${item?.id}`);
                const priceData = await price.json();
                if (!priceData?.price?.active) {
                    const product = await fetch(`/api/stripe/product-management/${priceData?.price?.product}`);
                    const productData = await product.json();
                    showToast(`${productData?.product?.name} is no longer available. Please remove it from your cart.`, 'bg-red-500');
                    toastDisplayed = true;
                    break;
                }

            }
            if (!toastDisplayed) {
                showToast(data.error, 'bg-red-500');
            }
            console.error(data.error);
        }
    };

    return (
        <div className="md:flex md:gap-4 w-full">
            {loading ?
                <Spinner className="m-auto" aria-label="Loading..." size="md" />
                :
                <>
                    <div className="w-2/3 bg-gray-100 p-4 rounded-md">
                        <h2 className="text-2xl font-bold text-gray-800">Cart</h2>
                        <Divider className="my-4" />
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-800">
                                <p className="text-lg font-bold mb-2">Your cart is empty</p>
                                <p className="text-sm">Start shopping to add items to your cart.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <CartItem 
                                        key={item.id} 
                                        price={item} 
                                        cart={cart} 
                                        setCart={setCart} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="w-1/3 bg-gray-100 rounded-md p-4 md:sticky top-0">
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
                            <li className="flex flex-wrap gap-4 text-base">Shipping <span className="ml-auto font-bold">{shippingSet ? `$${(shipping / 100).toFixed(2)}` : 'Calculating...'}</span></li>
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
                </>
            }
        </div>
    );
};

export default CartManager;
