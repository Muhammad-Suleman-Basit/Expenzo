// ExpensesContext.js — the "data store" for the whole app.
//
// Now with PERSISTENCE: expenses are saved to the phone using AsyncStorage,
// so they survive closing and reopening the app.

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultCategories } from "../config/categories";
import { formatMoney as formatMoneyWithSymbol } from "../utils/format";

// The keys we store data under. Think of them as "filenames" in storage.
const STORAGE_KEY = "expenses";
const LIMIT_KEY = "monthlyLimit";
const NAME_KEY = "profileName";
const DARK_KEY = "darkMode";
const CATEGORIES_KEY = "categories";
const CURRENCY_KEY = "currency";
const ONBOARD_KEY = "onboardingDone";

const ExpensesContext = createContext();

export function ExpensesProvider({ children }) {
  // The list of all expenses. Starts empty.
  const [expenses, setExpenses] = useState([]);

  // The monthly budget limit. 0 means "no budget set yet".
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  // The user's profile name (shown on Home + Settings).
  const [profileName, setProfileName] = useState("My Wallet");

  // Dark mode preference. (Applying it to the whole app comes in a later task.)
  const [darkMode, setDarkMode] = useState(false);

  // The list of categories. Starts as the built-in defaults; the user can add
  // their own, and the whole list is saved to the device.
  const [categories, setCategories] = useState(defaultCategories);

  // The selected currency symbol (e.g. "$", "€", "£", "Rs."). Default "$".
  const [currency, setCurrency] = useState("$");

  // Has the user finished the intro/onboarding slides? Shows once on 1st launch.
  const [onboardingDone, setOnboardingDone] = useState(false);

  // True while we're loading saved data on app start. We show a loading screen
  // during this time so the app doesn't flash empty before the data arrives.
  const [isLoading, setIsLoading] = useState(true);

  // 1) LOAD ONCE on app start.
  //    The empty [] dependency array means this useEffect runs a single time.
  useEffect(() => {
    async function loadData() {
      try {
        // Read the saved expenses (a string, or null if none).
        const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedExpenses !== null) {
          setExpenses(JSON.parse(storedExpenses));
        }

        // Read the saved budget limit (a string, or null if none).
        const storedLimit = await AsyncStorage.getItem(LIMIT_KEY);
        if (storedLimit !== null) {
          setMonthlyLimit(JSON.parse(storedLimit));
        }

        // Read the saved profile name.
        const storedName = await AsyncStorage.getItem(NAME_KEY);
        if (storedName !== null) {
          setProfileName(JSON.parse(storedName));
        }

        // Read the saved dark mode preference.
        const storedDark = await AsyncStorage.getItem(DARK_KEY);
        if (storedDark !== null) {
          setDarkMode(JSON.parse(storedDark));
        }

        // Read the saved categories (defaults + any the user added).
        const storedCategories = await AsyncStorage.getItem(CATEGORIES_KEY);
        if (storedCategories !== null) {
          setCategories(JSON.parse(storedCategories));
        }

        // Read the saved currency symbol.
        const storedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);
        if (storedCurrency !== null) {
          setCurrency(JSON.parse(storedCurrency));
        }

        // Read whether onboarding has been completed before.
        const storedOnboard = await AsyncStorage.getItem(ONBOARD_KEY);
        if (storedOnboard !== null) {
          setOnboardingDone(JSON.parse(storedOnboard));
        }
        // If nothing was saved yet, we keep the defaults.
      } catch (error) {
        console.log("Failed to load data:", error);
      } finally {
        // Whether it worked or failed, we're done loading.
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 2) SAVE whenever the expenses array changes.
  //    3) THE IMPORTANT BUG GUARD: do nothing while isLoading is true.
  //    On the very first render expenses is [] and the initial load hasn't
  //    finished yet. Without this guard we'd save that empty [] and wipe the
  //    user's real saved data. By returning early until isLoading is false,
  //    we only ever save AFTER the initial load has completed.
  useEffect(() => {
    if (isLoading) {
      return; // still loading — don't save yet
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch((error) =>
      console.log("Failed to save expenses:", error)
    );
  }, [expenses, isLoading]);

  // Save the budget whenever it changes — with the SAME guard, so we never
  // overwrite the saved budget with the default 0 before the load has finished.
  useEffect(() => {
    if (isLoading) {
      return;
    }

    AsyncStorage.setItem(LIMIT_KEY, JSON.stringify(monthlyLimit)).catch((error) =>
      console.log("Failed to save budget:", error)
    );
  }, [monthlyLimit, isLoading]);

  // Save the profile name when it changes (same guard).
  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(NAME_KEY, JSON.stringify(profileName)).catch((error) =>
      console.log("Failed to save profile name:", error)
    );
  }, [profileName, isLoading]);

  // Save the dark mode preference when it changes (same guard).
  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(DARK_KEY, JSON.stringify(darkMode)).catch((error) =>
      console.log("Failed to save dark mode:", error)
    );
  }, [darkMode, isLoading]);

  // Save the categories when they change (same guard).
  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)).catch((error) =>
      console.log("Failed to save categories:", error)
    );
  }, [categories, isLoading]);

  // Save the currency when it changes (same guard).
  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(CURRENCY_KEY, JSON.stringify(currency)).catch((error) =>
      console.log("Failed to save currency:", error)
    );
  }, [currency, isLoading]);

  // Save the onboarding flag when it changes (same guard).
  useEffect(() => {
    if (isLoading) {
      return;
    }
    AsyncStorage.setItem(ONBOARD_KEY, JSON.stringify(onboardingDone)).catch((error) =>
      console.log("Failed to save onboarding flag:", error)
    );
  }, [onboardingDone, isLoading]);

  // Add a new expense. The screen passes { amount, category, note, date };
  // we attach a unique id so every stored expense has the same shape.
  function addExpense({ amount, category, note, date }) {
    const newExpense = {
      id: Date.now().toString(),
      amount: amount,
      category: category,
      note: note,
      date: date,
    };

    // Newest expense goes to the TOP of the list. Changing the array triggers
    // the "save" useEffect above, so it gets persisted automatically.
    setExpenses((current) => [newExpense, ...current]);
  }

  // Replace an existing expense (matched by id) with an updated version.
  // Like addExpense, this changes the `expenses` array, so the "save" useEffect
  // above runs and persists it to AsyncStorage automatically.
  function updateExpense(updatedExpense) {
    setExpenses((current) =>
      current.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  }

  // Remove the expense with the given id. Also auto-saved by the useEffect.
  function deleteExpense(id) {
    setExpenses((current) => current.filter((e) => e.id !== id));
  }

  // Add a new category (the user's own). Auto-saved by the useEffect.
  function addCategory(category) {
    setCategories((current) => [...current, category]);
  }

  // Delete a category by name (only used for the user's own categories).
  function deleteCategory(name) {
    setCategories((current) => current.filter((c) => c.name !== name));
  }

  // Format an amount with the currently selected currency symbol.
  // Components use THIS (from context) instead of importing formatMoney, so
  // amounts re-render automatically when the currency changes.
  function formatMoney(number) {
    return formatMoneyWithSymbol(number, currency);
  }

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        monthlyLimit,
        setMonthlyLimit,
        profileName,
        setProfileName,
        darkMode,
        setDarkMode,
        categories,
        addCategory,
        deleteCategory,
        currency,
        setCurrency,
        formatMoney,
        onboardingDone,
        setOnboardingDone,
        isLoading,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

// Helper hook: const { expenses, addExpense, isLoading } = useExpenses();
export function useExpenses() {
  return useContext(ExpensesContext);
}
