# ScubaDivingSales Assistant App

A specialized sales assistant app for ScubaWarehouse, designed to help sales representatives provide better service by streamlining product selection, comparison, and recommendation.

## Architecture

This application is built using React Native for iPad and follows SOLID principles with the implementation of the following design patterns:

- **Factory Method Pattern**: For creating product objects based on their type
- **Visitor Pattern**: For implementing operations on products without modifying their classes
- **Facade Pattern**: For simplifying complex subsystem interactions

## Project Structure

```
ScubaDivingApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common UI elements
│   │   ├── product/         # Product-specific components
│   │   ├── comparison/      # Comparison view components
│   │   ├── search/          # Search-related components
│   │   └── recommendation/  # Recommendation components
│   ├── screens/             # Screen components
│   │   ├── ProductSelection/
│   │   ├── ProductDetails/
│   │   ├── Comparison/
│   │   ├── IntelligentSearch/
│   │   └── RealTimeComparison/
│   ├── services/            # Services for API calls and data handling
│   │   ├── api/
│   │   ├── firebase/
│   │   └── scraper/
│   ├── patterns/            # Design pattern implementations
│   │   ├── factory/         # Factory Method pattern
│   │   ├── visitor/         # Visitor pattern
│   │   └── facade/          # Facade pattern
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
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

3. **Code Quality**
   - [ ] Consistent naming conventions
   - [ ] Proper error handling
   - [ ] Performance considerations
   - [ ] Tests for new functionality

## Implementation Roadmap

### Phase 1: Core Functionality Enhancement
- Complete Firebase integration for real product data
- Implement proper error handling and loading states
- Enhance product detail page with complete specifications
- Add proper navigation between screens

### Phase 2: Pattern Implementation Completion
- Enhance Factory Pattern with product registration system
- Complete Visitor Pattern integration with user experience levels
- Expand Facade Pattern with proper error handling and caching

### Phase 3: Advanced Features
- Implement real-time price comparison using web scraping
- Add intelligent search functionality with natural language processing
- Develop recommendation engine based on user preferences and experience
- Build comprehensive product comparison feature

### Phase 4: Optimization and Refinement
- Optimize performance for large product catalogs
- Implement proper state management solution
- Add automated testing for all components
- Refine UI/UX for optimal sales experience

## Testing Strategy

### Unit Testing
- Test each pattern implementation in isolation
- Verify SOLID principles adherence through tests
- Validate business logic operations

### Integration Testing
- Test interactions between different subsystems
- Verify proper facade operation with mocked services
- Test navigation flows and screen transitions

### UI Testing
- Verify component rendering
- Test user interactions and form submissions
- Validate responsive design for different iPad models

## Project Completion Requirements

[... existing content remains the same ...] 