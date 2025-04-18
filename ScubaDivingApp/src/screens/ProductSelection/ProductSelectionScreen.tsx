import React, { useState, useEffect, useCallback } from 'react';
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
  Image
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { ProductFactory } from '../../patterns/factory/ProductFactory';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductSelectionScreenNavigationProp } from '../../types/navigation';

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
  imageUri?: string | null;
};

const ProductSelectionScreen = () => {
  const navigation = useNavigation<ProductSelectionScreenNavigationProp>();
  const route = useRoute<any>();
  
  // Check if we received filtered products from previous screen
  const filteredProductsFromNav = route.params?.filteredProducts;
  
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState<Record<string, boolean>>({});
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});

  // Create instances of our patterns
  const productFactory = new ProductFactory();
  // Use ServiceFacade singleton
  const serviceFacade = ServiceFacade.getInstance();

  useEffect(() => {
    // Fetch products only if we don't have filtered products from navigation
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (filteredProductsFromNav) {
          console.log('Using filtered products from navigation:', filteredProductsFromNav.length);
          setProducts(filteredProductsFromNav);
          setFilteredProducts(filteredProductsFromNav);
        } else {
          console.log('Fetching products from Firebase...');
          const productsData = await serviceFacade.getProductsWithFilters({});
          console.log('Products fetched:', productsData.length);
          setProducts(productsData);
          setFilteredProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert(
          'Error',
          'Failed to fetch products. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filteredProductsFromNav]);

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
          ) : item.imageUri ? (
            <Image 
              source={{ uri: item.imageUri }} 
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
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
  },
  detailsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e6f0ff',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 14,
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