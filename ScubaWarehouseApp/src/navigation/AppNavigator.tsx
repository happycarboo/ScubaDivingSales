import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ComparisonScreen from '../screens/ComparisonScreen';
import SearchResultScreen from '../screens/SearchResultScreen';

// Define the navigation parameter types
export type AppStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  Comparison: { productIds: string[] };
  SearchResult: { searchQuery: string };
};

const Stack = createStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Scuba Product Catalog' }} 
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={({ route }) => ({ title: 'Product Details' })}
        />
        <Stack.Screen 
          name="Comparison" 
          component={ComparisonScreen} 
          options={{ title: 'Compare Products' }}
        />
        <Stack.Screen 
          name="SearchResult" 
          component={SearchResultScreen} 
          options={{ title: 'Search Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
