import bcrypt from "bcryptjs";
import crypto from "crypto";

export const AUTH_COOKIE_NAME = "geoquiz_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

export function createSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function getSessionExpiryDate() {
    return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000); // 30 days from now
}

export function setAuthCookie(response, rawToken) {
    response.cookies.set(AUTH_COOKIE_NAME, rawToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: "/",
    });
}

export function clearAuthCookie(response) {
    response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });
}