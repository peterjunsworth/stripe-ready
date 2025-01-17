export async function generateMetadata() {
    return { title: `Stripe Products` };
}

import { Suspense } from "react";
import { CircularProgress } from "@nextui-org/react";
import { listProducts } from "@/app/api/stripe/product-management/route";
import { Image, Link } from "@nextui-org/react";
import { formatUnitAmountRange } from "@/app/utils/utility-methods";

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
            <Suspense fallback={<CircularProgress aria-label="Loading..." />}>
                <section className="py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="font-manrope font-bold text-4xl text-black mb-8 max-lg:text-center">
                            Product list
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {parentProducts.map((product) => (
                                <Link 
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="flex-col mx-auto sm:mr-0 group cursor-pointer lg:mx-auto bg-white transition-all duration-500"
                                >
                                    <div className="w-full">
                                        <Image
                                            src={product.images[0]}
                                            alt="face cream image"
                                            className="w-full aspect-square rounded-2xl object-cover"
                                        />
                                    </div>
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between">
                                            <h2
                                                className="font-semibold text-xl leading-8 text-black transition-all duration-500 group-hover:text-indigo-600 max-w-[200px] truncate-text-single-line">
                                                {product.name}
                                            </h2>
                                            <h6 className="font-semibold text-xl leading-8 text-indigo-600">
                                                {formatUnitAmountRange(product.prices)}
                                            </h6>
                                        </div>
                                        <p className="mt-2 font-normal text-sm leading-6 text-gray-500 truncate-text-three-lines">
                                            {product.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </Suspense>
        </div>
    );
}