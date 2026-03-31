# 📘 Firebase Cloud Messaging (FCM) Setup Guide

To enable push notifications in Whisper, you need to configure a Firebase project. Follow these steps:

## 1. Create a Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/).
- Click **"Add project"** and follow the instructions.
- Once created, go to the project dashboard.

## 2. Get Service Account Key (Backend)
- In the left sidebar, click the **Settings icon (cog)** next to "Project Overview".
- Select **"Project settings"**.
- Go to the **"Service accounts"** tab.
- Click **"Generate new private key"**.
- A `.json` file will be downloaded to your computer.
- **IMPORTANT**: Rename this file to `serviceAccountKey.json`.
- Place it in: `d:\DoAn\Whisper\Whisper_BE\src\configs\serviceAccountKey.json` (Create the `configs` folder if it doesn't exist).

## 3. Configure Android/iOS (Frontend)
- Since we are using Expo, the configuration is mostly handled by `expo-notifications`.
- In the Firebase Console, go to **"Project settings"** -> **"General"**.
- Click the **Android icon** (or iOS) to add an app.
- For Android: Use the package name found in your `app.json` (e.g., `com.whisper.app`).
- Follow the steps to download `google-services.json` and place it in the `App/` directory.

## 4. Enable Cloud Messaging API
- In Firebase Console, go to **"Project settings"** -> **"Cloud Messaging"**.
- Ensure **"Cloud Messaging API (Legacy)"** or **"Firebase Cloud Messaging API (V1)"** is enabled.

---

### Why do we need this?
- **serviceAccountKey.json**: Allows our Node.js server to "talk" to Firebase and send messages.
- **fcmToken**: The app will generate a unique token for your device and send it to our server so we know where to "push" the notification.
