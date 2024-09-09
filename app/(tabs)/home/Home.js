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
import Card from "./Card";
import Bg from "../../../assets/images/bg.png";

SplashScreen.preventAutoHideAsync();

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loader
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "Outdoor",
  });
  const [image, setImage] = useState(null);
  const [activityId, setActivityId] = useState(null);

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

  const handleEdit = async (activityId) => {
    const activityToEdit = activities.find(activity => activity.id === activityId);
    if (!activityToEdit) {
      console.error("Activity not found");
      return;
    }

    // Populate form data with the activity details
    setFormData({
      title: activityToEdit.title,
      description: activityToEdit.description,
      location: activityToEdit.location,
      category: activityToEdit.category || "Outdoor",
    });

    // Open the modal for editing
    setModalVisible(true);
    setActivityId(activityId); 
  };

  const handleCreate = () => {
    // Clear form data and image state
    clearForm();
    setImage(null);
    setActivityId(null); // Ensure activityId is null for creating a new activity
    setModalVisible(true);
  };

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      category: "Outdoor",
    });
    setTitleError("");
    setDescriptionError("");
    setLocationError("");
  };

  const handleFormSubmit = async () => {
    const errors = {};
  
    // Validate title
    if (!formData.title.trim()) {
      errors.title = "Title should not be empty";
    }
  
    // Validate description word count
    if (formData.description.trim().split(/\s+/).length >= 50) {
      errors.description = "Description should not exceed 50 words";
    }
  
    // Validate location
    if (!formData.location.trim()) {
      errors.location = "Location should not be empty";
    }
  
    // If there are errors, set the error states and return
    if (Object.keys(errors).length > 0) {
      setTitleError(errors.title || "");
      setDescriptionError(errors.description || "");
      setLocationError(errors.location || "");
      return;
    }
  
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
  
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("location", formData.location);
      formDataObj.append("category", formData.category);
  
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
  
      const url = activityId ? `${API_BASE_URL}/activity/${activityId}` : `${API_BASE_URL}/activities`;
      const method = activityId ? "PATCH" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to ${activityId ? "edit" : "post"} activity:`, errorData);
        throw new Error(`Failed to ${activityId ? "edit" : "post"} activity`);
      }
  
      const newActivity = await response.json();
      setActivities((prevActivities) =>
        activityId
          ? prevActivities.map((activity) =>
              activity.id === activityId ? newActivity : activity
            )
          : [...prevActivities, newActivity]
      );
      setModalVisible(false);
      setActivityId(null);
      clearForm();
    } catch (error) {
      console.error(`Error ${activityId ? "editing" : "posting"} activity:`, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleDelete = async (activityId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/activity/${activityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete activity:", errorData);
        throw new Error("Failed to delete activity");
      }

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== activityId)
      );
    } catch (error) {
      console.error("Error deleting activity:", error.message);
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
          <Pressable onPress={handleCreate}>
            <AntDesign name="pluscircle" size={28} color="#00A8FF" />
          </Pressable>
        </View>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A8FF" />
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.noActivitiesContainer}>
            <Image source={Bg} style={styles.noActivitiesImage} />
            <Text style={styles.noActivitiesText}>
              No activities at the moment
            </Text>
            <Pressable onPress={handleCreate}>
              <AntDesign
                name="pluscircle"
                size={28}
                color="#00A8FF"
                style={{ marginTop: 10 }}
              />
            </Pressable>
          </View>
        ) : (
          <View contentContainerStyle={styles.activitiesContainer}>
            {activities.map((activity, index) => (
              <Card
                key={index}
                activity={activity}
                filter={filter}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
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
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Activity</Text>
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
              {titleError ? (
                <Text style={styles.errorText}>{titleError}</Text>
              ) : null}
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
              {descriptionError ? (
                <Text style={styles.errorText}>{descriptionError}</Text>
              ) : null}
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
              {locationError ? (
                <Text style={styles.errorText}>{locationError}</Text>
              ) : null}
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
                  disabled={isSubmitting} // Disable button while submitting
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noActivitiesImage: {
    width: 300,
    height: 300,
  },
  noActivitiesText: {
    color: "#2d2e2e",
    fontFamily: "NunitoSans_700Bold",
    fontSize: 20,
    marginTop: 20,
  },
  activitiesContainer: {
    marginVertical: 20,
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
    marginVertical: 20,
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
  errorText: {
    color: "red",
    marginBottom: 3,
    fontFamily: "NunitoSans_400Regular",
  },
});