# WireBazaar - Complete Testing Checklist

Use this checklist to verify all features work correctly.

## Pre-Testing Setup

- [ ] Database migrations completed (SQL run in Supabase)
- [ ] Environment variables set (.env file)
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Owner account created and added to `owner_credentials` table

---

## Authentication Tests

### Phone + OTP Login (New User)

- [ ] Click "Login / Sign Up" in header
- [ ] Select "OTP Login" tab
- [ ] Enter valid phone number (e.g., +919876543210)
- [ ] Click "Send OTP"
- [ ] Receive SMS with 6-digit code
- [ ] Enter OTP code
- [ ] User is logged in successfully
- [ ] User profile appears in header
- [ ] Logout button appears in header

### Email/Password Sign Up

- [ ] Click "Login / Sign Up" in header
- [ ] Select "Sign Up" tab
- [ ] Enter full name, email, password
- [ ] Confirm password matches
- [ ] Account created successfully
- [ ] Can sign in with email/password

### Email/Password Login

- [ ] Click "Login / Sign Up" in header
- [ ] Select "Sign In" tab
- [ ] Enter email and password
- [ ] Login successful
- [ ] User profile loads correctly

### Logout

- [ ] While logged in, click logout button
- [ ] Logged out successfully
- [ ] Redirected to home page
- [ ] "Login / Sign Up" button appears again

---

## Product Management Tests

### View Products (Guest User)

- [ ] Go to Products page
- [ ] All products display with images, price, stock status
- [ ] Search functionality works
- [ ] Brand filter works
- [ ] Category filter works
- [ ] Product count displays correctly
- [ ] "Out of Stock" badge shows for zero stock items

### View Product Details

- [ ] Click "View Details" on any product
- [ ] Product page loads with full info
- [ ] Description, specifications visible
- [ ] "Add to Cart" button present
- [ ] Cannot add out-of-stock items to cart

### Owner: Add Product

- [ ] Login as owner (phone + OTP)
- [ ] Go to Owner Dashboard
- [ ] Click "Products" tab
- [ ] Click "Add Product" button
- [ ] Fill in all required fields
- [ ] Click "Create Product"
- [ ] Product appears in products list
- [ ] Product appears on Products page immediately (real-time)
- [ ] All users see new product without refresh

### Owner: Edit Product

- [ ] In Products tab, click "Edit" on a product
- [ ] Update product name, price, stock
- [ ] Click "Update Product"
- [ ] Changes appear immediately
- [ ] All users see updated product

### Owner: Delete Product

- [ ] In Products tab, click "Delete" on a product
- [ ] Confirm deletion
- [ ] Product removed from list
- [ ] Product removed from all users' views immediately

### Real-Time Sync Test

- [ ] Open Products page in 2 browser windows
- [ ] Add product in owner dashboard (first window)
- [ ] Second window updates without refresh
- [ ] Edit product in owner dashboard
- [ ] Second window updates automatically
- [ ] Delete product in owner dashboard
- [ ] Product disappears from second window

---

## Shopping Cart Tests

### Add to Cart

- [ ] Browse products
- [ ] Click "View Details" on a product
- [ ] Click "Add to Cart"
- [ ] Toast notification confirms item added
- [ ] Cart count updates in header
- [ ] Go to Cart page
- [ ] Item appears in cart

### Update Quantity

- [ ] In Cart page, increase quantity with "+" button
- [ ] Quantity updates
- [ ] Price updates correctly
- [ ] Decrease quantity with "-" button
- [ ] Quantity updates correctly
- [ ] Total amount recalculates

### Remove from Cart

- [ ] Click trash icon to remove item
- [ ] Item removed from cart
- [ ] Cart count updates in header
- [ ] Total updates correctly

### Cart Persistence

- [ ] Add items to cart
- [ ] Refresh page
- [ ] Items still in cart
- [ ] Close browser, reopen
- [ ] Items still in cart (if logged in)

---

## Checkout & Order Tests

### Proceed to Checkout

- [ ] Click "Checkout" button on Cart page
- [ ] Redirected to checkout page
- [ ] Order summary shows correct items and total
- [ ] Delivery address form appears
- [ ] Cart details appear on right side

### Fill Checkout Form

- [ ] Enter full name
- [ ] Enter email
- [ ] Enter phone number
- [ ] Enter address
- [ ] Enter pincode (6 digits)
- [ ] All validations work
- [ ] Form shows error for invalid inputs

### Proceed to Payment

- [ ] Click "Proceed to Payment"
- [ ] Payment page loads
- [ ] QR code displays
- [ ] Order number shown
- [ ] Total amount correct

### Complete Payment & Mark Done

- [ ] Scan UPI QR code with phone
- [ ] Complete payment in UPI app
- [ ] Return to payment page
- [ ] Click "I Have Completed Payment"
- [ ] Order confirmation page loads
- [ ] Order details display correctly
- [ ] "Mark Payment as Done" button present
- [ ] Click "Mark Payment as Done"
- [ ] Payment status changes to "Paid"
- [ ] No errors in console
- [ ] Toast shows success message

### Order Confirmation

- [ ] Order number displays
- [ ] Customer details shown correctly
- [ ] All items listed with quantities and prices
- [ ] Total amount calculation correct
- [ ] Estimated delivery date shown
- [ ] Payment status shows "Paid"
- [ ] "View All Orders" button works
- [ ] "Continue Shopping" button works

---

## Order Tracking Tests

### View My Orders (Customer)

- [ ] Login as customer
- [ ] Go to "My Orders"
- [ ] All customer's orders displayed
- [ ] Order number, date, status visible
- [ ] Payment status badge shows
- [ ] Order status badge shows
- [ ] Items count displayed

### View Order Details

- [ ] Click "View Details" on an order
- [ ] Order confirmation page loads
- [ ] All order details visible
- [ ] Items with prices shown
- [ ] Delivery address correct
- [ ] Estimated delivery date shown

### Owner: View All Orders

- [ ] Login as owner
- [ ] Go to Owner Dashboard
- [ ] Click "Orders" tab
- [ ] All customer orders displayed (not just own)
- [ ] Order count matches number of orders placed
- [ ] Revenue calculation correct

### Owner: Update Order Status

- [ ] In Orders tab, find an order
- [ ] Click status dropdown
- [ ] Select new status (e.g., "Processing")
- [ ] Status updates without error
- [ ] Toast shows success
- [ ] Status persists after refresh
- [ ] Customer sees updated status in their orders

### Owner: Update Payment Status

- [ ] In Orders tab, find an order with "Pending" payment
- [ ] Click payment status dropdown
- [ ] Select "Paid"
- [ ] Payment status updates without error
- [ ] Toast shows success
- [ ] Change persists after refresh

### Export Orders

- [ ] In Orders tab, click "Export to Excel"
- [ ] CSV file downloads
- [ ] File contains all order data
- [ ] All columns present (order number, customer, amount, etc.)

---

## Inquiry Tests

### Submit Inquiry (as Customer)

- [ ] Go to Inquiry page
- [ ] Fill in user type (Consumer/Business/Contractor)
- [ ] Fill in full name
- [ ] Fill in phone number
- [ ] Fill in email
- [ ] Fill in address
- [ ] Fill in pincode
- [ ] Fill in product name
- [ ] Fill in brand
- [ ] Fill in color
- [ ] Fill in quantity
- [ ] Click "Submit Inquiry"
- [ ] Toast shows success
- [ ] Inquiry appears in owner dashboard

### Owner: View Inquiries

- [ ] Login as owner
- [ ] Go to Owner Dashboard
- [ ] Click "Inquiries" tab
- [ ] All inquiries displayed in table
- [ ] Customer info shows correctly
- [ ] Product details displayed
- [ ] Inquiry date shown

### Owner: Manage Inquiries

- [ ] In Inquiries tab, click "Remove" on inquiry
- [ ] Inquiry removed from list
- [ ] Toast shows success

---

## Profile Tests

### View Profile

- [ ] Login as user
- [ ] Click "My Profile" in header
- [ ] Profile page loads
- [ ] User information displayed

### Edit Profile

- [ ] On profile page, fill in fields
- [ ] Update profile information
- [ ] Changes saved successfully
- [ ] Changes persist after refresh

---

## Responsive Design Tests

### Mobile View (375px width)

- [ ] Header collapses to hamburger menu
- [ ] Product grid shows 1 column
- [ ] Checkout form responsive
- [ ] All buttons clickable and sized properly
- [ ] Text readable without zooming

### Tablet View (768px width)

- [ ] Header shows navigation menu
- [ ] Product grid shows 2 columns
- [ ] All elements properly spaced
- [ ] Forms responsive

### Desktop View (1024px+ width)

- [ ] Full navigation bar visible
- [ ] Product grid shows 3+ columns
- [ ] Proper spacing and layout

---

## Error Handling Tests

### Network Error Handling

- [ ] Disconnect internet
- [ ] Try to place order
- [ ] Error message displays
- [ ] No system crash
- [ ] Reconnect internet
- [ ] Retry functionality works

### Invalid Input Handling

- [ ] Try checkout with invalid pincode
- [ ] Error message shows
- [ ] Form prevents submission
- [ ] Invalid email shows error
- [ ] Invalid phone shows error

### Supabase Connection Error

- [ ] If Supabase unreachable
- [ ] App gracefully falls back to localStorage
- [ ] Error logged to console (not shown to user)
- [ ] App remains functional

---

## Performance Tests

### Load Time

- [ ] Home page loads in < 2 seconds
- [ ] Products page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds

### Real-Time Response

- [ ] Products update within 1 second of owner change
- [ ] Cart updates instantly when modified
- [ ] Order status updates instantly

---

## Security Tests

### RLS Verification

- [ ] User cannot see other users' orders (verify in console)
- [ ] User cannot modify other users' orders
- [ ] Owner can see all orders
- [ ] Non-owner cannot add products
- [ ] Products are publicly readable

### Session Management

- [ ] Logout clears user session
- [ ] Cannot access protected pages without login
- [ ] Session persists on page refresh
- [ ] Session expires on browser close (configurable)

---

## Data Persistence Tests

### localStorage vs Supabase

- [ ] Orders saved to Supabase when user logged in
- [ ] Orders saved to localStorage as backup
- [ ] Supabase data priority over localStorage
- [ ] Cart syncs between browser tabs

---

## Cross-Browser Tests

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Final Verification

- [ ] No console errors
- [ ] No console warnings (except third-party)
- [ ] All features documented work
- [ ] App ready for production deployment

---

## Known Issues / Workarounds

(Add any known issues found during testing)

- Issue: ...
  - Workaround: ...

---

## Sign-Off

- **Tested By**: _______________
- **Date**: _______________
- **Status**: ☐ PASS ☐ FAIL ☐ PARTIAL

---

**Ready to Deploy**: ☐ YES ☐ NO
