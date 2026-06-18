# EXPENZO 

**personal expense tracker** built with React Native & Expo. Track expenses, set budgets, manage categories, and visualize your spending — all stored **privately on your device**, no internet required.

---

## ✨ Features

- **Expense management** — add, edit, and delete transactions (amount, category, date, optional note)
- **Custom categories** — create and delete categories with your own color + icon (defaults are protected)
- **Monthly budgets** — set a limit and track it with a progress bar that turns green → orange → red as you approach/exceed it
- **Analytics** — spending-by-category **pie chart** and a **last-6-months bar chart**, with a month selector
- **Home dashboard** — total spent, this-month spend, transaction count, budget status, and recent transactions
- **Multi-currency** — `$`, `€`, `£`, and `Rs.` with app-wide formatting
- **Light & dark mode** — full theming with a remembered preference, switches instantly
- **Onboarding** — three swipeable intro slides with animated "splash" page indicators (shown once)
- **Animated splash screen** — custom SVG + Animated branding intro
- **Swipeable tabs** — swipe left/right to move between Home, Expenses, Stats, Analytics, and Settings
- **CSV export** — export your transactions and share them via the system share sheet
- **100% offline & private** — works without internet; nothing is uploaded to any server

---

## 🛠 Tech Stack

| Area | Tools |
|------|-------|
| Framework | React Native, Expo (SDK 54), JavaScript |
| Navigation | React Navigation (native stack + swipeable material top tabs) |
| State & storage | React Context API + AsyncStorage |
| Charts | react-native-chart-kit, react-native-svg |
| Gestures / paging | react-native-pager-view |
| Dates | date-fns, @react-native-community/datetimepicker |
| Files | expo-file-system, expo-sharing |
| Icons | @expo/vector-icons (Ionicons) |
| Build & distribution | EAS Build (Android APK) |

---

## 📱 Screenshots

> Add screenshots here (e.g. `assets/screenshots/`) — Home, Analytics, Add Expense, Dark Mode, Onboarding.

| Home | Analytics | Add Expense | Dark Mode |
|------|-----------|-------------|-----------|
| _add_ | _add_ | _add_ | _add_ |

---

## 🚀 Getting Started (Expo Go)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Scan the QR code with the Expo Go app on your phone
```

> Requires the **Expo Go** app (Android/iOS) running on **Expo SDK 54**.

---

## 📦 Build an Android APK (EAS)

```bash
# one-time
npm install -g eas-cli
eas login

# build a shareable APK
eas build -p android --profile preview
```

When the cloud build finishes, EAS gives you a link to download the `.apk`, which you can install on any Android device (enable "Install unknown apps") and share.

---

## 🗂 Project Structure

```
ExpenseTracker/
├── App.js                 # navigation, providers, splash + onboarding wiring
├── app.json               # Expo config (name, icon, splash, android package)
├── eas.json               # EAS build profiles (preview = APK)
├── assets/                # icon, splash image
└── src/
    ├── components/         # ExpenseListItem, ProgressBar, MonthSelector,
    │                       # AppPopup, Onboarding, AnimatedSplash
    ├── config/             # categories, currencies
    ├── context/            # ExpensesContext (single app-wide store)
    ├── screens/            # Overview, Expenses, Stats, Monthly, Settings,
    │                       # AddEditExpense, ManageCategories, Notifications,
    │                       # MonthlyExpenses
    ├── theme/              # light/dark palettes + useTheme hook
    └── utils/              # money/date formatting, CSV builder
```

---

## 🔒 Privacy

All data (expenses, budget, categories, settings) is stored **locally** on your device using AsyncStorage. EXPENZO works fully offline and does **not** send any data to a server.

---

## 📄 License

Personal project — all rights reserved. (Add a license here if you plan to open-source it.)
