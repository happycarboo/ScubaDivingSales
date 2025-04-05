// Product Repository Implementation
// Single Responsibility Principle: Repository only handles product data operations
// Open/Closed Principle: Can be extended without modification
// Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { IProductRepository } from '../interfaces/IProductRepository';
import { FirebaseService } from '../FirebaseService';
import { Product, ProductFactory } from '../../../patterns/factory/ProductFactory';

export class ProductRepository implements IProductRepository {
  private readonly firebaseService: FirebaseService;
  private readonly productFactory: ProductFactory;
  private readonly collectionName = 'products';

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
    this.productFactory = new ProductFactory();
  }

  /**
   * Get a product by ID
   */
  async getProduct(id: string): Promise<Product> {
    try {
      const db = this.firebaseService.getFirestore();
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      const data = docSnap.data();
      return this.productFactory.createProduct(
        data.type,
        id,
        data.name,
        data.brand,
        data.price,
        data.specifications || {}
      );
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const db = this.firebaseService.getFirestore();
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return this.productFactory.createProduct(
          data.type,
          doc.id,
          data.name,
          data.brand,
          data.price,
          data.specifications || {}
        );
      });
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }

  /**
   * Get products filtered by type
   */
  async getProductsByType(type: string): Promise<Product[]> {
    try {
      const db = this.firebaseService.getFirestore();
      const q = query(collection(db, this.collectionName), where("type", "==", type));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return this.productFactory.createProduct(
          data.type,
          doc.id,
          data.name,
          data.brand,
          data.price,
          data.specifications || {}
        );
      });
    } catch (error) {
      console.error(`Error fetching products by type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(product: Product): Promise<void> {
    try {
      const db = this.firebaseService.getFirestore();
      const productData = {
        name: product.name,
        brand: product.brand,
        price: product.price,
        type: this.getProductType(product),
        specifications: product.specifications
      };
      
      await setDoc(doc(db, this.collectionName, product.id), productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      const db = this.firebaseService.getFirestore();
      const updateData: Record<string, any> = {};
      
      if (productData.name) updateData.name = productData.name;
      if (productData.brand) updateData.brand = productData.brand;
      if (productData.price) updateData.price = productData.price;
      if (productData.specifications) updateData.specifications = productData.specifications;
      
      await updateDoc(doc(db, this.collectionName, id), updateData);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const db = this.firebaseService.getFirestore();
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to determine product type from Product instance
   */
  private getProductType(product: Product): string {
    if (product.constructor.name === 'RegulatorProduct') return 'regulator';
    if (product.constructor.name === 'BCDProduct') return 'bcd';
    if (product.constructor.name === 'FinProduct') return 'fin';
    throw new Error('Unknown product type');
  }
} 