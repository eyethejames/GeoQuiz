CREATE TABLE IF NOT EXISTS user_auth (
  user_id integer PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_session (
  session_token_hash char(64) UNIQUE NOT NULL,
  user_id integer PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_session_expires_at_idx
  ON auth_session (expires_at);
