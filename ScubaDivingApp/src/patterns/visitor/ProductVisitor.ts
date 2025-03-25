// Visitor Pattern implementation for product operations
// This allows adding new operations to the Product classes without modifying them

import { Product, RegulatorProduct, BCDProduct, FinProduct } from '../factory/ProductFactory';

// Visitor interface
export interface ProductVisitor {
  visitRegulator(product: RegulatorProduct): any;
  visitBCD(product: BCDProduct): any;
  visitFin(product: FinProduct): any;
}

// Make products accept visitors
export interface VisitableProduct extends Product {
  accept(visitor: ProductVisitor): any;
}

// Add accept method to product classes
export class VisitableRegulatorProduct extends RegulatorProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitRegulator(this);
  }
}

export class VisitableBCDProduct extends BCDProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitBCD(this);
  }
}

export class VisitableFinProduct extends FinProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitFin(this);
  }
}

// Example concrete visitor: Price Calculator with experience level discounts
export class PriceCalculatorVisitor implements ProductVisitor {
  private experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  constructor(experienceLevel: 'beginner' | 'intermediate' | 'advanced') {
    this.experienceLevel = experienceLevel;
  }
  
  visitRegulator(product: RegulatorProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'advanced') {
      discount = 0.05; // 5% discount for advanced divers on regulators
    }
    return product.price * (1 - discount);
  }
  
  visitBCD(product: BCDProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'beginner') {
      discount = 0.03; // 3% discount for beginners on BCDs
    }
    return product.price * (1 - discount);
  }
  
  visitFin(product: FinProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'intermediate') {
      discount = 0.02; // 2% discount for intermediate divers on fins
    }
    return product.price * (1 - discount);
  }
}

// Example concrete visitor: Product Recommendation Score Calculator
export class RecommendationScoreVisitor implements ProductVisitor {
  private userPreferences: {
    priceImportance: number; // 1-10
    qualityImportance: number; // 1-10
    brandImportance: number; // 1-10
  };
  
  constructor(preferences: { priceImportance: number; qualityImportance: number; brandImportance: number }) {
    this.userPreferences = preferences;
  }
  
  visitRegulator(product: RegulatorProduct): number {
    // Calculate recommendation score based on user preferences
    const priceScore = this.calculatePriceScore(product.price, 300, 1500);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  visitBCD(product: BCDProduct): number {
    // Calculate recommendation score based on user preferences
    const priceScore = this.calculatePriceScore(product.price, 200, 1200);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  visitFin(product: FinProduct): number {
    // Calculate recommendation score based on user preferences
    const priceScore = this.calculatePriceScore(product.price, 50, 300);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  private calculatePriceScore(price: number, minPrice: number, maxPrice: number): number {
    // Normalize price to 0-10 range (lower price = higher score)
    const normalized = Math.max(0, Math.min(10, 10 - (10 * (price - minPrice)) / (maxPrice - minPrice)));
    return normalized;
  }
  
  private getQualityScore(product: Product): number {
    // In a real app, this would analyze specifications
    // For demo purposes, assume quality score from specs
    return product.specifications.qualityScore || 5;
  }
  
  private getBrandScore(brand: string): number {
    // In a real app, this would use a brand reputation database
    // For demo purposes, use a simple mapping
    const brandScores: Record<string, number> = {
      'Scubapro': 9,
      'Mares': 8,
      'Aqualung': 8,
      'Cressi': 7,
      'Oceanic': 7,
    };
    
    return brandScores[brand] || 5;
  }
  
  private weightedScore(priceScore: number, qualityScore: number, brandScore: number): number {
    const { priceImportance, qualityImportance, brandImportance } = this.userPreferences;
    const totalWeight = priceImportance + qualityImportance + brandImportance;
    
    return (
      (priceScore * priceImportance + 
      qualityScore * qualityImportance + 
      brandScore * brandImportance) / totalWeight
    );
  }
} 