/**
 * ApiServiceFacade - Implements the Facade design pattern for API services
 * Provides a unified interface to the various API services
 */

import { ProductRepository } from '../../services/database/productRepository';
import { PriceRepository } from '../../services/database/priceRepository';
import { WebScraper } from '../../services/scraping/webScraper';
import { PriceComparisonService } from '../../services/scraping/priceComparisonService';

export class ApiServiceFacade {
  private static productRepository: any;
  private static priceRepository: any;
  private static webScraper: any;
  private static priceComparisonService: any;

  /**
   * Initialize all API services
   */
  public static initialize(): void {
    this.productRepository = new ProductRepository();
    this.priceRepository = new PriceRepository();
    this.webScraper = new WebScraper();
    this.priceComparisonService = new PriceComparisonService();
  }

  /**
   * Get products based on filter criteria
   */
  public static async getFilteredProducts(filters: any): Promise<any[]> {
    return this.productRepository.getFilteredProducts(filters);
  }

  /**
   * Get detailed product information
   */
  public static async getProductDetails(productId: string): Promise<any> {
    return this.productRepository.getProductById(productId);
  }

  /**
   * Get competitor prices for a product
   */
  public static async getCompetitorPrices(productId: string): Promise<any[]> {
    return this.priceComparisonService.getCompetitorPrices(productId);
  }

  /**
   * Get price history for a product
   */
  public static async getPriceHistory(productId: string): Promise<any[]> {
    return this.priceRepository.getPriceHistory(productId);
  }

  /**
   * Refresh competitor prices (triggers scraping)
   */
  public static async refreshCompetitorPrices(): Promise<void> {
    await this.webScraper.scrapeCompetitorPrices();
    // After scraping, sync the prices
    await this.priceComparisonService.syncPrices();
  }
}
