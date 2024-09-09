import { StyleSheet, Text, View, Image } from "react-native";
import React, { useCallback } from "react";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Card = ({ activity }) => {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <View style={styles.card} onLayout={onLayoutRootView}>
      {activity.image && (
        <Image source={{ uri: activity.image }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{activity.title}</Text>
          <Text style={styles.cardCategory}>{activity.category}</Text>
        </View>
        <Text style={styles.cardDescription}>{activity.description}</Text>
        <Text style={styles.cardLocation}>{activity.location}</Text>
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 16,
  },
  cardCategory: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
  },
  cardDescription: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_400Regular",
    fontSize: 14,
    marginBottom: 5,
  },
  cardLocation: {
    color: "#00A8FF",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 14,
  },
});