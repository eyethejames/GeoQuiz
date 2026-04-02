## Security Rules (to be) included in my contract

1. Cookie: HttpOnly, SameSite=Lax, Path=/, Max-Age=2592000, Secure in production

2. Store only sha256(token) in DB, never RAW token

3. Passwords hashed with salt (bcrypt recommended)

4. Uniform auth errors on login (Invalid credentials) to avoid user enumeration

## Login Session Flow (with example values):
1. User sends password "<plain-password>" to server
2. hashPassword -> store hash in user_auth
3. createSessionToken -> raw token "7f9c..."
4. Input raw token to hashSessionToken(7f9c...) -> hashed token "a3e1..."
5. Store hashed token "a3e1..." in auth_session
6. Send cookie with raw token "7f9c..."
7. Later request: server reads cookie raw token, hashes it again, compares to DB hash

---or:---

1. Client sends username + "<plain-password>" to server
2. Server hashes password with bcrypt and stores hash in `user_auth.password_hash`
3. Server generates raw session token (e.g. `7f9c...`)
4. Server hashes raw token with SHA-256 to a hashed token (e.g. `a3e1...`)
5. Server stores token hash in `auth_session.session_token_hash`
6. Server sends cookie with raw token (`Set-Cookie: geoquiz_session=7f9c...; HttpOnly; ...`)
7. On later requests, server reads cookie raw token, hashes it again, compares to DB hash
8. If hash match + session not expired -> authenticated.