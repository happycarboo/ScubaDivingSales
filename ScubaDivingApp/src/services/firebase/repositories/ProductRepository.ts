// Product Repository Implementation
// Single Responsibility Principle: Repository only handles product data operations
// Open/Closed Principle: Can be extended without modification
// Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations

import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseService } from '../FirebaseService';
import { Product } from '../../../patterns/factory/ProductFactory';
import { IProductRepository } from '../interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
  private readonly COLLECTION_NAME = 'products';
  private firebaseService: FirebaseService;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  private async getFirestore() {
    return this.firebaseService.getFirestore();
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await this.getFirestore();
      const productsCollection = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(productsCollection);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data
        } as Product);
      });

      console.log('Retrieved products:', products);
      return products;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const db = await this.getFirestore();
      const productDoc = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(productDoc);

      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    } catch (error) {
      console.error(`Error getting product with ID ${id}:`, error);
      throw error;
    }
  }

  async getProductsByType(type: string): Promise<Product[]> {
    try {
      const db = await this.getFirestore();
      const productsCollection = collection(db, this.COLLECTION_NAME);
      const q = query(productsCollection, where('type', '==', type));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data
        } as Product);
      });

      console.log(`Retrieved products of type ${type}:`, products);
      return products;
    } catch (error) {
      console.error(`Error getting products of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(product: Product): Promise<void> {
    try {
      const db = await this.getFirestore();
      const productData = {
        name: product.name,
        brand: product.brand,
        price: product.price,
        type: product.type,
        specifications: product.specifications,
        imageUrl: product.imageUrl
      };
      
      await setDoc(doc(db, this.COLLECTION_NAME, product.id), productData);
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
      const db = await this.getFirestore();
      const updateData: Record<string, any> = {};
      
      if (productData.name) updateData.name = productData.name;
      if (productData.brand) updateData.brand = productData.brand;
      if (productData.price) updateData.price = productData.price;
      if (productData.type) updateData.type = productData.type;
      if (productData.specifications) updateData.specifications = productData.specifications;
      if (productData.imageUrl) updateData.imageUrl = productData.imageUrl;
      
      await updateDoc(doc(db, this.COLLECTION_NAME, id), updateData);
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
      const db = await this.getFirestore();
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
} 