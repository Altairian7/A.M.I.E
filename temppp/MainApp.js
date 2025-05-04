import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from './AuthContext'; // Assuming you have an auth context

const MainApp = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [isConnected, setIsConnected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const cameraRef = useRef(null);
  const websocketRef = useRef(null);
  const { currentUser } = useAuth(); // Get current user from auth context

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Connect to WebSocket when component mounts
    connectWebSocket();
    
    // Cleanup
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    // Get your backend URL from environment variables or config
    const BACKEND_URL = 'ws://127.0.0.1:8000/ws/face-recognition/';
    
    // Add user's Firebase UID as query parameter for authentication
    const wsUrl = `${BACKEND_URL}?uid=${currentUser?.uid || ''}`;
    
    websocketRef.current = new WebSocket(wsUrl);
    
    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };
    
    websocketRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data);
      
      console.log('Received message:', response);
      
      if (response.type === 'face_detection_result') {
        setProcessing(false);
        setResults(response.identified_people || []);
        
        if (response.identified_people?.length === 0) {
          Alert.alert('No faces identified', response.message);
        }
      } else if (response.type === 'error') {
        setProcessing(false);
        Alert.alert('Error', response.message);
      }
    };
    
    websocketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      setIsConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
    
    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setProcessing(true);
        setResults([]);
        
        // Capture photo
        const photo = await cameraRef.current.takePictureAsync();
        
        // Resize and compress for better transmission
        const processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setCapturedImage(processedImage.uri);
        
        // Convert to base64 and send via WebSocket
        const response = await fetch(processedImage.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({
              type: 'image',
              image: reader.result
            }));
          } else {
            setProcessing(false);
            Alert.alert('Error', 'WebSocket is not connected');
          }
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error taking picture:', error);
        setProcessing(false);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  const renderResults = () => {
    if (results.length === 0) return null;
    
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Identified People:</Text>
        {results.map((person, index) => (
          <View key={index} style={styles.personItem}>
            <Text style={styles.personName}>{person.person_name}</Text>
            <Text style={styles.confidence}>Confidence: {person.confidence}</Text>
          </View>
        ))}
      </View>
    );
  };

  const ConnectionStatus = () => (
    <View style={[styles.statusIndicator, 
      isConnected ? styles.connected : styles.disconnected]}>
      <Text style={styles.statusText}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ConnectionStatus />
      
      <View style={styles.cameraContainer}>
        <Camera 
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        />
        
        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePicture}
          disabled={processing || !isConnected}
        >
          <Text style={styles.captureText}>
            {processing ? 'Processing...' : 'Capture'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
          <Text style={styles.flipText}>Flip</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsScroll}>
        {capturedImage && (
          <View style={styles.capturedImageContainer}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.capturedImage} 
              resizeMode="contain"
            />
          </View>
        )}
        
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  cameraContainer: {
    height: 400,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 16,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  captureButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  captureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flipButton: {
    backgroundColor: '#7f8c8d',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  resultsScroll: {
    flex: 1,
  },
  capturedImageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  capturedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  personItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidence: {
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-end',
    margin: 12,
  },
  connected: {
    backgroundColor: '#2ecc71',
  },
  disconnected: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MainApp;