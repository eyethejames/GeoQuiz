ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;

INSERT INTO users (username, is_guest)
VALUES ('guest', true)
ON CONFLICT (username) DO NOTHING;