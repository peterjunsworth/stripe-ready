import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProductPrices } from '@/app/api/stripe/price-management/route';

export const getProductVariants = async (productId: string) => {
    const searchQuery = `metadata['parentProduct']:'${productId}' AND -metadata['deleted']:'true'`;

    const products = await stripe.products.search({
        query: searchQuery,
        limit: 100,  // Adjust the number of results as needed
    });
    const enhancedProducts = await Promise.all(
        products.data.map(async (product: any) => {
            try {
                const response = await getProductPrices(product.id);
                const data = await response.json();
                const { success, prices } = data;
                return {
                    ...product,
                    prices: success ? prices.data : [], // Add prices if successfully fetched
                };
            } catch (error) {
                console.error('Error retrieving products or prices:', (error as Error).message);
                throw error;
            }
        })
    );

    return enhancedProducts || [];
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // Extract the ID from the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        const products = await getProductVariants(id);

        // Return the products as a JSON response
        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error('Error fetching products from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}