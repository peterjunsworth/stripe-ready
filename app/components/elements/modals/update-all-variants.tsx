'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { defaultProductData, defaultPriceData, ProductParams, ProductFormData, PriceParams } from '@/types/interfaces';
import { cleanData, intersectObjects } from '@/app/utils/utility-methods';
import { useToast } from "@/app/components/elements/toast-container";

export default function UpdateAllVariants({
    parentProductId,
    productDataChanges,
    priceDataChanges,
    showUpdateVariantsModal,
    setShowUpdateVariantsModal,
    setParentPrices,
    setProductDataChanges
}: {
    parentProductId: string,
    productDataChanges: any,
    priceDataChanges: any[],
    showUpdateVariantsModal: boolean,
    setShowUpdateVariantsModal: Function,
    setParentPrices: Function,
    setProductDataChanges: Function
}) {

    const { showToast } = useToast();

    async function fetchProductPrices(productId: string) {
        try {
            const response = await fetch(`/api/stripe/price-management?productId=${productId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch prices');
            }
            const prices = data?.prices?.data.map((price: any) => ({
                ...intersectObjects(price, defaultPriceData),
                id: price.id
            }));
            return (prices);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    const deletePrice = async (priceId: string) => {
        try {
            await fetch(`/api/stripe/price-management/${priceId}/variants`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting price:', error);
        }
    }

    const saveVariantPrices = async (priceDataValues: PriceParams[]) => {
        try {
            const prices = priceDataValues.map((price: any) => {
                const cleanedPrice = intersectObjects(price, defaultPriceData)
                return {
                    ...cleanedPrice,
                    metadata: {
                        ...cleanedPrice.metadata,
                        ...price.metadata
                    }
                }
            })
            for await (const priceData of prices) {
                console.log('priceData');
                console.log(priceData);
                await fetch(`/api/stripe/price-management`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...priceData
                    }),
                });
            }
            return;
        } catch (error) {
            console.error('Error saving price:', error);
        }
    }

    const updateAllVariantPrices = async (variantPrices: PriceParams[], products: ProductParams[]) => {
        for await (const price of variantPrices) {
            await deletePrice(price.id as string);
        }
        for await (const product of products) {
            const newVariantPrices = priceDataChanges.map((price: any) => ({
                ...price,
                product: product.id
            }));
            await saveVariantPrices(newVariantPrices);
        }
        setShowUpdateVariantsModal(false);
    }

    const saveVariant = async (productId: string, productDataValues: ProductFormData) => {
        const productData = cleanData(productDataValues, defaultProductData);
        const response = await fetch(`/api/stripe/product-management/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...productData
            }),
        });
        return response;
    }

    const updateAllVariantProducts = async (products: ProductParams[]) => {
        for await (const product of products) {
            await saveVariant(product.id as string, productDataChanges);
        }
        setShowUpdateVariantsModal(false);
        showToast('Variant Products Updated!');
    }

    async function fetchProductVariants() {
        try {
            const response = await fetch(`/api/stripe/product-management/${parentProductId}/variants`);
            const data = await response.json();
            let variantPrices: PriceParams[] = [];
            if (priceDataChanges.length > 0) {
                for await (const product of data.products) {
                    const prices = await fetchProductPrices(product.id);
                    variantPrices = [...variantPrices, ...prices];
                }
            }
            if (Object.keys(productDataChanges).length > 0) updateAllVariantProducts(data.products || []);
            console.log(variantPrices);
            if (priceDataChanges.length > 0) updateAllVariantPrices(variantPrices, data.products || []);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    return (
        <>
            <Modal 
                isOpen={showUpdateVariantsModal} 
                hideCloseButton={true}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Update Product Variants?</ModalHeader>
                    <ModalBody>
                        <p>
                            Would you like to update all product variants with this new 
                            {Object.keys(productDataChanges).length > 0 ? ' Product ' : ' Price '}
                            data?
                        </p>
                        <p>
                            You will still be able to modify this data after selecting this option, however, any prior customizations will be overwritten.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => {
                            setProductDataChanges({});
                            setParentPrices([]);
                            setShowUpdateVariantsModal(false)
                        }}>
                            No, Cancel
                        </Button>
                        <Button color="primary" onPress={() => fetchProductVariants()}>
                            Yes, Update Variants
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}