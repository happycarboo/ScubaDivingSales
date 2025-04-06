import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompetitorPrice, IPriceScraperService } from './interfaces/IPriceScraperService';

/**
 * Service responsible for fetching competitor prices from various sources
 * Implements the IPriceScraperService interface
 */
export class PriceScraperService implements IPriceScraperService {
  private static instance: PriceScraperService;
  
  // For demo purposes, we'll store a map of competitor source URLs
  private competitorUrls: Record<string, string> = {
    'Competitor A': 'https://www.lazada.sg/products/scubapro-mk19-evo-bt-g260-carbon-bt-diving-regulator-i3015598924-s20850107955.html',
    'Competitor B': 'https://www.example.com/scubapro-mk19-evo-bt-g260-bt',
    'Competitor C': 'https://www.example.org/scubapro/mk19evo'
  };
  
  // AsyncStorage key prefix for caching competitor prices
  private STORAGE_KEY_PREFIX = 'competitor_prices_';
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PriceScraperService {
    if (!PriceScraperService.instance) {
      PriceScraperService.instance = new PriceScraperService();
    }
    return PriceScraperService.instance;
  }
  
  /**
   * Fetches competitor prices for a specific product
   * In a real implementation, this would use a scraper or API
   * For demo purposes, we simulate network latency and potential failures
   */
  async fetchCompetitorPrices(
    productId: string, 
    productModel: string, 
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    console.log(`Fetching competitor prices for ${productBrand} ${productModel} (ID: ${productId})`);
    
    // Get any existing cached prices first
    const existingPrices = await this.getLastFetchedPrices(productId) || {};
    const now = new Date();
    
    try {
      // For demo purposes, simulate network request with delay (2-5 seconds)
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simulate random failure for Competitor B (30% chance)
      const failCompetitorB = Math.random() < 0.3;
      
      // Create result with successful fetches for A and C, and conditional B
      const competitorPrices: Record<string, CompetitorPrice> = {
        'Competitor A': {
          competitor: 'Competitor A',
          price: 1428.90,
          sourceUrl: this.competitorUrls['Competitor A'],
          lastUpdated: now,
          isLive: true
        },
        'Competitor B': failCompetitorB
          ? { 
              ...existingPrices['Competitor B'] || {
                competitor: 'Competitor B',
                price: 1234.05,
                sourceUrl: this.competitorUrls['Competitor B'],
                lastUpdated: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                isLive: false
              }
            }
          : {
              competitor: 'Competitor B',
              price: 1234.05,
              sourceUrl: this.competitorUrls['Competitor B'],
              lastUpdated: now,
              isLive: true
            },
        'Competitor C': {
          competitor: 'Competitor C',
          price: 1363.95,
          sourceUrl: this.competitorUrls['Competitor C'],
          lastUpdated: now,
          isLive: true
        }
      };
      
      // Cache the results in AsyncStorage
      await this.cachePrices(productId, competitorPrices);
      
      return competitorPrices;
    } catch (error) {
      console.error('Error fetching competitor prices:', error);
      
      // Return existing cached prices with updated isLive status
      // This ensures we always return something even if the fetch fails
      const fallbackPrices: Record<string, CompetitorPrice> = {};
      
      for (const [competitor, url] of Object.entries(this.competitorUrls)) {
        fallbackPrices[competitor] = existingPrices[competitor] || {
          competitor,
          price: competitor === 'Competitor A' ? 1428.90 :
                 competitor === 'Competitor B' ? 1234.05 : 1363.95,
          sourceUrl: url,
          lastUpdated: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          isLive: false
        };
      }
      
      // Cache these fallback prices
      await this.cachePrices(productId, fallbackPrices);
      
      return fallbackPrices;
    }
  }
  
  /**
   * Gets the last fetched competitor prices from AsyncStorage
   */
  async getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null> {
    try {
      const cachedData = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${productId}`);
      if (cachedData) {
        // Parse dates correctly (JSON.parse doesn't handle Date objects)
        const parsedData = JSON.parse(cachedData);
        
        // Convert string dates back to Date objects
        Object.values(parsedData).forEach((price: any) => {
          price.lastUpdated = new Date(price.lastUpdated);
        });
        
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached competitor prices:', error);
      return null;
    }
  }
  
  /**
   * Caches competitor prices in AsyncStorage
   */
  private async cachePrices(productId: string, prices: Record<string, CompetitorPrice>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${productId}`,
        JSON.stringify(prices)
      );
    } catch (error) {
      console.error('Error caching competitor prices:', error);
    }
  }
} 