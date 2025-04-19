# Individual Contribution Report

## 1. Overview of Individual Contributions

### Scope of Work
- Owned and implemented the **IntelligentSearch** module with advanced filtering functionality
- Developed the **Filter Function** feature for ScubaWarehouse Sales Assistant
- Integrated filtering with Product Repository and Service Facade
- Implemented category-specific filters for both Regulators and BCDs (Buoyancy Control Devices)

### Timeline
- **Sprint 2**: Initial implementation of basic filter interface and architecture
- **Sprint 3**: Extended filtering functionality with category-specific options
- **Sprint 4**: Optimized filter performance and integrated with product repository

### Role in Agile (Scrum)
- Updated TROFOS tickets with implementation progress and testing results
- Participated in daily stand-ups (quick 15-minute check-ins) to report progress on filter functionality
- Presented working filter system during Sprint 3 review
- Contributed to retrospectives, discussing filter implementation challenges and identifying areas for improvement

## 2. Major Design Choices and Decisions

### Architecture Style
- Used a **Façade Pattern** to provide a simple, unified interface to the complex filtering subsystem
- Applied **Factory Method Pattern** for creating different types of product filters
- Developed components that follow SOLID principles for maintainability

### Key Patterns and Principles
- **Façade Pattern**: Created a simplified interface (`ServiceFacade`) that hides complex filtering logic from the UI layer
- **Factory Method Pattern**: Implemented a factory for creating different filter types based on product categories
- **DRY Principle**: Extracted common filtering logic into reusable methods to avoid code duplication

### Trade-offs
- Chose to implement client-side filtering over server-side for faster user experience
- Used TypeScript interfaces to ensure type safety throughout the filter implementation
- Balanced feature richness with maintainability in the filtering system design

## 3. UML Diagrams

```
┌───────────────────────┐          ┌─────────────────────────┐
│   IntelligentSearch   │          │      ServiceFacade      │
├───────────────────────┤          ├─────────────────────────┤
│- filters: FilterState │          │- productRepo: Repository│
├───────────────────────┤          ├─────────────────────────┤
│+ applyFilters()       │───uses───►│+ getFilteredProducts() │
│+ resetFilters()       │          │+ getAllProducts()       │
└───────────────────────┘          └──────────────┬──────────┘
                                                  │
                                                  │ uses
                                                  ▼
┌───────────────────────┐          ┌─────────────────────────┐
│     FilterFactory     │          │   ProductRepository     │
├───────────────────────┤          ├─────────────────────────┤
│                       │◄─uses────│- products: Product[]    │
├───────────────────────┤          ├─────────────────────────┤
│+ createFilter(type)   │          │+ getProducts()          │
└─────────┬─────────────┘          │+ filterProducts()       │
          │                         └─────────────────────────┘
          │ creates
          ▼
┌─────────────────────────────────────────┐
│            «interface»                  │
│           IFilterChecker                │
├─────────────────────────────────────────┤
│+ checkFilters(details: any): boolean    │
└─────────────┬───────────────────────────┘
              │
              │ implements
    ┌─────────┴─────────┐
    │                   │
┌───▼───────────────┐ ┌─▼─────────────────┐
│RegulatorFilterChe…│ │BCDFilterChecker   │
├───────────────────┤ ├───────────────────┤
│- filters: State   │ │- filters: State   │
├───────────────────┤ ├───────────────────┤
│+ checkFilters()   │ │+ checkFilters()   │
└───────────────────┘ └───────────────────┘
           
┌────────────────────┐     ┌────────────────────┐
│   RegulatorDetails │     │    BCDDetails      │
├────────────────────┤     ├────────────────────┤
│- temperature: string│     │- weight: number    │
│- airflow: number   │     │- liftCapacity: number│
│- divetype: string  │     │- material: string  │
└────────────────────┘     └────────────────────┘

┌───────────────────┐
│      Product      │
├───────────────────┤
│- id: string       │
│- name: string     │
│- category: string │
│- price: number    │
│- details: any     │
└───────────────────┘
```

## 4. Software Engineering Principles Applied

### SOLID Principles Application
- **SRP (Single Responsibility)**: Filter components handle only filtering logic, while UI components handle only rendering
  ```typescript
  // Filter logic separated from UI components
  const checkRegulatorFilters = (details: RegulatorDetails): boolean => {
    // Filter logic only - follows SRP
    return regulatorFilters.temperature === 'All' || 
           details.temperature === regulatorFilters.temperature;
  };
  ```

- **OCP (Open-Closed)**: Created a filter system extensible for new product types without modifying existing code
  ```typescript
  // New filter types can be added without changing existing filter code
  interface IFilterChecker {
    checkFilters(details: any): boolean;
  }
  
  class RegulatorFilterChecker implements IFilterChecker {
    checkFilters(details: RegulatorDetails): boolean {
      // Regulator-specific filter implementation
    }
  }
  
  class BCDFilterChecker implements IFilterChecker {
    checkFilters(details: BCDDetails): boolean {
      // BCD-specific filter implementation
    }
  }
  ```

- **DIP (Dependency Inversion)**: High-level filter components depend on abstractions rather than concrete implementations
  ```typescript
  // Components depend on filter interfaces, not concrete implementations
  function filterProducts(
    products: Product[], 
    filterChecker: IFilterChecker
  ): Product[] {
    // Filter logic using the abstraction
  }
  ```

### DRY Implementation
- Created reusable filter utilities to avoid duplicated filter logic
- Implemented shared validation functions for multiple filter types
- Built centralized filter state management to maintain consistency

## 5. Notable Features Implemented

### Advanced Filtering System
- Implemented a comprehensive filtering system for diving equipment
- Created category-specific filters that adapt dynamically based on product type
- Applied Factory Method pattern to generate appropriate filters for different product categories

### User Experience Enhancements
- Developed an intuitive filter interface based on user requirements
- Implemented real-time filter feedback for immediate results
- Created clear categorization of filter options to improve usability

## 6. Test Plan and Statistics

### Testing Techniques Applied
- **Equivalence Partitioning**: Grouped filter inputs into classes that should behave similarly
  * Example: Divided weight ranges into light, medium, and heavy categories
  * Example: Grouped airflow rates into low, medium, and high performance classes

- **Boundary Value Analysis**: Tested filter values at the boundaries of each range
  * BCD weight boundaries: 2.5kg, 3kg
  * Lift capacity: 15kg, 17kg
  * Airflow rates: 1500 l/min, 1800 l/min

- **Pair-wise Testing**: Created test combinations to ensure all pairs of filter settings were tested at least once
  * Example: Tested every combination of temperature setting and dive type
  * Example: Tested each weight range with each lift capacity option

### Test Statistics
- 30+ unit tests for filter functions
- 15 integration tests for filter-repository interaction
- 90% code coverage for filter components
- 85% code coverage for filter business logic 