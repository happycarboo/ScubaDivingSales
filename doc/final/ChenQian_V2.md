# Backend Development Contribution Report

## 1. Overview of Individual Contributions

### Scope of Work
- Designed and implemented the **ServiceFacade** architecture to provide unified data access
- Developed the **ProductFactory** system for dynamic product creation across multiple categories
- Built the **Firebase Integration** layer for real-time database functionality
- Implemented **multi-collection database architecture** for specialized product data

### Timeline
- **Sprint 2**: Designed database schema and built Firebase connection with repository pattern
- **Sprint 3**: Implemented ServiceFacade and Product Factory patterns
- **Sprint 4**: Developed cross-collection data management and improved error handling in backend services

## 2. Major Design Choices and Decisions

### Database Schema Design
One important design decision was how to structure the Firestore database to handle different types of diving gear efficiently.
1.	Separate Collections: Instead of putting everything in one collection, I created different ones for each product type:
•	products: Stores basic info for all products
•	regulators: Stores detailed info specific to regulators
•	bcds: Stores detailed info specific to BCDs

2.	Linked Data: Each item in a specialized collection includes a prod_id that links it back to the main product in the products collection.
3.	Optimized for Reading: I used a denormalized structure to make data loading faster, which is important since the app mainly reads product data.


### Key Patterns and Principles

- **Factory Method Pattern**: Created `ProductFactory` to handle dynamic creation of different product types without the client needing to know implementation details

  ```typescript
  // From src/patterns/factory/ProductFactory.ts - Factory creates different product types
  export class ProductFactory {
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
      // Factory decides which product object to create based on type
      if (type === 'regulator') {
        return new RegulatorProduct(id, name, brand, price, specifications, link);
      } else if (type === 'bcd') {
        return new BCDProduct(id, name, brand, price, specifications, link);
      } else if (type === 'fin') {
        return new FinProduct(id, name, brand, price, specifications, link);
      }
      
      // Generic product fallback
      return {
        id,
        type,
        name,
        brand,
        price,
        link,
        specifications,
        imageUrl,
        getDescription: () => `${brand} ${name} - ${type}`
      };
    }
  }
  ```

  ```typescript
  // From src/components/ProductCard.tsx - Client works with products through interface
  const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.imageUrl || 'https://via.placeholder.com/200'}
          alt={product.name}
          sx={{ objectFit: 'contain', p: 2 }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.brand}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.type}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };
  ```

## 3. UML Diagrams

```
┌─────────────┐     ┌─────────────────┐     ┌───────────────┐
│ Application │────►│  ServiceFacade  │────►│ IFirebaseService │
│   Screens   │     └────────┬────────┘     └───────┬───────┘
└─────────────┘              │                      │
                             │                      │
                             ▼                      ▼
                   ┌───────────────────┐    ┌──────────────┐
                   │ IProductRepository│◄───►│ FirebaseService │
                   └─────────┬─────────┘    └──────────────┘
                             │                      │
                             │                      ▼
                             │             ┌──────────────────┐
                             │             │ Firestore Database │
                             │             └─────────┬────────┘
                             │                       │
                             │        ┌─────────────┼─────────────┐
                             │        │             │             │
                             │        ▼             ▼             ▼
                             │ ┌─────────────┐ ┌──────────┐ ┌──────────┐
                             │ │ products    │ │regulators│ │  bcds    │
                             │ └─────────────┘ └──────────┘ └──────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  ProductFactory │
                    └─────────────────┘
```

## 4. Software Engineering Principles Applied

### SOLID Principles Application
- **SRP (Single Responsibility)**: Each service component has a single responsibility. This separation ensures that each class has a single reason to change, improving maintainability and reducing the risk of bugs.
  ```typescript
  // FirebaseService handles only database operations (SRP)
  class FirebaseService implements IFirebaseService {
    async initialize(): Promise<void> {
      // Firebase-specific initialization only
    }
    
    getFirestore(): Firestore {
      // Returns Firestore instance only
    }
  }
  
  // ProductRepository handles only product data operations (SRP)
  class ProductRepository implements IProductRepository {
    // Collection constants show clear responsibility boundaries
    private readonly PRODUCTS_COLLECTION = 'products';
    private readonly REGULATORS_COLLECTION = 'regulators';
    private readonly BCDS_COLLECTION = 'bcds';
    
    async getProductsByType(type: string): Promise<Product[]> {
      // Product data operations only
    }
  }
  ```

- **OCP (Open-Closed)**: Multi-collection system allows adding new product types without modifying core code
  ```typescript
  // Adding support for new product types by creating new interfaces (OCP)
  export interface RegulatorDetails {
    prod_id: string;
    category: string;
    temperature: string;
    high_pressure_port: number;
    low_pressure_port: number;
    // Other regulator-specific properties
  }
  
  export interface BCDDetails {
    prod_id: string;
    category: string;
    type: string;
    weight_pocket: string;
    // Other BCD-specific properties
  }
  
  // New product types can be added without changing existing repository code
  ```

- **DIP (Dependency Inversion)**: High-level modules depend on abstractions, not concrete implementations.
  ```typescript
  // ServiceFacade depends on interfaces, not concrete implementations (DIP)
  export class ServiceFacade {
    private firebaseService: IFirebaseService; // Interface dependency
    private productRepository: IProductRepository; // Interface dependency
    
    // ServiceFacade depends on abstractions, not concrete classes
    async getRegulatorDetails(productId: string): Promise<RegulatorDetails | null> {
      // Using the repository through its interface
      return await this.productRepository.getRegulatorDetails(productId);
    }
  }
  ```

### DRY Implementation
- Created reusable error handling in the ProductRepository for multi-collection operations
  ```typescript
  // DRY: Common error handling logic used across many methods
  async getRegulatorDetails(productId: string): Promise<RegulatorDetails | null> {
    try {
      const db = await this.getFirestore();
      console.log(`Attempting to fetch regulator details for product ID ${productId}`);
      const regulatorDoc = doc(db, this.REGULATORS_COLLECTION, productId);
      const docSnap = await getDoc(regulatorDoc);

      if (!docSnap.exists()) {
        console.log(`No regulator details found for product ID ${productId}`);
        return null;
      }

      // Processing document data
      const data = docSnap.data();
      // Return regulator details
    } catch (error) {
      // Reused error handling pattern
      console.error(`Error getting regulator details for product ID ${productId}:`, error);
      throw error;
    }
  }
  ```

- Implemented cascading delete operations for related records across multiple collections
  ```typescript
  // DRY: Reusable delete operation pattern across collections
  async deleteProduct(id: string): Promise<void> {
    try {
      const db = await this.getFirestore();
      // First delete the main product
      await deleteDoc(doc(db, this.PRODUCTS_COLLECTION, id));
      
      // Also try to delete related records if they exist
      try {
        await deleteDoc(doc(db, this.REGULATORS_COLLECTION, id));
        console.log(`Deleted regulator details for product ID ${id}`);
      } catch (error) {
        console.log(`No regulator details found for product ID ${id}`);
      }
      
      try {
        await deleteDoc(doc(db, this.BCDS_COLLECTION, id));
        console.log(`Deleted BCD details for product ID ${id}`);
      } catch (error) {
        console.log(`No BCD details found for product ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
  ```

## 5. Notable Features Implemented

### Multi-Collection Database Architecture
- Designed a scalable multi-collection architecture in Firestore that allows for:
  * Storing common product information in a core products collection
  * Storing specialized data in type-specific collections (regulators, bcds)
  * Efficient querying of products by type
  * Cross-collection joins for comprehensive product details
- Technical challenge: Designing an architecture that balances query performance with data consistency
- Business value: Enables rich, specialized product information while maintaining query performance

### Cross-Collection Data Management
- Implemented robust cross-collection data operations for comprehensive product management
- Created cascading delete operations to maintain data integrity across collections
- Developed specialized query methods for retrieving detailed product information
- Technical challenge: Implementing proper error handling for operations that span multiple collections
- Business value: Provides a complete view of products with all their specialized attributes for better customer experience

## 6. Test Plan and Statistics

### Testing Approach
- **Equivalence Partitioning**: Grouped Firebase data operations into categories
  * Multi-collection read operations (get product + specialized details)
  * Cross-collection write operations (create/update with specialized data)
  * Error conditions (missing documents, permission errors, validation errors)

- **Boundary Value Analysis**: Tested multi-collection service limits
  * Empty collections (0 items)
  * Single-item collections (1 product)
  * Missing specialized data (product exists but no regulator/BCD details)
  * Service initialization states (before initialization, after initialization)

- **Pair-wise Testing**: Created test combinations for multi-collection operations
  * Different product types with various specialized attributes
  * Different cross-collection query combinations
  * Various error scenarios across multiple collections