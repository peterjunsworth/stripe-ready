// app/admin/shipping/page.tsx
import { getShippingRates } from '@/app/api/stripe/shipping-management/route';
import ShippingForm from '@/app/components/shipping/form'
    
import { ShippingRate } from '@/types/interfaces';

export default async function ShippingAdminPage() {

    const response = await getShippingRates();
    const shippingRates = Array.isArray(response.data) ? response.data : [];
    
    return (
        <div>
            <h1 className='mb-8'>Create Shipping Rates</h1>
            <ShippingForm shippingRatesData={shippingRates as unknown as ShippingRate[]} />
        </div>
    );
}