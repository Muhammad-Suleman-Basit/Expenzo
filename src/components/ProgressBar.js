// ProgressBar.js — a simple horizontal bar that fills based on a percentage.
//
// Props:
//   percent : a number 0-100 (we clamp it, so passing 130 still fills to 100).
//   color   : the fill color (you decide the color based on your own rules).

import React from "react";
import { View, StyleSheet } from "react-native";
import { radius } from "../theme/theme";

export default function ProgressBar({ percent, color }) {
  // Keep the value safely between 0 and 100.
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // The empty "rail" behind the fill.
  track: {
    width: "100%",
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: "rgba(154,160,180,0.25)", // faint grey
    overflow: "hidden", // so the fill's corners stay inside the rail
  },
  // The colored part that grows with the percentage.
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});
