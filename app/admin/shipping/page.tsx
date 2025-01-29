// app/admin/shipping/page.tsx
import { getShippingRates } from '@/app/api/stripe/shipping-management/route';
import ShippingForm from '@/app/components/shipping/form'
    
import { ShippingRate } from '@/types/interfaces';

export default async function ShippingAdminPage() {

    const shippingType = process.env.SHIPPING_TYPE ?? 'WEIGHT_BASED';
    const displayName = shippingType === 'WEIGHT_BASED' ? 'Weight Based Shipping' : 'Cost Based Shipping';
    const response = await getShippingRates(displayName);
    const shippingRates = Array.isArray(response) ? response : [];
    
    return (
        <div>
            <h1 className='mb-8'>Create Shipping Rates</h1>
            <ShippingForm shippingRatesData={shippingRates as unknown as ShippingRate[]} />
        </div>
    );
}