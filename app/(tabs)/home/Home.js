import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import * as ImagePicker from "expo-image-picker";
import ImageResizer from "react-native-image-resizer";
import { Picker } from "@react-native-picker/picker";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "Outdoor",
  });
  const [image, setImage] = useState(null);

  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const fetchActivities = async (endpoint) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activities${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch activities:", errorData);
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formDataObj = new FormData();
      for (const key in formData) {
        formDataObj.append(key, formData[key]);
      }

      if (image) {
        const uri = image;
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formDataObj.append("image", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to post activity:", errorData);
        throw new Error("Failed to post activity");
      }

      const newActivity = await response.json();
      setActivities((prevActivities) => [...prevActivities, newActivity]);
      setModalVisible(false);
    } catch (error) {
      console.error("Error posting activity:", error.message);
    }
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
        result.uri,
        300,
        250,
        "JPEG",
        70
      );

      setImage(resizedImage.uri);
    }
  };

  useEffect(() => {
    const endpoint = filter === "all" ? "/all" : "";
    fetchActivities(endpoint);
  }, [filter]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.filterButton,
              filter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "all" && styles.activeFilterButtonText,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              styles.filterButtonLast,
              filter === "my" && styles.activeFilterButton,
            ]}
            onPress={() => setFilter("my")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "my" && styles.activeFilterButtonText,
              ]}
            >
              My Activities
            </Text>
          </Pressable>
          <Pressable onPress={() => setModalVisible(true)}>
            <AntDesign name="pluscircle" size={28} color="#00A8FF" />
          </Pressable>
        </View>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        ) : (
          <View style={styles.activitiesContainer}>
            {activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityText}>{activity.title}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Activity</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                style={styles.textInput}
                placeholder="Title"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                style={styles.textInput}
                placeholder="Description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                style={styles.textInput}
                placeholder="Location"
              />
            </View>
            <View style={styles.inputContainer}>
              <Picker
                selectedValue={formData.category}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setFormData({ ...formData, category: itemValue })
                }
              >
                <Picker.Item label="Outdoor" value="Outdoor" />
                <Picker.Item label="Indoor" value="Indoor" />
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerButtonText}>Pick an image</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleFormSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  filterButton: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonText: {
    color: "#00A8FF",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  filterButtonLast: {
    marginRight: "auto",
  },
  activeFilterButton: {
    backgroundColor: "#00A8FF",
  },
  activeFilterButtonText: {
    color: "white",
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
  activitiesContainer: {
    marginTop: 20,
  },
  activityItem: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  activityText: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_400Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  modalContent: {
    width: 360,
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
    fontFamily: "NunitoSans_700Bold",
    marginBottom: 10,
    color: "#2d2e2e",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 1,
    margin: 10,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    color: "gray",
    marginLeft: 15,
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  picker: {
    width: "100%",
    color: "gray",
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  imagePickerButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  imagePickerButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 20,
  },
  submitButton: {
    backgroundColor: "#00A8FF",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  cancelButton: {
    backgroundColor: "white",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
  },
  cancelButtonText: {
    color: "#00A8FF",
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
});
