# WireBazaar eCommerce App - Complete Setup Guide

## Overview

This is a complete eCommerce web application built with React, Vite, TailwindCSS, and Supabase. The app supports:

✅ Phone + OTP Login  
✅ Product Management by Owner  
✅ Real-time Product Sync Across All Users  
✅ Order Placement & Tracking  
✅ Payment Status Management  
✅ Customer Inquiries  
✅ Owner Dashboard with Analytics  
✅ Responsive Mobile-First Design  

---

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Supabase Account** (free at https://supabase.com)
4. **Supabase Project** already created (Project ID: `duhsvsskqceltccieysz`)

---

## Step 1: Environment Setup

### 1.1 Create `.env` file

At the root of the project, create a `.env` file with these variables:

```env
VITE_SUPABASE_URL=https://duhsvsskqceltccieysz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1aHN2c3NrcWNlbHRjY2lleXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMjk5ODksImV4cCI6MjA3NTkwNTk4OX0.DHhl6PBWXiKsY21DyCSYRb05NQuGXwqHIDXeOUMjYPE
```

---

## Step 2: Supabase Database Setup

### 2.1 Enable Phone Authentication

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Phone**
3. Enable the provider
4. For development, you can use Supabase's default SMS provider
5. For production, configure Twilio or another SMS provider

### 2.2 Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy and paste the SQL from `SUPABASE_MIGRATION_INSTRUCTIONS.md`
3. Execute both migrations:
   - Migration 1: Create Tables
   - Migration 2: Enable RLS

### 2.3 Add Owner Credentials

1. Go to **Authentication** → **Users**
2. Note the User ID of your owner account
3. Go to **SQL Editor** → **New Query**
4. Run this SQL (replace with your actual user ID):

```sql
INSERT INTO owner_credentials (user_id) 
VALUES ('your-actual-user-id-here')
ON CONFLICT DO NOTHING;
```

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## User Workflows

### 1. Regular User (Customer)

#### Sign Up / Login

1. Click **"Login / Sign Up"** button in header
2. Choose **"OTP Login"** tab
3. Enter your phone number
4. Enter the 6-digit OTP received via SMS
5. You're logged in!

Alternatively, use **"Sign In"** or **"Sign Up"** tabs for email/password authentication.

#### Browse Products

1. Go to **Products** page
2. Browse, search, and filter products
3. Click **"View Details"** to see full product info
4. Add items to cart

#### Place Order

1. Go to **Cart** to review items
2. Adjust quantities or remove items
3. Click **"Proceed to Checkout"**
4. Fill in delivery address
5. Click **"Proceed to Payment"**
6. Scan UPI QR code with your UPI app (GPay, PhonePe, etc.)
7. Complete payment
8. Click **"I Have Completed Payment"**

#### Track Orders

1. Go to **My Orders**
2. View all your orders
3. See payment and delivery status
4. Click **"View Details"** for full order info

#### Submit Inquiry

1. Go to **Inquiry** page
2. Fill in product inquiry form
3. Submit
4. Track responses from owner in owner dashboard

#### View Profile

1. Click **"My Profile"** in header
2. View and update your profile information

### 2. Owner (Admin)

#### Owner Login

1. Go to **Owner Dashboard** button (home page)
2. Click on link or go to `/owner/login`
3. Enter phone number
4. Enter OTP
5. Owner dashboard opens (only if registered as owner)

#### Manage Products

1. Go to **Owner Dashboard** → **Products** tab
2. **View Products**: See all products with stock info
3. **Add Product**: Click **"Add Product"** button
4. **Edit Product**: Click **"Edit"** button on product row
5. **Delete Product**: Click **"Delete"** button
6. **Toggle Active**: Enable/disable product visibility

Products are instantly synced across all users in real-time!

#### View Orders

1. Go to **Owner Dashboard** → **Orders** tab
2. See all customer orders
3. **Update Order Status**: Change from dropdown menu
4. **Update Payment Status**: Change payment status
5. **Export Orders**: Download as CSV/Excel

#### View Inquiries

1. Go to **Owner Dashboard** → **Inquiries** tab
2. See all customer inquiries
3. View customer details and product inquiry info
4. Remove inquiries as needed
5. Refresh to see new inquiries

#### Export Data

In Orders tab, click **"Export to Excel"** button to download:
- All orders with customer details
- Product information
- Inquiry data

---

## Key Features

### Real-Time Product Sync

- When owner adds/edits/deletes a product, it instantly appears for all users
- Uses Supabase real-time subscriptions
- No page refresh needed

### Payment Management

- Users mark payment as done after completing UPI payment
- Owner can update payment status from admin dashboard
- No backend errors - all handled gracefully

### Security

- Phone number + OTP login (no passwords stored unnecessarily)
- Row Level Security (RLS) ensures:
  - Users see only their own orders/cart/inquiries
  - Owner can see all data
  - Products are public read-only
- User data is encrypted in transit (HTTPS)

### Responsive Design

- Mobile-first design
- Works on all screen sizes
- Touch-friendly interface
- Optimized for fast mobile networks

---

## Troubleshooting

### Issue: "OTP not received"

**Solution:**
- Check phone number format (+91 for India)
- Wait 30 seconds for SMS to arrive
- Check spam folder
- For development, Supabase provides test numbers (check Supabase docs)

### Issue: "Supabase is not configured"

**Solution:**
- Check `.env` file has correct credentials
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after updating `.env`

### Issue: "Products not showing"

**Solution:**
- Check database tables are created (SQL Editor → Tables)
- Verify RLS policies are enabled
- Check Supabase connection in browser console
- Try refreshing the page

### Issue: "Cannot access Owner Dashboard"

**Solution:**
- Ensure you're logged in as owner phone number
- Check that user_id is in `owner_credentials` table
- Try logging out and back in
- Check browser console for error messages

### Issue: "Order not saved"

**Solution:**
- Check internet connection
- Verify Supabase credentials
- Check order data is complete (all required fields)
- Check browser console for error messages
- Try placing order again

---

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── OTPDialog.tsx (Phone + OTP login)
│   │   └── AuthDialog.tsx (Email/Password login)
│   ├── dashboard/
│   │   ├── ProductsManagement.tsx
│   │   ├── OrdersManagement.tsx
│   │   └── InquiriesManagement.tsx
│   ├── layout/
│   │   └── SiteHeader.tsx
│   └── ui/ (Shadcn UI components)
├── context/
│   ├── UserAuthContext.tsx (Customer auth)
│   └── OwnerAuthContext.tsx (Owner auth)
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── use-realtime-products.ts (Real-time sync)
├── lib/
│   ├── supabase.ts (Supabase client)
│   ├── db-services.ts (All DB operations)
│   ├── cart-storage.ts (Cart management)
│   ├── order-storage.ts (Order management)
│   ├── inquiry-storage.ts (Inquiry management)
│   └── products-data.ts (Product data)
├── pages/
│   ├── Index.tsx (Home)
│   ├── Products.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── OrderConfirmation.tsx
│   ├── Inquiry.tsx
│   ├── OwnerDashboard.tsx
│   ├── OwnerLogin.tsx
│   ├── Profile.tsx
│   └── ... (other pages)
├── App.tsx (Main router)
└── main.tsx (Entry point)
```

---

## Deployment

### Deploy to Netlify (Recommended)

1. Push code to GitHub
2. Go to Netlify → Connect Git
3. Select repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

### Deploy to Vercel

1. Push code to GitHub
2. Go to Vercel → Import Project
3. Select repository
4. Add environment variables
5. Deploy!

---

## Performance Tips

- Products are cached with real-time updates
- Orders are fetched from Supabase with pagination (optional)
- Images are optimized (consider using image CDN)
- Cart is synced between browser tabs automatically

---

## API Endpoints (Supabase RPC)

All operations use Supabase client library:
- No custom API server needed
- All database operations use Supabase JavaScript SDK
- Real-time subscriptions for product updates
- RLS ensures data security

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn UI**: https://ui.shadcn.com

---

## License

This project is provided as-is for educational and commercial use.

---

## Next Steps

1. **Complete Database Setup** (run SQL migrations)
2. **Add Owner Account** (register yourself as owner)
3. **Add Sample Products** (via owner dashboard)
4. **Test User Flow** (place test order)
5. **Deploy to Production** (Netlify/Vercel)

---

**Built with ❤️ using React, Supabase, and TailwindCSS**
