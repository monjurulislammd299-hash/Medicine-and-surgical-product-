export type ProductCategory =
  | 'Medicine'
  | 'Surgical'
  | 'Medical Equipment'
  | 'Personal Care';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'bKash (Demo)'
  | 'Nagad (Demo)';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: number;
  imageUrl: string;
  description: string;
  manufacturer: string;
  requiresPrescription: boolean;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  productId: string;
  name: string;
  nameBn: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  nameBn: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  trackingId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phone: string;
  address: string;
  city: string;
  updatedAt?: unknown;
}

export const ADMIN_EMAIL = 'monjurulislammd299@gmail.com';
export const WHATSAPP_HELPLINE_NUMBER = '8801700000000';
export const WHATSAPP_HELPLINE_DISPLAY = '+880 1700-000000';

export const HERO_IMAGE_URL = '/src/assets/images/hero_clinical_pharmacy_1795535747174.jpg';

export const CURATED_PRODUCT_IMAGES: { label: string; url: string }[] = [
  {
    label: 'Medicine Tablets & Syrup',
    url: '/src/assets/images/product_medicine_tablets_1795535747957.jpg',
  },
  {
    label: 'Surgical Instruments & Gauze',
    url: '/src/assets/images/product_surgical_instruments_1795535749084.jpg',
  },
  {
    label: 'Digital BP Monitor',
    url: '/src/assets/images/product_bp_monitor_1795535748956.jpg',
  },
  {
    label: 'Pulse Oximeter & Thermometer',
    url: '/src/assets/images/product_pulse_oximeter_1795535749642.jpg',
  },
  {
    label: 'Surgical Gloves, Masks & Bandage',
    url: '/src/assets/images/product_surgical_ppe_1795535749459.jpg',
  },
  {
    label: 'Antiseptic & Wound Dressing Kit',
    url: '/src/assets/images/product_antiseptic_care_1795535750087.jpg',
  },
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Medicine',
  'Surgical',
  'Medical Equipment',
  'Personal Care',
];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
];

export const STARTER_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'napa-extra-500-box',
    name: 'Paracetamol 500mg + Caffeine Tablets',
    nameBn: 'প্যারাসিটামল ৫০০ মি.গ্রা. ট্যাবলেট প্যাক',
    category: 'Medicine',
    price: 250,
    unit: '1 Box (10×10 Tabs)',
    stock: 140,
    imageUrl: '/src/assets/images/product_medicine_tablets_1795535747957.jpg',
    description:
      'Fast-acting analgesic and antipyretic tablets in factory-sealed blister strips with batch expiry tracking for clinics and households.',
    manufacturer: 'Beximco Pharma',
    requiresPrescription: false,
    featured: true,
  },
  {
    id: 'sterile-surgical-instrument-set',
    name: 'Stainless Surgical Scissors & Forceps Kit',
    nameBn: 'স্টেইনলেস সার্জিক্যাল কাঁচি ও ফরসেপস সেট',
    category: 'Surgical',
    price: 1280,
    unit: '1 Set (3 Instruments + Gauze)',
    stock: 42,
    imageUrl: '/src/assets/images/product_surgical_instruments_1795535749084.jpg',
    description:
      'Autoclavable medical-grade 304 stainless steel dressing scissors, thumb forceps, and EO-sterilized 10×10 cm cotton gauze pads.',
    manufacturer: 'MedCare Surgical',
    requiresPrescription: false,
    featured: true,
  },
  {
    id: 'digital-arm-bp-monitor',
    name: 'Automatic Upper-Arm BP Monitor',
    nameBn: 'ডিজিটাল ব্লাড প্রেসার মাপার মেশিন',
    category: 'Medical Equipment',
    price: 3450,
    unit: '1 Complete Unit (22–42cm Cuff)',
    stock: 28,
    imageUrl: '/src/assets/images/product_bp_monitor_1795535748956.jpg',
    description:
      'Clinically validated oscillometric blood pressure monitor with irregular heartbeat indicator, dual-user memory, and wide-range cuff.',
    manufacturer: 'Omron Healthcare',
    requiresPrescription: false,
    featured: true,
  },
  {
    id: 'pulse-oximeter-ir-thermometer',
    name: 'Fingertip Pulse Oximeter & IR Thermometer',
    nameBn: 'পালস অক্সিমিটার ও ইনফ্রারেড থার্মোমিটার',
    category: 'Medical Equipment',
    price: 1850,
    unit: '2-Piece Diagnostic Combo',
    stock: 36,
    imageUrl: '/src/assets/images/product_pulse_oximeter_1795535749642.jpg',
    description:
      'Dual-LED OLED SpO2 oxygen saturation & pulse rate monitor paired with a non-contact clinical infrared forehead thermometer.',
    manufacturer: 'Medisure Diagnostics',
    requiresPrescription: false,
    featured: true,
  },
  {
    id: 'nitrile-gloves-surgical-masks',
    name: 'Powder-Free Nitrile Gloves & 3-Ply Masks',
    nameBn: 'নাইট্রাইল গ্লাভস (১০০ পিস) ও সার্জিক্যাল মাস্ক',
    category: 'Surgical',
    price: 780,
    unit: '100 Gloves + 50 Masks + Bandage',
    stock: 95,
    imageUrl: '/src/assets/images/product_surgical_ppe_1795535749459.jpg',
    description:
      'Latex-free textured blue nitrile examination gloves paired with melt-blown 3-ply surgical masks and conforming sterile bandage roll.',
    manufacturer: 'MediGlove Supply',
    requiresPrescription: false,
    featured: false,
  },
  {
    id: 'chlorhexidine-antiseptic-dressing',
    name: 'Antiseptic Solution & Sterile Wound Kit',
    nameBn: 'অ্যান্টিসেপটিক সলিউশন ও জীবাণুমুক্ত ড্রেসিং কিট',
    category: 'Personal Care',
    price: 540,
    unit: '500ml Bottle + 100 Alcohol Pads',
    stock: 110,
    imageUrl: '/src/assets/images/product_antiseptic_care_1795535750087.jpg',
    description:
      'Hospital-grade antiseptic cleansing solution with non-adherent sterile wound dressing pack and 70% isopropyl alcohol prep swabs.',
    manufacturer: 'MediClean Labs',
    requiresPrescription: false,
    featured: false,
  },
  {
    id: 'oral-rehydration-electrolyte-syrup',
    name: 'Pediatric Oral Rehydration & Zinc Pack',
    nameBn: 'ওরাল স্যালাইন ও জিঙ্ক সাপোর্ট প্যাক',
    category: 'Medicine',
    price: 320,
    unit: '1 Bottle (200ml) + 10 Sachets',
    stock: 85,
    imageUrl: '/src/assets/images/product_medicine_tablets_1795535747957.jpg',
    description:
      'WHO-formulated oral electrolyte balance pack with pediatric zinc support syrup for rapid hydration recovery.',
    manufacturer: 'Square Pharmaceuticals',
    requiresPrescription: false,
    featured: false,
  },
  {
    id: 'sterile-gauze-suture-prep-pack',
    name: 'Sterile Post-Op Dressing & Gauze Pack',
    nameBn: 'পোস্ট-অপারেটিভ জীবাণুমুক্ত গজ ও ড্রেসিং প্যাক',
    category: 'Personal Care',
    price: 460,
    unit: '20 Individually Sealed Packs',
    stock: 64,
    imageUrl: '/src/assets/images/product_surgical_instruments_1795535749084.jpg',
    description:
      'Individually sealed 12-ply absorbent surgical gauze swabs for safe post-operative wound care and clinic dressing stations.',
    manufacturer: 'MedCare Surgical',
    requiresPrescription: false,
    featured: false,
  },
];
