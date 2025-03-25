import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IntelligentSearchScreenNavigationProp } from '../../types/navigation';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';

// Mock recommendations based on user preferences
const userProfiles = {
  beginner: {
    experienceLevel: 'beginner',
    preferences: {
      priceImportance: 8,
      qualityImportance: 5,
      brandImportance: 3
    }
  },
  intermediate: {
    experienceLevel: 'intermediate',
    preferences: {
      priceImportance: 6,
      qualityImportance: 7,
      brandImportance: 5
    }
  },
  advanced: {
    experienceLevel: 'advanced',
    preferences: {
      priceImportance: 4,
      qualityImportance: 9,
      brandImportance: 7
    }
  }
};

const IntelligentSearchScreen = () => {
  const navigation = useNavigation<IntelligentSearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const serviceFacade = new ServiceFacade();
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Use the service facade to get personalized recommendations
      // In a real app, this would analyze the search query
      const profile = userProfiles[selectedLevel];
      
      // Using a random user ID for demo purposes
      const recommendations = await serviceFacade.getPersonalizedRecommendations(
        'user123',
        { experienceLevel: profile.experienceLevel },
        {
          ...profile.preferences,
          searchQuery: searchQuery
        }
      );
      
      setResults(recommendations);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultBrand}>{item.brand}</Text>
      </View>
      <Text style={styles.resultPrice}>${item.price.toFixed(2)}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Match Score:</Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              {width: `${(item.score / 10) * 100}%`}
            ]} 
          />
        </View>
        <Text style={styles.scoreValue}>{item.score.toFixed(1)}/10</Text>
      </View>
      <Text style={styles.viewDetailsText}>Tap to view details</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Intelligent Product Search</Text>
        <Text style={styles.headerSubtitle}>
          Describe what the customer is looking for in natural language
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="E.g., 'Looking for a lightweight regulator for deep dives'"
          value={searchQuery}
          onChangeText={setSearchQuery}
          multiline
          numberOfLines={3}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Find Products</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.levelSelector}>
        <Text style={styles.levelTitle}>Diver Experience Level:</Text>
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
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {results.length > 0 ? 'Recommended Products' : 'Search for products to see recommendations'}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Finding the best products...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No products match your search</Text>
                </View>
              ) : null
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
    backgroundColor: '#fff',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  searchButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelSelector: {
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
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
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBrand: {
    fontSize: 14,
    color: '#666',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 12,
  },
  scoreContainer: {
    marginVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  scoreValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  viewDetailsText: {
    color: '#0066cc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default IntelligentSearchScreen; 