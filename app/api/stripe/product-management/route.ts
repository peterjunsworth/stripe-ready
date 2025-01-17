import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ProductParams, ProductTableProps } from '@/types/interfaces';
import { getProductPrices } from '../price-management/route';

// Create a Product and Price
export async function createProduct(productParams: ProductParams) {
    try {
        delete (productParams as any).shipping_requirements;        // Create the product using Stripe's API
        const product = await stripe.products.create({
            ...productParams,
            description: productParams.description ?? undefined,
        });

        return { product };
    } catch (error: any) {
        console.error('Error creating product:', error.message);
        throw error;
    }
}

// List all Products
export async function listProducts({ id }: { id?: string }) {
    try {
        // Prepare configuration for Stripe products list call
        const listConfig = id ? { starting_after: id } : {};
        const products = await stripe.products.list({
            ...listConfig,
            active: true, // Fetch only active products
            limit: 100,   // Limit the number of products per call
        });

        // Enhance products with prices using Promise.all for asynchronous operations
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

        return enhancedProducts;
    } catch (error: any) {
        console.error('Error retrieving products or prices:', error.message);
        throw error;
    }
}


// POST request to create PaymentIntent
export async function GET(req: NextRequest) {
    try {
        // Parse the query parameter from the request URL
        const url = new URL(req.url);
        const query = url.searchParams.get('query');

        if (!query) {
            return Response.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
        }
        const searchQuery = `name~'${query}' OR description~'${query}'`;
        //const searchQuery = `name~\'${query}\' OR description~\'${query}\'`;

        // Use the Stripe products search method
        const stripeProducts = await stripe.products.search({
            query: searchQuery,
            limit: 10,  // Adjust the number of results as needed
        });
        console.log(stripeProducts);

        // Map the Stripe product data to a simpler format
        const products = stripeProducts.data
            .filter((product) => product.active)
            .map((product) => ({
                id: product.id,
                name: product.name,
            }));

        // Return the products as a JSON response
        return Response.json({ products });
    } catch (error: any) {
        console.error('Error fetching products from Stripe:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON request body
        const productData = await req.json();

        // Validate required fields
        if (!productData.name || !productData.description) {
            return Response.json({ success: false, error: 'Name and description are required' }, { status: 400 });
        }
        console.log(`${ process.env.NEXT_PUBLIC_BASE_URL }`);
        const updatedImages = productData.images.map((imageUrl: string) => {
            // Check if the image URL already contains a hostname
            const hasHost = /^https?:\/\//i.test(imageUrl);
            // If the image URL doesn't contain a hostname, prepend the base URL
            return hasHost ? imageUrl : `${process.env.NEXT_PUBLIC_BASE_URL}${imageUrl}`;
        });

        console.log(productData);
        // Create a new product using the Stripe API
        const product = await createProduct({
            ...productData,
            images: updatedImages,
        });

        // Return the created product data
        return Response.json({
            success: true,
            product: product?.product
        });
    } catch (error: any) {
        console.error('Error creating product in Stripe:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}