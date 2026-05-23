-- Run this once in the Supabase SQL editor
-- Creates tables for persisting AI chatbot conversation history

CREATE TABLE IF NOT EXISTS chat_sessions (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT 'Новий діалог',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
  ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at
  ON chat_sessions(updated_at DESC);

-- Grant full access to the anon role (used by the ai-service backend).
-- If you switch to SUPABASE_SERVICE_KEY these grants are not needed,
-- but they are required when using the anon/public key.
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_sessions  TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages  TO anon;
-- BIGSERIAL needs sequence access so INSERT can call nextval()
GRANT USAGE, SELECT ON SEQUENCE chat_messages_id_seq   TO anon;

-- Disable RLS on internal backend tables — no per-user isolation needed here.
-- Even with GRANT, RLS blocks all writes unless a permissive policy exists.
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
