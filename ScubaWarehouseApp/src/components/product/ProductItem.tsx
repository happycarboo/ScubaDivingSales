import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  image?: string;
  rating?: number;
}

interface ProductItemProps {
  product: Product;
  onPress: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={product.image ? { uri: product.image } : require('../../assets/placeholder.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxWidth: '47%'
  },
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#f9f9f9'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  detailsContainer: {
    padding: 10
  },
  brand: {
    fontSize: 12,
    color: '#0066cc',
    marginBottom: 2
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529'
  },
  ratingContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rating: {
    fontSize: 12,
    color: '#f39c12'
  }
});

export default ProductItem;
