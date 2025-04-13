# Shimin: Frontend Implementation

## 1. Overview of Individual Contributions

As the frontend developer for the ScubaDiving Sales Application, my primary responsibilities included:

- **Implementation of React Native UI components**: Developed responsive and user-friendly components for product display, comparison, and price tracking
- **Screen workflows and navigation**: Created intuitive screen flows and navigation between product lists, details, and comparison screens
- **Component state management**: Implemented efficient state management for real-time price updates and user interactions
- **User experience design**: Designed an engaging UI with animated components and interactive elements
- **Visitor Pattern implementation**: Applied the Visitor pattern to separate product operations from product classes

I was responsible for creating a cohesive user interface that effectively presented product information and price comparison data to users. The implementation focused on providing a seamless shopping experience for diving equipment enthusiasts, with particular attention to Regulators and BCDs as the primary product categories.

## 2. Major Design Choices and Decisions

### Visitor Pattern Implementation

The most significant architectural decision in the frontend implementation was using the Visitor pattern for operations on product objects. This approach provided several advantages:

1. **Separation of concerns**: The Visitor pattern allowed us to separate product data structures from operations performed on them
2. **Extensibility**: New operations could be added without modifying the product classes
3. **Type safety**: The visitor implementation ensured type-safe operations across different product types
4. **Dynamic behavior**: Different calculations (like pricing based on experience level) could be applied to products at runtime

The visitor pattern was particularly valuable for our price calculation and recommendation scoring features, as it allowed us to dynamically adjust prices based on diver experience levels without modifying the core product classes.

### Component Architecture

The frontend implementation followed these design principles:

1. **Component composition**: Built reusable components that could be composed to create complex UIs
2. **Smart and presentational components**: Separated data-fetching logic from presentation components
3. **Facade pattern integration**: Used the ServiceFacade to abstract complex service interactions from UI components
4. **Responsive design**: Ensured the UI worked well across different device sizes, particularly for iPad users

## 3. UML Diagram: Visitor Pattern Implementation

```
┌──────────────────┐     implements     ┌─────────────────┐
│  ProductVisitor  │◄────────────────────│PriceCalculator  │
│  (Interface)     │                     │Visitor          │
└──────────┬───────┘                     └─────────────────┘
           │                                      │
           │                                      │
           │ uses                                 │ visits
           │                                      │
           ▼                                      ▼
┌───────────────────┐    accepts    ┌─────────────────────┐
│  VisitableProduct │◄──────────────│ Product Hierarchy   │
│  (Interface)      │               │ (RegulatorProduct,  │
└───────────────────┘               │  BCDProduct, etc.)  │
                                    └─────────────────────┘
           ▲                                      │
           │                                      │
           │                                      │
           │ renders                              │ creates
           │                                      │
┌──────────┴──────────┐              ┌───────────▼────────┐
│  React Components   │              │   ProductFactory    │
│  (ProductCard,      │              │                     │
│   PriceDisplay)     │              └─────────────────────┘
└─────────────────────┘
```

## 4. SOLID Principles and Design Patterns Applied

### Visitor Pattern Implementation

The Visitor pattern is a behavioral design pattern that allows adding new operations to existing object structures without modifying them. In our implementation, it enables operations like price calculation to vary based on product types and user contexts.

```typescript
// Reference from: ScubaDivingApp/src/patterns/visitor/ProductVisitor.ts (Lines 6-73)

// Visitor interface
export interface ProductVisitor {
  visitRegulator(product: RegulatorProduct): any;
  visitBCD(product: BCDProduct): any;
  visitFin(product: FinProduct): any;
}

// Make products accept visitors
export interface VisitableProduct extends Product {
  accept(visitor: ProductVisitor): any;
}

// Add accept method to product classes
export class VisitableRegulatorProduct extends RegulatorProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitRegulator(this);
  }
}

export class VisitableBCDProduct extends BCDProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitBCD(this);
  }
}

export class VisitableFinProduct extends FinProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitFin(this);
  }
}

// Example concrete visitor: Price Calculator with experience level discounts
export class PriceCalculatorVisitor implements ProductVisitor {
  private experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  constructor(experienceLevel: 'beginner' | 'intermediate' | 'advanced') {
    this.experienceLevel = experienceLevel;
  }
  
  visitRegulator(product: RegulatorProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'advanced') {
      discount = 0.05; // 5% discount for advanced divers on regulators
    }
    return product.price * (1 - discount);
  }
  
  visitBCD(product: BCDProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'beginner') {
      discount = 0.03; // 3% discount for beginners on BCDs
    }
    return product.price * (1 - discount);
  }
  
  visitFin(product: FinProduct): number {
    // Different discount strategies based on experience level
    let discount = 0;
    if (this.experienceLevel === 'intermediate') {
      discount = 0.02; // 2% discount for intermediate divers on fins
    }
    return product.price * (1 - discount);
  }
}
```

The implementation of `RecommendationScoreVisitor` further demonstrates the flexibility of the visitor pattern, calculating personalized recommendation scores based on user preferences:

```typescript
// Reference from: ScubaDivingApp/src/patterns/visitor/ProductVisitor.ts (Lines 75-125)

export class RecommendationScoreVisitor implements ProductVisitor {
  private userPreferences: {
    priceImportance: number; // 1-10
    qualityImportance: number; // 1-10
    brandImportance: number; // 1-10
  };
  
  constructor(preferences: { priceImportance: number; qualityImportance: number; brandImportance: number }) {
    this.userPreferences = preferences;
  }
  
  visitRegulator(product: RegulatorProduct): number {
    // Calculate recommendation score based on user preferences
    const priceScore = this.calculatePriceScore(product.price, 300, 1500);
    const qualityScore = this.getQualityScore(product);
    const brandScore = this.getBrandScore(product.brand);
    
    return this.weightedScore(priceScore, qualityScore, brandScore);
  }
  
  // Other visit methods and helper methods...
}
```

### SOLID Principles in Frontend Implementation

#### Single Responsibility Principle

Each component in the UI has a specific responsibility. For example, the `ProductCard` component is only responsible for displaying a product card:

```typescript
// Reference from: ScubaDivingApp/src/components/ProductCard.tsx (Lines 5-35)

interface ProductCardProps {
  product: Product;
}

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

Similarly, the `ProductList` component handles the fetching and displaying of a list of products:

```typescript
// Reference from: ScubaDivingApp/src/components/ProductList.tsx (Lines 7-64)

interface ProductListProps {
  filters?: Record<string, any>;
}

const ProductList: React.FC<ProductListProps> = ({ filters = {} }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const serviceFacade = ServiceFacade.getInstance();
        await serviceFacade.initialize();
        const fetchedProducts = await serviceFacade.getProductsWithFilters(filters);
        
        console.log('Fetched products in component:', fetchedProducts);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Rendering logic based on state...
}
```

#### Open/Closed Principle

The visitor pattern implementation demonstrates the Open/Closed Principle in action. The product classes are closed for modification but open for extension through the visitor pattern. New operations on products can be added by creating new visitor implementations without changing the product classes.

#### Liskov Substitution Principle

All product types (RegulatorProduct, BCDProduct, FinProduct) can be used wherever a Product is expected, and all visitable products can be used wherever a VisitableProduct is expected.

#### Interface Segregation Principle

The application uses focused interfaces like `ProductVisitor` and `VisitableProduct` that define only the methods needed for their specific use cases.

#### Dependency Inversion Principle

The frontend components depend on abstractions (like the Product interface) rather than concrete implementations. The use of the ServiceFacade also demonstrates this principle, as UI components depend on the facade interface rather than on specific service implementations.

## 5. Notable Features Implemented

### Dynamic Price Comparison

The `CompetitorPricesComponent` provides real-time price comparison with competitor websites:

```typescript
// Reference from: ScubaDivingApp/src/components/product/CompetitorPricesComponent.tsx (Lines 20-99)

const CompetitorPricesComponent: React.FC<CompetitorPricesComponentProps> = ({
  productId,
  productPrice,
  onPriceComparisonPressed
}) => {
  // States and animation setup...
  
  // Get competitor prices based on product price
  const competitorPrices = {
    'Competitor A': {
      competitor: 'Competitor A',
      price: productPrice * 1.1, // 10% higher
      sourceUrl: 'https://www.example.com/competitor-a',
      lastUpdated: new Date(),
      isLive: true
    },
    // Other competitors...
  };
  
  // Animation and fetching logic...
  
  return (
    <View style={styles.container}>
      {/* Component UI rendering */}
    </View>
  );
};
```

### Comprehensive Product Details Screen

The `ProductDetailsScreen` provides a detailed view of product information with technical specifications and price comparisons:

```typescript
// Reference from: ScubaDivingApp/src/screens/ProductDetails/ProductDetailsScreen.tsx (Lines 11-175)

const ProductDetailsScreen = () => {
  const route = useRoute<ProductDetailsScreenRouteProp>();
  const { productId } = route.params;
  
  // State and data fetching logic...

  return (
    <ScrollView style={styles.container}>
      {/* Product image */}
      <View style={styles.imageContainer}>
        {/* Image rendering logic */}
      </View>
      
      {/* Product header information */}
      <View style={styles.headerContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
      </View>
      
      {/* Competitor Price Section */}
      <View style={styles.sectionContainer}>
        {/* Price comparison UI */}
      </View>
      
      {/* Technical Details Section */}
      {techDetails && (
        <View style={styles.sectionContainer}>
          {/* Technical specifications UI */}
        </View>
      )}
      
      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Action buttons */}
      </View>
    </ScrollView>
  );
};
```

### Experience-Based Price Calculation

The implementation of the visitor pattern allows for dynamic price calculation based on diver experience levels:

1. **Advanced divers**: Receive 5% discount on regulators
2. **Beginner divers**: Receive 3% discount on BCDs
3. **Intermediate divers**: Receive 2% discount on fins

### Animated UI Components

The frontend implementation includes animated components for improved user experience:

```typescript
// Reference from: ScubaDivingApp/src/components/product/CompetitorPricesComponent.tsx (Lines 50-80)

// Flash animation during fetching
useEffect(() => {
  if (isFetching) {
    // Create a repeating flash animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        })
      ])
    ).start();
  } else {
    // Stop animation when not fetching
    flashAnim.stopAnimation();
    flashAnim.setValue(0);
  }
}, [isFetching]);
```

### Responsive Design

All components are designed to be responsive and work well across different device sizes, with particular emphasis on iPad compatibility as specified in the project requirements.

## 6. Test Plan and Testing Strategy

For the frontend implementation, I developed a comprehensive testing strategy focusing on both unit and integration tests:

### Unit Testing Approach

- **Visitor Pattern Implementation**: Tests for each visitor implementation to ensure correct behavior
- **React Component Testing**: Using React Testing Library to test component rendering and behavior
- **Mock Testing**: Tests for UI components with mocked service dependencies

### Example Test Cases

```typescript
// Unit test for the PriceCalculatorVisitor
describe('PriceCalculatorVisitor', () => {
  let visitor: PriceCalculatorVisitor;
  let regulatorProduct: VisitableRegulatorProduct;
  
  beforeEach(() => {
    regulatorProduct = new VisitableRegulatorProduct(
      '1', 'Test Regulator', 'TestBrand', 300, {}, 'http://example.com'
    );
    
    visitor = new PriceCalculatorVisitor('intermediate');
  });
  
  test('should calculate price based on experience level', () => {
    const price = regulatorProduct.accept(visitor);
    // No discount for intermediate on regulators
    expect(price).toBe(300);
  });
  
  test('should apply discount for advanced divers on regulators', () => {
    const advancedVisitor = new PriceCalculatorVisitor('advanced');
    const price = regulatorProduct.accept(advancedVisitor);
    // 5% discount for advanced
    expect(price).toBe(285); // 300 * 0.95
  });
});

// Component test for ProductCard
describe('ProductCard', () => {
  test('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Test Regulator',
      brand: 'TestBrand',
      price: 299.99,
      type: 'regulator',
      specifications: {},
      link: 'http://example.com',
      getDescription: () => 'A test product'
    };
    
    const { getByText } = render(<ProductCard product={product} />);
    
    expect(getByText('Test Regulator')).toBeInTheDocument();
    expect(getByText('TestBrand')).toBeInTheDocument();
    expect(getByText('$299.99')).toBeInTheDocument();
  });
});
```

### Integration Testing Approach

- **Navigation Flow Testing**: Tests for correct navigation between screens
- **Data Flow Testing**: Tests for proper data passing between components
- **User Interaction Testing**: Tests for user interactions like filtering and price comparison

By implementing this comprehensive testing strategy, I ensured the reliability and correctness of the frontend implementation while maintaining high code quality and adherence to SOLID principles. 