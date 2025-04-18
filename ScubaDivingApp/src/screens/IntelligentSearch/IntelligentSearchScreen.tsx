import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IntelligentSearchScreenNavigationProp } from '../../types/navigation';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { Product } from '../../patterns/factory/ProductFactory';
import { RegulatorDetails, BCDDetails } from '../../services/firebase/repositories/ProductRepository';

// Define filter types and options
type ProductCategory = 'regulator' | 'bcd';

// BCD filter options
type BCDType = 'Jacket' | 'Backplate' | 'All';
type WeightPocketOption = 'Yes' | 'No' | 'All';
type QuickReleaseOption = 'Yes' | 'No' | 'All';
type BackTrimPocketOption = 'Yes' | 'No' | 'All';
type WeightRange = 'Light (<2.5kg)' | 'Medium (2.5-3kg)' | 'Heavy (>3kg)' | 'All';
type LiftCapacityRange = 'Low (<15kg)' | 'Medium (15-17kg)' | 'High (>17kg)' | 'All';

// Regulator filter options
type TemperatureOption = 'Cold water' | 'All';
type AdjustableAirflowOption = 'YES' | 'NO' | 'All';
type PreDiveModeOption = 'YES' | 'NO' | 'All';
type HPPortRange = '1' | '2 or more' | 'All';
type LPPortRange = 'Few (1-3)' | 'Many (4+)' | 'All';
type AirflowRange = 'Low (<1500 l/min)' | 'Medium (1500-1800 l/min)' | 'High (>1800 l/min)' | 'All';
type DiveTypeOption = 'Recreational' | 'Recreational / Tech' | 'Recreational / Tech / Contaminated' | 'All';

// Filter states
interface BCDFilters {
  type: BCDType;
  weightPocket: WeightPocketOption;
  quickRelease: QuickReleaseOption;
  backTrimPocket: BackTrimPocketOption;
  weightRange: WeightRange;
  liftCapacityRange: LiftCapacityRange;
}

interface RegulatorFilters {
  temperature: TemperatureOption;
  adjustableAirflow: AdjustableAirflowOption;
  preDiveMode: PreDiveModeOption;
  hpPortRange: HPPortRange;
  lpPortRange: LPPortRange;
  airflowRange: AirflowRange;
  diveType: DiveTypeOption;
}

const IntelligentSearchScreen = () => {
  const navigation = useNavigation<IntelligentSearchScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('regulator');
  const [imagesLoading, setImagesLoading] = useState<Record<string, boolean>>({});
  
  // BCD filters
  const [bcdFilters, setBcdFilters] = useState<BCDFilters>({
    type: 'All',
    weightPocket: 'All',
    quickRelease: 'All',
    backTrimPocket: 'All',
    weightRange: 'All',
    liftCapacityRange: 'All'
  });
  
  // Regulator filters
  const [regulatorFilters, setRegulatorFilters] = useState<RegulatorFilters>({
    temperature: 'All',
    adjustableAirflow: 'All',
    preDiveMode: 'All',
    hpPortRange: 'All',
    lpPortRange: 'All',
    airflowRange: 'All',
    diveType: 'All'
  });
  
  // Use getInstance pattern to get ServiceFacade instance
  const serviceFacade = ServiceFacade.getInstance();
  
  // Load products on initial render
  useEffect(() => {
    // No auto-search on initial render - wait for user to select filters
  }, []);

  // Helper function to categorize numerical values
  const categorizeProducts = async (products: Product[]): Promise<Product[]> => {
    const results: Product[] = [];
    
    for (const product of products) {
      let detailsMatch = true;
      
      if (product.type === 'regulator') {
        const details = await serviceFacade.getRegulatorDetails(product.id);
        if (details) {
          detailsMatch = checkRegulatorFilters(details);
        }
      } else if (product.type === 'bcd') {
        const details = await serviceFacade.getBCDDetails(product.id);
        if (details) {
          detailsMatch = checkBCDFilters(details);
        }
      }
      
      if (detailsMatch) {
        results.push(product);
      }
    }
    
    return results;
  };
  
  // Check if BCD details match the current filters
  const checkBCDFilters = (details: BCDDetails): boolean => {
    if (bcdFilters.type !== 'All' && details.type !== bcdFilters.type) {
      return false;
    }
    
    if (bcdFilters.weightPocket !== 'All' && details.weight_pocket !== bcdFilters.weightPocket) {
      return false;
    }
    
    if (bcdFilters.quickRelease !== 'All' && details.quick_release !== bcdFilters.quickRelease) {
      return false;
    }
    
    if (bcdFilters.backTrimPocket !== 'All' && details.back_trim_pocket !== bcdFilters.backTrimPocket) {
      return false;
    }
    
    // Weight range check
    if (bcdFilters.weightRange !== 'All') {
      if (bcdFilters.weightRange === 'Light (<2.5kg)' && details.weight_kg >= 2.5) {
        return false;
      }
      if (bcdFilters.weightRange === 'Medium (2.5-3kg)' && (details.weight_kg < 2.5 || details.weight_kg > 3)) {
        return false;
      }
      if (bcdFilters.weightRange === 'Heavy (>3kg)' && details.weight_kg <= 3) {
        return false;
      }
    }
    
    // Lift capacity range check
    if (bcdFilters.liftCapacityRange !== 'All') {
      if (bcdFilters.liftCapacityRange === 'Low (<15kg)' && details.lift_capacity_base_on_largest_size_kg >= 15) {
        return false;
      }
      if (bcdFilters.liftCapacityRange === 'Medium (15-17kg)' && 
          (details.lift_capacity_base_on_largest_size_kg < 15 || details.lift_capacity_base_on_largest_size_kg > 17)) {
        return false;
      }
      if (bcdFilters.liftCapacityRange === 'High (>17kg)' && details.lift_capacity_base_on_largest_size_kg <= 17) {
        return false;
      }
    }
    
    return true;
  };
  
  // Check if Regulator details match the current filters
  const checkRegulatorFilters = (details: RegulatorDetails): boolean => {
    if (regulatorFilters.temperature !== 'All' && details.temperature !== regulatorFilters.temperature) {
      return false;
    }
    
    if (regulatorFilters.adjustableAirflow !== 'All' && details.adjustable_airflow !== regulatorFilters.adjustableAirflow) {
      return false;
    }
    
    if (regulatorFilters.preDiveMode !== 'All' && details.pre_dive_mode !== regulatorFilters.preDiveMode) {
      return false;
    }
    
    // HP port range check
    if (regulatorFilters.hpPortRange !== 'All') {
      if (regulatorFilters.hpPortRange === '1' && details.high_pressure_port !== 1) {
        return false;
      }
      if (regulatorFilters.hpPortRange === '2 or more' && details.high_pressure_port < 2) {
        return false;
      }
    }
    
    // LP port range check
    if (regulatorFilters.lpPortRange !== 'All') {
      if (regulatorFilters.lpPortRange === 'Few (1-3)' && details.low_pressure_port > 3) {
        return false;
      }
      if (regulatorFilters.lpPortRange === 'Many (4+)' && details.low_pressure_port < 4) {
        return false;
      }
    }
    
    // Airflow range check
    if (regulatorFilters.airflowRange !== 'All') {
      const airflowMatch = details.airflow_at_200bar.match(/(\d+)/);
      if (airflowMatch) {
        const airflow = parseInt(airflowMatch[0], 10);
        
        if (regulatorFilters.airflowRange === 'Low (<1500 l/min)' && airflow >= 1500) {
          return false;
        }
        if (regulatorFilters.airflowRange === 'Medium (1500-1800 l/min)' && (airflow < 1500 || airflow > 1800)) {
          return false;
        }
        if (regulatorFilters.airflowRange === 'High (>1800 l/min)' && airflow <= 1800) {
          return false;
        }
      }
    }
    
    // Dive type check
    if (regulatorFilters.diveType !== 'All' && !details.dive_type.includes(regulatorFilters.diveType as string)) {
      return false;
    }
    
    return true;
  };
  
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // Get products by selected type
      const products = await serviceFacade.getProductsWithFilters({ 
        type: selectedCategory 
      });
      
      // Apply detailed filters
      const filteredProducts = await categorizeProducts(products);
      
      setResults(filteredProducts);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to proceed to product selection with filtered results
  const handleProceedToSelection = () => {
    if (results.length === 0) {
      Alert.alert(
        'No Products Found',
        'Please adjust your filters and try again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to product selection with filtered results
    navigation.navigate('ProductSelection', { filteredProducts: results });
  };

  // Reset all filters based on product category
  const resetFilters = () => {
    if (selectedCategory === 'bcd') {
      setBcdFilters({
        type: 'All',
        weightPocket: 'All',
        quickRelease: 'All',
        backTrimPocket: 'All',
        weightRange: 'All',
        liftCapacityRange: 'All'
      });
    } else {
      setRegulatorFilters({
        temperature: 'All',
        adjustableAirflow: 'All',
        preDiveMode: 'All',
        hpPortRange: 'All',
        lpPortRange: 'All',
        airflowRange: 'All',
        diveType: 'All'
      });
    }
  };
  
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <View style={styles.resultLayout}>
        {/* Product Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {imagesLoading[item.id] ? (
            <ActivityIndicator size="small" color="#0066cc" style={styles.thumbnailLoader} />
          ) : item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbnail}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Text style={styles.placeholderText}>{item.brand.charAt(0)}{item.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.resultBrand}>{item.brand}</Text>
          <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.resultPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.viewDetailsText}>View details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Update the filter button rendering for a more compact design
  const renderFilterButton = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && styles.selectedFilterButton
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.filterButtonText,
          isSelected && styles.selectedFilterButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Render BCD filters in a more compact way
  const renderBCDFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>BCD Type:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', bcdFilters.type === 'All', () => 
            setBcdFilters({...bcdFilters, type: 'All'})
          )}
          {renderFilterButton('Jacket', bcdFilters.type === 'Jacket', () => 
            setBcdFilters({...bcdFilters, type: 'Jacket'})
          )}
          {renderFilterButton('Backplate', bcdFilters.type === 'Backplate', () => 
            setBcdFilters({...bcdFilters, type: 'Backplate'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Weight Pocket:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', bcdFilters.weightPocket === 'All', () => 
            setBcdFilters({...bcdFilters, weightPocket: 'All'})
          )}
          {renderFilterButton('Yes', bcdFilters.weightPocket === 'Yes', () => 
            setBcdFilters({...bcdFilters, weightPocket: 'Yes'})
          )}
          {renderFilterButton('No', bcdFilters.weightPocket === 'No', () => 
            setBcdFilters({...bcdFilters, weightPocket: 'No'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Quick Release:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', bcdFilters.quickRelease === 'All', () => 
            setBcdFilters({...bcdFilters, quickRelease: 'All'})
          )}
          {renderFilterButton('Yes', bcdFilters.quickRelease === 'Yes', () => 
            setBcdFilters({...bcdFilters, quickRelease: 'Yes'})
          )}
          {renderFilterButton('No', bcdFilters.quickRelease === 'No', () => 
            setBcdFilters({...bcdFilters, quickRelease: 'No'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Weight Range:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', bcdFilters.weightRange === 'All', () => 
            setBcdFilters({...bcdFilters, weightRange: 'All'})
          )}
          {renderFilterButton('Light (<2.5kg)', bcdFilters.weightRange === 'Light (<2.5kg)', () => 
            setBcdFilters({...bcdFilters, weightRange: 'Light (<2.5kg)'})
          )}
          {renderFilterButton('Medium (2.5-3kg)', bcdFilters.weightRange === 'Medium (2.5-3kg)', () => 
            setBcdFilters({...bcdFilters, weightRange: 'Medium (2.5-3kg)'})
          )}
          {renderFilterButton('Heavy (>3kg)', bcdFilters.weightRange === 'Heavy (>3kg)', () => 
            setBcdFilters({...bcdFilters, weightRange: 'Heavy (>3kg)'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Lift Capacity:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', bcdFilters.liftCapacityRange === 'All', () => 
            setBcdFilters({...bcdFilters, liftCapacityRange: 'All'})
          )}
          {renderFilterButton('Low (<15kg)', bcdFilters.liftCapacityRange === 'Low (<15kg)', () => 
            setBcdFilters({...bcdFilters, liftCapacityRange: 'Low (<15kg)'})
          )}
          {renderFilterButton('Medium (15-17kg)', bcdFilters.liftCapacityRange === 'Medium (15-17kg)', () => 
            setBcdFilters({...bcdFilters, liftCapacityRange: 'Medium (15-17kg)'})
          )}
          {renderFilterButton('High (>17kg)', bcdFilters.liftCapacityRange === 'High (>17kg)', () => 
            setBcdFilters({...bcdFilters, liftCapacityRange: 'High (>17kg)'})
          )}
        </View>
      </View>
    </View>
  );
  
  // Render Regulator filters in a more compact way
  const renderRegulatorFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Adjustable Airflow:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.adjustableAirflow === 'All', () => 
            setRegulatorFilters({...regulatorFilters, adjustableAirflow: 'All'})
          )}
          {renderFilterButton('Yes', regulatorFilters.adjustableAirflow === 'YES', () => 
            setRegulatorFilters({...regulatorFilters, adjustableAirflow: 'YES'})
          )}
          {renderFilterButton('No', regulatorFilters.adjustableAirflow === 'NO', () => 
            setRegulatorFilters({...regulatorFilters, adjustableAirflow: 'NO'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Pre-Dive Mode:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.preDiveMode === 'All', () => 
            setRegulatorFilters({...regulatorFilters, preDiveMode: 'All'})
          )}
          {renderFilterButton('Yes', regulatorFilters.preDiveMode === 'YES', () => 
            setRegulatorFilters({...regulatorFilters, preDiveMode: 'YES'})
          )}
          {renderFilterButton('No', regulatorFilters.preDiveMode === 'NO', () => 
            setRegulatorFilters({...regulatorFilters, preDiveMode: 'NO'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>High Pressure Ports:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.hpPortRange === 'All', () => 
            setRegulatorFilters({...regulatorFilters, hpPortRange: 'All'})
          )}
          {renderFilterButton('1', regulatorFilters.hpPortRange === '1', () => 
            setRegulatorFilters({...regulatorFilters, hpPortRange: '1'})
          )}
          {renderFilterButton('2 or more', regulatorFilters.hpPortRange === '2 or more', () => 
            setRegulatorFilters({...regulatorFilters, hpPortRange: '2 or more'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Low Pressure Ports:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.lpPortRange === 'All', () => 
            setRegulatorFilters({...regulatorFilters, lpPortRange: 'All'})
          )}
          {renderFilterButton('Few (1-3)', regulatorFilters.lpPortRange === 'Few (1-3)', () => 
            setRegulatorFilters({...regulatorFilters, lpPortRange: 'Few (1-3)'})
          )}
          {renderFilterButton('Many (4+)', regulatorFilters.lpPortRange === 'Many (4+)', () => 
            setRegulatorFilters({...regulatorFilters, lpPortRange: 'Many (4+)'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Airflow:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.airflowRange === 'All', () => 
            setRegulatorFilters({...regulatorFilters, airflowRange: 'All'})
          )}
          {renderFilterButton('Low', regulatorFilters.airflowRange === 'Low (<1500 l/min)', () => 
            setRegulatorFilters({...regulatorFilters, airflowRange: 'Low (<1500 l/min)'})
          )}
          {renderFilterButton('Medium', regulatorFilters.airflowRange === 'Medium (1500-1800 l/min)', () => 
            setRegulatorFilters({...regulatorFilters, airflowRange: 'Medium (1500-1800 l/min)'})
          )}
          {renderFilterButton('High', regulatorFilters.airflowRange === 'High (>1800 l/min)', () => 
            setRegulatorFilters({...regulatorFilters, airflowRange: 'High (>1800 l/min)'})
          )}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Dive Type:</Text>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('All', regulatorFilters.diveType === 'All', () => 
            setRegulatorFilters({...regulatorFilters, diveType: 'All'})
          )}
          {renderFilterButton('Recreational', regulatorFilters.diveType === 'Recreational', () => 
            setRegulatorFilters({...regulatorFilters, diveType: 'Recreational'})
          )}
          {renderFilterButton('Rec/Tech', regulatorFilters.diveType === 'Recreational / Tech', () => 
            setRegulatorFilters({...regulatorFilters, diveType: 'Recreational / Tech'})
          )}
          {renderFilterButton('Tech', regulatorFilters.diveType === 'Recreational / Tech / Contaminated', () => 
            setRegulatorFilters({...regulatorFilters, diveType: 'Recreational / Tech / Contaminated'})
          )}
        </View>
      </View>
    </View>
  );
  
  // Update useEffect to load product images
  useEffect(() => {
    const loadProductImages = async () => {
      if (results.length === 0) return;
      
      try {
        // Create a tracking object for image loading states
        const loadingStates: Record<string, boolean> = {};
        results.forEach(product => {
          loadingStates[product.id] = true;
        });
        setImagesLoading(loadingStates);
        
        // Load images for each product
        const updatedProducts = await Promise.all(
          results.map(async product => {
            try {
              // Try to get the image
              const imageUrl = await serviceFacade.getProductImageUri(product.id, product.link);
              loadingStates[product.id] = false;
              setImagesLoading({...loadingStates});
              
              // Return a new product object with the updated imageUrl
              return {
                ...product,
                imageUrl: imageUrl || undefined // Convert null to undefined for compatibility
              };
            } catch (error) {
              console.error(`Error loading image for product ${product.id}:`, error);
              loadingStates[product.id] = false;
              setImagesLoading({...loadingStates});
              return product;
            }
          })
        );
        
        // Update products with image URLs
        setResults(updatedProducts as Product[]);
        
      } catch (error) {
        console.error('Error loading product images:', error);
      }
    };

    loadProductImages();
  }, [results.length]);

  return (
    <ScrollView style={styles.container}>
      {/* Welcome message and instructions */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>ScubaWarehouse Sales Assistant</Text>
        <Text style={styles.welcomeText}>
          Welcome to the ScubaWarehouse Sales Assistant! Follow these steps to help your customer:
        </Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepText}>Filter products based on customer needs</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepText}>Compare up to 3 products and explain specs</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepText}>Show detailed view with competitor prices</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Filter Products</Text>
      <Text style={styles.sectionSubtitle}>Step 1: Understand your customer's needs</Text>

      {/* Product category selector */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Product Category:</Text>
        <View style={styles.optionsContainer}>
          {renderFilterButton('Regulators', selectedCategory === 'regulator', () => setSelectedCategory('regulator'))}
          {renderFilterButton('BCDs', selectedCategory === 'bcd', () => setSelectedCategory('bcd'))}
        </View>
      </View>

      {/* Specific filters based on selected category */}
      <View style={styles.advancedFiltersContainer}>
        <Text style={styles.advancedFiltersTitle}>Advanced Filters:</Text>
        {selectedCategory === 'regulator' ? renderRegulatorFilters() : renderBCDFilters()}
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => {
            if (selectedCategory === 'regulator') {
              setRegulatorFilters({
                temperature: 'All',
                adjustableAirflow: 'All',
                preDiveMode: 'All',
                hpPortRange: 'All',
                lpPortRange: 'All',
                airflowRange: 'All',
                diveType: 'All'
              });
            } else {
              setBcdFilters({
                type: 'All',
                weightPocket: 'All',
                quickRelease: 'All',
                backTrimPocket: 'All',
                weightRange: 'All',
                liftCapacityRange: 'All'
              });
            }
          }}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Find Products'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results summary */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Found {results.length} matching product{results.length !== 1 ? 's' : ''}:
          </Text>
          <View style={styles.resultsList}>
            {results.slice(0, 3).map(product => (
              <View key={product.id} style={styles.resultItem}>
                <Text style={styles.resultName}>{product.brand} {product.name}</Text>
                <Text style={styles.resultPrice}>${product.price}</Text>
              </View>
            ))}
            {results.length > 3 && (
              <Text style={styles.moreResults}>
                +{results.length - 3} more products...
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.nextStepButton}
            onPress={handleProceedToSelection}
          >
            <Text style={styles.nextStepButtonText}>
              Next: View & Compare Products
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Finding products...</Text>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  welcomeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066cc',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  stepsContainer: {
    marginTop: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 4,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedFilterButton: {
    borderColor: '#0066cc',
    backgroundColor: '#e6f0ff',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 16,
  },
  selectedFilterButtonText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  advancedFiltersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  advancedFiltersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 14,
    flex: 2,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultsList: {
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultName: {
    fontSize: 16,
    color: '#333',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  moreResults: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  nextStepButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  nextStepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailLoader: {
    position: 'absolute',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9e9e9',
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#888',
  },
  productInfo: {
    flex: 1,
  },
  resultBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d0e6ff',
  },
  viewDetailsText: {
    color: '#0066cc',
    fontSize: 13,
    fontWeight: '500',
  },
  filtersContainer: {
    marginTop: 4,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default IntelligentSearchScreen; 