# IIT Calendar

A comprehensive Buddhist calendar and spiritual practice companion app designed for monastics and lay practitioners. This app provides essential tools for daily life in a monastic or serious practice environment, supporting multiple traditions and languages.

## Features

- **Multi-Tradition Calendar**: Supports Sri Lankan, Myanmar, Thai, and Traditional Lunar calendars.
- **Solar Calculations**: Precise dawn, solar noon, and sunset times with support for specific monastic traditions (Pa-Auk, Na-Uyana).
- **Chanting & Texts**: Integrated chanting book with support for multiple Pali scripts (Roman, Sinhala, Burmese, Thai, etc.) via Aksharamukha.
- **Meditation Timer**: A "Stillness" timer for daily meditation practice.
- **Study Mode**: Pomodoro-based study timer with task management and focus reporting.
- **Multi-Language**: Available in English, Sinhala, Burmese, Thai, Vietnamese, Khmer, and Lao.
- **Cross-Platform**: Optimized for Web, Android (Capacitor), iOS (Capacitor), and Desktop (Tauri).

## Privacy

IIT Calendar is designed with a **local-first** philosophy. Your data—including settings, chanting history, and meditation statistics—is stored exclusively on your device.

- **No Data Collection**: We do not collect or transmit your personal data to external servers.
- **Local Storage**: All practice data stays within your device's local storage or native file system.
- **Location Data**: Used locally for precise solar/lunar calculations; never shared.
- **Privacy Policy & EULA**: Accessible directly within the app via **Settings > Legal & Information**.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Mobile Support**: [Capacitor](https://capacitorjs.com/)
- **Desktop Support**: [Tauri](https://tauri.app/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Script Conversion**: [Aksharamukha](https://aksharamukha.appspot.com/)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd iit-calendar

# Install dependencies
npm install

# Run development server
npm run dev
```

### Build

```bash
# Build for web
npm run build

# Preview build
npm run preview
```

### Mobile (Capacitor)

To sync and build for mobile platforms:

```bash
# Sync with mobile platforms
npm run cap:sync

# Open Android Studio
npm run cap:open:android

# Open Xcode (macOS only)
npm run cap:open:ios
```

## Live Updates & Versioning

This project uses **Capgo OTA (Over-The-Air) live updates** for the mobile applications to instantly deploy UI changes and bug fixes to users without going through App Store review. 

Because of this, we follow a strict versioning architecture:
- **Patch versions** (`1.0.x`) are deployed instantly via OTA.
- **Minor/Major versions** (`1.x.0`) require a new binary update via the App Store.

For detailed guidelines on how to bump versions and release updates, read the [Versioning & Update Guide](file:///Users/chathura/code/iit-calendar/VERSIONING.md).

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

- **Free to use, share, and adapt** for personal and non-commercial purposes.
- **Attribution**: You must give appropriate credit.
- **Non-Commercial**: You may not use the material for commercial purposes.
- **No Additional Restrictions**: You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

See the [LICENSE](LICENSE) file for the full legal text.
