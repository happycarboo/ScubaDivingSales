# Individual Contribution: Database Implementation and Backend Services

## 1. Overview of Individual Contributions

As the database and backend developer for the ScubaDiving Sales Application, my primary contributions included:

- **Firebase Database Implementation**: Design and implementation of the Firestore database schema and collections for product data
- **Repository Pattern Implementation**: Creation of data access layers following the Repository pattern
- **Backend Service Development**: Development of core services for data retrieval and manipulation
- **Multi-Collection Architecture**: Implementation of specialized collections for different product types
- **Data Transformation Logic**: Creation of transformation logic between database models and domain objects
- **Security Rules Configuration**: Implementation of Firestore security rules for data protection

I focused on creating a robust and efficient backend infrastructure that supported the application's data needs while maintaining clean separation of concerns and adherence to SOLID principles.

## 2. Major Design Choices and Decisions

### Narrative Focus: Building a Flexible and Extensible Data Layer

Our ScubaDiving Sales application initially started with a simple requirement to display product information for customers. As the project evolved, we faced increasing complexity in data management, particularly with the need to support multiple product types (regulators, BCDs, fins) and integrate with external services like Firebase and price scraping from competitor websites.

This evolution posed several challenges:

1. **Data Source Complexity**: Managing multiple data sources including Firebase for product information, competitor websites for real-time price comparisons.
2. **Multiple Product Types**: Supporting different product types with varying attributes required a flexible architecture.
3. **Separation of Concerns**: Keeping frontend components isolated from backend implementation details.
4. **Error Handling**: Gracefully handling failures in external services like Firebase or web scraping.

To address these challenges, I implemented a backend architecture leveraging two key design patterns:

### Facade Pattern Implementation

The Facade pattern was crucial for our backend as it provided a simplified interface to complex subsystems. Our implementation of `ServiceFacade` serves as a single entry point for all data operations, hiding the complex interactions with Firebase, price scraping, and other services.

```typescript
// Facade Pattern implementation for service orchestration
export class ServiceFacade {
  private static instance: ServiceFacade;
  private initialized: boolean = false;
  
  // Services encapsulated by the facade
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
  
  // Example of a facade method hiding complex interactions
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

      return { product, competitorPrices };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }
}
```

Key benefits of the Facade pattern in our application:

1. **Simplified Interface**: Frontend components interact with a single, consistent API regardless of the underlying services.
2. **Reduced Dependencies**: Components only depend on the facade, not on multiple services.
3. **Encapsulated Complexity**: The complex interactions between services are hidden from clients.
4. **Error Handling**: The facade provides centralized error handling for all service interactions.
5. **Testability**: The facade can be easily mocked for testing frontend components.

### Factory Method Pattern Implementation

The Factory Method pattern proved essential for bridging the gap between our Firebase database and the application domain. Think of it as a translator that converts raw database records into useful application objects.

As our CTO was designing the Firebase schema, we faced a fundamental challenge: Firebase stores data as simple JSON-like documents, but our application needs fully-functional objects with behavior. Plus, different diving products (regulators, BCDs, fins) need different specialized properties and behaviors.

```typescript
// Factory Method Pattern implementation for product creation
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

// Product Factory that creates different product types from database data
export class ProductFactory {
  // Protected methods that can be overridden by subclasses
  protected createRegulatorProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new RegulatorProduct(id, name, brand, price, specifications, link);
  }
  
  protected createBCDProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new BCDProduct(id, name, brand, price, specifications, link);
  }
  
  protected createFinProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new FinProduct(id, name, brand, price, specifications, link);
  }
  
  // This method determines which specific factory method to call
  protected getProductTypeFactory(type: string): (id: string, name: string, brand: string, price: number, specs: Record<string, any>, link: string) => Product {
    switch (type) {
      case 'regulator':
        return this.createRegulatorProduct.bind(this);
      case 'bcd':
        return this.createBCDProduct.bind(this);
      case 'fin':
        return this.createFinProduct.bind(this);
      default:
        return this.createDefaultProduct.bind(this);
    }
  }
  
  protected createDefaultProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string, type: string = 'generic'): Product {
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

  // Main factory method that delegates to the appropriate creator method
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
    // Use this.getProductTypeFactory to get the appropriate factory method
    const productFactory = this.getProductTypeFactory(type);
    
    // Call the specific factory method
    const product = productFactory(id, name, brand, price, specifications, link);
    
    // Add imageUrl if provided
    if (imageUrl) {
      product.imageUrl = imageUrl;
    }
    
    return product;
  }
}
```

#### The Power of "this" for Factory Extension

The updated Factory implementation showcases how the strategic use of `this` enables easier extension of the Factory pattern. Rather than using direct conditionals, we've refactored to use protected methods and delegation, creating a much more extensible design.

Here's how this approach directly benefits our Firebase database implementation:

1. **Database Schema Evolution**: When our Firebase database grows to include new product types, we don't need to modify existing code. We simply extend the factory:

```typescript
// Our original factory handles regulators, BCDs, and fins
// When we need to add "masks" to our database, we just extend the factory

class EnhancedProductFactory extends ProductFactory {
  // Add a simple method to create mask products
  createMaskProduct(id, name, brand, price, specifications, link) {
    // Create a mask product from database data
    return {
      id: id,
      type: 'mask',
      name: name,
      brand: brand,
      price: price,
      specifications: specifications,
      link: link,
      getDescription: () => `${brand} ${name} - Diving Mask`
    };
  }
  
  // Override only the method that decides which factory method to use
  getProductTypeFactory(type) {
    // Handle the new "mask" product type
    if (type === 'mask') {
      return this.createMaskProduct.bind(this);
    }
    
    // For existing product types, use the parent implementation
    return super.getProductTypeFactory(type);
  }
}

// Usage with Firebase data
const factory = new EnhancedProductFactory();
const maskFromDatabase = factory.createProduct(
  'mask',  // New product type from Firebase
  'mask123',
  'Crystal View',
  'AquaPro',
  149.99,
  'https://example.com/masks/crystal-view'
);
```

This simple approach means:
- The CTO can add new product types to Firebase without breaking existing code
- We don't have to modify working code (reducing bugs)
- Each product type has its own creation method
- The factory knows which method to call based on the product type from Firebase

### Visitor Pattern Implementation

While the Facade and Factory patterns form the core of our backend architecture, the Visitor pattern also plays a crucial role in processing product data. The Visitor pattern allows us to define operations on product objects without changing their classes, which is especially valuable for implementing business logic that varies by product type.

```typescript
// Visitor Pattern implementation for product operations
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
```

The key benefits of using the Visitor pattern in our backend include:

1. **Separation of Operations from Object Structure**: We can define new operations on products without modifying their classes.
2. **Type-Specific Logic**: Each visitor method can implement different logic for different product types.
3. **Clean Extension**: Adding new operations just means creating new visitor classes, without touching existing code.
4. **Centralized Business Logic**: Related business logic for different product types can be grouped together in visitor classes.

This pattern works particularly well with the Factory pattern, as the Factory creates product objects that can then be processed by various visitors, allowing for a clean separation between object creation and the operations performed on those objects.

In our application architecture, the Visitor pattern provides the foundation for implementing different business operations across product types while maintaining clean separation of concerns. We've laid the groundwork for operations specific to each product type (regulators, BCDs, fins) that can be expanded as the application grows.

## 3. UML Diagram: Database and Repository Architecture

```
┌─────────────────────┐     uses     ┌────────────────────┐
│   ServiceFacade     │◄────────────►│  FirebaseService   │
│  (Facade Pattern)   │              │  (Firebase Access) │
└──────────┬──────────┘              └────────────────────┘
           │                                     ▲
           │ uses                                │
           ▼                                     │ uses
┌─────────────────────┐     implements     ┌────┴───────────────┐
│  IProductRepository │◄──────────────────►│  ProductRepository │
│     (Interface)     │                    │  (Implementation)  │
└─────────────────────┘                    └────────────────────┘
                                                    │
                                                    │ accesses
                                                    ▼
                                           ┌────────────────────┐
                                           │  Firestore Database│
                                           │  - products        │
                                           │  - regulators      │
                                           │  - bcds            │
                                           └────────────────────┘
```

## 4. SOLID Principles and Design Patterns Applied

### Single Responsibility Principle (SRP)

Each class in the backend implementation has a clear, single responsibility:

```typescript
// FirebaseService.ts - Responsible only for Firebase connectivity
export class FirebaseService implements IFirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;

  public async initialize(): Promise<void> {
    // Initialization logic only
  }

  public getFirestore(): Firestore {
    // Firebase access logic only
  }
}

// ProductRepository.ts - Responsible only for product data operations
export class ProductRepository implements IProductRepository {
  private readonly PRODUCTS_COLLECTION = 'products';
  private readonly REGULATORS_COLLECTION = 'regulators';
  private readonly BCDS_COLLECTION = 'bcds';
  
  async getProduct(id: string): Promise<Product> {
    // Product retrieval logic only
  }
  
  async getRegulatorDetails(productId: string): Promise<RegulatorDetails | null> {
    // Regulator details retrieval only
  }
}
```

This separation ensures that each class has a single reason to change, improving maintainability and reducing the risk of bugs.

### Open/Closed Principle (OCP)

The backend design is open for extension but closed for modification through interfaces and abstraction:

```typescript
// IProductRepository.ts - Interface that can be extended without modifying existing code
export interface IProductRepository {
  getProduct(id: string): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  getProductsByType(type: string): Promise<Product[]>;
  getRegulatorDetails(productId: string): Promise<RegulatorDetails | null>;
  getBCDDetails(productId: string): Promise<BCDDetails | null>;
  createProduct(product: Product): Promise<void>;
  updateProduct(id: string, productData: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}

// New product types can be added without changing existing code
async getBCDDetails(productId: string): Promise<BCDDetails | null> {
  // Implementation details
}

// Future extension example
async getFinDetails(productId: string): Promise<FinDetails | null> {
  // Implementation for new product type
}
```

The repositories and services can be extended to handle new product types without modifying existing code.

### Liskov Substitution Principle (LSP)

All implementations of the repository interfaces can be substituted for their base interfaces without altering the correctness of the program:

```typescript
// Any implementation of IProductRepository can be used wherever the interface is expected
function processProducts(repository: IProductRepository) {
  // Can work with any implementation of IProductRepository
  repository.getAllProducts().then(products => {
    // Process products
  });
}

// Mock repository for testing
class MockProductRepository implements IProductRepository {
  // Implementation for testing
}

// Both real and mock implementations can be used interchangeably
processProducts(new ProductRepository());
processProducts(new MockProductRepository());
```

### Interface Segregation Principle (ISP)

The backend interfaces are focused and minimal, ensuring that implementing classes aren't forced to implement methods they don't need:

```typescript
// IFirebaseService.ts - Focused on Firebase operations
export interface IFirebaseService {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  getFirestore(): Firestore;
}

// IProductRepository.ts - Focused on product data operations
export interface IProductRepository {
  getProduct(id: string): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  // Other product operations
}
```

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not concrete implementations:

```typescript
// ServiceFacade depends on IProductRepository interface, not the concrete implementation
export class ServiceFacade {
  private productRepository: IProductRepository;
  
  // Constructor injection of dependency
  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }
  
  async getProductDetails(productId: string): Promise<ProductDetails> {
    const product = await this.productRepository.getProduct(productId);
    // Additional logic
  }
}
```

### Repository Pattern Implementation

The Repository pattern provides a clean abstraction layer over the database:

```typescript
// ProductRepository.ts
export class ProductRepository implements IProductRepository {
  private firebaseService: FirebaseService;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await this.getFirestore();
      const productsRef = collection(db, this.PRODUCTS_COLLECTION);
      const snapshot = await getDocs(productsRef);
      
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.model,
          brand: data.brand,
          price: data.price,
          type: data.type,
          link: data.link,
          specifications: {},
          getDescription: () => `${data.brand} ${data.model} - ${data.type}`
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }
  
  // Additional repository methods
}
```

### Singleton Pattern for Services

The Firebase service uses the Singleton pattern to ensure a single instance:

```typescript
// FirebaseService.ts
export class FirebaseService implements IFirebaseService {
  private static instance: FirebaseService;
  
  private constructor() {}
  
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
  
  // Other methods
}
```

## 5. Notable Features Implemented

### 1. Multi-Collection Database Architecture

I implemented a multi-collection architecture in Firestore that allows for:

- Storing common product information in a core `products` collection
- Storing specialized data in type-specific collections (`regulators`, `bcds`)
- Efficient querying of products by type
- Cross-collection joins for comprehensive product details

This architecture provides flexibility while maintaining optimal query performance.

### 2. Comprehensive Data Transformation

I developed data transformation logic to convert between database models and domain objects:

```typescript
// ProductRepository.ts
async getProduct(id: string): Promise<Product> {
  try {
    const db = await this.getFirestore();
    const docSnap = await getDoc(doc(db, this.PRODUCTS_COLLECTION, id));
    
    if (!docSnap.exists()) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      name: data.model,
      brand: data.brand,
      price: data.price,
      type: data.type,
      link: data.link,
      specifications: {},
      getDescription: () => `${data.brand} ${data.model} - ${data.type}`
    };
  } catch (error) {
    console.error(`Error getting product ${id}:`, error);
    throw error;
  }
}
```

### 3. Cross-Collection Data Management

I implemented methods to manage data across multiple collections, including cascading deletes:

```typescript
// ProductRepository.ts
async deleteProduct(id: string): Promise<void> {
  try {
    const db = await this.getFirestore();
    
    // Delete from main products collection
    await deleteDoc(doc(db, this.PRODUCTS_COLLECTION, id));
    
    // Also try to delete related records if they exist
    try {
      await deleteDoc(doc(db, this.REGULATORS_COLLECTION, id));
    } catch (error) {
      console.log(`No regulator details found for product ID ${id}`);
    }
    
    try {
      await deleteDoc(doc(db, this.BCDS_COLLECTION, id));
    } catch (error) {
      console.log(`No BCD details found for product ID ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}
```

### 4. Database Seeding Implementation

I created a database seeding script to populate the Firestore database with initial product data:

```typescript
// seedProducts.ts
async function seedDatabase() {
  try {
    console.log('Initializing Firebase and connecting to Firestore...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Seeding products collection...');
    
    // Seed main products collection
    for (const product of productsData) {
      await setDoc(doc(db, 'products', product.id), product);
    }
    
    // Seed regulators collection
    for (const regulator of regulatorsData) {
      await setDoc(doc(db, 'regulators', regulator.id), regulator);
    }
    
    // Seed BCDs collection
    for (const bcd of bcdsData) {
      await setDoc(doc(db, 'bcds', bcd.id), bcd);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
```

## 6. Test Plan and Implementation

For database and backend services, I developed a comprehensive testing strategy:

### Unit Testing Approach

- **Repository Tests**: Testing individual repository methods with mocked Firebase
- **Service Tests**: Testing service methods with mocked repositories
- **Transformation Tests**: Testing data transformation logic between database and domain models

### Example Unit Tests for Repositories

```typescript
// ProductRepository.test.ts
describe('ProductRepository', () => {
  let repository: ProductRepository;
  let mockFirebase: jest.Mocked<FirebaseService>;
  
  beforeEach(() => {
    // Mock the FirebaseService
    mockFirebase = {
      getFirestore: jest.fn(),
      initialize: jest.fn(),
      isInitialized: jest.fn().mockReturnValue(true)
    } as any;
    
    // Mock database responses
    const mockCollection = jest.fn();
    const mockDocs = [
      {
        id: '1',
        data: () => ({
          model: 'Test Regulator',
          brand: 'TestBrand',
          price: 299.99,
          type: 'regulator',
          link: 'http://example.com'
        })
      }
    ];
    
    mockFirebase.getFirestore.mockReturnValue({
      collection: mockCollection,
      getDocs: jest.fn().mockResolvedValue({ docs: mockDocs })
    } as any);
    
    // Create repository with mocked Firebase
    repository = new ProductRepository();
    (repository as any).firebaseService = mockFirebase;
  });
  
  test('getAllProducts should return properly transformed products', async () => {
    const products = await repository.getAllProducts();
    
    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('1');
    expect(products[0].name).toBe('Test Regulator');
    expect(products[0].brand).toBe('TestBrand');
    expect(products[0].price).toBe(299.99);
    expect(products[0].getDescription()).toBe('TestBrand Test Regulator - regulator');
  });
  
  test('getRegulatorDetails should return regulator specifications', async () => {
    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({
        prod_id: '1',
        category: 'regulator',
        temperature: 'Cold water',
        high_pressure_port: 2,
        low_pressure_port: 5
      })
    });
    
    (mockFirebase.getFirestore() as any).getDoc = mockGetDoc;
    
    const details = await repository.getRegulatorDetails('1');
    
    expect(details).not.toBeNull();
    expect(details?.prod_id).toBe('1');
    expect(details?.high_pressure_port).toBe(2);
    expect(details?.low_pressure_port).toBe(5);
  });
});
```

### Integration Testing Approach

- **Repository/Firebase Integration**: Testing repository methods with a test Firebase project
- **Cross-Collection Operations**: Testing operations that span multiple collections
- **Error Handling**: Testing error conditions and recovery mechanisms

By implementing this comprehensive testing strategy, I ensured the reliability and correctness of the database and backend implementation while maintaining high code quality and adherence to SOLID principles.

# Backend Design and Implementation

## Major Design Choices and Decisions

### Narrative Focus: Building a Flexible and Extensible Data Layer

Our ScubaDiving Sales application initially started with a simple requirement to display product information for customers. As the project evolved, we faced increasing complexity in data management, particularly with the need to support multiple product types (regulators, BCDs, fins) and integrate with external services like Firebase and price scraping from competitor websites.

This evolution posed several challenges:

1. **Data Source Complexity**: Managing multiple data sources including Firebase for product information, competitor websites for real-time price comparisons.
2. **Multiple Product Types**: Supporting different product types with varying attributes required a flexible architecture.
3. **Separation of Concerns**: Keeping frontend components isolated from backend implementation details.
4. **Error Handling**: Gracefully handling failures in external services like Firebase or web scraping.

To address these challenges, I implemented a backend architecture leveraging two key design patterns:

### Facade Pattern Implementation

The Facade pattern was crucial for our backend as it provided a simplified interface to complex subsystems. Our implementation of `ServiceFacade` serves as a single entry point for all data operations, hiding the complex interactions with Firebase, price scraping, and other services.

```typescript
// Facade Pattern implementation for service orchestration
export class ServiceFacade {
  private static instance: ServiceFacade;
  private initialized: boolean = false;
  
  // Services encapsulated by the facade
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
  
  // Example of a facade method hiding complex interactions
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

      return { product, competitorPrices };
    } catch (error) {
      console.error('Error getting product with price comparison:', error);
      throw error;
    }
  }
}
```

Key benefits of the Facade pattern in our application:

1. **Simplified Interface**: Frontend components interact with a single, consistent API regardless of the underlying services.
2. **Reduced Dependencies**: Components only depend on the facade, not on multiple services.
3. **Encapsulated Complexity**: The complex interactions between services are hidden from clients.
4. **Error Handling**: The facade provides centralized error handling for all service interactions.
5. **Testability**: The facade can be easily mocked for testing frontend components.

### Factory Method Pattern Implementation

The Factory Method pattern proved essential for bridging the gap between our Firebase database and the application domain. Think of it as a translator that converts raw database records into useful application objects.

As our CTO was designing the Firebase schema, we faced a fundamental challenge: Firebase stores data as simple JSON-like documents, but our application needs fully-functional objects with behavior. Plus, different diving products (regulators, BCDs, fins) need different specialized properties and behaviors.

```typescript
// Factory Method Pattern implementation for product creation
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

// Product Factory that creates different product types from database data
export class ProductFactory {
  // Protected methods that can be overridden by subclasses
  protected createRegulatorProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new RegulatorProduct(id, name, brand, price, specifications, link);
  }
  
  protected createBCDProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new BCDProduct(id, name, brand, price, specifications, link);
  }
  
  protected createFinProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string): Product {
    return new FinProduct(id, name, brand, price, specifications, link);
  }
  
  // This method determines which specific factory method to call
  protected getProductTypeFactory(type: string): (id: string, name: string, brand: string, price: number, specs: Record<string, any>, link: string) => Product {
    switch (type) {
      case 'regulator':
        return this.createRegulatorProduct.bind(this);
      case 'bcd':
        return this.createBCDProduct.bind(this);
      case 'fin':
        return this.createFinProduct.bind(this);
      default:
        return this.createDefaultProduct.bind(this);
    }
  }
  
  protected createDefaultProduct(id: string, name: string, brand: string, price: number, specifications: Record<string, any>, link: string, type: string = 'generic'): Product {
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

  // Main factory method that delegates to the appropriate creator method
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
    // Use this.getProductTypeFactory to get the appropriate factory method
    const productFactory = this.getProductTypeFactory(type);
    
    // Call the specific factory method
    const product = productFactory(id, name, brand, price, specifications, link);
    
    // Add imageUrl if provided
    if (imageUrl) {
      product.imageUrl = imageUrl;
    }
    
    return product;
  }
}
```

#### The Power of "this" for Factory Extension

The updated Factory implementation showcases how the strategic use of `this` enables easier extension of the Factory pattern. Rather than using direct conditionals, we've refactored to use protected methods and delegation, creating a much more extensible design.

Here's how this approach directly benefits our Firebase database implementation:

1. **Database Schema Evolution**: When our Firebase database grows to include new product types, we don't need to modify existing code. We simply extend the factory:

```typescript
// Our original factory handles regulators, BCDs, and fins
// When we need to add "masks" to our database, we just extend the factory

class EnhancedProductFactory extends ProductFactory {
  // Add a simple method to create mask products
  createMaskProduct(id, name, brand, price, specifications, link) {
    // Create a mask product from database data
    return {
      id: id,
      type: 'mask',
      name: name,
      brand: brand,
      price: price,
      specifications: specifications,
      link: link,
      getDescription: () => `${brand} ${name} - Diving Mask`
    };
  }
  
  // Override only the method that decides which factory method to use
  getProductTypeFactory(type) {
    // Handle the new "mask" product type
    if (type === 'mask') {
      return this.createMaskProduct.bind(this);
    }
    
    // For existing product types, use the parent implementation
    return super.getProductTypeFactory(type);
  }
}

// Usage with Firebase data
const factory = new EnhancedProductFactory();
const maskFromDatabase = factory.createProduct(
  'mask',  // New product type from Firebase
  'mask123',
  'Crystal View',
  'AquaPro',
  149.99,
  'https://example.com/masks/crystal-view'
);
```

This simple approach means:
- The CTO can add new product types to Firebase without breaking existing code
- We don't have to modify working code (reducing bugs)
- Each product type has its own creation method
- The factory knows which method to call based on the product type from Firebase

### Visitor Pattern Implementation

While the Facade and Factory patterns form the core of our backend architecture, the Visitor pattern also plays a crucial role in processing product data. The Visitor pattern allows us to define operations on product objects without changing their classes, which is especially valuable for implementing business logic that varies by product type.

```typescript
// Visitor Pattern implementation for product operations
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
```

The key benefits of using the Visitor pattern in our backend include:

1. **Separation of Operations from Object Structure**: We can define new operations on products without modifying their classes.
2. **Type-Specific Logic**: Each visitor method can implement different logic for different product types.
3. **Clean Extension**: Adding new operations just means creating new visitor classes, without touching existing code.
4. **Centralized Business Logic**: Related business logic for different product types can be grouped together in visitor classes.

This pattern works particularly well with the Factory pattern, as the Factory creates product objects that can then be processed by various visitors, allowing for a clean separation between object creation and the operations performed on those objects.

In our application architecture, the Visitor pattern provides the foundation for implementing different business operations across product types while maintaining clean separation of concerns. We've laid the groundwork for operations specific to each product type (regulators, BCDs, fins) that can be expanded as the application grows.

## Software Engineering Principles

### SOLID Principles in Backend Implementation

Our backend implementation strictly adheres to SOLID principles:

#### 1. Single Responsibility Principle (SRP)

Each class in our backend has a single, well-defined responsibility:

```typescript
// FirebaseService only handles Firebase connection and configuration
export class FirebaseService implements IFirebaseService {
  // Implementation details...
}

// ProductRepository only handles product data operations
export class ProductRepository implements IProductRepository {
  // Implementation details...
}

// PriceScraperService only handles fetching competitor prices
class PriceScraperService implements IPriceScraperService {
  // Implementation details...
}
```

#### 2. Open/Closed Principle (OCP)

Our code is open for extension but closed for modification. For example, adding new product types doesn't require changing existing code:

```typescript
// We can add new product types (like MaskProduct) without modifying existing code
export class MaskProduct implements Product {
  // New implementation...
  
  getDescription(): string {
    return `${this.brand} ${this.name} - A crystal-clear diving mask`;
  }
}
```

#### 3. Liskov Substitution Principle (LSP)

Subtypes are substitutable for their base types. For instance, any implementation of `IProductRepository` can be used in place of another:

```typescript
// This method works with any IProductRepository implementation
async getProductWithTechDetails(productId: string): Promise<{
  product: Product;
  techDetails: RegulatorDetails | BCDDetails | null;
}> {
  const product = await this.productRepository.getProduct(productId);
  // Rest of implementation...
}
```

#### 4. Interface Segregation Principle (ISP)

Our interfaces are small and focused, ensuring clients only depend on methods they use:

```typescript
// Small, focused interface for Firebase service
export interface IFirebaseService {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  getFirestore(): Firestore;
}

// Small, focused interface for product repository
export interface IProductRepository {
  getProduct(id: string): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  // Other methods...
}
```

#### 5. Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not concrete implementations:

```typescript
// ServiceFacade depends on interfaces, not concrete implementations
export class ServiceFacade {
  private firebaseService: IFirebaseService;
  private productRepository: IProductRepository;
  private realTimePriceScraperService: IPriceScraperService;
  
  // Implementation details...
}
```

### Repository Pattern Implementation

The Repository pattern provides a clean abstraction layer over the database:

```typescript
// ProductRepository.ts
export class ProductRepository implements IProductRepository {
  private firebaseService: FirebaseService;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await this.getFirestore();
      const productsRef = collection(db, this.PRODUCTS_COLLECTION);
      const snapshot = await getDocs(productsRef);
      
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.model,
          brand: data.brand,
          price: data.price,
          type: data.type,
          link: data.link,
          specifications: {},
          getDescription: () => `${data.brand} ${data.model} - ${data.type}`
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }
  
  // Additional repository methods
}
```

### Singleton Pattern for Services

The Firebase service uses the Singleton pattern to ensure a single instance:

```typescript
// FirebaseService.ts
export class FirebaseService implements IFirebaseService {
  private static instance: FirebaseService;
  
  private constructor() {}
  
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
  
  // Other methods
}
```

## Architectural Benefits

The combination of Facade and Factory patterns in our backend has provided several key benefits:

1. **Scalability**: The architecture easily accommodates new product types and services without major refactoring.
2. **Maintainability**: Clear separation of concerns and well-defined interfaces make the code easier to maintain.
3. **Testability**: Dependencies on interfaces rather than concrete implementations make the code easier to test.
4. **Flexibility**: The facade provides a stable interface even as the underlying implementation changes.
5. **Resilience**: The architecture includes robust error handling and fallback mechanisms.

By leveraging these design patterns and adhering to SOLID principles, our backend provides a solid foundation for the ScubaDiving Sales application, capable of evolving to meet future requirements while maintaining code quality and stability. 