-- GroupSync demo seed data
-- Run AFTER 001_initial_schema.sql:
--   psql -U postgres -d groupsync -f groupsync-api/migrations/002_seed_demo.sql
--
-- Creates a few host users + a populated Discover feed so the app isn't empty
-- on camera. These hosts have no password (you won't log in as them) — you sign
-- up with your own account in the app, then run the UPDATE at the bottom.

-- ─── Demo host users ──────────────────────────────────────────
INSERT INTO users (id, email, name, age, bio, interests, verified) VALUES
  ('11111111-1111-1111-1111-111111111111', 'maya@demo.local',  'Maya',  24, 'Foodie & always down for tacos 🌮', ARRAY['food','music'],     TRUE),
  ('22222222-2222-2222-2222-222222222222', 'leo@demo.local',   'Leo',   27, 'Trail runner and board-game nerd 🥾🎲', ARRAY['outdoors','games'], TRUE),
  ('33333333-3333-3333-3333-333333333333', 'sophie@demo.local','Sophie',22, 'Art student, loves a creative night 🎨',  ARRAY['creative','food'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── Demo activities (populate the feed) ──────────────────────
INSERT INTO activities
  (creator_id, title, description, category, scheduled_at, location_name,
   min_participants, max_participants, current_participants, status, tags)
VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Taco crawl through the city center 🌮', 'Three spots, one evening, all the tacos. Casual and chatty — perfect for meeting new people.',
   'food', NOW() + INTERVAL '2 days', 'Breda city center',
   3, 5, 2, 'forming', ARRAY['Casual','Foodie','Walkable']),

  ('22222222-2222-2222-2222-222222222222',
   'Sunday morning hike + coffee ☀️🥾', 'Easy 8km loop, then specialty coffee. Good vibes, no rush.',
   'outdoors', NOW() + INTERVAL '5 days', 'Mastbos forest',
   3, 6, 3, 'forming', ARRAY['Active','Outdoors','Chill']),

  ('33333333-3333-3333-3333-333333333333',
   'Pottery & prosecco night 🏺🥂', 'Beginner-friendly wheel-throwing class with drinks. Messy and fun.',
   'creative', NOW() + INTERVAL '3 days', 'Klei Studio',
   3, 4, 2, 'planning', ARRAY['Creative','Hands-on','Social']),

  ('22222222-2222-2222-2222-222222222222',
   'Board-game café showdown 🎲', 'Settlers, codenames, the works. Snacks provided. Friendly competition only.',
   'games', NOW() + INTERVAL '1 day', 'The Dice Den',
   3, 5, 4, 'forming', ARRAY['Cosy','Games','Indoor']),

  ('11111111-1111-1111-1111-111111111111',
   'Live jazz & small plates 🎷', 'Local jazz trio, a few shared plates, easy conversation.',
   'music', NOW() + INTERVAL '6 days', 'Blue Note Bar',
   3, 5, 1, 'forming', ARRAY['Music','Nightlife','Relaxed'])
ON CONFLICT DO NOTHING;

-- ─── Make YOUR account premium ────────────────────────────────
-- After you sign up in the app, replace the email below and run just this line
-- so you can create activities and leave groups during the demo:
--
-- UPDATE users SET is_premium = TRUE WHERE email = 'you@example.com';
