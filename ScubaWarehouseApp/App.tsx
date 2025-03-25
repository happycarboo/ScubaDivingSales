import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ApiServiceFacade } from './src/patterns/facade/ApiServiceFacade';

// Initialize services
ApiServiceFacade.initialize();

const App = () => {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
