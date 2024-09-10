import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Avatar from "../../../assets/images/avatar.png";
import { API_BASE_URL } from "@env";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageResizer from "react-native-image-resizer";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Account = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [validatingOldPassword, setValidatingOldPassword] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    image: "",
    bio: "",
  });

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [bioError, setBioError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setEditedProfile({
        firstName: user.first_name,
        lastName: user.last_name,
        oldPassword: "",
        newPassword: "",
        image: user.image || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `https://3b01-2c0f-2a80-10c0-4210-dc36-f099-6af0-d02e.ngrok-free.app/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch user profile:", errorData);
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser(data);
      setModalVisible(false);
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUserImageSource = () => {
    if (!user || !user.image || user.image.trim() === "") {
      return Avatar;
    } else {
      return { uri: user.image };
    }
  };

  const handleEditProfile = () => setModalVisible(true);

  const validateOldPassword = async () => {
    try {
      setValidatingOldPassword(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return false;
      }

      const response = await fetch(
        `https://3b01-2c0f-2a80-10c0-4210-dc36-f099-6af0-d02e.ngrok-free.app/validate-old-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ old_password: editedProfile.oldPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Old password does not match") {
          setPasswordError("Old password does not match");
        } else {
          console.error("Failed to validate old password:", errorData);
        }
        return false;
      }

      setPasswordError("");
      return true;
    } catch (error) {
      console.error("Error validating old password:", error.message);
      return false;
    } finally {
      setValidatingOldPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    const errors = {};

    // Validate first name
    if (!editedProfile.firstName.trim()) {
      errors.firstName = "First name should not be empty";
      setFirstNameError(errors.firstName);
    } else {
      setFirstNameError("");
    }

    // Validate last name
    if (!editedProfile.lastName.trim()) {
      errors.lastName = "Last name should not be empty";
      setLastNameError(errors.lastName);
    } else {
      setLastNameError("");
    }

    // Validate bio
    if (editedProfile.bio.trim().split(/\s+/).length >= 50) {
      errors.bio = "Bio should not exceed 50 words";
      setBioError(errors.bio);
    } else {
      setBioError("");
    }

    // Validate new password
    if (editedProfile.oldPassword && editedProfile.newPassword) {
      if (editedProfile.newPassword.length < 6) {
        errors.newPassword = "Password should be at least 6 characters long";
      } else if (!/[A-Z]/.test(editedProfile.newPassword)) {
        errors.newPassword =
          "Password should contain at least one uppercase letter";
      } else if (!/[a-z]/.test(editedProfile.newPassword)) {
        errors.newPassword =
          "Password should contain at least one lowercase letter";
      } else if (!/[0-9]/.test(editedProfile.newPassword)) {
        errors.newPassword = "Password should contain at least one digit";
      } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(editedProfile.newPassword)) {
        errors.newPassword =
          "Password should contain at least one special character";
      } else {
        setPasswordError("");
      }
      setPasswordError(errors.newPassword);
    }

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Validate old password before proceeding
    if (editedProfile.oldPassword) {
      const isOldPasswordValid = await validateOldPassword();
      if (!isOldPasswordValid) {
        return;
      }
    }

    try {
      setProfileUpdateLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        setProfileUpdateLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("first_name", editedProfile.firstName);
      formData.append("last_name", editedProfile.lastName);
      formData.append("bio", editedProfile.bio);

      if (editedProfile.oldPassword && editedProfile.newPassword) {
        formData.append("old_password", editedProfile.oldPassword);
        formData.append("new_password", editedProfile.newPassword);
      }

      if (editedProfile.image) {
        const uri = editedProfile.image;
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const response = await fetch(uri);
        const blob = await response.blob();

        formData.append("image", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          if (errorData.errors.first_name) {
            setFirstNameError(errorData.errors.first_name);
          }
          if (errorData.errors.last_name) {
            setLastNameError(errorData.errors.last_name);
          }
          if (errorData.errors.bio) {
            setBioError(errorData.errors.bio);
          }
          if (errorData.errors.password) {
            setPasswordError(errorData.errors.password);
          }
        } else if (errorData.error === "Old password does not match") {
          setPasswordError("Old password does not match");
        } else {
          console.error("Failed to update profile:", errorData);
          throw new Error("Failed to update profile");
        }
        return;
      }

      const data = await response.json();
      setUser(data);
      setModalVisible(false);
      setAlertVisible(true);
    } catch (error) {
      console.error("Error updating profile:", error.message);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleAlertDismiss = () => {
    setAlertVisible(false);
    router.replace("/(tabs)/account");
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    setEditedProfile({
      firstName: user.first_name,
      lastName: user.last_name,
      oldPassword: "",
      newPassword: "",
      bio: user.bio || "",
      image: user.image || "",
    });
  };

  const handleInputChange = (name, value) => {
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEditedProfile({ ...editedProfile, image: result.assets[0].uri });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      router.replace("/Welcome");
    } catch (error) {
      console.error("Error Signing Out:", error);
    }
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)/home");
  };

  if (loading || profileUpdateLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00A8FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>My Profile</Text>
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleBackToHome} style={styles.backButton}>
            <AntDesign name="arrowleft" size={22} color="#2d2e2e" />
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
            <MaterialIcons name="logout" size={24} color="white" />
          </Pressable>
        </View>
        <View style={styles.profileContainer}>
          <Image source={renderUserImageSource()} style={styles.profileImage} />
          <Text style={styles.profileName}>
            {user ? `${user.first_name} ${user.last_name}` : ""}
          </Text>
          {user && user.bio && (
            <Text style={styles.profileBio}>{user.bio}</Text>
          )}
        </View>
        <View style={styles.editButtonContainer}>
          <Pressable onPress={handleEditProfile} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <AntDesign name="arrowright" size={20} color="white" />
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Image
              source={
                editedProfile.image
                  ? { uri: editedProfile.image }
                  : renderUserImageSource()
              }
              style={styles.profileImage}
            />
            <View style={styles.inputContainer}>
              <TextInput
                value={editedProfile.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                style={styles.textInput}
                placeholder="First Name"
              />
            </View>
            {firstNameError ? (
              <Text style={styles.errorText}>{firstNameError}</Text>
            ) : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={editedProfile.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                style={styles.textInput}
                placeholder="Last Name"
              />
            </View>
            {lastNameError ? (
              <Text style={styles.errorText}>{lastNameError}</Text>
            ) : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={editedProfile.bio}
                onChangeText={(text) => handleInputChange("bio", text)}
                style={styles.textInput}
                placeholder="Bio"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            {bioError ? <Text style={styles.errorText}>{bioError}</Text> : null}
            <View style={styles.inputContainer}>
              <TextInput
                value={editedProfile.oldPassword}
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => handleInputChange("oldPassword", text)}
                style={styles.textInput}
                placeholder="Old Password"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={editedProfile.newPassword}
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => handleInputChange("newPassword", text)}
                style={styles.textInput}
                placeholder="New Password"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            <Pressable onPress={pickImage} style={styles.imagePickerButton}>
              <Text style={styles.imagePickerButtonText}>Pick an Image</Text>
            </Pressable>
            <View style={styles.modalButtonContainer}>
              <Pressable
                onPress={handleSaveProfile}
                style={styles.saveButton}
                disabled={validatingOldPassword}
              >
                {validatingOldPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
              <Pressable onPress={handleCancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={alertVisible}
        animationType="slide"
        onRequestClose={handleAlertDismiss}
      >
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertMessage}>
              Profile updated successfully
            </Text>
            <Pressable style={styles.alertButton} onPress={handleAlertDismiss}>
              <Text style={styles.alertButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    marginBottom: 10,
    color: "#00A8FF",
    textAlign: "center",
    textTransform: "uppercase",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00A8FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: {
    color: "white",
    marginRight: 5,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "NunitoSans_700Bold",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "NunitoSans_400Regular",
  },
  editButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00A8FF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: "white",
    marginRight: 5,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "NunitoSans_700Bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  modalContent: {
    width: 370,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: "NunitoSans_700Bold",
    color: "#2d2e2e",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 4,
    margin: 10,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    marginVertical: 10,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  imagePickerButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
    margin: 20,
  },
  imagePickerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "NunitoSans_700Bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "NunitoSans_700Bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "NunitoSans_700Bold",
  },
  alertContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertBox: {
    width: 350,
    padding: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "400",
    fontFamily: "NunitoSans_400Regular",
  },
  alertButton: {
    backgroundColor: "#00A8FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "NunitoSans_700Bold",
  },
});
