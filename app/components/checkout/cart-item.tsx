"use client";

import React, { useState, useEffect } from "react";
import { CartParams, PriceParams, ProductParams } from "@/types/interfaces";
import { Divider, Image, Input, Select, SelectItem } from "@nextui-org/react";
import { cheapestNonRecurring } from "@/app/utils/utility-methods";

const CartItem = ({ 
    price,
    cart,
    setCart
}: { 
    price: PriceParams,
    cart: CartParams[],
    setCart: Function
}) => {

    const [currentCart, setCurrentCart] = useState<CartParams[]>(cart);
    const [item, setItem] = useState<PriceParams>(price);
    const [canRender, setCanRender] = useState<boolean>(false);
    const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: any }>({});
    const [numMatches, setNumMatches] = useState<number>(1);

    useEffect(() => {
        setCurrentCart(cart);
    }, [cart]);

    const parseMetadata = (metadata: any) => {
        return {
            ...metadata,
            variant_features: metadata.variant_features 
                ? typeof metadata.variant_features === 'string' 
                    ? JSON.parse(metadata.variant_features) 
                    : metadata.variant_features 
                : [],
            variant_options: metadata.variant_options
                ? typeof metadata.variant_options === 'string' 
                    ? JSON.parse(metadata.variant_options) 
                    : metadata.variant_options 
                : {}
        }
    }

    const productOptions = (variants: ProductParams[]) => {
        if (!variants.length) return [];
        const items: { [key: string]: any }[] = [];
        variants.forEach((variant: any) => {
            if (variant?.metadata?.variant_options) {
                items.push(JSON.parse(variant?.metadata?.variant_options));
            }
        });
        const result = Object.keys(items[0]).reduce((acc: { [key: string]: any }, key) => {
            acc[key.toLowerCase()] = [...new Set(items.map(item => item[key]))];
            return acc;
        }, {});
        return result;
    }

    const expandProducts = async (priceItem?: PriceParams) => {
        const expandedPrice = { ...priceItem };
        if (!expandedPrice.product) return;
        if (typeof expandedPrice.product === 'string') {
            const response = await fetch(`/api/stripe/product-management/${expandedPrice.product}`);
            const data = await response.json();
            expandedPrice.product = data.product;
        }
        (expandedPrice.product as ProductParams).metadata = parseMetadata((expandedPrice.product as ProductParams).metadata);
        setSelectedVariant((expandedPrice.product as ProductParams).metadata?.variant_options || {});
        const parentProductId = (expandedPrice.product as ProductParams).metadata?.parentProduct as string || (expandedPrice.product as any)?.id;
        if (parentProductId) {
            const response = await fetch(`/api/stripe/product-management/${parentProductId}/variants`);
            const data = await response.json();
            (expandedPrice.product as ProductParams).variants = data.products
                .filter((product: any) => product.id !== parentProductId)
                .map((product: any) => {
                    const metadata = parseMetadata(product.metadata);
                    return {
                        ...product,
                        ...metadata
                    }
                });
            (expandedPrice.product as ProductParams).productOptions = productOptions((expandedPrice.product as ProductParams).variants as ProductParams[]);
        }
        expandedPrice.quantity = expandedPrice.quantity || 1;
        setItem({
            ...expandedPrice,
            unit_amount: expandedPrice.unit_amount ?? null,
            currency: expandedPrice.currency ?? '',
            product: expandedPrice.product ?? '', // Add a default value for product
        });
        setCanRender(true);
    }

    useEffect(() => {
        expandProducts(item);
    }, []);

    const removeDuplicateItems = (items: CartParams[]) => {
        const uniqueCart = items.reduce((acc: CartParams[], item: CartParams) => {
            // Check if the item already exists in the accumulator based on the id
            const existingItem = acc.find((obj) => obj.id === item.id);

            if (existingItem) {
                // If the item exists, sum the quantity
                existingItem.quantity += item.quantity;
            } else {
                // If not, add the item to the accumulator
                acc.push({ ...item });
            }

            return acc;
        }, []);
        console.log(uniqueCart);
        return uniqueCart;
    }

    const getPrices = async(productId: string) => {
        const response = await fetch(`/api/stripe/price-management?productId=${productId}`);
        const data = await response.json();
        const priceData = data?.prices?.data.filter((price: any) => !price?.metadata?.deleted);
        const cheapestNonRecurringPrice = cheapestNonRecurring(priceData);
        const quantity = item?.quantity || 1;
        const productUpdate = { 
            ...cheapestNonRecurringPrice,
            available: true,
            quantity 
        };
        setItem(productUpdate);
        expandProducts(productUpdate);
        const updatedCart = currentCart.map((cartPrice) => {
            if (cartPrice.id === item?.id) {
                return productUpdate
            }
            return cartPrice;
        })
        const uniqueCart = removeDuplicateItems(updatedCart);
        setCart(uniqueCart);
        localStorage.setItem('stripe-ready-cart', JSON.stringify(uniqueCart));
    }

    const setCase = (feature: string) => {
        return feature.charAt(0).toUpperCase() + feature.slice(1).toLowerCase()
    };

    const matchingVariants = (variantOptions: { [key: string]: any }) => {
        const variants = (item.product as ProductParams)?.variants?.filter((variant) => {
            if (variant.metadata.variant_options) {
                const options = typeof variant.metadata.variant_options === 'string' ? JSON.parse(variant.metadata.variant_options) : variant.metadata.variant_options;
                return Object.entries(variantOptions).every(([key, value]) => options[key] === value);
            }
            return false;
        });
        return variants;
    }

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const optionValues = event.target.value.split(':');
        if (!optionValues[0] || !optionValues[1] || !optionValues[0].length || !optionValues[1].length) return;
        const variantOptions = {
            ...selectedVariant,
            [setCase(optionValues[0])]: optionValues[1]
        }
        setSelectedVariant(variantOptions)
        const matches = matchingVariants(variantOptions);
        setNumMatches(matches?.length || 0);
        if (matches?.length === 1) {
            setCanRender(false);
            getPrices(matches[0].id);
        } else {
            const updatedCart = currentCart.map((cartPrice) => {
                if (cartPrice.id === item?.id) {
                    return {
                        ...item,
                        available: false
                    }
                }
                return cartPrice;
            })
            setCart(updatedCart);
            localStorage.setItem('stripe-ready-cart', JSON.stringify(updatedCart));
        }
    };

    const changeQuantity = (quantity: number) => {
        if (quantity < 1) return;
        setItem({ ...item, quantity })
        if (quantity) {
            const updatedCart = currentCart.map((cartPrice) => {
                if (cartPrice.id === item?.id) {
                    return {
                        ...cartPrice,
                        quantity
                    }
                }
                return cartPrice;
            })
            setCart(updatedCart);
            localStorage.setItem('stripe-ready-cart', JSON.stringify(updatedCart));
        }
    }

    const removeItemFromCart = (itemId: string) => {
        const updatedCart = currentCart.filter((item) => item.id !== itemId.toString());
        setCart(updatedCart);
        localStorage.setItem('stripe-ready-cart', JSON.stringify(updatedCart));
    };

    return (
        <>
            {canRender && (
                <div className="items-center gap-4">
                    {typeof item.product === 'object' && (
                        <>
                            <div className="flex items-top gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-4">{(item.product as ProductParams)?.name}</h3>
                                    <div className="w-48 h-[auto] shrink-0 bg-white p-2 rounded-md">
                                        <Image
                                            alt={(item.product as ProductParams)?.name}
                                            src={(item.product as ProductParams)?.images?.[0] ?? ''}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-top">
                                        <div className="flex-1 pr-8">
                                            <p className="pr-8 ml-2 mb-8">{(item.product as ProductParams)?.description}</p>
                                            {Object.keys((item.product as ProductParams)?.productOptions).length === 0 && (
                                                <p className="pr-8 ml-2 mb-8 color-gray-200 text-xs">This product does not have additional variations</p>
                                            )}
                                            {Object.keys((item.product as ProductParams)?.productOptions).map((feature: any, index: number) => (
                                                <Select
                                                    key={index}
                                                    label={feature}
                                                    name={feature}
                                                    value={`${feature}:${selectedVariant[setCase(feature)]}`}
                                                    selectedKeys={[`${feature}:${selectedVariant[setCase(feature)]}`]}
                                                    defaultSelectedKeys={[`${feature}:${selectedVariant[setCase(feature)]}`]}
                                                    onChange={handleChange}
                                                    variant="bordered"
                                                    className="min-w-full mb-2"
                                                >
                                                    {(item.product as ProductParams)?.productOptions[feature].map((option: any, index: number) => (
                                                        <SelectItem key={`${feature}:${option}`}>{option}</SelectItem>
                                                    ))}
                                                </Select>
                                            ))}
                                            <div className="pr-8 mt-4">
                                                {numMatches === 0 && (
                                                    <p className="text-red-500">No products available with the selected options</p>
                                                )}
                                                {numMatches > 1 && (
                                                    <p className="text-red-500">Refine your selection. Multiple products available with the selected options</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-800 mb-4">${((item.unit_amount ?? 0) / 100).toFixed(2)}</h4>
                                            <button type="button"
                                                className="flex items-center px-2.5 py-1.5 border border-gray-300 text-gray-800 text-xs outline-none bg-transparent rounded-md">
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-2.5 fill-current"
                                                    viewBox="0 0 124 124"
                                                    onClick={(event) => changeQuantity((item as { quantity: number }).quantity - 1)}
                                                >
                                                    <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z" data-original="#000000"></path>
                                                </svg>
                                                <Input
                                                    type="number"
                                                    name="quantity"
                                                    value={(item as { quantity: number }).quantity.toString()}
                                                    className="mx-2.5 w-12 text-center"
                                                    onChange={(event) => changeQuantity(parseInt(event.target.value))}
                                                    onBlur={(event) => {
                                                        if (!(item as { quantity: number }).quantity || (item as { quantity: number }).quantity < 1) {
                                                            changeQuantity(1);
                                                        }
                                                    }}
                                                />
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="w-2.5 fill-current" 
                                                    viewBox="0 0 42 42"
                                                    onClick={(event) => changeQuantity((item as { quantity: number }).quantity + 1)}
                                                >
                                                    <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z" data-original="#000000"></path>
                                                </svg>
                                            </button>
                                            <h6
                                                className="text-xs text-red-500 cursor-pointer mt-2"
                                                onClick={() => {
                                                    removeItemFromCart(item.id?.toString() ?? '');
                                                }}
                                            >
                                                Remove
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <Divider className="my-4" />
                </div>
            )}
        </>
    );
};

export default CartItem;
