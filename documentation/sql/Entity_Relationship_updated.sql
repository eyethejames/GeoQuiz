-- NOTE:
-- This file is an exported conceptual schema using quoted PascalCase identifiers.
-- The running app database uses lowercase snake_case names
-- (users, category, quiz, question, quiz_question, answer_option, game_session, answer_result).

CREATE TABLE "Users" (
  "user_id" integer PRIMARY KEY,
  "username" varchar UNIQUE NOT NULL,
  "created_at" timestamp
  "is_guest" boolean NOT NULL DEFAULT false
);

CREATE TABLE "Category" (
  "category_id" integer PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Quiz" (
  "quiz_id" integer PRIMARY KEY,
  "category_id" integer,
  "title" varchar NOT NULL
);

CREATE TABLE "Question" (
  "question_id" integer PRIMARY KEY,
  "category_id" integer,
  "prompt" varchar NOT NULL,
  "difficulty" integer,
  "explanation" varchar
);

CREATE TABLE "QuizQuestion" (
  "quiz_id" integer,
  "question_id" integer,
  "position" integer NOT NULL,
  PRIMARY KEY ("quiz_id", "question_id")
);

CREATE TABLE "AnswerOption" (
  "option_id" integer PRIMARY KEY,
  "question_id" integer,
  "is_correct" boolean NOT NULL,
  "text" varchar NOT NULL
);

CREATE TABLE "GameSession" (
  "session_id" integer PRIMARY KEY,
  "user_id" integer,
  "quiz_id" integer,
  "started_at" timestamp,
  "finished_at" timestamp,
  "score" integer
);

CREATE TABLE "Result" (
  "session_id" integer,
  "question_id" integer,
  "selected_option_id" integer,
  "is_correct" boolean,
  "answered_at" timestamp,
  PRIMARY KEY ("session_id", "question_id")
);

CREATE TABLE "UserAuth" (
  "user_id" integer PRIMARY KEY,
  "password_hash" varchar NOT NULL
);

CREATE TABLE "AuthSession" (
  "session_token_hash" char(64) UNIQUE NOT NULL,
  "user_id" integer PRIMARY KEY,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON "QuizQuestion" ("quiz_id", "position");

CREATE UNIQUE INDEX ON "AnswerOption" ("question_id", "option_id");

ALTER TABLE "Quiz" ADD FOREIGN KEY ("category_id") REFERENCES "Category" ("category_id");

ALTER TABLE "Question" ADD FOREIGN KEY ("category_id") REFERENCES "Category" ("category_id");

ALTER TABLE "QuizQuestion" ADD FOREIGN KEY ("quiz_id") REFERENCES "Quiz" ("quiz_id");

ALTER TABLE "QuizQuestion" ADD FOREIGN KEY ("question_id") REFERENCES "Question" ("question_id");

ALTER TABLE "AnswerOption" ADD FOREIGN KEY ("question_id") REFERENCES "Question" ("question_id");

ALTER TABLE "GameSession" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id");

ALTER TABLE "GameSession" ADD FOREIGN KEY ("quiz_id") REFERENCES "Quiz" ("quiz_id");

ALTER TABLE "Result" ADD FOREIGN KEY ("session_id") REFERENCES "GameSession" ("session_id");

ALTER TABLE "Result" ADD FOREIGN KEY ("question_id") REFERENCES "Question" ("question_id");

ALTER TABLE "Result" ADD FOREIGN KEY ("question_id", "selected_option_id") REFERENCES "AnswerOption" ("question_id", "option_id");