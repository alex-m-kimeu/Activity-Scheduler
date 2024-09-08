// import { Pressable, StyleSheet, Text, View } from "react-native";
// import React, { useState, useEffect } from "react";
// import moment from "moment";
// import { Calendar } from "react-native-calendars";
// import axios from "axios";
// import { API_BASE_URL } from "@env";
// import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";

// const Calendars = () => {
//   const today = moment().format("YYYY-MM-DD");
//   const [selectedDate, setSelectedDate] = useState(today);
//   const [todos, setTodos] = useState([]);

//   const fetchCompletedTodos = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3000/todos/completed/${selectedDate}`
//       );

//       const completedTodos = response.data.completedTodos || [];
//       setTodos(completedTodos);
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   useEffect(() => {
//     fetchCompletedTodos();
//   }, [selectedDate]);

//   const handleDayPress = (day) => {
//     setSelectedDate(day.dateString);
//   };

//   return (
//     <View style={styles.container}>
//       <Calendar
//         onDayPress={handleDayPress}
//         markedDates={{
//           [selectedDate]: { selected: true, selectedColor: "#7CB9E8" },
//         }}
//       />

//       <View style={styles.activitiesHeader}>
//         <Text style={styles.activitiesText}>Activities</Text>
//         <MaterialIcons name="arrow-drop-down" size={24} color="black" />
//       </View>

//       {todos?.map((item, index) => (
//         <Pressable style={styles.todoItem} key={index}>
//           <View style={styles.todoItemContent}>
//             <FontAwesome name="circle" size={18} color="gray" />
//             <Text style={styles.todoItemText}>{item?.title}</Text>
//             <Feather name="flag" size={20} color="gray" />
//           </View>
//         </Pressable>
//       ))}
//     </View>
//   );
// };

// export default Calendars;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   activitiesHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     marginVertical: 10,
//     marginHorizontal: 10,
//   },
//   activitiesText: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   todoItem: {
//     backgroundColor: "#E0E0E0",
//     padding: 10,
//     borderRadius: 7,
//     marginVertical: 10,
//     marginHorizontal: 10,
//   },
//   todoItemContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   todoItemText: {
//     flex: 1,
//     textDecorationLine: "line-through",
//     color: "gray",
//   },
// });

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Calendars = () => {
  return (
    <View>
      <Text>Calendars</Text>
    </View>
  )
}

export default Calendars

const styles = StyleSheet.create({})