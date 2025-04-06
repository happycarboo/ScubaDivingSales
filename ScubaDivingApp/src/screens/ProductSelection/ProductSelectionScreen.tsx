import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Linking
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
  link: string;
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
        
        // Debug each product's link
        productsData.forEach((product, index) => {
          console.log(`Product ${index + 1} (${product.name}) link:`, product.link);
        });
        
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

  // Add a useEffect to log product details after they are loaded
  useEffect(() => {
    if (products.length > 0) {
      console.log('Product details for debugging:');
      products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          id: product.id,
          name: product.name,
          link: product.link,
          hasLinkProperty: 'link' in product,
          linkType: typeof product.link
        });
      });
    }
  }, [products]);

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

  // Add functions to handle checkbox selection and link opening
  const handleSelectProduct = (productId: string) => {
    // Logic to handle product selection
  };

  const handleOpenProductLink = async (link?: string) => {
    console.log('Attempting to open link:', link);
    
    // Check if link exists
    if (!link) {
      console.log('Link is undefined or empty');
      Alert.alert('Error', 'Product link is not available');
      return;
    }
    
    try {
      const supported = await Linking.canOpenURL(link);
      console.log('Is link supported?', supported);

      if (supported) {
        await Linking.openURL(link);
        console.log('Link opened successfully');
      } else {
        console.log(`Don't know how to open this URL: ${link}`);
        Alert.alert(`Don't know how to open this URL: ${link}`);
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Could not open the link.');
    }
  };

  // Render product card
  const renderProductCard = ({ item }: { item: ProductItem }) => {
    // Log the specific item being rendered
    console.log('Rendering product card for:', {
      id: item.id,
      name: item.name,
      hasLink: 'link' in item,
      link: item.link
    });
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <TouchableOpacity style={styles.selectCheckbox} onPress={() => handleSelectProduct(item.id)}>
          <Text>☑️</Text>
        </TouchableOpacity>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.productFooter}>
          <View style={styles.productCategory}>
            <Text style={styles.productCategoryText}>
              {item.specifications?.category.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              console.log('Web button clicked for product:', item.id, 'with link:', item.link);
              item.link ? handleOpenProductLink(item.link) : Alert.alert('Error', 'Product link is not available');
            }}
          >
            <Text>Web</Text>
          </TouchableOpacity>
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
          <Text style={[styles.filterButtonText, selectedType === 'regulator' && styles.selectedFilterText]}>Regulators</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'bcd' && styles.selectedFilter]}
          onPress={() => setSelectedType(selectedType === 'bcd' ? null : 'bcd')}
        >
          <Text style={[styles.filterButtonText, selectedType === 'bcd' && styles.selectedFilterText]}>BCDs</Text>
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
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  productList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  productCategoryText: {
    fontSize: 12,
    color: '#666',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default ProductSelectionScreen; 