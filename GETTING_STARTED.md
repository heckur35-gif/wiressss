# WireBazaar - Quick Start Guide (5 Minutes)

## ⚡ TL;DR - Fast Setup

### 1. Run SQL Migrations (2 min)

Go to [Supabase Dashboard](https://app.supabase.com) → **SQL Editor** → **New Query**

Copy and paste BOTH SQL blocks from `SUPABASE_MIGRATION_INSTRUCTIONS.md` and execute.

### 2. Add Owner Account (1 min)

After executing migrations, go to **Authentication** → **Users** and copy your user ID.

Then go to **SQL Editor** → **New Query** and run:

```sql
INSERT INTO owner_credentials (user_id) 
VALUES ('paste-your-user-id-here');
```

### 3. Start Dev Server (2 min)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

### 4. Test the App (1 min)

1. ✅ Sign up with your phone + OTP
2. ✅ Browse products
3. ✅ Add items to cart
4. ✅ Checkout and complete payment
5. ✅ View your orders

---

## 🎯 Main Features

| Feature | User | Owner | Status |
|---------|------|-------|--------|
| Phone + OTP Login | ✅ | ✅ | Complete |
| Browse Products | ✅ | ✅ | Complete |
| Add to Cart | ✅ | - | Complete |
| Checkout | ✅ | - | Complete |
| UPI Payment | ✅ | - | Complete |
| Mark Payment Done | ✅ | - | Complete ✨ |
| Track Orders | ✅ | - | Complete |
| View All Orders | - | ✅ | Complete |
| Update Order Status | - | ✅ | Complete |
| Manage Products | - | ✅ | Complete |
| Real-Time Sync | ✅ | ✅ | Complete ✨ |

---

## 📍 Key Pages

### For Customers
- `/` - Home page
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/order-confirmation/:id` - Order confirmation
- `/orders` - My orders
- `/inquiry` - Submit inquiry
- `/profile` - My profile

### For Owner
- `/owner/login` - Owner login
- `/owner` - Admin dashboard
  - Products tab → Manage products
  - Orders tab → Manage all orders
  - Inquiries tab → Manage inquiries

---

## 🔑 Login Credentials

### Create Your Own Account
1. Click "Login / Sign Up" in header
2. Choose "OTP Login" tab
3. Enter your phone number
4. Enter 6-digit OTP from SMS

**Note**: Owner access requires being added to `owner_credentials` table in Supabase

---

## 🚀 What Happens When...

### Customer Logs In
1. Enters phone number
2. Receives SMS with OTP
3. Verifies OTP
4. Logged in with session saved

### Customer Adds Product to Cart
1. Product saved to localStorage
2. If logged in, also saved to Supabase
3. Cart syncs across tabs/devices

### Customer Checks Out
1. Fills delivery address
2. Sees UPI QR code
3. Scans with UPI app (GPay, PhonePe, etc.)
4. Completes payment in app
5. Returns and clicks "Payment Done"
6. Order saved to Supabase with status "Paid"

### Owner Adds Product
1. Fills product form
2. Clicks "Create Product"
3. Product instantly appears for ALL users
4. No refresh needed - real-time sync!

### Owner Updates Order
1. Goes to Orders tab
2. Changes status dropdown
3. Status updates in Supabase
4. Customer sees updated status

---

## 📦 What's Included

✅ **Complete Backend** - Supabase (no external server)  
✅ **Phone OTP Auth** - SMS verification  
✅ **Product Management** - Owner can manage catalog  
✅ **Real-Time Sync** - Changes appear instantly  
✅ **Shopping Cart** - Add, edit, remove items  
✅ **Checkout** - Address validation, shipping calc  
✅ **UPI Payment** - QR code integration  
✅ **Order Tracking** - Customer and owner views  
✅ **Responsive Design** - Mobile, tablet, desktop  
✅ **Error Handling** - Graceful error messages  
✅ **Data Security** - RLS policies  

---

## 🐛 Troubleshooting

### "OTP not received"
- Check SMS inbox (including spam)
- Wait 30-60 seconds
- Check phone number format (e.g., +91...)

### "Products not loading"
- Refresh page
- Check Supabase connection (console errors)
- Verify database tables exist

### "Cannot access owner dashboard"
- Ensure you're registered as owner in `owner_credentials` table
- Try logging out and back in
- Check console for errors

### "Order not saving"
- Check internet connection
- Verify all form fields are filled
- Check browser console for errors
- Try placing order again

---

## 📚 Documentation

- **`COMPLETE_SETUP.md`** - Detailed setup guide
- **`SUPABASE_MIGRATION_INSTRUCTIONS.md`** - SQL migrations
- **`TESTING_CHECKLIST.md`** - Test all features
- **`IMPLEMENTATION_SUMMARY.md`** - What's been built

---

## 🌍 Deploy to Production

### Option 1: Netlify (Recommended)

```bash
# 1. Build the app
npm run build

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Go to netlify.com
# 4. Connect your GitHub repo
# 5. Add environment variables:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
# 6. Deploy!
```

### Option 2: Vercel

Similar to Netlify - push to GitHub and import in Vercel.

### Option 3: Any Node.js Host

1. Run `npm run build`
2. Deploy the `dist` folder
3. Add environment variables
4. Done!

---

## 🎨 Customization Tips

### Change App Name
1. Update `<title>` in `index.html`
2. Update logo in `src/components/layout/SiteHeader.tsx`
3. Update text in pages

### Add More Products
Login as owner and use the Products management panel in Owner Dashboard

### Change Brand Colors
Edit `tailwind.config.ts` → `theme.extend.colors`

### Update Shipping Costs
Edit `calculateShippingCost()` in `src/lib/order-storage.ts`

---

## 🆘 Need Help?

1. Check `TESTING_CHECKLIST.md` for step-by-step verification
2. Check Supabase console for database errors
3. Open browser console (F12) for error details
4. Check git commit history for what changed

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Supabase migrations executed successfully
- [ ] Owner account added to owner_credentials
- [ ] Dev server running without errors
- [ ] Can sign up with phone + OTP
- [ ] Can view products
- [ ] Can add items to cart
- [ ] Can complete checkout
- [ ] Can mark payment as done
- [ ] Can view orders
- [ ] Owner can access dashboard
- [ ] Real-time product sync working

---

## 🎉 You're Ready!

The app is now ready to use. Start with:

1. **Test as customer**: Browse → Add to cart → Checkout → Order
2. **Test as owner**: Add product → See real-time sync → Manage orders

---

**Questions?** Check `COMPLETE_SETUP.md` or `TESTING_CHECKLIST.md`

**Ready to deploy?** Follow deployment instructions above.

**Made with ❤️ using React, Supabase, and TailwindCSS**
