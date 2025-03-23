// screens/HomeScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import ProductItem from "../components/ProductItem";

const products = [
  { id: "1", name: "Diving Mask", price: "$50", description: "Tempered glass diving mask." },
  { id: "2", name: "Snorkel", price: "$20", description: "Comfortable snorkel." },
  { id: "3", name: "Fins", price: "$80", description: "Lightweight and powerful fins." },
  { id: "4", name: "Wetsuit", price: "$150", description: "5mm thermal wetsuit." },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem product={item} onPress={() => navigation.navigate("ProductDetail", { product: item })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchBar: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
