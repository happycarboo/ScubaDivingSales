import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { ProductInfo } from '../../services/scraper/interfaces/IProductInfoExtractor';

/**
 * Test component for product image extraction functionality
 * This component demonstrates the use of the new product image extraction features
 */
const ProductImageExtractorTest = () => {
  const [url, setUrl] = useState('https://scubawarehouse.com.sg/product/scubapro-level-bcd/');
  const [category, setCategory] = useState('BCD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  const serviceFacade = ServiceFacade.getInstance();

  const extractProductName = async () => {
    setLoading(true);
    setError(null);
    setProductInfo(null);

    try {
      const name = await serviceFacade.extractProductName(url);
      if (name) {
        setProductInfo({ name, imageUrl: null });
      } else {
        setError('Failed to extract product name');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const extractProductImageUrl = async () => {
    setLoading(true);
    setError(null);

    try {
      const imageUrl = await serviceFacade.extractProductImageUrl(url);
      if (imageUrl) {
        if (productInfo && productInfo.name) {
          setProductInfo({ ...productInfo, imageUrl });
        } else {
          setProductInfo({ name: "Unknown Product", imageUrl });
        }
      } else {
        setError('Failed to extract product image URL');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const extractAndDownloadProductInfo = async () => {
    setLoading(true);
    setError(null);
    setProductInfo(null);

    try {
      const info = await serviceFacade.extractAndDownloadProductInfo(url, category);
      if (info) {
        setProductInfo(info);
      } else {
        setError('Failed to extract product information');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Product Image Extractor Test</Text>

      <Text style={styles.label}>Product URL:</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Enter product URL"
      />

      <Text style={styles.label}>Product Category:</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Enter product category"
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Extract Name"
          onPress={extractProductName}
          disabled={loading}
        />
        <Button
          title="Extract Image URL"
          onPress={extractProductImageUrl}
          disabled={loading}
        />
        <Button
          title="Extract & Download All"
          onPress={extractAndDownloadProductInfo}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {productInfo && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Product Information:</Text>
          
          {productInfo.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{productInfo.name}</Text>
            </View>
          )}
          
          {productInfo.imageUrl && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Image URL:</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{productInfo.imageUrl}</Text>
              </View>
              <Image 
                source={{ uri: productInfo.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </>
          )}
          
          {productInfo.localImagePath && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Local Path:</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{productInfo.localImagePath}</Text>
              </View>
              <Image 
                source={{ uri: productInfo.localImagePath }}
                style={styles.image}
                resizeMode="contain"
              />
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    borderRadius: 4,
    marginVertical: 16,
  },
  errorText: {
    color: '#ff0000',
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 16,
    backgroundColor: '#eee',
  },
});

export default ProductImageExtractorTest; 