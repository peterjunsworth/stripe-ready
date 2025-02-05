'use client';

import { useState } from 'react';
import {
    Button,
    DateInput,
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
import { TaxRates, TaxRegistration } from '@/types/interfaces';
import { CalendarDate, parseDate } from "@internationalized/date";
import { uSStates } from '@/app/utils/utility-methods';

export default function TaxRegistrationForm({
    taxRegistrationsData,
    taxRatesData
}: {
    taxRegistrationsData: TaxRegistration[],
    taxRatesData: TaxRates[]
}) {
    const taxRegistrationObject = {
        active_from: null,
        country: 'US',
        country_options: {},
        expires_at: null,
        livemode: false, // change to env var for production or development
        status: '',
    };

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

    const [allTaxRates, setAllTaxRates] = useState<TaxRates[]>(taxRatesData);
    const [allTaxRegistrations, setAllTaxRegistrations] = useState<TaxRegistration[]>(taxRegistrationsData);
    const [taxReg, setTaxReg] = useState<TaxRegistration>(taxRegistrationObject);
    const [taxRate, setTaxRate] = useState<TaxRates>(taxRateObject);
    const [state, setState] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [jurisdiction, setJurisdiction] = useState<string>('');
    const [nonRegisteredStates, setNonRegisteredStates] = useState<any[]>(uSStates.filter((state) => !allTaxRegistrations.some((taxReg) => taxReg?.country_options['us'].state === state.abbreviation)));
    const [availableStates, setAvailableStates] = useState<string[]>(allTaxRegistrations
        .map((taxReg) => taxReg?.country_options[taxReg.country.toLowerCase()].state)
        .filter((state) => !allTaxRates.some((taxRate) => taxRate.state === state))
    );
    const [activeDate, setActiveDate] = useState<CalendarDate | null>(null);
    const [expiryDate, setExpiryDate] = useState<CalendarDate | null>(null);

    const { showToast } = useToast();

    const resetTaxRegistration = () => {
        setTaxReg(taxRegistrationObject);
        setState('');
    };

    const resetTaxRate = () => {
        setTaxRate(taxRateObject);
    };

    const handleTaxRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTaxReg((prev) => ({ ...prev, isLoading: true, error: '' }));

        try {
            if(!state) {
                showToast('State Required', 'bg-red-500');
                return;
            }
            const activeFrom = !activeDate?.year || !activeDate?.month || !activeDate?.day ? 
                (new Date(new Date()).getTime() + (5000)) / 1000 : new Date(activeDate.year, activeDate.month - 1, activeDate.day).getTime() / 1000;
            if (!expiryDate?.year || !expiryDate?.month || !expiryDate?.day) {
                showToast('Expiry Date Required', 'bg-red-500');
                return;
            }
            const country_options = type === 'local_amusement_tax' || type === 'local_tax' ? {
                [taxReg.country.toLowerCase()]: {
                    state,
                    type,
                    [type]: {
                        jurisdiction,
                    }
                }
            } : {
                [taxReg.country.toLowerCase()]: {
                    state,
                    type
                }
            }
            const method = taxReg.id ? 'PUT' : 'POST';
            const url = taxReg.id ? `/api/stripe/tax-management/tax-registration/${taxReg.id}` : '/api/stripe/tax-management/tax-registration';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taxRegistration: {
                        active_from: activeFrom,
                        country: taxReg.country,
                        country_options,
                        expires_at: new Date(expiryDate.year, expiryDate.month - 1, expiryDate.day).getTime() / 1000
                    }
                })
            });
            if (!response.ok) throw 'Failed to save tax registration';
            const newTaxRegistration = await response.json();
            if (!newTaxRegistration.success) throw newTaxRegistration;
            setAllTaxRegistrations((prev) => [...prev, newTaxRegistration.taxRegistration]);
            setNonRegisteredStates(uSStates.filter((state) => !allTaxRegistrations.some((taxReg) => taxReg?.country_options['us'].state === state.abbreviation)));
            setAvailableStates(allTaxRegistrations
                .map((taxReg) => taxReg.country_options[taxReg.country.toLowerCase()].state)
                .filter((state) => !allTaxRates.some((taxRate) => taxRate.state === state)));
            showToast('Tax Registration Saved!');
            resetTaxRegistration();
        } catch (error: any) {
            const message = typeof error === 'string' 
                ? error 
                : error?.error?.raw?.message
                    ? error.error.raw.message.replace('country_options[us][type]', type)
                    : 'Failed to save tax registration';
            showToast(message, 'bg-red-500');
        }
    };

    const handleTaxRateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/stripe/tax-management/tax-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taxRate: {
                        display_name: taxRate.display_name,
                        inclusive: taxRate.inclusive,
                        percentage: taxRate.percentage,
                        state: taxRate.state,
                        country: taxRate.country
                    }
                })
            });
            if (!response.ok) throw new Error('Failed to create tax rate');
            const newTaxRate = await response.json();
            setAllTaxRates((prev) => [...prev, newTaxRate.taxRate]);
            setAvailableStates(allTaxRegistrations
                .map((taxReg) => taxReg.country_options[taxReg.country.toLowerCase()].state)
                .filter((state) => !allTaxRates.some((taxRate) => taxRate.state === state)));
            showToast('Tax Rate Saved!');
            resetTaxRate();
        } catch (error) {
            showToast('Failed to create tax rate. Please try again.');
        }
    };

    return (
        <div className="md:flex gap-8 w-full">
            <div className="md:w-1/3">
                <h2 className="mb-8 font-bold">Tax Registrations</h2>
                <form onSubmit={handleTaxRegistrationSubmit} className="space-y-4 mb-4">
                    <Select
                        label="State"
                        name="state"
                        value={state ?? ''}
                        defaultSelectedKeys={[state ?? '']}
                        placeholder="Select an State"
                        className="w-full"
                        onChange={(e) => setState(e.target.value)}
                        required
                    >
                        {nonRegisteredStates.map((state, index) => (
                            <SelectItem
                                key={`${state.abbreviation}`}
                                value={state.name}
                            >
                                {state.name}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        label="Type"
                        name="type"
                        value={type ?? ''}
                        placeholder="Select an Option"
                        defaultSelectedKeys={[type ?? '']}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full"
                    >
                        <SelectItem key="local_amusement_tax">Local Amusement Tax</SelectItem>
                        <SelectItem key="local_lease_tax">Local Lease Tax</SelectItem>
                        <SelectItem key="state_communications_tax">State Communications Tax</SelectItem>
                        <SelectItem key="state_retail_delivery_fee">State Retail Delivery Fee</SelectItem>
                        <SelectItem key="state_sales_tax">State Sales Tax</SelectItem>
                    </Select>
                    <Input
                        label="Jurisdiction"
                        type="text"
                        value={jurisdiction ?? ''}
                        onChange={(e) => setJurisdiction(e.target.value)}
                    />
                    <DateInput
                        isRequired
                        defaultValue={taxReg?.active_from ? parseDate(new Date(taxReg?.active_from).toISOString().split('T')[0]) : parseDate(new Date().toISOString().split('T')[0])}
                        label="Registration Active From Date"
                        placeholderValue={new CalendarDate(1995, 11, 6)}
                        onChange={(date) => setActiveDate(date)}
                    />
                    <DateInput
                        isRequired
                        defaultValue={taxReg?.expires_at ? parseDate(new Date(taxReg?.expires_at).toISOString().split('T')[0]) : null}
                        label="Registration Expiry Date"
                        placeholderValue={new CalendarDate(1995, 11, 6)}
                        onChange={setExpiryDate}
                    />
                    <Button type="submit" color="primary">{taxReg.id ? 'Update Tax Registration' : 'Create Tax Registration'}</Button>
                </form>

                <Table aria-label="Tax Registrations">
                    <TableHeader>
                        <TableColumn>Country</TableColumn>
                        <TableColumn>State</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {allTaxRegistrations.map((registration, index) => (
                            <TableRow key={index}>
                                <TableCell>{registration.country}</TableCell>
                                <TableCell>{registration?.country_options?.[registration.country?.toLocaleLowerCase()]?.state || 'Default State'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
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
                        label="State"
                        name="state"
                        value={taxRate.state ?? ''}
                        defaultSelectedKeys={[taxRate.state ?? '']}
                        placeholder="Select an State"
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
                    <Button type="submit" color="primary">Create Tax Rate</Button>
                </form>

                <Table aria-label="Tax Rates" className="mt-4">
                    <TableHeader>
                        <TableColumn>Display Name</TableColumn>
                        <TableColumn>Country</TableColumn>
                        <TableColumn>State</TableColumn>
                        <TableColumn>Percentage</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {allTaxRates.map((rate, index) => (
                            <TableRow key={index}>
                                <TableCell>{rate.display_name}</TableCell>
                                <TableCell>{rate.country}</TableCell>
                                <TableCell>{rate.state}</TableCell>
                                <TableCell>{rate.percentage}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
