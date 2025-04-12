import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  ProductSelection: undefined;
  ProductDetails: { productId: string };
  Comparison: undefined;
  IntelligentSearch: undefined;
  RealTimeComparison: undefined;
  ImageExtractionTest: undefined;
};

export type ProductSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductSelection'
>;

export type ProductDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductDetails'
>;

export type ComparisonScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Comparison'
>;

export type IntelligentSearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IntelligentSearch'
>;

export type RealTimeComparisonScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RealTimeComparison'
>;

export type ImageExtractionTestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ImageExtractionTest'
>; 