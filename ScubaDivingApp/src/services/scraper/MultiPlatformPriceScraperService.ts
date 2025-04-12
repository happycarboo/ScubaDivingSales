import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompetitorPrice, IPriceScraperService } from './interfaces/IPriceScraperService';
import { IProductUrlRepository } from './interfaces/IProductUrlRepository';
import { DummyProductUrlRepository } from './repositories/DummyProductUrlRepository';
import { PlatformStrategyRegistry } from './registry/PlatformStrategyRegistry';

/**
 * Service responsible for fetching and managing competitor prices from various sources
 * Implements the IPriceScraperService interface
 */
export class MultiPlatformPriceScraperService implements IPriceScraperService {
  private static instance: MultiPlatformPriceScraperService;
  private urlRepository: IProductUrlRepository;
  private strategyRegistry: PlatformStrategyRegistry;
  
  // AsyncStorage key prefix for caching competitor prices
  private STORAGE_KEY_PREFIX = 'competitor_prices_';
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize dependencies
    this.urlRepository = new DummyProductUrlRepository();
    this.strategyRegistry = PlatformStrategyRegistry.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): MultiPlatformPriceScraperService {
    if (!MultiPlatformPriceScraperService.instance) {
      MultiPlatformPriceScraperService.instance = new MultiPlatformPriceScraperService();
    }
    return MultiPlatformPriceScraperService.instance;
  }
  
  /**
   * Converts a string price to a numeric value
   * @param priceStr Price string to convert (e.g., "$299.00")
   * @returns Numeric price value or 0 if invalid
   */
  private parsePriceValue(priceStr: string | null): number {
    if (!priceStr) return 0;
    
    // Remove currency symbol, commas, and other non-numeric characters except decimal point
    const numericStr = priceStr.replace(/[^0-9.]/g, '');
    
    // Convert to numeric value
    const price = parseFloat(numericStr);
    return isNaN(price) ? 0 : price;
  }
  
  /**
   * Fetches competitor prices for a specific product
   * @param productId The ID of the product
   * @param productModel The model name of the product
   * @param productBrand The brand of the product
   */
  async fetchCompetitorPrices(
    productId: string, 
    productModel: string, 
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    console.log(`[MultiPlatformPriceScraperService] Fetching competitor prices for ${productBrand} ${productModel} (ID: ${productId})`);
    
    // Get any existing cached prices first
    const existingPrices = await this.getLastFetchedPrices(productId) || {};
    const now = new Date();
    
    try {
      // Get competitor URLs for this product
      const competitorUrls = await this.urlRepository.getCompetitorUrls(
        productId,
        productBrand,
        productModel
      );
      
      // Initialize results with existing prices (in case some fetches fail)
      const competitorPrices: Record<string, CompetitorPrice> = { ...existingPrices };
      
      // Extract prices for each competitor URL
      for (const [competitor, url] of Object.entries(competitorUrls)) {
        try {
          console.log(`[MultiPlatformPriceScraperService] Extracting price from ${competitor}: ${url}`);
          
          // Extract price using the strategy registry
          const priceStr = await this.strategyRegistry.extractPriceFromUrl(url);
          
          // Parse the price value
          const price = this.parsePriceValue(priceStr);
          
          // Update the competitor price information
          competitorPrices[competitor] = {
            competitor,
            price,
            sourceUrl: url,
            lastUpdated: now,
            isLive: true
          };
          
          console.log(`[MultiPlatformPriceScraperService] Extracted price for ${competitor}: ${priceStr} → ${price}`);
        } catch (error) {
          console.error(`[MultiPlatformPriceScraperService] Error extracting price for ${competitor}:`, error);
          
          // Use existing price data if available, or create fallback data
          competitorPrices[competitor] = existingPrices[competitor] || {
            competitor,
            price: 0,
            sourceUrl: url,
            lastUpdated: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
            isLive: false
          };
        }
      }
      
      // Cache the results
      await this.cachePrices(productId, competitorPrices);
      
      return competitorPrices;
    } catch (error) {
      console.error('[MultiPlatformPriceScraperService] Error fetching competitor prices:', error);
      
      // Return existing cached prices with updated isLive status
      return existingPrices;
    }
  }
  
  /**
   * Gets the last fetched competitor prices from AsyncStorage
   * @param productId The ID of the product
   */
  async getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null> {
    try {
      const cachedData = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${productId}`);
      if (cachedData) {
        // Parse dates correctly (JSON.parse doesn't handle Date objects)
        const parsedData = JSON.parse(cachedData);
        
        // Convert string dates back to Date objects
        Object.values(parsedData).forEach((price: any) => {
          price.lastUpdated = new Date(price.lastUpdated);
        });
        
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('[MultiPlatformPriceScraperService] Error retrieving cached competitor prices:', error);
      return null;
    }
  }
  
  /**
   * Caches competitor prices in AsyncStorage
   * @param productId The ID of the product
   * @param prices The competitor prices to cache
   */
  private async cachePrices(productId: string, prices: Record<string, CompetitorPrice>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${productId}`,
        JSON.stringify(prices)
      );
    } catch (error) {
      console.error('[MultiPlatformPriceScraperService] Error caching competitor prices:', error);
    }
  }
} 