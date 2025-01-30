// Define and export interfaces for product and price parameters

import { P } from "vitest/dist/reporters-OH1c16Kq.js";

export interface ProductParams {
    id?: string;
    name: string;
    active: boolean;
    description: string | null;
    metadata: Record<string, any>;
    marketing_features: any[];
    images: string[];
    package_dimensions: {
        height: number;
        length: number;
        weight: number;
        width: number;
    };
    shippable: boolean;
    statement_descriptor: string;
    default_price?: {
        id: string;
        unit_amount: number;
    };
    prices?: PriceParams[];
    variants?: any[];
    productOptions?: any;
}

export interface ProductTableProps {
    id: string;
    name: string;
    description: string;
    images: string[];
    active: boolean;
    unit_amount: number;
    metadata: Record<string, any>;
    index?: number;
}

export interface PriceParams {
    id?: string;
    active?: boolean;
    unit_amount: number | null;
    currency: string; // The currency in which the price is charged (e.g., 'usd', 'eur')
    product: string | { // Allow product to be either a string or an object
        id?: string; // The ID of the Stripe product (if object is passed)
        name?: string; // Optional: Name of the product
        description?: string; // Optional: Description of the product
        metadata?: Record<string, any>;
        [key: string]: any; // Optional: Any other fields that might be included in the product object
    };
    metadata?: Record<string, any>;
    recurring?: {
        interval: 'day' | 'week' | 'month' | 'year'; // Recurring billing interval
        interval_count?: number; // Optional: Number of intervals between billing cycles (e.g., every 2 months)
    } | null | undefined; // Optional recurring object for subscription prices
    tax_behavior?: 'inclusive' | 'exclusive' | 'unspecified'; // Specifies how taxes are applied
    type?: 'one_time' | 'recurring'; // Add the type property to the interface
    quantity?: number;
}

export interface PartialPriceParams extends Omit<PriceParams, 'unit_amount' | 'currency' | 'product'> {
    active?: boolean;
    unit_amount?: number | null;
    currency?: string;
    product?: string;
    metadata?: Record<string, any>;
}

export interface SessionData {
    lineItems: Array<object>;
}

export interface CheckoutFormProps {
    clientSecret: string;
}

export interface LineItem {
    id: string;
    unit_amount: number;
    quantity: number;
}

export interface ProductFormData extends ProductParams {
    variant_features?: string[];
    variant_options?: Record<string, string>;
    shipping_requirements: null | string;
    tax_code: null | string;
}

export interface ProductTableProps {
    products: ProductParams[];
}

export interface VariantFeature {
    name: string;
}

export interface CartParams extends PriceParams {
    quantity: number;
    available?: boolean;
};

export interface ShippingRate {
    id?: string; // Unique identifier for each rate
    display_name: string | null; // update the type to allow null values
    fixed_amount: { amount: number | null; currency: string };
    metadata: { minValue: string; maxValue: string };
}

export const defaultProductData: ProductFormData = {
    name: '',
    active: true,
    description: '',
    metadata: {},
    variant_features: [],
    marketing_features: [],
    images: [],
    package_dimensions: {
        height: 0,
        length: 0,
        weight: 0,
        width: 0,
    },
    shippable: true,
    statement_descriptor: '',
    shipping_requirements: null,
    tax_code: null,
};

export const defaultPriceData: PriceParams = {
    id: '',
    active: true,
    unit_amount: null,
    currency: 'usd',
    metadata: {},
    product: '',
    recurring: null,
    tax_behavior: 'exclusive',
};