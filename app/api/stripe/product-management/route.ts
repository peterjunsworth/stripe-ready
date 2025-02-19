import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ProductParams, ProductTableProps } from '@/types/interfaces';
import { getProductPrices } from '../price-management/route';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Create a Product and Price
export async function createProduct(productParams: ProductParams) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        delete (productParams as any).shipping_requirements;  
        delete (productParams as any).tax_code;        // Create the product using Stripe's API
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
                    const hasActive = prices.data.find((price: { active: boolean }) => price.active === true);
                    return {
                        ...product,
                        prices: success && hasActive ? prices.data : [], // Add prices if successfully fetched
                    };
                } catch (error) {
                    console.error('Error retrieving products or prices:', (error as Error).message);
                    throw error;
                }
            })
        );
        return enhancedProducts.filter((product) => product !== null);
    } catch (error: any) {
        console.error('Error retrieving products or prices:', error.message);
        throw error;
    }
}

// POST request to create PaymentIntent
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query');
        const isSearch = url.searchParams.get('isSearch');
        if (query) {
            const stripeProducts = await stripe.products.search({
                limit: 100,
                query: `name~'${query}' OR description~'${query}'`
            });
            if (isSearch) {
                return Response.json({ success: true, products: stripeProducts.data.filter((product) => product.active)});
            }
            if (!isSearch) {
                const products = stripeProducts.data
                    .filter((product) => product.active && !product.metadata?.parentProduct)
                    .map((product) => ({
                        id: product.id,
                        name: product.name,
                    }));
                return Response.json({ products });
            }
        } 
        if (!query) {
            const stripeProducts = await stripe.products.list({limit: 100});
            return Response.json({ success: true, products: stripeProducts.data
                .filter((product) => product.active && !product.metadata?.parentProduct)});
        }
    } catch (error: any) {
        console.error('Error fetching products from Stripe:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

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
        const response = await createProduct({
            ...productData,
            images: updatedImages,
        });
        
        const product = response instanceof Response ? await response.json() : response;
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