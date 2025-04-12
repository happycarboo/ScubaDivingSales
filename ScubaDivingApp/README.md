# ScubaDivingSales Assistant App

A specialized sales assistant app for ScubaWarehouse, designed to help sales representatives provide better service by streamlining product selection, comparison, and recommendation.

## Architecture

This application is built using React Native for iPad and follows SOLID principles with the implementation of the following design patterns:

- **Factory Method Pattern**: For creating product objects based on their type
- **Visitor Pattern**: For implementing operations on products without modifying their classes
- **Facade Pattern**: For simplifying complex subsystem interactions
- **Strategy Pattern**: For implementing different price extraction algorithms for various e-commerce platforms

### Firebase Integration

This app integrates with Firebase Firestore for real-time data storage and retrieval. The implementation follows SOLID principles:

- **Single Responsibility Principle**: Separate classes for Firebase service and repository operations
- **Open/Closed Principle**: Repositories can be extended without modification
- **Liskov Substitution Principle**: Interfaces and implementations are substitutable
- **Interface Segregation Principle**: Small, focused interfaces with specific responsibilities
- **Dependency Inversion Principle**: High-level modules depend on abstractions

## Project Structure

```
ScubaDivingApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common UI elements
│   │   ├── product/         # Product-specific components
│   │   ├── comparison/      # Comparison view components
│   │   ├── search/          # Search-related components
│   │   ├── recommendation/  # Recommendation components
│   │   └── test/            # Test components for development/debugging
│   │       └── ProductImageExtractorTest.tsx # Test component for image extraction
│   ├── screens/             # Screen components
│   │   ├── ProductSelection/
│   │   ├── ProductDetails/
│   │   ├── Comparison/
│   │   ├── IntelligentSearch/
│   │   └── RealTimeComparison/
│   ├── services/            # Services for API calls and data handling
│   │   ├── api/
│   │   ├── firebase/        # Firebase integration
│   │   │   ├── config/      # Firebase configuration
│   │   │   ├── interfaces/  # Service and repository interfaces
│   │   │   ├── repositories/# Database repository implementations
│   │   │   └── FirebaseService.ts # Core Firebase service
│   │   └── scraper/         # Web scraping functionality
│   │       ├── interfaces/  # Service and strategy interfaces
│   │       │   └── IProductInfoExtractor.ts # Interface for product info extraction
│   │       ├── strategies/  # Platform-specific extraction strategies
│   │       │   └── ScubaWarehouseComprehensiveStrategy.ts # Strategy for ScubaWarehouse
│   │       ├── repositories/# Product URL repositories
│   │       ├── registry/    # Strategy registry
│   │       │   └── ComprehensiveStrategyRegistry.ts # Registry for comprehensive strategies
│   │       ├── PriceScraperService.ts     # Original scraper (legacy)
│   │       └── MultiPlatformPriceScraperService.ts # New multi-platform implementation
│   ├── patterns/            # Design pattern implementations
│   │   ├── factory/         # Factory Method pattern
│   │   ├── visitor/         # Visitor pattern
│   │   └── facade/          # Facade pattern
│   │       └── ServiceFacade.ts # Facade for service orchestration (updated with image extraction)
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
│   │   └── navigation.ts    # Navigation type definitions
│   └── __tests__/           # Test files
├── App.tsx                  # Main app component
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Xcode (latest version) for iOS development
- iOS Simulator with iPad support
- macOS for iOS development

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ScubaDivingSales.git
cd ScubaDivingSales
```

2. Navigate to the app directory
```bash
cd ScubaDivingApp
```

3. Install dependencies
```bash
npm install
```

### Running the App

1. **Start the development server**
```bash
npx expo start
```

2. **Launch on iPad Simulator**
   - Once the Expo server is running, you'll see a QR code in the terminal
   - Press `shift + i` to open the iPad simulator
   - The app will automatically load in the simulator
   - If the simulator doesn't appear:
     - Open Xcode → Xcode menu → Open Developer Tool → Simulator
     - Or run `open -a Simulator` in a new terminal window
     - Return to the Expo terminal and press `i` again

3. **Troubleshooting Simulator Issues**
   If the simulator doesn't launch:
   ```bash
   # Reset all simulators
   xcrun simctl shutdown all
   xcrun simctl erase all
   ```
   Then restart the Expo server and try again.

4. **Development Mode**
   - Use `cmd + D` in the simulator to open the developer menu
   - Enable Hot Reloading for instant updates while coding
   - Use the React Native Debugger for debugging

5. **Terminating the App**
   - To stop the development server: Press `Ctrl + C` in the terminal
   - To close everything (server and simulator):
   ```bash
   # Kill Expo process and shutdown simulators
   pkill -f "expo" && xcrun simctl shutdown all
   ```

### Testing

```bash
npm test
# or
yarn test
```

## Development Guide: SOLID Principles & Design Patterns

This guide outlines the core architectural principles and design patterns that **must be maintained throughout all development phases**. All new features and modifications should adhere to these guidelines to maintain code quality and architectural integrity.

### SOLID Principles: Implementation Requirements

#### 1. Single Responsibility Principle (SRP)

**Core Requirement:** Each class, component, or module must have only one reason to change.

**Implementation Rules:**
- Keep React components focused on rendering and user interaction only
- Extract data fetching and processing into separate services
- Create dedicated classes for specific business logic operations
- Separate validation, calculation, and presentation concerns

**Validation Checklist:**
- [ ] Does this class/component do exactly one thing?
- [ ] If I describe its purpose, do I use "and" or "or"? (If yes, consider splitting it)
- [ ] Are its dependencies limited to what it needs for its single responsibility?

#### 2. Open/Closed Principle (OCP)

**Core Requirement:** Software entities should be open for extension but closed for modification.

**Implementation Rules:**
- Use interfaces and abstract classes for core functionality
- Never modify existing working classes; extend them instead
- Implement plugins, strategies, or handlers for variations in behavior
- Leverage TypeScript interfaces to define contracts

**Validation Checklist:**
- [ ] Can I add new functionality without changing existing code?
- [ ] Are extension points clearly defined through interfaces?
- [ ] Have I used composition over inheritance where appropriate?

#### 3. Liskov Substitution Principle (LSP)

**Core Requirement:** Objects of a superclass should be replaceable with objects of subclasses without affecting program correctness.

**Implementation Rules:**
- Ensure subclasses fully implement the contract of their parent/interface
- Maintain consistent behavior in method overrides
- Don't throw unexpected exceptions or add unexpected side effects in subclasses
- Use abstract base classes to enforce behavior consistency

**Validation Checklist:**
- [ ] Do derived classes fully satisfy the contracts of their base types?
- [ ] Can I use any derived class wherever the base class is used?
- [ ] Do overridden methods behave consistently with base class expectations?

#### 4. Interface Segregation Principle (ISP)

**Core Requirement:** Clients should not be forced to depend on interfaces they don't use.

**Implementation Rules:**
- Create small, focused interfaces rather than large, monolithic ones
- Compose interfaces for classes that need multiple behaviors
- Split React component props into logical groups
- Use TypeScript's interface extension to compose interfaces

**Validation Checklist:**
- [ ] Are interfaces focused on a specific set of related behaviors?
- [ ] Do implementing classes use all the methods in the interfaces they implement?
- [ ] Have I composed multiple smaller interfaces instead of one large interface?

#### 5. Dependency Inversion Principle (DIP)

**Core Requirement:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Implementation Rules:**
- Define interfaces for all services and data access
- Use dependency injection for all service dependencies
- Avoid direct instantiation of service classes
- Configure dependencies in a central location

**Validation Checklist:**
- [ ] Do higher-level modules depend on abstractions rather than concrete implementations?
- [ ] Can I swap implementations without changing the dependent code?
- [ ] Are dependencies injected rather than instantiated internally?

### Design Patterns: Implementation Requirements

#### 1. Factory Method Pattern

**Locations:** `src/patterns/factory/`

**Core Requirement:** Provide an interface for creating objects without specifying their concrete classes.

**Implementation Rules:**
- Use `ProductFactory` for all product-related object creation
- Maintain the common `Product` interface for all product types
- Add new product types by extending the factory, not modifying it
- Keep product construction details encapsulated in the factory

**Usage Example:**
```typescript
// CORRECT: Using the factory
const factory = new ProductFactory();
const product = factory.createProduct('regulator', id, name, brand, price, specs);

// INCORRECT: Direct instantiation
const product = new RegulatorProduct(id, name, brand, price, specs);
```

#### 2. Visitor Pattern

**Locations:** `src/patterns/visitor/`

**Core Requirement:** Separate algorithms from the objects they operate on, allowing new operations without modifying those objects.

**Implementation Rules:**
- Use visitors for all operations that vary by product type
- Implement the `accept` method in all product classes
- Create specific visitors for distinct operations (pricing, recommendation, etc.)
- Return typed values from visitor methods for type safety

**Usage Example:**
```typescript
// CORRECT: Using the visitor pattern
const visitor = new PriceCalculatorVisitor(userExperienceLevel);
const price = product.accept(visitor);

// INCORRECT: Direct operation in product
const price = product.calculatePrice(userExperienceLevel);
```

#### 3. Facade Pattern

**Locations:** `src/patterns/facade/`

**Core Requirement:** Provide a simplified interface to a complex subsystem.

**Implementation Rules:**
- Use `ServiceFacade` for all data and service access from UI components
- Encapsulate complex service interactions behind simple facade methods
- Keep UI components decoupled from service implementations
- Handle errors and edge cases within the facade

**Usage Example:**
```typescript
// CORRECT: Using the facade
const serviceFacade = new ServiceFacade();
const result = await serviceFacade.getProductWithPriceComparison(productId);

// INCORRECT: Direct service usage
const firebaseService = new FirebaseService();
const product = await firebaseService.fetchProductDetails(productId);
const priceService = new PriceScraperService();
const prices = await priceService.fetchCompetitorPrices(productId);
```

#### 4. Strategy Pattern

**Locations:** `src/services/scraper/strategies/`

**Core Requirement:** Define a family of algorithms, encapsulate each one, and make them interchangeable.

**Implementation Rules:**
- Create platform-specific strategies that implement a common interface
- Use a registry to manage and access available strategies
- Select strategies based on URL or other criteria
- Each strategy encapsulates its own extraction algorithm

**Usage Example:**
```typescript
// CORRECT: Using the strategy pattern through registry
const registry = PlatformStrategyRegistry.getInstance();
const price = await registry.extractPriceFromUrl(url);

// INCORRECT: Direct strategy usage with conditionals
let price;
if (url.includes('lazada')) {
  price = extractLazadaPrice(url);
} else if (url.includes('shopee')) {
  price = extractShopeePrice(url);
}
```

### Price Scraping Implementation

The price scraping functionality has been implemented using SOLID principles and the Strategy pattern. This allows for:

1. **Extensibility**: Adding new e-commerce platforms without modifying existing code
2. **Maintainability**: Each platform's extraction logic is isolated in its own class
3. **Testability**: Platform strategies can be tested independently
4. **Flexibility**: Different extraction methods can be used for different platforms

#### Key Components

1. **IPlatformExtractionStrategy Interface**: Defines the contract for all extraction strategies
2. **Platform-Specific Strategies**: Implement platform-specific price extraction logic
3. **PlatformStrategyRegistry**: Manages and provides access to all strategies
4. **IProductUrlRepository Interface**: Defines the contract for storing and retrieving product URLs
5. **MultiPlatformPriceScraperService**: Implements the price scraping service using the strategies

#### Usage

```typescript
// Get the ServiceFacade instance
const serviceFacade = ServiceFacade.getInstance();

// Fetch competitor prices for a product
const prices = await serviceFacade.fetchCompetitorPrices(
  productId,
  productModel,
  productBrand
);
```

#### Extending with New Platforms

To add a new e-commerce platform:

1. Create a new strategy implementing `IPlatformExtractionStrategy`
2. Register the strategy with `PlatformStrategyRegistry`
3. Add relevant URLs to `IProductUrlRepository` implementation

```typescript
// Example: Adding a new platform strategy
export class NewPlatformStrategy implements IPlatformExtractionStrategy {
  getPlatformName(): string {
    return 'NewPlatform';
  }
  
  canHandleUrl(url: string): boolean {
    return url.includes('newplatform.com');
  }
  
  async extractPrice(url: string): Promise<string | null> {
    // Implement platform-specific extraction logic
    return '$123.45';
  }
}

// Register the new strategy
const registry = PlatformStrategyRegistry.getInstance();
registry.registerStrategy(new NewPlatformStrategy());
```

### Advanced Pattern Implementation (Required for Later Phases)

#### 1. Registry Pattern for Factory Extensions

As product types grow, enhance the factory with a registry:

```typescript
export class ProductRegistry {
  private static creators: Map<string, ProductCreator> = new Map();
  
  static register(type: string, creator: ProductCreator): void {
    this.creators.set(type, creator);
  }
  
  static getCreator(type: string): ProductCreator {
    const creator = this.creators.get(type);
    if (!creator) throw new Error(`No creator registered for type: ${type}`);
    return creator;
  }
}
```

#### 2. Composite Visitor for Complex Operations

For advanced operations requiring multiple visitor types:

```typescript
export class ProductAnalysisVisitor implements ProductVisitor<ProductAnalysis> {
  constructor(
    private readonly visitors: ProductVisitor<any>[]
  ) {}
  
  visitRegulator(product: RegulatorProduct): ProductAnalysis {
    return {
      product: product,
      results: this.visitors.map(visitor => visitor.visitRegulator(product))
    };
  }
  
  // Similar implementations for other product types
}
```

#### 3. Configurable Facade for Flexible Service Interaction

For more flexible service configuration:

```typescript
export class ConfigurableServiceFacade {
  constructor(
    private readonly config: ServiceConfig,
    private readonly services: ServiceRegistry
  ) {}
  
  async getProductsWithFilters(filters: FilterOptions): Promise<Product[]> {
    const dataService = this.services.get<IProductDataService>('productData');
    // Implementation with error handling, caching based on config
  }
}
```

## New Feature: Product Image and Name Extraction

The app now includes functionality to extract product images and names from ScubaWarehouse product pages. This feature enhances the product information available to sales representatives.

### Architecture

The image and name extraction functionality follows the same SOLID principles and Strategy pattern as the price extraction:

1. **IProductInfoExtractor Interface**: Defines the contract for extracting product names and images
2. **IComprehensivePlatformStrategy Interface**: Extends both price extraction and product info extraction capabilities
3. **ScubaWarehouseComprehensiveStrategy**: Implements the comprehensive strategy for ScubaWarehouse
4. **ComprehensiveStrategyRegistry**: Manages and provides access to all comprehensive strategies
5. **ServiceFacade Extension**: Provides simplified access to the new functionality

### Key Features

1. **Product Name Extraction**: Extracts the product name from ScubaWarehouse product pages
2. **Product Image URL Extraction**: Extracts the product image URL from ScubaWarehouse product pages
3. **Image Download**: Downloads product images to local storage for offline access
4. **Category Organization**: Organizes downloaded images by product category
5. **JSON Output**: Provides structured JSON output with product information and file paths

### Usage

```typescript
// Get the ServiceFacade instance
const serviceFacade = ServiceFacade.getInstance();

// Extract a product name
const productName = await serviceFacade.extractProductName('https://scubawarehouse.com.sg/product/scubapro-level-bcd/');

// Extract a product image URL
const imageUrl = await serviceFacade.extractProductImageUrl('https://scubawarehouse.com.sg/product/scubapro-level-bcd/');

// Extract and download all product info
const productInfo = await serviceFacade.extractAndDownloadProductInfo(
  'https://scubawarehouse.com.sg/product/scubapro-level-bcd/',
  'BCD'
);

// Access the downloaded information
console.log(`Product Name: ${productInfo.name}`);
console.log(`Image URL: ${productInfo.imageUrl}`);
console.log(`Local Image Path: ${productInfo.localImagePath}`);
```

### Testing the Feature

1. Navigate to the Product Selection screen
2. Click on the "Test Image Extraction" button
3. Enter a ScubaWarehouse product URL
4. Click on "Extract & Download All" to test the full functionality

### Implementation Details

The implementation follows the Strategy pattern and uses both HTTP/Cheerio for initial extraction and Puppeteer as a fallback:

1. **HTTP/Cheerio Method**: Fast extraction using axios and cheerio
2. **Puppeteer Fallback**: Reliable extraction using browser automation if needed
3. **File System Integration**: Uses expo-file-system for image download and storage
4. **Category Organization**: Creates category directories for better organization

### Extending for Other Platforms

To add support for other platforms:

1. Create a new strategy implementing `IComprehensivePlatformStrategy`
2. Register the strategy with `ComprehensiveStrategyRegistry`
3. Update the UI to handle platform-specific details if needed

## Future Enhancements for Price Scraping

### Firebase Integration for URL Storage

The current implementation uses a dummy repository for storing product URLs. In the future, this will be replaced with a Firebase-based implementation:

```typescript
export class FirebaseProductUrlRepository implements IProductUrlRepository {
  private firestore: FirebaseFirestore;
  
  constructor() {
    this.firestore = firebase.firestore();
  }
  
  async getCompetitorUrls(productId: string, productBrand: string, productModel: string): Promise<Record<string, string>> {
    const doc = await this.firestore.collection('productUrls').doc(productId).get();
    return doc.exists ? doc.data().urls : {};
  }
  
  // Implement other methods
}
```

### Web Worker Implementation for Background Processing

To improve UI responsiveness, price scraping could be moved to a background process using web workers:

```typescript
// In the main thread
const worker = new Worker('./priceScraperWorker.js');
worker.onmessage = (event) => {
  const prices = event.data;
  setCompetitorPrices(prices);
};
worker.postMessage({ productId, productBrand, productModel });
```

### Caching and Offline Support

Enhance the price scraping service with better caching and offline support:

```typescript
async fetchCompetitorPrices(productId: string, productModel: string, productBrand: string): Promise<Record<string, CompetitorPrice>> {
  // Check for cached data
  const cachedData = await this.getCachedPrices(productId);
  if (cachedData && this.isCacheValid(cachedData)) {
    return cachedData;
  }
  
  // Check for network connectivity
  if (!this.isOnline()) {
    return cachedData || {};
  }
  
  // Fetch and cache new data
  const prices = await this.fetchPrices(productId, productModel, productBrand);
  await this.cachePrices(productId, prices);
  return prices;
}
```

## Code Quality Checklist

For all code changes, ensure:

1. **SOLID Compliance**
   - [ ] Classes have single responsibilities
   - [ ] Extensions are made through interfaces, not modifications
   - [ ] Substitutable implementations for all abstractions
   - [ ] Focused interfaces with no unused methods
   - [ ] Dependencies on abstractions, not concretions

2. **Pattern Adherence**
   - [ ] Factory Pattern for object creation
   - [ ] Visitor Pattern for operations on products
   - [ ] Facade Pattern for service access
   - [ ] Strategy Pattern for price extraction algorithms

3. **Code Quality**
   - [ ] Consistent naming conventions
   - [ ] Proper error handling
   - [ ] Performance considerations
   - [ ] Tests for new functionality

## Implementation Roadmap

### Phase 1: Core Functionality Enhancement ✅
- Complete Firebase integration for real product data
- Implement proper error handling and loading states
- Enhance product detail page with complete specifications
- Add proper navigation between screens

### Phase 2: Pattern Implementation Completion ✅
- Enhance Factory Pattern with product registration system
- Complete Visitor Pattern integration with user experience levels
- Expand Facade Pattern with proper error handling and caching
- Implement Strategy Pattern for price extraction algorithms

### Phase 3: Advanced Features 🔶
- Implement real-time price comparison using web scraping ✅
- Add intelligent search functionality with natural language processing
- Develop recommendation engine based on user preferences and experience
- Build comprehensive product comparison feature

### Phase 4: Optimization and Refinement ⏳
- Optimize performance for large product catalogs
- Implement proper state management solution
- Add automated testing for all components
- Refine UI/UX for optimal sales experience

## Testing Strategy

This application follows a comprehensive testing strategy that leverages different testing techniques to ensure code quality and functionality. 

### Core Testing Approaches

#### Unit Testing
- Test each pattern implementation in isolation
- Verify SOLID principles adherence through tests
- Validate business logic operations

#### Integration Testing
- Test interactions between different subsystems
- Verify proper facade operation with mocked services
- Test navigation flows and screen transitions

#### UI Testing
- Verify component rendering
- Test user interactions and form submissions
- Validate responsive design for different iPad models

### Testing Methodologies

The testing approach further implements the following methodologies:

#### 1. Equivalence Partitioning (EP)

Equivalence Partitioning divides input data into classes where test cases in each partition are expected to have the same behavior.

**Application in ScubaDivingSales:**
- **Product Budget Categories**: Testing low (0-200), medium (201-500), and high (501+) price ranges
- **Diver Experience Levels**: Testing beginner, intermediate, and advanced user experiences
- **Product Types**: Testing different product categories (regulators, BCDs, fins)

```typescript
// Example: Product Budget Filter Test using EP
test.each([
  ['low budget', {minPrice: 0, maxPrice: 200}, expectedLowBudgetProducts],
  ['medium budget', {minPrice: 201, maxPrice: 500}, expectedMediumBudgetProducts],
  ['high budget', {minPrice: 501, maxPrice: 2000}, expectedHighBudgetProducts]
])('should filter products correctly for %s', (label, priceRange, expectedProducts) => {
  const results = filterService.filterByPrice(allProducts, priceRange);
  expect(results).toEqual(expectedProducts);
});
```

#### 2. Boundary Value Analysis (BVA)

BVA tests values at the boundaries between equivalence partitions, where errors are most likely to occur.

**Application in ScubaDivingSales:**
- **Price Category Boundaries**: Testing prices at exactly 200, 201, 500, 501
- **Stock Level Boundaries**: Testing "low stock" thresholds (e.g., 5 items remaining)
- **Experience Level Requirements**: Testing minimum requirements for different diving equipment

```typescript
// Example: Price Categorization Test using BVA
test.each([
  [0, 'low'],       // Lower bound
  [200, 'low'],     // Upper bound of 'low'
  [201, 'medium'],  // Lower bound of 'medium'
  [500, 'medium'],  // Upper bound of 'medium'
  [501, 'high'],    // Lower bound of 'high'
])('price $%s should be categorized as %s', (price, expectedCategory) => {
  expect(priceCategorizationService.categorize(price)).toBe(expectedCategory);
});
```

#### 3. Pairwise Testing (Combinatorial Testing)

Pairwise testing reduces the number of test cases while maintaining good coverage by testing all possible pairs of input values.

**Application in ScubaDivingSales:**
- **Product Recommendation System**: Testing different combinations of:
  - Experience levels (beginner/intermediate/advanced)
  - Diving types (recreational/technical/cave)
  - Budget levels (low/medium/high)

```typescript
// Example: Recommendation Engine Test using Pairwise Testing
// Full combinatorial would require 27 tests (3×3×3)
// Pairwise reduces to 9 tests while covering all value pairs
const testCases = [
  {experience: 'beginner', divingType: 'recreational', budget: 'low'},
  {experience: 'beginner', divingType: 'technical', budget: 'medium'},
  {experience: 'beginner', divingType: 'cave', budget: 'high'},
  {experience: 'intermediate', divingType: 'recreational', budget: 'medium'},
  {experience: 'intermediate', divingType: 'technical', budget: 'high'},
  {experience: 'intermediate', divingType: 'cave', budget: 'low'},
  {experience: 'advanced', divingType: 'recreational', budget: 'high'},
  {experience: 'advanced', divingType: 'technical', budget: 'low'},
  {experience: 'advanced', divingType: 'cave', budget: 'medium'}
];

test.each(testCases)('should recommend appropriate products for %p', (params) => {
  const recommendations = recommendationService.getRecommendations(params);
  expect(recommendations.length).toBeGreaterThan(0);
  // Additional assertions for recommendation quality
});
```

### 4. Design Pattern Testing

Testing specific implementations of design patterns to ensure they function as expected.

#### Factory Pattern Testing
```typescript
test('creates a regulator product', () => {
  const product = factory.createProduct(
    'regulator',
    '1',
    'Test Regulator',
    'TestBrand',
    500,
    { qualityScore: 8 }
  );
  expect(product).toBeInstanceOf(RegulatorProduct);
  expect(product.getDescription()).toContain('Test Regulator');
});
```

#### Strategy Pattern Testing
```typescript
test('should select correct price extraction strategy for URL', () => {
  const registry = PlatformStrategyRegistry.getInstance();
  const lazadaUrl = 'https://www.lazada.sg/products/abc';
  const shopeeUrl = 'https://shopee.sg/product/xyz';
  
  const lazadaStrategy = registry.getStrategyForUrl(lazadaUrl);
  const shopeeStrategy = registry.getStrategyForUrl(shopeeUrl);
  
  expect(lazadaStrategy.getPlatformName()).toBe('Lazada');
  expect(shopeeStrategy.getPlatformName()).toBe('Shopee');
});
```

#### Visitor Pattern Testing
```typescript
test('visitor calculates correct price for experience level', () => {
  const visitor = new PriceCalculatorVisitor('intermediate');
  const product = new RegulatorProduct('1', 'Test', 'Brand', 100, {});
  
  const calculatedPrice = product.accept(visitor);
  expect(calculatedPrice).toBe(100); // No adjustment for intermediate
});
```

#### Facade Pattern Testing
```typescript
test('service facade retrieves product with prices', async () => {
  const facade = ServiceFacade.getInstance();
  const result = await facade.getProductWithPriceComparison('1');
  
  expect(result.product).toBeDefined();
  expect(result.competitorPrices).toBeDefined();
});
```

### Testing Implementation Plan

1. **Unit Tests**: Testing individual components and patterns in isolation
   - Factory method implementations
   - Strategy pattern implementations
   - Visitor pattern implementations
   - Service implementations

2. **Integration Tests**: Testing interactions between components
   - Product filtering + recommendation flow
   - Price scraping + comparison flow
   - Firebase data integration

3. **UI Component Tests**: Testing React Native components
   - Rendering with different props
   - User interaction simulations
   - State changes

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- ProductFactory.test.ts
```

### Setting Up Test Environment

The testing environment uses Jest with React Native Testing Library. To set up:

1. Install testing dependencies:
   ```
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

2. Configure Jest in package.json:
   ```json
   "jest": {
     "preset": "react-native",
     "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
     "transformIgnorePatterns": [
       "node_modules/(?!(react-native|@react-native|react-native-.*)/)"
     ]
   }
   ```

3. Create mock implementations for Firebase and other external services

## Project Completion Requirements

[... existing content remains the same ...]

## Firebase Configuration

To use Firebase with this application, you need to:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database in your project
3. Set up Firestore security rules to allow read/write operations
4. Add your Firebase configuration details in one of these ways:
   - Create a `.env` file with the following variables:
     ```
     EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```
   - Or directly replace placeholder values in `src/services/firebase/config/firebase.config.ts`

5. To enable real Firebase (instead of mock data), set `useRealFirebase` to `true` in `App.tsx`.

### Firestore Data Structure

The application expects a Firestore database with the following structure:

- Collection: `products`
  - Document ID: Product ID (e.g., "1", "2", "3")
  - Fields:
    - `name`: string
    - `brand`: string
    - `price`: number
    - `type`: string (one of: "regulator", "bcd", "fin")
    - `specifications`: object with product details

- Collection: `productUrls` (for price scraping functionality)
  - Document ID: Product ID
  - Fields:
    - `urls`: object with platform URLs
      - Key: Competitor name (e.g., "Lazada", "Shopee")
      - Value: URL to the competitor's product page

[... rest of the existing content ...] 