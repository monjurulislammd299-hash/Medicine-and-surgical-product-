/**
 * Adversarial Security Rules Specification Tests ("Dirty Dozen")
 * Verifies invariants documented in security_spec.md against firestore.rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
  enforcingRule: string;
}

export const dirtyDozenPayloads: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Product Creation',
    operation: 'create',
    path: '/products/prod-test-1',
    auth: null,
    payload: { name: 'Fake Medicine', price: 100 },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isVerifiedUser() && isAdmin()',
  },
  {
    id: 2,
    name: 'Customer Price Tampering',
    operation: 'update',
    path: '/products/prod-test-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: { price: 1 },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isAdmin() required for product update',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Order Create',
    operation: 'create',
    path: '/orders/ord-shadow-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: {
      userId: 'customer-1',
      status: 'Pending',
      isAdminOverride: true,
    },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isValidOrder() data.keys().hasOnly(...)',
  },
  {
    id: 4,
    name: 'Identity Spoofing on Order Create',
    operation: 'create',
    path: '/orders/ord-spoof-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: {
      userId: 'customer-2',
      status: 'Pending',
    },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'incoming().userId == request.auth.uid',
  },
  {
    id: 5,
    name: 'Order Status Shortcutting on Create',
    operation: 'create',
    path: '/orders/ord-shortcut-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: {
      userId: 'customer-1',
      status: 'Delivered',
    },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: "incoming().status == 'Pending'",
  },
  {
    id: 6,
    name: 'Unverified Email Admin Spoofing',
    operation: 'create',
    path: '/products/prod-spoof-admin',
    auth: { uid: 'attacker-1', email: 'monjurulislammd299@gmail.com', email_verified: false },
    payload: { name: 'Spoofed Item', price: 0 },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isVerifiedUser() enforces email_verified == true',
  },
  {
    id: 7,
    name: 'PII Cross-User Order Read',
    operation: 'get',
    path: '/orders/order-owned-by-customer-1',
    auth: { uid: 'customer-2', email: 'other@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'existing().userId == request.auth.uid || isAdmin()',
  },
  {
    id: 8,
    name: 'Blanket Order List Scraping',
    operation: 'list',
    path: '/orders',
    auth: { uid: 'customer-2', email: 'other@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'resource.data.userId == request.auth.uid || isBootstrappedAdmin()',
  },
  {
    id: 9,
    name: 'Terminal State Mutation by Customer',
    operation: 'update',
    path: '/orders/delivered-order-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: { status: 'Pending' },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: "existing().status == 'Pending' && incoming().status == 'Cancelled'",
  },
  {
    id: 10,
    name: 'Client Timestamp Forgery',
    operation: 'create',
    path: '/orders/ord-time-forgery',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'incoming().createdAt == request.time',
  },
  {
    id: 11,
    name: 'ID Poisoning & Resource Exhaustion',
    operation: 'create',
    path: `/orders/${'a'.repeat(300)}`,
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: { address: 'x'.repeat(1000) },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isValidId(orderId) && isValidString(data.address, 5, 400)',
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Privilege Escalation',
    operation: 'create',
    path: '/admins/customer-1',
    auth: { uid: 'customer-1', email: 'customer@example.com', email_verified: true },
    payload: { email: 'customer@example.com', grantedBy: 'customer-1' },
    expectedResult: 'PERMISSION_DENIED',
    enforcingRule: 'isBootstrappedAdmin() required on /admins/{adminId}',
  },
];
