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
import { useNavigation } from '@react-navigation/native';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductFactory } from '../../patterns/factory/ProductFactory';
import { 
  VisitableRegulatorProduct, 
  VisitableBCDProduct,
  VisitableFinProduct,
  PriceCalculatorVisitor 
} from '../../patterns/visitor/ProductVisitor';
import { ComparisonScreenNavigationProp } from '../../types/navigation';

// For demo purposes, we'll use a fixed set of products to compare
const PRODUCTS_TO_COMPARE = ['1', '2', '3'];

const ComparisonScreen = () => {
  const navigation = useNavigation<ComparisonScreenNavigationProp>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  // Service facade for simplifying API interactions
  const serviceFacade = new ServiceFacade();
  // Product factory for creating the right product type
  const productFactory = new ProductFactory();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch each product's details
        const productPromises = PRODUCTS_TO_COMPARE.map(id => 
          serviceFacade.getProductWithPriceComparison(id)
        );
        
        const productsWithPrices = await Promise.all(productPromises);
        
        // Extract just the product data
        const productsData = productsWithPrices.map(item => item.product);
        setProducts(productsData);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch products for comparison');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading products for comparison...</Text>
      </View>
    );
  }
  
  // Calculate discounted prices using the Visitor pattern
  const priceCalculator = new PriceCalculatorVisitor(experienceLevel);
  
  const getVisitableProduct = (product: any) => {
    // Create the appropriate visitable product based on type
    switch (product.type) {
      case 'regulator':
        return new VisitableRegulatorProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications
        );
      case 'bcd':
        return new VisitableBCDProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications
        );
      case 'fin':
        return new VisitableFinProduct(
          product.id,
          product.name,
          product.brand,
          product.price,
          product.specifications
        );
      default:
        throw new Error(`Unknown product type: ${product.type}`);
    }
  };
  
  // Get all specification keys across all products
  const allSpecKeys = new Set<string>();
  products.forEach(product => {
    Object.keys(product.specifications).forEach(key => {
      allSpecKeys.add(key);
    });
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.experienceSelector}>
        <Text style={styles.sectionTitle}>Diver Experience Level:</Text>
        <View style={styles.levelButtons}>
          <TouchableOpacity 
            style={[
              styles.levelButton, 
              experienceLevel === 'beginner' && styles.selectedLevelButton
            ]}
            onPress={() => setExperienceLevel('beginner')}
          >
            <Text 
              style={[
                styles.levelButtonText,
                experienceLevel === 'beginner' && styles.selectedLevelButtonText
              ]}
            >
              Beginner
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.levelButton, 
              experienceLevel === 'intermediate' && styles.selectedLevelButton
            ]}
            onPress={() => setExperienceLevel('intermediate')}
          >
            <Text 
              style={[
                styles.levelButtonText,
                experienceLevel === 'intermediate' && styles.selectedLevelButtonText
              ]}
            >
              Intermediate
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.levelButton, 
              experienceLevel === 'advanced' && styles.selectedLevelButton
            ]}
            onPress={() => setExperienceLevel('advanced')}
          >
            <Text 
              style={[
                styles.levelButtonText,
                experienceLevel === 'advanced' && styles.selectedLevelButtonText
              ]}
            >
              Advanced
            </Text>
          </TouchableOpacity>
        </View>
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
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                >
                  <Text style={styles.viewDetailsLink}>View Details</Text>
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
              <Text style={styles.cellSubLabel}>({experienceLevel} diver)</Text>
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
                    {product.specifications[specKey] !== undefined 
                      ? (Array.isArray(product.specifications[specKey]) 
                          ? product.specifications[specKey].join(', ')
                          : String(product.specifications[specKey]))
                      : '-'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  experienceSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#0066cc',
  },
  levelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedLevelButtonText: {
    color: '#fff',
  },
  comparisonTable: {
    padding: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderCell: {
    padding: 16,
    width: 180,
    minHeight: 100,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#eee',
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
  viewDetailsLink: {
    color: '#0066cc',
    fontSize: 14,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  tableCell: {
    padding: 16,
    width: 180,
    minHeight: 70,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cellSubLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
  cellValue: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  discountPrice: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  discountLabel: {
    fontSize: 12,
    color: '#cc0000',
    marginTop: 2,
  },
});

export default ComparisonScreen; 