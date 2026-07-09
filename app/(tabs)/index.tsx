import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 71 + 30) % (W - 20),
  y: (i * 113 + 60) % (H - 100),
  size: 1.5 + (i % 3) * 0.8,
  delay: (i * 233) % 2000,
  duration: 2500 + (i * 317) % 2000,
}));

function Particle({ x, y, size, delay, duration }: (typeof PARTICLE_DATA)[0]) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1 + Math.random() * 0.3);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-60 - size * 10, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration * 0.5 }),
          withTiming(0.08, { duration: duration * 0.5 })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#9D4EDD",
        },
        style,
      ]}
    />
  );
}

function GlowingEye() {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.eyeWrapper}>
      <Animated.View style={[styles.eyeGlow, glowStyle]} />
      <Animated.View style={eyeStyle}>
        <Ionicons name="eye" size={88} color="#9D4EDD" />
      </Animated.View>
    </View>
  );
}

export default function SplashScreen() {
  const [displayText, setDisplayText] = useState("");
  const [showSub, setShowSub] = useState(false);
  const subOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const fullText = "OmniLens AI";

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });

    const startTypewriter = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        index++;
        setDisplayText(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(interval);
          setTimeout(() => {
            setShowSub(true);
            subOpacity.value = withTiming(1, { duration: 800 });
          }, 300);
        }
      }, 90);
      return () => clearInterval(interval);
    }, 700);

    const navTimer = setTimeout(() => {
      router.replace("/home");
    }, 3500);

    return () => {
      clearTimeout(startTypewriter);
      clearTimeout(navTimer);
    };
  }, []);

  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#0D0520", "#1A0A2E"]}
        style={StyleSheet.absoluteFill}
      />
      {PARTICLE_DATA.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <Animated.View style={[styles.centerContent, logoStyle]}>
        <GlowingEye />

        <Text style={styles.appName}>{displayText}</Text>
        {displayText.length < fullText.length && (
          <View style={styles.cursor} />
        )}

        <Animated.View style={subStyle}>
          <Text style={styles.tagline}>Decode Your World</Text>
        </Animated.View>
      </Animated.View>

      <Text style={[styles.nitenText, Platform.OS === "web" ? { bottom: 34 + 16 } : {}]}>
        by NITEN
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  eyeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eyeGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "transparent",
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 30,
  },
  appName: {
    fontSize: 38,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(157,78,221,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 38,
    backgroundColor: "#9D4EDD",
    marginLeft: 2,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 2,
    marginTop: 4,
  },
  nitenText: {
    position: "absolute",
    bottom: 32,
    right: 24,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#555555",
  },
});
