/**
 * Interface for managing product to URL mappings
 * Following the Repository pattern to abstract data access
 */
export interface IProductUrlRepository {
  /**
   * Gets all competitor URLs for a product
   * @param productId The ID of the product
   * @param productBrand The brand of the product
   * @param productModel The model of the product
   * @returns A Promise with a Record mapping competitor names to their URLs
   */
  getCompetitorUrls(
    productId: string,
    productBrand: string,
    productModel: string
  ): Promise<Record<string, string>>;

  /**
   * Saves competitor URLs for a product
   * @param productId The ID of the product
   * @param urls A Record mapping competitor names to their URLs
   * @returns A Promise that resolves when the operation is complete
   */
  saveCompetitorUrls(productId: string, urls: Record<string, string>): Promise<void>;

  /**
   * Adds a competitor URL for a product
   * @param productId The ID of the product
   * @param competitorName The name of the competitor
   * @param url The URL to the competitor's product page
   * @returns A Promise that resolves when the operation is complete
   */
  addCompetitorUrl(productId: string, competitorName: string, url: string): Promise<void>;
} 