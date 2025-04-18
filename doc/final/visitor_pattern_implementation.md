# Visitor Design Pattern Implementation in ScubaDivingApp

## Overview of Visitor Pattern

The Visitor design pattern allows adding new operations to existing object structures without modifying them. It separates algorithms from the objects they operate on, enabling new operations to be added without changing the classes of the objects being operated upon.

In the ScubaDivingApp, the Visitor pattern has been implemented to perform various operations on different product types (Regulators, BCDs, Fins) without modifying their base classes.

## Key Implementation Files

The primary implementation of the Visitor pattern in ScubaDivingApp is found in:

- **`src/patterns/visitor/ProductVisitor.ts`**: Contains the visitor interfaces and implementations

## Core Visitor Pattern Structure

### Visitor Interface

The central component is the `ProductVisitor` interface, which defines visit methods for each concrete product type:

```typescript
// src/patterns/visitor/ProductVisitor.ts
export interface ProductVisitor {
  visitRegulator(product: RegulatorProduct): any;
  visitBCD(product: BCDProduct): any;
  visitFin(product: FinProduct): any;
}
```

### Visitable Interface

Products implement the `VisitableProduct` interface to make them compatible with visitors:

```typescript
// src/patterns/visitor/ProductVisitor.ts
export interface VisitableProduct extends Product {
  accept(visitor: ProductVisitor): any;
}
```

### Concrete Visitable Products

Each product type implements the `accept` method:

```typescript
// src/patterns/visitor/ProductVisitor.ts
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
```

## Concrete Visitors

The application implements several concrete visitors for different operations:

### 1. Price Calculator Visitor

This visitor applies experience-based discounts to product prices:

```typescript
// src/patterns/visitor/ProductVisitor.ts
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
    let discount = 0;
    if (this.experienceLevel === 'beginner') {
      discount = 0.03; // 3% discount for beginners on BCDs
    }
    return product.price * (1 - discount);
  }
  
  visitFin(product: FinProduct): number {
    let discount = 0;
    if (this.experienceLevel === 'intermediate') {
      discount = 0.02; // 2% discount for intermediate divers on fins
    }
    return product.price * (1 - discount);
  }
}
```

### 2. Recommendation Score Visitor

This visitor calculates a personalized recommendation score based on user preferences:

```typescript
// src/patterns/visitor/ProductVisitor.ts
export class RecommendationScoreVisitor implements ProductVisitor {
  private userPreferences: {
    priceImportance: number;
    qualityImportance: number;
    brandImportance: number;
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
    // Different price ranges for BCD scoring
    const priceScore = this.calculatePriceScore(product.price, 200, 1200);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  visitFin(product: FinProduct): number {
    // Different price ranges for fin scoring
    const priceScore = this.calculatePriceScore(product.price, 50, 300);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  // Helper methods for score calculation
  private calculatePriceScore(price: number, minPrice: number, maxPrice: number): number {
    // Normalize price to 0-10 range (lower price = higher score)
    const normalized = Math.max(0, Math.min(10, 10 - (10 * (price - minPrice)) / (maxPrice - minPrice)));
    return normalized;
  }
  
  private getQualityScore(product: Product): number {
    // In a real app, this would analyze specifications
    return product.specifications.qualityScore || 5;
  }
  
  private getBrandScore(brand: string): number {
    // In a real app, this would use a brand reputation database
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
```

## Practical Application in the Codebase

### Product Comparison Feature

The visitor pattern is used in the product comparison feature to calculate personalized prices:

```typescript
// src/screens/Comparison/ComparisonScreen.tsx (conceptual example)
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { PriceCalculatorVisitor } from '../../patterns/visitor/ProductVisitor';

const ComparisonScreen = ({ route }) => {
  const { productIds, userProfile } = route.params;
  const [products, setProducts] = useState([]);
  const [adjustedPrices, setAdjustedPrices] = useState({});
  
  useEffect(() => {
    const loadProducts = async () => {
      const serviceFacade = ServiceFacade.getInstance();
      const loadedProducts = [];
      
      // Load all products for comparison
      for (const id of productIds) {
        const { product } = await serviceFacade.getProductWithTechDetails(id);
        loadedProducts.push(product);
      }
      
      setProducts(loadedProducts);
      
      // Apply visitor pattern to calculate personalized prices
      const priceVisitor = new PriceCalculatorVisitor(userProfile.experienceLevel);
      
      // Calculate adjusted prices for each product
      const prices = {};
      loadedProducts.forEach(product => {
        // Product must be converted to visitable product first
        const visitableProduct = makeVisitable(product);
        prices[product.id] = visitableProduct.accept(priceVisitor);
      });
      
      setAdjustedPrices(prices);
    };
    
    loadProducts();
  }, [productIds, userProfile]);
  
  // Helper to convert regular products to visitable products
  const makeVisitable = (product) => {
    if (product.type === 'regulator') {
      return new VisitableRegulatorProduct(
        product.id, 
        product.name, 
        product.brand, 
        product.price, 
        product.specifications,
        product.link
      );
    } else if (product.type === 'bcd') {
      return new VisitableBCDProduct(
        product.id, 
        product.name, 
        product.brand, 
        product.price, 
        product.specifications,
        product.link
      );
    } else if (product.type === 'fin') {
      return new VisitableFinProduct(
        product.id, 
        product.name, 
        product.brand, 
        product.price, 
        product.specifications,
        product.link
      );
    }
    
    // Fallback
    return {
      ...product,
      accept: (visitor) => product.price
    };
  };
  
  // Component rendering...
};
```

### Product Recommendation Feature

The visitor pattern is used for calculating personalized recommendation scores:

```typescript
// src/screens/Recommendation/RecommendationScreen.tsx (conceptual example)
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { RecommendationScoreVisitor } from '../../patterns/visitor/ProductVisitor';

const RecommendationScreen = ({ route }) => {
  const { userPreferences } = route.params;
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      const serviceFacade = ServiceFacade.getInstance();
      
      // Get all products
      const allProducts = await serviceFacade.getProductsWithFilters({});
      
      // Create recommendation visitor with user preferences
      const recommendationVisitor = new RecommendationScoreVisitor({
        priceImportance: userPreferences.priceSensitivity || 5,
        qualityImportance: userPreferences.qualityFocus || 5,
        brandImportance: userPreferences.brandLoyalty || 3
      });
      
      // Score each product
      const scoredProducts = allProducts.map(product => {
        const visitableProduct = makeVisitable(product);
        const score = visitableProduct.accept(recommendationVisitor);
        
        return {
          ...product,
          recommendationScore: score
        };
      });
      
      // Sort by score and take top 5
      const topRecommendations = scoredProducts
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 5);
      
      setRecommendedProducts(topRecommendations);
    };
    
    loadRecommendations();
  }, [userPreferences]);
  
  // Helper to convert regular products to visitable products (same as in ComparisonScreen)
  
  // Component rendering...
};
```

## Integration with Other Patterns

### Visitor and Factory Pattern

The Visitor pattern works in conjunction with the Factory pattern. The Factory creates product objects, and the Visitor operates on them:

```typescript
// Example of factory and visitor working together
const factory = new ProductFactory();
const product = factory.createProduct('regulator', '1', 'Pro Regulator', 'ScubaPro', 499.99, 'https://example.com');

// Make product visitable
const visitableProduct = new VisitableRegulatorProduct(
  product.id,
  product.name,
  product.brand,
  product.price,
  product.specifications,
  product.link
);

// Apply visitor
const priceVisitor = new PriceCalculatorVisitor('advanced');
const adjustedPrice = visitableProduct.accept(priceVisitor);
```

### Visitor and Facade Pattern

The Service Facade can utilize visitors internally to perform operations:

```typescript
// Example facade method that uses visitor pattern
async getAdjustedPriceForUser(productId: string, experienceLevel: string): Promise<number> {
  try {
    const product = await this.productRepository.getProduct(productId);
    const visitableProduct = this.makeVisitableProduct(product);
    
    const priceVisitor = new PriceCalculatorVisitor(experienceLevel);
    return visitableProduct.accept(priceVisitor);
  } catch (error) {
    console.error('Error calculating adjusted price:', error);
    throw error;
  }
}
```

## Benefits of the Visitor Pattern in ScubaDivingApp

### 1. Separation of Concerns

The visitor pattern enables a clean separation between product data structure and algorithms that operate on them. Product classes focus on data and basic functionality, while visitors implement specialized operations.

### 2. Open for Extension

New visitors can be added without modifying existing product classes. For example, adding a new `TechnicalCompatibilityVisitor` would require only implementing the new visitor class, with no changes to product classes.

### 3. Type-Specific Processing

The visitor pattern allows for efficient type-specific processing, as each visit method is tailored to a specific product type:

```typescript
// Example of type-specific processing
visitRegulator(product: RegulatorProduct): string {
  // Access regulator-specific properties
  return `${product.brand} ${product.name} - Recommended for ${
    product.specifications.temperature === 'Cold water' ? 'cold water diving' : 'warm water diving'
  }`;
}

visitBCD(product: BCDProduct): string {
  // Access BCD-specific properties
  return `${product.brand} ${product.name} - ${
    product.specifications.type === 'Backplate' ? 'Technical diving style' : 'Recreational style'
  }`;
}
```

### 4. Centralized Algorithm Updates

When an algorithm needs to be updated, changes are confined to a single visitor class instead of being scattered across multiple product classes.

### 5. Double Dispatch

The visitor pattern enables effective "double dispatch" where the code to execute depends on both the type of the visitor and the type of the visited object.

## Testing the Visitor Pattern

Testing visitor implementations is straightforward since each visitor can be tested in isolation:

```typescript
// Example test for PriceCalculatorVisitor
test('calculates correct price discount for advanced diver with regulator', () => {
  // Arrange
  const product = new VisitableRegulatorProduct(
    '1',
    'Test Regulator',
    'Test Brand',
    1000,
    {},
    'http://example.com'
  );
  const visitor = new PriceCalculatorVisitor('advanced');
  
  // Act
  const adjustedPrice = product.accept(visitor);
  
  // Assert
  expect(adjustedPrice).toBe(950); // 5% discount applied
});

test('applies no discount for beginner diver with regulator', () => {
  // Arrange
  const product = new VisitableRegulatorProduct(
    '2',
    'Test Regulator',
    'Test Brand',
    1000,
    {},
    'http://example.com'
  );
  const visitor = new PriceCalculatorVisitor('beginner');
  
  // Act
  const adjustedPrice = product.accept(visitor);
  
  // Assert
  expect(adjustedPrice).toBe(1000); // No discount
});
```

## Challenges and Solutions

### Challenge: Converting Regular Products to Visitable Products

A challenge in the application is converting regular products from the repository to visitable products:

```typescript
// Helper function to convert regular products to visitable products
function makeVisitable(product: Product): VisitableProduct {
  if (product.type === 'regulator') {
    return new VisitableRegulatorProduct(
      product.id, 
      product.name, 
      product.brand, 
      product.price,
      product.specifications,
      product.link
    );
  } else if (product.type === 'bcd') {
    return new VisitableBCDProduct(
      product.id, 
      product.name, 
      product.brand, 
      product.price,
      product.specifications,
      product.link
    );
  } else if (product.type === 'fin') {
    return new VisitableFinProduct(
      product.id, 
      product.name, 
      product.brand, 
      product.price,
      product.specifications,
      product.link
    );
  }
  
  throw new Error(`Unknown product type: ${product.type}`);
}
```

### Challenge: Returning Different Types from Visitors

Different visitors may need to return different types of data. The solution is to use generics:

```typescript
// Enhanced visitor interface with generics
interface EnhancedProductVisitor<T> {
  visitRegulator(product: RegulatorProduct): T;
  visitBCD(product: BCDProduct): T;
  visitFin(product: FinProduct): T;
}

// Example with string return type
class DescriptionVisitor implements EnhancedProductVisitor<string> {
  visitRegulator(product: RegulatorProduct): string {
    return `Professional regulator by ${product.brand}`;
  }
  
  visitBCD(product: BCDProduct): string {
    return `${product.specifications.type} style BCD`;
  }
  
  visitFin(product: FinProduct): string {
    return `Fins for ${product.specifications.divingType || 'recreational'} diving`;
  }
}
```

## Conclusion

The Visitor pattern in ScubaDivingApp demonstrates effective separation of data structure from algorithms that operate on that data. This enables the application to add new operations for product objects without modifying their classes, supporting the Open/Closed principle.

By implementing visitors for price calculation and recommendation scoring, the application delivers personalized experiences based on user preferences and experience levels, while maintaining a clean and maintainable codebase.

The integration with other patterns like Factory and Facade creates a robust architectural foundation that supports continued extension and refinement of the application's functionality. 