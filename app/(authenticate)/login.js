import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../../assets/images/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    axios.post("http://127.0.0.1:5500/signin", user).then((response) => {
      const token = response.data.token;
      AsyncStorage.setItem("authToken", token);
      router.replace("/(tabs)/home");
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>
      <KeyboardAvoidingView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome Back</Text>
          <Text style={styles.subHeaderText}>Login to your account to continue</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.textInput}
              placeholder="emailaddress@gmail.com"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={password}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
              style={styles.textInput}
              placeholder="Password"
            />
          </View>
          <Pressable onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Pressable onPress={() => router.replace("/register")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 80,
  },
  logo: {
    width: 200,
    resizeMode: "contain",
  },
  headerContainer: {
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "600",
    marginTop: 20,
    color: "#2d2e2e",
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#4b5563",
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 4,
    marginTop: 30,
    width: 370,
    backgroundColor: "#fff",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    marginVertical: 10,
    fontSize: 16,
  },
  loginButton: {
    width: 100,
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 5,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 40,
  },
  loginButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  signUpContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "300",
  },
  signUpLink: {
    fontSize: 15,
    color: "#00A8FF",
  },
});