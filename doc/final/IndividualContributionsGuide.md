# Individual Contributions Guide

This document provides a comprehensive guide for each team member to prepare their individual contributions section (3-4 pages) for the final report. Each section should demonstrate how SOLID principles and the three key design patterns (Factory Method, Facade, and Visitor) were applied in your specific area of responsibility.

## Longsheng: Price Tracking and Architecture Design (3-4 pages)

### 1. Overview of Individual Contributions (0.5 page)
- Lead responsibility for overall architecture design
- Implementation of price tracking and scraping functionality
- Design pattern orchestration and system integration
- Architectural diagrams and documentation

### 2. Major Design Choices and Decisions (0.5-1 page)

**Architecture Design:**
- Decision to use Facade pattern as the core architectural pattern
- How the Facade pattern simplified complex subsystem interactions
- Implementation of extensible price tracking system
- Error handling and fallback mechanisms design

**Price Tracking Implementation:**
- Implementation techniques for price extraction
- Caching mechanisms for improved performance
- Integration with the core Facade pattern

### 3. UML Diagrams (0.5 page)
- Include a focused UML diagram showing:
  - How the Facade pattern orchestrates services
  - Price tracking component integration
  - Interaction flow between components
  - Data flow in price comparison

### 4. SOLID Principles and Design Patterns Applied (1-1.5 pages)

**Facade Pattern Implementation:**
- Show how `ServiceFacade` simplifies complex interactions
- Explain how it hides the complexity of multiple services
- Demonstrate the unified interface it provides to UI components

**Code Reference:**
```typescript
// Reference from: ScubaDivingApp/src/patterns/facade/ServiceFacade.ts (Lines 68-145)

// Facade class that provides a simplified interface to the subsystems
export class ServiceFacade {
  private static instance: ServiceFacade;
  private initialized: boolean = false;
  
  // Real Firebase services
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  
  // Price scraper services
  private realTimePriceScraperService: IPriceScraperService;
  private multiPlatformPriceScraperService: IPriceScraperService;
  private productUrlRepository: IProductUrlRepository;
  private comprehensiveStrategyRegistry: ComprehensiveStrategyRegistry;
  
  // Use Firebase flag - set to true by default to use real Firebase
  private useRealFirebase: boolean = true;
  
  private constructor() {
    // Initialize services...
    this.firebaseService = FirebaseServiceImpl.getInstance();
    this.productRepository = new ProductRepository();
    this.realTimePriceScraperService = RealTimePriceScraperService.getInstance();
    this.multiPlatformPriceScraperService = MultiPlatformPriceScraperService.getInstance();
    this.productUrlRepository = new DummyProductUrlRepository();
    this.comprehensiveStrategyRegistry = ComprehensiveStrategyRegistry.getInstance();
  }
  
  /**
   * Gets the singleton instance of ServiceFacade
   */
  public static getInstance(): ServiceFacade {
    if (!ServiceFacade.instance) {
      ServiceFacade.instance = new ServiceFacade();
    }
    return ServiceFacade.instance;
  }
  
  // Facade method for price comparison (simplified interface)
  async fetchCompetitorPrices(
    productId: string,
    productModel: string,
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    try {
      // Facade pattern hides complex interactions with multiple services
      return await this.multiPlatformPriceScraperService.fetchCompetitorPrices(
        productId,
        productModel,
        productBrand
      );
    } catch (error) {
      console.error('Error fetching competitor prices:', error);
      
      // Fallback mechanism - another benefit of the facade
      try {
        return await this.realTimePriceScraperService.fetchCompetitorPrices(
          productId,
          productModel,
          productBrand
        );
      } catch (fallbackError) {
        console.error('Error with fallback service:', fallbackError);
        throw fallbackError;
      }
    }
  }
}
```

**Example of Price Tracking Implementation:**
```typescript
// Reference from: ScubaDivingApp/src/services/scraper/MultiPlatformPriceScraperService.ts (Lines 60-126)

async fetchCompetitorPrices(
  productId: string, 
  productModel: string, 
  productBrand: string
): Promise<Record<string, CompetitorPrice>> {
  console.log(`[MultiPlatformPriceScraperService] Fetching competitor prices for ${productBrand} ${productModel} (ID: ${productId})`);
  
  // Get any existing cached prices first
  const existingPrices = await this.getLastFetchedPrices(productId) || {};
  const now = new Date();
  
  try {
    // Get competitor URLs for this product
    const competitorUrls = await this.urlRepository.getCompetitorUrls(
      productId,
      productBrand,
      productModel
    );
    
    // Initialize results with existing prices (in case some fetches fail)
    const competitorPrices: Record<string, CompetitorPrice> = { ...existingPrices };
    
    // Extract prices for each competitor URL
    for (const [competitor, url] of Object.entries(competitorUrls)) {
      try {
        console.log(`[MultiPlatformPriceScraperService] Extracting price from ${competitor}: ${url}`);
        
        // Extract price using the strategy registry
        const priceStr = await this.strategyRegistry.extractPriceFromUrl(url);
        
        // Parse the price value
        const price = this.parsePriceValue(priceStr);
        
        // Update the competitor price information
        competitorPrices[competitor] = {
          competitor,
          price,
          sourceUrl: url,
          lastUpdated: now,
          isLive: true
        };
      } catch (error) {
        // Error handling with fallback to cached data
        competitorPrices[competitor] = existingPrices[competitor] || {
          competitor,
          price: 0,
          sourceUrl: url,
          lastUpdated: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          isLive: false
        };
      }
    }
    
    // Cache the results
    await this.cachePrices(productId, competitorPrices);
    
    return competitorPrices;
  } catch (error) {
    console.error('[MultiPlatformPriceScraperService] Error fetching competitor prices:', error);
    
    // Return existing cached prices with updated isLive status
    return existingPrices;
  }
}
```

**SOLID Principles:**

**Single Responsibility Principle:**
- Show how `PriceScraperService` has a single purpose (extracting prices)
- Demonstrate how facade components have clear, focused responsibilities

**Open/Closed Principle:**
- Show how the system is extensible for new price sources without modifying existing code
- Highlight the extensibility mechanisms you implemented

**Liskov Substitution Principle:**
- Demonstrate how service implementations are interchangeable

**Interface Segregation Principle:**
- Show focused interfaces like `IPriceScraperService`

**Dependency Inversion Principle:**
- Show how high-level modules depend on abstractions

### 5. Notable Features Implemented (0.5-1 page)
- **Multi-platform Price Extraction:** Ability to extract prices from different e-commerce sites
- **Caching System:** Storage of previously fetched prices for improved performance
- **Error Recovery:** Robust error handling and fallback mechanisms
- **Extensible Architecture:** Easy addition of new data sources

### 6. Test Plan (0.5 page)

**Unit Testing Approach:**
- Unit tests for each facade method
- Tests for price scraping functionality with mocked responses
- Tests for error handling when scraping fails

**Integration Testing Approach:**
- Test the facade's interaction with different services
- Verify proper caching behavior
- End-to-end tests for the price comparison feature

**Example Test Plan:**
```typescript
describe('ServiceFacade - Price Comparison', () => {
  let facade: ServiceFacade;
  let mockPriceService: jest.Mock;
  
  beforeEach(() => {
    // Set up mocks
    mockPriceService = jest.fn();
    facade = ServiceFacade.getInstance();
    // Inject mock services
  });
  
  test('should fetch competitor prices through facade', async () => {
    mockPriceService.mockResolvedValue({
      'Competitor A': { price: 199.99, url: 'http://example.com', timestamp: Date.now() }
    });
    
    const prices = await facade.fetchCompetitorPrices('1', 'ModelX', 'BrandY');
    
    expect(prices).toHaveProperty('Competitor A');
    expect(prices['Competitor A'].price).toBe(199.99);
    expect(mockPriceService).toHaveBeenCalledWith('1', 'ModelX', 'BrandY');
  });
  
  test('should handle price service errors gracefully', async () => {
    // Test error handling in facade
  });
});
```

## Chenqian: Backend Implementation (3-4 pages)

### 1. Overview of Individual Contributions (0.5 page)
- Implementation of Firebase integration
- Product repository and data access layer
- Backend service architecture
- Data modeling and schema design

### 2. Major Design Choices and Decisions (0.5-1 page)

**Factory Pattern Implementation:**
- Decision to use Factory Method pattern for product creation
- How the Factory pattern enables type-safe product instantiation
- Benefits for adding new product types

**Firebase Architecture:**
- Structuring of data collections and documents
- Repository pattern implementation
- Service interfaces design

### 3. UML Diagrams (0.5 page)
- Include a focused UML diagram showing:
  - Factory Pattern implementation
  - Product hierarchy
  - Repository pattern implementation
  - Service layer interaction

### 4. SOLID Principles and Design Patterns Applied (1-1.5 pages)

**Factory Method Pattern Implementation:**
- Explain how the Factory Method creates different product types
- Show the flexibility it provides for product creation
- Demonstrate how it supports the Open/Closed principle

**Code Reference:**
```typescript
// Reference from: ScubaDivingApp/src/patterns/factory/ProductFactory.ts (Lines 3-92)

export interface Product {
  id: string;
  type: string;
  name: string;
  brand: string;
  price: number;
  specifications: Record<string, any>;
  imageUrl?: string;
  link: string;
  getDescription(): string;
}

// Concrete products
export class RegulatorProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;
  link: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>, link: string) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'regulator';
    this.specifications = specs;
    this.link = link;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - A reliable regulator for your diving needs`;
  }
}

export class BCDProduct implements Product {
  // Similar implementation...
  
  getDescription(): string {
    return `${this.brand} ${this.name} - A comfortable BCD with excellent buoyancy control`;
  }
}

export class FinProduct implements Product {
  // Similar implementation...
  
  getDescription(): string {
    return `${this.brand} ${this.name} - High-performance fins for optimal propulsion`;
  }
}

// Product Factory that creates different product types
export class ProductFactory {
  createProduct(
    type: string,
    id: string,
    name: string,
    brand: string,
    price: number,
    link: string,
    specifications: Record<string, any> = {},
    imageUrl?: string
  ): Product {
    return {
      id,
      type,
      name,
      brand,
      price,
      link,
      specifications,
      imageUrl,
      getDescription: () => `${brand} ${name} - ${type}`
    };
  }
}
```

**SOLID Principles:**

**Single Responsibility Principle:**
- Show how `FirebaseService` handles only Firebase interactions
- Demonstrate how repositories focus on specific data access tasks

**Open/Closed Principle:**
- Show how new product types can be added without modifying existing code
- Highlight how the factory pattern enables this

**Liskov Substitution Principle:**
- Demonstrate how repository implementations are interchangeable
- Show how all product subtypes can be used where a Product is expected

**Interface Segregation Principle:**
- Show focused interfaces like `IProductRepository`

**Dependency Inversion Principle:**
- Show how ServiceFacade depends on repository interfaces, not implementations

### 5. Notable Features Implemented (0.5-1 page)
- **Factory Method Implementation:** Type-safe product creation
- **Firebase Integration:** Real-time database connectivity
- **Repository Pattern:** Clean separation of data access from business logic
- **Product Type Handling:** Support for multiple product types with specific details

### 6. Test Plan (0.5 page)

**Unit Testing Approach:**
- Unit tests for the Product Factory pattern
- Tests for repository methods using Firebase emulator
- Mock testing for Firebase service

**Integration Testing Approach:**
- Integration tests for repository with real Firebase instance
- Verify proper data fetching and filtering
- Test error scenarios

**Example Test Plan:**
```typescript
describe('ProductFactory', () => {
  let factory: ProductFactory;
  
  beforeEach(() => {
    factory = new ProductFactory();
  });
  
  test('should create regulator product', () => {
    const product = factory.createProduct(
      'regulator',
      '1',
      'Test Regulator',
      'TestBrand',
      299.99,
      'http://example.com/product/1'
    );
    
    expect(product.type).toBe('regulator');
    expect(product.getDescription()).toContain('Test Regulator');
  });
  
  test('should create BCD product', () => {
    const product = factory.createProduct(
      'bcd',
      '2',
      'Test BCD',
      'TestBrand',
      499.99,
      'http://example.com/product/2'
    );
    
    expect(product.type).toBe('bcd');
    expect(product.getDescription()).toContain('Test BCD');
  });
});
```

## Shimin: Frontend Implementation (3-4 pages)

### 1. Overview of Individual Contributions (0.5 page)
- Implementation of React Native UI components
- Screen workflows and navigation
- Component state management
- User experience design

### 2. Major Design Choices and Decisions (0.5-1 page)

**Visitor Pattern Implementation:**
- Decision to use Visitor pattern for operations on products
- How visitor pattern separates operations from object structures
- Benefits for extending functionality without modifying product classes

**Component Architecture:**
- Component composition strategy
- State management approach
- Navigation design

### 3. UML Diagrams (0.5 page)
- Include a focused UML diagram showing:
  - Visitor pattern implementation
  - Component hierarchy
  - Screen navigation flow
  - Data flow between components

### 4. SOLID Principles and Design Patterns Applied (1-1.5 pages)

**Visitor Pattern Implementation:**
- Explain how the Visitor pattern separates operations from product objects
- Show how new operations can be added without changing product classes
- Demonstrate the flexibility it provides for different calculations or operations

**Code Reference:**
```typescript
// Reference from: ScubaDivingApp/src/patterns/visitor/ProductVisitor.ts (Lines 6-73)

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
```

**Example of Using Visitor in Components:**
```typescript
// Example of how the visitor pattern would be used in a React component

import { VisitableProduct, PriceCalculatorVisitor } from '../patterns/visitor/ProductVisitor';

// Component that displays product price with dynamic calculation
const ProductPriceDisplay: React.FC<{
  product: VisitableProduct, 
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}> = ({
  product,
  experienceLevel
}) => {
  const calculatePrice = () => {
    const visitor = new PriceCalculatorVisitor(experienceLevel);
    return product.accept(visitor);
  };
  
  return (
    <Text style={styles.price}>
      ${calculatePrice().toFixed(2)}
    </Text>
  );
};
```

**SOLID Principles:**

**Single Responsibility Principle:**
- Show how components have specific responsibilities
- Demonstrate how visitor implementations handle specific operations

**Open/Closed Principle:**
- Show how visitor pattern allows adding new operations without modifying product classes
- Highlight how component composition allows for extension

**Liskov Substitution Principle:**
- Demonstrate how product implementations are interchangeable with their base types
- Show how visitor implementations can be substituted

**Interface Segregation Principle:**
- Show focused props interfaces for components
- Demonstrate specific visitor interfaces

**Dependency Inversion Principle:**
- Show how components depend on abstractions through props
- Demonstrate use of context for dependency injection

### 5. Notable Features Implemented (0.5-1 page)
- **Visitor Pattern for Product Operations:** Flexible operations on products without modifying them
- **Product Selection UI:** Filtering and display of product catalog
- **Product Details View:** Comprehensive product information display
- **Price Display:** Dynamic price calculation based on user experience level

### 6. Test Plan (0.5 page)

**Unit Testing Approach:**
- Unit tests for visitor pattern implementations
- Tests for React components using React Testing Library
- Mock testing for hooks and state management

**Integration Testing Approach:**
- Testing component integration with React Navigation
- Testing visitor pattern integration with UI components
- End-to-end testing of user flows

**Example Test Plan:**
```typescript
describe('PriceCalculatorVisitor', () => {
  let visitor: PriceCalculatorVisitor;
  let regulatorProduct: VisitableRegulatorProduct;
  
  beforeEach(() => {
    regulatorProduct = new VisitableRegulatorProduct(
      '1', 'Test Regulator', 'TestBrand', 300, {}, 'http://example.com'
    );
    
    visitor = new PriceCalculatorVisitor('intermediate');
  });
  
  test('should calculate price based on experience level', () => {
    const price = regulatorProduct.accept(visitor);
    // No discount for intermediate on regulators
    expect(price).toBe(300);
  });
  
  test('should apply discount for advanced divers on regulators', () => {
    const advancedVisitor = new PriceCalculatorVisitor('advanced');
    const price = regulatorProduct.accept(advancedVisitor);
    // 5% discount for advanced
    expect(price).toBe(285); // 300 * 0.95
  });
});
```

## General Testing Strategy

For team members who have not implemented tests yet, here is a simple testing strategy that can be quickly implemented:

1. **Setup Testing Environment:**
   ```bash
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

2. **Configure Jest in package.json:**
   ```json
   "jest": {
     "preset": "react-native",
     "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
     "transformIgnorePatterns": [
       "node_modules/(?!(react-native|@react-native|react-native-.*)/)"
     ]
   }
   ```

3. **Focus on Testing Design Patterns:**
   - Test Factory Method pattern implementations
   - Test Visitor pattern operations 
   - Test Facade pattern method calls

4. **Document Test Cases (Even if not fully implemented):**
   - Document what tests would be written
   - Explain the testing approach
   - Provide example test cases with comments

5. **Simple Test Implementation:**
   ```typescript
   // Example basic test for Factory Pattern
   test('Factory creates correct product types', () => {
     const factory = new ProductFactory();
     
     const regulator = factory.createProduct('regulator', '1', 'Test', 'Brand', 100, 'url');
     const bcd = factory.createProduct('bcd', '2', 'Test', 'Brand', 100, 'url');
     
     expect(regulator.type).toBe('regulator');
     expect(bcd.type).toBe('bcd');
   });
   ```

This approach allows you to demonstrate testing knowledge without fully implementing all tests before the deadline. 