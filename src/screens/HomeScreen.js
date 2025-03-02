import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Linking } from 'react-native';
// import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { products } from '../data/products';

const sampleProducts = [
  { id: '1', name: 'Product A', category: 'Category 1', price: 50 },
  { id: '2', name: 'Product B', category: 'Category 1', price: 75 },
  { id: '3', name: 'Product C', category: 'Category 2', price: 30 },
  { id: '4', name: 'Product D', category: 'Category 2', price: 100 },
  { id: '5', name: 'Product E', category: 'Category 1', price: 45 },
];

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [compareItems, setCompareItems] = useState([]);

  const addToCompare = (product) => {
    // Only allow comparing products of the same category
    if (compareItems.length === 0 || compareItems[0].category === product.category) {
      setCompareItems([...compareItems, product]);
    } else {
      alert('You can only compare products from the same category');
    }
  };

  const openURL = () => {
    Linking.openURL('https://scubawarehouse.com.sg/product-category/dive-regulator/regulator/');
  };

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Product List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Compare</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Key word search"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Product List */}
      <ScrollView style={styles.productList}>
        {sampleProducts.map((item) => (
          <View key={item.id} style={styles.productItem}>
            <TouchableOpacity onPress={openURL}>
              <Text style={styles.productTitle}>{item.name}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.compareButton}
              onPress={() => addToCompare(item)}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Compare Section */}
      <View style={styles.compareSection}>
        <Text style={styles.compareTitle}>Compare</Text>
        <View style={styles.compareBoxes}>
          {[1, 2, 3].map((box, index) => (
            <View key={index} style={styles.compareBox}>
              {compareItems[index] ? (
                <Text>{compareItems[index].name}</Text>
              ) : (
                <Text style={styles.plusSign}>+</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  navItem: {
    marginRight: 20,
  },
  navText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
  },
  productList: {
    flex: 1,
    padding: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productTitle: {
    fontSize: 16,
  },
  compareButton: {
    padding: 5,
  },
  compareSection: {
    padding: 10,
  },
  compareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  compareBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compareBox: {
    width: '30%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    fontSize: 24,
    color: '#ccc',
  },
});

export default HomeScreen;



