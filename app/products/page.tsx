export async function generateMetadata() {
    return { title: `Stripe Products` };
}

import { Suspense } from "react";
import { SkeletonLoader } from "@/app/components/elements/skeleton-grid-loader";
import { listProducts } from "@/app/api/stripe/product-management/route";
import { Card, CardBody, CardHeader, CardFooter, Image } from "@nextui-org/react";
import { formatUnitAmountRange } from "@/app/utils/utility-methods";
import ButtonRouter from "@/app/components/elements/button-route";

export default async function Page() {

    const products: any[] = (await listProducts({})).map((product) => ({
        ...product
    }));

    const parentProducts = products
        .filter((product) => !product?.metadata?.parentProduct || product?.metadata?.parentProduct === product?.id)
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {parentProducts.map((product) => (
                            <Card 
                                key={product.id}
                                isFooterBlurred 
                                className="flex flex-col items-center"
                            >
                                <CardHeader className="p-4 flex-row items-center justify-between">
                                    <h4 className="text-black font-bold text-2xl truncate-text-single-line pr-4">{product.name}</h4>
                                    <p className="text-tiny text-black uppercase font-bold">{formatUnitAmountRange(product.prices)}</p>
                                </CardHeader>
                                <CardBody className="p-0">
                                    <Image
                                        src={product.images[0]}
                                        alt="face cream image"
                                        className="rounded-none h-full aspect-auto overflow-hidden object-cover"
                                        removeWrapper={true}
                                    />
                                </CardBody>
                                <CardFooter className="absolute bg-white/50 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
                                    <p className="font-normal text-sm leading-6 text-black truncate-text-two-lines w-2/3 pr-4">{product.description}</p>
                                    <ButtonRouter
                                        title="Learn More"
                                        path={`/products/${product.id}`}
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </Suspense>
        </div>
    );
}