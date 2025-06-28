import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'welcome': 'Welcome to AgriSense',
      'login': 'Login',
      'logout': 'Logout',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'settings': 'Settings',
      'search': 'Search',
      'filter': 'Filter',
      'save': 'Save',
      'cancel': 'Cancel',
      'submit': 'Submit',
      'loading': 'Loading...',
      'error': 'Error occurred',
      
      // Authentication
      'phone_number': 'Phone Number',
      'enter_otp': 'Enter OTP',
      'verify': 'Verify',
      'resend_otp': 'Resend OTP',
      
      // Farmer
      'my_crops': 'My Crops',
      'add_crop': 'Add Crop',
      'crop_listings': 'Crop Listings',
      'market_intelligence': 'Market Intelligence',
      'transaction_history': 'Transaction History',
      'inquiries': 'Inquiries',
      'shopfront': 'My Shopfront',
      
      // Buyer
      'browse_crops': 'Browse Crops',
      'crop_details': 'Crop Details',
      'contact_farmer': 'Contact Farmer',
      'leave_review': 'Leave Review',
      
      // Crops
      'crop_name': 'Crop Name',
      'variety': 'Variety',
      'quantity': 'Quantity',
      'price_per_unit': 'Price per Unit',
      'harvest_date': 'Harvest Date',
      'condition': 'Condition',
      'location': 'Location',
      'description': 'Description',
      
      // Status
      'fresh': 'Fresh',
      'good': 'Good',
      'fair': 'Fair',
      'available': 'Available',
      'sold_out': 'Sold Out',
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    }
  },
  fil: {
    translation: {
      // Common
      'welcome': 'Maligayang Pagdating sa AgriSense',
      'login': 'Mag-login',
      'logout': 'Mag-logout',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'settings': 'Mga Setting',
      'search': 'Maghanap',
      'filter': 'I-filter',
      'save': 'I-save',
      'cancel': 'Kanselahin',
      'submit': 'Ipasa',
      'loading': 'Naglo-load...',
      'error': 'May nangyaring error',
      
      // Authentication
      'phone_number': 'Numero ng Telepono',
      'enter_otp': 'Ilagay ang OTP',
      'verify': 'I-verify',
      'resend_otp': 'Muling Ipadala ang OTP',
      
      // Farmer
      'my_crops': 'Aking mga Pananim',
      'add_crop': 'Magdagdag ng Pananim',
      'crop_listings': 'Listahan ng mga Pananim',
      'market_intelligence': 'Market Intelligence',
      'transaction_history': 'Kasaysayan ng Transaksyon',
      'inquiries': 'Mga Tanong',
      'shopfront': 'Aking Tindahan',
      
      // Buyer
      'browse_crops': 'Mag-browse ng mga Pananim',
      'crop_details': 'Detalye ng Pananim',
      'contact_farmer': 'Makipag-ugnayan sa Magsasaka',
      'leave_review': 'Mag-iwan ng Review',
      
      // Crops
      'crop_name': 'Pangalan ng Pananim',
      'variety': 'Uri',
      'quantity': 'Dami',
      'price_per_unit': 'Presyo bawat Piraso',
      'harvest_date': 'Petsa ng Pag-ani',
      'condition': 'Kondisyon',
      'location': 'Lokasyon',
      'description': 'Paglalarawan',
      
      // Status
      'fresh': 'Sariwang-sariwa',
      'good': 'Mabuti',
      'fair': 'Pwede na',
      'available': 'Available',
      'sold_out': 'Ubos na',
      'pending': 'Naghihintay',
      'approved': 'Aprubado',
      'rejected': 'Hindi Aprubado'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;