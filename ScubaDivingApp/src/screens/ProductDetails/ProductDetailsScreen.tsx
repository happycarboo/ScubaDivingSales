import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductFactory } from '../../patterns/factory/ProductFactory';
import { RootStackParamList, ProductDetailsScreenNavigationProp } from '../../types/navigation';
import CompetitorPricesComponent from '../../components/product/CompetitorPricesComponent';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const ProductDetailsScreen = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const { productId } = route.params;
  
  const [product, setProduct] = useState<any>(null);
  const [competitorPrices, setCompetitorPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Service facade for simplifying API interactions
  const serviceFacade = ServiceFacade.getInstance();
  // Product factory for creating the right product type
  const productFactory = new ProductFactory();
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const result = await serviceFacade.getProductWithPriceComparison(productId);
        setProduct(result.product);
        setCompetitorPrices(result.competitorPrices);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch product details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  const handleComparePress = () => {
    navigation.navigate('RealTimeComparison');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }
  
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Use the factory to create a proper product object for displaying
  const productInstance = productFactory.createProduct(
    product.type,
    product.id,
    product.name,
    product.brand,
    product.price,
    product.specifications
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>{productInstance.brand}</Text>
        <Text style={styles.name}>{productInstance.name}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Our Price</Text>
        <Text style={styles.price}>${productInstance.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{productInstance.getDescription()}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        {Object.entries(productInstance.specifications).map(([key, value]) => (
          <View key={key} style={styles.specRow}>
            <Text style={styles.specKey}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
            <Text style={styles.specValue}>
              {Array.isArray(value) 
                ? value.join(', ') 
                : typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : String(value)}
            </Text>
          </View>
        ))}
      </View>
      
      <CompetitorPricesComponent 
        productId={productId}
        productPrice={productInstance.price}
        onPriceComparisonPressed={handleComparePress}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#cc0000',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  brand: {
    fontSize: 18,
    color: '#666',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  priceContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  specKey: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  specValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default ProductDetailsScreen; 