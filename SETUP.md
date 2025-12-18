# AI-Powered Study Planner - Setup & Installation

## Project Overview

A cross-platform AI-Powered Study Planner mobile application built with:

- **React Native** (Expo)
- **TypeScript**
- **Supabase** (Authentication & Database)
- **Google Gemini API** (AI Task Parsing & Study Planning)

## Prerequisites

Ensure you have installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`

## Installation Steps

### 1. Install Dependencies

```bash
cd planner
npm install
```

This will install all required packages including:

- `@supabase/supabase-js` - Supabase client
- `@react-navigation/*` - Navigation libraries
- `@react-native-community/datetimepicker` - Date/time picker
- All other dependencies

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: Study Planner
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait for it to initialize

#### Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### Set Up Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire content of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run"
6. Verify tables are created: `tasks` and `study_plans`

#### Enable RLS (Row Level Security)

RLS is configured in `schema.sql` and will be automatically enabled when you run the SQL.

### 3. Google Gemini API Setup

#### Create a Google Cloud Project

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key → `EXPO_PUBLIC_GEMINI_API_KEY`

#### Enable Gemini API

The free tier includes:

- 60 requests per minute
- Up to 32,000 input tokens per request

### 4. Environment Variables

Create `.env.local` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDxxxxx...
```

**Important**: Never commit `.env.local` to version control. Use `.env.example` as a template.

## Running the App

### Development Server

```bash
npm start
```

This opens the Expo development menu with options:

- **i** - Open in iOS Simulator
- **a** - Open in Android Emulator
- **w** - Open in Web Browser
- **j** - Open debugger
- **r** - Reload app

### iOS

```bash
npm run ios
```

Requires macOS and Xcode installed.

### Android

```bash
npm run android
```

Requires Android Studio and Android SDK configured.

### Web

```bash
npm run web
```

Opens the app in your default browser at `http://localhost:19006`

## Project Structure

```
planner/
├── app/                          # Expo Router navigation
│   ├── _layout.tsx              # Root layout with auth
│   ├── login.tsx                # Login route
│   ├── register.tsx             # Register route
│   ├── add-task.tsx             # Add task modal
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx            # Home (tasks list)
│       ├── add.tsx              # Add task tab
│       ├── planner.tsx          # AI planner tab
│       └── profile.tsx          # Profile tab
├── screens/                      # Screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AddTaskScreen.tsx
│   ├── PlannerScreen.tsx
│   └── ProfileScreen.tsx
├── services/                     # Business logic
│   ├── taskService.ts           # Task CRUD operations
│   └── aiService.ts             # Gemini API integration
├── context/                      # Auth context
│   └── AuthContext.tsx
├── supabase/                     # Supabase configuration
│   ├── client.ts                # Supabase client
│   └── schema.sql               # Database schema
├── utils/                        # Utility functions
│   └── dateUtils.ts             # Date formatting & calculations
├── components/                   # Reusable components
├── hooks/                        # Custom hooks
├── constants/                    # App constants
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment template
└── package.json
```

## Key Features

### 1. Authentication

- Sign up with email/password
- Sign in with Supabase
- Persistent sessions with AsyncStorage
- Row-level security on database

### 2. Task Management

- Create tasks manually or with AI
- Edit task details (title, description, duration, priority, deadline)
- Delete tasks
- View all tasks with deadline and priority indicators

### 3. AI Task Parsing (Gemini)

- Natural language input: "Study Math for 2 hours tomorrow evening"
- Automatically extract: title, duration, deadline, priority
- Fallback logic if API fails

### 4. AI Study Planning (Gemini)

- Generate optimized study schedules
- Max 2-hour study sessions
- 10-15 minute breaks between sessions
- Prioritize high-priority tasks and urgent deadlines
- Schedule heavy tasks earlier in the day
- Fallback to default schedule if AI fails

### 5. Cloud Sync

- All data synced with Supabase
- Real-time updates
- Works offline with cached data

## Common Issues & Fixes

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
```

### "Missing Supabase credentials"

- Ensure `.env.local` file exists
- Check `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Credentials must start with correct values (check Supabase dashboard)

### "Gemini API Error 400"

- Check API key is correct in `.env.local`
- Verify API key is active in Google AI Studio
- Check request format in `aiService.ts`

### "RLS Policy Error"

- Ensure user is authenticated before making requests
- Check RLS policies in Supabase SQL Editor
- Verify user_id matches in tasks and study_plans tables

### "DateTimePicker not working"

```bash
npm install @react-native-community/datetimepicker
```

### Blank screen on startup

- Check `.env.local` is in project root
- Run: `npm start` and select `r` to reload
- Check console for error messages

### "Error: Invariant Violation: The useFocusEffect hook was called outside of a focus-aware navigator."

- Ensure navigation structure is properly set up
- Check `_layout.tsx` files are correct
- Verify AuthProvider wraps app

## Build & Deployment

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Standalone APK/IPA

```bash
# Build APK
eas build --platform android --local

# Build IPA
eas build --platform ios --local
```

## API Rate Limits

### Gemini API (Free Tier)

- **60 requests per minute**
- **32,000 input tokens per request**

### Supabase (Free Tier)

- **Unlimited requests**
- **500 MB database size**
- **1 GB file storage**

## Testing Credentials

For development, you can create test accounts:

```
Email: test@example.com
Password: TestPassword123
```

## Troubleshooting

### Check Logs

```bash
npm start
# Then press: l (open debugger), x (switch to logs)
```

### Clear Cache

```bash
npm start -- -c
```

### Reset Project

```bash
npm run reset-project
```

### Inspect Supabase

1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Run: `SELECT * FROM tasks;`

## Performance Tips

1. **Optimize AI Calls**: Cache task parsing results
2. **Pagination**: Implement task list pagination for large datasets
3. **Image Caching**: Use expo-image for optimized image loading
4. **Query Optimization**: Add indexes on frequently queried columns (already done in schema.sql)

## Security Best Practices

1. **Never commit `.env.local`** - Use `.env.example`
2. **Use RLS Policies** - Enabled by default in schema.sql
3. **Validate Input** - All user inputs validated before API calls
4. **API Keys** - Store securely, never expose in client code (Expo uses environment variables)
5. **HTTPS Only** - Supabase enforces HTTPS

## Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API Docs](https://ai.google.dev)
- [Expo Router Guide](https://expo.github.io/router/introduction)

## License

MIT - Feel free to use for personal and commercial projects.

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up Supabase project
3. ✅ Configure environment variables
4. ✅ Run the app: `npm start`
5. ✅ Create account and test
6. ✅ Deploy using EAS Build

Enjoy using Study Planner! 🚀📚
