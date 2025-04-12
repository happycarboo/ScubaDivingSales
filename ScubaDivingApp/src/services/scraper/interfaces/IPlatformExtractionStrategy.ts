/**
 * Interface for platform-specific price extraction strategies
 * Following the Strategy pattern to encapsulate different extraction algorithms
 */
export interface IPlatformExtractionStrategy {
  /**
   * Gets the name of the platform
   */
  getPlatformName(): string;
  
  /**
   * Checks if the strategy can handle the given URL
   * @param url The URL to check
   * @returns True if this strategy can handle the URL, false otherwise
   */
  canHandleUrl(url: string): boolean;
  
  /**
   * Extracts the price from a URL
   * @param url The URL to extract the price from
   * @returns A Promise with the extracted price string or null if not found
   */
  extractPrice(url: string): Promise<string | null>;
} 