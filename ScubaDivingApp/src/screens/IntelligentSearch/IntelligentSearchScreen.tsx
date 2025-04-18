import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image
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
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
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
    handleSearch();
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
    } finally {
      setLoading(false);
    }
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Function Filter</Text>
        <Text style={styles.headerSubtitle}>
          Filter products by their characteristics
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mainFilterContainer}>
          <View style={styles.categorySelector}>
            <Text style={styles.sectionTitle}>Product Category:</Text>
            <View style={styles.categoryButtons}>
              <TouchableOpacity 
                style={[
                  styles.categoryButton, 
                  selectedCategory === 'regulator' && styles.selectedCategoryButton
                ]}
                onPress={() => {
                  setSelectedCategory('regulator');
                  resetFilters();
                }}
              >
                <Text 
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === 'regulator' && styles.selectedCategoryButtonText
                  ]}
                >
                  Regulators
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryButton, 
                  selectedCategory === 'bcd' && styles.selectedCategoryButton
                ]}
                onPress={() => {
                  setSelectedCategory('bcd');
                  resetFilters();
                }}
              >
                <Text 
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === 'bcd' && styles.selectedCategoryButtonText
                  ]}
                >
                  BCDs
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.levelSelector}>
            <Text style={styles.sectionTitle}>Diver Experience Level:</Text>
            <View style={styles.levelButtons}>
              <TouchableOpacity 
                style={[
                  styles.levelButton, 
                  selectedLevel === 'beginner' && styles.selectedLevelButton
                ]}
                onPress={() => setSelectedLevel('beginner')}
              >
                <Text 
                  style={[
                    styles.levelButtonText,
                    selectedLevel === 'beginner' && styles.selectedLevelButtonText
                  ]}
                >
                  Beginner
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.levelButton, 
                  selectedLevel === 'intermediate' && styles.selectedLevelButton
                ]}
                onPress={() => setSelectedLevel('intermediate')}
              >
                <Text 
                  style={[
                    styles.levelButtonText,
                    selectedLevel === 'intermediate' && styles.selectedLevelButtonText
                  ]}
                >
                  Intermediate
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.levelButton, 
                  selectedLevel === 'advanced' && styles.selectedLevelButton
                ]}
                onPress={() => setSelectedLevel('advanced')}
              >
                <Text 
                  style={[
                    styles.levelButtonText,
                    selectedLevel === 'advanced' && styles.selectedLevelButtonText
                  ]}
                >
                  Advanced
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Action buttons in a prominent container */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>Find Products</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter section with better visual separation */}
        <View style={styles.detailedFiltersContainer}>
          <Text style={styles.detailedFiltersTitle}>
            Advanced Filters
          </Text>
          {selectedCategory === 'bcd' ? renderBCDFilters() : renderRegulatorFilters()}
        </View>
      </ScrollView>
      
      {/* Results section with improved heading */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsTitleContainer}>
          <Text style={styles.resultsTitle}>
            {results.length > 0 ? `Matching Products (${results.length})` : 'No products match your criteria'}
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Finding the best products...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsListContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No products match your selected filters.
                  Try changing or resetting some filters.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#0066cc',
    borderBottomWidth: 1,
    borderBottomColor: '#0055aa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  mainFilterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categorySelector: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#0066cc',
    borderColor: '#0055aa',
  },
  categoryButtonText: {
    fontWeight: '500',
    fontSize: 15,
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  levelSelector: {
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLevelButton: {
    backgroundColor: '#0066cc',
    borderColor: '#0055aa',
  },
  levelButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedLevelButtonText: {
    color: '#fff',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 16,
  },
  resetButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  resetButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  detailedFiltersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailedFiltersTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 8,
  },
  filtersContainer: {
    marginTop: 4,
  },
  filterSection: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
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
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFilterButton: {
    backgroundColor: '#e1f0ff',
    borderColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#444',
  },
  selectedFilterButtonText: {
    color: '#0066cc',
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resultsTitleContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsListContainer: {
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 6,
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
});

export default IntelligentSearchScreen; 