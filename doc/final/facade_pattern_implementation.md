# Facade Design Pattern Implementation in ScubaDivingApp

## Overview of Facade Pattern

The Facade design pattern provides a simplified interface to a complex subsystem of classes. In the ScubaDivingApp, the Facade pattern has been implemented to shield the UI components from the complexities of service interactions, data fetching, and cross-subsystem operations.

## Key Implementation Files

The primary implementation of the Facade pattern in ScubaDivingApp is found in:

- **`src/patterns/facade/ServiceFacade.ts`**: The core Facade implementation that simplifies interactions with multiple subsystems

## Frontend Implementation

### How Frontend Components Utilize the Facade

Frontend components in the application never directly interact with individual services. Instead, they use the ServiceFacade as a single point of entry to access all backend functionality.

```
Frontend Components → ServiceFacade → Various Services/Repositories
```

### Code Examples from Frontend

1. **Product Selection Screen**

In product selection screens, instead of making direct service calls, components use the facade:

```typescript
// src/screens/ProductSelection/ProductSelectionScreen.tsx
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';

const ProductSelectionScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const serviceFacade = ServiceFacade.getInstance();
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Using facade instead of direct repository access
        const fetchedProducts = await serviceFacade.getProductsWithFilters({ 
          type: 'regulator' 
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    loadProducts();
  }, []);
  
  // Component rendering...
};
```

2. **Price Comparison Feature**

When displaying price comparisons, components rely on the facade to handle the complex process of fetching and formatting price data:

```typescript
// src/screens/ProductDetails/PriceComparisonSection.tsx
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';

const PriceComparisonSection = ({ productId }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const serviceFacade = ServiceFacade.getInstance();
  
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        // Facade handles the complex coordination between services
        const data = await serviceFacade.fetchRealTimeCompetitorPrices(productId);
        setPriceData(data);
      } catch (error) {
        console.error('Error fetching price comparison data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceData();
  }, [productId]);
  
  // Component rendering...
};
```

3. **Product Detail Rendering**

For displaying product details, the facade simplifies access to both product data and technical specifications:

```typescript
// src/screens/ProductDetails/ProductDetailsScreen.tsx
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';

const ProductDetailsScreen = ({ route }) => {
  const { productId } = route.params;
  const [productDetails, setProductDetails] = useState(null);
  const serviceFacade = ServiceFacade.getInstance();
  
  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        // One simple call instead of multiple service calls
        const details = await serviceFacade.getProductWithTechDetails(productId);
        setProductDetails(details);
      } catch (error) {
        console.error('Error loading product details:', error);
      }
    };
    
    loadProductDetails();
  }, [productId]);
  
  // Component rendering...
};
```

## Backend Implementation

### ServiceFacade as a Central Coordination Point

The `ServiceFacade` class orchestrates interactions between multiple backend services and repositories, hiding their complexity from the frontend components.

```typescript
// src/patterns/facade/ServiceFacade.ts
export class ServiceFacade {
  private static instance: ServiceFacade;
  
  // Service dependencies
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  private realTimePriceScraperService: IPriceScraperService;
  private multiPlatformPriceScraperService: IPriceScraperService;
  
  // Singleton pattern
  public static getInstance(): ServiceFacade {
    if (!ServiceFacade.instance) {
      ServiceFacade.instance = new ServiceFacade();
    }
    return ServiceFacade.instance;
  }
  
  // Example of a facade method that coordinates multiple services
  async getProductWithPriceComparison(productId: string): Promise<{
    product: Product;
    competitorPrices: Record<string, number>;
  }> {
    try {
      // Get product from repository
      const product = await this.productRepository.getProduct(productId);
      
      // Get cached prices from price scraper service
      const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
      
      // Format prices for frontend consumption
      const competitorPrices: Record<string, number> = {};
      
      if (cachedPrices) {
        // Transform complex price objects to simple key-value pairs
        Object.entries(cachedPrices).forEach(([competitor, data]) => {
          competitorPrices[competitor] = data.price;
        });
      } else {
        // Provide fallback data if no cached prices exist
        competitorPrices['Competitor A'] = product.price * 1.1;
        competitorPrices['Competitor B'] = product.price * 0.95;
        competitorPrices['Competitor C'] = product.price * 1.05;
      }

      return { product, competitorPrices };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }
  
  // More facade methods...
}
```

### Facade Methods for Different Feature Areas

The ServiceFacade provides methods organized around different feature areas:

1. **Product Management**

```typescript
// src/patterns/facade/ServiceFacade.ts
// Product retrieval with filtering
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

// Product creation
async createProduct(product: Product): Promise<void> {
  try {
    await this.productRepository.createProduct(product);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}
```

2. **Price Scraping**

```typescript
// src/patterns/facade/ServiceFacade.ts
// Real-time price fetching with status indicator
async fetchRealTimeCompetitorPrices(productId: string): Promise<{
  product: Product;
  competitorPrices: Record<string, CompetitorPrice>;
  isFetching: boolean;
}> {
  try {
    const result = {
      product: await this.productRepository.getProduct(productId),
      competitorPrices: {},
      isFetching: true
    };
    
    // Get cached prices first
    const cachedPrices = await this.realTimePriceScraperService.getLastFetchedPrices(productId);
    if (cachedPrices) {
      result.competitorPrices = cachedPrices;
    }
    
    // Start background fetch for fresh prices
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
```

3. **Technical Product Details**

```typescript
// src/patterns/facade/ServiceFacade.ts
// Unified method to get product with type-specific technical details
async getProductWithTechDetails(productId: string): Promise<{
  product: Product;
  techDetails: RegulatorDetails | BCDDetails | null;
}> {
  try {
    const product = await this.productRepository.getProduct(productId);
    let techDetails = null;
    
    // Determine what type of technical details to fetch
    if (product.type === 'regulator') {
      techDetails = await this.getRegulatorDetails(productId);
    } else if (product.type === 'bcd') {
      techDetails = await this.getBCDDetails(productId);
    }
    
    return { product, techDetails };
  } catch (error) {
    console.error('Error getting product with tech details:', error);
    throw error;
  }
}
```

4. **Product Image Management**

```typescript
// src/patterns/facade/ServiceFacade.ts
// Simplified image URL retrieval that handles cache checking
async getProductImageUri(
  productId: string, 
  productUrl?: string, 
  productType?: string
): Promise<string | null> {
  try {
    return await this.getProductImageService().getProductImageUri(productId, productUrl, productType);
  } catch (error) {
    console.error(`Error getting product image URI for product ${productId}:`, error);
    return null;
  }
}
```

## Benefits of the Facade Pattern in ScubaDivingApp

### 1. Simplified Component Development

Frontend components only need to interact with one object (the ServiceFacade) regardless of which backend services they need to access. This makes component development more straightforward since developers don't need to understand the complexities of each individual service.

### 2. Reduced Dependencies

Components have fewer direct dependencies, as they only depend on the facade rather than multiple services. This makes the components more modular and easier to test.

### 3. Encapsulated Cross-Cutting Concerns

The ServiceFacade handles cross-cutting concerns such as:

- **Error Handling**: Centralized error handling and recovery
- **Caching Logic**: Decisions about when to use cached data vs. fresh data
- **Service Coordination**: Orchestrating multiple service calls into a single operation
- **Data Transformation**: Converting complex service responses into component-friendly formats

### 4. Enhanced Maintainability

When backend services change, only the facade needs to be updated, not every component that uses those services. This significantly reduces the maintenance burden when making changes to the underlying implementation.

### 5. Legacy Support

The facade provides a clean way to support both new and legacy implementations:

```typescript
// src/patterns/facade/ServiceFacade.ts
// Example of handling both legacy and new implementations
async fetchCompetitorPrices(
  productId: string,
  productModel: string,
  productBrand: string
): Promise<Record<string, CompetitorPrice>> {
  try {
    // Try the new implementation first
    return await this.multiPlatformPriceScraperService.fetchCompetitorPrices(
      productId,
      productModel,
      productBrand
    );
  } catch (error) {
    console.error('Error fetching competitor prices with multi-platform service:', error);
    
    // Fall back to the original implementation if the new one fails
    try {
      return await this.realTimePriceScraperService.fetchCompetitorPrices(
        productId,
        productModel,
        productBrand
      );
    } catch (fallbackError) {
      console.error('Error fetching competitor prices with fallback service:', fallbackError);
      throw fallbackError;
    }
  }
}
```

## Facade vs. Other Patterns in ScubaDivingApp

### Facade and Singleton

The ServiceFacade is implemented as a Singleton to ensure that there's only one instance coordinating all the services. This combination works well because:

1. It provides global access to the facade throughout the application
2. It ensures consistent state and caching across different components
3. It reduces resource overhead by instantiating services only once

### Facade and Factory

The facade uses the ProductFactory to create product objects when needed, showing how patterns can complement each other:

```typescript
// Example of facade using factory pattern (conceptual)
async createNewProduct(type: string, data: any): Promise<Product> {
  const factory = new ProductFactory();
  const product = factory.createProduct(
    type,
    data.id,
    data.name,
    data.brand,
    data.price,
    data.link,
    data.specifications
  );
  
  await this.productRepository.createProduct(product);
  return product;
}
```

### Facade and Strategy

The facade abstracts away the strategy pattern used in the price scraping system:

```typescript
// Facade method that hides strategy selection complexity
async extractProductName(url: string): Promise<string | null> {
  try {
    // This internally uses the strategy pattern to select the right extractor
    return await this.comprehensiveStrategyRegistry.extractProductNameFromUrl(url);
  } catch (error) {
    console.error('Error extracting product name:', error);
    return null;
  }
}
```

## Conclusion

The ServiceFacade in ScubaDivingApp demonstrates an effective implementation of the Facade design pattern, providing a simplified interface to complex subsystems while enhancing maintainability, reducing dependencies, and enabling more modular and testable code. By centralizing service interactions, the facade shields the UI components from the complexities of the backend implementation, allowing them to focus on their primary responsibility of rendering the user interface. 