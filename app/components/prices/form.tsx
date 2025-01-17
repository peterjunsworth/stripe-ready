'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem, Switch, Card, Divider, Tooltip } from '@nextui-org/react';
import { useParams } from 'next/navigation';
import { defaultPriceData, PriceParams } from '@/types/interfaces';
import { intersectObjects } from '@/app/utils/utility-methods';
import TrashIcon from '@/app/components/icons/icon-trash';
import TagIcon from '@/app/components/icons/icon-tag';

export default function PriceForm({
    title,
    productId,
    productPrices,
    hasVariants,
    setParentPrices,
    isVariant
}: {
    title: string;
    productId?: string;
    productPrices?: PriceParams[];
    hasVariants: boolean,
    setParentPrices: Function,
    isVariant: boolean
}) {

    const [activeProduct, setActiveProduct] = useState<string | undefined>(productId);
    const [pricesData, setPricesData] = useState<PriceParams[]>(
        productPrices && productPrices.length ? productPrices : [{ ...defaultPriceData, product: activeProduct ?? '' }]
    );
    const [taxBehavior, setTaxBehavior] = useState('unspecified'); // Default state for tax behavior
    const [defaultPrice, setDefaultPrice] = useState('');

    useEffect(() => {
        if (pricesData.length) {
            const priceDefault = pricesData.find((price) => {
                return (price.product && typeof price.product === 'object' && (price.product as any).default_price === price.id) 
            });
            if (priceDefault && priceDefault.id) setDefaultPrice(priceDefault.id);    
        }    
    }, []);

    useEffect(() => {
        if (productId && productId !== activeProduct) {
            setActiveProduct(productId);
            const updatedData = pricesData.map((price) => ({
                ...price,
                product: productId,
            }));
            setPricesData(updatedData);
        }
    }, [productId]);

    useEffect(() => {
        if (productPrices) {
            const prices = productPrices.length ? productPrices : [{ ...defaultPriceData, product: activeProduct ?? '' }]
            setPricesData(prices)
        }
    }, [productPrices]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        setPricesData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
                ...updatedData[index],
                [name]: name === 'unit_amount' || name === 'interval_count' ? Number(value) : value,
            };
            return updatedData;
        });
    };

    const handleRecurringChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        index: number
    ) => {
        const { name, value } = e.target;
        setPricesData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
                ...updatedData[index],
                recurring: updatedData[index].recurring
                    ? { ...updatedData[index].recurring, [name]: name === 'interval_count' ? Number(value) : value }
                    : undefined,
            };
            return updatedData;
        });
    };

    const toggleRecurring = (isChecked: boolean, index: number) => {
        setPricesData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
                ...updatedData[index],
                recurring: isChecked
                    ? { interval: 'month', interval_count: 1 }
                    : undefined,
            };
            return updatedData;
        });
    };

    const toggleDefault = async (togggledItem: number) => {
        const initialDefault = pricesData.findIndex((price) => price.id === defaultPrice);
        const newDefault = pricesData[togggledItem];
        const productId = typeof newDefault.product === 'string' ? newDefault.product : newDefault.product.id
        if (!productId) return;
        await saveProduct(productId, newDefault.id ?? '')
        setPricesData((prevData) => {
            const updatedData = [...prevData];
            updatedData[togggledItem] = {
                ...updatedData[togggledItem],
                active: true,
            };
            if (initialDefault !== -1) {
                updatedData[initialDefault] = {
                    ...updatedData[initialDefault],
                    active: false,
                }
            }
            return updatedData;
        })
        setDefaultPrice(newDefault.id ?? '');
    };

    const deletePrice = async (priceId: string, index: number) => {
        try {
            await fetch(`/api/stripe/price-management/${priceId}`, {
                method: 'DELETE',
            });
            const updatedPricesData = pricesData.map((price) => {
                if (price.id === priceId) {
                    return {
                        ...price,
                        active: false,
                        metadata: {
                            ...price.metadata,
                            deleted: true
                        }
                    };
                }
                return price;
            })
            setPricesData((prevData) => {
                const updatedData = prevData.filter((_, i) => i !== index)
                if (!updatedData.length) {
                    return [{ ...defaultPriceData, product: activeProduct ?? '' }];
                }
                return updatedData;
            });
            setParentPrices(updatedPricesData);
        } catch (error) {
            console.error('Error deleting price:', error);
        }
    };

    const saveProduct = async (activeProduct: string, priceId: string) => {
        const response = await fetch(`/api/stripe/product-management/${activeProduct}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ default_price: priceId }),
        });
        return response;
    };

    const savePrice = async (priceData: PriceParams) => {
        const intersected = {
            ...intersectObjects(priceData, defaultPriceData),
            product: activeProduct
        };
        const url = priceData?.id ? `/api/stripe/price-management/${priceData.id}` : '/api/stripe/price-management';
        const response = await fetch(url, {
            method: priceData?.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(intersected),
        });
        const data = await response.json();
        return data;
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        index: number
    ) => {
        e.preventDefault();
        const priceItemData = pricesData[index];
        const response = await savePrice(priceItemData);
        if (response.success) {
            console.log('Price saved successfully');
            priceItemData.id = response.price?.id
            priceItemData.product = {
                default_price: null
            }
            const updatedArr = pricesData.map((value, i) =>
                i === index ? priceItemData : value
            );
            setPricesData(updatedArr);
            if (hasVariants) {
                setParentPrices(pricesData);
            }
        } else {
            console.log('Error saving price');
        }
    };

    return (
        <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Product Prices</h2>
                <Button
                    color="primary"
                    size="sm"
                    onClick={() => setPricesData((prevData) => [{ ...defaultPriceData, product: activeProduct ?? '' }, ...prevData])}
                >
                    Add Price
                </Button>
            </div>
            {pricesData?.map((price: PriceParams, index) => (
                <Card 
                    aria-labelledby="price-form"
                    className="w-full max-w-xl p-6 mb-4"
                    key={index}
                >
                    {price.id !== defaultPrice && pricesData.length > 1 && (
                        <div 
                            className="absolute top-4 right-4"
                            onClick={() => deletePrice(price.id ?? '', index)}
                        >
                            <TrashIcon />
                        </div>
                    )}
                    {price.id === defaultPrice && (
                        <Tooltip content="Default Product Price">
                            <div
                                className="absolute top-4 right-4"
                            >
                                <TagIcon />
                            </div>
                        </Tooltip>
                    )}
                    <h2 className="text-2xl font-semibold mb-6">{price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : title}</h2>
                    <form onSubmit={(e) => handleSubmit(e, index)}>
                        <div className="space-y-4">
                            <Switch
                                checked={price.active}
                                defaultSelected={price.active}
                                name="active"
                                onChange={() =>
                                    setPricesData((prevData) => {
                                        const updatedData = [...prevData];
                                        updatedData[index] = {
                                            ...updatedData[index],
                                            active: !updatedData[index].active,
                                        };
                                        return updatedData;
                                    })
                                }
                            >
                                Active
                            </Switch>
                            <Switch
                                className="ml-4"
                                checked={!!price.recurring}
                                defaultSelected={!!price.recurring}
                                onChange={(event) => toggleRecurring(event.target.checked, index)}
                            >
                                Recurring
                            </Switch>
                            {price.id !== defaultPrice && !isVariant && (
                                <Switch
                                    className="ml-4"
                                    checked={false}
                                    defaultSelected={false}
                                    onChange={() => toggleDefault(index)}
                                >
                                    Product Default
                                </Switch>
                            )}
                            <Input
                                fullWidth
                                type="number"
                                label="Unit Amount (in cents)"
                                name="unit_amount"
                                value={price.unit_amount?.toString() ?? ''}
                                onChange={(e) => handleChange(e, index)}
                                isRequired={true}
                            />
                            <Input
                                fullWidth
                                label="Currency"
                                name="currency"
                                value={price.currency}
                                isRequired={true}
                                isDisabled={true}
                            />
                            <Select
                                label="Tax Behavior"
                                name="tax_behavior"
                                value={taxBehavior}
                                selectedKeys={[`${price.tax_behavior}`]}
                                defaultSelectedKeys={['exclusive']}
                                onChange={(e) => handleChange(e as any, index)}
                                className="w-full"
                            >
                                <SelectItem key="inclusive">Inclusive</SelectItem>
                                <SelectItem key="exclusive">Exclusive</SelectItem>
                            </Select>
                            {!!price.recurring && (
                                <div className="space-y-2">
                                    <Divider className="!my-8" />
                                    <Input
                                        type="number"
                                        label="Interval Count"
                                        name="interval_count"
                                        value={(price.recurring?.interval_count ?? 0).toString()}
                                        onChange={(e) => handleRecurringChange(e, index)}
                                        min={1}
                                    />
                                    <Select
                                        label="Interval"
                                        name="interval"
                                        value={price.recurring.interval}
                                        defaultSelectedKeys={[price.recurring.interval || 'month']}
                                        onChange={(e) => handleRecurringChange(e as any, index)}
                                        className="w-full"
                                    >
                                        <SelectItem key="day">Day</SelectItem>
                                        <SelectItem key="week">Week</SelectItem>
                                        <SelectItem key="month">Month</SelectItem>
                                        <SelectItem key="year">Year</SelectItem>
                                    </Select>
                                </div>
                            )}
                            {!price.id && (
                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    color='primary'
                                    isDisabled={!activeProduct || !price.unit_amount || !price.currency}
                                >
                                    Create Price
                                </Button>
                            )}
                            {price.product && typeof price.product === 'object' && (price.product as any)?.default_price !== price.id && (
                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    color='primary'
                                    isDisabled={!activeProduct || !price.unit_amount || !price.currency}
                                >
                                    Update Price
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>
            ))}
        </div>
    );
}
