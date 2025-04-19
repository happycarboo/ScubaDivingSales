import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  AppState,
  AppStateStatus,
  InteractionManager,
  Modal,
  SafeAreaView,
  Button
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, useIsFocused } from '@react-navigation/native';
import { ProductFactory } from '../../patterns/factory/ProductFactory';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductSelectionScreenNavigationProp } from '../../types/navigation';
import { WebView } from 'react-native-webview';

// Types
type ProductItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  getDescription(): string;
  link: string;
  imageUrl?: string | null;
};

const ProductSelectionScreen = () => {
  const navigation = useNavigation<ProductSelectionScreenNavigationProp>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  
  // Check if we received filtered products from previous screen
  const filteredProductsFromNav = route.params?.filteredProducts;
  
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState<Record<string, boolean>>({});
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});
  
  // State for the WebView
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(false);

  // Create instances of our patterns
  const productFactory = new ProductFactory();
  // Use ServiceFacade singleton
  const serviceFacade = ServiceFacade.getInstance();

  // Focus effect to ensure the screen always loads properly when it gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - ensuring data is loaded');
      
      // If screen is blank or products not loaded, force a reload
      if (filteredProducts.length === 0 && !loading) {
        console.log('No products found on focus - reloading data');
        loadInitialData();
      }
      
      return () => {
        // Clean up any resources on unfocus
      };
    }, [isFocused, filteredProducts.length, loading])
  );

  // Initial data loading
  useEffect(() => {
    loadInitialData();
  }, [filteredProductsFromNav]);

  // Load initial data function
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      if (filteredProductsFromNav) {
        console.log('Using filtered products from navigation:', filteredProductsFromNav.length);
        
        // Before setting the products, initialize image loading states for products without imageUrl
        const loadingStates: Record<string, boolean> = {};
        filteredProductsFromNav.forEach(product => {
          loadingStates[product.id] = !product.imageUrl; // Only set to loading if no image URL exists
        });
        setImagesLoading(loadingStates);
        
        setProducts(filteredProductsFromNav);
        setFilteredProducts(filteredProductsFromNav);
        
        // Get cached images right away
        const images = await serviceFacade.getCachedProductImages();
        setCachedImages(images);
        
        // Immediately trigger image loading for products without images
        loadProductImages(filteredProductsFromNav, images);
      } else {
        console.log('Fetching products from Firebase...');
        const productsData = await serviceFacade.getProductsWithFilters({});
        console.log('Products fetched:', productsData.length);
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Load cached images
        const images = await serviceFacade.getCachedProductImages();
        setCachedImages(images);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch products. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Create a separate function for loading product images that can be called directly
  const loadProductImages = async (productsToLoad = products, existingCache: Record<string, string> = {}) => {
    if (productsToLoad.length === 0) return;
    
    try {
      console.log('Loading product images for', productsToLoad.length, 'products');
      
      // Use existing loading states or create new ones
      const loadingStates = {...imagesLoading};
      productsToLoad.forEach((product: ProductItem) => {
        if (loadingStates[product.id] === undefined) {
          loadingStates[product.id] = true;
        }
      });
      setImagesLoading(loadingStates);
      
      // Use provided cache or get all cached images
      const cachedImages = Object.keys(existingCache).length > 0 
        ? existingCache
        : await serviceFacade.getCachedProductImages();
      
      setCachedImages(cachedImages);
      
      // Group products by type to help with sharing images
      const productsByType: Record<string, ProductItem[]> = {};
      productsToLoad.forEach(product => {
        if (!productsByType[product.type]) {
          productsByType[product.type] = [];
        }
        productsByType[product.type].push(product);
      });
      
      // Load images for each product
      const updatedProducts = await Promise.all(
        productsToLoad.map(async product => {
          // Skip if we already have the image in cache
          if (cachedImages[product.id]) {
            loadingStates[product.id] = false;
            setImagesLoading({...loadingStates});
            return { ...product, imageUrl: cachedImages[product.id] };
          }
          
          // Skip if product already has an image URL
          if (product.imageUrl) {
            loadingStates[product.id] = false;
            setImagesLoading({...loadingStates});
            return product;
          }
          
          // Try to get the image
          const imageUrl = await serviceFacade.getProductImageUri(product.id, product.link);
          loadingStates[product.id] = false;
          setImagesLoading({...loadingStates});
          
          // If we got an image, try to share with similar products of the same type
          if (imageUrl && productsByType[product.type]) {
            const similarProducts = productsByType[product.type].filter(p => 
              p.id !== product.id && !cachedImages[p.id] && 
              (p.name.includes(product.name.slice(0, 5)) || product.name.includes(p.name.slice(0, 5)))
            );
            
            for (const similarProduct of similarProducts) {
              await serviceFacade.shareProductImage(product.id, similarProduct.id);
            }
          }
          
          // Return a new product object with the image URL
          return {
            ...product,
            imageUrl
          };
        })
      );
      
      // Update products with image URLs
      setProducts(currentProducts => {
        // Map through current products and update them with new image URLs
        return currentProducts.map(product => {
          const updatedProduct = updatedProducts.find(p => p.id === product.id);
          return updatedProduct || product;
        });
      });
      
      setFilteredProducts(currentFiltered => {
        return currentFiltered.map(product => {
          const updatedProduct = updatedProducts.find(p => p.id === product.id);
          return updatedProduct || product;
        });
      });
      
      console.log('Product images loaded');
    } catch (error) {
      console.error('Error loading product images:', error);
    }
  };

  // Modify the useEffect for image loading to use the new function
  useEffect(() => {
    if (products.length === 0) return;
    loadProductImages();
  }, [products.length]);

  // Apply search filter when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(
      product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Manage selected products for comparison
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prevSelected => {
      // If already selected, remove it
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      }
      
      // If we already have 3 selected products, alert the user
      if (prevSelected.length >= 3) {
        Alert.alert(
          'Maximum Selection',
          'You can compare up to 3 products at a time. Please deselect a product before adding another.',
          [{ text: 'OK' }]
        );
        return prevSelected;
      }
      
      // Otherwise, add it
      return [...prevSelected, productId];
    });
  };

  // Navigate to product details
  const handleProductPress = (product: ProductItem) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  // Navigate to comparison view with selected products
  const handleComparePress = () => {
    if (selectedProducts.length === 0) {
      Alert.alert(
        'No Products Selected',
        'Please select at least one product to compare.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Get the selected product objects
    const productsToCompare = products.filter(product => 
      selectedProducts.includes(product.id)
    );
    
    navigation.navigate('Comparison', { 
      selectedProducts: productsToCompare
    });
  };

  // Navigate back to filter screen
  const handleBackToFilters = () => {
    navigation.navigate('IntelligentSearch');
  };

  // WebView approach for external links
  const handleOpenLink = (product: ProductItem) => {
    if (product.link) {
      console.log('Opening URL in WebView:', product.link);
      setWebViewUrl(product.link);
      setWebViewVisible(true);
      setWebViewLoading(true);
    } else {
      Alert.alert('No link available', 'This product does not have an external link.');
    }
  };

  // Render a product card
  const renderProductCard = ({ item }: { item: ProductItem }) => {
    const isSelected = selectedProducts.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, isSelected && styles.selectedProductCard]} 
        onPress={() => toggleProductSelection(item.id)}
        activeOpacity={0.7}
      >
        {/* Selection indicator */}
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.checkCircle, 
            isSelected && styles.checkedCircle
          ]}>
            {isSelected && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        </View>

        {/* Product image */}
        <View style={styles.imageContainer}>
          {imagesLoading[item.id] ? (
            <ActivityIndicator size="small" color="#0066cc" style={styles.loader} />
          ) : item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.productImage} 
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{item.name.substring(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Product details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleProductPress(item)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.redirectButton}
              onPress={() => handleOpenLink(item)}
            >
              <Text style={styles.redirectButtonText}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <Text style={styles.stepText}>Select products to compare</Text>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or brand..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Products count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} Products {filteredProductsFromNav ? '(Filtered)' : ''}
        </Text>
        <Text style={styles.selectionCount}>
          {selectedProducts.length}/3 Selected
        </Text>
      </View>
      
      {/* Product list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          extraData={[selectedProducts, cachedImages]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No products found. Try a different search or filter.
              </Text>
            </View>
          }
        />
      )}
      
      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToFilters}
        >
          <Text style={styles.backButtonText}>Back to Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.compareButton,
            selectedProducts.length === 0 && styles.disabledButton
          ]}
          onPress={handleComparePress}
          disabled={selectedProducts.length === 0}
        >
          <Text style={styles.compareButtonText}>
            Compare {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* WebView for showing external links */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={webViewVisible}
        onRequestClose={() => setWebViewVisible(false)}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.webViewCloseButton}
              onPress={() => setWebViewVisible(false)}
            >
              <Text style={styles.webViewCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.webViewTitle} numberOfLines={1}>
              {webViewUrl}
            </Text>
          </View>
          
          {webViewLoading && (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#0066cc" />
            </View>
          )}
          
          <WebView
            source={{ uri: webViewUrl }}
            style={styles.webView}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  // WebView styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webViewCloseButton: {
    padding: 10,
  },
  webViewCloseText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webViewTitle: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  // Original styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0066cc',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedProductCard: {
    borderColor: '#0066cc',
    borderWidth: 2,
    shadowColor: '#0066cc',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    borderColor: '#0066cc',
    backgroundColor: '#0066cc',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  detailsContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e6f0ff',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  detailsButtonText: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 14,
  },
  redirectButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redirectButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
  compareButton: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b3d1ff',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductSelectionScreen; 