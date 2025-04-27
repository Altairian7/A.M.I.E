"use client"

import { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Text, Animated, Easing, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle, Path } from "react-native-svg"

const { width, height } = Dimensions.get("window")
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

export default function LoadingScreen({ navigation }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const logoScale = useRef(new Animated.Value(0.5)).current
  const titleSlideUp = useRef(new Animated.Value(50)).current
  const subtitleSlideUp = useRef(new Animated.Value(30)).current

  // Memory particles animations
  const memory1Opacity = useRef(new Animated.Value(0)).current
  const memory2Opacity = useRef(new Animated.Value(0)).current
  const memory3Opacity = useRef(new Animated.Value(0)).current
  const memory4Opacity = useRef(new Animated.Value(0)).current
  const memory5Opacity = useRef(new Animated.Value(0)).current

  const memory1Position = useRef(new Animated.ValueXY({ x: -100, y: 100 })).current
  const memory2Position = useRef(new Animated.ValueXY({ x: width + 50, y: 50 })).current
  const memory3Position = useRef(new Animated.ValueXY({ x: -50, y: height - 100 })).current
  const memory4Position = useRef(new Animated.ValueXY({ x: width + 100, y: height - 150 })).current
  const memory5Position = useRef(new Animated.ValueXY({ x: width / 2 - 100, y: -100 })).current

  // Pulse animation for the brain
  const brainPulse = useRef(new Animated.Value(1)).current

  // Brain animation paths
  const brainPathScale = useRef(new Animated.Value(0)).current
  const brainPathOpacity = useRef(new Animated.Value(0)).current

  // Synapse animations
  const synapse1Opacity = useRef(new Animated.Value(0)).current
  const synapse2Opacity = useRef(new Animated.Value(0)).current
  const synapse3Opacity = useRef(new Animated.Value(0)).current

  // Loading dots animation
  const dot1Opacity = useRef(new Animated.Value(0.3)).current
  const dot2Opacity = useRef(new Animated.Value(0.3)).current
  const dot3Opacity = useRef(new Animated.Value(0.3)).current

  // Circular progress
  const progressValue = useRef(new Animated.Value(0)).current
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Logo scale animation
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start()

    // Brain path animations
    Animated.sequence([
      Animated.timing(brainPathOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(brainPathScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start()

    // Title and subtitle slide up
    Animated.stagger(200, [
      Animated.timing(titleSlideUp, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(subtitleSlideUp, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()

    // Synapse animations
    Animated.stagger(300, [
      Animated.timing(synapse1Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(synapse2Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(synapse3Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()

    // Memory particles animations
    const memoryAnimations = [
      // Memory 1
      Animated.parallel([
        Animated.timing(memory1Opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(memory1Position, {
          toValue: { x: width / 2 - 75, y: height / 2 - 75 },
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),

      // Memory 2
      Animated.parallel([
        Animated.timing(memory2Opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(memory2Position, {
          toValue: { x: width / 2 - 25, y: height / 2 - 100 },
          duration: 2200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),

      // Memory 3
      Animated.parallel([
        Animated.timing(memory3Opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(memory3Position, {
          toValue: { x: width / 2 + 25, y: height / 2 - 50 },
          duration: 2400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),

      // Memory 4
      Animated.parallel([
        Animated.timing(memory4Opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(memory4Position, {
          toValue: { x: width / 2 - 50, y: height / 2 },
          duration: 2600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),

      // Memory 5
      Animated.parallel([
        Animated.timing(memory5Opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(memory5Position, {
          toValue: { x: width / 2, y: height / 2 - 25 },
          duration: 2800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ]

    // Start memory animations
    Animated.stagger(200, memoryAnimations).start()

    // Brain pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainPulse, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(brainPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Loading dots animation
    const animateDots = () => {
      Animated.sequence([
        // Dot 1
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Dot 2
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Dot 3
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Reset
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots())
    }

    animateDots()

    // Progress animation
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 5000, // 5 seconds to load
      useNativeDriver: false,
    }).start(() => {
      // When loading is complete
      setIsLoaded(true)

      // Navigate to main app after a short delay
      setTimeout(() => {
        if (navigation && navigation.replace) {
          navigation.replace("Home")
        }
      }, 500)
    })
  }, [])

  // Calculate the progress circle
  const circleCircumference = 2 * Math.PI * 40 // radius is 40
  const strokeDashoffset = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, 0],
  })

  return (
    <LinearGradient colors={["#4C44B9", "#263077"]} style={styles.container}>
      {/* Background neural network effect */}
      <View style={styles.neuralNetworkContainer}>
        <View style={styles.neuralLine1} />
        <View style={styles.neuralLine2} />
        <View style={styles.neuralLine3} />
        <View style={styles.neuralDot1} />
        <View style={styles.neuralDot2} />
        <View style={styles.neuralDot3} />
      </View>

      {/* Memory particles */}
      <Animated.View
        style={[
          styles.memoryParticle,
          styles.memoryParticle1,
          {
            opacity: memory1Opacity,
            transform: [{ translateX: memory1Position.x }, { translateY: memory1Position.y }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.memoryParticle,
          styles.memoryParticle2,
          {
            opacity: memory2Opacity,
            transform: [{ translateX: memory2Position.x }, { translateY: memory2Position.y }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.memoryParticle,
          styles.memoryParticle3,
          {
            opacity: memory3Opacity,
            transform: [{ translateX: memory3Position.x }, { translateY: memory3Position.y }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.memoryParticle,
          styles.memoryParticle4,
          {
            opacity: memory4Opacity,
            transform: [{ translateX: memory4Position.x }, { translateY: memory4Position.y }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.memoryParticle,
          styles.memoryParticle5,
          {
            opacity: memory5Opacity,
            transform: [{ translateX: memory5Position.x }, { translateY: memory5Position.y }],
          },
        ]}
      />

      <View style={styles.contentContainer}>
        {/* Brain SVG animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScale }, { scale: brainPulse }],
            },
          ]}
        >
          <Svg width="150" height="150" viewBox="0 0 200 200">
            {/* Brain outline */}
            <AnimatedPath
              d="M100,50 C130,50 155,65 170,90 C185,115 185,145 170,170 C155,195 130,210 100,210 C70,210 45,195 30,170 C15,145 15,115 30,90 C45,65 70,50 100,50 Z"
              fill="none"
              stroke="white"
              strokeWidth="3"
              opacity={brainPathOpacity}
              scale={brainPathScale}
            />

            {/* Brain details */}
            <AnimatedPath
              d="M100,70 C115,70 130,75 140,85 C150,95 155,110 155,125 C155,140 150,155 140,165 C130,175 115,180 100,180 C85,180 70,175 60,165 C50,155 45,140 45,125 C45,110 50,95 60,85 C70,75 85,70 100,70 Z"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity={brainPathOpacity}
              scale={brainPathScale}
            />

            {/* Left hemisphere */}
            <AnimatedPath
              d="M60,100 C65,90 75,85 85,85 C95,85 105,90 110,100 C115,110 115,120 110,130 C105,140 95,145 85,145 C75,145 65,140 60,130 C55,120 55,110 60,100 Z"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity={brainPathOpacity}
              scale={brainPathScale}
            />

            {/* Right hemisphere */}
            <AnimatedPath
              d="M140,100 C135,90 125,85 115,85 C105,85 95,90 90,100 C85,110 85,120 90,130 C95,140 105,145 115,145 C125,145 135,140 140,130 C145,120 145,110 140,100 Z"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity={brainPathOpacity}
              scale={brainPathScale}
            />

            {/* Synapses */}
            <AnimatedCircle cx="70" cy="110" r="4" fill="white" opacity={synapse1Opacity} />
            <AnimatedCircle cx="130" cy="110" r="4" fill="white" opacity={synapse2Opacity} />
            <AnimatedCircle cx="100" cy="150" r="4" fill="white" opacity={synapse3Opacity} />
          </Svg>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{ translateY: titleSlideUp }],
            },
          ]}
        >
          A.M.I.E
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: subtitleSlideUp }],
            },
          ]}
        >
          Assistant for Memory, Identity & Emotion
        </Animated.Text>

        {/* Loading dots */}
        <View style={styles.loadingDotsContainer}>
          <Animated.View style={[styles.loadingDot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.loadingDot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.loadingDot, { opacity: dot3Opacity }]} />
        </View>

        {/* Circular progress */}
        <View style={styles.progressContainer}>
          <Svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <Circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="4" fill="transparent" />

            {/* Progress circle */}
            <AnimatedCircle
              cx="50"
              cy="50"
              r="40"
              stroke="#FFFFFF"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>

          {/* Loading text */}
          <Text style={styles.loadingText}>{isLoaded ? "Ready" : "Loading"}</Text>
        </View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>Empathy-driven Technology</Animated.Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 42,
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: "Poppins-Light",
    fontSize: 16,
    color: "#E0E0FF",
    textAlign: "center",
    marginBottom: 40,
    maxWidth: "80%",
  },
  loadingDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    marginBottom: 20,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 5,
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loadingText: {
    position: "absolute",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  tagline: {
    fontFamily: "Poppins-Italic",
    fontSize: 14,
    color: "#E0E0FF",
    opacity: 0.8,
    marginTop: 20,
  },
  // Neural network background
  neuralNetworkContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  neuralLine1: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "80%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ rotate: "30deg" }],
  },
  neuralLine2: {
    position: "absolute",
    top: "40%",
    left: "5%",
    width: "90%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ rotate: "-20deg" }],
  },
  neuralLine3: {
    position: "absolute",
    top: "70%",
    left: "15%",
    width: "70%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ rotate: "15deg" }],
  },
  neuralDot1: {
    position: "absolute",
    top: "25%",
    left: "30%",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  neuralDot2: {
    position: "absolute",
    top: "45%",
    left: "70%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  neuralDot3: {
    position: "absolute",
    top: "65%",
    left: "40%",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  // Memory particles
  memoryParticle: {
    position: "absolute",
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  memoryParticle1: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  memoryParticle2: {
    width: 25,
    height: 25,
    backgroundColor: "rgba(230, 230, 255, 0.25)",
  },
  memoryParticle3: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(200, 200, 255, 0.3)",
  },
  memoryParticle4: {
    width: 35,
    height: 35,
    backgroundColor: "rgba(180, 180, 255, 0.2)",
  },
  memoryParticle5: {
    width: 22,
    height: 22,
    backgroundColor: "rgba(220, 220, 255, 0.25)",
  },
})
