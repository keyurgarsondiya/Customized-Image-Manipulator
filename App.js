import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Stepper from "./components/Stepper";

export default function App() {
  return (
    <View style={styles.container}>
      <Stepper />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
