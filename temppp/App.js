import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Camera from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(0); // 0: front, 1: back
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [lastFrame, setLastFrame] = useState(null);

  const cameraRef = useRef(null);
  const websocketRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  // UID passed to backend
  const userUID = "nx8mtLRaMWaYSs75LNzUQnBkbNn2";

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    connectWebSocket();

    return () => {
      if (websocketRef.current) websocketRef.current.close();
      if (streamingIntervalRef.current)
        clearInterval(streamingIntervalRef.current);
    };
  }, []);

  const connectWebSocket = () => {
    if (websocketRef.current && websocketRef.current.readyState !== WebSocket.CLOSED) {
        console.log('WebSocket already connected or connecting');
        return;
    }

    const token = "nx8mtLRaMWaYSs75LNzUQnBkbNn2"; // Replace with actual token
    const BACKEND_URL = `ws://192.168.0.104:8000/ws/face-recognition/?token=${token}`; // Pass token as query parameter

    try {
        const ws = new WebSocket(BACKEND_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        websocketRef.current = ws;

        websocketRef.current.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log('Received:', response);

            if (response.type === 'face_detection_result') {
                setProcessing(false);
                setResults(response.identified_people || []);
            } else if (response.type === 'error') {
                setProcessing(false);
                console.error('Server error:', response.message);
            }
        };

        websocketRef.current.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            setIsConnected(false);
            setIsStreaming(false);
            if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
            setTimeout(() => connectWebSocket(), 3000);
        };

        websocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

    } catch (error) {
        console.error('WebSocket connection error:', error);
        setTimeout(connectWebSocket, 3000); // Retry after 3 seconds
    }
};


  const captureFrame = async () => {
    if (!cameraRef.current || processing) return;

    try {
      setProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2,
        skipProcessing: true,
      });

      const processedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 320 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      setLastFrame(processedImage.uri);

      const response = await fetch(processedImage.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = () => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(
            JSON.stringify({
              type: "image",
              image: reader.result,
            })
          );
        } else {
          setProcessing(false);
          console.error("WebSocket is not connected");
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error capturing frame:", error);
      setProcessing(false);
    }
  };

  const toggleStreaming = () => {
    if (isStreaming) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
      setIsStreaming(false);
    } else {
      setIsStreaming(true);
      captureFrame();
      streamingIntervalRef.current = setInterval(() => {
        if (!processing) captureFrame();
      }, 1500);
    }
  };

  const flipCamera = () => {
    setCameraType(cameraType === 1 ? 0 : 1);
  };

  const renderResults = () => {
    if (results.length === 0) {
      return (
        <Text style={styles.noResultsText}>
          {isStreaming
            ? "Looking for faces..."
            : "Start streaming to identify faces"}
        </Text>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Identified People:</Text>
        {results.map((person, index) => (
          <View key={index} style={styles.personItem}>
            <Text style={styles.personName}>{person.person_name}</Text>
            <Text style={styles.confidence}>
              Confidence: {person.confidence}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (hasPermission === null)
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  if (hasPermission === false)
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Face Recognition</Text>
        <View
          style={[
            styles.statusIndicator,
            isConnected ? styles.connected : styles.disconnected,
          ]}
        >
          <Text style={styles.statusText}>
            {isConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={
            cameraType === 0
              ? Camera.Constants?.Type?.front || 0
              : Camera.Constants?.Type?.back || 1
          }
          ratio="16:9"
        />
        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        {isStreaming && (
          <View style={styles.streamingIndicator}>
            <View style={styles.streamingDot} />
            <Text style={styles.streamingText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.streamButton,
            isStreaming ? styles.streamingActive : styles.streamingInactive,
          ]}
          onPress={toggleStreaming}
          disabled={!isConnected}
        >
          <Text style={styles.streamButtonText}>
            {isStreaming ? "Stop" : "Start"} Live Recognition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
          <Text style={styles.flipText}>Flip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.resultsScrollContent}
      >
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  cameraContainer: {
    height: 400,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 10,
    position: "relative",
  },
  camera: { flex: 1 },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  streamButton: {
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
    minWidth: 200,
    alignItems: "center",
  },
  streamingActive: { backgroundColor: "#e74c3c" },
  streamingInactive: { backgroundColor: "#3498db" },
  streamButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  flipButton: {
    backgroundColor: "#7f8c8d",
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: "center",
  },
  flipText: { color: "white", fontSize: 16 },
  processingOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  streamingIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 12,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e74c3c",
    marginRight: 5,
  },
  streamingText: { color: "white", fontWeight: "bold", fontSize: 12 },
  resultsScroll: { flex: 1 },
  resultsScrollContent: { padding: 16 },
  noResultsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
  resultsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    elevation: 3,
  },
  resultsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  personItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  personName: { fontSize: 16, fontWeight: "bold" },
  confidence: { color: "#666", marginTop: 4 },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  connected: { backgroundColor: "#2ecc71" },
  disconnected: { backgroundColor: "#e74c3c" },
  statusText: { color: "white", fontWeight: "bold", fontSize: 12 },
});
