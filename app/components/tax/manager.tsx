'use client';

import React, { useState, useEffect } from 'react';
import TaxRateForm from "./rates";
import TaxRegistrationForm from "./registration";
import { TaxRates, TaxRegistration } from '@/types/interfaces';
import { uSStates } from '@/app/utils/utility-methods';

export default function TaxManager({
    taxRegistrationsData,
    taxRatesData
}: {
    taxRegistrationsData: TaxRegistration[],
    taxRatesData: TaxRates[]
}) {

    const [allTaxRates, setAllTaxRates] = useState<TaxRates[]>(taxRatesData);
    const [allTaxRegistrations, setAllTaxRegistrations] = useState<TaxRegistration[]>(taxRegistrationsData);
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
            />
            <TaxRateForm
                allTaxRates={allTaxRates}
                setAllTaxRates={setAllTaxRates}
                availableStates={availableStates}
            />
        </div>
    );
}
