# Security Specification — Medicine & Surgical Products

## 1. Data Invariants
1. **Product Catalog Integrity**: Only verified store administrators may create, update, or delete `/products/{productId}` documents. Prices and stock counts cannot be negative.
2. **Order Ownership & Identity Integrity**: Every `/orders/{orderId}` document must have `userId == request.auth.uid` on creation, verified email (`email_verified == true`), initial `status == 'Pending'`, and server-verified timestamps (`createdAt == request.time`, `updatedAt == request.time`).
3. **Order Financial Consistency**: `subtotal >= 0`, `deliveryFee >= 0`, `total == subtotal + deliveryFee`, and `items` is a bounded list (`1 <= items.size() <= 50`).
4. **Tiered Order Updates & Terminal State Locking**: Customers may only cancel their own `Pending` order (`status: 'Pending' -> 'Cancelled'`, modifying only `status` and `updatedAt`). Once `Delivered` or `Cancelled`, customers cannot modify the order. Only administrators can advance fulfillment statuses (`Confirmed`, `Packed`, `Shipped`, `Delivered`).
5. **PII Isolation**: Customer delivery addresses and phone numbers in `/orders/{orderId}` and `/users/{userId}/private/profile` are strictly inaccessible to other customers (`get` and `list` enforce `resource.data.userId == request.auth.uid` or admin).
6. **Privilege Escalation Prevention**: Users cannot write to `/admins/{adminId}` or forge admin status via unverified emails.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Product Creation**: Anonymous client attempts `create` on `/products/prod-1` -> **DENIED**.
2. **Customer Price Tampering**: Non-admin authenticated user attempts `update` on `/products/prod-1` setting `price: 1` -> **DENIED**.
3. **Shadow Field Injection on Order Create**: Authenticated user creates `/orders/ord-1` with an extra ghost key `isAdminOverride: true` -> **DENIED** by `hasOnly(...)`.
4. **Identity Spoofing on Order Create**: Authenticated user A creates `/orders/ord-1` with `userId: "user-B"` -> **DENIED** by `data.userId == request.auth.uid`.
5. **Order Status Shortcutting on Create**: Authenticated user creates `/orders/ord-1` with `status: "Delivered"` -> **DENIED** by `data.status == "Pending"`.
6. **Unverified Email Order Spoofing**: User with `email_verified: false` (even matching admin email) attempts to create order or read admin data -> **DENIED**.
7. **PII Cross-User Read**: Authenticated user B attempts `get` on `/orders/ord-of-user-A` -> **DENIED**.
8. **Blanket Order List Scraping**: Authenticated user B runs unfiltered `list` query on `/orders` without `where('userId', '==', uidB)` -> **DENIED** by `resource.data.userId == request.auth.uid`.
9. **Terminal State Mutation by Customer**: User A attempts to change their `Delivered` or `Cancelled` order back to `Pending` -> **DENIED**.
10. **Client Timestamp Forgery**: User A creates `/orders/ord-1` with backdated `createdAt` (`!= request.time`) -> **DENIED**.
11. **ID Poisoning / Resource Exhaustion**: Client writes to `/orders/<1500-char-id>` or injects `address` > 400 chars -> **DENIED** by `isValidId` and `.size()` checks.
12. **Self-Assigned Admin Privilege Escalation**: Non-admin user attempts `create` on `/admins/<uid>` -> **DENIED**.
