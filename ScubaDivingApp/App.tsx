import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';
import { ServiceFacade } from './src/patterns/facade/ServiceFacade';

// Import screens
import ProductSelectionScreen from './src/screens/ProductSelection';
import ProductDetailsScreen from './src/screens/ProductDetails';
import ComparisonScreen from './src/screens/Comparison';
import IntelligentSearchScreen from './src/screens/IntelligentSearch';
import ProductImageExtractorTest from './src/components/test/ProductImageExtractorTest';

// Placeholder Screens - to be replaced with actual implementations
const RealTimeComparisonScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Real-time Price Comparison</Text>
    <Text>Compare prices with competitors</Text>
  </View>
);

// Testing screen for product image extraction
const ImageExtractionTestScreen = () => (
  <View style={styles.testContainer}>
    <ProductImageExtractorTest />
  </View>
);

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.screen}>
    <ActivityIndicator size="large" color="#0066cc" />
    <Text style={styles.loadingText}>Initializing app...</Text>
  </View>
);

// Error Screen Component
const ErrorScreen = ({ message }: { message: string }) => (
  <View style={styles.screen}>
    <Text style={styles.errorTitle}>Error</Text>
    <Text style={styles.errorMessage}>{message}</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Get the ServiceFacade instance
        const serviceFacade = ServiceFacade.getInstance();
        
        // Always use real Firebase - this ensures we get data from the Firestore database
        const useRealFirebase = true;
        
        // Initialize the ServiceFacade with real Firebase
        await serviceFacade.initialize(useRealFirebase);
        console.log('ServiceFacade initialized, using real Firebase:', serviceFacade.isUsingRealFirebase());
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize services:', err);
        setError('Failed to initialize the application. Please try again later.');
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="IntelligentSearch"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="ProductSelection" 
          component={ProductSelectionScreen} 
          options={{ title: 'ScubaWarehouse Sales Assistant' }}
        />
        <Stack.Screen 
          name="ProductDetails" 
          component={ProductDetailsScreen} 
          options={{ title: 'Product Details' }}
        />
        <Stack.Screen 
          name="Comparison" 
          component={ComparisonScreen} 
          options={{ title: 'Compare Products' }}
        />
        <Stack.Screen 
          name="IntelligentSearch" 
          component={IntelligentSearchScreen} 
          options={{ title: 'ScubaWarehouse Sales Assistant' }}
        />
        <Stack.Screen 
          name="RealTimeComparison" 
          component={RealTimeComparisonScreen} 
          options={{ title: 'Price Comparison' }}
        />
        <Stack.Screen 
          name="ImageExtractionTest" 
          component={ImageExtractionTestScreen} 
          options={{ title: 'Image Extraction Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  testContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'red',
  },
  errorMessage: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});
