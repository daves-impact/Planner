# AI-Powered Study Planner

A React Native mobile app that uses AI (Google Gemini) to help students organize study schedules intelligently.

## ✨ Features

- **AI Task Parsing**: Convert natural language to structured tasks
- **Intelligent Scheduling**: AI generates optimized daily study plans
- **Cloud Sync**: All data synced with Supabase
- **Cross-Platform**: Works on iOS, Android, and Web
- **Dark Mode**: Full dark/light theme support
- **Offline Support**: Works without internet (cached data)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env.local` and add your credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 3. Run the App

```bash
npm start
```

Then choose:

- `i` for iOS
- `a` for Android
- `w` for Web

## 📋 Setup Guide

See [SETUP.md](./SETUP.md) for detailed instructions on:

- Supabase configuration
- Google Gemini API setup
- Database schema deployment
- Troubleshooting

## 🏗️ Architecture

### Frontend

- React Native with Expo
- TypeScript for type safety
- Expo Router for navigation
- Context API for state management

### Backend

- Supabase (Auth + Database)
- PostgreSQL with Row-Level Security
- Real-time sync

### AI

- Google Gemini 2.0 API
- Task parsing from natural language
- Study schedule generation with smart algorithms

## 📱 Screens

| Screen   | Purpose                               |
| -------- | ------------------------------------- |
| Login    | User authentication                   |
| Register | New account creation                  |
| Tasks    | View all tasks                        |
| Add Task | Create/edit tasks manually or with AI |
| Planner  | AI-generated study schedule           |
| Profile  | User info and settings                |

## 🤖 AI Integration

### Task Parsing

```
Input: "Study Math for 2 hours tomorrow evening"
Output: {
  title: "Math",
  duration: 120,
  deadline: "2025-01-15T18:00:00",
  priority: "medium"
}
```

### Study Planning

- Max 2-hour sessions
- 10-15 minute breaks
- Prioritizes high-priority tasks
- Schedules heavy tasks early

## 🔒 Security

- Email/password authentication
- Supabase Row-Level Security
- Environment variables for API keys
- No sensitive data in code

## 📦 Dependencies

- `@supabase/supabase-js` - Backend
- `@react-navigation/*` - Navigation
- `@react-native-community/datetimepicker` - Date picker
- `expo-router` - File-based routing
- React Native & TypeScript

## 🛠️ Development

### Project Structure

```
app/                    # Navigation & routes
screens/               # Screen components
services/             # API & business logic
context/             # Auth state management
supabase/           # Database config
utils/              # Helper functions
components/         # Reusable UI components
```

### Key Services

**taskService.ts**

- `getTasks()` - Fetch all tasks
- `addTask()` - Create new task
- `deleteTask()` - Remove task
- `getStudyPlan()` - Fetch study plan

**aiService.ts**

- `parseTaskText()` - AI task parsing
- `generateStudyPlan()` - AI scheduling

## 🐛 Troubleshooting

**Can't start app?**

```bash
npm start -c  # Clear cache
```

**Missing dependencies?**

```bash
npm install
```

**Supabase connection issues?**

- Check `.env.local` is in project root
- Verify credentials in Supabase dashboard
- Check RLS policies are enabled

**Gemini API errors?**

- Verify API key in `.env.local`
- Check quota in Google AI Studio
- Ensure request format is correct

See [SETUP.md](./SETUP.md) for more troubleshooting.

## 📖 API Documentation

### Supabase Tables

**tasks**

- `id` (UUID) - Primary key
- `user_id` (UUID) - Owner
- `title` (text) - Task name
- `description` (text) - Details
- `duration` (integer) - Minutes
- `deadline` (timestamp) - Due date/time
- `priority` (text) - low|medium|high
- `status` (text) - pending|in_progress|completed
- `created_at` (timestamp)

**study_plans**

- `id` (UUID) - Primary key
- `user_id` (UUID) - Owner
- `date` (date) - Plan date
- `plan` (jsonb) - Schedule data
- `created_at` (timestamp)

## 🚀 Deployment

```bash
# Install EAS
npm install -g eas-cli

# Build for app stores
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit
```

## 📞 Support

For issues or questions:

1. Check [SETUP.md](./SETUP.md)
2. Review console logs: `npm start` → `l`
3. Check Supabase logs in dashboard
4. Verify API keys and credentials

## 📄 License

MIT - Open source and free to use

---

**Built with ❤️ using React Native, Supabase & Google Gemini API**
