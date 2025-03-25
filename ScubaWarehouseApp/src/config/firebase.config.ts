/**
 * Firebase configuration for the ScubaWarehouse app
 */

// Firebase configuration details
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with actual API key in production
  authDomain: "scubawarehouse-app.firebaseapp.com",
  databaseURL: "https://scubawarehouse-app.firebaseio.com",
  projectId: "scubawarehouse-app",
  storageBucket: "scubawarehouse-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-ABCDEF1234"
};

// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  PRICES: 'prices',
  COMPETITOR_PRICES: 'competitor_prices',
  USERS: 'users',
  ORDERS: 'orders'
};

// Firebase database structures
export const DB_STRUCTURE = {
  PRODUCT: {
    id: '',
    name: '',
    description: '',
    price: 0,
    brand: '',
    category: '',
    experienceLevel: '',
    specifications: {},
    images: [],
    inStock: true,
    featured: false,
    createdAt: '',
    updatedAt: ''
  },
  PRICE: {
    productId: '',
    amount: 0,
    currency: 'SGD',
    effectiveDate: '',
    expirationDate: '',
    isPromotion: false
  },
  COMPETITOR_PRICE: {
    productId: '',
    competitorName: '',
    competitorUrl: '',
    price: 0,
    currency: 'SGD',
    lastChecked: '',
    isInStock: true
  }
};

// Database indexes for optimized queries
export const DB_INDEXES = [
  {
    collection: COLLECTIONS.PRODUCTS,
    fields: ['category', 'brand', 'price', 'experienceLevel']
  },
  {
    collection: COLLECTIONS.COMPETITOR_PRICES,
    fields: ['productId', 'competitorName', 'lastChecked']
  }
];
