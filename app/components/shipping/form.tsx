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

export default function ShippingForm({
    shippingRatesData,
}: {
    shippingRatesData: ShippingRate[];
}) {
    // Individual state properties for each input
    const [amount, setAmount] = useState<number>(0);
    const [minWeight, setMinWeight] = useState<string>('');
    const [maxWeight, setMaxWeight] = useState<string>('');
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>(shippingRatesData);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [currentRateId, setCurrentRateId] = useState<string | null>(null); // Track the current rate ID for updates
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for the button

    const displayName = process.env.NEXT_PUBLIC_SHIPPING_TYPE === 'WEIGHT_BASED' ? 'Weight Based Shipping' : 'Cost Based Shipping';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true); // Set loading state

        // Combine individual state properties into a single shippingRate object
        const shippingRate: ShippingRate = {
            display_name: displayName,
            fixed_amount: { amount, currency: 'usd' },
            metadata: { minWeight, maxWeight: maxWeight || '-1' },
        };

        try {
            // Determine the API method based on whether we are updating or creating
            const method = currentRateId !== null ? 'PUT' : 'POST';
            const url = currentRateId !== null ? `/api/stripe/shipping-management/${currentRateId}` : '/api/stripe/shipping-management';

            // Persist the current shipping rate
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
            setMessage('Shipping rate persisted successfully!');

            // Update the shipping rates list
            if (currentRateId !== null) {
                // Update existing rate
                setShippingRates((prevRates) =>
                    prevRates.map((rate) => (rate.id === currentRateId.toString() ? data.shippingRate : rate))
                );
            } else {
                // Add the new rate to the displayed rates
                setShippingRates((prevRates) => [...prevRates, data.shippingRate]);
            }

            // Clear the form
            setAmount(0);
            setMinWeight('');
            setMaxWeight('');
            setCurrentRateId(null); // Reset the current rate ID
        } catch (err) {
            setError('Failed to create or update shipping rate. Please try again.');
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    const handleEditRate = (rate: ShippingRate) => {
        setAmount(rate.fixed_amount.amount ?? 0);
        setMinWeight(rate.metadata.minWeight);
        setMaxWeight(rate.metadata.maxWeight === '-1' ? '' : rate.metadata.maxWeight);
        setCurrentRateId(String(rate.id) ?? null);
    };

    const handleDeleteRate = async (id: string) => {
        setMessage('');
        setError('');

        try {
            const response = await fetch(`/api/stripe/shipping-management/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete shipping rate');
            }

            setShippingRates((prevRates) => prevRates.filter((rate) => String(rate.id) !== String(id)));
            setMessage('Shipping rate deleted successfully!');
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
                    label="Minimum Weight (oz)"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    required
                />
                <Input
                    isClearable
                    label="Maximum Weight (oz), Infinite if empty"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                />
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isLoading} // Show loading spinner when submitting
                    size="md" // Set button size
                >
                    {currentRateId !== null ? 'Update Shipping Rate' : 'Persist Shipping Rate'}
                </Button>
                {message && <p className="text-green-500">{message}</p>}
                {error && <p className="text-red-500">{error}</p>}
            </form>

            <h2 className="text-lg font-semibold">Current Shipping Rates</h2>
            <Table aria-label="Shipping Rates Table">
                <TableHeader>
                    <TableColumn>Display Name</TableColumn>
                    <TableColumn>Amount</TableColumn>
                    <TableColumn>Min Weight</TableColumn>
                    <TableColumn>Max Weight</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {shippingRates.map((rate) => (
                        <TableRow key={rate.id}>
                            <TableCell>{rate.display_name}</TableCell>
                            <TableCell>${((rate.fixed_amount.amount ?? 0) / 100).toFixed(2)}</TableCell>
                            <TableCell>{rate.metadata.minWeight} oz</TableCell>
                            <TableCell>{rate.metadata.maxWeight === '-1' ? 'Infinite' : `${rate.metadata.maxWeight} oz`}</TableCell>
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