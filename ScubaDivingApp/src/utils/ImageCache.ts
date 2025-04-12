import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Utility for managing product images
 * Provides caching mechanisms that work with both scraped images and Firebase storage
 */
export class ImageCache {
  private static instance: ImageCache;
  private readonly CACHE_DIRECTORY = 'product_images_cache';
  private imageCacheMap: Map<string, string> = new Map();
  
  private constructor() {}
  
  /**
   * Get singleton instance of ImageCache
   */
  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }
  
  /**
   * Get the base directory for image caching
   */
  private async getBaseCacheDirectory(): Promise<string> {
    const directory = `${FileSystem.documentDirectory}${this.CACHE_DIRECTORY}`;
    await this.ensureDirectoryExists(directory);
    return directory;
  }
  
  /**
   * Ensure a directory exists
   * @param path Directory path to ensure exists
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(path);
      if (!dirInfo.exists) {
        console.log(`Creating directory: ${path}`);
        await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      }
    } catch (error) {
      console.error(`Error ensuring directory exists: ${error}`);
      throw error;
    }
  }
  
  /**
   * Get a cached image URI for a product
   * @param productId Product ID
   * @returns The cached image URI or null if not cached
   */
  public async getCachedImageUri(productId: string): Promise<string | null> {
    // Check memory cache first
    if (this.imageCacheMap.has(productId)) {
      return this.imageCacheMap.get(productId) || null;
    }
    
    // Check file system cache
    const filePath = await this.getProductImagePath(productId);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (fileInfo.exists) {
      // Cache hit - update memory cache
      this.imageCacheMap.set(productId, filePath);
      return filePath;
    }
    
    return null;
  }
  
  /**
   * Cache an image for a product
   * @param productId Product ID
   * @param imageUrl URL of the image to cache
   * @param productType Optional type for organization
   * @returns The cached image URI or null if caching failed
   */
  public async cacheProductImage(
    productId: string, 
    imageUrl: string, 
    productType: string = 'general'
  ): Promise<string | null> {
    try {
      const filePath = await this.getProductImagePath(productId, productType);
      
      // Download and cache the image
      const result = await FileSystem.downloadAsync(
        imageUrl,
        filePath,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
          }
        }
      );
      
      if (result.status === 200) {
        // Update memory cache
        this.imageCacheMap.set(productId, filePath);
        console.log(`Image cached successfully for product ${productId}: ${filePath}`);
        return filePath;
      } else {
        console.error(`Failed to cache image for product ${productId}, status: ${result.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error caching image for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Get the file path for a product image
   * @param productId Product ID
   * @param productType Optional type for organization
   * @returns Full path to the image file
   */
  private async getProductImagePath(productId: string, productType: string = 'general'): Promise<string> {
    const baseDir = await this.getBaseCacheDirectory();
    const typeDir = `${baseDir}/${productType}`;
    await this.ensureDirectoryExists(typeDir);
    
    // Use a consistent file extension (can be determined from URL later)
    return `${typeDir}/${productId}.jpg`;
  }
  
  /**
   * Clear the cache for a specific product
   * @param productId Product ID to clear cache for
   */
  public async clearProductImageCache(productId: string): Promise<void> {
    try {
      const filePath = await this.getProductImagePath(productId);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        console.log(`Cleared image cache for product ${productId}`);
      }
      
      // Remove from memory cache
      this.imageCacheMap.delete(productId);
    } catch (error) {
      console.error(`Error clearing image cache for product ${productId}:`, error);
    }
  }
  
  /**
   * Clear all cached images
   */
  public async clearAllImageCache(): Promise<void> {
    try {
      const baseDir = await this.getBaseCacheDirectory();
      await FileSystem.deleteAsync(baseDir, { idempotent: true });
      await this.ensureDirectoryExists(baseDir);
      
      // Clear memory cache
      this.imageCacheMap.clear();
      console.log('Cleared all image cache');
    } catch (error) {
      console.error('Error clearing all image cache:', error);
    }
  }
  
  /**
   * Get all cached images
   * @returns Map of product IDs to image URIs
   */
  public async getAllCachedImages(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    // First add all items from memory cache
    this.imageCacheMap.forEach((uri, productId) => {
      result[productId] = uri;
    });
    
    // Then scan the file system for any that might not be in memory
    try {
      const baseDir = await this.getBaseCacheDirectory();
      const typeDirs = await FileSystem.readDirectoryAsync(baseDir);
      
      for (const typeDir of typeDirs) {
        const fullTypeDir = `${baseDir}/${typeDir}`;
        const dirInfo = await FileSystem.getInfoAsync(fullTypeDir);
        
        if (dirInfo.exists && dirInfo.isDirectory) {
          const files = await FileSystem.readDirectoryAsync(fullTypeDir);
          
          for (const file of files) {
            if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
              // Extract product ID from filename (e.g., "general-product-1.jpg" => "1")
              const productId = file.split('.')[0].split('-').pop();
              if (productId && !result[productId]) {
                const filePath = `${fullTypeDir}/${file}`;
                result[productId] = filePath;
                
                // Also update the memory cache
                this.imageCacheMap.set(productId, filePath);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning filesystem for cached images:', error);
    }
    
    return result;
  }
} 