"use client";

import React, { useEffect, useState } from "react";
import { Button, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Link, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Chip } from "@nextui-org/react";
import MoreIcon from "@/app/components/icons/icon-more";
import { ProductTableProps } from "@/types/interfaces";
import { formatUnitAmountRange } from "@/app/utils/utility-methods";
import ButtonRouter from "@/app/components/elements/button-route";

export default function VariantsList({
    productId,
    isVariant,
    setHasVariants
}: {
    productId: string,
    isVariant: boolean,
    setHasVariants: Function
}) {

    const [products, setProducts] = useState<ProductTableProps[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!productId || productId === '') return;
                const response = await fetch(`/api/stripe/product-management/${productId}/variants`);
                const data = await response.json();
                console.log(data.products);
                const products = data?.products ? data?.products.map((product: any, index: number) => ({
                    ...product,
                    index
                })) : [];
                setProducts(products);
                setHasVariants(data.products.length > 0);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [productId]);

    const columnSizes = (key: string) => {
        const sizes = {
            images: 50,
            name: 400,
            prices: 200,
            active: 50,
            actions: 50,
        };
        if (!(key in sizes)) {
            throw new Error(`Invalid key: ${key}`);
        }
        return sizes[key as keyof typeof sizes];
    }

    const columns = [
        { name: "Image", uid: "images" },
        { name: "Title", uid: "name" },
        { name: "Price", uid: "prices"},
        { name: "Status", uid: "active" },
        { name: "", uid: "actions" },
    ];

    const deleteProduct = async (productId: string, index: number) => {
        try {
            const response = await fetch(`/api/stripe/product-management/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('Product deleted successfully');
                setProducts((prevData) => {
                    const updatedData = prevData.filter((_, i) => i !== index)
                    console.log(updatedData);
                    return updatedData.map((product, i) => ({ ...product, index: i }));
                });
            } else {
                console.error('Error deleting product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const renderCell = React.useCallback((product: any, columnKey: string) => {
        const cellValue = product[columnKey];

        switch (columnKey) {
            case "name":
                return (
                    <h2 className="text-md font-bold">
                        <Link href={`/products/${product?.id}`}>{cellValue}</Link>
                    </h2>
                );
            case "images":
                return (
                    <Image
                        src={cellValue[0]}
                        isZoomed
                        width={100}
                        height="auto"
                        radius="none"
                        className="rounded-lg"
                    />
                );
            case "active":
                return (
                    <Chip className="capitalize" size="sm" variant="flat">
                        {cellValue ? "Active" : "Inactive"}
                    </Chip>
                );
            case "prices":
                const priceRange = formatUnitAmountRange(cellValue);
                return (
                    <p>{priceRange}</p>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-start gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <MoreIcon />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem href={`/admin/products/${product?.id}/edit`}>Edit</DropdownItem>
                                <DropdownItem onClick={() => deleteProduct(product?.id, product?.index)}>Delete</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Product Variants</h2>
                {!isVariant && (
                    <ButtonRouter
                        path={`/admin/products/add?id=${productId}`}
                        title="Add Variant"
                    />
                )}
            </div>
            {products.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                    {isVariant ? (
                        <p className="text-gray-500">This Product is a Variant</p>
                    ) : (
                        <p className="text-gray-500">No products available.</p>   
                    )}
                </div>
            ) : (
                <Table aria-label="Products Table">
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.uid}
                                width={columnSizes(column.uid)}
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={products}>
                        {(product) => (
                            <TableRow 
                                key={product?.id}
                                className="border-b"
                            >
                                {(columnKey) => <TableCell className="py-4">{renderCell(product, columnKey as string)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
