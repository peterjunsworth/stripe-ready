'use client';

import { useState, useEffect, use } from 'react';
import { Button, Divider, Input, Link, Textarea, Switch, Card } from '@nextui-org/react';
import MultiAddInputField from '@/app/components/elements/multi-input';
import ImageUpload from '@/app/components/elements/image-upload';
import ProductAutocomplete from '@/app/components/elements/product-select';
import CopyParentData from '@/app/components/elements/modals/copy-parent-data';
import UpdateAllVariants from '../elements/modals/update-all-variants';
import { PriceParams, ProductFormData, defaultProductData, VariantFeature } from '@/types/interfaces';
import { findDifferences, cleanData } from '@/app/utils/utility-methods';
import { useToast } from "@/app/components/elements/toast-container";

export default function ProductForm({ 
    title,
    productData,
    productId,
    setProductId,
    setUpdatedProductPrices,
    hasVariants,
    parentPrices,
    setParentPrices
}: { 
    title: string,
    productData?: ProductFormData,
    productId?: string,
    setProductId: Function,
    setUpdatedProductPrices: Function,
    hasVariants: boolean,
    parentPrices: PriceParams[],
    setParentPrices: Function
}) {

    const [initialProductData, setInitialProductData] = useState<ProductFormData>(productData ?? defaultProductData);
    const [formData, setFormData] = useState<ProductFormData>(productData ?? defaultProductData);
    const [isVariant, setIsVariant] = useState(productData?.metadata?.parentProduct && productData?.metadata?.parentProduct !== productData?.id ? true : false);
    const [variantSelected, setVariantSelected] = useState(null);
    const [variantFeatures, setVariantFeatures] = useState<VariantFeature[]>(
        productData?.metadata?.variant_features ? JSON.parse(productData.metadata.variant_features) : []
    );
    const [variantOptions, setVariantOptions] = useState<{ [key: string]: any[] }>(
        productData?.metadata?.variant_options ? JSON.parse(productData.metadata.variant_options) : {}
    );
    const [showUpdateVariantsModal, setShowUpdateVariantsModal] = useState(false);
    const [productDataChanges, setProductDataChanges] = useState({});

    const { showToast } = useToast();

    useEffect(() => {
        if (parentPrices.length) {
            setShowUpdateVariantsModal(true);
        }
    }, [parentPrices]);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            metadata: {
                ...prevData.metadata,
                variant_options: variantOptions,
                variant_features: variantFeatures
            }
        }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleVariantMetaDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            metadata: {
                ...prevData.metadata,
                variant_options: {
                    ...prevData.metadata.variant_options,
                    [name]: value
                }
            }
        }));
    };

    const handlePackageDimensionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            package_dimensions: {
                ...prevData.package_dimensions,
                [name]: value,
            },
        }));
    };

    const sortMetadata = () => {
        const metadata = isVariant ? {
            ...formData.metadata,
            variant_features: typeof formData.metadata.variant_features === 'string'
                ? formData.metadata.variant_features
                : JSON.stringify(formData.metadata.variant_features),
            variant_options: typeof formData.metadata.variant_options === 'string'
                ? formData.metadata.variant_options
                : JSON.stringify(formData.metadata.variant_options)
        } : {
            ...formData.metadata,
            variant_features: typeof formData.metadata.variant_features === 'string'
                ? formData.metadata.variant_features
                : JSON.stringify(formData.metadata.variant_features)
        };
        return metadata
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const metadata = sortMetadata();
        const productData = cleanData(formData, defaultProductData);
        const newProduct = !productId;
        const url = !newProduct ? `/api/stripe/product-management/${productId}` : '/api/stripe/product-management';
        const response = await fetch(url, {
            method: productId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...productData,
                metadata
            }),
        });
        if (response.ok) {
            console.log('Product created successfully');
            const data = await response.json();
            setProductId(data?.product?.id);
            const changes = findDifferences({
                ...productData,
                metadata
            }, initialProductData)
            setProductDataChanges(changes);
            if(Object.keys(changes).length > 0) {
                setShowUpdateVariantsModal(true);
            }
            setInitialProductData(data?.product);
        } else {
            console.log('Error creating product');
        }
        showToast(newProduct 
            ?   `${isVariant ? "Variant" : "Product"} Created! Now Create a Price!`
            :   `${isVariant ? "Variant" : "Product"} Updated!`);
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <UpdateAllVariants
                parentProductId={productData?.id ?? ''}
                productDataChanges={productDataChanges}
                priceDataChanges={parentPrices}
                showUpdateVariantsModal={showUpdateVariantsModal && hasVariants}
                setShowUpdateVariantsModal={setShowUpdateVariantsModal}
                setParentPrices={setParentPrices}
                setProductDataChanges={setProductDataChanges}
            />
            <div className="flex justify-center">
                <Card aria-labelledby="create-product-form" className="w-full max-w-xl p-6">
                    <h2 className="text-2xl font-interMedium mb-6">{title}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Switch
                                isSelected={formData.active}
                                name="active"
                                defaultSelected={true}
                                onChange={() => setFormData((prevData) => ({ ...prevData, active: !prevData.active }))}
                            >
                                Product is Active
                            </Switch>
                            {!hasVariants && (
                                <Switch
                                    className='ml-4'
                                    isSelected={isVariant}
                                    name="active"
                                    defaultSelected={false}
                                    onChange={() => {
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            metadata: {},
                                        }));
                                        setIsVariant(!isVariant)
                                    }}
                                >
                                    Product is a Variant
                                </Switch>
                            )}
                            {isVariant && (
                                <>
                                    {productData?.id !== productData?.metadata?.parentProduct && (
                                        <Link
                                            href={`/products/${productData?.metadata?.parentProduct}`}
                                        >
                                            View Parent Product
                                        </Link>
                                    )}
                                    <ProductAutocomplete
                                        productId={productData?.id ?? ''}
                                        setFormData={setFormData}
                                        setVariantSelected={setVariantSelected}
                                    />
                                </>
                            )}
                            <CopyParentData
                                selectedVariant={variantSelected}
                                setSelectedVariant={setVariantSelected}
                                setVariantFeatures={setVariantFeatures}
                                formData={formData}
                                setFormData={setFormData}
                                setUpdatedProductPrices={setUpdatedProductPrices}
                            />
                            <Input
                                fullWidth
                                label={isVariant ? "Variant Name" : "Product Name"}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full"
                                isRequired={true}
                            />
                            <Textarea
                                fullWidth
                                label={isVariant ? "Variant Description" : "Product Description"}
                                name="description"
                                value={formData.description ?? ''}
                                onChange={handleChange}
                                className="w-full"
                                isRequired={true}
                            />
                            <Input
                                fullWidth
                                label="Statement Descriptor"
                                name="statement_descriptor"
                                value={formData.statement_descriptor}
                                onChange={handleChange}
                                className="w-full"
                                maxLength={22}
                            />
                            <Divider className="!my-8" />
                            <h3>Marketing Features</h3>
                            <MultiAddInputField
                                items={formData.marketing_features}
                                fieldName="marketing_features"
                                fieldLabel="Product Feature"
                                setFormData={setFormData}
                            />
                            <Divider className="!my-8" />
                            <ImageUpload
                                imageUrls={formData.images}
                                setFormData={setFormData}
                            />
                            <Divider className="!my-8" />
                            <Switch
                                checked={formData.shippable}
                                name="shippable"
                                defaultSelected={true}
                                onChange={() => setFormData((prevData) => ({ ...prevData, shippable: !prevData.shippable }))}
                            >
                                Shippable
                            </Switch>
                            <div className="space-y-2">
                                <Input
                                    type='number'
                                    fullWidth
                                    label="Width (in inches)"
                                    name="width"
                                    value={`${formData?.package_dimensions?.width}`}
                                    onChange={handlePackageDimensionsChange}
                                    className="w-full"
                                />
                                <Input
                                    type='number'
                                    fullWidth
                                    label="Height (in inches)"
                                    name="height"
                                    value={`${formData?.package_dimensions?.height}`}
                                    onChange={handlePackageDimensionsChange}
                                    className="w-full"
                                />
                                <Input
                                    type='number'
                                    fullWidth
                                    label="Length (in inches)"
                                    name="length"
                                    value={`${formData?.package_dimensions?.length}`}
                                    onChange={handlePackageDimensionsChange}
                                    className="w-full"
                                />
                                <Input
                                    type='number'
                                    fullWidth
                                    label="Weight (in ounces)"
                                    name="weight"
                                    value={`${formData?.package_dimensions?.weight}`}
                                    onChange={handlePackageDimensionsChange}
                                    className="w-full"
                                />
                            </div>
                            {!isVariant ?
                                <>
                                    <Divider className="!my-8" />
                                    <h3>Variant Categories</h3>
                                    <MultiAddInputField
                                        items={variantFeatures ?? []}
                                        fieldName="metadata.variant_features"
                                        fieldLabel="Variant Option (e.g. Color or Size)"
                                        setFormData={setFormData}
                                    />
                                </>
                                :
                                <>
                                    <Divider className="!my-8" />
                                    <h3>Variant Options</h3>
                                    <p className='text-sm'>These values will be provided to the customer as options when viewing the parent product</p>
                                    {variantFeatures.map((item, index) => (
                                        <Input
                                            key={index}
                                            fullWidth
                                            label={item.name} // Use the `name` property of the object
                                            name={item.name} // Use the `name` property of the object
                                            value={formData?.metadata?.variant_options?.[item.name] || ''} // Ensure `value` is a string or default to an empty string
                                            onChange={handleVariantMetaDataChange}
                                            className="w-full"
                                        />
                                    ))}

                                </>
                            }
                            <Button 
                                type="submit" 
                                className="w-full mt-4"
                                color='primary'
                            >
                                {productId ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
}
