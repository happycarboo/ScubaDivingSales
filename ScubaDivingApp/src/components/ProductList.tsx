import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, FlatList } from 'react-native';
import { ServiceFacade } from '../patterns/facade/ServiceFacade';
import { Product } from '../patterns/factory/ProductFactory';
import ProductCard from './ProductCard';

interface ProductListProps {
  filters?: Record<string, any>;
}

const ProductList: React.FC<ProductListProps> = ({ filters = {} }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const serviceFacade = ServiceFacade.getInstance();
        await serviceFacade.initialize();
        const fetchedProducts = await serviceFacade.getProductsWithFilters(filters);
        
        console.log('Fetched products in component:', fetchedProducts);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>No products found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.grid}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    color: 'red',
  },
  grid: {
    padding: 8,
  },
});

export default ProductList; 