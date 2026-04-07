# Sentara — AI Emotional Intelligence App

> **Your smart mobile companion for emotional clarity and mental well-being.**

Sentara is a sophisticated React Native application designed to help users track, understand, and manage their emotional health. By combining **empathetic AI** with **data-driven insights**, Sentara identifies patterns in your feelings and suggests actionable steps to maintain emotional balance.

---

## ✨ Key Features

- **🎯 Precision Emotion Detection**: High-accuracy analysis that extracts 6 core emotional states (Happy, Angry, Sad, Neutral, Stress, Calm).
- **🧘 Recent Trend Analysis**: A dynamic dashboard that calculates your "Dominant Mood" based on your 10 most recent interactions for real-time reactivity.
- **💬 Empathetic AI Chat**: A warm, supportive chat interface that provides human-like clinical responses and practical advice.
- **📊 Interactive Insights Dashboard**: Beautifully visualized emotional trends, intensity tracking (Last 7 Days), and trigger identification.
- **⚡ Real-time Data Sync**: Instant synchronization with **Firebase Realtime Database** for seamless cross-device history.
- **🧠 Behavioral Triggers**: Automatic detection of recurring stressors and mood boosters based on your conversation history.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 54)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **AI Engine**: [Llama 3.1 (via Groq)](https://groq.com/) for lightning-fast inference
- **Styling**: Vanilla JavaScript-in-CSS for custom theme management
- **Charts**: [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

1. **Clone the Project**:
   ```bash
   git clone <your-repo-url>
   cd Sentara
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your **Firebase** credentials and **LLM (Groq)** API keys.

4. **Firebase Security Setup**:
   Ensure your Realtime Database rules allow for development:
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```
   *(Note: For the demo user, ensure you have anonymous auth or specific data paths configured.)*

5. **Run the App**:
   ```bash
   npx expo start
   ```
   Scan the QR code with your **Expo Go** app to launch the interface on your mobile device.

---

## 🧠 Core System Design

Sentara uses a **Deterministic Emotion Engine** to ensure stability:
1. **Chat Interaction**: User input is sent to the LLM.
2. **Analysis**: The LLM parses the text into a structured JSON (Emotion + Intensity + Trigger).
3. **Consolidation**: A mapping layer standardizes inputs (e.g., mapping "Frustrated" to "Angry") to keep the dashboard statistics clean and actionable.
4. **Visual Mapping**: The [getEmotionTheme](file:///src/utils/getEmotionTheme.js) utility dynamically updates the app's UI colors and emojis based on the detected sentiment.

---

## 📱 Visual Highlights

- **Dashboard**: High-level wellness score and intensity trends.
- **Emotion Breakdown**: A 6-category distributions of your emotional history.
- **Mindful Space**: A quick check-in area with instant "SOS" crisis support.

---

## 🔮 Future Roadmap

- [ ] **Voice-to-Voice**: Full audio conversation mode with Whisper and TTS.
- [ ] **Proactive Notifications**: AI-driven check-in reminders based on your stress levels.
- [ ] **Enhanced Authentication**: Full Firebase Auth integration (Email/Social).
- [ ] **Advanced Patterns**: Long-term longitudinal data analysis for quarterly reports.

---
*Created with ❤️ for a more mindful world.*
