import { IPlatformExtractionStrategy } from '../interfaces/IPlatformExtractionStrategy';
import { LazadaExtractionStrategy } from '../strategies/LazadaExtractionStrategy';
import { ShopeeExtractionStrategy } from '../strategies/ShopeeExtractionStrategy';
import { ScubaWarehouseExtractionStrategy } from '../strategies/ScubaWarehouseExtractionStrategy';

/**
 * Registry for platform extraction strategies
 * Follows the Registry pattern to manage and access strategies
 */
export class PlatformStrategyRegistry {
  private static instance: PlatformStrategyRegistry;
  private strategies: IPlatformExtractionStrategy[] = [];
  
  private constructor() {
    // Register default strategies
    this.registerStrategy(new LazadaExtractionStrategy());
    this.registerStrategy(new ShopeeExtractionStrategy());
    this.registerStrategy(new ScubaWarehouseExtractionStrategy());
  }
  
  /**
   * Gets the singleton instance of the registry
   */
  public static getInstance(): PlatformStrategyRegistry {
    if (!PlatformStrategyRegistry.instance) {
      PlatformStrategyRegistry.instance = new PlatformStrategyRegistry();
    }
    return PlatformStrategyRegistry.instance;
  }
  
  /**
   * Registers a strategy with the registry
   * @param strategy The strategy to register
   */
  public registerStrategy(strategy: IPlatformExtractionStrategy): void {
    this.strategies.push(strategy);
  }
  
  /**
   * Gets all registered strategies
   * @returns Array of registered strategies
   */
  public getAllStrategies(): IPlatformExtractionStrategy[] {
    return [...this.strategies];
  }
  
  /**
   * Gets a strategy for the specified URL
   * @param url The URL to get a strategy for
   * @returns The appropriate strategy for the URL or null if none found
   */
  public getStrategyForUrl(url: string): IPlatformExtractionStrategy | null {
    for (const strategy of this.strategies) {
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
} 