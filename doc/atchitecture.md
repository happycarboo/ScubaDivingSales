Project Midterm Update Report
1. Abstract
ScubaWarehouse, a leading diving gear retailer in Singapore, faces ongoing challenges in hiring experienced sales personnel due to the specialized nature of the industry. At the current midterm stage, significant progress has been achieved on the Scuba Warehouse Sales Assistant App, designed as an internal support tool for sales representatives. The foundational setup for frontend, backend, and database integration was successfully established and tested on the web, ensuring compatibility and initial functionality. The project subsequently transitioned into an MVP for iPad, validating core functionalities such as product filtering, competitor price scraping, and user interaction workflows with test data. Currently, our team is expanding product categories to include BCD and fins, alongside implementing a robust product comparison feature. This app continues to aim at enhancing customer satisfaction, improving sales efficiency, and supporting the company's strategic focus on an exceptional in-store retail experience.

2. Project Overview
The Scuba Warehouse Sales Assistant App aims to empower in-store sales representatives by providing tools for effective and informed customer interactions. Central objectives of the app include streamlined product selection through customer-driven filters such as budget and product specifications, comprehensive product comparison features, real-time competitor price tracking, and a sophisticated yet intuitive recommendation system tailored to diving experience levels. The architecture leverages React Native for frontend development, Node.js for backend operations, and Firebase as a real-time database solution. Additionally, the project employs strategic API integrations and custom web scraping modules for reliable real-time price comparison, clearly aligning with ScubaWarehouse's emphasis on delivering personalized, high-quality retail service.
 
3. Architecture

```
+----------------+     +------------------+     +---------------+     +------------------+
|   FRONTEND     |     |   API LAYER     |     |  FIREBASE DB |     | EXTERNAL SYSTEMS |
| (React Native) |     |   (Backend)     |     |              |     |                  |
+----------------+     +------------------+     +---------------+     +------------------+
|                |     |                  |     |               |     |                  |
| +-----------+ |     | +-------------+  |     | +-----------+ |     | +------------+   |
| |  Product  | |     | |   Price     |  |     | |ScubaProduct| |     | |   Web     |   |
| |Selection UI|<----->| |  Scraper   |  |     | |Gear Filter | |     | | Scraper   |   |
| +-----------+ |     | +-------------+  |     | +-----------+ |     | +------------+   |
|               |     |                  |     |               |     |                  |
| +-----------+ |     | +-------------+  |     | +-----------+ |     | +------------+   |
| | Product   | |     | |  Product    |  |     | |Realtime &  | |     | | Real-Time |   |
| |Details View|<----->| | Filtering   |  |     | |Historical  |<------>|   Sync    |   |
| +-----------+ |     | +-------------+  |     | | Prices    | |     | +------------+   |
|               |     |                  |     |               |     |                  |
| +-----------+ |     | +-------------+  |     +---------------+     +------------------+
| |Comparison | |     | |  Product    |  |            ^                      ^
| |    UI     |<----->| |Recommendations|  |            |                      |
| +-----------+ |     | +-------------+  |            |                      |
|               |     |                  |            |              +------------------+
| +-----------+ |     | +-------------+  |            |              |   EXISTING      |
| |Intelligent| |     | | Business    |  |            +------------->|   E-COMMERCE    |
| | Search    |<----->| |   Logic     |  |                           |                  |
| +-----------+ |     | +-------------+  |                           | +------------+   |
|               |     |                  |                           | | Detailed   |   |
| +-----------+ |     | +-------------+  |                           | |  Specs     |   |
| |Real-Time  | |     | |    API      |  |                           | +------------+   |
| | Price     |<----->| | Management  |  |                           |                  |
| +-----------+ |     | +-------------+  |                           +------------------+
+----------------+     +------------------+
        ^
        |
        v
   +---------+
   |Salesperson|
   |   User   |
   +---------+
```

Scuba Diving Gear App Diagram
 
Briefing
The Frontend is built using React Native, serving as the primary interaction point for sales representatives. It includes the Product Selection UI, where users filter scuba gear by customer-specific criteria. Once a product is selected, the Product Details View redirects seamlessly to the Existing E-commerce platform to display Detailed Specs, avoiding redundancy. The Comparison UI clearly illustrates differences between multiple products, supporting informed decision-making.
An optional enhancement, Intelligent Search, provides advanced capabilities to interpret summarized customer preferences or natural language inputs, potentially even from voice recordings or direct salesperson input. Complementing this, another optional module, Product Recommendations, delivers personalized product suggestions based on predefined user profiles such as beginner, intermediate, or advanced diver experience levels.
The core application logic is orchestrated by the API Layer (Backend), powered by Node.js. Centralized within this layer is the Business Logic Processing module, which acts as the main workflow controller, directing the overall data flow and processing tasks, including requests to databases and external services. The API Management Layer secures and manages these requests, handling authentication, validation, logging, and monitoring.
Data handling and storage occur primarily through the Firebase DB, optimized for real-time operations. It hosts the ScubaProduct Gear Filter, enabling quick retrieval and filtration of diving products. Additionally, Firebase manages Realtime & Historical Prices, capturing both current and historical price data for efficient and reliable comparisons.
The External Price Comparison module ensures competitive pricing by integrating external data. Its Web Scrapercollects competitor prices regularly or upon request, maintaining accurate market insights. These results feed into a Real-Time Sync process, delivering updated competitor pricing directly back to the frontend to enhance sales effectiveness and customer confidence.

