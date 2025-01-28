"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/app/components/products/form";
import VariantsList from "@/app/components/products/variants/table";
import { ProductFormData, PriceParams } from '@/types/interfaces';
import PriceForm from '@/app/components/prices/form';
import { useParams } from 'next/navigation';
import { Button, Divider } from "@nextui-org/react";

export default function ProductManager({ 
    title,
    priceTitle,
    productData,
    productPrices
}: {
    title: string,
    priceTitle: string,
    productData?: ProductFormData,
    productPrices?: PriceParams[]
}) {

    const params = useParams();
    const [productId, setProductId] = useState<string | undefined>(
        (Array.isArray(params?.id) ? params.id[0] : params?.id ?? null) ?? undefined
    );
    const [updatedProductPrices, setUpdatedProductPrices] = useState<PriceParams[]>(productPrices ?? []);
    const [isVariant, setIsVariant] = useState(productData?.metadata?.parentProduct && productData?.metadata?.parentProduct !== productData?.id ? true : false);
    const [hasVariants, setHasVariants] = useState(false);
    const [parentPrices, setParentPrices] = useState<PriceParams[]>([]);

    return (
        <div className="flex items-stretch gap-4 relative">
            <div className="w-full max-w-lg h-full relative">
                <ProductForm
                    title={title}
                    productData={productData}
                    productId={productId}
                    setProductId={setProductId}
                    setUpdatedProductPrices={setUpdatedProductPrices}
                    hasVariants={hasVariants}
                    parentPrices={parentPrices}
                    setParentPrices={setParentPrices}
                />
            </div>
            <Divider
                className="h-[auto] mx-8"
                orientation="vertical"
            />
            <div className="w-full max-w-lg h-full relative">
                <PriceForm
                    title={priceTitle}
                    productId={productId}
                    productPrices={updatedProductPrices}
                    hasVariants={hasVariants}
                    setParentPrices={setParentPrices}
                    isVariant={isVariant}
                />
            </div>
            <Divider
                className="h-[auto] mx-8"
                orientation="vertical"
            />
            <div className="w-full h-full relative">
                <VariantsList
                    productId={productId ?? ''}
                    isVariant={isVariant}
                    setHasVariants={setHasVariants}
                />
            </div>
        </div>
    );
}
