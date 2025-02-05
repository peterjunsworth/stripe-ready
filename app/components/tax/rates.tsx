'use client';

import { useState, useEffect } from 'react';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from '@nextui-org/react';
import { useToast } from "@/app/components/elements/toast-container";
import { TaxRates } from '@/types/interfaces';
import MoreIcon from '@/app/components/icons/icon-more';

export default function TaxRateForm({
    allTaxRates,
    setAllTaxRates,
    availableStates,
}: {
    allTaxRates: TaxRates[],
    setAllTaxRates: Function,
    availableStates: string[],
}) {

    const taxRateObject = {
        country: "US",
        description: "",
        display_name: "",
        flat_amount: null,
        inclusive: false,
        jurisdiction: null,
        jurisdiction_level: null,
        livemode: false,
        metadata: {},
        percentage: 7,
        rate_type: "percentage",
        state: "",
        tax_type: null
    };

    const [taxRate, setTaxRate] = useState<TaxRates>(taxRateObject);

    const { showToast } = useToast();

    const resetTaxRate = () => {
        setTaxRate(taxRateObject);
    };

    const handleTaxRateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = taxRate?.id ? `/api/stripe/tax-management/tax-rates/${taxRate.id}` : '/api/stripe/tax-management/tax-rates';
            const method = taxRate?.id ? 'PUT' : 'POST';
            const body = taxRate?.id ? {
                display_name: taxRate.display_name,
                state: taxRate.state,
                country: taxRate.country
            } : {
                display_name: taxRate.display_name,
                inclusive: taxRate.inclusive,
                percentage: taxRate.percentage,
                state: taxRate.state,
                country: taxRate.country
            };
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taxRate: body
                })
            });
            if (!response.ok) throw 'Failed to save tax rate';
            const newTaxRate = await response.json();
            if (!newTaxRate.success) throw newTaxRate;
            if (taxRate?.id) {
                setAllTaxRates((prev: TaxRates[]) => prev.map((rate) => {
                    if (rate.id === taxRate.id) {
                        return newTaxRate.taxRate;
                    }
                    return rate;
                }));
            }
            if (!taxRate?.id) setAllTaxRates((prev: TaxRates[]) => [...prev, newTaxRate.taxRate]);
            showToast('Tax Rate Saved!');
            resetTaxRate();
        } catch (error: any) {
            const message = typeof error === 'string'
                ? error
                : error?.error?.raw?.message
                    ? error.error.raw.message
                    : 'Failed to save tax rate';
            showToast(message, 'bg-red-500');
        }
    };

    const handleDeleteRate = async (id: string) => {
        try {
            const response = await fetch(`/api/stripe/tax-management/tax-rates/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw 'Failed to delete tax rate';
            setAllTaxRates((prev: TaxRates[]) => prev.filter((rate) => String(rate.id) !== String(id)));
            showToast('Tax Rate Deleted!');
        } catch (error: any) {
            const message = typeof error === 'string'
                ? error
                : error?.error?.raw?.message
                    ? error.error.raw.message
                    : 'Failed to delete tax rate';
            showToast(message, 'bg-red-500');
        }
    };

    const handleEditRate = async (id: string) => {
        setTaxRate(allTaxRates.find((rate) => String(rate.id) === String(id)) || taxRateObject);
    };

    return (
        <div className="md:w-2/3 max-sm:mt-8">
            <h2 className="mb-8 font-bold">Tax Rates</h2>

            <form onSubmit={handleTaxRateSubmit} className="space-y-4 mt-6">
                <Input 
                    label="Display Name" 
                    value={taxRate.display_name} 
                    onChange={(e) => setTaxRate({ ...taxRate, display_name: e.target.value })} 
                    required 
                />
                <Input 
                    label="Percentage"
                    type="number" 
                    value={taxRate.percentage.toString()} 
                    onChange={(e) => setTaxRate({ ...taxRate, percentage: Number(e.target.value) })} 
                    required 
                />
                <Select
                    label="Inclusive / Exclusive"
                    name="inclusive"
                    value={taxRate.inclusive ? 'true' : 'false'}
                    placeholder="Select an Option"
                    defaultSelectedKeys={[taxRate.inclusive ? 'true' : 'false']}
                    className="w-full"
                >
                    <SelectItem key="true">Inclusive</SelectItem>
                    <SelectItem key="false">Exclusive</SelectItem>
                </Select>
                <Select
                    key={`available-states-${availableStates.length}`}
                    label="State"
                    name="state"
                    value={taxRate.state ?? ''}
                    defaultSelectedKeys={[taxRate.state ?? '']}
                    selectedKeys={[taxRate.state ?? '']}
                    placeholder="Select a State"
                    className="w-full"
                    onChange={(e) => setTaxRate({ ...taxRate, state: e.target.value })}
                >
                    {availableStates.map((state, index) => (
                        <SelectItem
                            key={`${state}`}
                            value={state}
                        >
                            {state}
                        </SelectItem>
                    ))}
                </Select>
                <Button type="submit" color="primary">{taxRate.id ? 'Update' : 'Create'} tax Rate</Button>
            </form>

            <Table aria-label="Tax Rates" className="mt-4">
                <TableHeader>
                    <TableColumn>Display Name</TableColumn>
                    <TableColumn>Country</TableColumn>
                    <TableColumn>State</TableColumn>
                    <TableColumn>Percentage</TableColumn>
                    <TableColumn className='text-right'>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {allTaxRates.map((rate, index) => (
                        <TableRow key={index}>
                            <TableCell>{rate.display_name}</TableCell>
                            <TableCell>{rate.country}</TableCell>
                            <TableCell>{rate.state}</TableCell>
                            <TableCell>{rate.percentage}%</TableCell>
                            <TableCell className="flex justify-end">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button isIconOnly variant="flat">
                                            <MoreIcon />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => rate?.id && handleEditRate(rate.id)}>Edit</DropdownItem>
                                        <DropdownItem onClick={() => rate?.id && handleDeleteRate(rate.id)}>Delete</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
