import React, { useState } from 'react';
import { View, Text, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
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
  
  const [products, setProducts] = useState(sampleProducts);
  const [filterText, setFilterText] = useState('');

   // Filter products by name or category
   const filterProducts = () => {
    const filtered = sampleProducts.filter(product =>
      product.name.toLowerCase().includes(filterText.toLowerCase()) ||
      product.category.toLowerCase().includes(filterText.toLowerCase())
    );
    setProducts(filtered);
  };

  // Clear filter and show all products
  const clearFilter = () => {
    setFilterText('');
    setProducts(sampleProducts);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to Home Screen</Text>
      
      {/* Filter Text Input */}
      <TextInput
        style={{
          height: 40,
          borderColor: '#ccc',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 10,
        }}
        placeholder="Filter by name or category"
        value={filterText}
        onChangeText={setFilterText}
      />
      
      {/* Filter Button */}
      <TouchableOpacity onPress={filterProducts} style={{ marginBottom: 10 }}>
        <Button title="Apply Filter" onPress={filterProducts} />
      </TouchableOpacity>

      {/* Clear Filter Button */}
      <TouchableOpacity onPress={clearFilter} style={{ marginBottom: 10 }}>
        <Button title="Clear Filter" onPress={clearFilter} />
      </TouchableOpacity>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>Category: {item.category}</Text>
            <Text>Price: ${item.price}</Text>
            <Button
              title="Go to Product"
              onPress={() => navigation.navigate('Product', { productId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;