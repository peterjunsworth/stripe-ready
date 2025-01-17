"use client";

import React, { use, useEffect, useState } from "react";
import { ProductParams, PriceParams } from "@/types/interfaces";
import { Button, Select, SelectItem } from "@nextui-org/react";
import ButtonRouter from "@/app/components/elements/button-route";
import { e } from "vitest/dist/reporters-OH1c16Kq.js";

export default function ({ 
    product, 
    productVariants,
    cheapestNonRecurring
}: { 
    product: ProductParams, 
    productVariants: ProductParams[],
    cheapestNonRecurring: PriceParams
}) {

    console.log(productVariants);

    const [selectedImage, setSelectedImage] = useState(product.images[0]);
    const [variantFeatures, setVariantFeatures] = useState<ProductParams[]>(product.metadata.variant_features ? JSON.parse(product.metadata.variant_features) : []);
    const [variantOptions, setVariantOptions] = useState<{ [key: string]: any[] }>({});
    const [selectedVariant, setSelectedVariant] = useState({});
    const [canAddToCart, setCanAddToCart] = useState<boolean>(!productVariants.length && Boolean(product?.default_price?.id || cheapestNonRecurring?.id));
    const [cart, setCart] = useState<PriceParams[]>([]);

    useEffect(() => {
        const storedValue = localStorage.getItem('stripe-ready-cart') || '[]';
        const parsedCart = JSON.parse(storedValue);
        setCart(parsedCart);
    }, []);

    useEffect(() => {
        const productOptions = variantFeatures.reduce((acc: Record<string, any>, item) => {
            if (item.name) {
                acc[item.name] = [];
            }
            productVariants.map((variant) => {
                if (variant.metadata.variant_options) {
                    const optionValue = JSON.parse(variant.metadata.variant_options)[item.name];
                    if (!acc[item.name].includes(optionValue)) {
                        acc[item.name].push(optionValue);
                    }
                }
            })
            return acc;
        }, {});
        setVariantOptions(productOptions);
    }, [variantFeatures]);

    const matchingVariants = (variantOptions: { [key: string]: any }) => {
        const variants = productVariants.filter((variant) => {
            if (variant.metadata.variant_options) {
                const options = JSON.parse(variant.metadata.variant_options);
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
            [optionValues[0]]: optionValues[1]
        }
        setSelectedVariant(variantOptions)
        const matches = matchingVariants(variantOptions);
        matches.length === 1 ? setCanAddToCart(true) : setCanAddToCart(false);
    };

    const addVariantToCart = () => {
        let updatedCart = [...cart];
        const variants = matchingVariants(selectedVariant);
        if (variants[0]?.default_price?.id) {
            updatedCart = [...cart, { ...variants[0]?.default_price } as PriceParams];
        } else {
            const cheapestPrice = variants[0]?.prices?.filter((price: PriceParams) => price.type === 'one_time')?.reduce((min: PriceParams, price: PriceParams) => (price.unit_amount ?? 0 < (min.unit_amount ?? 0) ? price : min));
            updatedCart = [...cart, { ...cheapestPrice } as PriceParams];
        }
        return updatedCart
    }

    const addProductToCart = () => {
        let updatedCart = [...cart];
        if (product.default_price?.id) {
            updatedCart = [...cart, { ...product.default_price } as PriceParams];
        } else {
            updatedCart = [...cart, { ...cheapestNonRecurring } as PriceParams];
        }
        return updatedCart
    }


    const addToCart = async () => {
        let updatedCart = [...cart];
        if (productVariants.length) {
            updatedCart = addVariantToCart();
        } else {
            updatedCart = addProductToCart();
        }
        const uniqueCart = updatedCart.filter((item, index, self) => self.findIndex((obj) => obj.id === item.id) === index);
        setCart(uniqueCart);
        localStorage.setItem('stripe-ready-cart', JSON.stringify(uniqueCart));
    };

    return (
        <>
            <div className="flex items-center justify-between items-center mb-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    {product?.default_price?.unit_amount ?
                        <p>${(product?.default_price?.unit_amount / 100).toFixed(2)}</p>
                        :
                        <>
                            {cheapestNonRecurring?.unit_amount && (
                                <p>${(cheapestNonRecurring?.unit_amount / 100).toFixed(2)}</p>
                            )}
                        </>
                    }
                </div>
                <div className="flex gap-4">
                    <Button
                        color="primary"
                        size="md"
                        isDisabled={!canAddToCart}
                        onClick={addToCart}
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
            <div className="flex gap-16 mt-8">
                <div>
                    <div className="flex space-x-4">
                        <div className="flex flex-col space-y-4">
                            {product.images.map((image, index) => (
                                <div className="cursor-pointer" onClick={() => setSelectedImage(image)} key={index}>
                                    <img src={image} alt={`Product Image ${index + 1}`} className="max-w-[75px] object-cover rounded-md" />
                                </div>
                            ))}
                        </div>
                        <img src={selectedImage} alt={`Product Image`} className="max-w-[500px] object-cover rounded-md" />
                    </div>
                </div>
                <div className="border-l-1 pl-4 w-3/4">
                    <div className="p-2">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                    </div>

                    <div className="p-2">
                        <p>{product.description || "No description available."}</p>
                    </div>

                    {/* <div className="p-2">
                        <h4 className="font-bold text-lg">Package Dimensions</h4>
                        <p>
                            Height: {product.package_dimensions.height} cm
                            <br />
                            Length: {product.package_dimensions.length} cm
                            <br />
                            Width: {product.package_dimensions.width} cm
                            <br />
                            Weight: {product.package_dimensions.weight} kg
                        </p>
                    </div> */}

                    <div className="p-2">
                        <h4 className="font-bold text-lg">Marketing Features</h4>
                        <ul className="list-disc pl-6">
                            {product.marketing_features.map((feature, index) => (
                                <li key={index}>{typeof feature === 'object' ? feature.name : feature}</li>
                            ))}
                        </ul>
                    </div>

                    {!product.shippable && (
                        <p>This product is not shippable.</p>
                    )}

                    {/* <div className="p-2">
                        <h4 className="font-bold text-lg">Statement Descriptor</h4>
                        <p>{product.statement_descriptor}</p>
                    </div> */}

                    {productVariants.length > 0 && (
                        <>
                            <h3 className="mt-2">Product Options:</h3>
                            {variantFeatures.map((feature, index) => (
                                <div className="p-2" key={index}>
                                    {variantOptions[feature.name] && (
                                        <Select
                                            className="max-w-xs"
                                            label={`Select ${feature.name}`}
                                            onChange={handleChange}
                                        >
                                            {variantOptions[feature.name].map((option, index) => (
                                                <SelectItem
                                                    key={`${feature.name}:${option}`}
                                                    value={option}
                                                >
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
