import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../../assets/images/logo.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const handleRegister = () => {
    const user = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    };

    axios
      .post("http://127.0.0.1:5500/signup", user)
      .then((response) => {
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);
        router.replace("/(tabs)/home");
        Alert.alert(
          "Registration successful",
          "You have been registered successfully"
        );
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        Alert.alert(
          "Registration failed",
          "An error occurred during registration"
        );
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>
      <KeyboardAvoidingView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Get Started</Text>
          <Text style={styles.subHeaderText}>Create your account now</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
              style={styles.textInput}
              placeholder="First name"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={lastName}
              onChangeText={(text) => setLastName(text)}
              style={styles.textInput}
              placeholder="Last name"
            />
          </View>

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

          <Pressable onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register</Text>
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Have an account?</Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

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
    marginTop: 20,
    width: 370,
    backgroundColor: "#fff",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    marginVertical: 10,
    fontSize: 16,
  },
  registerButton: {
    width: 100,
    backgroundColor: "#00A8FF",
    padding: 12,
    borderRadius: 5,
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
  },
  loginText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "300",
  },
  loginLink: {
    fontSize: 15,
    color: "#00A8FF",
  },
});