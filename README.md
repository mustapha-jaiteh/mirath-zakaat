# Mirath & Zakaat App

A React Native application for Islamic Inheritance (Mirath) and Zakaat calculation.
Re-developed from the original `meerath` React web project using Expo and NativeWind.

## Features

### 1. Mirath (Inheritance)
- **Simplified Logic**: Replaced complex nested if-else structures with a robust rule-based engine.
- **Support for Awl & Radd**: Handles cases where shares exceed or fall short of the total estate.
- **Asaba (Residuary)**: Automatically calculates shares for residuary heirs (e.g., Son takes 2x Daughter).
- **Interactive Input**: Easy-to-use counter interface for selecting relatives.

### 2. Zakaat (Alms)
- **Wealth Calculation**: Input Cash, Gold, Silver, Assets, and Debts.
- **Live Rates**: Integration structure for `metals-api` (requires key).
- **Manual Override**: Fully functional with manual rate entry.
- **Nisaab Check**: Automatically checks eligibility based on Gold Nisaab (85g).

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run on Android/iOS**
   ```bash
   npx expo start
   ```
   - Scan the QR code with Expo Go app.
   - Or press `a` for Android Emulator, `i` for iOS Simulator.

## Tech Stack
- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: React Navigation (Native Stack)
- **State**: React Hooks (Local State)

## API Key
To enable live gold/silver rates, edit `src/screens/ZakaatScreen.tsx` and replace `YOUR_METALS_API_KEY` with a valid key from [metals-api.com](https://metals-api.com/).


#####
مسألتان العمريتان
Walkthrough: Umariyyatayn Cases Implementation
I have implemented the "Umariyyatayn" (or Gharra'ayn) cases in the inheritance calculation logic. This ensured that when a spouse and both parents are the only heirs (with no descendants or siblings), the mother receives one-third of the remainder after the spouse's share, rather than one-third of the total.

Changes Made
Calculation Logic
inheritanceLogic.ts
: Added detection for the two specific Umariyyatayn scenarios.
Adjusted Mother's share calculation to be 
(1 - spouseShare) / 3
 in these cases.
Added a noteKey to the result to support localized explanation notes.
UI & Localization
MirathResultScreen.tsx
: Updated to display notes using the noteKey if available, ensuring the explanation is translated.
Locales: Added mirath_results.umariyyatayn_note to both English and Arabic translations.
Verification
Scenario 1: Husband + Mother + Father
Husband: 1/2 (50%)
Mother: 1/3 of remainder = 1/6 (~16.7%)
Father: Remainder = 1/3 (~33.3%)
Status: Verified. Mother:Father ratio is 1:2.
Scenario 2: Wife + Mother + Father
Wife: 1/4 (25%)
Mother: 1/3 of remainder = 1/4 (25%)
Father: Remainder = 1/2 (50%)
Status: Verified. Mother:Father ratio is 1:2.
