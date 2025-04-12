/**
 * Interface for extracting product name and image from e-commerce platforms
 * Follows ISP by defining a specific interface for product info extraction
 */
export interface IProductInfoExtractor {
  /**
   * Extract product name from a product URL
   * @param url - The URL of the product page
   * @returns A promise that resolves to the product name or null if not found
   */
  extractProductName(url: string): Promise<string | null>;

  /**
   * Extract product image URL from a product URL
   * @param url - The URL of the product page
   * @returns A promise that resolves to the product image URL or null if not found
   */
  extractProductImageUrl(url: string): Promise<string | null>;

  /**
   * Download a product image from a URL and save it locally
   * @param imageUrl - The URL of the image to download
   * @param productName - The name of the product (for naming the file)
   * @param category - The category of the product (for organizing files)
   * @returns A promise that resolves to the local file path of the saved image or null if download failed
   */
  downloadProductImage(imageUrl: string, productName: string, category: string): Promise<string | null>;
}

/**
 * Interface for a comprehensive platform extraction strategy
 * Extends both price extraction and product info extraction capabilities
 * Follows ISP by composing specific interfaces
 */
export interface IComprehensivePlatformStrategy extends IProductInfoExtractor {
  /**
   * Get the name of the platform
   * @returns The platform name
   */
  getPlatformName(): string;
  
  /**
   * Check if this strategy can handle a given URL
   * @param url - The URL to check
   * @returns True if this strategy can handle the URL, false otherwise
   */
  canHandleUrl(url: string): boolean;
  
  /**
   * Extract price from a product URL
   * @param url - The URL of the product page
   * @returns A promise that resolves to the product price or null if not found
   */
  extractPrice(url: string): Promise<string | null>;
}

/**
 * Interface defining product information extraction results
 */
export interface ProductInfo {
  name: string;
  imageUrl: string | null;
  localImagePath?: string | null;
} 