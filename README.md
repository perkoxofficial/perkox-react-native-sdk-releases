# Perkox Offerwall SDK for React Native

[![npm version](https://img.shields.io/npm/v/@perkoxofficial/react-native-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@perkoxofficial/react-native-sdk)
[![license](https://img.shields.io/npm/l/@perkoxofficial/react-native-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@perkoxofficial/react-native-sdk)
[![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue.svg?style=flat-square)](https://reactnative.dev/)

Official React Native SDK for integrating the **Perkox Offerwall** into iOS and Android applications. Allow your users to earn rewards by completing offers, surveys, and engagement tasks.

---

## Requirements

| Requirement | Supported Version |
| :--- | :--- |
| **React Native** | `0.60.0+` (New Architecture & Paper supported) |
| **Expo** | Bare React Native or Expo Dev Client / Prebuild (`expo-build-properties`) |
| **iOS Deployment Target** | `13.0+` |
| **Android minSdk** | `21` (Android 5.0 Lollipop) or higher |
| **Android targetSdk** | `36` (Android 15 ready) |

---

## Installation

Install the SDK using your preferred package manager:

```bash
# Using NPM
npm install @perkoxofficial/react-native-sdk

# Using Yarn
yarn add @perkoxofficial/react-native-sdk

# Using PNPM
pnpm add @perkoxofficial/react-native-sdk
```

---

## Platform Setup

### 🍎 iOS Setup

After installing the package, install the required CocoaPods dependencies:

```bash
cd ios && pod install && cd ..
```

> **Privacy Manifest:** The SDK includes Apple's mandatory `PrivacyInfo.xcprivacy` manifest automatically. No manual privacy configuration is required.

---

### 🤖 Android Setup

1. **Permissions:**
   The `INTERNET`, `ACCESS_NETWORK_STATE`, and `AD_ID` permissions are included automatically via Android Manifest merging:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-permission android:name="com.google.android.gms.permission.AD_ID" />
   ```

2. **JitPack Repository:**
   Ensure `maven { url 'https://www.jitpack.io' }` is included in your project's `android/build.gradle` (or `settings.gradle`):
   ```groovy
   allprojects {
       repositories {
           google()
           mavenCentral()
           maven { url 'https://www.jitpack.io' }
       }
   }
   ```

---

## Quick Start

### Basic Implementation

```tsx
import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import { PerkoxSDK, PerkoxReward } from '@perkoxofficial/react-native-sdk';

export default function App() {
  useEffect(() => {
    // 1. Initialize the Perkox SDK
    PerkoxSDK.init({
      appId: "YOUR_APP_ID",       // Your App ID from Perkox Dashboard
      sdkKey: "YOUR_SDK_KEY",     // Your SDK Key from Perkox Dashboard
      playerId: "Player_123",     // Unique player / user identifier
      beta: false,                // Set to true to test with sandbox backend
    });

    // 2. Listen to Reward events
    const unsubscribeReward = PerkoxSDK.onReward((reward: PerkoxReward) => {
      console.log('Reward received:', reward);
      Alert.alert('Reward', `Received ${reward.amount} coins!`);
    });

    // 3. Listen to Offerwall Close events
    const unsubscribeClose = PerkoxSDK.onClose(() => {
      console.log('Offerwall closed');
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeReward();
      unsubscribeClose();
    };
  }, []);

  const handleShowOfferwall = async () => {
    const success = await PerkoxSDK.showOfferwall();
    if (!success) {
      Alert.alert('Error', 'Failed to launch Perkox Offerwall.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Offerwall" onPress={handleShowOfferwall} />
    </View>
  );
}
```

---

## API Reference

### `PerkoxSDK` (Static API)

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `init(config)` | `PerkoxInitConfig` | `Promise<boolean>` | Initializes the SDK with global configuration. |
| `showOfferwall(options?)` | `PerkoxInitConfig?` | `Promise<boolean>` | Launches the native Offerwall modal and automatically syncs pending rewards. |
| `syncPendingRewards(appId?, sdkKey?, playerId?, beta?)` | `string?, string?, string?, boolean?` | `Promise<PerkoxReward[]>` | Explicitly synchronizes pending rewards earned while the app was closed. |
| `setUserId(userId)` | `string` | `Promise<boolean>` | Updates the active player / user identifier dynamically. |
| `onReward(callback)` | `(reward: PerkoxReward) => void` | `() => void` | Registers a listener for reward events. Returns an unsubscribe function. |
| `onClose(callback)` | `() => void` | `() => void` | Registers a listener for Offerwall dismiss events. Returns an unsubscribe function. |

---

### ⚡ Offline & Pending Rewards Auto-Sync

When a user completes an offer while your mobile application is closed, suspended, or in the background, rewards are **automatically retained and synchronized**:

1. **Auto-Sync on Launch:** Whenever `showOfferwall()` is called, pending rewards are automatically fetched and passed to your `onReward` listeners on the Main Thread.
2. **Explicit Background Sync:** You can also sync rewards in `useEffect` on app startup without showing the UI:

```typescript
useEffect(() => {
  // Sync pending rewards on startup
  PerkoxSDK.syncPendingRewards().then((unclaimedRewards) => {
    unclaimedRewards.forEach((r) => {
      console.log(`Synced offline reward: ${r.amount} (TxID: ${r.txid}, Click: ${r.click_id})`);
    });
  });
}, []);
```

---

### `PerkoxReward` (Dynamic Payload)

All server and custom postback parameters are dynamically preserved and typed with an index signature:

| Field | Type | Description |
| :--- | :--- | :--- |
| `amount` / `payout` | `number` | The reward amount / currency credited. |
| `txid` | `string` | Unique transaction ID for the reward. |
| `status` | `string` | Reward transaction status (`approved`, etc.). |
| `player_id` | `string` | The user / player identifier. |
| `click_id` | `string` | The conversion click ID (dynamic). |
| `offer_id` | `any` | Completed offer ID (dynamic). |
| `[key: string]` | `any` | All other custom server / advertiser macros preserved dynamically. |

---

## ⚠️ Important Requirements

### 1. Package ID / Bundle Identifier Matching
The Android `package` name (e.g. `com.example.myapp`) and iOS `bundleIdentifier` **MUST** match the exact Package ID registered for your `App ID` in the [Perkox Publisher Dashboard](https://pub.perkox.com).

> If the Package ID does not match, the Offerwall API returns:
> `{"success": false, "message": "Invalid package_id for this offerwall"}`
> causing zero offers to be shown.

### 2. Anti-Duplicate Claim Acknowledgment
The SDK automatically acknowledges claimed reward transaction IDs to `POST /rewards/claim`. This guarantees idempotent delivery and eliminates duplicate reward crediting across application restarts.

---

## ❓ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Offerwall opens but shows 0 offers** | Verify that your Android `applicationId` / iOS `bundleIdentifier` exactly matches the registered Package ID in the Perkox Dashboard. |
| **Expo Go Error** | Custom native modules cannot run inside standard Expo Go. Use Expo Prebuild (`npx expo run:android` / `npx expo run:ios`) or Expo Dev Client. |
| **Invalid player_id** | Ensure `playerId` is not an empty string (`""`). Pass a non-empty user ID during `PerkoxSDK.init()`. |

---

## License

MIT © [Perkox](https://perkox.com)
