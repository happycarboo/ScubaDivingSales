import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, ProductDetailsScreenNavigationProp } from '../../types/navigation';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { CompetitorPrice } from '../../services/scraper/interfaces/IPriceScraperService';

// We'll use any because RouteProp has compatibility issues
type ProductDetailsScreenRouteProp = any;

// Add a function to filter competitor prices to remove dummy competitors
const filterRealCompetitors = (prices: Record<string, any> | null) => {
  if (!prices) return null;
  
  const filteredPrices: Record<string, any> = {};
  
  // Filter out competitors A, B, C and keep only real competitors
  Object.entries(prices).forEach(([competitor, data]) => {
    // Keep only real competitors (not Competitor A, B, C)
    if (!competitor.startsWith('Competitor ')) {
      filteredPrices[competitor] = data;
    }
  });
  
  return filteredPrices;
};

const ProductDetailsScreen = () => {
  const route = useRoute<ProductDetailsScreenRouteProp>();
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const { productId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [techDetails, setTechDetails] = useState<any>(null);
  const [competitorPrices, setCompetitorPrices] = useState<Record<string, CompetitorPrice> | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const serviceFacade = ServiceFacade.getInstance();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Get product with technical details
        const result = await serviceFacade.getProductWithTechDetails(productId);
        setProduct(result.product);
        setTechDetails(result.techDetails);
        
        // Get last fetched competitor prices (if any) and filter out dummy competitors
        const prices = await serviceFacade.getLastFetchedCompetitorPrices(productId);
        setCompetitorPrices(filterRealCompetitors(prices));
        
        // Try to load the product image
        await loadProductImage(result.product);
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const loadProductImage = async (product: any) => {
    if (!product) return;
    
    setImageLoading(true);
    try {
      // First try to get from cached URI
      let imageUri = await serviceFacade.getProductImageUri(product.id);
      
      // If no cached image and we have a link, try to fetch from the link
      if (!imageUri && product.link) {
        console.log(`No cached image for product ${product.id}, trying to fetch from link: ${product.link}`);
        imageUri = await serviceFacade.getProductImageUri(product.id, product.link, product.type);
      }
      
      // If still no image, try alternate methods
      if (!imageUri) {
        console.log(`Still no image for product ${product.id}, trying fallback approaches`);
        
        // Try extracting directly from the product URL
        const imageUrl = await serviceFacade.extractProductImageUrl(product.link);
        if (imageUrl) {
          imageUri = await serviceFacade.getProductImageUri(product.id, '', product.type);
        }
      }
      
      // If we finally have an image, try to find similar products to share with
      if (imageUri) {
        // Find all products of the same type and update their images
        const allProducts = await serviceFacade.getProductsWithFilters({ type: product.type });
        if (allProducts && allProducts.length > 0) {
          const similarProducts = allProducts.filter(p => 
            p.id !== product.id && 
            (p.name.includes(product.name.slice(0, 5)) || product.name.includes(p.name.slice(0, 5)))
          );
          
          for (const similarProduct of similarProducts) {
            await serviceFacade.shareProductImage(product.id, similarProduct.id);
          }
        }
      }
      
      setProductImage(imageUri);
    } catch (error) {
      console.error('Error loading product image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  // Modify the fetchCompetitorPrices function to filter out dummy competitors
  const fetchCompetitorPrices = async () => {
    if (!product) return;
    
    setPricesLoading(true);
    try {
      // Use our new method that leverages the multi-platform price scraper
      const prices = await serviceFacade.fetchCompetitorPrices(
        productId,
        product.name,
        product.brand
      );
      
      // Filter out dummy competitors
      setCompetitorPrices(filterRealCompetitors(prices));
    } catch (error) {
      console.error('Error fetching competitor prices:', error);
    } finally {
      setPricesLoading(false);
    }
  };

  const formatDetails = (details: any) => {
    // Convert technical details object into an array of label/value pairs
    if (!details) return [];
    
    return Object.entries(details)
      .filter(([key]) => key !== 'prod_id' && key !== 'category') // Filter out non-display fields
      .map(([key, value]) => ({
        label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: String(value) // Convert value to string to ensure it can be displayed
      }));
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
        <Text style={styles.errorText}>Product not found or error loading product.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {imageLoading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.imageLoader} />
        ) : productImage ? (
          <Image 
            source={{ uri: productImage }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImageBox}>
            <Text style={styles.placeholderImageText}>{product.name}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.headerContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
      </View>
      
      {/* Competitor Price Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Competitor Prices</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchCompetitorPrices}
            disabled={pricesLoading}
          >
            <Text style={styles.refreshButtonText}>
              {pricesLoading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {pricesLoading ? (
          <View style={styles.priceLoadingContainer}>
            <ActivityIndicator size="small" color="#0066cc" />
            <Text style={styles.priceLoadingText}>Fetching current prices...</Text>
          </View>
        ) : competitorPrices && Object.keys(competitorPrices).length > 0 ? (
          <View style={styles.pricesContainer}>
            {Object.entries(competitorPrices).map(([competitor, data]) => (
              <View key={competitor} style={styles.priceRow}>
                <Text style={styles.competitorName}>{competitor}</Text>
                <Text 
                  style={[
                    styles.competitorPrice, 
                    data.price < product.price ? styles.betterPrice : null
                  ]}
                >
                  ${data.price.toFixed(2)}
                  {data.price < product.price && ' ⚠️'}
                </Text>
                {!data.isLive && (
                  <Text style={styles.outdatedPrice}>
                    Last updated: {data.lastUpdated.toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPricesText}>No competitor prices available. Tap Refresh to fetch prices.</Text>
        )}
      </View>
      
      {/* Technical Details Section */}
      {techDetails && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Technical Specifications</Text>
          <View style={styles.techDetailsContainer}>
            {formatDetails(techDetails).map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}:</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Comparison', { 
            products: [product],
            techDetails: techDetails ? [techDetails] : []
          })}
        >
          <Text style={styles.buttonText}>Add to Comparison</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RealTimeComparison')}
        >
          <Text style={styles.buttonText}>View All Prices</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    height: 250,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageLoader: {
    position: 'absolute',
  },
  placeholderImageBox: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImageText: {
    color: '#555',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    padding: 10,
  },
  headerContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  productBrand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 5,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  priceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  priceLoadingText: {
    marginLeft: 10,
    color: '#666',
  },
  pricesContainer: {
    marginTop: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  competitorName: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  competitorPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  betterPrice: {
    color: 'red',
    fontWeight: 'bold',
  },
  outdatedPrice: {
    fontSize: 12,
    color: '#999',
    flex: 2,
    textAlign: 'right',
  },
  noPricesText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  techDetailsContainer: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProductDetailsScreen; 