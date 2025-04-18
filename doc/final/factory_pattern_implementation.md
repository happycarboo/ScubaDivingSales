# Factory Design Pattern Implementation in ScubaDivingApp

## Overview of Factory Pattern

The Factory Method design pattern is a creational pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. It addresses the problem of creating objects without specifying the exact class of the object that will be created.

In the ScubaDivingApp, the Factory pattern has been implemented to standardize the creation of different product types (Regulators, BCDs, Fins) while ensuring consistent structure and behavior.

## Key Implementation Files

The primary implementation of the Factory pattern in ScubaDivingApp is found in:

- **`src/patterns/factory/ProductFactory.ts`**: Contains the product interfaces and factory implementation

## Core Factory Pattern Structure

### Product Interface

At the core of the Factory pattern is the `Product` interface, which defines the common structure for all product types:

```typescript
// src/patterns/factory/ProductFactory.ts
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
```

### Concrete Product Classes

The application implements specific product types as concrete classes:

```typescript
// src/patterns/factory/ProductFactory.ts
export class RegulatorProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;
  link: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>, link: string) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'regulator';
    this.specifications = specs;
    this.link = link;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - A reliable regulator for your diving needs`;
  }
}

export class BCDProduct implements Product {
  // Similar implementation...
  
  getDescription(): string {
    return `${this.brand} ${this.name} - A comfortable BCD with excellent buoyancy control`;
  }
}

export class FinProduct implements Product {
  // Similar implementation...
  
  getDescription(): string {
    return `${this.brand} ${this.name} - High-performance fins for optimal propulsion`;
  }
}
```

### Product Factory

The `ProductFactory` class is responsible for creating the appropriate product instances:

```typescript
// src/patterns/factory/ProductFactory.ts
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

## Application Use Throughout the Codebase

### 1. Product Creation in Service Layer

The factory pattern is extensively used in the service layer to create product objects from various data sources:

```typescript
// src/services/firebase/repositories/ProductRepository.ts (conceptual example)
import { Product, ProductFactory } from '../../../patterns/factory/ProductFactory';

export class ProductRepository implements IProductRepository {
  private factory = new ProductFactory();
  
  async getProduct(id: string): Promise<Product> {
    try {
      // Fetch raw data from Firebase
      const doc = await firestore().collection('products').doc(id).get();
      const data = doc.data();
      
      if (!data) {
        throw new Error(`Product not found: ${id}`);
      }
      
      // Use factory to create the appropriate product instance
      return this.factory.createProduct(
        data.type,
        id,
        data.name,
        data.brand,
        data.price,
        data.link || '',
        data.specifications || {},
        data.imageUrl
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
  
  async getAllProducts(): Promise<Product[]> {
    try {
      const snapshot = await firestore().collection('products').get();
      
      // Use factory to create product instances
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return this.factory.createProduct(
          data.type,
          doc.id,
          data.name,
          data.brand,
          data.price,
          data.link || '',
          data.specifications || {},
          data.imageUrl
        );
      });
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }
}
```

### 2. Integration with Service Facade

The factory pattern integrates with the Service Facade to provide a consistent creation method across different parts of the application:

```typescript
// src/patterns/facade/ServiceFacade.ts (conceptual example)
import { Product, ProductFactory } from '../factory/ProductFactory';

export class ServiceFacade {
  private static instance: ServiceFacade;
  private productFactory: ProductFactory;
  
  private constructor() {
    // Initialize factory
    this.productFactory = new ProductFactory();
  }
  
  // Create product from external data source
  async createProductFromExternalSource(
    externalData: any,
    productType: string
  ): Promise<Product> {
    try {
      // Generate a new unique ID
      const id = await this.generateUniqueId();
      
      // Map external data to our product structure
      const product = this.productFactory.createProduct(
        productType,
        id,
        externalData.title || 'Unknown Product',
        externalData.manufacturer || 'Unknown Brand',
        parseFloat(externalData.price) || 0,
        externalData.productUrl || '',
        {
          // Map external specifications to our format
          material: externalData.material,
          weight: externalData.weight,
          // Other specifications
        },
        externalData.imageUrl
      );
      
      // Save to database
      await this.productRepository.createProduct(product);
      
      return product;
    } catch (error) {
      console.error('Error creating product from external source:', error);
      throw error;
    }
  }
}
```

### 3. Product Display Components

The factory pattern helps components render products consistently:

```typescript
// src/components/product/ProductCard.tsx (conceptual example)
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../../patterns/factory/ProductFactory';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
    >
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>{product.type.toUpperCase()}</Text>
        </View>
      )}
      
      <View style={styles.details}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.description}>{product.getDescription()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Styles...
});

export default ProductCard;
```

### 4. Integration with Mock Data Services

The factory pattern allows for creating consistent test data:

```typescript
// src/services/mock/MockProductService.ts (conceptual example)
import { Product, ProductFactory } from '../../patterns/factory/ProductFactory';

export class MockProductService {
  private factory: ProductFactory;
  
  constructor() {
    this.factory = new ProductFactory();
  }
  
  getMockProducts(): Product[] {
    return [
      this.factory.createProduct(
        'regulator',
        '1',
        'MK25 EVO/S620 Ti',
        'ScubaPro',
        999.99,
        'https://example.com/product/1',
        {
          qualityScore: 9,
          temperature: 'Cold water',
          high_pressure_port: 2,
          low_pressure_port: 5
        },
        'https://example.com/images/regulator1.jpg'
      ),
      this.factory.createProduct(
        'bcd',
        '2',
        'Hydros Pro',
        'ScubaPro',
        799.99,
        'https://example.com/product/2',
        {
          qualityScore: 8,
          type: 'Jacket',
          weight_pocket: 'Yes',
          weight_kg: 2.7
        },
        'https://example.com/images/bcd1.jpg'
      ),
      // More mock products...
    ];
  }
}
```

## Benefits of the Factory Pattern in ScubaDivingApp

### 1. Consistent Product Creation

The factory ensures all products have the required fields and methods regardless of their type:

```typescript
// All products created by the factory are guaranteed to have:
// - id, type, name, brand, price, specifications, link
// - getDescription() method
```

### 2. Simplified Product Creation

The factory centralizes the logic for creating different types of products:

```typescript
// Without factory:
let product;
if (type === 'regulator') {
  product = new RegulatorProduct(id, name, brand, price, specs, link);
} else if (type === 'bcd') {
  product = new BCDProduct(id, name, brand, price, specs, link);
} else if (type === 'fin') {
  product = new FinProduct(id, name, brand, price, specs, link);
}

// With factory:
const product = factory.createProduct(type, id, name, brand, price, link, specs);
```

### 3. Decoupling

The factory pattern decouples the code that creates objects from the code that uses them:

```typescript
// Component doesn't need to know how to create products
function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // Component only knows about the Product interface,
    // not how to create different product types
    async function fetchProducts() {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    }
    
    fetchProducts();
  }, []);
  
  // Render products...
}
```

### 4. Extensibility

Adding new product types doesn't require changing existing code:

```typescript
// Adding a new product type is simple:
export class MaskProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;
  link: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>, link: string) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'mask';
    this.specifications = specs;
    this.link = link;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - A clear view underwater`;
  }
}
```

## Factory Pattern Extensions

### Enhanced Factory with Type-Specific Creation Methods

The application could be enhanced with a more sophisticated factory that has specific methods for each product type:

```typescript
// Enhanced ProductFactory concept
export class EnhancedProductFactory {
  createRegulator(
    id: string,
    name: string,
    brand: string,
    price: number,
    specifications: {
      temperature?: string;
      high_pressure_port?: number;
      low_pressure_port?: number;
      adjustable_airflow?: 'YES' | 'NO';
      // Other regulator-specific specs
    },
    link: string,
    imageUrl?: string
  ): RegulatorProduct {
    return new RegulatorProduct(id, name, brand, price, specifications, link);
  }
  
  createBCD(
    id: string,
    name: string,
    brand: string,
    price: number,
    specifications: {
      type?: 'Backplate' | 'Jacket';
      weight_pocket?: 'Yes' | 'No';
      weight_kg?: number;
      // Other BCD-specific specs
    },
    link: string,
    imageUrl?: string
  ): BCDProduct {
    return new BCDProduct(id, name, brand, price, specifications, link);
  }
  
  // More type-specific methods...
  
  // Generic method that delegates to type-specific methods
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
    switch (type) {
      case 'regulator':
        return this.createRegulator(id, name, brand, price, specifications, link, imageUrl);
      case 'bcd':
        return this.createBCD(id, name, brand, price, specifications, link, imageUrl);
      case 'fin':
        return this.createFin(id, name, brand, price, specifications, link, imageUrl);
      // More cases...
      default:
        // Return a generic product
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
}
```

## Integration with Other Patterns

### Factory and Visitor Integration

The Factory and Visitor patterns work together effectively:

```typescript
// Creating products with factory and applying visitor
const factory = new ProductFactory();
const product = factory.createProduct(
  'regulator',
  '1',
  'Pro Regulator',
  'ScubaPro',
  499.99,
  'https://example.com',
  { qualityScore: 9 }
);

// Converting to visitable product
const visitableProduct = new VisitableRegulatorProduct(
  product.id,
  product.name,
  product.brand,
  product.price,
  product.specifications,
  product.link
);

// Applying visitor
const priceVisitor = new PriceCalculatorVisitor('advanced');
const discountedPrice = visitableProduct.accept(priceVisitor);
```

### Factory and Facade Integration

The Facade pattern can leverage the Factory pattern internally:

```typescript
// Service facade using factory to create products
class ServiceFacade {
  private productFactory: ProductFactory;
  
  constructor() {
    this.productFactory = new ProductFactory();
  }
  
  async createNewProduct(data: any): Promise<Product> {
    // Validate data
    this.validateProductData(data);
    
    // Generate ID
    const id = this.generateUniqueId();
    
    // Create product using factory
    const product = this.productFactory.createProduct(
      data.type,
      id,
      data.name,
      data.brand,
      data.price,
      data.link,
      data.specifications,
      data.imageUrl
    );
    
    // Save to repository
    await this.productRepository.createProduct(product);
    
    return product;
  }
}
```

## Testing the Factory Pattern

Testing the Factory pattern is straightforward since it centralizes object creation:

```typescript
// Example unit test for ProductFactory
test('creates regulator product with correct type', () => {
  // Arrange
  const factory = new ProductFactory();
  
  // Act
  const product = factory.createProduct(
    'regulator',
    '1',
    'Test Regulator',
    'Test Brand',
    499.99,
    'https://example.com',
    { qualityScore: 9 }
  );
  
  // Assert
  expect(product.type).toBe('regulator');
  expect(product.name).toBe('Test Regulator');
  expect(product.brand).toBe('Test Brand');
  expect(product.price).toBe(499.99);
  expect(product.getDescription()).toContain('Test Regulator');
  expect(product.getDescription()).toContain('Test Brand');
});
```

## Conclusion

The Factory pattern in ScubaDivingApp provides a robust and flexible way to create different types of product objects while ensuring they adhere to a consistent interface. This pattern enhances maintainability by centralizing object creation logic and supporting the Single Responsibility and Open/Closed principles.

The implementation demonstrates how a relatively simple Factory pattern can support a wide range of use cases across the application, from data loading to rendering components. It also shows how the Factory pattern can effectively integrate with other patterns like Visitor and Facade to create a cohesive architectural approach.

By using the Factory pattern, the application can more easily adapt to new product types and changing requirements without requiring extensive modifications to existing code. 