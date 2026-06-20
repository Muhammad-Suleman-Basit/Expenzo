// LiquidWaves.js — an animated liquid / watery wave background for a card.
//
// HOW IT STAYS BUTTERY SMOOTH:
//   The wave SHAPES are static SVG paths (drawn once). We only animate a
//   horizontal `translateX` on the wrapping <Animated.View>, with
//   useNativeDriver:true — so the motion runs on the native/UI thread at 60fps
//   and never touches the JS thread. No extra libraries: just react-native-svg
//   (already in your project) and React Native's built-in Animated API.
//
// HOW THE SEAMLESS LOOP WORKS:
//   Each layer is drawn TWICE as wide as the card, using a wavelength that
//   divides the card width evenly. Sliding the layer left by exactly one card
//   width therefore lands on an identical-looking slice, so when the loop
//   restarts there is no visible "jump".
//
// USAGE:
//   Put <LiquidWaves /> as the FIRST child of a view that has
//   `overflow: 'hidden'` and a borderRadius. It fills that parent and flows
//   behind whatever you render after it. It ignores touches (pointerEvents
//   none), so buttons on top of it still work.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

// Build one tiling sine wave, filled from its crest line down to the bottom.
// We span 2x the width with the same wavelength so the layer can loop seamlessly.
function buildWavePath(width, height, amplitude, periods, baselineFrac, phase) {
  const w2 = width * 2;
  const baseline = height * baselineFrac;
  const steps = Math.max(64, Math.round(periods * 2 * 16)); // higher = smoother curve
  let d = `M 0 ${baseline.toFixed(2)}`;
  for (let i = 0; i <= steps; i++) {
    const x = (w2 * i) / steps;
    const y =
      baseline + amplitude * Math.sin((x / width) * periods * 2 * Math.PI + phase);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ` L ${w2.toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`;
  return d;
}

function WaveLayer({
  width,
  height,
  amplitude,
  periods,
  baselineFrac,
  phase,
  duration,
  fillOpacity,
  gradientId, // if set, the layer uses a white→transparent vertical gradient (glossy crest)
}) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tx.setValue(0);
    const anim = Animated.loop(
      Animated.timing(tx, {
        toValue: -width, // slide exactly one card width => seamless wrap
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [width, duration, tx]);

  const d = useMemo(
    () => buildWavePath(width, height, amplitude, periods, baselineFrac, phase),
    [width, height, amplitude, periods, baselineFrac, phase]
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: width * 2,
        height,
        transform: [{ translateX: tx }],
      }}
    >
      <Svg width={width * 2} height={height}>
        {gradientId ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={fillOpacity} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={fillOpacity * 0.2} />
            </LinearGradient>
          </Defs>
        ) : null}
        <Path
          d={d}
          fill={gradientId ? `url(#${gradientId})` : "#FFFFFF"}
          fillOpacity={gradientId ? 1 : fillOpacity}
        />
      </Svg>
    </Animated.View>
  );
}

export default function LiquidWaves() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
      }}
    >
      {size.w > 0 && size.h > 0 && (
        <>
          {/* Back layer: slow, low, faint — sets the depth. */}
          <WaveLayer
            width={size.w}
            height={size.h}
            amplitude={10}
            periods={2}
            baselineFrac={0.58}
            phase={0}
            duration={9000}
            fillOpacity={0.1}
          />
          {/* Mid layer: medium speed + height. */}
          <WaveLayer
            width={size.w}
            height={size.h}
            amplitude={14}
            periods={2}
            baselineFrac={0.66}
            phase={Math.PI / 2}
            duration={6500}
            fillOpacity={0.16}
          />
          {/* Front layer: faster, glossy gradient crest for the "liquid" sheen. */}
          <WaveLayer
            width={size.w}
            height={size.h}
            amplitude={16}
            periods={3}
            baselineFrac={0.74}
            phase={Math.PI}
            duration={4500}
            gradientId="liquidFrontCrest"
            fillOpacity={0.28}
          />
        </>
      )}
    </View>
  );
}
