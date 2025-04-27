// screens/HomeScreenWallpaper.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  Dimensions, 
  StatusBar,
  ActivityIndicator,
  Animated,
  PanResponder,
  ToastAndroid,
  Platform
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { getRandomWallpaper } from '../api/apiService';
import { auth } from '../api/firebaseConfig';

const { width, height } = Dimensions.get('window');

// Local family photo as fallback
const FALLBACK_FAMILY_PHOTO = require('../assets/family.jpg');

const HomeScreenWallpaper = ({ navigation }) => {
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [imageLoadStatus, setImageLoadStatus] = useState('loading');
  const [usingFallbackImage, setUsingFallbackImage] = useState(false);
  
  // Animated values for swipe gesture
  const swipeY = new Animated.Value(0);
  const swipeOpacity = swipeY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  // Configure pan responder for swipe detection
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy < 0) {
        // Only allow upward swipe
        swipeY.setValue(Math.abs(gestureState.dy));
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -100) {
        // If swiped up more than 100 pixels, navigate to Home
        Animated.timing(swipeY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          navigation.navigate('Home');
        });
      } else {
        // Reset to original position if not swiped enough
        Animated.spring(swipeY, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true
        }).start();
      }
    }
  });

  const fetchRandomWallpaper = async () => {
    try {
      setLoading(true);
      setError(null);
      setImageLoadStatus('loading');
      
      // Get current user directly from Firebase auth
      const user = auth.currentUser;
      
      if (!user) {
        // Navigate to login if user isn't authenticated
        navigation.navigate('LoginScreen');
        throw new Error('User not authenticated');
      }
      
      try {
        const data = await getRandomWallpaper(user.uid);
        console.log('Wallpaper data received:', data); // Debug the entire response
        
        if (data && data.image && data.image.startsWith('http')) {
          // Valid absolute URL
          console.log('Using image from API:', data.image);
          setWallpaper({
            ...data,
            image: data.image
          });
          setUsingFallbackImage(false);
        } else {
          // Invalid or relative URL, use the fallback image
          console.log('Invalid image URL, using fallback');
          setWallpaper({
            image: 'fallback',  // This is just a placeholder
            description: 'Family at the beach'
          });
          setUsingFallbackImage(true);
        }
      } catch (apiError) {
        console.error('API Error, using fallback image:', apiError);
        // Use fallback family photo
        setWallpaper({
          image: 'fallback',  // This is just a placeholder
          description: 'Family at the beach'
        });
        setUsingFallbackImage(true);
      }
    } catch (error) {
      console.error('Failed to fetch wallpaper:', error);
      setError('Could not load wallpaper');
      
      // Show toast message on Android
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to load wallpaper', ToastAndroid.SHORT);
      }
      
      // Even in case of error, try to use the fallback image
      setWallpaper({
        image: 'fallback',  // This is just a placeholder
        description: 'Family at the beach'
      });
      setUsingFallbackImage(true);
    } finally {
      setLoading(false);
    }
  };

  const updateTime = () => {
    const now = new Date();
    
    // Format time (HH:MM)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
    
    // Format date (Day of week, Month Day)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                   'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const day = now.getDate();
    
    setCurrentDate(`${dayName}, ${monthName} ${day}`);
  };

  useEffect(() => {
    fetchRandomWallpaper();
    
    // Set up time updater
    updateTime();
    const timeInterval = setInterval(updateTime, 60000); // Update every minute
    
    // Refresh wallpaper when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRandomWallpaper();
    });

    return () => {
      clearInterval(timeInterval);
      unsubscribe();
    };
  }, [navigation]);

  const handleImageLoadSuccess = () => {
    console.log('Image loaded successfully');
    setImageLoadStatus('success');
  };

  const handleImageLoadError = (e) => {
    console.error('Image loading error:', e.nativeEvent.error);
    setImageLoadStatus('failed');
    setError('Failed to load image');
    // If API image fails, try using the fallback
    if (!usingFallbackImage) {
      setUsingFallbackImage(true);
      setWallpaper({
        ...wallpaper,
        image: 'fallback'
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (error && !wallpaper) {
    // Show a placeholder background if there's an error and no wallpaper
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="image-off" size={48} iconColor="#FFFFFF" />
        <Text style={styles.errorText}>{error || "No wallpaper available"}</Text>
        <IconButton 
          icon="refresh" 
          size={32}
          iconColor="#FFFFFF"
          onPress={fetchRandomWallpaper}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <Animated.View 
      style={[styles.container, { opacity: swipeOpacity }]}
      {...panResponder.panHandlers}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Use a fallback color while image loads */}
      <View style={styles.wallpaperBackground}>
        {usingFallbackImage ? (
          // Use local fallback image
          <Image 
            source={FALLBACK_FAMILY_PHOTO}
            style={styles.wallpaperImage}
            resizeMode="cover"
            onLoad={handleImageLoadSuccess}
            onError={handleImageLoadError}
          />
        ) : (
          // Use image from API
          <Image 
            source={{ uri: wallpaper.image }}
            style={styles.wallpaperImage}
            resizeMode="cover"
            onLoad={handleImageLoadSuccess}
            onError={handleImageLoadError}
          />
        )}
        
        {imageLoadStatus === 'loading' && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
      
      <View style={styles.overlay}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
        
        <View style={styles.lockIndicator}>
          <IconButton
            icon="chevron-up"
            size={24}
            iconColor="#FFFFFF"
            style={styles.swipeIcon}
          />
          <Text style={styles.swipeText}>Swipe up to unlock</Text>
        </View>
      </View>

      {/* Debug info - only show in development */}
      {__DEV__ && wallpaper && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {usingFallbackImage ? 'Family' : `Using image from API: ${wallpaper.image.substring(0, 50)}...`}
          </Text>
          <Text style={styles.debugText}>Status: {imageLoadStatus}</Text>
          {wallpaper.description && (
            <Text style={styles.debugText}>Description: {wallpaper.description}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    margin: 16,
  },
  wallpaperBackground: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#121212', // Dark fallback background
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 50,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 80,
    fontWeight: '200',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  dateText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lockIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  swipeIcon: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  swipeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
  }
});

export default HomeScreenWallpaper;