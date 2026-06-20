// AnimatedSplash.js
// A full-screen animated splash overlay for EXPENZO.
// Runs in Expo Go (uses react-native-svg + React Native's built-in Animated API).
//
// How it works:
//   - It renders on top of your whole app when the app starts.
//   - It animates in (mark scales up, text rises, waves slide up, dots pulse),
//     holds for a moment, then fades out and calls onFinish().
//   - In App.js you keep it mounted until onFinish runs, then unmount it.
//
// Put this file at:  src/components/AnimatedSplash.js
// Wiring for App.js is in the chat message that came with this file.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from "react-native-svg";


const { width: W, height: H } = Dimensions.get("window");

// Brand colors (match your icon + splash image)
const C = {
  bg: "#F3F9FD",
  tileA: "#38BDF8",
  tileB: "#38BDF8",
  ring: "#FFFFFF",
  slice: "#BFEFFF",
  word: "#38BDF8",
  tagline: "#38BDF8",
  tagDot: "#38BDF8",
  dotPurple: "#38BDF8",
  dotLight: "#38BDF8",
  waveBack: "#DDF4FF",
  waveMid: "#C7ECFF",
  waveFront: "#B1E4FF",
};

// Build an SVG arc path (used for the coloured "pie slice" on the donut).
// 0 degrees = top, angle increases clockwise.
function arcPath(cx, cy, r, startDeg, endDeg) {
  const toXY = (deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const [x1, y1] = toXY(startDeg);
  const [x2, y2] = toXY(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default function AnimatedSplash({ onFinish }) {
  // Animated values
  const container = useRef(new Animated.Value(1)).current;   // whole-screen fade-out
  const markScale = useRef(new Animated.Value(0.6)).current; // logo pop-in
  const markOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current; // wordmark + tagline
  const textY = useRef(new Animated.Value(16)).current;
  const waveY = useRef(new Animated.Value(H * 0.22)).current; // waves rise from below
  const bob = useRef(new Animated.Value(0)).current;          // gentle wave bob (loop)
  const d1 = useRef(new Animated.Value(0.4)).current;         // loading dots
  const d2 = useRef(new Animated.Value(0.4)).current;
  const d3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // --- entrance animation ---
    Animated.parallel([
      Animated.spring(markScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(markOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(waveY, { toValue: 0, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(textOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(textY, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
    ]).start();

    // --- gentle continuous wave bob ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // --- loading dots pulse (staggered) ---
    const pulse = (v) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ])
      );
    Animated.stagger(160, [pulse(d1), pulse(d2), pulse(d3)]).start();

    // --- hold, then fade the splash out and tell the app we're done ---
    const timer = setTimeout(() => {
      Animated.timing(container, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2600); // total time on screen ~3s. Change this to make it longer/shorter.

    return () => clearTimeout(timer);
  }, []);

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  // Donut geometry inside a 100x100 viewBox
  const CX = 50, CY = 50, RING_R = 30, RING_W = 11;

  return (
    <Animated.View style={[styles.fill, { opacity: container }]} pointerEvents="none">
      {/* background + airy decor */}
      <Svg style={StyleSheet.absoluteFill} width={W} height={H}>
        <Rect x="0" y="0" width={W} height={H} fill={C.bg} />
        <Circle cx={W * 0.04} cy={H * 0.04} r={W * 0.3} stroke="#38BDF8" strokeOpacity={0.45} strokeWidth={W * 0.018} fill="none" />
        <Circle cx={W * 0.98} cy={H * 0.43} r={W * 0.17} fill="#38BDF8" fillOpacity={0.4} />
        <Circle cx={W * 0.15} cy={H * 0.2} r={6} fill="#38BDF8" />
        <Circle cx={W * 0.8} cy={H * 0.05} r={5} fill="#38BDF8" />
        <Circle cx={W * 0.1} cy={H * 0.7} r={7} fill="#38BDF8" fillOpacity={0.7} />
      </Svg>

      {/* waves (rise in, then gently bob) */}
      <Animated.View style={[styles.waves, { transform: [{ translateY: Animated.add(waveY, bobY) }] }]}>
        <Svg width={W} height={H * 0.22} viewBox={`0 0 ${W} ${H * 0.22}`} preserveAspectRatio="none">
          <Path d={`M0 ${H * 0.05} C ${W * 0.3} ${H * 0.0}, ${W * 0.55} ${H * 0.09}, ${W} ${H * 0.045} L ${W} ${H * 0.22} L 0 ${H * 0.22} Z`} fill={C.waveBack} />
          <Path d={`M0 ${H * 0.09} C ${W * 0.35} ${H * 0.05}, ${W * 0.6} ${H * 0.13}, ${W} ${H * 0.085} L ${W} ${H * 0.22} L 0 ${H * 0.22} Z`} fill={C.waveMid} />
          <Path d={`M0 ${H * 0.135} C ${W * 0.3} ${H * 0.105}, ${W * 0.6} ${H * 0.165}, ${W} ${H * 0.13} L ${W} ${H * 0.22} L 0 ${H * 0.22} Z`} fill={C.waveFront} />
        </Svg>
      </Animated.View>

      {/* logo mark (scales + fades in) */}
      <Animated.View style={[styles.markWrap, { opacity: markOpacity, transform: [{ scale: markScale }] }]}>
        <Svg width={86} height={86} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.tileA} />
              <Stop offset="1" stopColor={C.tileB} />
            </LinearGradient>
          </Defs>
          <Rect x="6" y="6" width="88" height="88" rx="24" fill="url(#tile)" />
          <Circle cx={CX} cy={CY} r={RING_R} stroke={C.ring} strokeWidth={RING_W} fill="none" />
          <Path d={arcPath(CX, CY, RING_R, 0, 118)} stroke={C.slice} strokeWidth={RING_W} fill="none" />
        </Svg>
      </Animated.View>

      {/* wordmark + tagline (rise + fade in) */}
      <Animated.View style={[styles.textWrap, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        <Text style={styles.word}>EXPENZO</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagDot} />
          <Text style={styles.tagline}>Track Smart. Spend Smarter.</Text>
          <View style={styles.tagDot} />
        </View>
      </Animated.View>

      {/* loading indicator */}
      <View style={styles.loadWrap}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.ld, { backgroundColor: C.dotLight, opacity: d1 }]} />
          <Animated.View style={[styles.ld, { backgroundColor: C.dotPurple, opacity: d2 }]} />
          <Animated.View style={[styles.ld, { backgroundColor: C.dotLight, opacity: d3 }]} />
        </View>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999, // sit on top of the app
  },
  waves: { position: "absolute", left: 0, right: 0, bottom: 0 },
  markWrap: { position: "absolute", top: H * 0.34 },
  textWrap: { position: "absolute", top: H * 0.34 + 112, alignItems: "center" },
  word: { fontSize: 34, fontWeight: "800", letterSpacing: 2, color: C.word },
  tagRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  tagDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.tagDot, marginHorizontal: 8 },
  tagline: { fontSize: 13, letterSpacing: 0.4, color: C.tagline },
  loadWrap: { position: "absolute", bottom: H * 0.07, alignItems: "center" },
  dotsRow: { flexDirection: "row" },
  ld: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  loading: { marginTop: 12, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: C.dotPurple },
});