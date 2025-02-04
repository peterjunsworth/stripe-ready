export async function generateMetadata() {
    return { title: `Stripe Products` };
}

import { Suspense } from "react";
import { SkeletonLoader } from "@/app/components/elements/skeleton-grid-loader";
import { listProducts } from "@/app/api/stripe/product-management/route";
import ProductGrid from "@/app/components/products/product-grid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const products: any[] = (await listProducts({})).map((product) => ({
        ...product
    }));

    const parentProducts = products
        .filter((product) => product?.prices.length && (!product?.metadata?.parentProduct || product?.metadata?.parentProduct === product?.id))
        .map((product, index) => ({
            ...product,
            index,
            active: product?.active,
    }));

    return (
        <div className="p-4">
            <Suspense fallback={<SkeletonLoader />}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {parentProducts.length === 0 && (
                        <div className="flex flex-col items-center text-center">
                            <div className="text-xl font-bold text-gray-500">No products available...</div>
                        </div>
                    )}
                    <ProductGrid parentProducts={parentProducts} session={session} />
                </div>
            </Suspense>
        </div>
    );
}