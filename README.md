## GeoQuiz
A database-driven quiz application built with Next.js and PostgreSQL.
This project focuses on backend architecture, relational database design, and API-driven gameplay flow.

## Testbruker:
testbruker
test123!

The main goal is to practice 
- Relational database modeling (ER design)
- REST API design
- Session-based quiz logic
- Backend–frontend interaction
- State machine & flow modeling
- Clean separation between UI and data layer

## Tech Stack
- Next.js (App Router)
- Node.js
- PostgreSQL
- pg (node-postgres)
- Custom REST API routes
- Flow & state modeling using diagrams

## Core Architecture
The application follows a structured flow:
- User logs in (optionally)
- User selects:
    - gamemode
    - region
    - category (multiple selection support)
    - question count (later scaling includes difficulty)
- Backend creates a session
    - if logged in: as user
    - if not logged in: as guest
- Questions are fetched and game session created with questions and their respective answers
- User answers questions
- Backend validates answers
- Session score is calculated
- Final result is returned

The gameplay logic is session-based.

## Database Design
Tables:
- users
- user_auth
- auth_session
- game_session
- region
- category
- question
- answer_option
- session_category
- session_question
- session_answer

The database is fully relational with foreign keys and composite keys.
See /documentation/ for ER diagrams and modeling notes.

## API Overview

List categories: GET /api/categories

List quizzes in category: GET /api/categories/:id/quizzes

Create session: POST /api/sessions

Fetch questions: GET /api/quizzes/:id/questions

Submit answer: POST /api/sessions/:id/answer

Finalize session: POST /api/sessions/:id/finalize

## Gameplay Flow

See /documentation/STATE_AND_FLOW.md for complete state machine and swim-lane flowchart

-----

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
