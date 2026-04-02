## Cookie Behavior end-to-end

1. User logs in or registers, (`POST /api/auth/login || .../register` ) and server
    ...validates username and password.
    ...generates a random token (raw session token)
    ...stores only sha256(token) in auth_session
    ...sends raw session token in Set-Cookie

2. Browser stores cookie automatically
    - Never store session token in localStorage for this flow
    - On next request to the domain, browser auto-attaches cookie in Cookie-header

3. Protected route: `GET /api/auth/me`
    - Server reads cookie
    - Server hashes cookie token
    - Server finds matching session_token_hash in DB
    - Server checks expires_at
    - Valid token ? Return user | Error 401

4. Logout: `POST /api/auth/logout`
    - Server reads cookie token, hashes it, deletes matching DB session row
    - Server sends clearing cookie (Set-Cookie with Max-Age=0)

5. Cookie Flags:
- HttpOnly
- SameSite=Lax (CSRF - Cross Site Request Forgery)
- Path=/
- Max-Age=2592000 (30 days)
- Secure=true (only in production/HTTPS)