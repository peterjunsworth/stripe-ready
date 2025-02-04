"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/app/components/products/product-card";
import { ProductParams } from "@/types/interfaces";
import { SessionProvider } from "next-auth/react";
import { Spinner } from "@nextui-org/react";

export default function ProductGrid({ 
    parentProducts,
    session
}: { 
    parentProducts: ProductParams[],
    session: any
}) {

    const [sortedPrioducts, setSortedProducts] = useState<ProductParams[]>(parentProducts);
    const [loading, setLoading] = useState(true);

    const sortProducts = (productId?: string, isFeatured?: boolean) => {
        setLoading(true);
        const productsList = [...parentProducts]
            .map((product) => (product.id === productId ? 
                { 
                    ...product,
                    metadata: {
                        ...product.metadata,
                        isFeatured: Boolean(isFeatured === true ?? false)
                    } 
                } : 
                {
                    ...product,
                    metadata: {
                        ...product.metadata,
                        isFeatured: Boolean(product?.metadata?.isFeatured === true ?? false)
                    }
                }
                )
            )
            .sort((a, b) =>
                (b.metadata.isFeatured) ? 1 : -1
            ); 
        setSortedProducts(productsList);
        setLoading(false);
    };


    useEffect(() => {
        const productsList = [...parentProducts]
            .sort((a, b) => (b?.metadata?.isFeatured && JSON.parse(b.metadata.isFeatured)) ? 1 : -1
            );
        setSortedProducts(productsList);
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleSearchUpdate = (event: Event) => {
            setLoading(true);
            const query = (event as CustomEvent).detail;
            console.log(query);
            fetch(`/api/stripe/product-management?query=${query.toString()}&isSearch=true`)
                .then(response => response.json())
                .then(data => {
                    const { products } = data;
                    const productsList = [...products]
                        .sort((a, b) => (b?.metadata?.isFeatured && JSON.parse(b.metadata.isFeatured)) ? 1 : -1
                        );
                    setSortedProducts(productsList);
                })
                .catch(error => console.error("Error fetching products:", error))
                .finally(() => setLoading(false));
        };

        if (typeof window !== "undefined") {
            window.addEventListener("searchUpdated", handleSearchUpdate);
            return () => window.removeEventListener("searchUpdated", handleSearchUpdate);
        }
    }, []);

    return (
        <div className="flex flex-wrap">
            <SessionProvider session={session}>
                {loading ? 
                    <Spinner className="m-auto" aria-label="Loading..." size="md" />
                    :
                    <>
                        {sortedPrioducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                sortProducts={sortProducts}
                            />
                        ))}
                    </>
                }
            </SessionProvider>
        </div>
    );
}