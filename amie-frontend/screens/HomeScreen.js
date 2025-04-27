// screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { auth, signOut } from '../api/firebaseConfig'; // <-- updated path

export default function HomeScreen({ navigation }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('LoginScreen'); // <-- Replace with your actual login screen name
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Super App</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Super App!</Text>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('PermissionsDebug')}
        >
          <Text style={styles.debugButtonText}>Permissions Debug</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('ReminderScreen')}
        >
          <Text style={styles.debugButtonText}>Go To Reminder Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('AudioUploadScreen')}
        >
          <Text style={styles.debugButtonText}>Go To Audio Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.debugButtonText}>Go To ProfileScreen Page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('WallpaperUploadScreen')}
        >
          <Text style={styles.debugButtonText}>Go To WallpaperUpload Page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => navigation.navigate('HomeScreenWallpaper')}
        >
          <Text style={styles.debugButtonText}>Go To HomeScreenWallpaper Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={handleSignOut}
        >
          <Text style={styles.debugButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 30,
    color: '#333',
  },
  debugButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
