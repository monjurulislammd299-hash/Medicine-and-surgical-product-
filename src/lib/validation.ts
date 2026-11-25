// Boundary constants synchronized directly with firebase-blueprint.json & firestore.rules
export const LIMITS = {
  ID_MAX: 128,
  ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  PRODUCT_NAME_MIN: 2,
  PRODUCT_NAME_MAX: 140,
  PRODUCT_NAME_BN_MIN: 2,
  PRODUCT_NAME_BN_MAX: 180,
  PRODUCT_UNIT_MIN: 1,
  PRODUCT_UNIT_MAX: 60,
  PRODUCT_IMAGE_MAX: 100000,
  PRODUCT_DESC_MAX: 1000,
  PRODUCT_MANUFACTURER_MAX: 120,
  PRODUCT_PRICE_MAX: 1000000,
  PRODUCT_STOCK_MAX: 100000,
  ORDER_NAME_MIN: 2,
  ORDER_NAME_MAX: 120,
  ORDER_PHONE_MIN: 6,
  ORDER_PHONE_MAX: 30,
  ORDER_PHONE_PATTERN: /^[0-9+\-\s()]{6,30}$/,
  ORDER_ADDRESS_MIN: 5,
  ORDER_ADDRESS_MAX: 400,
  ORDER_CITY_MIN: 2,
  ORDER_CITY_MAX: 80,
  ORDER_TRACKING_PATTERN: /^MSP-[A-Z0-9\-]+$/,
  ORDER_NOTES_MAX: 500,
  ORDER_ITEMS_MAX: 50,
} as const;

export function slugifyProductId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || 'item'}-${suffix}`;
}

export function generateTrackingId(): string {
  const timestampPart = Date.now().toString(36).toUpperCase().slice(-5);
  const randomPart = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return `MSP-${timestampPart}-${randomPart || 'BD01'}`;
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function normalizePhoneDigits(input: string): string {
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  return input
    .replace(/[০-৯]/g, (ch) => String(bnDigits.indexOf(ch)))
    .trim();
}
