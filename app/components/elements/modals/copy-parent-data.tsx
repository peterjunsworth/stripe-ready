'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { defaultProductData, defaultPriceData } from '@/types/interfaces';
import { intersectObjects } from '@/app/utils/utility-methods';

export default function CopyParentData({
    selectedVariant,
    setSelectedVariant,
    setVariantFeatures,
    formData,
    setFormData,
    setUpdatedProductPrices
}: {
    selectedVariant: any,
    setSelectedVariant: Function,
    setVariantFeatures: Function,
    formData: any,
    setFormData: Function,
    setUpdatedProductPrices: Function
}) {

    async function fetchProductPrices(productId: string) {
        try {
            const response = await fetch(`/api/stripe/price-management?productId=${productId}`);
            const data = await response.json();
            const prices = data?.prices?.data.map((price: any) => intersectObjects(price, defaultPriceData))
            setUpdatedProductPrices(prices);
            
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    async function fetchProduct(productId: string) {
        try {
            const response = await fetch(`/api/stripe/product-management/${productId}`);
            const data = await response.json();

            if (data.product?.metadata?.variant_features) {
                const variantFeatures = JSON.parse(data.product.metadata.variant_features);
                setVariantFeatures(variantFeatures);
            }

            const intersected = intersectObjects(data.product, defaultProductData);
            setFormData((prevData: any) => ({
                ...prevData,
                ...intersected
            }));
            setSelectedVariant(null);
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }

    return (
        <>
            <Modal 
                isOpen={selectedVariant !== null}
                hideCloseButton={true}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Copy Parent Data?</ModalHeader>
                    <ModalBody>
                        <p>
                            Would you like this product variant to inherit the parent product data?
                        </p>
                        <p>
                            You will still be able to modify this data after selecting this option.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setSelectedVariant(null)}>
                            No, Ignore
                        </Button>
                        <Button color="primary" onPress={() => {
                            fetchProduct(selectedVariant);
                            fetchProductPrices(selectedVariant);
                        }}>
                            Yes, Copy Data
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
