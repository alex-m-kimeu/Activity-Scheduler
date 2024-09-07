import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Logo from "../../../assets/images/logo.png";
import { API_BASE_URL } from "@env";
import { useRouter } from "expo-router";

const Account = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    image: "",
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
        image: user.image,
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
      console.log("Token found:", token);
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
      console.log("Fetched user data:", data);
      setUser(data);
      setEditMode(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
      const formData = new FormData();
      formData.append("first_name", editedProfile.firstName);
      formData.append("last_name", editedProfile.lastName);

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
      console.log("Updated user data:", data);
      setUser(data);
      setModalVisible(false);
      Alert.alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error updating profile. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    setEditedProfile({
      firstName: user.first_name,
      lastName: user.last_name,
      oldPassword: "",
      newPassword: "",
      image: user.image,
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
      router.replace("/login");
    } catch (error) {
      console.error("Error removing the token:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Account</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {user && (
        <>
          <Image source={renderUserImageSource()} style={styles.profileImage} />
          <View style={styles.profileContainer}>
            <Text style={styles.nameText}>
              Welcome {user.first_name} {user.last_name}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>Edit Profile</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              <Text style={styles.imagePickerButtonText}>Change Picture</Text>
            </TouchableOpacity>
            <TextInput
              value={editedProfile.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              style={styles.input}
              placeholder="First Name"
            />
            <TextInput
              value={editedProfile.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              style={styles.input}
              placeholder="Last Name"
            />
            <TextInput
              value={editedProfile.oldPassword}
              onChangeText={(value) => handleInputChange("oldPassword", value)}
              style={styles.input}
              placeholder="Enter Old Password"
              secureTextEntry
            />
            <TextInput
              value={editedProfile.newPassword}
              onChangeText={(value) => handleInputChange("newPassword", value)}
              style={styles.input}
              placeholder="Enter New Password"
              secureTextEntry
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#00A8FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: "center",
  },
  profileContainer: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#AD40AF",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 5,
    width: "80%",
    alignItems: "center",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#AD40AF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#1DACD6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePickerButton: {
    backgroundColor: "#AD40AF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  imagePickerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Account;