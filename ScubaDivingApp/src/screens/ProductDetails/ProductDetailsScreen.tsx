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
import { RegulatorDetails, BCDDetails } from '../../services/firebase/repositories/ProductRepository';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

interface TechDetails {
  regulator?: RegulatorDetails;
  bcd?: BCDDetails;
}

const ProductDetailsScreen = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const { productId } = route.params;
  
  const [product, setProduct] = useState<any>(null);
  const [techDetails, setTechDetails] = useState<TechDetails>({});
  const [competitorPrices, setCompetitorPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Service facade for simplifying API interactions
  const serviceFacade = ServiceFacade.getInstance();
  // Product factory for creating the right product type
  const productFactory = new ProductFactory();
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        let debugText = `Starting fetch for product ID: ${productId}\n`;
        
        // Log if we're using real Firebase
        debugText += `Using real Firebase: ${serviceFacade.isUsingRealFirebase()}\n`;
        
        // Fetch basic product data with price comparison
        const result = await serviceFacade.getProductWithPriceComparison(productId);
        setProduct(result.product);
        setCompetitorPrices(result.competitorPrices);
        
        debugText += `Product basic data fetched: ${result.product.name}\n`;
        debugText += `Product type: ${result.product.type}\n`;
        
        // Fetch technical details based on product type
        if (result.product.type === 'regulator') {
          try {
            debugText += `Attempting to fetch regulator details...\n`;
            const regulatorDetails = await serviceFacade.getRegulatorDetails(productId);
            debugText += regulatorDetails 
              ? `Regulator details received: ${JSON.stringify(regulatorDetails)}\n` 
              : `No regulator details found\n`;
              
            if (regulatorDetails) {
              setTechDetails({ regulator: regulatorDetails });
            } else {
              debugText += `Using mock regulator details instead\n`;
              setTechDetails({
                regulator: {
                  prod_id: productId,
                  category: 'regulator',
                  temperature: 'Cold water',
                  high_pressure_port: result.product.id === '1' ? 2 : result.product.id === '2' ? 1 : 2,
                  low_pressure_port: result.product.id === '1' ? 5 : result.product.id === '2' ? 4 : 3,
                  adjustable_airflow: result.product.id === '1' ? 'YES' : 'NO',
                  pre_dive_mode: result.product.id === '1' || result.product.id === '3' ? 'YES' : 'NO',
                  weights_base_on_yoke: result.product.id === '1' ? 1310 : result.product.id === '2' ? 871 : 1041,
                  material: result.product.id === '1' ? 'Carbon fibre front' : result.product.id === '2' ? 'Chrome Plated' : 'Satin',
                  dive_type: result.product.id === '1' ? 'Recreational / Tech / Contaminated' : 'Recreational',
                  airflow_at_200bar: result.product.id === '1' ? '1800 l/min' : result.product.id === '2' ? '1400 l/min' : '1500 l/min'
                }
              });
            }
          } catch (error) {
            console.error('Error fetching regulator details:', error);
            debugText += `Error fetching regulator details: ${error}\n`;
            // Use mock data if there's an error with Firebase
            setTechDetails({
              regulator: {
                prod_id: productId,
                category: 'regulator',
                temperature: 'Cold water',
                high_pressure_port: result.product.id === '1' ? 2 : result.product.id === '2' ? 1 : 2,
                low_pressure_port: result.product.id === '1' ? 5 : result.product.id === '2' ? 4 : 3,
                adjustable_airflow: result.product.id === '1' ? 'YES' : 'NO',
                pre_dive_mode: result.product.id === '1' || result.product.id === '3' ? 'YES' : 'NO',
                weights_base_on_yoke: result.product.id === '1' ? 1310 : result.product.id === '2' ? 871 : 1041,
                material: result.product.id === '1' ? 'Carbon fibre front' : result.product.id === '2' ? 'Chrome Plated' : 'Satin',
                dive_type: result.product.id === '1' ? 'Recreational / Tech / Contaminated' : 'Recreational',
                airflow_at_200bar: result.product.id === '1' ? '1800 l/min' : result.product.id === '2' ? '1400 l/min' : '1500 l/min'
              }
            });
          }
        } else if (result.product.type === 'bcd') {
          try {
            debugText += `Attempting to fetch BCD details...\n`;
            const bcdDetails = await serviceFacade.getBCDDetails(productId);
            debugText += bcdDetails 
              ? `BCD details received: ${JSON.stringify(bcdDetails)}\n` 
              : `No BCD details found\n`;
              
            if (bcdDetails) {
              setTechDetails({ bcd: bcdDetails });
            } else {
              debugText += `Using mock BCD details instead\n`;
              setTechDetails({
                bcd: {
                  prod_id: productId,
                  category: 'BCD',
                  type: result.product.id === '5' ? 'Backplate' : 'Jacket',
                  weight_pocket: 'Yes',
                  quick_release: result.product.id === '5' ? 'No' : 'Yes',
                  no_pockets: 2,
                  back_trim_pocket: 'Yes',
                  weight_kg: result.product.id === '4' ? 2.7 : result.product.id === '5' ? 2.3 : 2.8,
                  has_size: 'Yes',
                  lift_capacity_base_on_largest_size_kg: result.product.id === '4' ? 17.3 : result.product.id === '5' ? 13.2 : 16.3
                }
              });
            }
          } catch (error) {
            console.error('Error fetching BCD details:', error);
            debugText += `Error fetching BCD details: ${error}\n`;
            // Use mock data if there's an error with Firebase
            setTechDetails({
              bcd: {
                prod_id: productId,
                category: 'BCD',
                type: result.product.id === '5' ? 'Backplate' : 'Jacket',
                weight_pocket: 'Yes',
                quick_release: result.product.id === '5' ? 'No' : 'Yes',
                no_pockets: 2,
                back_trim_pocket: 'Yes',
                weight_kg: result.product.id === '4' ? 2.7 : result.product.id === '5' ? 2.3 : 2.8,
                has_size: 'Yes',
                lift_capacity_base_on_largest_size_kg: result.product.id === '4' ? 17.3 : result.product.id === '5' ? 13.2 : 16.3
              }
            });
          }
        }
        
        setDebugInfo(debugText);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch product details');
        console.error(error);
        setDebugInfo(`Error in fetchProductDetails: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  const handleComparePress = () => {
    navigation.navigate('Comparison');
  };

  const toggleDebugInfo = () => {
    Alert.alert('Debug Info', debugInfo);
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
  
  // Render technical specifications based on product type
  const renderTechnicalSpecs = () => {
    if (product.type === 'regulator' && techDetails.regulator) {
      const regulator = techDetails.regulator;
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Specifications</Text>
          <View style={styles.techSpecsTable}>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Temperature Rating</Text>
              <Text style={styles.techSpecValue}>{regulator.temperature}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>High Pressure Ports</Text>
              <Text style={styles.techSpecValue}>{regulator.high_pressure_port}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Low Pressure Ports</Text>
              <Text style={styles.techSpecValue}>{regulator.low_pressure_port}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Adjustable Airflow</Text>
              <Text style={styles.techSpecValue}>{regulator.adjustable_airflow}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Pre-Dive Mode</Text>
              <Text style={styles.techSpecValue}>{regulator.pre_dive_mode}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Weight (g)</Text>
              <Text style={styles.techSpecValue}>{regulator.weights_base_on_yoke}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Material</Text>
              <Text style={styles.techSpecValue}>{regulator.material}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Dive Type</Text>
              <Text style={styles.techSpecValue}>{regulator.dive_type}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Airflow at 200bar</Text>
              <Text style={styles.techSpecValue}>{regulator.airflow_at_200bar}</Text>
            </View>
          </View>
        </View>
      );
    } else if (product.type === 'bcd' && techDetails.bcd) {
      const bcd = techDetails.bcd;
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Specifications</Text>
          <View style={styles.techSpecsTable}>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>BCD Type</Text>
              <Text style={styles.techSpecValue}>{bcd.type}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Weight Pocket</Text>
              <Text style={styles.techSpecValue}>{bcd.weight_pocket}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Quick Release</Text>
              <Text style={styles.techSpecValue}>{bcd.quick_release}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Number of Pockets</Text>
              <Text style={styles.techSpecValue}>{bcd.no_pockets}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Back-Trim Pocket</Text>
              <Text style={styles.techSpecValue}>{bcd.back_trim_pocket}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Weight (kg)</Text>
              <Text style={styles.techSpecValue}>{bcd.weight_kg}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Has Size Options</Text>
              <Text style={styles.techSpecValue}>{bcd.has_size}</Text>
            </View>
            <View style={styles.techSpecRow}>
              <Text style={styles.techSpecLabel}>Lift Capacity (kg)</Text>
              <Text style={styles.techSpecValue}>{bcd.lift_capacity_base_on_largest_size_kg}</Text>
            </View>
          </View>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{product.specifications?.category || product.type}</Text>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
      
      {renderTechnicalSpecs()}
      
      <CompetitorPricesComponent 
        productId={productId}
        productPrice={product.price}
        onPriceComparisonPressed={handleComparePress}
      />
      
      {/* Debug button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={toggleDebugInfo}
      >
        <Text style={styles.debugButtonText}>Show Debug Info</Text>
      </TouchableOpacity>
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
  categoryContainer: {
    marginTop: 8,
    backgroundColor: '#e0f0ff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  category: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 14,
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
  techSpecsTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  techSpecRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  techSpecLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  techSpecValue: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#666',
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
  debugButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  debugButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default ProductDetailsScreen; 