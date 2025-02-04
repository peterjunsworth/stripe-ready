"use client";

import React, { useState, useEffect } from "react";
import { defaultProductData, ProductParams } from "@/types/interfaces";
import { Button, Card, CardBody, CardHeader, CardFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Image } from "@nextui-org/react";
import { cleanData, findDifferences, formatUnitAmountRange } from "@/app/utils/utility-methods";
import ButtonRouter from "@/app/components/elements/button-route";
import { useSession } from "next-auth/react";
import MoreIcon from '@/app/components/icons/icon-more';
import { useToast } from "@/app/components/elements/toast-container";
import { F } from "vitest/dist/reporters-OH1c16Kq.js";

export default function ProductCard({ 
    product,
    sortProducts
}: { 
    product: ProductParams,
    sortProducts: Function
}) {

    const [productData, setProductData] = useState<ProductParams>(product);
    const [isFeatured, setIsFeatured] = useState<boolean>(product?.metadata?.isFeatured ? JSON.parse(product?.metadata?.isFeatured) === true : false);
    const { data: session } = useSession();
    const { showToast } = useToast();

    const featureProduct = async (isFeatured: boolean) => {
        const url = `/api/stripe/product-management/${productData.id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metadata: {
                    ...productData.metadata,
                    isFeatured
                }
            }),
        });
        const data = await response.json();
        if (!data) return;
        setIsFeatured(isFeatured);
        sortProducts(productData.id, isFeatured);
        showToast('Product Featured!');
    };

    return (
        <div className={`flex flex-col items-center p-4 ${isFeatured === true ? "w-full" : "w-1/3"}`}>
            <Card
                key={productData.id}
                isFooterBlurred
                className={`bg-gray-50 rounded-none w-full`}
                shadow="sm"
            >
                <CardHeader className="p-4 flex-row items-center justify-between">
                    <h4 className="text-black font-bold text-2xl truncate-text-single-line pr-4">{productData.name}</h4>
                    <div className="flex items-center justify-end">
                        <p className="text-tiny text-black uppercase font-bold">{formatUnitAmountRange(productData.prices?.map(price => ({ unit_amount: price.unit_amount ?? 0 })) ?? [])}</p>
                        {session && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button isIconOnly variant="light" className="ml-2">
                                        <MoreIcon />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Static Actions">
                                    <DropdownItem key="new" onClick={() => featureProduct(!isFeatured)}>
                                        {isFeatured === true ? "Unfeature Product" : "Feature Product"}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    
                </CardHeader>
                <CardBody className='p-4'>
                    <div className={isFeatured === true ? "flex items-center justify-between px-8 gap-4" : ""}>
                        {isFeatured && (
                            <div className="w-1/2">
                                <p className="font-normal text-sm leading-6 text-black truncate-text-three-lines mb-4">{product.description}</p>
                                <ButtonRouter
                                    title="Learn More"
                                    path={`/products/${productData.id}`}
                                />
                            </div>
                        )}
                        <Image
                            src={productData.images[0]}
                            alt="face cream image"
                            className={`rounded-none h-full aspect-auto overflow-hidden border-1 ${isFeatured === true ? "w-1/2" : "object-cover"}`}
                            removeWrapper={true}
                        />
                    </div>
                </CardBody>
                {!isFeatured && (
                    <CardFooter className=" bg-white/50 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
                        <p className="font-normal text-sm leading-6 text-black truncate-text-two-lines w-2/3 pr-4">{product.description}</p>
                        <ButtonRouter
                            title="Learn More"
                            path={`/products/${productData.id}`}
                        />
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}