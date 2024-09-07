import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Logo from "../../../assets/images/logo.png";
import { API_BASE_URL } from "@env";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ImageResizer from 'react-native-image-resizer';

const Account = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    image: "",
    bio: "",
  });

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
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser(data);
      setEditMode(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserImageSource = () => {
    if (!user || !user.image || user.image.trim() === "") {
      return Logo;
    } else {
      return { uri: user.image };
    }
  };

  const handleEditProfile = () => setModalVisible(true);

  const handleSaveProfile = async () => {
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
        throw new Error("Failed to update profile");
      }
  
      const data = await response.json();
      setUser(data);
      setModalVisible(false);
      Alert.alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error updating profile. Please try again.");
    } finally {
      setProfileUpdateLoading(false);
    }
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
    const resizedImage = await ImageResizer.createResizedImage(
      result.assets[0].uri,
      800,
      600, 
      'JPEG', 
      80 
    );

    setEditedProfile({ ...editedProfile, image: resizedImage.uri });
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            <Text style={styles.profileBio}>
              {user.bio}
            </Text>
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
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={editedProfile.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={editedProfile.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Bio"
              value={editedProfile.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={editedProfile.oldPassword}
              onChangeText={(text) => handleInputChange("oldPassword", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={editedProfile.newPassword}
              onChangeText={(text) => handleInputChange("newPassword", text)}
            />
            <Pressable onPress={pickImage} style={styles.imagePickerButton}>
              <Text style={styles.imagePickerButtonText}>Pick an Image</Text>
            </Pressable>
            <View style={styles.modalButtonContainer}>
              <Pressable onPress={handleSaveProfile} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
              <Pressable onPress={handleCancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
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
    paddingHorizontal: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
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
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d2e2e",
  },
  profileBio: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
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
    width: "80%",
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  imagePickerButtonText: {
    color: "white",
    fontWeight: "bold",
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
  },
});