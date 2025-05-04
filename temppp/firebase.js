// api/firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  signOut
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRrRfnt89Lej9VNb6IGvgUUEjClAfNY6c",
  authDomain: "hadn-t.firebaseapp.com",
  projectId: "hadn-t",
  storageBucket: "hadn-t.appspot.com",
  messagingSenderId: "820389430068",
  appId: "1:820389430068:web:725cd783ac7cffffb85b61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth, signOut };