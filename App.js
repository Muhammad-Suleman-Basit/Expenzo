// App.js — this is the main entry of the app where we set up navigation.

import React, { useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";

// View + ActivityIndicator are used to draw the simple loading screen.
import { View, ActivityIndicator, StyleSheet } from "react-native";

// SafeAreaProvider makes sure our content avoids the phone's notch / edges.
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// NavigationContainer is the wrapper that all navigation must live inside.
// DefaultTheme / DarkTheme let us color the navigator (backgrounds, headers).
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

// The two navigators we use:
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // for screens that stack on top
// Material top tabs = a SWIPEABLE pager. We place its bar at the BOTTOM so it
// still looks like a bottom tab bar, but you can swipe left/right between tabs.
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// Icons for the tab bar (Ionicons comes bundled with Expo).
import { Ionicons } from "@expo/vector-icons";

// Theme hook + palettes so the tab bar / navigation match the current theme.
import { useTheme, lightColors, darkColors } from "./src/theme/theme";

// Our data store (holds the list of expenses for the whole app).
// We also import useExpenses so we can read `isLoading` and show a spinner.
import { ExpensesProvider, useExpenses } from "./src/context/ExpensesContext";

// Our screens.
import OverviewScreen from "./src/screens/OverviewScreen";
import ExpensesScreen from "./src/screens/ExpensesScreen";
import StatsScreen from "./src/screens/StatsScreen";
import MonthlyScreen from "./src/screens/MonthlyScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AddEditExpenseScreen from "./src/screens/AddEditExpenseScreen";
import ManageCategoriesScreen from "./src/screens/ManageCategoriesScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import MonthlyExpensesScreen from "./src/screens/MonthlyExpensesScreen";

// The animated splash overlay shown on top of the app at launch.
import AnimatedSplash from "./src/components/AnimatedSplash";

// The intro/onboarding slides shown once on first launch (after the splash).
import Onboarding from "./src/components/Onboarding";

// Create the navigator objects.
const Tab = createMaterialTopTabNavigator(); // swipeable tabs
const Stack = createNativeStackNavigator();

// This component holds the swipeable bottom tabs.
function TabsNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      // Material top tabs default to the TOP — move the bar to the bottom.
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        swipeEnabled: true, // <-- lets you swipe left/right between tabs

        // Active tab = brand purple, inactive = grey.
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        // Show both the icon and the label, like a normal bottom bar.
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          textTransform: "none", // keep "Home", not "HOME"
          margin: 0,
        },

        // Bar background follows the theme; pad for the phone's bottom area.
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarIndicatorStyle: { height: 0 }, // hide the moving underline
        tabBarPressColor: "transparent", // no Android ripple

        // Pick an icon for each tab based on its name.
        tabBarIcon: ({ color }) => {
          let iconName = "ellipse"; // a safe default icon

          if (route.name === "Overview") {
            iconName = "home-outline";
          } else if (route.name === "Expenses") {
            iconName = "list-outline";
          } else if (route.name === "Stats") {
            iconName = "stats-chart-outline";
          } else if (route.name === "Monthly") {
            iconName = "calendar-outline";
          } else if (route.name === "Settings") {
            iconName = "settings-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen
        name="Monthly"
        component={MonthlyScreen}
        options={{ tabBarLabel: "Analytics" }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// AppContent lives INSIDE the ExpensesProvider, so it can read isLoading + theme.
function AppContent() {
  const { isLoading, onboardingDone, setOnboardingDone } = useExpenses();
  const { colors, isDark } = useTheme();

  // Theme the navigator itself so screen transitions never flash white/black.
  // Memoized on `isDark` so it only changes when the THEME changes (not on
  // every data update). IMPORTANT: this hook must run on EVERY render, so it
  // stays ABOVE the conditional returns below (React's rules of hooks).
  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const palette = isDark ? darkColors : lightColors;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.bgLight,
        card: palette.surface,
        text: palette.textDark,
        border: palette.border,
        primary: palette.primary,
      },
    };
  }, [isDark]);

  // Still loading saved data? Show a simple centered spinner (themed).
  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.bgLight }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // First launch? Show the intro slides (white background, dark status bar).
  if (!onboardingDone) {
    return (
      <>
        <StatusBar style="dark" />
        <Onboarding onDone={() => setOnboardingDone(true)} />
      </>
    );
  }

  return (
    <>
      {/* Status bar icons: light text in dark mode, dark text in light mode. */}
      <StatusBar style={isDark ? "light" : "dark"} />

      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          {/* The tabs are the main screen. */}
          <Stack.Screen
            name="Tabs"
            component={TabsNavigator}
            options={{ headerShown: false }}
          />

          {/* The Add/Edit screen opens ON TOP of the tabs as a modal. */}
          <Stack.Screen
            name="AddEditExpense"
            component={AddEditExpenseScreen}
            options={{
              presentation: "modal",
              title: "Add / Edit Expense",
            }}
          />

          {/* Manage Categories — opens on top of the tabs (custom header). */}
          <Stack.Screen
            name="ManageCategories"
            component={ManageCategoriesScreen}
            options={{ headerShown: false }}
          />

          {/* Notifications — opens from the bell on Home (custom header). */}
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />

          {/* Monthly Expenses — opens from the "This Month" card on Home. */}
          <Stack.Screen
            name="MonthlyExpenses"
            component={MonthlyExpensesScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// The main App component.
export default function App() {
  // The animated splash sits on top of everything when the app starts, then
  // hides itself once its animation finishes (it calls onFinish).
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      {/* ExpensesProvider must wrap AppContent so it (and every screen) can
          read the shared data store AND the theme. */}
      <ExpensesProvider>
        <AppContent />
      </ExpensesProvider>

      {/* Splash overlay — sits ON TOP of the whole app, only while showSplash
          is true. It doesn't touch navigation or the providers. */}
      {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
