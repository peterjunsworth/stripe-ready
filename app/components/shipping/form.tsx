// app/admin/shipping/ShippingForm.tsx
'use client'; // This directive indicates that this component is client-side

import { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@nextui-org/table";
import { ShippingRate } from '@/types/interfaces';
import { useToast } from "@/app/components/elements/toast-container";

export default function ShippingForm({
    shippingRatesData,
}: {
    shippingRatesData: ShippingRate[];
}) {

    const [amount, setAmount] = useState<number>(0);
    const [minValue, setMinValue] = useState<string>('');
    const [maxValue, setMaxValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [currentRateId, setCurrentRateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [shippingType, setShippingType] = useState(process.env.NEXT_PUBLIC_SHIPPING_TYPE);

    const displayName = shippingType === 'WEIGHT_BASED' ? 'Weight Based Shipping' : 'Cost Based Shipping';

    const [shippingRates, setShippingRates] = useState<ShippingRate[]>(shippingRatesData);

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // Set loading state

        const shippingRate: ShippingRate = {
            display_name: displayName,
            fixed_amount: { amount, currency: 'usd' },
            metadata: { minValue, maxValue: maxValue || '-1' },
        };

        try {
            const method = currentRateId !== null ? 'PUT' : 'POST';
            const url = currentRateId !== null ? `/api/stripe/shipping-management/${currentRateId}` : '/api/stripe/shipping-management';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shippingRate }),
            });
            if (!response.ok) {
                throw new Error('Failed to create or update shipping rate');
            }
            const data = await response.json();
            showToast('Shipping Rate Saved!');
            if (currentRateId !== null) {
                setShippingRates((prevRates) =>
                    prevRates.map((rate) => (rate.id === currentRateId.toString() ? data.shippingRate : rate))
                );
            } else {
                setShippingRates((prevRates) => [...prevRates, data.shippingRate]);
            }
            setAmount(0);
            setMinValue('');
            setMaxValue('');
            setCurrentRateId(null);
        } catch (err) {
            setError('Failed to create or update shipping rate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditRate = (rate: ShippingRate) => {
        setAmount(rate.fixed_amount.amount ?? 0);
        setMinValue(rate.metadata.minValue);
        setMaxValue(rate.metadata.maxValue === '-1' ? '' : rate.metadata.maxValue);
        setCurrentRateId(String(rate.id) ?? null);
    };

    const handleDeleteRate = async (id: string) => {
        setError('');

        try {
            const response = await fetch(`/api/stripe/shipping-management/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete shipping rate');
            }
            setShippingRates((prevRates) => prevRates.filter((rate) => String(rate.id) !== String(id)));
            showToast('Shipping Rate Deleted!');
        } catch (err) {
            setError('Failed to delete shipping rate. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <Input
                    isClearable
                    label="Display Name"
                    value={displayName}
                    isDisabled
                />
                <Input
                    isClearable
                    type="number"
                    label="Fixed Amount (in cents)"
                    value={amount.toString()}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                />
                <Input
                    isClearable
                    label={shippingType === 'WEIGHT_BASED' ? 'Minimum Weight (oz)' : 'Minimum Price ($)'}
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    required
                />
                <Input
                    isClearable
                    label={`${shippingType === 'WEIGHT_BASED' ? 'Maximum Weight (oz)' : 'Maximum Price ($)'}, Infinite if empty`}
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                />
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isLoading} // Show loading spinner when submitting
                    size="md" // Set button size
                >
                    {currentRateId !== null ? 'Update Shipping Rate' : 'Persist Shipping Rate'}
                </Button>
                {error && <p className="text-red-500">{error}</p>}
            </form>

            <h2 className="text-lg font-semibold">Current Shipping Rates</h2>
            <Table aria-label="Shipping Rates Table">
                <TableHeader>
                    <TableColumn>Display Name</TableColumn>
                    <TableColumn>Amount</TableColumn>
                    <TableColumn>{shippingType === 'WEIGHT_BASED' ? 'Min Weight' : 'Min Price'}</TableColumn>
                    <TableColumn>{shippingType === 'WEIGHT_BASED' ? 'Max Weight' : 'Max Price'}</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {shippingRates.map((rate) => (
                        <TableRow key={rate.id}>
                            <TableCell>{rate.display_name}</TableCell>
                            <TableCell>${((rate.fixed_amount.amount ?? 0) / 100).toFixed(2)}</TableCell>
                            <TableCell>
                                {shippingType === 'WEIGHT_BASED' ? '' : '$'}
                                {rate.metadata.minValue}
                                {shippingType === 'WEIGHT_BASED' ? ' oz' : ''}
                            </TableCell>
                            <TableCell>
                                {shippingType === 'WEIGHT_BASED' ? '' : '$'}
                                {rate.metadata.maxValue === '-1' ? 'Infinite' : `${rate.metadata.maxValue}`}
                                {shippingType === 'WEIGHT_BASED' ? ' oz' : ''}
                            </TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => handleEditRate(rate)}
                                    color="primary"
                                    size="sm"
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => handleDeleteRate(String(rate.id))}
                                    color="danger"
                                    size="sm"
                                    className='ml-2'
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}