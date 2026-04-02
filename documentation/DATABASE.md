<<-- GeoQuiz - Database Design -->>

## 1. Purpose
The GeoQuiz database is designed to support:
- User accounts
- User game sessions
- Reusable question banks
- Selection of region and category for quiz tailoring after desire
- Randomly generated quizzes without ordering
- Persistent answer results
- Strong referential integrity

The schema is relational and constraint-driven to ensure data correctness at the database level

## 2. Core Design Decisions
One-to-Many between Users and Game Session
One user can only have one game session, but multiple users can have active game sessions

One-to-Many between Game Session and (Session Category, Session Question and Session Answer) to ensure that each game session has a set amount of categories and questions with their respective answers.

Composite Primary Key in Result
PRIMARY KEY (session_id, question_id) guarantees that a question can only be answered once per session

Composite Foreign Key for Answer Integrity
FOREIGN KEY (question_id, selected_option_id) 
-> AnswerOption (question_id, option_id) guarantees that the selected option belongs to the answered question

## 3. Tables Overview
$ Users - represents players
$ UserAuth - stores username tag and hashed password
$ AuthSession - represents if user is authenticated or not
$ GameSession - represents an attempt on a quiz
$ SessionCategory - represents chosen categories for a game session
$ SessionQuestion - stores questions in selected categories in a game session
$ SessionAnswer - stores answers for each question in a game session
$ Region - represents geographical area
$ Category - represents categories
$ Question - represents a reusable question
$ AnswerOption - answer alternatives for a question $

## 4. Integrity Rules Enforced at Database Level
- Unique usernames
- Unique region and category names
- Custom amount of categories and questions possible
- One correct answer for each question
- One answer per question per session
- Selected option must belong to the question


## TODO:

## 5. REST Mapping
| Resource                    | Table                    |
| --------------------------- | ------------------------ |
| /api/categories             | category                 |
| /api/categories/:id/quizzes | quiz                     |
| /api/quizzes/:id/questions  | quiz_question + question |
| /api/sessions               | game_session             |
| /api/sessions/:id/answer    | answer_result            |

Note: The running PostgreSQL schema in this project uses lowercase snake_case table names.

## 6. Architectural Chain
Domain Model
-> Entity-Relationship model
-> Relational Schema
-> REST Resource Model
-> Application Flow
-> State Machine Validation
