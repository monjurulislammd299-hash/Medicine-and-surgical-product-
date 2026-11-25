import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestoreErrors';
import { LIMITS, generateTrackingId, normalizePhoneDigits, slugifyProductId } from '../lib/validation';
import {
  ADMIN_EMAIL,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  STARTER_PRODUCTS,
  UserProfile,
} from '../types';

export type ActiveView = 'store' | 'admin';

interface CheckoutPayload {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  notes: string;
  saveProfile: boolean;
}

interface StoreContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginDialogOpen: boolean;
  setLoginDialogOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  logout: () => Promise<void>;

  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  searchTerm: string;
  setSearchTerm: (q: string) => void;
  selectedCategory: 'ALL' | ProductCategory;
  setSelectedCategory: (cat: 'ALL' | ProductCategory) => void;
  categoryModalOpen: boolean;
  setCategoryModalOpen: (open: boolean) => void;

  products: Product[];
  productsLoading: boolean;
  isCatalogSeeded: boolean;
  seedStarterCatalog: () => Promise<void>;
  addProduct: (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  myOrders: Order[];
  ordersLoading: boolean;
  allOrders: Order[];
  adminOrdersLoading: boolean;
  profile: UserProfile | null;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  ordersModalOpen: boolean;
  setOrdersModalOpen: (open: boolean) => void;
  trackingModalOpen: boolean;
  setTrackingModalOpen: (open: boolean) => void;
  updateUserProfile: (input: {
    displayName: string;
    phone: string;
    address: string;
    city: string;
  }) => Promise<void>;
  placeOrder: (payload: CheckoutPayload) => Promise<Order>;
  cancelMyOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes: string) => Promise<void>;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'msp_cart_v1';

function toMillis(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'object' && val !== null && 'toMillis' in val && typeof (val as { toMillis: () => number }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  if (val instanceof Date) return val.getTime();
  return 0;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authTick, setAuthTick] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hash === '#admin' || window.location.pathname === '/admin')
    ) {
      return 'admin';
    }
    return 'store';
  });

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveView('admin');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProductCategory>('ALL');

  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser) {
        const isOwnerEmail =
          nextUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          nextUser.emailVerified;
        if (isOwnerEmail) {
          setIsAdminDoc(true);
        } else {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
            setIsAdminDoc(adminSnap.exists());
          } catch {
            setIsAdminDoc(false);
          }
        }
      } else {
        setIsAdminDoc(false);
        setMyOrders([]);
        setAllOrders([]);
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || isAdminDoc),
  );

  // Public catalog subscription
  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      productsQuery,
      (snapshot) => {
        const items: Product[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
        setFirestoreProducts(items);
        setProductsLoading(false);
      },
      (error) => {
        setProductsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'products');
      },
    );
    return () => unsub();
  }, []);

  // Customer private profile + personal orders subscription
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const ordersPath = 'orders';
    const q = query(collection(db, ordersPath), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Order, 'id'>),
          }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setMyOrders(list);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      },
    );

    const profilePath = `users/${user.uid}/private/profile`;
    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid, 'private', 'profile'),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, profilePath);
      },
    );

    return () => {
      unsubOrders();
      unsubProfile();
    };
  }, [authReady, user, authTick]);

  // Admin orders subscription
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setAdminOrdersLoading(false);
      return;
    }

    setAdminOrdersLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Order, 'id'>),
        }));
        setAllOrders(list);
        setAdminOrdersLoading(false);
      },
      (error) => {
        setAdminOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'orders');
      },
    );

    return () => unsub();
  }, [authReady, isAdmin]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const formatAuthError = (error: unknown): string => {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'Firebase Console-এ Email/Password Sign-in পদ্ধতি চালু করা হয়নি। Authentication > Sign-in method থেকে Email/Password Enable করুন।';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      case 'auth/email-already-in-use':
        return 'এই ইমেইল দিয়ে ইতিমধ্যেই অ্যাকাউন্ট তৈরি করা আছে।';
      case 'auth/weak-password':
        return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      case 'auth/invalid-email':
        return 'সঠিক ইমেইল ঠিকানা লিখুন।';
      case 'auth/too-many-requests':
        return 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      default:
        return error instanceof Error ? error.message : 'লগইন ব্যর্থ হয়েছে।';
    }
  };

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setLoginDialogOpen(false);
      showToast('সফলভাবে লগইন সম্পন্ন হয়েছে।');
    } catch (error) {
      setAuthError(formatAuthError(error));
    }
  }, [showToast]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user.emailVerified) {
          setLoginDialogOpen(false);
          showToast('সফলভাবে লগইন সম্পন্ন হয়েছে।');
        } else {
          showToast('অর্ডার করতে অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।');
        }
      } catch (error) {
        setAuthError(formatAuthError(error));
        throw error;
      }
    },
    [showToast],
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setAuthError(null);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName && displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
        await sendEmailVerification(cred.user);
        showToast('রেজিস্ট্রেশন সফল হয়েছে! ইমেইলে পাঠানো লিংক দিয়ে ভেরিফাই করুন।');
      } catch (error) {
        setAuthError(formatAuthError(error));
        throw error;
      }
    },
    [showToast],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      setAuthError(null);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        showToast('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
      } catch (error) {
        setAuthError(formatAuthError(error));
        throw error;
      }
    },
    [showToast],
  );

  const resendVerification = useCallback(async () => {
    if (!auth.currentUser) return;
    setAuthError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      showToast('নতুন ভেরিফিকেশন ইমেইল পাঠানো হয়েছে।');
    } catch (error) {
      setAuthError(formatAuthError(error));
    }
  }, [showToast]);

  const refreshVerification = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    if (refreshed.emailVerified) {
      await refreshed.getIdToken(true);
      setUser(refreshed);
      setAuthTick((t) => t + 1);
      setLoginDialogOpen(false);
      showToast('ইমেইল ভেরিফিকেশন সফল হয়েছে!');
      return true;
    }
    showToast('ইমেইল এখনো ভেরিফাই হয়নি। ইনবক্স বা স্প্যাম ফোল্ডার দেখুন।');
    return false;
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfileModalOpen(false);
    setOrdersModalOpen(false);
    setTrackingModalOpen(false);
    setActiveView('store');
    showToast('লগআউট সম্পন্ন হয়েছে।');
  }, [showToast]);

  const updateUserProfile = useCallback(
    async (input: {
      displayName: string;
      phone: string;
      address: string;
      city: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setProfileModalOpen(false);
        setLoginDialogOpen(true);
        throw new Error('প্রোফাইল সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন।');
      }
      if (!currentUser.emailVerified) {
        setProfileModalOpen(false);
        setLoginDialogOpen(true);
        throw new Error('প্রোফাইল সংরক্ষণ করতে আগে ইমেইল ভেরিফাই করুন।');
      }

      const displayName = input.displayName.trim().slice(0, LIMITS.ORDER_NAME_MAX);
      const phone = normalizePhoneDigits(input.phone).slice(0, LIMITS.ORDER_PHONE_MAX);
      const address = input.address.trim().slice(0, LIMITS.ORDER_ADDRESS_MAX);
      const city = input.city.trim().slice(0, LIMITS.ORDER_CITY_MAX);

      if (displayName !== (currentUser.displayName ?? '')) {
        await updateProfile(currentUser, { displayName });
      }

      const profilePath = `users/${currentUser.uid}/private/profile`;
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'private', 'profile'), {
          userId: currentUser.uid,
          email: (currentUser.email || 'customer@example.com').slice(0, 200),
          displayName,
          phone,
          address,
          city,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, profilePath);
      }

      setUser(currentUser);
      setAuthTick((t) => t + 1);
      showToast('প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
    },
    [showToast],
  );

  const isCatalogSeeded = firestoreProducts.length > 0;
  const products = useMemo<Product[]>(() => {
    if (firestoreProducts.length > 0) return firestoreProducts;
    return STARTER_PRODUCTS.map((p) => ({ ...p }));
  }, [firestoreProducts]);

  const seedStarterCatalog = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const batch = writeBatch(db);
      for (const item of STARTER_PRODUCTS) {
        const ref = doc(db, 'products', item.id);
        batch.set(ref, {
          name: item.name.slice(0, LIMITS.PRODUCT_NAME_MAX),
          nameBn: item.nameBn.slice(0, LIMITS.PRODUCT_NAME_BN_MAX),
          category: item.category,
          price: item.price,
          unit: item.unit.slice(0, LIMITS.PRODUCT_UNIT_MAX),
          stock: item.stock,
          imageUrl: item.imageUrl.slice(0, LIMITS.PRODUCT_IMAGE_MAX),
          description: item.description.slice(0, LIMITS.PRODUCT_DESC_MAX),
          manufacturer: item.manufacturer.slice(0, LIMITS.PRODUCT_MANUFACTURER_MAX),
          requiresPrescription: item.requiresPrescription,
          featured: item.featured,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      showToast('প্রাথমিক ৮টি পণ্য Firestore-এ সংরক্ষণ করা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  }, [isAdmin, showToast]);

  // Auto-seed catalog once when verified Admin visits and Firestore products collection is empty
  useEffect(() => {
    if (authReady && isAdmin && !productsLoading && firestoreProducts.length === 0) {
      void seedStarterCatalog();
    }
  }, [authReady, isAdmin, productsLoading, firestoreProducts.length, seedStarterCatalog]);

  const addProduct = useCallback(
    async (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = slugifyProductId(input.name);
      const path = `products/${id}`;
      try {
        await setDoc(doc(db, 'products', id), {
          name: input.name.trim().slice(0, LIMITS.PRODUCT_NAME_MAX),
          nameBn: input.nameBn.trim().slice(0, LIMITS.PRODUCT_NAME_BN_MAX),
          category: input.category,
          price: Math.max(0, Math.min(LIMITS.PRODUCT_PRICE_MAX, Number(input.price))),
          unit: input.unit.trim().slice(0, LIMITS.PRODUCT_UNIT_MAX),
          stock: Math.max(0, Math.min(LIMITS.PRODUCT_STOCK_MAX, Math.floor(Number(input.stock)))),
          imageUrl: input.imageUrl.trim().slice(0, LIMITS.PRODUCT_IMAGE_MAX),
          description: input.description.trim().slice(0, LIMITS.PRODUCT_DESC_MAX),
          manufacturer: input.manufacturer.trim().slice(0, LIMITS.PRODUCT_MANUFACTURER_MAX),
          requiresPrescription: Boolean(input.requiresPrescription),
          featured: Boolean(input.featured),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('নতুন পণ্য যোগ করা হয়েছে।');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [showToast],
  );

  const updateProduct = useCallback(
    async (id: string, input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const path = `products/${id}`;
      try {
        await updateDoc(doc(db, 'products', id), {
          name: input.name.trim().slice(0, LIMITS.PRODUCT_NAME_MAX),
          nameBn: input.nameBn.trim().slice(0, LIMITS.PRODUCT_NAME_BN_MAX),
          category: input.category,
          price: Math.max(0, Math.min(LIMITS.PRODUCT_PRICE_MAX, Number(input.price))),
          unit: input.unit.trim().slice(0, LIMITS.PRODUCT_UNIT_MAX),
          stock: Math.max(0, Math.min(LIMITS.PRODUCT_STOCK_MAX, Math.floor(Number(input.stock)))),
          imageUrl: input.imageUrl.trim().slice(0, LIMITS.PRODUCT_IMAGE_MAX),
          description: input.description.trim().slice(0, LIMITS.PRODUCT_DESC_MAX),
          manufacturer: input.manufacturer.trim().slice(0, LIMITS.PRODUCT_MANUFACTURER_MAX),
          requiresPrescription: Boolean(input.requiresPrescription),
          featured: Boolean(input.featured),
          updatedAt: serverTimestamp(),
        });
        showToast('পণ্যের তথ্য আপডেট করা হয়েছে।');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [showToast],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const path = `products/${id}`;
      try {
        await deleteDoc(doc(db, 'products', id));
        showToast('পণ্য তালিকা থেকে মুছে ফেলা হয়েছে।');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [showToast],
  );

  const addToCart = useCallback(
    (product: Product, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(500, item.quantity + qty) }
              : item,
          );
        }
        if (prev.length >= LIMITS.ORDER_ITEMS_MAX) {
          return prev;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            nameBn: product.nameBn,
            price: product.price,
            quantity: Math.max(1, qty),
            unit: product.unit,
            imageUrl: product.imageUrl,
          },
        ];
      });
      showToast(`${product.name} কার্টে যোগ হয়েছে`);
    },
    [showToast],
  );

  const updateCartQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(500, qty) }
          : item,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const placeOrder = useCallback(
    async (payload: CheckoutPayload): Promise<Order> => {
      if (!user) {
        setLoginDialogOpen(true);
        throw new Error('অর্ডার সম্পন্ন করতে অনুগ্রহ করে লগইন করুন।');
      }
      if (cart.length === 0) {
        throw new Error('আপনার কার্ট খালি রয়েছে।');
      }

      const trackingId = generateTrackingId();
      const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee =
        subtotal >= 2000 ? 0 : payload.city.trim().toLowerCase() === 'dhaka' ? 60 : 120;
      const total = subtotal + deliveryFee;

      const sanitizedItems = cart.slice(0, LIMITS.ORDER_ITEMS_MAX).map((i) => ({
        productId: i.productId,
        name: i.name.slice(0, LIMITS.PRODUCT_NAME_MAX),
        nameBn: i.nameBn.slice(0, LIMITS.PRODUCT_NAME_BN_MAX),
        price: i.price,
        quantity: Math.max(1, Math.min(500, Math.floor(i.quantity))),
        unit: i.unit.slice(0, LIMITS.PRODUCT_UNIT_MAX),
        imageUrl: i.imageUrl.slice(0, LIMITS.PRODUCT_IMAGE_MAX),
      }));

      const orderDocData = {
        userId: user.uid,
        customerEmail: (user.email || 'customer@example.com').slice(0, 200),
        customerName: payload.customerName.trim().slice(0, LIMITS.ORDER_NAME_MAX),
        phone: payload.phone.trim().slice(0, LIMITS.ORDER_PHONE_MAX),
        address: payload.address.trim().slice(0, LIMITS.ORDER_ADDRESS_MAX),
        city: payload.city.trim().slice(0, LIMITS.ORDER_CITY_MAX),
        trackingId,
        items: sanitizedItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: payload.paymentMethod,
        status: 'Pending' as OrderStatus,
        notes: payload.notes.trim().slice(0, LIMITS.ORDER_NOTES_MAX),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderPath = `orders/${orderId}`;
      try {
        await setDoc(doc(db, 'orders', orderId), orderDocData);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, orderPath);
      }

      if (payload.saveProfile) {
        const profilePath = `users/${user.uid}/private/profile`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
            userId: user.uid,
            email: (user.email || 'customer@example.com').slice(0, 200),
            displayName: payload.customerName.trim().slice(0, 120),
            phone: payload.phone.trim().slice(0, 30),
            address: payload.address.trim().slice(0, 400),
            city: payload.city.trim().slice(0, 80),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, profilePath);
        }
      }

      clearCart();
      showToast(`অর্ডার সম্পন্ন হয়েছে! Tracking ID: ${trackingId}`);

      return {
        id: orderId,
        ...orderDocData,
      };
    },
    [user, cart, clearCart, showToast],
  );

  const cancelMyOrder = useCallback(
    async (orderId: string) => {
      const path = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'Cancelled',
          updatedAt: serverTimestamp(),
        });
        showToast('অর্ডার বাতিল করা হয়েছে।');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [showToast],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, notes: string) => {
      const path = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          notes: notes.trim().slice(0, LIMITS.ORDER_NOTES_MAX),
          updatedAt: serverTimestamp(),
        });
        showToast(`অর্ডার স্ট্যাটাস "${status}" হিসেবে আপডেট হয়েছে।`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [showToast],
  );

  const value: StoreContextValue = {
    user,
    authReady,
    isAdmin,
    authError,
    clearAuthError,
    loginDialogOpen,
    setLoginDialogOpen,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    resendVerification,
    refreshVerification,
    logout,
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categoryModalOpen,
    setCategoryModalOpen,
    products,
    productsLoading,
    isCatalogSeeded,
    seedStarterCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    myOrders,
    ordersLoading,
    allOrders,
    adminOrdersLoading,
    profile,
    profileModalOpen,
    setProfileModalOpen,
    ordersModalOpen,
    setOrdersModalOpen,
    trackingModalOpen,
    setTrackingModalOpen,
    updateUserProfile,
    placeOrder,
    cancelMyOrder,
    updateOrderStatus,
    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
