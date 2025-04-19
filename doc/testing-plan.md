# ScubaDivingApp Testing Plan

## Overview

This document outlines a simplified testing strategy for the ScubaDivingApp structured around three core components:

1. **Backend Testing**: Firebase services and data repositories
2. **Frontend Testing**: UI components and user workflows
3. **Service Testing**: Price scraping functionality

## 1. Backend Testing

Backend testing focuses on Firebase services, data repositories, and the application's data layer.

### Core Firebase Services

**Test Focus:**
- Firebase initialization and connection
- Singleton pattern implementation
- Error handling for service disruptions

**Example Tests:**
```javascript
describe('FirebaseService', () => {
  beforeEach(() => {
    // Mock Firebase dependencies
    jest.spyOn(firebase, 'initializeApp').mockReturnValue({});
    jest.spyOn(firebase, 'getFirestore').mockReturnValue({});
    
    // Reset singleton instance
    FirebaseService._instance = null;
  });
  
  test('initializes Firebase correctly', async () => {
    const service = FirebaseService.getInstance();
    await service.initialize();
    
    expect(firebase.initializeApp).toHaveBeenCalledWith(expect.any(Object));
    expect(firebase.getFirestore).toHaveBeenCalled();
    expect(service.isInitialized()).toBe(true);
  });
  
  test('maintains singleton pattern', () => {
    const instance1 = FirebaseService.getInstance();
    const instance2 = FirebaseService.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('handles initialization errors', async () => {
    jest.spyOn(firebase, 'initializeApp').mockImplementation(() => {
      throw new Error('Firebase error');
    });
    
    const service = FirebaseService.getInstance();
    await expect(service.initialize()).rejects.toThrow('Firebase error');
  });
});
```

### Product Repository

**Test Focus:**
- CRUD operations for products
- Data transformation between Firestore and domain models
- Cross-collection operations (regulators, BCDs)
- Error handling for database operations

**Example Tests:**
```javascript
describe('ProductRepository', () => {
  let repository;
  let mockFirestore;
  
  beforeEach(() => {
    // Mock Firestore and its methods
    mockFirestore = {
      collection: jest.fn(),
      doc: jest.fn()
    };
    
    // Create repository with mocked dependencies
    repository = new ProductRepository();
    repository.getFirestore = jest.fn().mockResolvedValue(mockFirestore);
  });
  
  test('getAllProducts transforms data correctly', async () => {
    const mockSnapshot = {
      forEach: jest.fn((callback) => {
        callback({
          id: 'test-id',
          data: () => ({
            brand: 'TestBrand',
            model: 'Test Regulator',
            price: 299.99,
            type: 'regulator'
          }),
          exists: () => true
        });
      })
    };
    
    mockFirestore.collection.mockReturnValue({
      getDocs: jest.fn().mockResolvedValue(mockSnapshot)
    });
    
    const products = await repository.getAllProducts();
    
    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('test-id');
    expect(products[0].name).toBe('Test Regulator');
    expect(products[0].brand).toBe('TestBrand');
    expect(products[0].price).toBe(299.99);
  });
  
  test('getRegulatorDetails retrieves specialized product data', async () => {
    const mockRegulator = {
      exists: () => true,
      data: () => ({
        prod_id: 'test-id',
        high_pressure_port: 2,
        low_pressure_port: 4
      })
    };
    
    mockFirestore.doc.mockReturnValue({
      getDoc: jest.fn().mockResolvedValue(mockRegulator)
    });
    
    const details = await repository.getRegulatorDetails('test-id');
    
    expect(details).not.toBeNull();
    expect(details.prod_id).toBe('test-id');
    expect(details.high_pressure_port).toBe(2);
  });
  
  test('deleteProduct removes data from all collections', async () => {
    const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
    
    mockFirestore.doc.mockReturnValue({
      deleteDoc: mockDeleteDoc
    });
    
    await repository.deleteProduct('test-id');
    
    // Should attempt to delete from all three collections
    expect(mockFirestore.doc).toHaveBeenCalledWith(expect.any(String), 'products', 'test-id');
    expect(mockFirestore.doc).toHaveBeenCalledWith(expect.any(String), 'regulators', 'test-id');
    expect(mockFirestore.doc).toHaveBeenCalledWith(expect.any(String), 'bcds', 'test-id');
  });
});
```

### Service Facade

**Test Focus:**
- Service orchestration and coordination
- Data transformation between repository and UI
- Error handling and fallback strategies

**Example Tests:**
```javascript
describe('ServiceFacade', () => {
  let facade;
  let mockRepository;
  
  beforeEach(() => {
    // Mock repository
    mockRepository = {
      getAllProducts: jest.fn(),
      getProductsByType: jest.fn(),
      getProduct: jest.fn(),
      getRegulatorDetails: jest.fn(),
      getBCDDetails: jest.fn()
    };
    
    // Create facade with mocked dependencies
    facade = ServiceFacade.getInstance();
    facade.productRepository = mockRepository;
  });
  
  test('getProductsWithFilters uses correct repository method', async () => {
    // Setup mocks
    mockRepository.getAllProducts.mockResolvedValue([/* mock products */]);
    mockRepository.getProductsByType.mockResolvedValue([/* mock filtered products */]);
    
    // Test with no filter
    await facade.getProductsWithFilters({});
    expect(mockRepository.getAllProducts).toHaveBeenCalled();
    
    // Test with type filter
    await facade.getProductsWithFilters({ type: 'regulator' });
    expect(mockRepository.getProductsByType).toHaveBeenCalledWith('regulator');
  });
  
  test('getProductWithTechDetails returns correct tech details based on product type', async () => {
    // Mock regulator product
    const regulatorProduct = { id: 'reg1', type: 'regulator' };
    mockRepository.getProduct.mockResolvedValue(regulatorProduct);
    mockRepository.getRegulatorDetails.mockResolvedValue({ high_pressure_port: 2 });
    
    // Test regulator details
    const result = await facade.getProductWithTechDetails('reg1');
    expect(result.product).toBe(regulatorProduct);
    expect(result.techDetails).toHaveProperty('high_pressure_port', 2);
    expect(mockRepository.getRegulatorDetails).toHaveBeenCalledWith('reg1');
  });
});
```

## 2. Frontend Testing

Frontend testing focuses on UI components, user interactions, and visual presentation.

### UI Components

**Test Focus:**
- Component rendering with various props
- User interactions (taps, swipes, inputs)
- Visual elements and styling

**Example Tests:**
```javascript
describe('ProductCard', () => {
  test('renders product information correctly', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Test Regulator',
      brand: 'TestBrand',
      price: 299.99,
      type: 'regulator'
    };
    
    const { getByText } = render(<ProductCard product={mockProduct} />);
    
    expect(getByText('Test Regulator')).toBeVisible();
    expect(getByText('TestBrand')).toBeVisible();
    expect(getByText('$299.99')).toBeVisible();
  });
  
  test('renders price comparison when available', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Test Regulator',
      price: 299.99
    };
    
    const mockPrices = {
      'Competitor A': 319.99,
      'Competitor B': 289.99
    };
    
    const { getByText } = render(
      <ProductCard 
        product={mockProduct} 
        competitorPrices={mockPrices} 
      />
    );
    
    expect(getByText('Competitor A: $319.99')).toBeVisible();
    expect(getByText('Competitor B: $289.99')).toBeVisible();
  });
});

describe('TechnicalDetails', () => {
  test('renders regulator details correctly', () => {
    const mockDetails = {
      high_pressure_port: 2,
      low_pressure_port: 4,
      temperature: 'Cold water'
    };
    
    const { getByText } = render(
      <TechnicalDetails 
        productType="regulator"
        details={mockDetails}
      />
    );
    
    expect(getByText('High Pressure Port: 2')).toBeVisible();
    expect(getByText('Low Pressure Port: 4')).toBeVisible();
    expect(getByText('Temperature Rating: Cold water')).toBeVisible();
  });
});
```

### User Workflows

**Test Focus:**
- Navigation between screens
- Data loading and display
- User interactions across multiple components

**Example Tests:**
```javascript
describe('Product Browsing Flow', () => {
  test('user can browse and filter products', async () => {
    // Mock data
    const mockProducts = [
      { id: '1', name: 'Regulator A', type: 'regulator' },
      { id: '2', name: 'BCD B', type: 'bcd' }
    ];
    
    // Mock service facade
    jest.spyOn(ServiceFacade.getInstance(), 'getProductsWithFilters')
      .mockResolvedValue(mockProducts);
    
    const { getByText, getAllByTestId, getByTestId } = render(<ProductCatalogScreen />);
    
    // Wait for products to load
    await waitFor(() => {
      expect(getAllByTestId('product-card').length).toBe(2);
    });
    
    // Filter by type
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByText('Regulators'));
    
    // Mock filtered results
    ServiceFacade.getInstance().getProductsWithFilters.mockResolvedValue([mockProducts[0]]);
    
    fireEvent.press(getByTestId('apply-filter'));
    
    // Check filtered results
    await waitFor(() => {
      expect(getAllByTestId('product-card').length).toBe(1);
      expect(getByText('Regulator A')).toBeVisible();
    });
  });
  
  test('user can view product details', async () => {
    // Mock navigation
    const navigate = jest.fn();
    const mockNavigation = { navigate };
    
    // Mock product
    const mockProduct = { id: '1', name: 'Regulator A', type: 'regulator' };
    
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        navigation={mockNavigation}
      />
    );
    
    // Navigate to details
    fireEvent.press(getByTestId('product-card'));
    
    expect(navigate).toHaveBeenCalledWith(
      'ProductDetail',
      { productId: '1' }
    );
  });
});
```

## 3. Price Scraping Service Testing

Service testing focuses on the price scraping functionality that enables competitor price comparison.

### Price Extraction

**Test Focus:**
- HTML/JSON parsing from competitor websites
- Price normalization and formatting
- Error handling for site structure changes

**Example Tests:**
```javascript
describe('PriceScraperService', () => {
  let service;
  
  beforeEach(() => {
    service = new PriceScraperService();
    global.fetch = jest.fn();
  });
  
  test('extracts price from HTML correctly', async () => {
    // Mock HTML response with price information
    const mockHtml = `
      <div class="product-page">
        <span class="price">$299.99</span>
      </div>
    `;
    
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml)
    });
    
    const price = await service.extractPriceFromHtml(
      'http://example.com/product',
      '.price',
      /\$([0-9.]+)/
    );
    
    expect(price).toBe(299.99);
  });
  
  test('handles missing price elements gracefully', async () => {
    // Mock HTML without price information
    const mockHtml = `<div class="product-page"></div>`;
    
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml)
    });
    
    const price = await service.extractPriceFromHtml(
      'http://example.com/product',
      '.price',
      /\$([0-9.]+)/
    );
    
    expect(price).toBeNull();
  });
  
  test('handles network errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    const price = await service.extractPriceFromHtml(
      'http://example.com/product',
      '.price',
      /\$([0-9.]+)/
    );
    
    expect(price).toBeNull();
    // Should log error
    expect(console.error).toHaveBeenCalled();
  });
});
```

### Competitor Price Comparison

**Test Focus:**
- Multi-source price aggregation
- Price caching and retrieval
- Integration with product display

**Example Tests:**
```javascript
describe('Competitor Price Comparison', () => {
  let service;
  
  beforeEach(() => {
    service = new PriceScraperService();
    
    // Mock extraction methods
    service.extractPriceFromCompetitorA = jest.fn().mockResolvedValue(319.99);
    service.extractPriceFromCompetitorB = jest.fn().mockResolvedValue(289.99);
    service.extractPriceFromCompetitorC = jest.fn().mockResolvedValue(309.99);
  });
  
  test('aggregates prices from multiple sources', async () => {
    const result = await service.fetchCompetitorPrices(
      'test-id',
      'Test Regulator',
      'TestBrand'
    );
    
    expect(Object.keys(result).length).toBe(3);
    expect(result['Competitor A'].price).toBe(319.99);
    expect(result['Competitor B'].price).toBe(289.99);
    expect(result['Competitor C'].price).toBe(309.99);
  });
  
  test('caches fetched prices', async () => {
    const productId = 'test-id';
    
    // Fetch prices
    const prices = await service.fetchCompetitorPrices(
      productId,
      'Test Regulator',
      'TestBrand'
    );
    
    // Get cached prices
    const cached = await service.getLastFetchedPrices(productId);
    
    expect(cached).toEqual(prices);
  });
  
  test('continues with partial results when some sources fail', async () => {
    // Make one competitor fail
    service.extractPriceFromCompetitorB.mockRejectedValue(new Error('Failed'));
    
    const result = await service.fetchCompetitorPrices(
      'test-id',
      'Test Regulator',
      'TestBrand'
    );
    
    // Should still have prices from other competitors
    expect(Object.keys(result).length).toBe(2);
    expect(result['Competitor A'].price).toBe(319.99);
    expect(result['Competitor C'].price).toBe(309.99);
  });
});
```

### Integration with User Interface

**Test Focus:**
- Real-time price fetching during product viewing
- UI updates with scraped prices
- Handling loading states and errors

**Example Tests:**
```javascript
describe('Price Comparison in UI', () => {
  test('product detail shows price comparison', async () => {
    // Mock price data
    const mockPrices = {
      'Competitor A': { price: 319.99, url: 'http://example.com/a' },
      'Competitor B': { price: 289.99, url: 'http://example.com/b' }
    };
    
    // Mock service facade
    jest.spyOn(ServiceFacade.getInstance(), 'getProductWithPriceComparison')
      .mockResolvedValue({
        product: { id: '1', name: 'Test Regulator', price: 299.99 },
        competitorPrices: mockPrices
      });
    
    const { getByText, getByTestId } = render(
      <ProductDetailScreen route={{ params: { productId: '1' } }} />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Test Regulator')).toBeVisible();
      expect(getByText('$299.99')).toBeVisible();
    });
    
    // Check competitor prices
    expect(getByText('Competitor A: $319.99')).toBeVisible();
    expect(getByText('Competitor B: $289.99')).toBeVisible();
    
    // Check price comparison section
    const savingsText = getByTestId('savings-text');
    expect(savingsText).toHaveTextContent('Save up to $10.00');
  });
  
  test('shows loading state while fetching prices', async () => {
    // Create a delayed promise to test loading state
    let resolvePromise;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    // Mock service with delayed response
    jest.spyOn(ServiceFacade.getInstance(), 'getProductWithPriceComparison')
      .mockReturnValue(delayedPromise);
    
    const { getByTestId } = render(
      <ProductDetailScreen route={{ params: { productId: '1' } }} />
    );
    
    // Should show loading indicator
    expect(getByTestId('price-loading-indicator')).toBeVisible();
    
    // Resolve the promise
    resolvePromise({
      product: { id: '1', name: 'Test Regulator', price: 299.99 },
      competitorPrices: {}
    });
    
    // Loading indicator should disappear
    await waitFor(() => {
      expect(queryByTestId('price-loading-indicator')).toBeNull();
    });
  });
});
```

## 4. Testing Infrastructure

### Required Libraries

- Jest: Core testing framework
- @testing-library/react-native: UI component testing
- jest-fetch-mock: For mocking HTTP requests
- firebase-mock: For mocking Firebase interactions

### Setup Instructions

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-fetch-mock firebase-mock
   ```

2. Configure Jest in `jest.config.js`:
   ```javascript
   module.exports = {
     preset: 'react-native',
     setupFilesAfterEnv: ['./jest.setup.js'],
     transformIgnorePatterns: [
       'node_modules/(?!(react-native|@react-native|react-navigation)/)'
     ],
     collectCoverage: true,
     coverageThreshold: {
       global: {
         statements: 70,
         branches: 70,
         functions: 70,
         lines: 70
       }
     }
   };
   ```

3. Create `jest.setup.js` with global mocks:
   ```javascript
   import '@testing-library/jest-native/extend-expect';
   import { cleanup } from '@testing-library/react-native';
   import fetchMock from 'jest-fetch-mock';

   // Configure fetch mock
   fetchMock.enableMocks();

   // Clean up after each test
   afterEach(cleanup);

   // Mock Firebase
   jest.mock('firebase/app', () => ({
     initializeApp: jest.fn(),
     getFirestore: jest.fn()
   }));

   jest.mock('firebase/firestore', () => ({
     collection: jest.fn(),
     getDocs: jest.fn(),
     doc: jest.fn(),
     getDoc: jest.fn(),
     query: jest.fn(),
     where: jest.fn(),
     setDoc: jest.fn(),
     updateDoc: jest.fn(),
     deleteDoc: jest.fn()
   }));
   ```

### Implementation Plan

1. **Week 1:** Set up testing infrastructure and implement core backend tests
2. **Week 2:** Implement frontend component and workflow tests
3. **Week 3:** Implement price scraping service tests
4. **Week 4:** Integration testing and test coverage improvements 