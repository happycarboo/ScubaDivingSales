import { IProductUrlRepository } from '../interfaces/IProductUrlRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dummy implementation of IProductUrlRepository
 * Uses AsyncStorage for temporary storage and provides static dummy URLs
 */
export class DummyProductUrlRepository implements IProductUrlRepository {
  private STORAGE_KEY_PREFIX = 'product_urls_';
  
  // Dummy competitor URLs for testing
  private readonly dummyUrls: Record<string, Record<string, string>> = {
    // Dummy data for product ID '1' (ScubaPro regulator)
    '1': {
      'Lazada': 'https://www.lazada.sg/products/scubapro-mk19-evo-bt-g260-carbon-bt-diving-regulator-i3015598924-s20850107955.html',
      'Shopee': 'https://shopee.sg/ScubaPro-MK19-EVO-BT-G260-Carbon-BT-Diving-Regulator-i.554890954.12345678901',
      'Deep Blue Dive': 'https://scubawarehouse.com.sg/product/scubapro-mk19-evo-bt-g260-carbon-bt/'
    },
    // Dummy data for product ID '2' (Apollo Bio)
    '2': {
      'Lazada': 'https://www.lazada.sg/products/apollo-bio-octopus-diving-regulator-i2712954458-s18273448333.html',
      'Shopee': 'https://shopee.sg/Apollo-Bio-Octopus-Diving-Regulator-i.123456789.987654321',
      'Deep Blue Dive': 'https://scubawarehouse.com.sg/product/apollo-bio-octopus/'
    }
  };

  /**
   * Gets all competitor URLs for a product
   * @param productId The ID of the product
   * @param productBrand The brand of the product
   * @param productModel The model of the product
   * @returns A Record mapping competitor names to their URLs
   */
  async getCompetitorUrls(
    productId: string,
    productBrand: string,
    productModel: string
  ): Promise<Record<string, string>> {
    try {
      // First try to get from AsyncStorage (saved URLs have priority)
      const savedUrlsJson = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${productId}`);
      
      if (savedUrlsJson) {
        return JSON.parse(savedUrlsJson);
      }
      
      // Fall back to dummy data if available
      if (this.dummyUrls[productId]) {
        return {...this.dummyUrls[productId]};
      }
      
      // If no dummy data exists for this product ID, create generic ones based on brand and model
      return {
        'Lazada': `https://www.lazada.sg/products/${productBrand}-${productModel}-diving-gear-i1234567890-s1234567890.html`,
        'Shopee': `https://shopee.sg/${productBrand}-${productModel}-Diving-Gear-i.123456789.123456789`,
        'Deep Blue Dive': `https://scubawarehouse.com.sg/product/${productBrand.toLowerCase()}-${productModel.toLowerCase()}/`
      };
    } catch (error) {
      console.error('Error getting competitor URLs:', error);
      return {};
    }
  }

  /**
   * Saves competitor URLs for a product
   * @param productId The ID of the product
   * @param urls A Record mapping competitor names to their URLs
   */
  async saveCompetitorUrls(productId: string, urls: Record<string, string>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${productId}`,
        JSON.stringify(urls)
      );
    } catch (error) {
      console.error('Error saving competitor URLs:', error);
    }
  }

  /**
   * Adds a competitor URL for a product
   * @param productId The ID of the product
   * @param competitorName The name of the competitor
   * @param url The URL to the competitor's product page
   */
  async addCompetitorUrl(productId: string, competitorName: string, url: string): Promise<void> {
    try {
      // Get existing URLs
      const existingUrlsJson = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${productId}`);
      let urls: Record<string, string> = {};
      
      if (existingUrlsJson) {
        urls = JSON.parse(existingUrlsJson);
      } else if (this.dummyUrls[productId]) {
        // If no saved URLs but dummy data exists, start with those
        urls = {...this.dummyUrls[productId]};
      }
      
      // Add or update the URL
      urls[competitorName] = url;
      
      // Save back to storage
      await this.saveCompetitorUrls(productId, urls);
    } catch (error) {
      console.error('Error adding competitor URL:', error);
    }
  }
} 