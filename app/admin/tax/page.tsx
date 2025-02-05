import { getTaxRegistrations } from '@/app/api/stripe/tax-management/tax-registration/route';
import { getTaxRates } from '@/app/api/stripe/tax-management/tax-rates/route';
import TaxRegistrationForm from '@/app/components/tax/form';
import { TaxRates, TaxRegistration } from '@/types/interfaces';

export default async function TaxRegistrationsPage() {
    const taxRatesData = await getTaxRates();
    const taxRates = Array.isArray(taxRatesData) ? taxRatesData : [];
    const taxRegistrationsData = await getTaxRegistrations();
    const taxRegistrations = Array.isArray(taxRegistrationsData) ? taxRegistrationsData : [];

    return (
        <div>
            <TaxRegistrationForm
                taxRatesData={taxRates as unknown as TaxRates[]}
                taxRegistrationsData={taxRegistrations as unknown as TaxRegistration[]}
            />
        </div>
    );
}
