# ScubaDivingApp Design Patterns - UML Diagrams

This document contains UML diagrams for the key design patterns implemented in the ScubaDivingApp.

## Factory Method Pattern

The Factory Method pattern enables the creation of different product objects without specifying their concrete classes in client code.

```
┌────────────────────────────────────┐
│           «interface»              │
│             Product                │
├────────────────────────────────────┤
│+ id, type, name, brand, price      │
│+ specifications, imageUrl, link    │
├────────────────────────────────────┤
│+ getDescription(): string          │
└──────────────────┬─────────────────┘
                   │
                   │ implements
        ┌──────────┼──────────┐
        │          │          │
┌───────▼────┐ ┌───▼────┐ ┌───▼────┐
│Regulator   │ │BCD     │ │Fin     │
│Product     │ │Product │ │Product │
└─────┬──────┘ └────┬───┘ └────┬───┘
      │             │          │
      └─────────────┼──────────┘
                    │ creates
                    ▼
┌────────────────────────────────────┐
│         ProductFactory             │
├────────────────────────────────────┤
│+ createProduct(...)                │
└────────────────────────────────────┘
```

## Facade Pattern

The Facade pattern provides a simplified interface to the complex subsystems in the ScubaDivingApp.

```
┌─────────────────────────────────────────────────────┐
│                   ServiceFacade                      │
├─────────────────────────────────────────────────────┤
│ - instance: ServiceFacade                           │
│ - firebaseService: IFirebaseService                 │
│ - productRepository: IProductRepository             │
│ - realTimePriceScraperService: IPriceScraperService │
│ - multiPlatformPriceScraperService: IPriceScraperService│
├─────────────────────────────────────────────────────┤
│ + getInstance(): ServiceFacade                      │
│ + getProductWithPriceComparison()                   │
│ + fetchRealTimeCompetitorPrices()                   │
└──────────────────┬──────────────────────────────────┘
                   │ uses
        ┌──────────┼───────────┬───────────────┐
        │          │           │               │
        ▼          ▼           ▼               ▼
┌───────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐
│IFirebase  │ │IProduct  │ │IPriceScraper│ │IPlatform   │
│Service    │ │Repository│ │Service      │ │Extraction  │
└───────────┘ └──────────┘ └────────────┘ └────────────┘
```

## Visitor Pattern

The Visitor pattern allows adding operations to product objects without modifying their classes.

```
┌─────────────────────────────────────────────────┐
│               «interface»                        │
│             ProductVisitor                       │
├─────────────────────────────────────────────────┤
│+ visitRegulator(product: RegulatorProduct): any  │
│+ visitBCD(product: BCDProduct): any             │
│+ visitFin(product: FinProduct): any             │
└────────────────────┬────────────────────────────┘
                     │
                     │ implements
    ┌────────────────┴────────────────┐
    │                                  │
┌───▼───────────┐          ┌──────────▼─────────┐
│PriceCalculator│          │RecommendationScore │
│Visitor        │          │Visitor             │
├───────────────┤          ├────────────────────┤
│- experienceLevel│         │- userPreferences   │
├───────────────┤          ├────────────────────┤
│+ visitRegulator()│        │+ visitRegulator()  │
│+ visitBCD()     │        │+ visitBCD()        │
│+ visitFin()     │        │+ visitFin()        │
└───────────────┘          └────────────────────┘
                          
┌───────────────────────────┐
│         «interface»       │
│       VisitableProduct    │
├───────────────────────────┤
│+ accept(visitor): any     │
└─────────────┬─────────────┘
              │ extends
┌─────────────┴─────────────┐
│        «interface»        │
│          Product          │
└─────────────┬─────────────┘
              │ implements
              │
   ┌──────────┴───────────┐
   │                      │
┌──▼───────────┐  ┌───────▼────────┐  ┌─────────▼────────┐
│VisitableRegul│  │VisitableBCD    │  │VisitableFin      │
│atorProduct   │  │Product         │  │Product           │
├──────────────┤  ├────────────────┤  ├──────────────────┤
│+ accept()     │  │+ accept()      │  │+ accept()        │
└──────────────┘  └────────────────┘  └──────────────────┘
```

These diagrams illustrate the key design patterns that provide structure and flexibility to the ScubaDivingApp.

## Backend Architecture

This section focuses on the backend architecture and how the design patterns are implemented together in the data layer.

### Enhanced Factory Method Implementation

This wider diagram shows the extensible factory implementation used in the backend, highlighting how 'this' is used to create an extensible factory.

```
┌─────────────────────────┐     ┌─────────────────────────────────────────────────────────┐     ┌─────────────────────────┐
│                         │     │                    ProductFactory                        │     │  TechnicalDivingFactory │
├─────────────────────────┤     ├─────────────────────────────────────────────────────────┤     ├─────────────────────────┤
│# createRegulatorProduct(id, name, brand, price, specs)   │     │# createRegulatorProduct()│
│# createMaskProduct()    │     │# createBCDProduct(id, name, brand, price, specs)         │     │  (Adds technical specs) │
│                         │ ◄───┤# createFinProduct(id, name, brand, price, specs)         ├────►│                         │
│# getProductTypeFactory()│     │# getProductTypeFactory(type): returns this.create*()     │     │                         │
│  (Adds 'mask' support)  │     │# createDefaultProduct(id, name, brand, price, specs)     │     │                         │
└─────────────────────────┘     │+ createProduct(type, id, name, brand,...): uses this.*() │     └─────────────────────────┘
                                └─────────────────────────────────────────────────────────┘
                                                            │ 
                                                            │ creates
                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          «Product Hierarchy»                                                  │
├───────────────────────┬───────────────────────┬────────────────────────┬─────────────────────────────────────┤
│   RegulatorProduct    │     BCDProduct        │      FinProduct        │          MaskProduct                │
├───────────────────────┼───────────────────────┼────────────────────────┼─────────────────────────────────────┤
│  - type: 'regulator'  │   - type: 'bcd'       │    - type: 'fin'       │         - type: 'mask'             │
└───────────────────────┴───────────────────────┴────────────────────────┴─────────────────────────────────────┘
```

### Firebase Integration Architecture

This diagram shows how the backend interfaces with Firebase through the repository pattern:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           ServiceFacade                                                       │
└───────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┘
                                                │ uses
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        IProductRepository                                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│+ getProduct(id): Promise<Product>                                                                             │
│+ getAllProducts(): Promise<Product[]>                                                                         │
│+ getProductsByType(type): Promise<Product[]>                                                                  │
│+ getRegulatorDetails(productId): Promise<RegulatorDetails>                                                    │
│+ getBCDDetails(productId): Promise<BCDDetails>                                                                │
└─────────────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                          │ implements
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         ProductRepository                                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│- PRODUCTS_COLLECTION: string = 'products'                                                                     │
│- REGULATORS_COLLECTION: string = 'regulators'                                                                 │
│- BCDS_COLLECTION: string = 'bcds'                                                                             │
│- firebaseService: FirebaseService                                                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│+ getProduct(id): uses Factory to create product from Firebase doc                                             │
│+ getAllProducts(): retrieves all products from collection                                                     │
│+ getProductsByType(type): retrieves products with specific type                                               │
│+ getRegulatorDetails(productId): gets additional details from regulators collection                           │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┘
                                  │ uses
                                  ▼
┌──────────────────────────────────────────┐     ┌───────────────────────────────────────────────────────────┐
│              IFirebaseService            │     │                     Firestore Database                     │
├──────────────────────────────────────────┤     ├─────────────────────────┬─────────────────────────────────┤
│+ initialize(): Promise<void>             │     │ Collection: products     │ Document: {                     │
│+ isInitialized(): boolean                │     │                          │   id: string,                   │
│+ getFirestore(): Firestore               │     │                          │   brand: string,                │
└────────────────────┬─────────────────────┘     │                          │   model: string,                │
                     │                           │                          │   price: number,                │
                     │                           │                          │   type: string,                 │
                     │                           │                          │   link: string                  │
                     │ implements                │                          │ }                               │
                     ▼                           └─────────────────────────┴─────────────────────────────────┘
┌──────────────────────────────────────────┐     ┌───────────────────────────────────────────────────────────┐
│           FirebaseService                │     │ Collection: regulators   │ Document: {                     │
├──────────────────────────────────────────┤     │                          │   prod_id: string,              │
│- instance: FirebaseService               │     │                          │   temperature: string,          │
│- app: FirebaseApp                        │     │                          │   high_pressure_port: number,   │
│- db: Firestore                           │     │                          │   low_pressure_port: number,    │
│+ getInstance(): FirebaseService          │     │                          │   ...                           │
│+ initialize(): Promise<void>             │     │                          │ }                               │
│+ getFirestore(): Firestore               │     └─────────────────────────┴─────────────────────────────────┘
└──────────────────────────────────────────┘
```

### Multi-Layer Backend Architecture

This diagram shows the complete backend architecture with all design patterns integrated:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              UI Layer                                                      │
└────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                 │
                                                 │ interacts with
                                                 ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        ServiceFacade (Facade Pattern)                                      │
└─────────────────────┬─────────────────────────┬──────────────────────────┬────────────────────────────────┘
                      │                         │                          │
                      ▼                         ▼                          ▼
┌─────────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────────────────────┐
│    ProductRepository        │  │     FirebaseService     │  │           PriceScraperService                │
│    (Repository Pattern)     │  │     (Singleton)         │  │                                              │
└──────────────┬──────────────┘  └─────────────────────────┘  └──────────────────────────────────────────────┘
               │
               │ creates
               ▼
┌─────────────────────────────┐                                     ┌──────────────────────────────────────────────┐
│     ProductFactory          │◄────creates products─────────────── │  ProductVisitor (Visitor Pattern)            │
│     (Factory Pattern)       │                                     │  - PriceCalculatorVisitor                     │
└─────────────────────────────┘                                     │  - RecommendationScoreVisitor                 │
                                                                    └──────────────────────────────────────────────┘ 

## Frontend Architecture

This section shows the frontend components with proper UML notation, keeping it simple yet detailed.

### Frontend Component Structure

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                             App                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│ - serviceFacade: ServiceFacade                                                │
│ - navigation: Navigation                                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│ + initialize(): void                                                          │
│ + render(): JSX.Element                                                       │
└─────────────────────────────────────────┬─────────────────────────────────────┘
                                         │
                 ┌─────────────────────────────────────────────┐
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│         HomeScreen              │         │         DetailScreen            │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ - products: Product[]           │         │ - product: Product              │
│ - loading: boolean              │         │ - prices: Record<string,number> │
│ - filters: ProductFilters       │         │ - loading: boolean              │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ + fetchProducts(): void         │         │ + fetchProductDetails(): void   │
│ + handleFilterChange(): void    │         │ + fetchPriceComparison(): void  │
│ + render(): JSX.Element         │         │ + render(): JSX.Element         │
└─────────────────┬───────────────┘         └───────────────┬─────────────────┘
                  │                                         │
                  ▼                                         ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│         ProductCard             │         │       PriceComparisonView       │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ - product: Product              │         │ - prices: Record<string,number> │
│ - onClick: Function             │         │ - productPrice: number          │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ + handleClick(): void           │         │ + renderPriceComparison(): JSX  │
│ + render(): JSX.Element         │         │ + render(): JSX.Element         │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

### ServiceFacade Integration

```
┌───────────────────────────────────┐           ┌───────────────────────────────────┐
│         React Component           │           │            ServiceFacade          │
├───────────────────────────────────┤           ├───────────────────────────────────┤
│ - state variables                 │           │ - instance: ServiceFacade         │
├───────────────────────────────────┤           │ # services: various services      │
│ + componentDidMount(): void       │──────────►│ + getInstance(): ServiceFacade    │
│ + fetchData(): void               │           │ + getProductWithPriceComp(): obj  │
│ + handleEvents(): void            │◄──────────│ + fetchRealTimeCompetitorP(): obj │
└───────────────────────────────────┘           └─────────────────┬─────────────────┘
                                                                  │
                                                                  │
         ┌──────────────────────────────────────────────────────┐ │
         │                                                      │ │
         ▼                                                      ▼ ▼
┌───────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────┐
│     ProductFactory    │  │    ProductRepository    │  │    FirebaseService      │
├───────────────────────┤  ├────────────────────────┤  ├─────────────────────────┤
│ # createMethods       │  │ - collections: string[] │  │ - instance: Firebase    │
├───────────────────────┤  ├────────────────────────┤  ├─────────────────────────┤
│ + createProduct(): Pr │  │ + getProduct(): Promise │  │ + initialize(): Promise │
└───────────────────────┘  └────────────────────────┘  └─────────────────────────┘
```

This UML diagram accurately represents the frontend components with their visibility modifiers:
- `+` Public members (accessible from outside)
- `-` Private members (accessible only within the class)
- `#` Protected members (accessible within class and subclasses)

## System Architecture Overview

This high-level architecture diagram shows the complete system organization and interactions between major components.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  ScubaDivingApp System                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                          
┌───────────────────────────────────────┐         ┌────────────────────────────────────┐        ┌────────────────────────────┐
│          «component»                  │         │           «component»              │        │       «component»          │
│            Frontend                   │         │           API Layer                │        │       Firebase DB          │
├───────────────────────────────────────┤         ├────────────────────────────────────┤        ├────────────────────────────┤
│  ┌─────────────────┐ ┌──────────────┐ │         │ ┌──────────────┐ ┌──────────────┐ │        │ ┌──────────────────────┐   │
│  │    Product      │ │   Product    │ │  uses   │ │ │    Price     │ │   Product    │ │  uses  │ │ │    ScubaProduct      │   │
│  │  Selection UI   │ │  Details UI  │ │         │ │ │   Scraper    │ │   Filtering  │ │         │ │ │   Collection         │   │
│  └─────────────────┘ └──────────────┘ ├────────►│ │ │ └──────────────┘ └──────────────┘ ├───────►│ │ │ └──────────────────────┘   │
│                                       │         │                                  │        │                            │
│  ┌─────────────────┐ ┌──────────────┐ │         │ ┌──────────────┐ ┌──────────────┐ │        │ │ │ ┌──────────────────────┐   │
│  │    Search       │ │  Price       │ │         │ │ │   Business   │ │     API      │ │        │ │ │ │  Realtime/Historical  │   │
│  │  Functionality  │ │  Comparison  │ │         │ │ │    Logic     │ │ Management   │ │        │ │ │ │  Price Data       │   │
│  └─────────────────┘ └──────────────┘ │         │ │ │ └──────────────┘ └──────────────┘ │        │ │ │ │ └──────────────────────┘   │
└───────────────┬───────────────────────┘         └──────────────────┬─────────────────┘        └────────────┬───────────────┘
                │                                                    │                                       │
                │                                                    │                                       │
                │                                                    │                                       │
┌───────────────▼───────────────────────────────────────────────────▼───────────────────────────────────────▼───────────────┐
│                                              «component»                                                                   │
│                                         Service Facade (Facade Pattern)                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                   ▲
                                                                   │
                      ┌──────────────────────────────────────────┐ │ ┌────────────────────────────────────────────┐
                      │             «component»                  │ │ │              «component»                   │
                      │      External Price Comparison           │ │ │             Existing E-commerce            │
                      ├──────────────────────────────────────────┤ │ ├────────────────────────────────────────────┤
                      │ ┌───────────────┐  ┌───────────────────┐ │ │ │                                            │
                      │ │  Web Scraper  │  │   Real-time Sync  │ ├─┘ │         Detailed Product Specs            │
                      │ └───────────────┘  └───────────────────┘ │   │                                            │
                      └──────────────────────────────────────────┘   └────────────────────────────────────────────┘
```

### Component Descriptions

1. **Frontend**: User interface components for product browsing, comparison, and search
   - Product Selection UI: Main browsing interface for users
   - Product Details UI: Detailed view of specific products
   - Search Functionality: Intelligent product search capabilities
   - Price Comparison: Visual display of competitor price data

2. **API Layer (Backend)**: Business logic and data processing components
   - Price Scraper: Extracts competitor pricing information
   - Product Filtering: Handles sorting and filtering of products
   - Business Logic: Core application rules and processing
   - API Management: Standardized interfaces for data access

3. **Firebase DB**: Data storage components
   - ScubaProduct Collection: Main product data with categories
   - Realtime/Historical Price Data: Storage for current and past pricing

4. **Service Facade**: Central coordination point implementing the Facade pattern
   - Provides unified interface between frontend, backend and external systems
   - Handles authentication, error handling, and transaction management

5. **External Price Comparison**: Modules for gathering external market data
   - Web Scraper: Extracts pricing data from competitor websites
   - Real-time Sync: Keeps pricing information current

6. **Existing E-commerce**: Integration with established e-commerce platform
   - Detailed Product Specs: Technical specifications for products

This architecture implements multiple design patterns:
- **Facade Pattern**: ServiceFacade provides a unified interface
- **Factory Pattern**: Used in the API Layer for product creation
- **Visitor Pattern**: Implemented for operations on different product types
