import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7eaf0gat2WTlPHwopG_ClBQm_XiU4xlo",
  authDomain: "scuba-2b4d1.firebaseapp.com",
  projectId: "scuba-2b4d1",
  storageBucket: "scuba-2b4d1.firebasestorage.app",
  messagingSenderId: "754659960145",
  appId: "1:754659960145:web:cf2dc161d1e1182d8a1f70",
  measurementId: "G-VERGY4NPLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Training Sales App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 