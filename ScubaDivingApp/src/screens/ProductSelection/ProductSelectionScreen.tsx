import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
};

const ProductSelectionScreen = () => {
  const navigation = useNavigation<ProductSelectionScreenNavigationProp>();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Create instances of our patterns
  const productFactory = new ProductFactory();
  // Use ServiceFacade singleton
  const serviceFacade = ServiceFacade.getInstance();

  useEffect(() => {
    // Fetch products using the Service Facade
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from Firebase...');
        const productsData = await serviceFacade.getProductsWithFilters({});
        console.log('Products fetched:', productsData);
        setProducts(productsData);
        setFilteredProducts(productsData);
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
  }, []);

  // Apply filters when search query or other filters change
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    // Apply product type filter
    if (selectedType) {
      filtered = filtered.filter(product => product.type === selectedType);
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, priceRange, selectedType, products]);

  // Navigate to product details
  const handleProductPress = (product: ProductItem) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  // Navigate to comparison view with selected products
  const handleComparePress = () => {
    navigation.navigate('Comparison');
  };

  // Navigate to intelligent search
  const handleIntelligentSearchPress = () => {
    navigation.navigate('IntelligentSearch');
  };

  // Render product card
  const renderProductCard = ({ item }: { item: ProductItem }) => {
    // Use the factory to create the appropriate product type
    const product = productFactory.createProduct(
      item.type,
      item.id,
      item.name,
      item.brand,
      item.price,
      item.specifications
    );

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productPrice}>${product.price}</Text>
        <Text style={styles.productDescription}>{product.getDescription()}</Text>
        <View style={styles.productType}>
          <Text style={styles.productTypeText}>{item.type.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or brand..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'regulator' && styles.selectedFilter]}
          onPress={() => setSelectedType(selectedType === 'regulator' ? null : 'regulator')}
        >
          <Text style={styles.filterButtonText}>Regulators</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'bcd' && styles.selectedFilter]}
          onPress={() => setSelectedType(selectedType === 'bcd' ? null : 'bcd')}
        >
          <Text style={styles.filterButtonText}>BCDs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'fin' && styles.selectedFilter]}
          onPress={() => setSelectedType(selectedType === 'fin' ? null : 'fin')}
        >
          <Text style={styles.filterButtonText}>Fins</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleComparePress}
        >
          <Text style={styles.actionButtonText}>Compare Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleIntelligentSearchPress}
        >
          <Text style={styles.actionButtonText}>Intelligent Search</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products match your search</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  filterButtonText: {
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  productType: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  productTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProductSelectionScreen; 