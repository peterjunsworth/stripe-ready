import { PriceParams } from "@/types/interfaces";

export const cleanData = (productDataValues: any, defaultProductData: any) => {
  const keysToRemove = ['variant_features'];
  const productData = Object.keys(productDataValues).reduce((acc: any, key) => {
    if (!keysToRemove.includes(key)) {
      acc[key] = (productDataValues as any)[key];
    }
    return acc;
  }, {});
  const intersected = intersectObjects(productData, defaultProductData);
  return intersected;
};

// This method makes sure we only try and persist values specified in the defaultProductData
export function intersectObjects(obj1: any, obj2: any): any {
  return Object.entries(obj1).reduce((result: Record<string, any>, [key, value]) => {
    if (key === 'metadata' || key === 'id') return result; // Skip 'metadata'
    if (obj2.hasOwnProperty(key)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof obj2[key] === 'object' &&
        obj2[key] !== null &&
        !Array.isArray(value) // Ensure it's not an array
      ) {
        // Recursively process nested objects
        const nestedIntersection = intersectObjects(value, obj2[key]);
        if (Object.keys(nestedIntersection).length > 0) {
          result[key] = nestedIntersection;
        }
      } else {
        // Add primitive or non-object values
        result[key] = value !== null ? value : obj2[key] ?? '';
      }
    }
    return result;
  }, {});
}

export function formatUnitAmountRange(items: { unit_amount: number }[]): string {
  if (!items || !items.length) return ""; // Handle empty array case

  // Extract unit_amount values
  const unitAmounts = items.map(item => item.unit_amount);

  // Find the lowest and highest values
  const lowest = Math.min(...unitAmounts);
  const highest = Math.max(...unitAmounts);

  if (lowest === highest) {
    // If all values are the same, return the formatted amount
    return `$${(lowest / 100).toFixed(2)}`;
  }
  // Return formatted string
  return `$${(lowest / 100).toFixed(2)} - $${(highest / 100).toFixed(2) }`;
}

export const findDifferences = (obj1: any, obj2: any) => {
  console.log(obj1);
  const getDifferences = (o1: any, o2: any) => {
    let result: Record<string, any> = Array.isArray(o1) ? [] : {};
    Object.keys(o1 || {}).forEach((key) => {
      const val1 = o1[key];
      const val2 = o2?.[key];

      if (typeof val1 === 'object' && val1 && !Array.isArray(val1)) {
        if (typeof val2 === 'object' && val2) {
          // Recursively check nested objects
          const nestedDifferences = getDifferences(val1, val2);
          if (Object.keys(nestedDifferences).length > 0) {
            result[key] = nestedDifferences;
          }
        } else {
          // Include the entire object if it differs
          result[key] = val1;
        }
      } else if (Array.isArray(val1)) {
        if (!Array.isArray(val2) || !deepEqual(val1, val2)) {
          result[key] = val1;
        }
      } else if (!Object.is(val1, val2)) {
        // Include differing primitive values
        result[key] = val1;
      }
    });

    return result;
  };

  return getDifferences(obj1, obj2);
};

// Helper function for deep equality (used for array comparison)
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (Object.is(obj1, obj2)) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return obj1.length === obj2.length && obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  return keys1.length === keys2.length && keys1.every(key => deepEqual(obj1[key], obj2[key]));
};

export const cheapestNonRecurring = (priceData: any[]) => {
  const cheapestPrice = priceData.length ?
    priceData
      .filter((price: PriceParams) => price.type === 'one_time')
      .reduce((min: PriceParams, price: PriceParams) => (price.unit_amount ?? 0 < (min.unit_amount ?? 0) ? price : min))
    : {}; // Return defaultPriceData when priceData is empty
  return cheapestPrice
}

export const uniqueRecurringIntervals = (priceData: any[]) => {
  const cheapestRecurringPrice = priceData.length ? [
    ...new Map(
      priceData
        .filter((price: PriceParams) => price.type === 'recurring')
        .map((price: PriceParams) => {
          if (price.recurring) {
            return [
              `${price.recurring.interval}_${price.recurring.interval_count}`,
              price
            ];
          } else {
            return [null, price]; // or some other default value
          }
        })
    ).values()
  ] : [];
  return cheapestRecurringPrice;
}