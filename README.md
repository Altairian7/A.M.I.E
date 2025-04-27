# 🧠 Memory Launcher

A powerful memory-driven assistant app for storing, analyzing, and managing **reminders**, **audio diaries**, and **wallpapers**, with **Firebase authentication** and AI-based emotion scoring.

---

## 🌟 Features

- 🔐 **Secure Auth with Firebase**  
  Seamless authentication with email/password and social logins

- 📅 **Reminders**  
  Create, fetch, and delete personalized reminders with customizable frequencies

- 🖼️ **Wallpapers**  
  Upload and retrieve random personalized wallpapers

- 🎙️ **Audio Memories**  
  Upload audio files that are analyzed using sentiment/emotion analysis to determine their importance

- 🧠 **Memory Scoring**  
  External ML service transcribes & analyzes audio → assigns compound emotional scores → saves/deletes accordingly

- 👤 **User Profiles**  
  Customizable user profiles with name, age, gender, language preferences

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django, Django REST Framework  
- **Auth:** Firebase Admin SDK  
- **Database:** SQLite (Development), PostgreSQL (Production)  
- **Media Storage:** Local or Cloud (e.g., S3, GCS)  
- **ML Integration:** External Python service for audio emotion scoring

### Frontend
- **Framework:** React Native with Expo
- **UI Components:** React Native Paper
- **State Management:** React Context API
- **Navigation:** React Navigation
- **Authentication:** Firebase Auth
- **Media Access:** Expo Image Picker & Audio Recorder

---

## 🔐 Firebase Setup

1. Generate your Firebase service account key from [Firebase Console](https://console.firebase.google.com/).
2. Place the `serviceAccountKey.json` file in your Django project root (same folder as `manage.py`).
3. In `settings.py` or `firebase_init.py`:
   ```python
   import firebase_admin
   from firebase_admin import credentials

   cred = credentials.Certificate("serviceAccountKey.json")
   firebase_admin.initialize_app(cred)
   ```
4. For the frontend, configure Firebase in `api/firebaseConfig.js`:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   ```

---

## 📱 Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on device or emulator:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

4. Configure the API base URL in `api/apiConfig.js`:
   ```javascript
   const BASE_URL = "http://192.168.1.7:8000";

   const API_ENDPOINTS = {
     // User APIs
     REGISTER_USER: "/api/users/register/",
     GET_PROFILE: "/api/users/profile/",
     UPDATE_PROFILE: "/api/users/profile/update/",

     // Audio APIs
     CREATE_AUDIO: "/api/audio/memories/",
     LIST_AUDIO: "/api/audio/memories/",

     // Reminder APIs
     CREATE_REMINDER: "/api/reminders/create/",
     LIST_REMINDERS: "/api/reminders/create/",
     GET_ALL_REMINDERS: "/api/reminders/getall/",
     DELETE_REMINDER: "/api/reminders/reminder/",

     // Wallpaper APIs
     UPLOAD_WALLPAPER: "/api/reminders/upload_wallpaper/",
     RANDOM_WALLPAPER: "/api/reminders/random_wallpaper/",
   };

   export { BASE_URL, API_ENDPOINTS };
   ```

---

## 🧾 Models Overview

### UserProfile
```python
firebase_uid, email, name, age, gender, language, stage, created_at
```

### Reminder
```python
user (FK), title, description, time, frequency, created_at
```

### Wallpaper
```python
user (FK), image, uploaded_at
```

### AudioMemory
```python
user (FK), title, audio_file, created_at, score
```

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register a user via Firebase UID |
| GET | `/api/users/profile/` | Get user profile |
| PATCH | `/api/users/profile/update/` | Update user profile |

### 📅 Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders/create/` | Get reminders for the current user |
| POST | `/api/reminders/create/` | Create a reminder |
| GET | `/api/reminders/getall/` | Get all reminders |
| DELETE | `/api/reminders/reminder/` | Delete reminder by ID |

### 🖼️ Wallpapers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminders/upload_wallpaper/` | Upload wallpaper |
| GET | `/api/reminders/random_wallpaper/` | Get random wallpaper for user |

### 🎙️ Audio Memories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audio/memories/` | Upload new audio memory |
| GET | `/api/audio/memories/` | Get all uploaded memories |

---

## 🧠 Memory Scoring Logic

Once the audio is uploaded:

1. Audio is stored in `audio_files/`
2. ML service transcribes it → performs emotion detection (compound score)
3. If score > threshold → it's marked as significant and stored
4. Else → memory may be discarded
5. Frontend only fetches significant memories

---

## ✅ Authentication Flow

### Backend:
```python
# In your Django views:
@api_view(['GET'])
@firebase_auth_required
def protected_view(request):
    # request.firebase_user contains the authenticated user info
    firebase_uid = request.firebase_user['uid']
    # Process the authenticated request
    return Response({"message": "Authentication successful"})
```

### Frontend:
```javascript
// Getting Firebase token:
const idToken = await auth.currentUser.getIdToken();

// Making authenticated API calls:
const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_PROFILE}`, {
  headers: {
    'Authorization': idToken
  }
});
```

---

## 📁 Project Structure

### Backend
```
memory_launcher/
├── users/
│   └── models.py, views.py, serializers.py
├── reminders/
│   └── models.py, views.py, serializers.py
├── wallpapers/
│   └── models.py, views.py, serializers.py
├── audio_memory/
│   └── models.py, views.py, serializers.py
├── firebase/
│   └── firebase_auth_required.py
├── serviceAccountKey.json
├── manage.py
```

### Frontend
```
memory-launcher-app/
├── api/
│   ├── apiConfig.js
│   ├── apiService.js
│   └── firebaseConfig.js
├── assets/
├── components/
├── node_modules/
├── screens/
│   ├── AudioUploadScreen.js
│   ├── HomeScreen.js
│   ├── HomeScreenWallpaper.js
│   ├── LoadingScreen.js
│   ├── LoginScreen.js
│   ├── MemoryVaultScreen.js
│   ├── PatientInfoScreen.js
│   ├── PermissionsDebugScreen.js
│   ├── ProfileScreen.js
│   ├── ReminderScreen.js
│   ├── SummaryScreen.js
│   ├── UserTypeScreen.js
│   ├── WallpaperUploadScreen.js
│   └── WelcomeScreen.js
├── .gitignore
├── App.js
├── app.json
├── babel.config.js
├── eas.json
├── index.js
└── package.json
```

---

## 💡 Future Plans

- Add Celery for async ML scoring
- Integrate external ML via REST or socket
- Export memories to PDF/HTML for journaling
- Voice narration mode with TTS and background stories
- Offline mode support
- Push notifications for reminders
- End-to-end encryption for sensitive memories
- Social memory sharing (opt-in)

---

## 👨‍💻 Development Tips

### Backend
- For debugging UID issues, always verify with:
  ```python
  firebase_admin.auth.verify_id_token(<token>)
  ```
- If creating users manually, ensure UID consistency with Firebase UID

### Frontend
- Use `console.log` sparingly in production builds
- Implement proper error handling for API calls
- Test on both Android and iOS regularly
- Use React Navigation's `useIsFocused` hook for refreshing data when screens are revisited

---

## 🚀 Deployment

### Backend
1. Set up Django for production with:
   - PostgreSQL for database
   - Gunicorn as WSGI server
   - Nginx as reverse proxy
   - Configure CORS for your frontend domains

### Frontend
1. For Expo builds:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```
