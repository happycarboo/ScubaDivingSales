/**
 * ProductRepository - Handles all product-related database operations
 */

import { firebase } from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../../config/firebase.config';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  experienceLevel: string;
  specifications?: Record<string, any>;
  images?: string[];
  inStock?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class ProductRepository {
  private db = firebase.firestore();
  private productsCollection = this.db.collection(COLLECTIONS.PRODUCTS);
  
  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    try {
      const snapshot = await this.productsCollection.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }
  
  /**
   * Get a product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const doc = await this.productsCollection.doc(productId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    } catch (error) {
      console.error(`Error getting product with ID ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Get products based on filter criteria
   */
  async getFilteredProducts(filters: Record<string, any>): Promise<Product[]> {
    try {
      let query: any = this.productsCollection;
      
      // Apply filters
      if (filters.Category) {
        query = query.where('category', '==', filters.Category);
      }
      
      if (filters.Brand) {
        query = query.where('brand', '==', filters.Brand);
      }
      
      if (filters.Experience) {
        query = query.where('experienceLevel', '==', filters.Experience);
      }
      
      // Price filtering requires client-side filtering since Firestore can't do range queries
      // on multiple fields when using the free tier
      const snapshot = await query.get();
      
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Apply price filter if specified
      if (filters.Price) {
        let minPrice = 0;
        let maxPrice = Number.MAX_VALUE;
        
        switch (filters.Price) {
          case '$0-$100':
            maxPrice = 100;
            break;
          case '$100-$300':
            minPrice = 100;
            maxPrice = 300;
            break;
          case '$300-$500':
            minPrice = 300;
            maxPrice = 500;
            break;
          case '$500+':
            minPrice = 500;
            break;
        }
        
        results = results.filter(product => 
          product.price >= minPrice && product.price <= maxPrice
        );
      }
      
      return results;
    } catch (error) {
      console.error('Error getting filtered products:', error);
      return [];
    }
  }
  
  /**
   * Search products by name or description
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Firestore doesn't support full-text search, so we'll do a simple
      // client-side search based on startsWith for product names
      const snapshot = await this.productsCollection.get();
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
  
  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const snapshot = await this.productsCollection
        .where('featured', '==', true)
        .limit(10)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }
}
