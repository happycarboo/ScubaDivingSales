# Trofos Task Management


Sprint 1 - 
[FRONTEND] Set up React Native
[BACKEND] Set up Node.js backend
[DB] Configure Firebase database for real-time data storage
[FRONTEND] MINIMUM FEATURE AND FUNCTIONS IN UI
[DB] Choice of MVP
[DB] MVP specs info gathering based on filtering features
[BUG] Issue facing on dependency set up

Sprint 2 - Infrastructure Setup
[FRONTEND] Basci UI for product details (Links to direct to user's current e-commerce website)
[DB] Connect Firebase DB(Remove Hardcode data in the script)
[FRONTEND] Ensure success excute in iPad
[FRONTEND] Improvement to be implement on UI interactive for MVP
[DB] Explore ways to improve productivities on gathering product info eg. AI tools
[DB] To explore if data base could be extracted from user's e-commerce
[FRONTEND] Sketch out the homepage desige with all the functions and features
[FRONTEND] Generate React codes for the homepage UI 
[FRONTEND] Base on the feedback from teams, improve and edit on current UI
[BACKEND&DB] Explore different competitior's 
[DB] Database Schema Design(implementation on firebase)
[BACKEND] API Connection for shoppe and lazada

Sprint 3- Expanding Product Category
[BACKEND] Enhance product filtering and recommendation engine
[DB] Update database structure to support more product categories
[BACKEND] Optimize Search and filtering to handle a larger dataset efficiently

## Epics
- **E1**: Data Management & Storage 
- **E2**: UI & Frontend Implementation
- **E3**: Real-Time Price Comparison
- **E4**: Product Comparison Module
- **E5**: Product Filtering & Selection
- **E6**: Project Infrastructure Setup

## Sprint 1 - Initial Setup

| Task ID | Task Title | Description | Epic |
|---------|------------|-------------|------|
| S1-T1 | [FRONTEND] Set up React Native | Configure and initialize React Native project with Expo for cross-platform development and establish project structure with TypeScript support | E6 - Project Infrastructure Setup |
| S1-T2 | [BACKEND] Set up Node.js backend | Initialize Node.js backend with Express framework and establish basic API architecture for future endpoint implementation | E6 - Project Infrastructure Setup |
| S1-T3 | [DB] Configure Firebase database | Set up Firebase project, configure Firestore database rules, and establish secure connection parameters for real-time data access | E1 - Data Management & Storage |
| S1-T4 | [FRONTEND] Implement minimum UI features | Create foundational UI components for product cards, navigation structure, and basic screen layouts with responsive design | E2 - UI & Frontend Implementation |
| S1-T5 | [DB] Choose MVP product categories | Determine initial product categories (Regulators, BCDs) to focus development effort and define core attributes needed for MVP | E5 - Product Filtering & Selection |
| S1-T6 | [DB] Gather MVP specifications | Research and document detailed technical specifications for Regulators and BCDs to support comprehensive filtering system | E1 - Data Management & Storage |
| S1-T7 | [BUG] Fix dependency issues | Resolve conflicts in Node modules, address version incompatibilities, and establish proper dependency management | E6 - Project Infrastructure Setup |

## Sprint 2 - Infrastructure Setup

| Task ID | Task Title | Description | Epic |
|---------|------------|-------------|------|
| S2-T1 | [FRONTEND] Implement product details UI | Create detailed UI components with product images, specifications display for Regulators and BCDs, and integration of direct links to client's e-commerce website | E2 - UI & Frontend Implementation |
| S2-T2 | [DB] Connect Firebase database | Replace hardcoded product data with Firebase integration using repository pattern for clean data access and real-time updates of Regulator and BCD information | E1 - Data Management & Storage |
| S2-T3 | [FRONTEND] Deploy and test on iPad | Ensure proper layout rendering, touch responsiveness, and component scaling on various iPad models and screen orientations | E2 - UI & Frontend Implementation |
| S2-T4 | [FRONTEND] Enhance UI interactivity | Implement smooth transitions, loading states, input validation, and responsive touch feedback for improved user experience | E2 - UI & Frontend Implementation |
| S2-T5 | [DB] Research data gathering tools | Explore efficiency tools including AI-assisted web scraping and automated data extraction methods for bulk product information collection of Regulators and BCDs | E1 - Data Management & Storage |
| S2-T6 | [DB] Investigate e-commerce data extraction | Research methods to directly extract existing product catalog data for Regulators and BCDs from client's e-commerce platform using APIs or export tools | E1 - Data Management & Storage |
| S2-T7 | [FRONTEND] Design homepage UI | Create detailed wireframes and UI mockups for main application interface with navigation paths and core feature accessibility | E2 - UI & Frontend Implementation |
| S2-T8 | [FRONTEND] Implement homepage UI | Translate UI designs into functional React Native components with proper navigation and state management | E2 - UI & Frontend Implementation |
| S2-T9 | [FRONTEND] Refine UI based on feedback | Address team feedback to improve layout, color scheme, typography, and component interactions for better usability | E2 - UI & Frontend Implementation |
| S2-T10 | [BACKEND&DB] Research competitor websites | Identify and analyze competitor websites (Lazada, Shopee) to determine HTML structure for effective price comparison implementation for Regulator and BCD products | E3 - Real-Time Price Comparison |
| S2-T11 | [DB] Design database schema | Create comprehensive Firestore schema for Regulator and BCD information, including technical specifications, manufacturer details, and relationships between entities | E1 - Data Management & Storage |
| S2-T12 | [BACKEND] Set up API connections | Establish API connection framework with authentication for Shopee and Lazada e-commerce platforms to extract price data for Regulator and BCD products | E3 - Real-Time Price Comparison |

## Sprint 3 - Expanding Product Category & Core Features

| Task ID | Task Title | Description | Epic |
|---------|------------|-------------|------|
| S3-T1 | [BACKEND] Enhance product filtering | Implement advanced filtering system for Regulators and BCDs with multi-parameter support (brand, price range, breathability rating, buoyancy capacity), range filters, and combination logic for precise product selection | E5 - Product Filtering & Selection |
| S3-T2 | [DB] Update database structure | Extend Firestore database schema to support additional product categories (Fins) beyond initial Regulators and BCDs, with specialized attributes and specifications for each product type | E1 - Data Management & Storage |
| S3-T3 | [BACKEND] Optimize search functionality | Improve search algorithm with indexing and query optimization to handle expanded product catalog with minimal latency when searching across Regulators, BCDs, and Fins | E5 - Product Filtering & Selection |
| S3-T4 | [BACKEND] Implement Factory pattern | Develop robust product factory implementation with type-safety features to create different product types (RegulatorProduct, BCDProduct, FinProduct) with appropriate behaviors and interfaces | E1 - Data Management & Storage |
| S3-T5 | [BACKEND] Implement Facade pattern | Create comprehensive ServiceFacade to simplify complex subsystem interactions for product retrieval, filtering, and price comparison across all diving equipment types | E6 - Project Infrastructure Setup |
| S3-T6 | [FRONTEND] Create product comparison UI | Design and implement side-by-side product comparison interface with visual highlights of differences between selected Regulators or BCDs, focusing on key technical specifications | E4 - Product Comparison Module |
| S3-T7 | [BACKEND] Setup price scraping services | Implement HTML parsing and extraction framework with Cheerio for reliable competitor price data collection for Regulators and BCDs from major diving equipment retailers | E3 - Real-Time Price Comparison |
| S3-T8 | [BACKEND] Develop strategy registry | Create flexible registry system for different website-specific price extraction strategies with dynamic strategy selection based on product type and vendor website | E3 - Real-Time Price Comparison |
| S3-T9 | [BACKEND] Implement error handling | Develop comprehensive error handling with graceful degradation, retry mechanisms, and informative error reporting for product data retrieval and price scraping operations | E6 - Project Infrastructure Setup |
| S3-T10 | [BACKEND] Create caching system | Implement advanced caching system for scraped prices of Regulators and BCDs using AsyncStorage with TTL (time-to-live) for performance optimization and reduced network requests | E3 - Real-Time Price Comparison |

## Sprint 4 - Price Comparison 

| Task ID | Task Title | Description | Epic |
|---------|------------|-------------|------|
| S4-T1 | [BACKEND] Implement Visitor pattern | Develop complete visitor pattern implementation with interfaces and concrete visitors for operating on different product types (RegulatorProduct, BCDProduct, FinProduct) | E5 - Product Filtering & Selection |
| S4-T2 | [BACKEND] Create price calculator visitor | Implement specialized visitor for calculating adjusted prices for Regulators and BCDs based on diver experience levels (beginner, intermediate, advanced) with customizable discount rules | E5 - Product Filtering & Selection |
| S4-T3 | [FRONTEND] Enhance product detail view | Add comprehensive technical specifications panel to product detail screen with collapsible sections for different spec categories (e.g., breathing performance for Regulators, buoyancy features for BCDs) | E2 - UI & Frontend Implementation |
| S4-T4 | [FRONTEND] Integrate real-time price comparison | Connect price scraping results to product detail views for Regulators and BCDs with real-time updates and loading states during fetching | E3 - Real-Time Price Comparison |
| S4-T5 | [FRONTEND] Develop price visualization | Create dynamic UI components with bar charts or graphics for intuitive visual comparison between competitor prices for identical Regulator and BCD models | E3 - Real-Time Price Comparison |
| S4-T6 | [BACKEND] Implement price history | Develop system to track and store historical price data for Regulators and BCDs with timestamp-based queries for trend analysis and best purchase timing recommendations | E3 - Real-Time Price Comparison |
| S4-T7 | [FRONTEND] Create comprehensive comparison view | Implement feature comparison table with color-coded highlights for important specification differences between Regulators or between BCDs, focusing on technical performance metrics | E4 - Product Comparison Module |
| S4-T8 | [BACKEND] Add product image extraction | Implement functionality to extract, cache, and serve product images of Regulators and BCDs from various e-commerce sources with fallback options for missing images | E2 - UI & Frontend Implementation |
| S4-T9 | [BACKEND] Add offline support | Implement robust offline capabilities using persistent storage for recently viewed Regulators and BCDs and their price comparison data | E1 - Data Management & Storage |
| S4-T10 | [FRONTEND] Polish UI/UX | Refine visual styling, animations, transitions, and overall user experience based on design guidelines and usability principles | E2 - UI & Frontend Implementation |

## Sprint 5 - Testing & Finalization

| Task ID | Task Title | Description | Epic |
|---------|------------|-------------|------|
| S5-T1 | [QA] Implement unit tests | Create comprehensive test suite for core components and services with Jest, focusing on Factory (for creating Regulators and BCDs), Facade, and Visitor implementations | E6 - Project Infrastructure Setup |
| S5-T2 | [QA] Create integration tests | Develop robust integration tests for component interactions, service dependencies, and data flow between application layers, with emphasis on product filtering and price comparison workflows | E6 - Project Infrastructure Setup |
| S5-T3 | [BACKEND] Perform performance optimization | Identify and resolve performance bottlenecks in data fetching, rendering, and scraping operations through profiling and code analysis, particularly for product list rendering and filtering | E6 - Project Infrastructure Setup |
| S5-T4 | [QA] Conduct user acceptance testing | Perform structured testing with store staff and stakeholders to gather actionable feedback on real-world usage scenarios for comparing and filtering diving equipment | E6 - Project Infrastructure Setup |
| S5-T5 | [DOC] Create documentation | Develop comprehensive user manual and technical documentation covering architecture, design patterns, and code organization, including detailed explanation of product type implementations | E6 - Project Infrastructure Setup |
| S5-T6 | [FRONTEND] Apply final UI polish | Make final adjustments to visual elements, typography, spacing, and animations based on designer feedback and usability testing for optimal product showcase | E2 - UI & Frontend Implementation |
| S5-T7 | [FRONTEND] Implement error state handling | Create user-friendly error states with helpful recovery options and clear messaging for various failure scenarios during product data loading and price comparison | E6 - Project Infrastructure Setup |
| S5-T8 | [FRONTEND] Add accessibility improvements | Enhance app with proper contrast ratios, text scaling, screen reader support, and touch target sizing for better usability, especially in product comparison views | E2 - UI & Frontend Implementation |
| S5-T9 | [DEVOPS] Prepare for deployment | Configure build settings, environment variables, and finalize production deployment configuration for both backend and frontend | E6 - Project Infrastructure Setup |
| S5-T10 | [QA] Conduct SOLID principles review | Perform detailed codebase review to ensure strict adherence to all SOLID principles with documentation of compliance, especially for the product type hierarchy and visitor implementations | E6 - Project Infrastructure Setup |
| S5-T11 | [QA] Validate design pattern implementation | Verify correct implementation of Factory (for product creation), Facade (for service simplification), and Visitor patterns (for product operations) with focus on maintainability and extensibility | E6 - Project Infrastructure Setup |
| S5-T12 | [QA] Complete final testing and bug fixes | Address all remaining issues identified during testing phases with comprehensive regression testing after fixes, ensuring product filtering, comparison, and price tracking features work correctly | E6 - Project Infrastructure Setup |



