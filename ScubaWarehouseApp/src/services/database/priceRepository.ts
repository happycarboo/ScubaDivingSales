/**
 * PriceRepository - Handles all price-related database operations
 */

import { firebase } from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../../config/firebase.config';

interface Price {
  id?: string;
  productId: string;
  amount: number;
  currency: string;
  effectiveDate: string;
  expirationDate?: string;
  isPromotion: boolean;
}

interface CompetitorPrice {
  id?: string;
  productId: string;
  competitorName: string;
  competitorUrl: string;
  price: number;
  currency: string;
  lastChecked: string;
  isInStock: boolean;
}

export class PriceRepository {
  private db = firebase.firestore();
  private pricesCollection = this.db.collection(COLLECTIONS.PRICES);
  private competitorPricesCollection = this.db.collection(COLLECTIONS.COMPETITOR_PRICES);
  
  /**
   * Get price history for a product
   */
  async getPriceHistory(productId: string): Promise<Price[]> {
    try {
      const snapshot = await this.pricesCollection
        .where('productId', '==', productId)
        .orderBy('effectiveDate', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Price[];
    } catch (error) {
      console.error(`Error getting price history for product ${productId}:`, error);
      return [];
    }
  }
  
  /**
   * Get current price for a product
   */
  async getCurrentPrice(productId: string): Promise<Price | null> {
    try {
      const now = new Date().toISOString();
      
      const snapshot = await this.pricesCollection
        .where('productId', '==', productId)
        .where('effectiveDate', '<=', now)
        .where('expirationDate', '>=', now)
        .orderBy('effectiveDate', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        // If no current price with expiration found, get the latest effective price
        const latestSnapshot = await this.pricesCollection
          .where('productId', '==', productId)
          .orderBy('effectiveDate', 'desc')
          .limit(1)
          .get();
          
        if (latestSnapshot.empty) {
          return null;
        }
        
        const doc = latestSnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Price;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Price;
    } catch (error) {
      console.error(`Error getting current price for product ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Get competitor prices for a product
   */
  async getCompetitorPrices(productId: string): Promise<CompetitorPrice[]> {
    try {
      const snapshot = await this.competitorPricesCollection
        .where('productId', '==', productId)
        .orderBy('lastChecked', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CompetitorPrice[];
    } catch (error) {
      console.error(`Error getting competitor prices for product ${productId}:`, error);
      return [];
    }
  }
  
  /**
   * Add or update competitor price
   */
  async updateCompetitorPrice(competitorPrice: CompetitorPrice): Promise<void> {
    try {
      if (competitorPrice.id) {
        // Update existing price
        await this.competitorPricesCollection
          .doc(competitorPrice.id)
          .update({
            ...competitorPrice,
            lastChecked: new Date().toISOString()
          });
      } else {
        // Add new price
        await this.competitorPricesCollection.add({
          ...competitorPrice,
          lastChecked: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating competitor price:', error);
      throw error;
    }
  }
  
  /**
   * Get price comparison data including our price and competitor prices
   */
  async getPriceComparisonData(productId: string): Promise<{
    ourPrice: Price | null;
    competitorPrices: CompetitorPrice[];
  }> {
    try {
      const [ourPrice, competitorPrices] = await Promise.all([
        this.getCurrentPrice(productId),
        this.getCompetitorPrices(productId)
      ]);
      
      return {
        ourPrice,
        competitorPrices
      };
    } catch (error) {
      console.error(`Error getting price comparison data for product ${productId}:`, error);
      return {
        ourPrice: null,
        competitorPrices: []
      };
    }
  }
}
