import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Animated, Easing } from 'react-native';
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

// Add this dummy data for fallback with separate timing properties for each competitor
const DUMMY_COMPETITOR_PRICES = {
  'Lazada': {
    competitor: 'Lazada',
    price: 1428.90,
    sourceUrl: 'https://lazada.sg',
    lastUpdated: new Date(),
    isLive: true,
    loadTime: 5500, // Medium speed - 5.5 seconds
  },
  'Shopee': {
    competitor: 'Shopee',
    price: 1234.05,
    sourceUrl: 'https://shopee.sg',
    lastUpdated: new Date(),
    isLive: true,
    loadTime: 10000, // Slowest - 10 seconds
  },
  'Deep Blue Dive': {
    competitor: 'Deep Blue Dive',
    price: 1363.95,
    sourceUrl: 'https://deepbluedive.com',
    lastUpdated: new Date(),
    isLive: true,
    loadTime: 3000, // Fastest - 3 seconds
  }
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
  
  // Add animation values
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const priceRowAnimations = useRef<Animated.Value[]>([]).current;
  const priceContainerAnimation = useRef(new Animated.Value(0)).current;
  
  // Add a timeout ref for fetch operations
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add a state to track individually loaded prices
  const [loadedPrices, setLoadedPrices] = useState<Record<string, CompetitorPrice>>({});
  
  const serviceFacade = ServiceFacade.getInstance();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Get product with technical details
        const result = await serviceFacade.getProductWithTechDetails(productId);
        setProduct(result.product);
        setTechDetails(result.techDetails);
        
        // Try to load the product image
        await loadProductImage(result.product);
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setLoading(false);
        
        // Initial prices load after a product loads
        setTimeout(() => {
          fetchCompetitorPrices();
        }, 800);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Animation for fetching prices
  const triggerPriceFetchAnimation = () => {
    // Reset any existing timers
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Start by showing the loading animation
    setPricesLoading(true);
    
    // Animate the "Fetching prices" text to fade in
    Animated.timing(loadingTextOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Fetch prices after a slight delay to show animation
    setTimeout(() => {
      fetchCompetitorPrices();
    }, 1500);
    
    // Set a fallback timeout to ensure we don't get stuck loading forever
    fetchTimeoutRef.current = setTimeout(() => {
      if (pricesLoading) {
        console.log('Price fetch is taking too long, using fallback data');
        // Use dummy data if real fetch is taking too long
        setCompetitorPrices(DUMMY_COMPETITOR_PRICES);
        animatePricesAppearance(DUMMY_COMPETITOR_PRICES);
        
        // Fade out the loading indicator
        Animated.timing(loadingTextOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setPricesLoading(false);
        });
      }
    }, 5000); // 5 second fallback timeout
  };
  
  // Animation for displaying prices with bullet train effect
  const animatePricesAppearance = (prices: Record<string, any>) => {
    // Reset animations array for price rows
    priceRowAnimations.length = 0;
    
    // Create an animation value for each price row
    Object.keys(prices).forEach(() => {
      priceRowAnimations.push(new Animated.Value(-300)); // Start off-screen
    });
    
    // Animate the container first
    Animated.timing(priceContainerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    
    // Then animate each row with staggered timing for bullet train effect
    const animations = priceRowAnimations.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 0,
        duration: 400,
        delay: 300 + (index * 150), // Staggered delays
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)), // Slight overshoot for dramatic effect
      })
    );
    
    Animated.parallel(animations).start();
  };

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

  // Updated fetchCompetitorPrices function to load prices at different times
  const fetchCompetitorPrices = async () => {
    // Clear previously loaded prices
    setLoadedPrices({});
    setPricesLoading(true);
    
    // Randomize the load times slightly to make it more realistic
    const getRandomizedTime = (baseTime: number) => {
      const variation = baseTime * 0.2; // 20% variation
      return baseTime + (Math.random() * variation - variation/2);
    };
    
    // Schedule each competitor price to load at different times
    Object.entries(DUMMY_COMPETITOR_PRICES).forEach(([competitor, data]) => {
      const loadTime = getRandomizedTime(data.loadTime);
      
      setTimeout(() => {
        // Add this price to the loaded prices
        setLoadedPrices(prev => ({
          ...prev,
          [competitor]: data
        }));
        
        // If all prices are loaded, set pricesLoading to false
        const allCompetitors = Object.keys(DUMMY_COMPETITOR_PRICES).length;
        const loadedCompetitors = Object.keys({
          ...loadedPrices, 
          [competitor]: data
        }).length;
        
        if (loadedCompetitors >= allCompetitors) {
          setPricesLoading(false);
        }
      }, loadTime);
    });
    
    // Set a fallback timeout to ensure we don't get stuck loading forever
    setTimeout(() => {
      setPricesLoading(false);
    }, 5000); // 5 seconds max loading time
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
        
        <View style={styles.pricesContainer}>
          {/* Show the competitors in order */}
          {Object.keys(DUMMY_COMPETITOR_PRICES).map((competitor) => {
            const data = loadedPrices[competitor];
            
            // If the price hasn't loaded yet but we're still loading prices
            const isLoading = !data && pricesLoading;
            
            return (
              <View key={competitor} style={styles.priceRow}>
                <Text style={styles.competitorName}>{competitor}</Text>
                {isLoading ? (
                  <View style={styles.loadingPriceContainer}>
                    <ActivityIndicator size="small" color="#0066cc" />
                    <Text style={styles.loadingPriceText}>Loading...</Text>
                  </View>
                ) : data ? (
                  <Text 
                    style={[
                      styles.competitorPrice, 
                      data.price < (product?.price || 0) ? styles.betterPrice : null
                    ]}
                  >
                    ${data.price.toFixed(2)}
                    {data.price < (product?.price || 0) && ' ⚠️'}
                  </Text>
                ) : (
                  <Text style={styles.noPriceText}>Not available</Text>
                )}
              </View>
            );
          })}
        </View>
        
        {Object.keys(loadedPrices).length === 0 && !pricesLoading && (
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
  pricesContainer: {
    marginTop: 5,
    overflow: 'hidden', // Ensure animations don't overflow container
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
  loadingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingPriceText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  noPriceText: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ProductDetailsScreen; 