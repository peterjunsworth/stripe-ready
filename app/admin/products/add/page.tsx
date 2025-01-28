export async function generateMetadata() {
    return { title: `Add Stripe Product` };
}

import ProductManager from "@/app/components/products/manager";
import { getProductById } from "@/app/api/stripe/product-management/[id]/route";
import { getProductPrices } from "@/app/api/stripe/price-management/route";
import { defaultProductData, defaultPriceData } from '@/types/interfaces';

export default async function AddProduct({ searchParams }: { searchParams: { id: string } }) {

    const id = searchParams.id;

    let productData = { ...defaultProductData };
    let priceData = [defaultPriceData];

    if (id) {
        const response = await getProductById(id);
        const data = await response.json();
        productData = {
            ...data?.product,
            default_price: null,
            metadata: {
                ...data?.product?.metadata,
                parentProduct: id
            }
        };
        delete productData.id;

        const priceResponse = await getProductPrices(id);
        const prices = await priceResponse.json();
        priceData = prices?.prices?.data
            .filter((price: any) => !price?.metadata?.deleted)
            .map(({ id, ...rest }: any) => ({
                ...rest,
                product: ''
            }));
    }
    
    return (
        <>
            <ProductManager
                title="Create Stripe Product"
                priceTitle="Product Price"
                productData={productData}
                productPrices={priceData}
            />
        </>
    );
}