# ScubaDivingApp Design Patterns Implementation

## Design Patterns UML Diagram

This diagram focuses on how our application implements the three key design patterns studied in class, showing the relationships between components.

```
+--------------------------------------------------------------------------------------------------------------------------+
|                                    CORE DESIGN PATTERNS IMPLEMENTATION                                                    |
+--------------------------------------------------------------------------------------------------------------------------+

+------------------------+            +--------------------------------+           +--------------------------+
|   FACTORY PATTERN      |            |       FACADE PATTERN           |           |      VISITOR PATTERN      |
+------------------------+            +--------------------------------+           +--------------------------+
|                        |            |                                |           |                          |
|  +------------------+  |            |    +---------------------+     |           |  +--------------------+  |
|  | <<interface>>    |  |            |    |    ServiceFacade    |     |           |  | <<interface>>      |  |
|  |     Product      |  |            |    +---------------------+     |           |  |  ProductVisitor<T> |  |
|  +------------------+  |            |    | - instance: Service |     |           |  +--------------------+  |
|  | + id: string     |  |            |    | - firebaseService  |-----+---------->|  | + visitRegulator()  |  |
|  | + name: string   |  |<-----------+----| - productRepository|     |           |  | + visitBCD()       |  |
|  | + brand: string  |  |            |    | - priceService     |     |           |  | + visitFin()       |  |
|  | + getDescription()|  |            |    +---------------------+     |           |  +--------------------+  |
|  +------------------+  |            |    | + getInstance()     |     |           |          ^               |
|          ^             |            |    | + getProducts()     |     |           |          |               |
|          |             |            |    | + getProductDetails()|    |           |          |               |
|  +-------+--------+    |            |    | + getCompetitorPrices|    |           |  +-------+------------+  |
|  |                |    |            |    +---------------------+     |           |  |PriceCalculatorVisitor| |
|  |                |    |            |              ^                 |           |  +--------------------+  |
|  v                v    |            |              |                 |           |  | - userExpLevel     |  |
|+-------------+  +-----+---+        |    +---------+-----------+     |           |  +--------------------+  |
|| RegulatorP..|  | BCDProduct|       |    |     Components     |     |           |  | + visitRegulator() |  |
|+-------------+  +---------+        |    +-------------------+       |           |  | + visitBCD()      |  |
|| + getDesc() |  |+ getDesc()|       |    | - UI components   |       |           |  | + visitFin()      |  |
|+-------------+  +---------+        |    +-------------------+       |           |  +--------------------+  |
|                                    |                                |           |                          |
+------------------------+            +--------------------------------+           +--------------------------+
           |                                        |                                           |
           |                                        |                                           |
           v                                        v                                           v
+--------------------------------------------------------------------------------------------------------------+
|                                           SOLID PRINCIPLES                                                    |
+--------------------------------------------------------------------------------------------------------------+
|                                                                                                              |
|  +------------------------+  +------------------------+  +-------------------------+  +----------------------+ |
|  | Single Responsibility  |  |   Open/Closed          |  | Liskov Substitution    |  | Interface Segregation| |
|  +------------------------+  +------------------------+  +-------------------------+  +----------------------+ |
|  | Each class has a       |  | Strategy pattern for   |  | Products all satisfy   |  | Small, focused       | |
|  | single purpose:        |  | price extraction:      |  | the Product interface: |  | interfaces:          | |
|  | - ProductFactory       |  | - IStrategy interface  |  | - RegulatorProduct     |  | - IPriceScraperSvc   | |
|  | - ServiceFacade        |  | - Platform-specific    |  | - BCDProduct           |  | - IFirebaseService   | |
|  | - PriceScraperService  |  |   implementations      |  | - FinProduct           |  | - IProductRepository | |
|  +------------------------+  +------------------------+  +-------------------------+  +----------------------+ |
|                                                                                                              |
|                                   +----------------------------------+                                       |
|                                   |      Dependency Inversion        |                                       |
|                                   +----------------------------------+                                       |
|                                   | High-level modules depend        |                                       |
|                                   | on abstractions:                 |                                       |
|                                   | - ServiceFacade → IFirebaseService|                                      |
|                                   | - Components → ServiceFacade     |                                       |
|                                   +----------------------------------+                                       |
|                                                                                                              |
+--------------------------------------------------------------------------------------------------------------+
```

## Factory Pattern Implementation

```
// Factory Method Pattern for product creation
export class ProductFactory {
  createProduct(
    type: string,
    id: string,
    name: string,
    brand: string,
    price: number,
    link: string,
    specifications: Record<string, any> = {},
  ): Product {
    return {
      id,
      type,
      name,
      brand,
      price,
      link,
      specifications,
      getDescription: () => `${brand} ${name} - ${type}`
    };
  }
}
```

## Facade Pattern Implementation

```
// Facade Pattern simplifies complex subsystem interactions
export class ServiceFacade {
  private static instance: ServiceFacade;
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  private priceScraperService: IPriceScraperService;
  
  // Singleton pattern
  public static getInstance(): ServiceFacade {
    if (!ServiceFacade.instance) {
      ServiceFacade.instance = new ServiceFacade();
    }
    return ServiceFacade.instance;
  }
  
  // Simplified API for fetching products
  async getProductsWithFilters(filters: Record<string, any>): Promise<Product[]> {
    try {
      if (filters.type) {
        return await this.productRepository.getProductsByType(filters.type);
      }
      return await this.productRepository.getAllProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
  
  // Simplified API for price comparison
  async getProductWithPriceComparison(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, number>;
  }> {
    // Implementation details...
  }
}
```

## Visitor Pattern Implementation

```
// Visitor Pattern separates algorithms from objects they operate on
export interface ProductVisitor<T> {
  visitRegulator(product: RegulatorProduct): T;
  visitBCD(product: BCDProduct): T;
  visitFin(product: FinProduct): T;
}

export class PriceCalculatorVisitor implements ProductVisitor<number> {
  constructor(private userExperienceLevel: string) {}
  
  visitRegulator(product: RegulatorProduct): number {
    // Special price calculation for regulators based on experience
    return product.price * this.getExperienceMultiplier();
  }
  
  visitBCD(product: BCDProduct): number {
    // Special price calculation for BCDs based on experience
    return product.price * this.getExperienceMultiplier();
  }
  
  visitFin(product: FinProduct): number {
    // Special price calculation for fins based on experience
    return product.price * this.getExperienceMultiplier();
  }
  
  private getExperienceMultiplier(): number {
    // Apply different pricing based on experience level
    switch(this.userExperienceLevel) {
      case 'beginner': return 1.0;
      case 'intermediate': return 0.95;
      case 'advanced': return 0.9;
      default: return 1.0;
    }
  }
}

// Product classes implement accept method
export class RegulatorProduct implements Product {
  // ...other properties and methods
  
  accept<T>(visitor: ProductVisitor<T>): T {
    return visitor.visitRegulator(this);
  }
}
```

## SOLID Principles Implementation

1. **Single Responsibility Principle**
   - Each class has exactly one reason to change
   - ServiceFacade manages service orchestration
   - ProductFactory handles product creation
   - PriceScraperService focuses only on price extraction

2. **Open/Closed Principle**
   - Strategy pattern allows adding new price extraction strategies without modifying existing code
   - New product types can be added without changing the factory

3. **Liskov Substitution Principle**
   - All product types (Regulator, BCD, Fin) can be used interchangeably where a Product is expected
   - All strategy implementations can be used wherever the IStrategy interface is expected

4. **Interface Segregation Principle**
   - Small, focused interfaces (IProductRepository, IPriceScraperService)
   - No client is forced to depend on methods it doesn't use

5. **Dependency Inversion Principle**
   - High-level modules (ServiceFacade) depend on abstractions (interfaces)
   - UI components depend on the ServiceFacade, not concrete implementations
   - Concrete implementations are injected or instantiated only at composition root 