GeoQuiz - Data Dictionary

## Data Dictionary
A Data Dictionary is a formal description of all data elements in a database system. It defines the meaning, constraints and the intended usage of each attribute independently of implementation details.

While the database schema defines and specifies the structure, the data dictionary specifies the semantics.

The purpose of the data dictionary in this project is to ensure semantic clarity, prevent ambiguity in future extensions and support architectural consistency across database, REST layer and application flow.

## -- TABLES -- ##

## USERS
--------------------------------------------------------------------------------
| Column     | Type      | Constraints       | Description                     |
| ---------- | --------- | ----------------  | ------------------------------- |
| user_id    | integer   | PK                | Unique identifier for a user    |
| username   | varchar   | UNIQUE, NOT NULL  | Display name chosen by the user |
| created_at | timestamp | DEFAULT now()     | Timestamp when user was created |
--------------------------------------------------------------------------------

## CATEGORY
--------------------------------------------------------------------------------
| Column      | Type    | Constraints        | Description                     |
| ----------- | ------- | ------------------ | ------------------------------- |
| category_id | integer | PK                 | Unique identifier for category  |
| name        | varchar | UNIQUE, NOT NULL   | Logical grouping of quizzes and |
|             |         |                    | question bank                   |
--------------------------------------------------------------------------------

## QUIZ
--------------------------------------------------------------------------------
| Column      | Type    | Constraints            | Description                 |
| ----------- | ------- | ---------------------- | --------------------------- |
| quiz_id     | integer | PK                     | Unique identifier for quiz  |
| category_id | integer | FK → CATEGORY          | Category ownership          |
| title       | varchar | NOT NULL               | Display title of the quiz   |
--------------------------------------------------------------------------------

## QUESTION
--------------------------------------------------------------------------------
| Column      | Type    | Constraints            | Description                 |
| ----------- | ------- | ---------------------- | --------------------------- |
| question_id | integer | PK                     | Unique identifier           |
| category_id | integer | FK → CATEGORY          | Question bank ownership     |
| prompt      | varchar | NOT NULL               | Question text shown to user |
| difficulty  | integer | NULLABLE               | Relative difficulty (1–5)   |
| explanation | varchar | NULLABLE               | Optional feedback text      |
--------------------------------------------------------------------------------

## QUIZQUESTION (Associative Entity)
--------------------------------------------------------------------------------
| Column      | Type    | Constraints                   | Description          |
| ----------- | ------- | ----------------------------- | -------------------- |
| quiz_id     | integer | PK, FK → QUIZ                 | Quiz identifier      |
| question_id | integer | PK, FK → QUESTION             | Question identifier  |
| position    | integer | NOT NULL, UNIQUE per quiz     | Order within quiz    |
--------------------------------------------------------------------------------

## ANSWEROPTION
--------------------------------------------------------------------------------
| Column       | Type    | Constraints            | Description                |
| ------------ | ------- | ---------------------- | -------------------------- |
| option_id    | integer | PK                     | Unique identifier          |
| question_id  | integer | FK → QUESTION          | Parent question            |
| text         | varchar | NOT NULL               | Answer text shown to user  |
| is_correct   | boolean | NOT NULL               | Indicates correct answer   |
--------------------------------------------------------------------------------

## GAMESESSION
--------------------------------------------------------------------------------
| Column      | Type      | Constraints          | Description                 |
| ----------- | --------- | -------------------- | ----------------------------|
| session_id  | integer   | PK                   | Unique session identifier   |
| user_id     | integer   | FK → USERS           | Session owner               |
| quiz_id     | integer   | FK → QUIZ            | Attempted quiz              |
| started_at  | timestamp | DEFAULT now()        | Session start timestamp     |
| finished_at | timestamp | NULLABLE             | Null if session is active   |
| score       | integer   | NULLABLE             | Number of correct answers   |
--------------------------------------------------------------------------------

## RESULT
------------------------------------------------------------------------------------------
| Column             | Type      | Constraints                  | Description            |
| ------------------ | --------- | ---------------------------- | ---------------------- |
| session_id         | integer   | PK, FK → GAMESESSION         | Session identifier     |
| question_id        | integer   | PK, FK → QUESTION            | Question answered      |
| selected_option_id | integer   | Composite FK → ANSWEROPTION  | Chosen answer option   |
| is_correct         | boolean   | NOT NULL                     | Snapshot correctness   |
| answered_at        | timestamp | DEFAULT now()                | Answer submission time |
------------------------------------------------------------------------------------------

## Critical Semantic Clarifications
1. position ≠ user progress
User progress is derived from 'Number of rows in Result for the session'

2. Session completion logic
A session is complete when COUNT(Result for session) == COUNT (QuizQuestion for quiz)

3. Derived vs Stored Data
Stored:
- score
- is_correct in Result

Derived:
- current question index
- completion percentage
- pass/fail (if implemented later)

## ACID-prinsipper
A - Atomicity: Alt eller ingenting
C - Consistency: Gyldig data
I - Isolation: Samtidige queries påvirker ikke hverandres feil
D - Durability: Data lagres permanent