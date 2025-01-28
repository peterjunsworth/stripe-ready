export async function generateMetadata() {
    return { title: `Add Stripe Product` };
}

import ProductManager from "@/app/components/products/manager";
import { getProductById } from "@/app/api/stripe/product-management/[id]/route";
import { getProductPrices } from "@/app/api/stripe/price-management/route";
import { defaultPriceData } from '@/types/interfaces';

export default async function EditProduct({ params }: { params: { id: string } }) {

    const { id } = await params;

    const response = await getProductById(id);
    const data = await response.json();
    const productName = data?.product?.name;

    const priceResponse = await getProductPrices(id);
    const prices = await priceResponse.json();
    const priceData = prices?.prices?.data.filter((price: any) => !price?.metadata?.deleted);

    return (
        <>
            <ProductManager
                title={productName}
                priceTitle={`${productName} Price`}
                productData={data.product}
                productPrices={priceData || [defaultPriceData]}
            />
        </>
    );
}
