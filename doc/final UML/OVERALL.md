## System Architecture Overview

This high-level architecture diagram shows the complete system organization and interactions between major components.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  ScubaDivingApp System                                            │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                          
┌───────────────────────────────────────┐         ┌────────────────────────────────────┐        ┌────────────────────────────┐
│          «component»                  │         │           «component»              │        │       «component»          │
│            Frontend                   │         │           API Layer                │        │       Firebase DB          │
├───────────────────────────────────────┤         ├────────────────────────────────────┤        ├────────────────────────────┤
│  ┌─────────────────┐ ┌──────────────┐ │         │  ┌──────────────┐ ┌──────────────┐ │        │  ┌──────────────────────┐  │
│  │    Product      │ │   Product    │ │  uses   │  │    Price     │ │   Product    │ │  uses  │  │    ScubaProduct      │  │
│  │  Selection UI   │ │  Details UI  │ │         │  │   Scraper    │ │   Filtering  │ │        │  │    Collection        │  │
│  └─────────────────┘ └──────────────┘ ├────────►│  └──────────────┘ └──────────────┘ ├───────►│  └──────────────────────┘  │
│                                       │         │                                    │        │                            │
│  ┌─────────────────┐ ┌──────────────┐ │         │  ┌──────────────┐ ┌──────────────┐ │        │  ┌──────────────────────┐  │
│  │    Search       │ │  Price       │ │         │  │   Business   │ │     API      │ │        │  │  Realtime/Historical │  │
│  │  Functionality  │ │  Comparison  │ │         │  │    Logic     │ │ Management   │ │        │  │      Price Data      │  │
│  └─────────────────┘ └──────────────┘ │         │  └──────────────┘ └──────────────┘ │        │  └──────────────────────┘  │
└───────────────┬───────────────────────┘         └──────────────────┬─────────────────┘        └────────────┬───────────────┘
                │                                                    │                                       │
                │                                                    │                                       │
                │                                                    │                                       │
┌───────────────▼───────────────────────────────────────────────────▼───────────────────────────────────────▼───────────────┐
│                                              «component»                                                                  │
│                                         Service Facade (Facade Pattern)                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                   ▲
                                                                   │
                      ┌──────────────────────────────────────────┐ │ ┌────────────────────────────────────────────┐
                      │             «component»                  │ │ │              «component»                   │
                      │      External Price Comparison           │ │ │             Existing E-commerce            │
                      ├──────────────────────────────────────────┤ │ ├────────────────────────────────────────────┤
                      │ ┌───────────────┐  ┌───────────────────┐ │ │ │                                            │
                      │ │  Web Scraper  │  │   Real-time Sync  │ ├─┘ │         Detailed Product Specs             │
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
