'use client';

import React, { useState } from 'react';
import { Input, Autocomplete, AutocompleteItem } from '@nextui-org/react';

type Product = {
    id: string;
    name: string;
};

export default function ProductAutocomplete({
    productId,
    setFormData,
    setVariantSelected,
}: {
    productId: string;
    setFormData: Function;
    setVariantSelected: Function
}) {
    const [query, setQuery] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Handle input changes and fetch products from Stripe
    const handleInputChange = async (value: string) => {
        setQuery(value);
        setLoading(true);

        try {
            // Fetch products from Stripe API
            const response = await fetch(`/api/stripe/product-management?query=${value}`);

            const data = await response.json();
            
            if (data.products) {
                const products = data?.products.filter((product: any) => (product.id !== productId))
                setProducts(products);
            } else {
                console.error('No products found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Show loading text while fetching data */}
            {loading && <p>Loading...</p>}

            {/* Autocomplete component for showing filtered products */}
            <Autocomplete
                aria-label="Search products"
                value={query}
                placeholder="Search Parent Product"
                onInputChange={(value) => {
                    if (value.length >= 3) handleInputChange(value);
                }}
                onSelectionChange={(selectedItem) => {
                    setFormData((prevData: any) => ({
                        ...prevData,
                        "metadata": {
                            ...prevData.metadata,
                            "parentProduct": selectedItem
                        }
                    }));
                    console.log(selectedItem);
                    setVariantSelected(selectedItem);
                }}
                isLoading={loading}
            >
                {/* AutocompleteItem contains the suggestions */}
                {products.map((product) => (
                    <AutocompleteItem key={product.id} value={product.id}>
                        {product.name}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
    );
}
