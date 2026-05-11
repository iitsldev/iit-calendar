<div align="center">
<h1>🕯️ IIT Calendar</h1>
<p><strong>A Buddhist Calendar Application for Tracking Uposatha, Meditation, and Dhamma Study</strong></p>
</div>

## Overview

IIT Calendar is a cross-platform Buddhist calendar application designed to help practitioners track **Uposatha days** (Buddhist observance days), manage meditation practice, and study Dhamma (Buddhist teachings). The app provides lunar calendar calculations, local notifications for important dates, and a user-friendly interface for spiritual practice.

### Key Features

- **📅 Buddhist Lunar Calendar**: Accurate Uposatha day calculations
- **🔔 Local Notifications**: Reminders for observance days and practice sessions
- **🧘 Meditation Tracking**: Log and monitor your meditation practice
- **📚 Dhamma Resources**: Access to Buddhist teachings and study materials
- **📱 Cross-Platform**: Works on web, iOS, and Android via Capacitor
- **🌙 Astronomical Calculations**: Precise lunar phase and sunrise/sunset calculations

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Mobile**: Capacitor (iOS & Android)
- **Backend**: Express.js
- **Styling**: Tailwind CSS + Motion animations
- **Database**: Firebase
- **AI Integration**: Google Gemini API
- **Libraries**:
  - `suncalc` - Lunar and solar calculations
  - `aksharamukha` - Script conversion for Buddhist texts
  - `date-fns` - Date manipulation
  - `lucide-react` - Icon library
  - `react-native` & `react-native-web` - Cross-platform compatibility

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Gemini API Key** (for AI features)
- **Firebase Project** (for backend services)
- Optional: iOS/Android development tools (for mobile deployment)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dhammanana/iit-calendar.git
cd iit-calendar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
```

Replace the placeholder values with your actual API keys and Firebase credentials.

## Development

### Run Locally
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm preview
```

### Type Checking
```bash
npm run lint
```

## Mobile Development

### Sync with Capacitor
```bash
npm run cap:sync
```

### Open iOS Project
```bash
npm run cap:open:ios
```

### Open Android Project
```bash
npm run cap:open:android
```

## Project Structure

```
iit-calendar/
├── src/                    # React components and source code
├── public/                 # Static assets
├── dist/                   # Production build output
├── ios/                    # iOS-specific files
├── android/                # Android-specific files
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to help improve the IIT Calendar.

## License

This project is provided as-is. Please check for any license information in the repository.

## Support

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/dhammanana/iit-calendar/issues).

---

**Sadhu! Sadhu! Sadhu!** 🙏
