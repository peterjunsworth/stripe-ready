import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ProductParams } from '@/types/interfaces';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getProductById(id: string) {
    try {
        const product = await stripe.products.retrieve(id, {
            expand: ['default_price'], // Expands the associated prices in the response
        });
        console.log(product);
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Error creating product:', error.message);
        throw error;
    }
}

export async function updateProduct(productId: string, productData: Partial<ProductParams>) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const updatedProductData = {
            ...productData,
            default_price: productData.default_price?.id ?? undefined,
        };

        if (!updatedProductData.default_price) delete updatedProductData.default_price

        const product = await stripe.products.update(productId, {
            ...updatedProductData
        });

        return { success: true, product  };
    } catch (error: any) {
        console.error('Error updating price:', error.message);
        throw new Error(error.message);
    }
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

        // Fetch the product from Stripe
        const product = await getProductById(id);
        const data = await product.json();
        // Return the created product data
        return NextResponse.json({ ...data });
    } catch (error: any) {
        console.error('Error fetching product from Stripe:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        // Parse the incoming JSON request body
        const productData = await req.json();
        const productImages = productData.images || [];
        // Update image URLs with the base URL
        const updatedImages = productImages.map((imageUrl: string) => {
            // Check if the image URL already contains a hostname
            const hasHost = /^https?:\/\//i.test(imageUrl);
            // If the image URL doesn't contain a hostname, prepend the base URL
            return hasHost ? imageUrl : `${process.env.NEXT_PUBLIC_BASE_URL}${imageUrl}`;
        });
        const body = updatedImages.length ? { ...productData, images: updatedImages } : productData;
        // Update the product using the Stripe API
        const response = await updateProduct(id, {
            ...body
        });
        const product = response instanceof Response ? await response.json() : response;
        return NextResponse.json({ success: true, product: product?.product });
    } catch (error: any) {
        console.error('Error updating product in Stripe:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Extract the priceId from the request URL
        const { id } = await params;

        // Validate priceId
        if (!id) {
            return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 });
        }
        // Attempt to deactivate the price via Stripe API
        const deletedProduct = await updateProduct(id, {
            active: false,
            metadata: {
                deleted: true
            }
        });
        return NextResponse.json({ success: true, product: deletedProduct });
    } catch (error: any) {
        console.error('Error handling DELETE request:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}