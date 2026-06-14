-- GroupSync Initial Schema
-- Run: psql -d groupsync -f migrations/001_initial_schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;  -- For location/geospatial queries (optional, skip if not installed)

-- ─────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT,                     -- null for social logins
  name                TEXT NOT NULL,
  age                 INTEGER CHECK (age >= 18),
  bio                 TEXT,
  profile_photo_url   TEXT,
  location            POINT,                    -- lat/lng
  interests           TEXT[] DEFAULT '{}',
  looking_for         TEXT[] DEFAULT '{}',
  is_premium          BOOLEAN NOT NULL DEFAULT FALSE,
  premium_expires_at  TIMESTAMPTZ,
  stripe_customer_id  TEXT,
  firebase_uid        TEXT UNIQUE,              -- for social logins
  verified            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX idx_users_is_premium ON users (is_premium);

-- ─────────────────────────────────────────────────
-- ACTIVITIES
-- ─────────────────────────────────────────────────
CREATE TYPE activity_status AS ENUM (
  'forming',    -- waiting for min participants
  'planning',   -- AI questionnaire phase
  'confirmed',  -- activity confirmed, group chat open
  'completed',  -- activity happened
  'cancelled'
);

CREATE TYPE activity_category AS ENUM (
  'food', 'outdoors', 'creative', 'games',
  'entertainment', 'fitness', 'music', 'other'
);

CREATE TABLE IF NOT EXISTS activities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  category            activity_category NOT NULL,
  photo_url           TEXT,
  scheduled_at        TIMESTAMPTZ,              -- null if flexible
  location            POINT,
  location_name       TEXT,
  min_participants    INTEGER NOT NULL DEFAULT 3,
  max_participants    INTEGER NOT NULL DEFAULT 5,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status              activity_status NOT NULL DEFAULT 'forming',
  tags                TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_participants CHECK (min_participants >= 2 AND max_participants <= 20),
  CONSTRAINT min_lte_max CHECK (min_participants <= max_participants)
);

CREATE INDEX idx_activities_creator ON activities (creator_id);
CREATE INDEX idx_activities_status ON activities (status);
CREATE INDEX idx_activities_category ON activities (category);
CREATE INDEX idx_activities_scheduled_at ON activities (scheduled_at);
CREATE INDEX idx_activities_created_at ON activities (created_at DESC);

-- ─────────────────────────────────────────────────
-- ACTIVITY PARTICIPANTS
-- ─────────────────────────────────────────────────
CREATE TYPE participant_status AS ENUM (
  'interested', 'joined', 'confirmed', 'attended'
);

CREATE TABLE IF NOT EXISTS activity_participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      participant_status NOT NULL DEFAULT 'joined',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (activity_id, user_id)
);

CREATE INDEX idx_ap_activity ON activity_participants (activity_id);
CREATE INDEX idx_ap_user ON activity_participants (user_id);
CREATE INDEX idx_ap_joined_at ON activity_participants (user_id, joined_at);

-- ─────────────────────────────────────────────────
-- AI QUESTIONNAIRES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_questionnaires (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id  UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses    JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (activity_id, user_id)
);

CREATE INDEX idx_questionnaire_activity ON ai_questionnaires (activity_id);

-- ─────────────────────────────────────────────────
-- AI SUGGESTIONS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id     UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE UNIQUE,
  suggestion_data JSONB NOT NULL DEFAULT '[]',  -- array of 3 suggestions
  votes           JSONB NOT NULL DEFAULT '{}',  -- { userId: optionIndex }
  winner          INTEGER,                      -- winning option index after voting
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- FRIENDSHIPS
-- ─────────────────────────────────────────────────
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');

CREATE TABLE IF NOT EXISTS friendships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              friendship_status NOT NULL DEFAULT 'pending',
  met_at_activity_id  UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user1_id, user2_id),
  CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

CREATE INDEX idx_friendships_user1 ON friendships (user1_id);
CREATE INDEX idx_friendships_user2 ON friendships (user2_id);

-- ─────────────────────────────────────────────────
-- MESSAGES (Group Chat)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_activity ON messages (activity_id, sent_at ASC);

-- ─────────────────────────────────────────────────
-- ACTIVITY RATINGS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_ratings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id      UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  would_recommend  BOOLEAN NOT NULL DEFAULT TRUE,
  feedback         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (activity_id, user_id)
);

-- ─────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
  'activity_joined',
  'group_ready',
  'questionnaire_ready',
  'suggestions_ready',
  'activity_confirmed',
  'activity_reminder',
  'friend_request',
  'friend_accepted',
  'premium_trial'
);

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);

-- ─────────────────────────────────────────────────
-- DEVICE TOKENS (Push Notifications)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
