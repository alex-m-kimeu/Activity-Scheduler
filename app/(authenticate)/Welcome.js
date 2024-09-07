import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import React from "react";
import Bg from "../../assets/images/bg.png";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.logoContainer}>
          <Image source={Bg} style={styles.logo} />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Let's Get</Text>
          <Text style={styles.subHeaderText}>Started</Text>
        </View>
        <Text style={styles.slogan}>
          Effortlessly Organize, Maximize Your Time, and{"\n"}
          Enjoy More of What Matters!
        </Text>
        <Pressable
          onPress={() => router.replace("/Register")}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Join Now</Text>
        </Pressable>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Pressable onPress={() => router.replace("/Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logo: {
    width: 350,
    resizeMode: "contain",
  },
  headerContainer: {
    alignItems: "start",
  },
  headerText: {
    fontSize: 50,
    fontWeight: "600",
    marginTop: 10,
    color: "#4b5563",
  },
  subHeaderText: {
    fontSize: 50,
    fontWeight: "600",
    color: "#4b5563",
  },
  slogan: {
    color: "#4b5563",
    marginVertical: 20,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "normal",
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 10,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
  },
  registerButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "300",
  },
  loginLink: {
    fontSize: 15,
    color: "#00A8FF",
    textDecorationLine: "underline",
  },
});