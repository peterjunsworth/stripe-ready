export async function generateMetadata() {
  return { title: `Stripe Products` };
}

import { redirect } from 'next/navigation';
import { Suspense } from "react";
import { CircularProgress } from "@nextui-org/react";
import { listProducts } from "@/app/api/stripe/product-management/route";
import ProductTable from '@/app/components/products/table';
import ButtonRouter from "@/app/components/elements/button-route";

export default async function Page() {

  const products: any[] = (await listProducts({})).map((product) => ({
    ...product
  }));

  async function handleNavigation() {
    redirect('/admin/products/add'); // Replace with your target route
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">Stripe Products</h1>
        <ButtonRouter
          path="/admin/products/add"
          title="Add Product"
        />
      </div>
      <Suspense fallback={<CircularProgress aria-label="Loading..." />}>
        <ProductTable
          productsData={products}
        />
      </Suspense>
    </div>
  );
}