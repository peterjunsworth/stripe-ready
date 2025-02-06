'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    DateInput,
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
    TableCell,
} from '@nextui-org/react';
import { useToast } from "@/app/components/elements/toast-container";
import { TaxRegistration } from '@/types/interfaces';
import { CalendarDate, parseDate } from "@internationalized/date";
import MoreIcon from '@/app/components/icons/icon-more';

export default function TaxRegistrationForm({
    allTaxRegistrations,
    setAllTaxRegistrations,
    nonRegisteredStates,
    uSStates,
}: {
    allTaxRegistrations: TaxRegistration[],
    setAllTaxRegistrations: Function,
    nonRegisteredStates: any[],
    uSStates: any[]
}) {
    const taxRegistrationObject = {
        active_from: null,
        country: 'US',
        country_options: {},
        expires_at: null,
        livemode: false, // change to env var for production or development
        status: '',
    };

    const [taxReg, setTaxReg] = useState<TaxRegistration>(taxRegistrationObject);
    const [state, setState] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [jurisdiction, setJurisdiction] = useState<string>('');
    const [activeDate, setActiveDate] = useState<CalendarDate | null>(null);
    const [expiryDate, setExpiryDate] = useState<CalendarDate | null>(null);
    const [filteredStates, setFilteredStates] = useState<any[]>(nonRegisteredStates);

    const { showToast } = useToast();

    const resetTaxRegistration = () => {
        setTaxReg(taxRegistrationObject);
        setState('');
    };

    const handleTaxRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTaxReg((prev) => ({ ...prev, isLoading: true, error: '' }));
        try {
            if(!state) {
                showToast('State Required', 'bg-red-500');
                return;
            }
            console.log(activeDate);
            const activeFrom = !activeDate?.year || !activeDate?.month || !activeDate?.day ? 
                (new Date(new Date()).getTime() + (10000)) / 1000 : new Date(activeDate.year, activeDate.month - 1, activeDate.day).getTime() / 1000;
            if (!expiryDate?.year || !expiryDate?.month || !expiryDate?.day) {
                showToast('Expiry Date Required', 'bg-red-500');
                return;
            }
            const expiryDateTimestamp = new Date(expiryDate.year, expiryDate.month - 1, expiryDate.day).getTime() / 1000;
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
                body: JSON.stringify(!taxReg.id ? {
                    taxRegistration: {
                        active_from: activeFrom,
                        country: taxReg.country,
                        country_options,
                        expires_at: expiryDateTimestamp
                    }
                } : {
                    taxRegistration: {
                        expires_at: expiryDateTimestamp
                    }
                })
            });
            if (!response.ok) throw 'Failed to save tax registration';
            const newTaxRegistration = await response.json();
            if (!newTaxRegistration.success) throw newTaxRegistration;
            if (taxReg.id) {
                setAllTaxRegistrations((prev: TaxRegistration[]) => prev.map((rate) => {
                    if (rate.id === taxReg.id) {
                        return newTaxRegistration.taxRegistration;
                    }
                    return rate;
                }));
            }
            if (!taxReg.id) setAllTaxRegistrations((prev: TaxRegistration[]) => [...prev, newTaxRegistration.taxRegistration]);
            showToast('Tax Registration Saved!');
            resetTaxRegistration();
            setFilteredStates(nonRegisteredStates);
        } catch (error: any) {
            const message = typeof error === 'string' 
                ? error 
                : error?.error?.raw?.message
                    ? error.error.raw.message.replace('country_options[us][type]', type)
                    : 'Failed to save tax registration';
            showToast(message, 'bg-red-500');
        }
    };

    const formatUnixTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const calendarDate = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        return calendarDate;
    };

    const handleEditTaxRegistration = (id: string) => {
        setFilteredStates(uSStates)
        const taxRegistration = allTaxRegistrations.find((reg) => String(reg.id) === String(id));
        const countryOptions = taxRegistration?.country_options[taxRegistration?.country.toLowerCase()];
        setTaxReg(taxRegistration as TaxRegistration);
        setState(countryOptions?.state ?? '');
        setType(countryOptions?.type ?? '');
        if ((countryOptions as { [key: string]: any })[type]){
            setJurisdiction((countryOptions as { [key: string]: any })[type].jurisdiction ?? {});
        }
        setActiveDate(formatUnixTimestamp(taxRegistration?.active_from ?? 0));
        setExpiryDate(formatUnixTimestamp(taxRegistration?.expires_at ?? 0));
    };

    const handleExpireTaxRegistration = (id: string) => {
        try {
            fetch(`/api/stripe/tax-management/tax-registration/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            setAllTaxRegistrations((prev: TaxRegistration[]) => prev.map((reg) => {
                if (reg.id === id) {
                    return { ...reg, status: 'expired' };
                }
                return reg;
            }));
            showToast('Tax Registration Deleted!');
        } catch (error: any) {
            showToast('Failed to delete tax registration', 'bg-red-500');
        }
    };

    return (
        <div className="md:w-1/3">
            <h2 className="mb-8 font-bold">Tax Registrations</h2>
            <form onSubmit={handleTaxRegistrationSubmit} className="space-y-4 mb-4">
                <Select
                    key={`available-states-${state}`}
                    label="State"
                    name="state"
                    value={state ?? ''}
                    defaultSelectedKeys={[state ?? '']}
                    selectedKeys={[state ?? '']}
                    placeholder="Select an State"
                    className="w-full"
                    onChange={(e) => setState(e.target.value)}
                    required
                    isDisabled={Boolean(taxReg?.id)}
                >
                    {filteredStates.map((state, index) => (
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
                    selectedKeys={[type ?? '']}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full"
                    isDisabled={Boolean(taxReg?.id)}
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
                    isDisabled={Boolean(taxReg?.id)}
                />
                <DateInput
                    isRequired
                    value={taxReg?.active_from ? formatUnixTimestamp(taxReg?.active_from) : null}
                    label="Registration Active From Date"
                    placeholderValue={new CalendarDate(1995, 11, 6)}
                    onChange={(date) => setActiveDate(date)}
                    isDisabled={Boolean(taxReg?.id)}
                />
                <DateInput
                    isRequired
                    value={taxReg?.expires_at ? formatUnixTimestamp(taxReg?.expires_at) : null}
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
                    <TableColumn>Status</TableColumn>
                    <TableColumn className='text-right'>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {allTaxRegistrations.map((registration, index) => (
                        <TableRow key={index}>
                            <TableCell>{registration.country}</TableCell>
                            <TableCell>{registration?.country_options?.[registration.country?.toLocaleLowerCase()]?.state || 'Default State'}</TableCell>
                            <TableCell className={`capitalize ${registration?.status === 'expired' 
                                ? 'text-red-500' 
                                : registration?.status === 'scheduled' 
                                    ? 'text-yellow-500' 
                                    : 'text-green-500'}`}
                            >
                                {registration?.status}
                            </TableCell>
                            <TableCell className="flex justify-end">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button isIconOnly variant="flat">
                                            <MoreIcon />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => registration?.id && handleEditTaxRegistration(registration.id)}>Edit</DropdownItem>
                                        <DropdownItem onClick={() => registration?.id && handleExpireTaxRegistration(registration.id)}>Expire</DropdownItem>
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
