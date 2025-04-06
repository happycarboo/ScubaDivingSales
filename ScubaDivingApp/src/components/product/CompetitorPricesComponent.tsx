import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
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
  const [competitorPrices, setCompetitorPrices] = useState<Record<string, CompetitorPrice>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'fetching' | 'success' | 'timeout' | 'error'>('idle');
  
  // Use service facade for data fetching
  const serviceFacade = ServiceFacade.getInstance();
  
  // Load initial competitor prices
  useEffect(() => {
    const loadInitialPrices = async () => {
      try {
        // First get any cached prices
        setFetchStatus('fetching');
        const response = await serviceFacade.fetchRealTimeCompetitorPrices(productId);
        setCompetitorPrices(response.competitorPrices);
        setIsFetching(response.isFetching);
        setInitialLoading(false);
        
        // Set a timeout to stop fetching after 15 seconds if no response
        const fetchTimeout = setTimeout(() => {
          if (isFetching) {
            console.log('Fetching competitor prices timed out');
            setIsFetching(false);
            setFetchStatus('timeout');
          }
        }, 15000);
        
        // Check for updated prices every 3 seconds while fetching
        const checkInterval = setInterval(async () => {
          if (isFetching) {
            const cachedPrices = await serviceFacade.getLastFetchedCompetitorPrices(productId);
            if (cachedPrices) {
              setCompetitorPrices(cachedPrices);
              
              // If all prices are live, stop fetching
              const allLive = Object.values(cachedPrices).every(price => price.isLive);
              if (allLive) {
                setIsFetching(false);
                setFetchStatus('success');
                clearInterval(checkInterval);
                clearTimeout(fetchTimeout);
              }
            }
          } else {
            clearInterval(checkInterval);
            clearTimeout(fetchTimeout);
          }
        }, 3000);
        
        // Cleanup interval and timeout
        return () => {
          clearInterval(checkInterval);
          clearTimeout(fetchTimeout);
        };
      } catch (error) {
        console.error('Error loading competitor prices:', error);
        setInitialLoading(false);
        setIsFetching(false);
        setFetchStatus('error');
      }
    };
    
    loadInitialPrices();
  }, [productId]);
  
  // Format the date to a readable string
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Start a new price fetch
  const handleRefreshPrices = async () => {
    try {
      setIsFetching(true);
      setFetchStatus('fetching');
      await serviceFacade.fetchRealTimeCompetitorPrices(productId);
    } catch (error) {
      console.error('Error refreshing prices:', error);
      setIsFetching(false);
      setFetchStatus('error');
    }
  };
  
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading competitor prices...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Competitor Prices</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshPrices}
          disabled={isFetching}
        >
          <Text style={styles.refreshButtonText}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isFetching && (
        <View style={styles.fetchingContainer}>
          <ActivityIndicator size="small" color="#0066cc" />
          <Text style={styles.fetchingText}>Fetching live prices...</Text>
        </View>
      )}
      
      {!isFetching && fetchStatus === 'timeout' && (
        <View style={styles.messageContainer}>
          <Text style={styles.warningText}>
            Fetching timed out. Showing last known prices.
          </Text>
        </View>
      )}
      
      {!isFetching && fetchStatus === 'error' && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>
            Error fetching prices. Please try again.
          </Text>
        </View>
      )}
      
      {Object.entries(competitorPrices).length > 0 ? (
        <View style={styles.pricesContainer}>
          {Object.entries(competitorPrices).map(([competitor, data]) => (
            <View key={competitor} style={styles.priceRow}>
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
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No competitor price data available</Text>
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
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  fetchingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
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
  noDataText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
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
  messageContainer: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  warningText: {
    color: '#e67e22',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  pricesContainer: {
    marginTop: 10,
  },
});

export default CompetitorPricesComponent; 