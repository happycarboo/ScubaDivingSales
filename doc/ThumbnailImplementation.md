# Product Thumbnail Implementation

This document outlines the detailed implementation of the product thumbnail feature in the ScubaDivingApp.

## Architecture Overview

The product thumbnail feature follows a clean architecture that adheres to SOLID principles:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│    UI Components    │     │   Service Facade    │     │   Product Image     │
│  (React Components) │────>│  (Central Access)   │────>│ Service (Interface) │
└─────────────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                                   │
                                                                   ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│    Image Cache      │<────│   Implementation    │<────│ Platform Strategies │
│  (Local Storage)    │     │   (Concrete Class)  │     │  (Web Scraping)     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Key Components

### 1. Interfaces

#### IProductImageService (`src/services/scraper/interfaces/IProductImageService.ts`)
The main interface defining the contract for product image services:
- `getProductImageUrl`: Gets a product image URL
- `getProductImageUri`: Gets a cached or newly downloaded product image URI
- `prefetchProductImages`: Prefetches product images for a list of products
- `clearProductImageCache`: Clears the image cache for a specific product
- `clearAllProductImageCache`: Clears all cached product images
- `shareProductImage`: Shares a cached image between similar products
- `getCachedProductImages`: Gets all cached product images

### 2. Core Classes

#### ScrapedProductImageService (`src/services/scraper/ScrapedProductImageService.ts`)
The concrete implementation of IProductImageService, using web scraping:
- Extracts image URLs using the comprehensive strategy registry
- Manages the image cache
- Includes logic to share images between similar products
- Handles error cases with fallbacks

#### ImageCache (`src/utils/ImageCache.ts`)
A utility class for caching and managing product images:
- Stores images both in memory and on the file system
- Uses a directory structure organized by product type
- Includes methods for clearing and retrieving cached images
- Implements efficient caching algorithms

#### ScubaWarehouseComprehensiveStrategy (`src/services/scraper/strategies/ScubaWarehouseComprehensiveStrategy.ts`)
The specific implementation for ScubaWarehouse:
- Extracts product images from HTML using cheerio
- Includes selectors for various image locations
- Has fallback images for known products
- Handles error cases with graceful degradation

### 3. Integration with ServiceFacade

The ServiceFacade (`src/patterns/facade/ServiceFacade.ts`) provides simplified access:
- `getProductImageUrl`: Gets a product image URL
- `getProductImageUri`: Gets a product image URI
- `prefetchProductImages`: Prefetches product images
- `shareProductImage`: Shares cached images between products
- `getCachedProductImages`: Gets all cached images
- `getProductImageServiceInstance`: Gets direct access to the service

## Implementation Details

### Image Caching Strategy

1. **Two-level Caching**:
   - **Memory Cache**: Fast access using a Map
   - **File System Cache**: Persistent storage using expo-file-system

2. **Organization by Product Type**:
   ```
   product_images_cache/
   ├── regulator/
   │   ├── 1.jpg
   │   └── 3.jpg
   ├── bcd/
   │   ├── 4.jpg
   │   └── 5.jpg
   └── general/
       ├── 2.jpg
       └── 6.jpg
   ```

3. **Cache Invalidation**:
   - Images are cached indefinitely
   - Manual methods provided for clearing cache:
     - `clearProductImageCache(productId)`: Clears one product
     - `clearAllProductImageCache()`: Clears all products

### Image Extraction and Fallbacks

1. **Primary Extraction**:
   - Uses selectors to find image tags
   - Extracts from various possible locations in the HTML

2. **Fallback Mechanism**:
   ```javascript
   // Order of fallbacks:
   1. Direct image extraction from selectors
   2. Meta tags extraction (og:image)
   3. Predefined fallback images for known products
   4. Generic fallback based on product type
   ```

3. **Error Handling**:
   - Handles 404 errors
   - Handles network issues
   - Provides placeholder UI when images can't be loaded

### Image Sharing Between Products

1. **Similar Product Detection**:
   - Products with similar names (first 5 characters)
   - Products of the same type

2. **Sharing Implementation**:
   ```javascript
   // Share image from product A to product B
   await serviceFacade.shareProductImage(productA.id, productB.id);
   ```

## UI Integration

### Product Selection Screen

The `ProductSelectionScreen` (`src/screens/ProductSelection/ProductSelectionScreen.tsx`):
- Loads and displays thumbnails for all products
- Shows loading indicators while images are being fetched
- Includes placeholders for products without images
- Refreshes images when returning to the screen using `useFocusEffect`

### Product Details Screen

The `ProductDetailsScreen` (`src/screens/ProductDetails/ProductDetailsScreen.tsx`):
- Displays a larger version of the product image
- Attempts multiple methods to find images if not already cached
- Shares found images with similar products

## Future Enhancements

1. **Firebase Storage Integration**:
   - Create a new class implementing IProductImageService
   - Use Firebase Storage for image storage
   - Replace the scraping implementation when Firebase is available

2. **Image Compression**:
   - Add image resizing for thumbnails
   - Implement different sizes for different use cases

3. **Offline Mode Improvements**:
   - Add priority queue for image loading
   - Implement prefetching based on browsing patterns

## Testing

The image functionality can be tested using:

1. **Unit Testing**:
   - Test cache operations
   - Test extraction strategies
   - Test sharing mechanism

2. **UI Testing**:
   - Test image loading with slow networks
   - Test fallback to placeholders
   - Test cached image display

## Usage Examples

### Basic Image Loading

```typescript
// In a React component
const [productImage, setProductImage] = useState<string | null>(null);

useEffect(() => {
  const loadImage = async () => {
    const imageUri = await serviceFacade.getProductImageUri(product.id);
    setProductImage(imageUri);
  };
  
  loadImage();
}, [product.id]);

// In the render function
{productImage ? (
  <Image source={{ uri: productImage }} style={styles.image} />
) : (
  <View style={styles.placeholder}>
    <Text>{product.name.charAt(0)}</Text>
  </View>
)}
```

### Advanced Usage

```typescript
// Get direct access to the service
const imageService = serviceFacade.getProductImageServiceInstance();

// Prefetch multiple images
await imageService.prefetchProductImages(['1', '2', '3']);

// Clear cache for debugging
await imageService.clearAllProductImageCache();
``` 