import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { CompetitorPrice } from '../../services/scraper/interfaces/IPriceScraperService';

interface CompetitorPricesComponentProps {
  productId: string;
  productPrice: number;
  onPriceComparisonPressed: () => void;
}

const CompetitorPricesComponent: React.FC<CompetitorPricesComponentProps> = ({
  productId,
  productPrice,
  onPriceComparisonPressed
}) => {
  // States for demo
  const [isFetching, setIsFetching] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);
  
  // Animation values
  const flashAnim = useRef(new Animated.Value(0)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  
  // Get competitor prices based on product price
  const competitorPrices = {
    'Competitor A': {
      competitor: 'Competitor A',
      price: productPrice * 1.1, // 10% higher
      sourceUrl: 'https://www.example.com/competitor-a',
      lastUpdated: new Date(),
      isLive: true
    },
    'Competitor B': {
      competitor: 'Competitor B',
      price: productPrice * 0.95, // 5% lower
      sourceUrl: 'https://www.example.com/competitor-b',
      lastUpdated: new Date(),
      isLive: true
    },
    'Competitor C': {
      competitor: 'Competitor C',
      price: productPrice * 1.05, // 5% higher
      sourceUrl: 'https://www.example.com/competitor-c',
      lastUpdated: new Date(),
      isLive: true
    }
  };
  
  // Flash animation during fetching
  useEffect(() => {
    if (isFetching) {
      // Create a repeating flash animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          })
        ])
      ).start();
    } else {
      // Stop animation when not fetching
      flashAnim.stopAnimation();
      flashAnim.setValue(0);
    }
  }, [isFetching]);
  
  // Demo fetching process
  const demoFetchPrices = () => {
    // Reset states
    setIsFetching(true);
    setShowCompletion(false);
    setFetchComplete(false);
    
    // Simulate network request (4 seconds)
    setTimeout(() => {
      setIsFetching(false);
      
      // Show completion message
      setShowCompletion(true);
      
      // Animate completion message
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: false
      }).start();
      
      // Hide completion message after 1 second and show results
      setTimeout(() => {
        Animated.timing(completionAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start(() => {
          setShowCompletion(false);
          setFetchComplete(true);
        });
      }, 1000);
    }, 4000);
  };
  
  // Initialize on mount
  useEffect(() => {
    demoFetchPrices();
  }, []);
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Background color for fetching container with animation
  const fetchingBackgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f8f8f8', '#e6f2ff']
  });
  
  // Animation for completion message
  const completionScale = completionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Competitor Prices</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={demoFetchPrices}
          disabled={isFetching}
        >
          <Text style={styles.refreshButtonText}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isFetching && (
        <Animated.View style={[
          styles.fetchingContainer, 
          { backgroundColor: fetchingBackgroundColor }
        ]}>
          <ActivityIndicator size="small" color="#0066cc" />
          <Text style={styles.fetchingText}>Fetching live prices...</Text>
        </Animated.View>
      )}
      
      {showCompletion && (
        <Animated.View style={[
          styles.completionContainer,
          { 
            transform: [{ scale: completionScale }],
            opacity: completionAnim 
          }
        ]}>
          <Text style={styles.completionText}>Completed!</Text>
        </Animated.View>
      )}
      
      {fetchComplete && (
        <View style={styles.pricesContainer}>
          {Object.entries(competitorPrices).map(([competitor, data], index) => (
            <Animated.View 
              key={competitor} 
              style={[
                styles.priceRow,
                { 
                  // Simple styling without animation properties
                  opacity: 1,
                  transform: [{ translateX: 0 }]
                }
              ]}
            >
              <View style={styles.competitorInfo}>
                <Text style={styles.competitorName}>{competitor}</Text>
                <Text style={styles.timestamp}>
                  {data.isLive ? '(Live price)' : `Last updated: ${formatDate(data.lastUpdated)}`}
                </Text>
              </View>
              <Text 
                style={[
                  styles.competitorPrice, 
                  data.price > productPrice ? styles.higherPrice : 
                  data.price < productPrice ? styles.lowerPrice : null
                ]}
              >
                ${data.price.toFixed(2)}
                {data.price > productPrice && " (Higher)"}
                {data.price < productPrice && " (Lower)"}
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.compareButton}
        onPress={onPriceComparisonPressed}
      >
        <Text style={styles.compareButtonText}>Full Price Comparison</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  fetchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  fetchingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  completionContainer: {
    backgroundColor: '#dff6dd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  completionText: {
    color: '#107C10',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  competitorInfo: {
    flex: 1,
  },
  competitorName: {
    fontSize: 16,
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  competitorPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  higherPrice: {
    color: '#009900', // Green for prices higher than ours (good for us)
  },
  lowerPrice: {
    color: '#cc0000', // Red for prices lower than ours (competition is cheaper)
  },
  pricesContainer: {
    marginTop: 10,
  },
  compareButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CompetitorPricesComponent; 