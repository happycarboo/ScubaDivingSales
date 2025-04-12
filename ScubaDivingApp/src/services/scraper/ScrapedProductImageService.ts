import { IProductImageService } from './interfaces/IProductImageService';
import { IProductUrlRepository } from './interfaces/IProductUrlRepository';
import { ComprehensiveStrategyRegistry } from './registry/ComprehensiveStrategyRegistry';
import { ImageCache } from '../../utils/ImageCache';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';

/**
 * Service for retrieving product images using web scraping
 * Implements the Strategy pattern by encapsulating the scraping algorithm
 */
export class ScrapedProductImageService implements IProductImageService {
  private static instance: ScrapedProductImageService;
  private readonly strategyRegistry: ComprehensiveStrategyRegistry;
  private readonly imageCache: ImageCache;
  private readonly productUrlRepository: IProductUrlRepository;
  private readonly DEFAULT_PRODUCT_TYPE = 'general';
  
  private constructor(
    strategyRegistry: ComprehensiveStrategyRegistry,
    imageCache: ImageCache,
    productUrlRepository: IProductUrlRepository
  ) {
    this.strategyRegistry = strategyRegistry;
    this.imageCache = imageCache;
    this.productUrlRepository = productUrlRepository;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ScrapedProductImageService {
    if (!ScrapedProductImageService.instance) {
      // Retrieve dependencies from ServiceFacade
      const serviceFacade = ServiceFacade.getInstance();
      const registry = serviceFacade.getComprehensiveStrategyRegistry();
      const productUrlRepository = serviceFacade.getProductUrlRepository();
      const imageCache = ImageCache.getInstance();
      
      ScrapedProductImageService.instance = new ScrapedProductImageService(
        registry,
        imageCache,
        productUrlRepository
      );
    }
    return ScrapedProductImageService.instance;
  }
  
  /**
   * Get product image URL using web scraping
   */
  public async getProductImageUrl(productId: string, productUrl?: string): Promise<string | null> {
    try {
      // If product URL is provided directly, use it
      if (productUrl) {
        return await this.extractImageUrlFromProductUrl(productUrl);
      }
      
      // Otherwise, try to get URL from repository
      const urls = await this.getProductUrls(productId);
      
      // Try each URL until we find an image
      for (const url of Object.values(urls)) {
        const imageUrl = await this.extractImageUrlFromProductUrl(url);
        if (imageUrl) {
          return imageUrl;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting product image URL for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Extract image URL from a product page URL
   */
  private async extractImageUrlFromProductUrl(url: string): Promise<string | null> {
    try {
      return await this.strategyRegistry.extractProductImageUrlFromUrl(url);
    } catch (error) {
      console.error(`Error extracting image URL from ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Get product URLs from repository
   */
  private async getProductUrls(productId: string): Promise<Record<string, string>> {
    try {
      // Use dummy brand and model since we just need any URL for the product
      return await this.productUrlRepository.getCompetitorUrls(productId, 'any', 'any');
    } catch (error) {
      console.error(`Error getting product URLs for product ${productId}:`, error);
      return {};
    }
  }
  
  /**
   * Get product image URI, either from cache or by downloading
   */
  public async getProductImageUri(
    productId: string, 
    productUrl?: string,
    productType: string = this.DEFAULT_PRODUCT_TYPE
  ): Promise<string | null> {
    try {
      // Check if image is already cached
      const cachedUri = await this.imageCache.getCachedImageUri(productId);
      if (cachedUri) {
        console.log(`Using cached image for product ${productId}: ${cachedUri}`);
        return cachedUri;
      }
      
      // If not cached, get the image URL
      const imageUrl = await this.getProductImageUrl(productId, productUrl);
      if (!imageUrl) {
        console.log(`No image URL found for product ${productId}`);
        return null;
      }
      
      // Cache the image
      console.log(`Caching image for product ${productId} from URL: ${imageUrl}`);
      return await this.imageCache.cacheProductImage(productId, imageUrl, productType);
    } catch (error) {
      console.error(`Error getting product image URI for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Prefetch images for multiple products
   */
  public async prefetchProductImages(
    productIds: string[],
    productUrls?: Record<string, string>
  ): Promise<void> {
    try {
      const prefetchPromises = productIds.map(async (productId) => {
        const productUrl = productUrls ? productUrls[productId] : undefined;
        await this.getProductImageUri(productId, productUrl);
      });
      
      await Promise.all(prefetchPromises);
      console.log(`Prefetched images for ${productIds.length} products`);
    } catch (error) {
      console.error('Error prefetching product images:', error);
    }
  }
  
  /**
   * Clear image cache for a product
   */
  public async clearProductImageCache(productId: string): Promise<void> {
    await this.imageCache.clearProductImageCache(productId);
  }
  
  /**
   * Clear all product image cache
   */
  public async clearAllProductImageCache(): Promise<void> {
    await this.imageCache.clearAllImageCache();
  }
  
  /**
   * Shares a cached image from one product to another (useful for similar products)
   * @param sourceProductId The source product ID with the cached image
   * @param targetProductId The target product ID to share the image with
   * @returns Promise with success flag
   */
  public async shareProductImage(sourceProductId: string, targetProductId: string): Promise<boolean> {
    try {
      const sourceImageUri = await this.imageCache.getCachedImageUri(sourceProductId);
      if (!sourceImageUri) {
        return false;
      }
      
      // Get image type from the source product (default to general)
      const productType = sourceImageUri.includes('/bcd/') ? 'bcd' : 
                         sourceImageUri.includes('/regulator/') ? 'regulator' : 
                         this.DEFAULT_PRODUCT_TYPE;
      
      // Extract the URL from the cached URI (for recaching)
      const urlMatch = sourceImageUri.match(/\/([^\/]+)\.jpg$/);
      if (!urlMatch) {
        return false;
      }
      
      // Create a dummy URL that will still work for caching
      const dummyUrl = `https://source-product/${sourceProductId}/shared-to/${targetProductId}`;
      
      // Cache the image for the target product
      const result = await this.imageCache.cacheProductImage(targetProductId, dummyUrl, productType);
      return result !== null;
    } catch (error) {
      console.error(`Error sharing image from product ${sourceProductId} to ${targetProductId}:`, error);
      return false;
    }
  }
  
  /**
   * Get a list of cached product image URIs
   * @returns Promise with a map of product IDs to image URIs
   */
  public async getCachedProductImages(): Promise<Record<string, string>> {
    try {
      return await this.imageCache.getAllCachedImages();
    } catch (error) {
      console.error('Error getting cached product images:', error);
      return {};
    }
  }
} 