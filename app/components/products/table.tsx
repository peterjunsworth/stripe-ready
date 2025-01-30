"use client";

import React, { useEffect, useState } from "react";
import { Button, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Link, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image, Chip } from "@nextui-org/react";
import MoreIcon from "@/app/components/icons/icon-more";
import { ProductTableProps } from "@/types/interfaces";
import { formatUnitAmountRange } from "@/app/utils/utility-methods";
import { useToast } from "@/app/components/elements/toast-container";

export default function ProductList({
    productsData,
}: {
    productsData: ProductTableProps[],
}) {

    const { showToast } = useToast();

    const parentProducts = productsData
        .filter((product) => !product?.metadata?.parentProduct || product?.metadata?.parentProduct === product?.id)
        .map((product, index) => ({
            ...product,
            index,
            active: product?.active,
        }));

    const childVariants = productsData
        .filter((product) => product?.metadata?.parentProduct && product?.metadata?.parentProduct !== product?.id)
        .map((product, index) => ({
            ...product,
            index,
            active: product?.active,
            parentProduct: product?.metadata?.parentProduct && product?.metadata?.parentProduct !== product?.id ? product?.metadata?.parentProduct : null,
        }));

    const [products, setProducts] = useState<ProductTableProps[]>(parentProducts);
    const [variants, setVariants] = useState<ProductTableProps[]>(childVariants);

    const columnSizes = (key: string) => {
        const sizes = {
            images: 50,
            name: 400,
            prices: 200,
            active: 50,
            hasVariants: 50,
            actions: 50,
        };
        if (!(key in sizes)) {
            throw new Error(`Invalid key: ${key}`);
        }
        return sizes[key as keyof typeof sizes];
    }

    const productHasVariants = (productId: string) => {
        const hasVariants = variants.find((product) => { 
            return product?.metadata?.parentProduct === productId 
        });
        return hasVariants;
    }

    const columns = [
        { name: "Image", uid: "images" },
        { name: "Title", uid: "name" },
        { name: "Price", uid: "prices"},
        { name: "Product Has Variants", uid: "hasVariants" },
        { name: "Status", uid: "active" },
        { name: "", uid: "actions" },
    ];

    const deleteProduct = async (productId: string, index: number) => {
        try {
            const response = await fetch(`/api/stripe/product-management/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProducts((prevData) => {
                    const updatedData = prevData.filter((product, i) => product?.index !== index)
                    return updatedData;
                });
                showToast('Product deleted successfully!');
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
                        {cellValue.toString()}
                    </Chip>
                );
            case "prices":
                const priceRange = formatUnitAmountRange(cellValue);
                return (
                    <p>{priceRange}</p>
                );
            case "hasVariants":
                return (
                    <Chip className="capitalize" size="sm" variant="flat">
                        {productHasVariants(product?.id) ? " Yes" : "No"}
                    </Chip>
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
        </>
    );
}
