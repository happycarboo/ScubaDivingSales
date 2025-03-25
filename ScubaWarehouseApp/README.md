# ScubaWarehouse Sales Assistant App

## Architecture Overview

This React Native application is designed for iPad use by ScubaWarehouse sales representatives, following SOLID principles and implementing key design patterns.

### Core Architecture Components

#### Frontend (React Native)
- **Product Selection UI**: Filter interface for customer requirements
- **Product Details View**: Detailed product specifications
- **Comparison UI**: Side-by-side product comparison
- **Intelligent Search**: Natural language query processing
- **Real-Time Price Comparison**: Display of competitor pricing

#### Backend (Node.js API Layer)
- **Business Logic Processing**: Core workflow management
- **API Management Layer**: Request handling and authentication
- **Product Filtering**: Customer-specific product selection
- **Product Recommendations**: Experience-based suggestions

#### Database (Firebase)
- **ScubaProduct Gear Filter**: Product database and filtering
- **Realtime & Historical Prices**: Price history tracking

#### External Price Comparison
- **Web Scraper**: Competitor price collection
- **Real-Time Sync**: Price data synchronization

## SOLID Principles Implementation

The application strictly adheres to SOLID principles throughout its architecture:

### 1. Single Responsibility Principle (SRP)

Each class and component has one responsibility and one reason to change:

- **Repositories**: `ProductRepository` only manages product data, while `PriceRepository` only manages price data
- **Services**: `WebScraper` only handles scraping, `PriceComparisonService` only handles price comparisons
- **Components**: UI components like `ProductItem` only handle rendering their specific data

**Example**: The `FilterFactory` only creates filters, while each filter class only applies its specific filtering logic.

```typescript
// FilterFactory focuses solely on creating filters
export class FilterFactory {
  static createFilter(filterCriteria: Record<string, string>): Filter {
    const compositeFilter = new CompositeFilter();
    // Filter creation logic
    return compositeFilter;
  }
}

// PriceFilter focuses solely on filtering by price
class PriceFilter implements Filter {
  constructor(private priceRange: string) {}
  
  apply(products: any[]): any[] {
    // Price filtering logic
  }
}
```

### 2. Open/Closed Principle (OCP)

The system is open for extension but closed for modification:

- **Filter System**: New filter types can be added without changing existing filter code
- **Component Hierarchy**: New UI components can be added without modifying parent components
- **API Services**: New endpoints can be added without changing existing service code

**Example**: Adding a new filter type requires only creating a new filter class and adding a case to the factory method:

```typescript
// Add a new filter by creating a new class
class ColorFilter implements Filter {
  constructor(private color: string) {}
  
  apply(products: any[]): any[] {
    return products.filter(product => product.color === this.color);
  }
}

// And adding a new case in the factory without changing existing filter classes
static createFilter(filterCriteria) {
  // Existing code...
  switch (key) {
    // Existing cases...
    case 'Color':
      compositeFilter.addFilter(new ColorFilter(value));
      break;
  }
}
```

### 3. Liskov Substitution Principle (LSP)

Subtypes can be substituted for their base types without altering correctness:

- **Filter Interface**: All filter implementations can be used anywhere a Filter is expected
- **Repository Pattern**: Different repository implementations can be swapped if they follow the interface
- **Service Pattern**: Different service implementations can be substituted if they maintain the contract

**Example**: All filter types can be used interchangeably within `CompositeFilter`:

```typescript
class CompositeFilter implements Filter {
  private filters: Filter[] = [];
  
  addFilter(filter: Filter): void {
    // Any Filter implementation can be added here
    this.filters.push(filter);
  }
  
  apply(products: any[]): any[] {
    // All Filter implementations work here
    return this.filters.reduce(
      (filteredProducts, filter) => filter.apply(filteredProducts),
      products
    );
  }
}
```

### 4. Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use:

- **Component Props**: Components only receive props they need
- **Service APIs**: Services expose only methods relevant to their domain
- **Repository Methods**: Repositories provide focused methods for specific data needs

**Example**: `ProductItem` only receives the product data and handlers it needs:

```typescript
interface ProductItemProps {
  product: Product;
  onPress: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  // Component implementation
};
```

### 5. Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not details:

- **Facades**: Components interact with services through facades
- **Factories**: Services use factories to create objects without depending on concrete implementations
- **Repositories**: Business logic depends on repository interfaces, not specific database implementations

**Example**: `ApiServiceFacade` depends on abstractions rather than concrete implementations:

```typescript
export class ApiServiceFacade {
  // Depends on abstractions (interfaces) rather than concrete classes
  private static productRepository: ProductRepositoryInterface;
  private static priceRepository: PriceRepositoryInterface;
  
  // Methods using abstractions
  public static async getFilteredProducts(filters: any): Promise<any[]> {
    return this.productRepository.getFilteredProducts(filters);
  }
}
```

## Design Patterns Implementation

### Factory Method Pattern
- `ProductFactory`: Creates different product type instances
- `FilterFactory`: Creates specialized filter instances

### Visitor Pattern
- `ProductVisitor`: Implements operations on product structures
- `FilterVisitor`: Enables flexible filter operations

### Facade Pattern
- `ApiServiceFacade`: Simplifies API interaction
- `ProductServiceFacade`: Provides unified product operations interface

## Folder Structure

```
ScubaWarehouseApp/
├── src/
│   ├── api/               # API definitions and interfaces
│   ├── assets/            # Images, fonts, and static resources
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   ├── product/       # Product-related components
│   │   ├── comparison/    # Comparison-related components
│   │   ├── search/        # Search-related components
│   │   └── price/         # Price-related components
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── patterns/          # Design pattern implementations
│   │   ├── factory/       # Factory method pattern
│   │   ├── visitor/       # Visitor pattern
│   │   └── facade/        # Facade pattern
│   ├── screens/           # Application screens
│   ├── services/          # Service layer
│   │   ├── api/           # API client services
│   │   ├── database/      # Firebase interaction
│   │   ├── scraping/      # Web scraping services
│   │   ├── recommendation/# Product recommendation engine
│   │   └── filtering/     # Product filtering services
│   ├── store/             # State management
│   ├── tests/             # Testing infrastructure
│   │   ├── unit/          # Unit tests
│   │   ├── integration/   # Integration tests
│   │   └── e2e/           # End-to-end tests
│   └── utils/             # Utility functions
├── App.tsx                # Root component
├── index.js               # Entry point
├── package.json           # Dependencies
└── [other config files]   # Various configuration files
```

## Development Guidelines

- Follow SOLID principles in all implementations
- Add new features using the appropriate design patterns
- Write comprehensive tests for all components and services
- Maintain consistent style and error handling
- Document all public interfaces and components
- Focus on iPad-specific optimizations

## Adding New Features

When adding new features, follow these guidelines:

1. **Identify the domain**: Determine which area of the application your feature belongs to
2. **Use existing patterns**: Follow the established design patterns for that domain
3. **Adhere to SOLID**: Ensure your implementation follows SOLID principles
4. **Write tests**: Include unit and integration tests for your feature
5. **Document**: Add documentation for your feature in the code and update this README if necessary
