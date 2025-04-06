export interface CompetitorPrice {
  competitor: string;
  price: number;
  sourceUrl: string;
  lastUpdated: Date;
  isLive: boolean;
}

export interface IPriceScraperService {
  /**
   * Fetches competitor prices for a specific product
   * @param productId The ID of the product to fetch competitor prices for
   * @param productModel The model name of the product
   * @param productBrand The brand of the product
   * @returns Promise with competitor prices or error
   */
  fetchCompetitorPrices(
    productId: string, 
    productModel: string, 
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>>;
  
  /**
   * Gets the last fetched competitor prices (from cache or local storage)
   * @param productId The ID of the product
   * @returns The last fetched competitor prices or null if not available
   */
  getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null>;
} 