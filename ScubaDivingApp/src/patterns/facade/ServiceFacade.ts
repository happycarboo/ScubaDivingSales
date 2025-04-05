// Facade Pattern implementation for service orchestration
// This simplifies complex subsystem interactions by providing a unified interface

import { Product } from '../factory/ProductFactory';
import { IFirebaseService } from '../../services/firebase/interfaces/IFirebaseService';
import { FirebaseService as FirebaseServiceImpl } from '../../services/firebase/FirebaseService';
import { ProductRepository } from '../../services/firebase/repositories/ProductRepository';
import { IProductRepository } from '../../services/firebase/interfaces/IProductRepository';

// Legacy subsystem classes - kept for backward compatibility
class FirebaseService {
  async fetchProducts(filters?: Record<string, any>): Promise<any[]> {
    // In a real app, this would connect to Firebase
    console.log('Fetching products from Firebase with filters:', filters);
    return Promise.resolve([
      { id: '1', name: 'XTR Pro', brand: 'Scubapro', price: 799, type: 'regulator', specifications: { qualityScore: 9 } },
      { id: '2', name: 'Wave BCD', brand: 'Mares', price: 499, type: 'bcd', specifications: { qualityScore: 8 } },
      { id: '3', name: 'Avanti Quattro', brand: 'Mares', price: 159, type: 'fin', specifications: { qualityScore: 8.5 } },
    ]);
  }

  async fetchProductDetails(productId: string): Promise<any> {
    console.log('Fetching product details for:', productId);
    // Mock implementation
    return Promise.resolve({
      id: productId,
      name: 'XTR Pro',
      brand: 'Scubapro',
      price: 799,
      type: 'regulator',
      specifications: {
        qualityScore: 9,
        weight: '1.2kg',
        material: 'metal/rubber',
        features: ['balanced diaphragm', 'adjustable breathing resistance'],
      },
    });
  }

  async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    console.log('Saving user preferences for user:', userId, preferences);
    return Promise.resolve();
  }
}

class PriceScraperService {
  async fetchCompetitorPrices(productId: string): Promise<Record<string, number>> {
    console.log('Fetching competitor prices for product:', productId);
    // Mock implementation
    return Promise.resolve({
      'Competitor A': 849,
      'Competitor B': 799,
      'Competitor C': 779,
    });
  }
}

class RecommendationService {
  async getRecommendations(
    userProfile: { experienceLevel: string },
    preferences: Record<string, any>
  ): Promise<any[]> {
    console.log('Getting recommendations for user:', userProfile, 'with preferences:', preferences);
    // Mock implementation
    return Promise.resolve([
      { id: '5', name: 'A2', brand: 'Scubapro', price: 1200, type: 'regulator', score: 9.5 },
      { id: '6', name: 'Hydros Pro', brand: 'Scubapro', price: 899, type: 'bcd', score: 9.2 },
    ]);
  }
}

// Facade class that provides a simplified interface to the subsystems
export class ServiceFacade {
  private static instance: ServiceFacade;
  private initialized: boolean = false;
  
  // Legacy services
  private legacyFirebaseService: FirebaseService;
  private priceScraperService: PriceScraperService;
  private recommendationService: RecommendationService;
  
  // Real Firebase services
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  
  // Use Firebase flag - set to false by default to avoid breaking changes
  private useRealFirebase: boolean = false;

  private constructor() {
    // Initialize legacy services
    this.legacyFirebaseService = new FirebaseService();
    this.priceScraperService = new PriceScraperService();
    this.recommendationService = new RecommendationService();
    
    // Initialize real Firebase services
    this.firebaseService = FirebaseServiceImpl.getInstance();
    this.productRepository = new ProductRepository();
  }
  
  /**
   * Gets the singleton instance of ServiceFacade
   */
  public static getInstance(): ServiceFacade {
    if (!ServiceFacade.instance) {
      ServiceFacade.instance = new ServiceFacade();
    }
    return ServiceFacade.instance;
  }
  
  /**
   * Initializes the service facade and its dependencies
   */
  public async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.firebaseService.initialize();
        console.log('ServiceFacade initialized with Firebase');
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
  }
  
  /**
   * Checks if real Firebase is being used
   */
  public isUsingRealFirebase(): boolean {
    return this.useRealFirebase;
  }

  /**
   * Gets all products with optional filters
   */
  async getProductsWithFilters(filters: Record<string, any>): Promise<Product[]> {
    try {
      console.log('Fetching products with filters:', filters);
      if (filters.type) {
        return await this.productRepository.getProductsByType(filters.type);
      }
      const products = await this.productRepository.getAllProducts();
      console.log('Fetched products:', products);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Gets a single product with price comparison
   */
  async getProductWithPriceComparison(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, number>;
  }> {
    try {
      const product = await this.productRepository.getProduct(productId);
      
      // Mock competitor prices for now
      const competitorPrices = {
        'Competitor A': product.price * 1.1,
        'Competitor B': product.price * 0.95,
        'Competitor C': product.price * 1.05,
      };

      return {
        product,
        competitorPrices,
      };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(
    userId: string,
    userProfile: { experienceLevel: string },
    preferences: Record<string, any>
  ): Promise<any[]> {
    // Still using legacy implementation for preferences and recommendations
    await this.legacyFirebaseService.saveUserPreferences(userId, preferences);
    return this.recommendationService.getRecommendations(userProfile, preferences);
  }

  async createProduct(product: Product): Promise<void> {
    try {
      await this.productRepository.createProduct(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
} 