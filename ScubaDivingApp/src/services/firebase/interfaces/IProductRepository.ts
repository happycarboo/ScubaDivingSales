// Interface for Product Repository
// Single Responsibility Principle: Repository only handles product data operations
// Interface Segregation Principle: Small, focused interface

import { Product } from '../../../patterns/factory/ProductFactory';
import { RegulatorDetails, BCDDetails } from '../repositories/ProductRepository';

export interface IProductRepository {
  /**
   * Get a product by ID
   */
  getProduct(id: string): Promise<Product>;
  
  /**
   * Get all products
   */
  getAllProducts(): Promise<Product[]>;
  
  /**
   * Get products filtered by type
   */
  getProductsByType(type: string): Promise<Product[]>;
  
  /**
   * Get regulator details for a specific product ID
   */
  getRegulatorDetails(productId: string): Promise<RegulatorDetails | null>;

  /**
   * Get BCD details for a specific product ID
   */
  getBCDDetails(productId: string): Promise<BCDDetails | null>;
  
  /**
   * Create a new product
   */
  createProduct(product: Product): Promise<void>;
  
  /**
   * Update an existing product
   */
  updateProduct(id: string, productData: Partial<Product>): Promise<void>;
  
  /**
   * Delete a product
   */
  deleteProduct(id: string): Promise<void>;
} 