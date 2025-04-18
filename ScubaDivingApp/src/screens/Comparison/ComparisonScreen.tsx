import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductFactory } from '../../patterns/factory/ProductFactory';
import { 
  VisitableRegulatorProduct, 
  VisitableBCDProduct,
  VisitableFinProduct,
  PriceCalculatorVisitor 
} from '../../patterns/visitor/ProductVisitor';
import { ComparisonScreenNavigationProp } from '../../types/navigation';

// For fallback if no products are passed
const DEFAULT_PRODUCTS_TO_COMPARE = ['1', '2', '3'];

const ComparisonScreen = () => {
  const navigation = useNavigation<ComparisonScreenNavigationProp>();
  const route = useRoute<any>();
  
  // Get products from navigation params or use default IDs
  const selectedProducts = route.params?.selectedProducts || [];
  const hasSelectedProducts = selectedProducts.length > 0;
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Service facade for simplifying API interactions
  const serviceFacade = ServiceFacade.getInstance();
  // Product factory for creating the right product type
  const productFactory = new ProductFactory();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let productsToDisplay: any[] = [];
        
        if (hasSelectedProducts) {
          // If we have selected products, use them directly
          productsToDisplay = selectedProducts;
          setProducts(productsToDisplay);
          setLoading(false);
        } else {
          // Otherwise fetch default products
          const productPromises = DEFAULT_PRODUCTS_TO_COMPARE.map(id => 
            serviceFacade.getProductWithPriceComparison(id)
          );
          
          const productsWithPrices = await Promise.all(productPromises);
          
          // Extract just the product data
          productsToDisplay = productsWithPrices.map(item => item.product);
          setProducts(productsToDisplay);
          setLoading(false);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch products for comparison');
        console.error(error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [hasSelectedProducts, selectedProducts]);
  
  const handleViewDetails = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };
  
  const handleBackToSelection = () => {
    navigation.goBack();
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading products for comparison...</Text>
      </View>
    );
  }
  
  // Calculate discounted prices using the Visitor pattern
  const priceCalculator = new PriceCalculatorVisitor('intermediate');
  
  const getVisitableProduct = (product: any) => {
    // Create the appropriate visitable product based on type
    switch (product.type) {
      case 'regulator':
        return new VisitableRegulatorProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications,
          product.link || ''
        );
      case 'bcd':
        return new VisitableBCDProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications,
          product.link || ''
        );
      case 'fin':
        return new VisitableFinProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications,
          product.link || ''
        );
      default:
        throw new Error(`Unknown product type: ${product.type}`);
    }
  };
  
  // Get all specification keys across all products
  const allSpecKeys = new Set<string>();
  products.forEach(product => {
    Object.keys(product.specifications || {}).forEach(key => {
      allSpecKeys.add(key);
    });
  });
  
  return (
    <View style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepNumber}>3</Text>
        </View>
        <Text style={styles.stepText}>Compare specifications and pricing</Text>
      </View>
      
      <ScrollView horizontal={true} style={styles.scrollContainer}>
        <View style={styles.comparisonTable}>
          {/* Header row with product names */}
          <View style={styles.tableRow}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Features</Text>
            </View>
            {products.map(product => (
              <View key={product.id} style={styles.tableHeaderCell}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewDetails(product.id)}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Type row */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.cellLabel}>Type</Text>
            </View>
            {products.map(product => (
              <View key={product.id} style={styles.tableCell}>
                <Text style={styles.cellValue}>{product.type.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          
          {/* Regular price row */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.cellLabel}>Regular Price</Text>
            </View>
            {products.map(product => (
              <View key={product.id} style={styles.tableCell}>
                <Text style={styles.cellValue}>${product.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          {/* Discounted price row - using Visitor pattern */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.cellLabel}>Your Price</Text>
            </View>
            {products.map(product => {
              const visitableProduct = getVisitableProduct(product);
              const discountedPrice = visitableProduct.accept(priceCalculator);
              const hasDiscount = discountedPrice < product.price;
              
              return (
                <View key={product.id} style={styles.tableCell}>
                  <Text style={[styles.cellValue, styles.discountPrice]}>
                    ${discountedPrice.toFixed(2)}
                  </Text>
                  {hasDiscount && (
                    <Text style={styles.discountLabel}>
                      Save ${(product.price - discountedPrice).toFixed(2)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Specification rows */}
          {Array.from(allSpecKeys).map(specKey => (
            <View key={specKey} style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.cellLabel}>
                  {specKey.charAt(0).toUpperCase() + specKey.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
              </View>
              {products.map(product => (
                <View key={product.id} style={styles.tableCell}>
                  <Text style={styles.cellValue}>
                    {product.specifications && specKey in product.specifications 
                      ? String(product.specifications[specKey])
                      : '-'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToSelection}
        >
          <Text style={styles.backButtonText}>Back to Selection</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  comparisonTable: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 0,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableHeaderCell: {
    width: 180,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  tableCell: {
    width: 180,
    padding: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#e6f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewDetailsButtonText: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 14,
  },
  viewDetailsLink: {
    color: '#0066cc',
    marginTop: 4,
    fontSize: 14,
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cellSubLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cellValue: {
    fontSize: 14,
    color: '#444',
  },
  discountPrice: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  discountLabel: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  backButton: {
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ComparisonScreen; 