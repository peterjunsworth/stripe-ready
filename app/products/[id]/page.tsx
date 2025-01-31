// Metadata function for page title
export async function generateMetadata({ params }: { params: { id: string } }) {
    const { id } = await params;
    const response = await getProductById(id);
    const data = await response.json();
    const product = data?.product;
    return { title: `${product.name} - Product Details` };
}

import { Suspense } from "react";
import { CircularProgress } from "@nextui-org/react";
import { getProductById } from "@/app/api/stripe/product-management/[id]/route";
import { getProductVariants } from "@/app/api/stripe/product-management/[id]/variants/route";
import { getProductPrices  } from "@/app/api/stripe/price-management/route";
import ProductDetails from "@/app/components/products/product-page";
import { PriceParams } from "@/types/interfaces";
import { cheapestNonRecurring, uniqueRecurringIntervals } from '@/app/utils/utility-methods';

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params;
    const response = await getProductById(id);
    const data = await response.json();
    const product = data?.product;

    const priceResponse = await getProductPrices(id);
    const prices = await priceResponse.json();
    const priceData = prices?.prices?.data.filter((price: any) => !price?.metadata?.deleted);
    
    const cheapestNonRecurringPrice = cheapestNonRecurring(priceData);
    const uniqueRecurringIntervalsPrice = uniqueRecurringIntervals(priceData);

    const productVariants = await getProductVariants(id);
    const filteredProducts = productVariants.filter(product =>
        product.prices.some((price: { active: boolean }) => price.active === true)
    );

    return (
        <div className="p-4">
            <Suspense fallback={<CircularProgress aria-label="Loading..." />}>
                <ProductDetails
                    product={product}
                    productVariants={filteredProducts}
                    cheapestNonRecurring={cheapestNonRecurringPrice}
                    shouldHaveVariants={productVariants.length > 0}
                />
            </Suspense>
        </div>
    );
}
