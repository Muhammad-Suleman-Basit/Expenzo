// Onboarding.js — the 3 intro slides shown once on first launch (after the
// splash). Swipe or tap "Next"; the last slide's button says "Get Started".
//
// Order (matches the design): purple -> teal -> orange.
// The 3 dots bottom-left are tappable AND animate: the active one stretches
// into a colored pill and "splashes" a ripple in the slide's color.

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");
const INACTIVE_DOT = "#D3D3DE";

// Each slide: accent color, a pale "tint" for the background blobs, an icon,
// title (with a line break), subtitle, and the button label.
const SLIDES = [
  {
    key: "finances",
    accent: "#38BDF8", // purple ("blue")
    tint: "#ECE9FB",
    icon: "wallet",
    title: "Take Control of\nYour Finances",
    subtitle:
      "Manage your money with ease. Track expenses, income, and budgets all in one place.",
    button: "Next",
  },
  {
    key: "analytics",
    accent: "#1ED9B0", // teal ("green")
    tint: "#E1F7F2",
    icon: "pie-chart",
    title: "Smart Analytics\n& Insights",
    subtitle:
      "Visualize your spending habits with beautiful charts and gain insights to save more.",
    button: "Next",
  },
  {
    key: "secure",
    accent: "#F5A623", // orange ("yellow")
    tint: "#FDF1DE",
    icon: "shield-half",
    title: "Secure & Offline\nData Protection",
    subtitle:
      "Your data stays on your device. No internet required, 100% private and secure.",
    button: "Get Started",
  },
];

// One animated page dot. Stretches into a pill when active and bursts a
// colored "splash" ripple each time it becomes active.
function Dot({ active, accent, onPress }) {
  const w = useRef(new Animated.Value(active ? 1 : 0)).current; // width (non-native)
  const ripple = useRef(new Animated.Value(0)).current; // splash (native)

  useEffect(() => {
    Animated.spring(w, {
      toValue: active ? 1 : 0,
      friction: 6,
      tension: 90,
      useNativeDriver: false, // animating width
    }).start();

    if (active) {
      ripple.setValue(0);
      Animated.timing(ripple, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true, // animating scale + opacity
      }).start();
    }
  }, [active]);

  const width = w.interpolate({ inputRange: [0, 1], outputRange: [8, 26] });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.6] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.dotWrap}>
      {/* the color splash */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ripple,
          { backgroundColor: accent, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
        ]}
      />
      {/* the dot / pill */}
      <Animated.View
        style={[styles.dot, { width, backgroundColor: active ? accent : INACTIVE_DOT }]}
      />
    </Pressable>
  );
}

// One full-screen slide.
function Slide({ slide }) {
  return (
    <View style={styles.slide}>
      {/* decorative pale blobs (top-right + bottom-left) */}
      <View style={[styles.blobTop, { backgroundColor: slide.tint }]} />
      <View style={[styles.blobBottom, { backgroundColor: slide.tint }]} />

      {/* icon inside a white circle with a colored glow */}
      <View style={styles.iconArea}>
        <View style={[styles.iconGlow, { backgroundColor: slide.accent }]} />
        <View style={[styles.iconCircle, { shadowColor: slide.accent }]}>
          <Ionicons name={slide.icon} size={62} color={slide.accent} />
        </View>
      </View>

      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>
    </View>
  );
}

export default function Onboarding({ onDone }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  // Scroll to a given page (used by the button and by tapping a dot).
  function goTo(i) {
    listRef.current?.scrollToOffset({ offset: i * SCREEN_W, animated: true });
    setIndex(i);
  }

  // Button: advance, or finish on the last slide.
  function handleNext() {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
    } else {
      onDone();
    }
  }

  // Keep the dots/button in sync when the user swipes.
  function onScrollEnd(e) {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  }

  const current = SLIDES[index];

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => <Slide slide={item} />}
      />

      {/* Bottom controls: dots on the left, button on the right.
          box-none lets swipes pass through the empty middle to the list. */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 22 }]}
        pointerEvents="box-none"
      >
        <View style={styles.dotsRow}>
          {SLIDES.map((s, i) => (
            <Dot
              key={s.key}
              active={i === index}
              accent={current.accent}
              onPress={() => goTo(i)}
            />
          ))}
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: current.accent, shadowColor: current.accent }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>{current.button}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 150, // keep content clear of the bottom controls
    overflow: "hidden",
  },

  // Decorative blobs
  blobTop: {
    position: "absolute",
    top: -SCREEN_W * 0.32,
    right: -SCREEN_W * 0.28,
    width: SCREEN_W * 0.9,
    height: SCREEN_W * 0.9,
    borderRadius: SCREEN_W * 0.45,
  },
  blobBottom: {
    position: "absolute",
    bottom: -SCREEN_W * 0.22,
    left: -SCREEN_W * 0.3,
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.7,
    borderRadius: SCREEN_W * 0.35,
  },

  // Icon
  iconArea: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  iconGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.16, // soft colored halo (mainly for Android)
  },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    // colored glow (iOS) / lift (Android)
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  // Text
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#15151E",
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E9A",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 18,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotWrap: {
    width: 30,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 999,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
