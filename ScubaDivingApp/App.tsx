import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

// Import screens
import ProductSelectionScreen from './src/screens/ProductSelection';
import ProductDetailsScreen from './src/screens/ProductDetails';
import ComparisonScreen from './src/screens/Comparison';
import IntelligentSearchScreen from './src/screens/IntelligentSearch';

// Placeholder Screens - to be replaced with actual implementations
const RealTimeComparisonScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Real-time Price Comparison</Text>
    <Text>Compare prices with competitors</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="ProductSelection"
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
          options={{ title: 'Smart Search' }}
        />
        <Stack.Screen 
          name="RealTimeComparison" 
          component={RealTimeComparisonScreen} 
          options={{ title: 'Price Comparison' }}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
