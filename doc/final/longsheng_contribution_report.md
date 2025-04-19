# Longsheng's Individual Contribution Report

## 1. Overview of Individual Contributions

As the architecture lead for the ScubaDivingSales Assistant application, my primary contributions focused on designing and implementing the overall architectural framework and the price scraping functionality. I established the foundational design patterns (Factory Method, Visitor, and Façade) that enabled the application to evolve from a simple regulator product viewer to a comprehensive multi-product sales assistant tool. I also developed the price scraping functionality that gives sales representatives competitive pricing information in real-time.

## 2. Major Design Choices and Decisions

### 2.1 Evolution from Simple to Complex Architecture

The ScubaDivingSales Assistant app began with a straightforward requirement: display information about regulator products to assist sales representatives. Initially, a simple, direct approach would have sufficed. However, anticipating future growth, I made a strategic decision to implement a scalable architecture based on established design patterns.

This foresight proved valuable when the requirements expanded to include multiple product types (BCDs and fins), each with different specifications and behaviors. Rather than refactoring the entire codebase, our architecture accommodated these changes with minimal disruption.

The evolution occurred in three distinct phases:

**Phase 1: Single Product Type (Regulators)**
- Initial implementation supported only regulator products
- Basic display of product information and simple price comparisons
- Limited product operations (display and basic filtering)

**Phase 2: Multiple Product Types (Regulators + BCDs)**
- Expanded to support BCD products with different specifications
- Introduced Factory Method pattern to create different product types
- Implemented Visitor pattern to perform operations based on product type

**Phase 3: Comprehensive Product Support (Regulators + BCDs + Fins)**
- Added support for fins and potential future product categories
- Enhanced operations with user experience levels (beginner/intermediate/advanced)
- Implemented Façade pattern to simplify access to increasingly complex services

### 2.2 Design Pattern Selection Rationale

The growing complexity of the application necessitated structured design approaches. I carefully selected three complementary design patterns to address specific architectural challenges:

#### Factory Method Pattern

**Problem:** How to create different product objects without specifying their concrete classes in the client code?

**Solution:** The Factory Method pattern enabled us to create products based on type without exposing object creation logic.

**Implementation Decision:** I implemented `ProductFactory` to encapsulate the product creation process, allowing the app to evolve from a single product type to multiple product types without changing client code.

```typescript
// Factory Method Pattern implementation
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

#### Visitor Pattern

**Problem:** How to add operations to product objects without modifying their classes?

**Solution:** The Visitor pattern allowed us to define operations on products based on their type without changing product classes.

**Implementation Decision:** I implemented the Visitor pattern to enable operations like price calculations based on diver experience levels and product recommendations without modifying the product classes themselves.

```typescript
// Visitor Pattern implementation
export interface ProductVisitor {
  visitRegulator(product: RegulatorProduct): any;
  visitBCD(product: BCDProduct): any;
  visitFin(product: FinProduct): any;
}

// Concrete visitor example
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
  
  // Other visit methods...
}
```

#### Façade Pattern

**Problem:** How to provide a simple interface to a complex subsystem with multiple services?

**Solution:** The Façade pattern provided a unified interface to complex subsystems like price scraping and Firebase data access.

**Implementation Decision:** I implemented `ServiceFacade` to hide the complexity of interacting with multiple services, making it easier for UI components to access functionality without understanding the underlying implementation details.

```typescript
// Façade Pattern implementation
export class ServiceFacade {
  private static instance: ServiceFacade;
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  private realTimePriceScraperService: IPriceScraperService;
  private multiPlatformPriceScraperService: IPriceScraperService;
  
  // Simplified method example
  async fetchRealTimeCompetitorPrices(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, CompetitorPrice>;
    isFetching: boolean;
  }> {
    try {
      // This hides complex interactions between multiple services
      const result = {
        product: await this.productRepository.getProduct(productId),
        competitorPrices: {},
        isFetching: true
      };
      
      // Get cached prices first for immediate display
      const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      if (cachedPrices) {
        result.competitorPrices = cachedPrices;
      }
      
      // Start async fetch for new prices
      this.realTimePriceScraperService
        .fetchCompetitorPrices(
          productId, 
          result.product.name, 
          result.product.brand
        )
        .then(freshPrices => {
          console.log('Fetched fresh competitor prices:', freshPrices);
        })
        .catch(error => {
          console.error('Error fetching real-time competitor prices:', error);
        });
      
      return result;
    } catch (error) {
      console.error('Error starting real-time price comparison:', error);
      throw error;
    }
  }
}
```

## 3. Architecture Diagram

```
+----------------+     +-----------------+     +---------------+     +------------------+
|   FRONTEND     |     |  SERVICE FACADE |     |  SERVICES    |     | EXTERNAL SYSTEMS |
|                |     |                 |     |              |     |                  |
+----------------+     +-----------------+     +---------------+     +------------------+
         |                     |                      |                       |
         v                     v                      v                       v
+----------------+     +-----------------+     +---------------+     +------------------+
| ProductCard    |     |                 |     | PriceScraper  |     | Competitor      |
| ProductList    |---->| ServiceFacade   |---->| Service       |---->| Websites        |
| Comparison     |     | (Façade Pattern)|     |               |     |                  |
+----------------+     +-----------------+     +---------------+     +------------------+
         |                     |                      |
         |                     v                      v
         |              +-----------------+     +---------------+
         |              | ProductFactory  |     | FirebaseService|
         +------------->| (Factory Method)|     | (Façade Pattern)|
                        +-----------------+     +---------------+
                                |                      |
                                v                      v
                        +-----------------+     +---------------+
                        | Product Objects |     | Firestore DB |
                        | with Visitors   |     |              |
                        +-----------------+     +---------------+
```

## 4. Software Engineering Principles Applied

### 4.1 SOLID Principles in Price Scraping Implementation

The price scraping functionality demonstrates careful application of SOLID principles:

#### Single Responsibility Principle (SRP)

Each class in the price scraping implementation has a single, well-defined responsibility:

```typescript
// PriceScraperService.ts - Responsible ONLY for fetching and caching competitor prices
export class PriceScraperService implements IPriceScraperService {
  async fetchCompetitorPrices(
    productId: string, 
    productModel: string, 
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    // Implementation for fetching prices...
  }
  
  async getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null> {
    // Retrieves cached prices from AsyncStorage...
  }
  
  private async cachePrices(productId: string, prices: Record<string, CompetitorPrice>): Promise<void> {
    // Caches price data using AsyncStorage...
  }
}

// MultiPlatformPriceScraperService.ts - Responsible ONLY for coordinating price extraction across platforms
export class MultiPlatformPriceScraperService implements IPriceScraperService {
  private urlRepository: IProductUrlRepository;
  private strategyRegistry: PlatformStrategyRegistry;
  
  async fetchCompetitorPrices(
    productId: string, 
    productModel: string, 
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>> {
    // Coordinates extraction using appropriate strategies for each URL...
  }
}

// LazadaExtractionStrategy.ts - Responsible ONLY for extracting from a specific platform
export class LazadaExtractionStrategy implements IPlatformExtractionStrategy {
  getPlatformName(): string {
    return 'Lazada';
  }
  
  canHandleUrl(url: string): boolean {
    return url.includes('lazada.sg');
  }
  
  async extractPrice(url: string): Promise<string | null> {
    // Platform-specific extraction logic...
  }
}

// PlatformStrategyRegistry.ts - Responsible ONLY for managing extraction strategies
export class PlatformStrategyRegistry {
  private strategies: IPlatformExtractionStrategy[] = [];
  
  public registerStrategy(strategy: IPlatformExtractionStrategy): void {
    // Registers new extraction strategies...
  }
  
  public getStrategyForUrl(url: string): IPlatformExtractionStrategy | null {
    // Returns appropriate strategy for a URL...
  }
}
```

This separation ensures that each class has a focused purpose, making the codebase more maintainable and reducing the impact of changes. Changes to one platform's extraction logic have no effect on other components, demonstrating excellent adherence to SRP.

#### Open/Closed Principle (OCP)

The price scraping implementation is designed to be extended without modification through well-defined interfaces:

```typescript
// IPriceScraperService interface allows new implementations without changing clients
export interface IPriceScraperService {
  fetchCompetitorPrices(
    productId: string,
    productModel: string,
    productBrand: string
  ): Promise<Record<string, CompetitorPrice>>;
  
  getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null>;
}

// New implementation added without changing existing code
export class MultiPlatformPriceScraperService implements IPriceScraperService {
  // Implementation that supports multiple platforms
}
```

This design allowed us to add support for new competitor websites without modifying existing code, demonstrating the OCP principle in action.

#### Liskov Substitution Principle (LSP)

The price scraping functionality demonstrates LSP through interchangeable service implementations:

```typescript
// The IPriceScraperService interface defines behavior contract that all scrapers must follow
export interface IPriceScraperService {
  fetchCompetitorPrices(productId: string, productModel: string, productBrand: string): 
    Promise<Record<string, CompetitorPrice>>;
  getLastFetchedPrices(productId: string): Promise<Record<string, CompetitorPrice> | null>;
}

// ServiceFacade can use ANY implementation of IPriceScraperService
// This LSP adherence allows seamless switching between implementations
async fetchCompetitorPrices(productId: string, productModel: string, productBrand: string): Promise<Record<string, CompetitorPrice>> {
  try {
    // First try the multi-platform implementation
    return await this.multiPlatformPriceScraperService.fetchCompetitorPrices(
      productId, productModel, productBrand
    );
  } catch (error) {
    console.error('Multi-platform service failed, falling back to basic scraper:', error);
    
    // Fallback to basic implementation - LSP makes this substitution possible
    return await this.realTimePriceScraperService.fetchCompetitorPrices(
      productId, productModel, productBrand
    );
  }
}
```

This LSP implementation creates significant advantages:
- **Resilience:** The system continues working even when one scraping method fails
- **Adaptability:** New scraping implementations can be introduced without changing client code
- **Maintainability:** Each scraper implementation can evolve independently
- **Testing:** Scrapers can be mocked or substituted easily during testing

LSP allowed you to implement a robust multi-level fallback strategy, crucial for reliable price scraping in an environment where external websites frequently change.

### 4.2 Façade Pattern Implementation

The ServiceFacade class exemplifies the Façade pattern by providing a unified interface to multiple complex subsystems:

```typescript
// ServiceFacade.ts
export class ServiceFacade {
  private static instance: ServiceFacade;
  
  // Complex subsystems
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  private realTimePriceScraperService: IPriceScraperService;
  private multiPlatformPriceScraperService: IPriceScraperService;
  
  // Simple interface for product retrieval with price comparison
  async getProductWithPriceComparison(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, number>;
  }> {
    try {
      const product = await this.productRepository.getProduct(productId);
      const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      
      const competitorPrices: Record<string, number> = {};
      
      if (cachedPrices) {
        Object.entries(cachedPrices).forEach(([competitor, data]) => {
          competitorPrices[competitor] = data.price;
        });
      } else {
        // Fallback to mock prices if no cached data
        competitorPrices['Competitor A'] = product.price * 1.1;
        competitorPrices['Competitor B'] = product.price * 0.95;
        competitorPrices['Competitor C'] = product.price * 1.05;
      }

      return {
        product,
        competitorPrices,
      };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }
}
```

Key implementation points:
- Hides the complexity of interacting with multiple services
- Provides simple, unified methods for common operations
- Handles errors and fallback mechanisms
- Shields UI components from implementation details

## 5. Notable Features Implemented

The key features I implemented include:

1. **Real-time Competitor Price Scraping**: Developed functionality to fetch and display prices from competitor websites, giving sales representatives competitive information.

2. **Product Image Extraction**: Implemented a system to extract product images from competitor websites to enhance product displays.

3. **Multi-platform Price Comparison**: Extended the price scraping functionality to support multiple e-commerce platforms with a consistent interface.

## 6. Testing Approach

I implemented a comprehensive testing strategy for the architecture and price scraping components:

1. **Unit Testing**: Each design pattern implementation was tested in isolation to ensure correct behavior.

2. **Integration Testing**: Verified that different components work together correctly, particularly the interactions between the ServiceFacade and the various services.

3. **Mock Testing**: Used mocked data to test the price scraping functionality without making actual network requests to competitor websites.

The test coverage focuses on the core business logic, especially the Factory Method, Visitor, and Façade pattern implementations, ensuring that they adhere to SOLID principles. 