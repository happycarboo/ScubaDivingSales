import { IPlatformExtractionStrategy } from '../interfaces/IPlatformExtractionStrategy';
import { IComprehensivePlatformStrategy, ProductInfo } from '../interfaces/IProductInfoExtractor';
import { ScubaWarehouseComprehensiveStrategy } from '../strategies/ScubaWarehouseComprehensiveStrategy';

/**
 * Registry for comprehensive platform extraction strategies
 * Follows the Registry pattern to manage and access strategies
 * Extends the basic functionality to handle product info extraction
 */
export class ComprehensiveStrategyRegistry {
  private static instance: ComprehensiveStrategyRegistry;
  private strategies: (IPlatformExtractionStrategy | IComprehensivePlatformStrategy)[] = [];
  private comprehensiveStrategies: IComprehensivePlatformStrategy[] = [];
  
  private constructor() {
    // Register default comprehensive strategies
    this.registerComprehensiveStrategy(new ScubaWarehouseComprehensiveStrategy());
  }
  
  /**
   * Gets the singleton instance of the registry
   */
  public static getInstance(): ComprehensiveStrategyRegistry {
    if (!ComprehensiveStrategyRegistry.instance) {
      ComprehensiveStrategyRegistry.instance = new ComprehensiveStrategyRegistry();
    }
    return ComprehensiveStrategyRegistry.instance;
  }
  
  /**
   * Registers a basic strategy with the registry
   * @param strategy The strategy to register
   */
  public registerStrategy(strategy: IPlatformExtractionStrategy): void {
    this.strategies.push(strategy);
  }
  
  /**
   * Registers a comprehensive strategy with the registry
   * @param strategy The comprehensive strategy to register
   */
  public registerComprehensiveStrategy(strategy: IComprehensivePlatformStrategy): void {
    this.strategies.push(strategy);
    this.comprehensiveStrategies.push(strategy);
  }
  
  /**
   * Gets all registered strategies
   * @returns Array of registered strategies
   */
  public getAllStrategies(): (IPlatformExtractionStrategy | IComprehensivePlatformStrategy)[] {
    return [...this.strategies];
  }
  
  /**
   * Gets all registered comprehensive strategies
   * @returns Array of registered comprehensive strategies
   */
  public getAllComprehensiveStrategies(): IComprehensivePlatformStrategy[] {
    return [...this.comprehensiveStrategies];
  }
  
  /**
   * Gets a strategy for the specified URL
   * @param url The URL to get a strategy for
   * @returns The appropriate strategy for the URL or null if none found
   */
  public getStrategyForUrl(url: string): IPlatformExtractionStrategy | IComprehensivePlatformStrategy | null {
    for (const strategy of this.strategies) {
      if (strategy.canHandleUrl(url)) {
        return strategy;
      }
    }
    return null;
  }
  
  /**
   * Gets a comprehensive strategy for the specified URL
   * @param url The URL to get a comprehensive strategy for
   * @returns The appropriate comprehensive strategy for the URL or null if none found
   */
  public getComprehensiveStrategyForUrl(url: string): IComprehensivePlatformStrategy | null {
    for (const strategy of this.comprehensiveStrategies) {
      if (strategy.canHandleUrl(url)) {
        return strategy;
      }
    }
    return null;
  }
  
  /**
   * Extracts price from a URL using the appropriate strategy
   * @param url The URL to extract the price from
   * @returns Promise with the extracted price or null if no strategy can handle the URL
   */
  public async extractPriceFromUrl(url: string): Promise<string | null> {
    const strategy = this.getStrategyForUrl(url);
    if (strategy) {
      return await strategy.extractPrice(url);
    }
    console.warn(`No strategy found for URL: ${url}`);
    return null;
  }
  
  /**
   * Extracts product name from a URL using the appropriate comprehensive strategy
   * @param url The URL to extract the product name from
   * @returns Promise with the extracted product name or null if no strategy can handle the URL
   */
  public async extractProductNameFromUrl(url: string): Promise<string | null> {
    const strategy = this.getComprehensiveStrategyForUrl(url);
    if (strategy) {
      return await strategy.extractProductName(url);
    }
    console.warn(`No comprehensive strategy found for URL: ${url}`);
    return null;
  }
  
  /**
   * Extracts product image URL from a URL using the appropriate comprehensive strategy
   * @param url The URL to extract the product image from
   * @returns Promise with the extracted product image URL or null if no strategy can handle the URL
   */
  public async extractProductImageUrlFromUrl(url: string): Promise<string | null> {
    const strategy = this.getComprehensiveStrategyForUrl(url);
    if (strategy) {
      return await strategy.extractProductImageUrl(url);
    }
    console.warn(`No comprehensive strategy found for URL: ${url}`);
    return null;
  }
  
  /**
   * Downloads a product image from a URL using the appropriate comprehensive strategy
   * @param url The URL to extract the product image from
   * @param category The product category (for organization)
   * @returns Promise with the product info including local image path or null if no strategy can handle the URL
   */
  public async extractAndDownloadProductInfo(url: string, category: string = 'general'): Promise<ProductInfo | null> {
    const strategy = this.getComprehensiveStrategyForUrl(url);
    if (strategy) {
      // Extract product name
      const name = await strategy.extractProductName(url);
      if (!name) {
        console.warn("Could not extract product name");
        return null;
      }
      
      // Extract product image URL
      const imageUrl = await strategy.extractProductImageUrl(url);
      let localImagePath: string | null = null;
      
      // Download image if URL was found
      if (imageUrl) {
        localImagePath = await strategy.downloadProductImage(imageUrl, name, category);
      }
      
      return {
        name,
        imageUrl,
        localImagePath
      };
    }
    
    console.warn(`No comprehensive strategy found for URL: ${url}`);
    return null;
  }
} 