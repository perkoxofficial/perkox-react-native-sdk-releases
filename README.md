# @perkoxofficial/react-native-sdk

[![npm version](https://img.shields.io/npm/v/@perkoxofficial/react-native-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@perkoxofficial/react-native-sdk)
[![license](https://img.shields.io/npm/l/@perkoxofficial/react-native-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@perkoxofficial/react-native-sdk)
[![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue.svg?style=flat-square)](https://reactnative.dev/)

Official React Native SDK (iOS & Android) for integrating the **Perkox Offerwall** into mobile applications.

---

## ⚡ Features

- 📱 **Native Core**: Direct bridge wrapper surrounding the official native Android (Kotlin) and iOS (Swift) Perkox SDKs.
- ⚡ **Auto-Linking**: Works out-of-the-box with React Native CLI auto-linking and CocoaPods.
- 🔔 **Real-Time Events**: Listen to reward notifications (`onReward`) and offerwall dismissals (`onClose`).
- 🔷 **TypeScript Ready**: Complete type definitions included out of the box.

---

## 📦 Installation

```bash
# Using NPM
npm install @perkoxofficial/react-native-sdk

# Using Yarn
yarn add @perkoxofficial/react-native-sdk

# Using PNPM
pnpm add @perkoxofficial/react-native-sdk
```

---

## ⚙️ Native Platform Configuration

### iOS Setup (CocoaPods)
After installing the package, run CocoaPods installation inside your project's `ios` directory:

```bash
cd ios && pod install && cd ..
```
*Requirements: iOS deployment target 13.0 or higher.*

### Android Setup
React Native auto-linking configures the native Android module automatically.

*Requirements:*
1. Android API level 21 (Android 5.0) or higher (compiled with `compileSdkVersion 36` / `targetSdkVersion 36`).
2. Ensure `<uses-permission android:name="android.permission.INTERNET" />` is present in your `AndroidManifest.xml`.
3. Add `maven { url 'https://www.jitpack.io' }` to your root project's `android/build.gradle` (under `allprojects.repositories`) or `android/settings.gradle`.

---

## 🚀 Quick Start

```tsx
import React, { useEffect } from 'react';
import { Button, View, Alert } from 'react-native';
import { PerkoxSDK, PerkoxReward } from '@perkoxofficial/react-native-sdk';

export default function App() {
  useEffect(() => {
    // 1. Initialize Perkox SDK
    PerkoxSDK.init({
      appId: "YOUR_APP_ID",
      sdkKey: "YOUR_SDK_KEY",
      playerId: "USER_12345",
      beta: false, // Set to true for testing
    });

    // 2. Listen to Reward Events
    const unsubscribeReward = PerkoxSDK.onReward((reward: PerkoxReward) => {
      console.log("Reward Received:", reward);
      Alert.alert("Reward Earned", `Received ${reward.amount} points! (TxID: ${reward.txid})`);
    });

    // 3. Listen to Offerwall Close Event
    const unsubscribeClose = PerkoxSDK.onClose(() => {
      console.log("Offerwall Closed");
    });

    // 4. Clean up listeners on unmount
    return () => {
      unsubscribeReward();
      unsubscribeClose();
    };
  }, []);

  const handleShowOfferwall = async () => {
    const success = await PerkoxSDK.showOfferwall();
    if (!success) {
      Alert.alert("Error", "Failed to launch Perkox Offerwall.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Perkox Offerwall" onPress={handleShowOfferwall} />
    </View>
  );
}
```

## ⚠️ Important Requirements

1. **Package ID / Bundle Identifier Matching**:
   The native Android `package` name (in `app.json` or `build.gradle`) and iOS `bundleIdentifier` **MUST** match the exact Package Name registered for your `App ID` in the [Perkox Publisher Dashboard](https://pub.perkox.com).
   *If the package name does not match, the Offerwall will open but return zero offers (`Invalid package_id`).*

2. **Non-Empty `playerId`**:
   Ensure `playerId` is a valid non-empty string identifying the user before calling `showOfferwall()`.

---

## 📖 API Summary

- **`PerkoxSDK.init(config)`** — Initialize SDK (`appId`, `sdkKey`, `playerId?`, `beta?`)
- **`PerkoxSDK.showOfferwall(options?)`** — Launch native Offerwall UI (`appId?`, `sdkKey?`, `playerId?`, `beta?`)
- **`PerkoxSDK.onReward(cb)`** — Listen to reward events (`reward.amount`, `reward.txid`, `reward.status`)
- **`PerkoxSDK.onClose(cb)`** — Listen to Offerwall close event
- **`PerkoxSDK.setUserId(id)`** — Dynamically update user/player ID

---

## ❓ Troubleshooting

- **Offerwall opens but shows no offers?**
  Verify that your Android `package` / iOS `bundleIdentifier` matches the registered Package ID in the Perkox Dashboard for your `appId`.
- **Expo Go compatibility?**
  Perkox SDK includes native Kotlin and Swift binary modules. Expo Go is not supported; use Expo Prebuild / Development Builds (`npx expo run:android` / `npx expo run:ios`).


