import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Sample product data
const sampleProducts = [
  { id: '1', name: 'Product A', category: 'Category 1', price: 50, description: 'This is a description of Product A.' },
  { id: '2', name: 'Product B', category: 'Category 1', price: 75, description: 'This is a description of Product B.' },
  { id: '3', name: 'Product C', category: 'Category 2', price: 30, description: 'This is a description of Product C.' },
  { id: '4', name: 'Product D', category: 'Category 2', price: 100, description: 'This is a description of Product D.' },
  { id: '5', name: 'Product E', category: 'Category 1', price: 45, description: 'This is a description of Product E.' },
];

const ProductScreen = ({ route, navigation }) => {
  // Extract the productId from the route params
  const { productId } = route.params;

  // Find the product based on the productId
  const product = sampleProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{product.name}</Text>
      <Text style={styles.category}>Category: {product.category}</Text>
      <Text style={styles.price}>Price: ${product.price}</Text>
      <Text style={styles.description}>Description: {product.description}</Text>

      {/* Add a button to navigate back to the home screen */}
      <Button
        title="Back to Home"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 18,
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ProductScreen;
