'use client';

import React, { useState, useEffect } from 'react';
import TaxRateForm from "./rates";
import TaxRegistrationForm from "./registration";
import { TaxRates, TaxRegistration } from '@/types/interfaces';
import { uSStates } from '@/app/utils/utility-methods';

enum Status {
    active = 'active',
    scheduled = 'scheduled',
    expired = 'expired',
}

export default function TaxManager({
    taxRegistrationsData,
    taxRatesData
}: {
    taxRegistrationsData: TaxRegistration[],
    taxRatesData: TaxRates[]
}) {

    const [allTaxRates, setAllTaxRates] = useState<TaxRates[]>(taxRatesData);
    const [allTaxRegistrations, setAllTaxRegistrations] = useState<TaxRegistration[]>(taxRegistrationsData.sort((a: TaxRegistration, b: TaxRegistration) => {
        const order = { active: 1, scheduled: 2, expired: 3 };
        return order[a.status as Status] - order[b.status as Status];
    }));
    const [nonRegisteredStates, setNonRegisteredStates] = useState<any[]>(uSStates
        .filter((state) => !allTaxRegistrations.some((taxReg) => taxReg?.country_options['us'].state === state.abbreviation)));
    const [availableStates, setAvailableStates] = useState<string[]>(allTaxRegistrations
        .map((taxReg) => taxReg?.country_options[taxReg.country.toLowerCase()].state)
    );

    useEffect(() => {
        setAvailableStates(allTaxRegistrations
            .map((taxReg) => taxReg?.country_options[taxReg.country.toLowerCase()].state)
        );
        setNonRegisteredStates(uSStates
            .filter((state) => !allTaxRegistrations.some((taxReg) => taxReg?.country_options['us'].state === state.abbreviation)));
    }, [allTaxRegistrations, allTaxRates]);

    return (
        <div className="md:flex gap-8 w-full">
            <TaxRegistrationForm
                allTaxRegistrations={allTaxRegistrations}
                setAllTaxRegistrations={setAllTaxRegistrations}
                nonRegisteredStates={nonRegisteredStates}
                uSStates={uSStates}
            />
            <TaxRateForm
                allTaxRates={allTaxRates}
                setAllTaxRates={setAllTaxRates}
                availableStates={availableStates}
            />
        </div>
    );
}
