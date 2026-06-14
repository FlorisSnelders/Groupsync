# GroupSync — Dev Setup

## Folder Structure

```
Groupsync/
├── groupsync-app/    ← React Native (Expo) mobile app
└── groupsync-api/    ← Node.js + Express REST API
```

---

## 1. Database Setup (PostgreSQL)

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE groupsync;"

# Run the migration
psql -U postgres -d groupsync -f groupsync-api/migrations/001_initial_schema.sql
```

> **PostGIS note:** The schema uses PostGIS for location data. If you don't have it installed, remove the `CREATE EXTENSION postgis;` line and change `POINT` columns to `TEXT` (store as "lat,lng" string) until you need geo queries.

---

## 2. Backend Setup

```bash
cd groupsync-api

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your DB credentials, JWT secret, OpenAI key, etc.

# Start dev server (hot-reload)
npm run dev
```

Server will start at `http://localhost:3000`. Test it:
```
GET http://localhost:3000/health
```

---

## 3. Frontend Setup

```bash
cd groupsync-app

# Install dependencies
npm install

# Copy env
cp .env.example .env

# Start Expo
npm start
```

This opens Expo Dev Tools. Then:
- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Physical device:** Scan QR code with Expo Go app

> **Physical device note:** Change `EXPO_PUBLIC_API_URL` in `.env` from `localhost` to your computer's local IP address (e.g. `http://192.168.1.100:3000`).

---

## 4. Keys You Need

| Service | Where to get it | Required for |
|---------|----------------|--------------|
| OpenAI API key | [platform.openai.com](https://platform.openai.com) | AI activity planning |
| Firebase project | [console.firebase.google.com](https://console.firebase.google.com) | Google/Apple sign-in |
| Stripe keys | [dashboard.stripe.com](https://dashboard.stripe.com) | Premium subscriptions |

**For MVP testing:** Only OpenAI is required. Firebase and Stripe can be skipped initially — the app will work with email/password auth and no payments.

---

## 5. What's Built

### Frontend (`groupsync-app/src/`)
- **Navigation:** Auth → Onboarding → Main tabs (Feed, Map, Notifications, Profile)
- **Screens:** Welcome, Login, Signup, Profile Setup, Interests, Feed, Activity Detail, Paywall
- **Theme:** Full design system (colors, typography, spacing matching the blueprint)
- **State:** Zustand stores for auth + activities
- **Services:** Typed API client with auto-auth headers

### Backend (`groupsync-api/src/`)
- **Auth:** JWT-based, bcrypt passwords
- **Activities:** Full CRUD, join/leave, free-tier limiting (3/month), status progression
- **AI Planning:** Questionnaire collection → OpenAI suggestion generation → voting
- **Chat:** Socket.io real-time messaging
- **Social:** Friend requests + connections
- **Payments:** Stripe subscription routes (stubs ready to fill in)

### Database
- Full schema in `migrations/001_initial_schema.sql` — all 9 tables from the blueprint

---

## 6. Next Steps (in order)

1. **Run it** — get both servers up, confirm health check works
2. **Test auth flow** — signup → onboarding → feed
3. **Seed test activities** — manually insert a few via psql or write a seed script
4. **Build Questionnaire screen** — `src/screens/activity/QuestionnaireScreen.tsx` is a stub
5. **Build Suggestions screen** — same
6. **Build Chat screen** — hook up Socket.io client
7. **Stripe integration** — fill in `payments.controller.ts`
8. **Add icons** — install `@expo/vector-icons` and wire up tab bar + action icons
