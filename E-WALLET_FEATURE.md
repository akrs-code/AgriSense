# E-wallet QR Code Upload Feature

## Overview
This feature allows farmers/sellers to upload their e-wallet QR codes and payment details to their profile. When buyers choose e-wallet as a payment method during checkout, they can view the farmer's QR code and payment details to complete the transaction.

## Features Added

### For Farmers/Sellers:
1. **E-wallet Settings Tab** - New tab in Profile Settings (only visible to sellers)
2. **E-wallet Provider Selection** - Dropdown with popular options (GCash, Maya, PayPal, GrabPay, Other)
3. **Account Details Form** - Fields for account holder name and account number/mobile number
4. **QR Code Upload** - Drag-and-drop or click-to-upload QR code image
5. **QR Code Preview** - Preview uploaded QR code with option to change or remove
6. **Form Validation** - File size limit (5MB), image format validation

### For Buyers:
1. **Enhanced Order Details** - When selecting e-wallet payment, buyers see:
   - Farmer's e-wallet provider
   - Account holder name
   - Account number
   - QR code image (larger, more prominent display)
   - Payment instructions

## How to Use

### Setting up E-wallet (Farmers/Sellers):
1. Login as a seller/farmer
2. Go to Profile Settings (click profile icon → Profile Settings)
3. Click on "E-wallet Settings" tab
4. Fill in the form:
   - Select your e-wallet provider
   - Enter account holder name (as registered with e-wallet)
   - Enter account number/mobile number
   - Upload your QR code image
5. Click "Save E-wallet Settings"

### Making Payment (Buyers):
1. Add items to cart and proceed to checkout
2. Select "E-wallet" as payment method
3. After placing order, view order details to see:
   - Farmer's payment information
   - QR code to scan
   - Payment instructions
4. Scan QR code or manually enter payment details
5. Complete payment through your e-wallet app
6. Contact farmer to confirm payment

## Technical Implementation

### Data Structure
```typescript
interface eWalletDetails {
  provider: string;        // e.g., 'GCash', 'Maya'
  accountNumber: string;   // e.g., '09123456789'
  accountName: string;     // e.g., 'Juan Dela Cruz'
  qrCodeImage?: string;    // Base64 or URL to QR code image
}
```

### Components Modified:
- `src/components/shared/Settings.tsx` - Added E-wallet settings tab
- `src/components/buyer/MyOrders.tsx` - Enhanced payment details display
- `src/stores/authStore.ts` - Added e-wallet data handling
- `src/types/index.ts` - Already had eWalletDetails in Seller interface

### Key Features:
- File upload validation (5MB limit, image formats only)
- Responsive design for mobile and desktop
- Real-time preview of uploaded QR codes
- Form validation for required fields
- Toast notifications for success/error states
- Proper TypeScript typing

## Security Considerations

1. **File Upload Validation** - Only image files up to 5MB allowed
2. **Data Storage** - In production, QR codes should be stored in secure cloud storage
3. **Privacy** - E-wallet details only shown to buyers who place orders
4. **Validation** - Account details should be validated with e-wallet providers

## Future Enhancements

1. **QR Code Generation** - Auto-generate QR codes from account details
2. **Multiple E-wallets** - Allow farmers to add multiple e-wallet accounts
3. **Payment Verification** - Integration with e-wallet APIs for payment confirmation
4. **Payment History** - Track payments received through e-wallets
5. **Auto-notifications** - Notify farmers when payments are received

## Testing

To test the feature:
1. Login as a seller (use email containing "seller")
2. Navigate to Profile Settings → E-wallet Settings
3. Fill in the form and upload a QR code image
4. Login as a buyer and place an order with e-wallet payment
5. Check order details to see the farmer's payment information

## Files Modified:
- `src/components/shared/Settings.tsx`
- `src/components/buyer/MyOrders.tsx`  
- `src/stores/authStore.ts`