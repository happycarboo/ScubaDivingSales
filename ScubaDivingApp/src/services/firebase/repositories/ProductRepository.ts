// Product Repository Implementation
// Single Responsibility Principle: Repository only handles product data operations
// Open/Closed Principle: Can be extended without modification
// Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations

import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseService } from '../FirebaseService';
import { Product } from '../../../patterns/factory/ProductFactory';
import { IProductRepository } from '../interfaces/IProductRepository';

// Interfaces for our product details
export interface RegulatorDetails {
  prod_id: string;
  category: string;
  temperature: string;
  high_pressure_port: number;
  low_pressure_port: number;
  adjustable_airflow: string;
  pre_dive_mode: string;
  weights_base_on_yoke: number;
  material: string;
  dive_type: string;
  airflow_at_200bar: string;
}

export interface BCDDetails {
  prod_id: string;
  category: string;
  type: string;
  weight_pocket: string;
  quick_release: string;
  no_pockets: number;
  back_trim_pocket: string;
  weight_kg: number;
  has_size: string;
  lift_capacity_base_on_largest_size_kg: number;
}

export class ProductRepository implements IProductRepository {
  private readonly PRODUCTS_COLLECTION = 'products';
  private readonly REGULATORS_COLLECTION = 'regulators';
  private readonly BCDS_COLLECTION = 'bcds';
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
      const productsCollection = collection(db, this.PRODUCTS_COLLECTION);
      const querySnapshot = await getDocs(productsCollection);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.model, // Using model field as name
          brand: data.brand,
          price: data.price,
          type: data.type,
          link: data.link || '', // Move link to top level
          specifications: {
            category: data.category
          },
          getDescription: function() {
            return `${this.brand} ${this.name} - ${this.type}`;
          }
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
      const productDoc = doc(db, this.PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(productDoc);

      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.model,
        brand: data.brand,
        price: data.price,
        type: data.type,
        link: data.link || '', // Move link to top level
        specifications: {
          category: data.category
        },
        getDescription: function() {
          return `${this.brand} ${this.name} - ${this.type}`;
        }
      } as Product;
    } catch (error) {
      console.error(`Error getting product with ID ${id}:`, error);
      throw error;
    }
  }

  async getProductsByType(type: string): Promise<Product[]> {
    try {
      const db = await this.getFirestore();
      const productsCollection = collection(db, this.PRODUCTS_COLLECTION);
      const q = query(productsCollection, where('type', '==', type));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.model,
          brand: data.brand,
          price: data.price,
          type: data.type,
          link: data.link || '', // Move link to top level
          specifications: {
            category: data.category
          },
          getDescription: function() {
            return `${this.brand} ${this.name} - ${this.type}`;
          }
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
   * Get regulator details for a specific product ID
   */
  async getRegulatorDetails(productId: string): Promise<RegulatorDetails | null> {
    try {
      const db = await this.getFirestore();
      console.log(`Attempting to fetch regulator details for product ID ${productId} from collection '${this.REGULATORS_COLLECTION}'`);
      const regulatorDoc = doc(db, this.REGULATORS_COLLECTION, productId);
      const docSnap = await getDoc(regulatorDoc);

      if (!docSnap.exists()) {
        console.log(`No regulator details found for product ID ${productId}`);
        return null;
      }

      // Log success and the data received
      const data = docSnap.data();
      console.log(`Successfully retrieved regulator details for product ID ${productId}:`, data);
      
      return {
        prod_id: data.prod_id || productId,
        category: data.category || 'regulator',
        temperature: data.temperature || 'Cold water',
        high_pressure_port: data.high_pressure_port || 0,
        low_pressure_port: data.low_pressure_port || 0,
        adjustable_airflow: data.adjustable_airflow || 'NO',
        pre_dive_mode: data.pre_dive_mode || 'NO',
        weights_base_on_yoke: data.weights_base_on_yoke || 0,
        material: data.material || '',
        dive_type: data.dive_type || 'Recreational',
        airflow_at_200bar: data.airflow_at_200bar || ''
      };
    } catch (error) {
      console.error(`Error getting regulator details for product ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get BCD details for a specific product ID
   */
  async getBCDDetails(productId: string): Promise<BCDDetails | null> {
    try {
      const db = await this.getFirestore();
      console.log(`Attempting to fetch BCD details for product ID ${productId} from collection '${this.BCDS_COLLECTION}'`);
      const bcdDoc = doc(db, this.BCDS_COLLECTION, productId);
      const docSnap = await getDoc(bcdDoc);

      if (!docSnap.exists()) {
        console.log(`No BCD details found for product ID ${productId}`);
        return null;
      }

      // Log success and the data received
      const data = docSnap.data();
      console.log(`Successfully retrieved BCD details for product ID ${productId}:`, data);
      
      return {
        prod_id: data.prod_id || productId,
        category: data.category || 'BCD',
        type: data.type || 'Jacket',
        weight_pocket: data.weight_pocket || 'No',
        quick_release: data.quick_release || 'No',
        no_pockets: data.no_pockets || 0,
        back_trim_pocket: data.back_trim_pocket || 'No',
        weight_kg: data.weight_kg || 0,
        has_size: data.has_size || 'No',
        lift_capacity_base_on_largest_size_kg: data.lift_capacity_base_on_largest_size_kg || 0
      };
    } catch (error) {
      console.error(`Error getting BCD details for product ID ${productId}:`, error);
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
        brand: product.brand,
        model: product.name,
        price: product.price,
        type: product.type,
        category: product.specifications?.category || product.type,
        link: product.link || ''
      };
      
      await setDoc(doc(db, this.PRODUCTS_COLLECTION, product.id), productData);
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
      
      if (productData.name) updateData.model = productData.name;
      if (productData.brand) updateData.brand = productData.brand;
      if (productData.price) updateData.price = productData.price;
      if (productData.type) updateData.type = productData.type;
      if (productData.link) updateData.link = productData.link;
      if (productData.specifications?.category) updateData.category = productData.specifications.category;
      
      await updateDoc(doc(db, this.PRODUCTS_COLLECTION, id), updateData);
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
      await deleteDoc(doc(db, this.PRODUCTS_COLLECTION, id));
      
      // Also try to delete related records if they exist
      try {
        await deleteDoc(doc(db, this.REGULATORS_COLLECTION, id));
        console.log(`Deleted regulator details for product ID ${id}`);
      } catch (error) {
        console.log(`No regulator details found for product ID ${id}`);
      }
      
      try {
        await deleteDoc(doc(db, this.BCDS_COLLECTION, id));
        console.log(`Deleted BCD details for product ID ${id}`);
      } catch (error) {
        console.log(`No BCD details found for product ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
} 