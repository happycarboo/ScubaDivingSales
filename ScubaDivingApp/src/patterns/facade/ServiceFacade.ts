// Facade Pattern implementation for service orchestration
// This simplifies complex subsystem interactions by providing a unified interface

import { Product } from '../factory/ProductFactory';
import { IFirebaseService } from '../../services/firebase/interfaces/IFirebaseService';
import { FirebaseService as FirebaseServiceImpl } from '../../services/firebase/FirebaseService';
import { ProductRepository } from '../../services/firebase/repositories/ProductRepository';
import { IProductRepository } from '../../services/firebase/interfaces/IProductRepository';
import { RegulatorDetails, BCDDetails } from '../../services/firebase/repositories/ProductRepository';
import { PriceScraperService as RealTimePriceScraperService } from '../../services/scraper/PriceScraperService';
import { CompetitorPrice, IPriceScraperService } from '../../services/scraper/interfaces/IPriceScraperService';

// Legacy subsystem classes - kept for backward compatibility
class FirebaseService {
  async fetchProducts(filters?: Record<string, any>): Promise<any[]> {
    // In a real app, this would connect to Firebase
    console.log('Fetching products from Firebase with filters:', filters);
    return Promise.resolve([
      { id: '1', name: 'XTR Pro', brand: 'Scubapro', price: 799, type: 'regulator', specifications: { qualityScore: 9 }, link: 'https://www.scubapro.com/products/regulators/xtr-pro' },
      { id: '2', name: 'Wave BCD', brand: 'Mares', price: 499, type: 'bcd', specifications: { qualityScore: 8 }, link: 'https://www.mares.com/products/bcds/wave-bcd' },
      { id: '3', name: 'Avanti Quattro', brand: 'Mares', price: 159, type: 'fin', specifications: { qualityScore: 8.5 }, link: 'https://www.mares.com/products/fins/avanti-quattro' },
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
      link: 'https://www.scubapro.com/products/regulators/xtr-pro',
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
  
  // Real-time price scraper service
  private realTimePriceScraperService: IPriceScraperService;
  
  // Use Firebase flag - set to true by default to use real Firebase
  private useRealFirebase: boolean = true;

  private constructor() {
    // Initialize legacy services
    this.legacyFirebaseService = new FirebaseService();
    this.priceScraperService = new PriceScraperService();
    this.recommendationService = new RecommendationService();
    
    // Initialize real Firebase services
    this.firebaseService = FirebaseServiceImpl.getInstance();
    this.productRepository = new ProductRepository();
    
    // Initialize real-time price scraper service
    this.realTimePriceScraperService = RealTimePriceScraperService.getInstance();
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
   * @param useRealFirebase Flag to determine if real Firebase should be used
   */
  public async initialize(useRealFirebase: boolean = true): Promise<void> {
    if (!this.initialized) {
      try {
        // Set the useRealFirebase flag
        this.useRealFirebase = useRealFirebase;
        
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
      
      // First, try to get cached prices from the real-time price scraper
      const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      
      // Convert to the original format for backward compatibility
      const competitorPrices: Record<string, number> = {};
      
      if (cachedPrices) {
        // Use cached prices if available
        Object.entries(cachedPrices).forEach(([competitor, data]) => {
          competitorPrices[competitor] = data.price;
        });
      } else {
        // Fallback to mock prices if no cached data
        competitorPrices['Competitor A'] = product.price * 1.1;
        competitorPrices['Competitor B'] = product.price * 0.95;
        competitorPrices['Competitor C'] = product.price * 1.05;
      }

      return {
        product,
        competitorPrices,
      };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }

  /**
   * Fetches real-time competitor prices for a product
   * @param productId Product ID
   * @returns Promise with full competitor price information including source URLs and timestamps
   */
  async fetchRealTimeCompetitorPrices(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, CompetitorPrice>;
    isFetching: boolean;
  }> {
    try {
      // Indicate that fetching is in progress
      const result = {
        product: await this.productRepository.getProduct(productId),
        competitorPrices: {},
        isFetching: true
      };
      
      // Try to get cached prices first
      const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      if (cachedPrices) {
        result.competitorPrices = cachedPrices;
      }
      
      // Start fetching new prices
      this.realTimePriceScraperService
        .fetchCompetitorPrices(
          productId, 
          result.product.name, 
          result.product.brand
        )
        .then(freshPrices => {
          // Update will happen in the component via useEffect
          console.log('Fetched fresh competitor prices:', freshPrices);
        })
        .catch(error => {
          console.error('Error fetching real-time competitor prices:', error);
        });
      
      return result;
    } catch (error) {
      console.error('Error starting real-time price comparison:', error);
      throw error;
    }
  }

  /**
   * Gets regulator details for a specific product
   */
  async getRegulatorDetails(productId: string): Promise<RegulatorDetails | null> {
    try {
      // Only attempt to get real regulator details if useRealFirebase is true
      if (this.useRealFirebase) {
        const regulatorDetails = await this.productRepository.getRegulatorDetails(productId);
        return regulatorDetails;
      } else {
        // Return mock regulator details when not using real Firebase
        console.log('Using mock regulator details for product ID:', productId);
        return {
          prod_id: productId,
          category: 'regulator',
          temperature: 'Cold water',
          high_pressure_port: productId === '1' ? 2 : productId === '2' ? 1 : 2,
          low_pressure_port: productId === '1' ? 5 : productId === '2' ? 4 : 3,
          adjustable_airflow: productId === '1' ? 'YES' : 'NO',
          pre_dive_mode: productId === '1' || productId === '3' ? 'YES' : 'NO',
          weights_base_on_yoke: productId === '1' ? 1310 : productId === '2' ? 871 : 1041,
          material: productId === '1' ? 'Carbon fibre front' : productId === '2' ? 'Chrome Plated' : 'Satin',
          dive_type: productId === '1' ? 'Recreational / Tech / Contaminated' : 'Recreational',
          airflow_at_200bar: productId === '1' ? '1800 l/min' : productId === '2' ? '1400 l/min' : '1500 l/min'
        };
      }
    } catch (error) {
      console.error('Error getting regulator details:', error);
      throw error;
    }
  }

  /**
   * Gets BCD details for a specific product
   */
  async getBCDDetails(productId: string): Promise<BCDDetails | null> {
    try {
      // Only attempt to get real BCD details if useRealFirebase is true
      if (this.useRealFirebase) {
        const bcdDetails = await this.productRepository.getBCDDetails(productId);
        return bcdDetails;
      } else {
        // Return mock BCD details when not using real Firebase
        console.log('Using mock BCD details for product ID:', productId);
        return {
          prod_id: productId,
          category: 'BCD',
          type: productId === '5' ? 'Backplate' : 'Jacket',
          weight_pocket: 'Yes',
          quick_release: productId === '5' ? 'No' : 'Yes',
          no_pockets: 2,
          back_trim_pocket: 'Yes',
          weight_kg: productId === '4' ? 2.7 : productId === '5' ? 2.3 : 2.8,
          has_size: 'Yes',
          lift_capacity_base_on_largest_size_kg: productId === '4' ? 17.3 : productId === '5' ? 13.2 : 16.3
        };
      }
    } catch (error) {
      console.error('Error getting BCD details:', error);
      throw error;
    }
  }

  /**
   * Gets product with full technical details
   */
  async getProductWithTechDetails(productId: string): Promise<{
    product: Product;
    techDetails: RegulatorDetails | BCDDetails | null;
  }> {
    try {
      const product = await this.productRepository.getProduct(productId);
      let techDetails = null;
      
      if (product.type === 'regulator') {
        techDetails = await this.getRegulatorDetails(productId);
      } else if (product.type === 'bcd') {
        techDetails = await this.getBCDDetails(productId);
      }
      
      return {
        product,
        techDetails
      };
    } catch (error) {
      console.error('Error getting product with tech details:', error);
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

  /**
   * Gets the last fetched competitor prices from the cache
   * @param productId Product ID
   * @returns Promise with the cached competitor prices or null if not available
   */
  async getLastFetchedCompetitorPrices(productId: string): Promise<Record<string, CompetitorPrice> | null> {
    try {
      return await this.realTimePriceScraperService.getLastFetchedPrices(productId);
    } catch (error) {
      console.error('Error getting last fetched competitor prices:', error);
      return null;
    }
  }
} 