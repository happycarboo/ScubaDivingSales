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
import { MultiPlatformPriceScraperService } from '../../services/scraper/MultiPlatformPriceScraperService';
import { IProductUrlRepository } from '../../services/scraper/interfaces/IProductUrlRepository';
import { DummyProductUrlRepository } from '../../services/scraper/repositories/DummyProductUrlRepository';
import { ComprehensiveStrategyRegistry } from '../../services/scraper/registry/ComprehensiveStrategyRegistry';
import { ProductInfo } from '../../services/scraper/interfaces/IProductInfoExtractor';
import { IProductImageService } from '../../services/scraper/interfaces/IProductImageService';
import { ScrapedProductImageService } from '../../services/scraper/ScrapedProductImageService';

/**
 * Legacy Firebase service for backward compatibility
 * To be phased out as we migrate to the new Firebase implementation
 */
class FirebaseService {
  async fetchProductsByCategory(category: string): Promise<any[]> {
    // Legacy code - this will be removed in the future
    console.log('Using legacy fetchProductsByCategory', category);
    return [];
  }

  async fetchProductDetails(productId: string): Promise<any> {
    // Legacy code - this will be removed in the future
    console.log('Using legacy fetchProductDetails', productId);
    return {};
  }
  
  async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    // Legacy code - this will be removed in the future
    console.log('Using legacy saveUserPreferences', userId, preferences);
    return Promise.resolve();
  }
}

/**
 * Legacy Price scraper service for backward compatibility
 * To be phased out as we migrate to the new implementation
 */
class PriceScraperService {
  async fetchCompetitorPrices(productId: string): Promise<any> {
    // Legacy code - this will be removed in the future
    console.log('Using legacy fetchCompetitorPrices', productId);
    return {};
  }
}

/**
 * Legacy Recommendation service for backward compatibility
 * To be phased out as we migrate to the new implementation
 */
class RecommendationService {
  getRecommendationsForUser(userProfile: string): any[] {
    // Legacy code - this will be removed in the future
    console.log('Using legacy getRecommendationsForUser', userProfile);
    return [];
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
  
  // Multi-platform price scraper service (new implementation)
  private multiPlatformPriceScraperService: IPriceScraperService;
  
  // Product URL repository
  private productUrlRepository: IProductUrlRepository;
  
  // Comprehensive strategy registry for product info extraction
  private comprehensiveStrategyRegistry: ComprehensiveStrategyRegistry;
  
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
    
    // Initialize real-time price scraper service (original implementation)
    this.realTimePriceScraperService = RealTimePriceScraperService.getInstance();
    
    // Initialize new multi-platform price scraper service
    this.multiPlatformPriceScraperService = MultiPlatformPriceScraperService.getInstance();
    
    // Initialize product URL repository
    this.productUrlRepository = new DummyProductUrlRepository();
    
    // Initialize comprehensive strategy registry
    this.comprehensiveStrategyRegistry = ComprehensiveStrategyRegistry.getInstance();
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
    return this.recommendationService.getRecommendationsForUser(userProfile.experienceLevel);
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
      // Use the multi-platform service as the primary source
      const prices = await this.multiPlatformPriceScraperService.getLastFetchedPrices(productId);
      
      // If no prices found and we have the old implementation, try that as a fallback
      if (!prices) {
        return await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      }
      
      return prices;
    } catch (error) {
      console.error('Error getting last fetched competitor prices:', error);
      
      // Try the fallback as a last resort
      try {
        return await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      } catch {
        return null;
      }
    }
  }
  
  /**
   * Fetches competitor prices for a product
   * @param productId Product ID
   * @param productModel Product model
   * @param productBrand Product brand
   * @returns Promise with competitor prices
   */
  async fetchCompetitorPrices(
    productId: string,
    productModel: string,
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    try {
      // Use the multi-platform service as the primary implementation
      return await this.multiPlatformPriceScraperService.fetchCompetitorPrices(
        productId,
        productModel,
        productBrand
      );
    } catch (error) {
      console.error('Error fetching competitor prices with multi-platform service:', error);
      
      // Fall back to the original implementation if the new one fails
      try {
        return await this.realTimePriceScraperService.fetchCompetitorPrices(
          productId,
          productModel,
          productBrand
        );
      } catch (fallbackError) {
        console.error('Error fetching competitor prices with fallback service:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Extracts a product name from a URL
   * @param url The URL to extract the product name from
   * @returns Promise with the extracted product name or null if not found/supported
   */
  async extractProductName(url: string): Promise<string | null> {
    try {
      console.log(`Extracting product name from URL: ${url}`);
      return await this.comprehensiveStrategyRegistry.extractProductNameFromUrl(url);
    } catch (error) {
      console.error('Error extracting product name:', error);
      return null;
    }
  }

  /**
   * Extracts a product image URL from a URL
   * @param url The URL to extract the product image from
   * @returns Promise with the extracted product image URL or null if not found/supported
   */
  async extractProductImageUrl(url: string): Promise<string | null> {
    try {
      console.log(`Extracting product image URL from URL: ${url}`);
      return await this.comprehensiveStrategyRegistry.extractProductImageUrlFromUrl(url);
    } catch (error) {
      console.error('Error extracting product image URL:', error);
      return null;
    }
  }

  /**
   * Extracts comprehensive product information (name, image URL) and downloads the image
   * @param url The URL to extract information from
   * @param category The product category (for organization)
   * @returns Promise with the extracted product information including local image path
   */
  async extractAndDownloadProductInfo(url: string, category: string = 'general'): Promise<ProductInfo | null> {
    try {
      console.log(`Extracting and downloading product info from URL: ${url}`);
      return await this.comprehensiveStrategyRegistry.extractAndDownloadProductInfo(url, category);
    } catch (error) {
      console.error('Error extracting and downloading product info:', error);
      return null;
    }
  }

  // Add these getter methods for dependencies
  
  /**
   * Gets the ComprehensiveStrategyRegistry instance
   * @returns The ComprehensiveStrategyRegistry instance
   */
  getComprehensiveStrategyRegistry(): ComprehensiveStrategyRegistry {
    return this.comprehensiveStrategyRegistry;
  }
  
  /**
   * Gets the IProductUrlRepository instance
   * @returns The IProductUrlRepository instance
   */
  getProductUrlRepository(): IProductUrlRepository {
    return this.productUrlRepository;
  }
  
  // Add product image methods
  
  /**
   * Gets the product image service
   * @returns The product image service instance
   */
  private getProductImageService(): IProductImageService {
    // Currently using the scraped implementation, can be replaced with Firebase later
    return ScrapedProductImageService.getInstance();
  }
  
  /**
   * Gets the product image service for direct access to advanced functionality
   * @returns The IProductImageService instance
   */
  public getProductImageServiceInstance(): IProductImageService {
    return this.getProductImageService();
  }
  
  /**
   * Gets a product image URL
   * @param productId The product ID
   * @param productUrl Optional URL to the product page
   * @returns Promise with the image URL or null if not found
   */
  async getProductImageUrl(productId: string, productUrl?: string): Promise<string | null> {
    try {
      return await this.getProductImageService().getProductImageUrl(productId, productUrl);
    } catch (error) {
      console.error(`Error getting product image URL for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Gets a product image URI (local file path)
   * @param productId The product ID
   * @param productUrl Optional URL to the product page
   * @param productType Optional product type
   * @returns Promise with the local image URI or null if not available
   */
  async getProductImageUri(
    productId: string, 
    productUrl?: string, 
    productType?: string
  ): Promise<string | null> {
    try {
      return await this.getProductImageService().getProductImageUri(productId, productUrl, productType);
    } catch (error) {
      console.error(`Error getting product image URI for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Shares a cached image from one product to another
   * @param sourceProductId Source product ID with the cached image
   * @param targetProductId Target product ID to share the image with
   * @returns Promise with success flag
   */
  async shareProductImage(sourceProductId: string, targetProductId: string): Promise<boolean> {
    try {
      return await this.getProductImageService().shareProductImage(sourceProductId, targetProductId);
    } catch (error) {
      console.error(`Error sharing product image from ${sourceProductId} to ${targetProductId}:`, error);
      return false;
    }
  }
  
  /**
   * Gets all cached product images
   * @returns Promise with a map of product IDs to image URIs
   */
  async getCachedProductImages(): Promise<Record<string, string>> {
    try {
      return await this.getProductImageService().getCachedProductImages();
    } catch (error) {
      console.error('Error getting cached product images:', error);
      return {};
    }
  }
  
  /**
   * Prefetches product images for a list of products
   * @param productIds List of product IDs
   * @param productUrls Optional mapping of product IDs to URLs
   * @returns Promise that resolves when prefetching is complete
   */
  async prefetchProductImages(
    productIds: string[],
    productUrls?: Record<string, string>
  ): Promise<void> {
    try {
      await this.getProductImageService().prefetchProductImages(productIds, productUrls);
    } catch (error) {
      console.error('Error prefetching product images:', error);
    }
  }
} 