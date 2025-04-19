# Individual Contributions Guide

This guide outlines the structure and content recommendations for each team member's individual contribution section in the final report.

## 1. Longsheng: Architecture and Price Scraping

### Major Design Choices and Decisions

#### Narrative Focus: Evolution from Simple to Complex Architecture

Your story should outline how the initial app design started with simple product types (just regulators) but needed to expand to accommodate multiple product types (BCDs, fins) as the project progressed. This evolution necessitated the adoption of design patterns to maintain scalability and maintainability.

**Recommended Flow:**
1. **Initial Challenge**: Begin by explaining how the sales team needed a simple app to display regulator product information and competitor prices.
2. **Expanding Requirements**: Discuss how requirements expanded to include multiple product types, each with different specifications and behaviors.
3. **Design Pattern Selection**: Explain why you chose the three design patterns:
   - **Factory Method**: Instead of making objects directly, you call a special "factory" method that decides which object to create. Show how this helped create different types of diving products.
   - **Visitor**: Let you add new operations to a bunch of objects without changing them. You send a "visitor" through each object to do the work. Show how this enabled different operations on products.
   - **Façade**: Give users one simple interface (a "front door") to a big, messy system. The façade hides all the inside work. Show how this simplified complex service interactions.

**Sample Narrative Points:**
- "As requirements expanded from a single product type to multiple diving equipment categories, we needed a flexible way to create and interact with different product types without extensive code duplication."
- "The price scraping functionality required different logic for each competitor website, yet we needed to keep this complexity hidden from the UI components."

#### Code to Showcase:
- `src/patterns/factory/ProductFactory.ts` - How the factory method creates differeπnt product objects without directly instantiating them
- `src/patterns/facade/ServiceFacade.ts` - How it provides a simple interface to the complex system of services

### Software Engineering Principles

#### SOLID Principles in Price Scraping Implementation

Focus on demonstrating how the price scraping functionality adheres to SOLID principles:

1. **SRP (Single Responsibility)**: Each class or module should do only one job
   - `src/services/scraper/PriceScraperService.ts` - Handles price data retrieval only
   - `src/services/scraper/ScrapedProductImageService.ts` - Handles image extraction only

2. **OCP (Open-Closed)**: Code should let you add new features without changing old code
   - `src/services/scraper/interfaces/IPriceScraperService.ts` - Interface that allows extending functionality without modifying existing code
   - Show how new competitor websites can be added without changing core scraping logic

3. **LSP (Liskov Substitution)**: You can swap in any subclass for its parent and the program still works
   - Demonstrate how different implementations of the scraper service can be substituted without breaking functionality
   - `MultiPlatformPriceScraperService.ts` can be substituted for the original `PriceScraperService.ts`

#### Design Pattern Implementation - Façade Pattern

**Key Code Example**:
- `src/patterns/facade/ServiceFacade.ts` - Methods like `fetchRealTimeCompetitorPrices` that hide complex interactions

**Key Points to Highlight**:
- How the Façade pattern provides a simple interface to complex backend services
- Error handling and fallback mechanisms in the Façade
- How the pattern shields UI components from implementation details

## 2. Shimin: Frontend Implementation

### Major Design Choices and Decisions

#### Narrative Focus: Creating an Adaptable and Maintainable UI

Your story should center on how the frontend needed to display and interact with different product types, each with unique characteristics, while maintaining a consistent user experience.

**Recommended Flow:**
1. **Initial UI Challenge**: Start with how the app needed to display different product types with varied specifications.
2. **Component Structure Decisions**: Explain why a component-based architecture was chosen.
3. **Design Pattern Selection**: Focus on the Visitor pattern for frontend operations:
   - **Visitor Pattern**: Let you add new operations to a bunch of objects without changing them. Show how this allowed different UI behaviors for each product type.

**Sample Narrative Points:**
- "As the number of product types grew, we faced challenges in creating reusable yet specialized UI components that could handle each type's unique characteristics."
- "We needed a way to perform different operations on products based on user experience level without cluttering the product classes themselves."

#### Code to Showcase:
- `src/components/ProductCard.tsx` and `src/components/ProductList.tsx` - How they work with different product types
- Implementation of the Visitor pattern in UI components

### Software Engineering Principles

#### SOLID Principles in Frontend Implementation

Focus on showing how the frontend adheres to SOLID principles:

1. **ISP (Interface Segregation)**: Don't force parts to use methods they don't need
   - Component props interfaces that are small and focused
   - How components use only the data they need

2. **DIP (Dependency Inversion)**: High-level and low-level parts should both rely on simple interfaces, not on each other directly
   - How UI components depend on abstractions (interfaces) rather than concrete implementations
   - Use of the ServiceFacade to access backend functionality

#### Design Pattern Implementation - Visitor Pattern

**Key Code Example**:
- `src/patterns/visitor/ProductVisitor.ts` - How it's used in UI components for different operations based on product type

**Key Points to Highlight**:
- How the Visitor pattern enables different UI behaviors for each product type
- Implementation of specialized visitors like `PriceCalculatorVisitor` for different user experience levels

## 3. Chenqian: Backend Implementation

### Major Design Choices and Decisions

#### Narrative Focus: Building a Flexible and Extensible Data Layer

Your story should focus on how the backend needed to handle various data sources and operations while maintaining a clean separation of concerns.

**Recommended Flow:**
1. **Initial Data Challenges**: Begin with the challenges of managing different types of product data and external sources.
2. **Firebase Integration Complexity**: Explain the complexity of Firebase integration and the need to hide implementation details.
3. **Design Pattern Selection**: Focus on two key patterns for backend operations:
   - **Factory Method**: Instead of making objects directly, you call a special "factory" method that decides which object to create. Show how this created different product objects from Firebase data.
   - **Façade**: Give users one simple interface to Firebase's complex APIs. Show how this simplified data access for the rest of the application.

**Sample Narrative Points:**
- "As the app's data needs grew beyond simple product listings to include technical specifications and real-time price comparisons, we needed a structured approach to data management."
- "Firebase offers powerful capabilities but has complex APIs. We needed to hide this complexity behind simple interfaces to keep the rest of the application clean."
- "Different product types needed different data structures, so we needed a flexible way to create objects from Firebase data."

#### Code to Showcase:
- `src/services/firebase/FirebaseService.ts` - How it implements the Façade pattern to hide Firebase complexity
- `src/patterns/factory/ProductFactory.ts` - How it creates product objects from Firebase data

### Software Engineering Principles

#### SOLID Principles in Backend Implementation

Focus on demonstrating how the backend adheres to SOLID principles:

1. **SRP (Single Responsibility)**: Each class or module should do only one job
   - `src/services/firebase/FirebaseService.ts` - Handles only Firebase connection and configuration
   - Separate repository interfaces for different data access operations

2. **OCP (Open-Closed)**: Code should let you add new features without changing old code
   - `src/services/firebase/interfaces/IProductRepository.ts` - Interface that allows extending functionality
   - How new product types can be added without modifying existing repository code

#### Design Pattern Implementation - Factory Method Pattern

**Key Code Example**:
- `src/patterns/factory/ProductFactory.ts` - How it's used to create product objects from Firebase data

**Key Points to Highlight**:
- How the Factory Method pattern creates appropriate product objects based on type
- How it supports the addition of new product types (showing the evolution from just regulators to including BCDs and fins)

#### Design Pattern Implementation - Façade Pattern

**Key Code Example**:
- `src/services/firebase/FirebaseService.ts` - How it simplifies Firebase interactions

**Key Points to Highlight**:
- How the Façade pattern hides the complexity of Firebase operations
- How it provides a simple, consistent interface for data access
- How it centralizes Firebase-specific logic to make the rest of the application more maintainable

## General Implementation Tips

For all team members, ensure you:

1. **Connect to Design Patterns**: Show how your implementation uses Factory Method, Façade, or Visitor patterns
2. **Highlight SOLID Principles**: Focus on how your code follows SRP, OCP, LSP, ISP, and DIP
3. **Use Real Code Examples**: Include specific code snippets that demonstrate principles in action
4. **Explain Benefits**: Clarify how these design decisions improved the codebase 