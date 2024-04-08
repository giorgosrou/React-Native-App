import React from "react";
import { StyleSheet, View } from "react-native";
import VoiceRecorder from "./VoiceRecorder";

export default function App() {
  return (
    <View style={styles.container}>
      <VoiceRecorder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
