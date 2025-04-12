/**
 * Interface for product image retrieval services
 * Following the Interface Segregation Principle with a focused interface
 */
export interface IProductImageService {
  /**
   * Gets a product image URL for display
   * @param productId The product ID
   * @param productUrl The URL to the product page (optional, for scraping)
   * @returns Promise with the image URL or null if not found
   */
  getProductImageUrl(productId: string, productUrl?: string): Promise<string | null>;
  
  /**
   * Gets a cached or newly downloaded product image URI
   * @param productId The product ID
   * @param productUrl The URL to the product page (optional, for scraping)
   * @param productType The product type (for organization)
   * @returns Promise with the local image URI or null if not available
   */
  getProductImageUri(productId: string, productUrl?: string, productType?: string): Promise<string | null>;
  
  /**
   * Prefetches product images for a list of products
   * @param productIds List of product IDs to prefetch images for
   * @param productUrls Optional map of product ID to product URL for scraping
   * @returns Promise that resolves when prefetching is complete
   */
  prefetchProductImages(
    productIds: string[], 
    productUrls?: Record<string, string>
  ): Promise<void>;
  
  /**
   * Clears the image cache for a specific product
   * @param productId The product ID
   */
  clearProductImageCache(productId: string): Promise<void>;
  
  /**
   * Clears all cached product images
   */
  clearAllProductImageCache(): Promise<void>;
  
  /**
   * Shares a cached image from one product to another
   * @param sourceProductId Source product ID with the cached image
   * @param targetProductId Target product ID to share the image with
   * @returns Promise with success flag
   */
  shareProductImage(sourceProductId: string, targetProductId: string): Promise<boolean>;
  
  /**
   * Gets all cached product images
   * @returns Promise with a map of product IDs to image URIs
   */
  getCachedProductImages(): Promise<Record<string, string>>;
} 