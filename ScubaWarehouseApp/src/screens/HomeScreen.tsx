import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import ProductItem from '../components/product/ProductItem';
import { ApiServiceFacade } from '../patterns/facade/ApiServiceFacade';
import { FilterFactory } from '../patterns/factory/FilterFactory';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Filter categories
  const filterCategories = [
    { name: 'Category', options: ['Masks', 'Fins', 'BCDs', 'Regulators', 'Wetsuits'] },
    { name: 'Brand', options: ['Scubapro', 'Aqualung', 'Mares', 'Cressi', 'Suunto'] },
    { name: 'Price', options: ['$0-$100', '$100-$300', '$300-$500', '$500+'] },
    { name: 'Experience', options: ['Beginner', 'Intermediate', 'Advanced'] }
  ];

  useEffect(() => {
    loadProducts();
  }, [activeFilters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use the Factory pattern to create the appropriate filter
      const filter = FilterFactory.createFilter(activeFilters);
      const productData = await ApiServiceFacade.getFilteredProducts(filter);
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Filter products based on search query
    // In a real app, this might be done on the server or with more complex logic
  };

  const applyFilter = (category: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const renderFilterOptions = (category: { name: string, options: string[] }) => {
    return (
      <View style={styles.filterCategory} key={category.name}>
        <Text style={styles.filterCategoryName}>{category.name}</Text>
        <View style={styles.filterOptions}>
          {category.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                activeFilters[category.name] === option && styles.activeFilterOption
              ]}
              onPress={() => applyFilter(category.name, option)}
            >
              <Text 
                style={[
                  styles.filterOptionText,
                  activeFilters[category.name] === option && styles.activeFilterOptionText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity 
          style={styles.compareButton}
          onPress={() => navigation.navigate('Comparison', { productIds: [] })}
        >
          <Text style={styles.compareButtonText}>Compare</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterCategories}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => renderFilterOptions(item)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  compareButton: {
    marginLeft: 10,
    backgroundColor: '#0066cc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8
  },
  compareButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  filtersContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  filterCategory: {
    marginRight: 15,
    paddingHorizontal: 10
  },
  filterCategoryName: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  filterOption: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6
  },
  activeFilterOption: {
    backgroundColor: '#0066cc'
  },
  filterOptionText: {
    fontSize: 12
  },
  activeFilterOptionText: {
    color: 'white'
  },
  productList: {
    padding: 8
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default HomeScreen;
