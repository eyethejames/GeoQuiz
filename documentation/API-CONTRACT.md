## Architectural Role
The REST API acts as the controlled boundary between:
- Database (internal persistence model)
- Frontend (presentation layer)

The API abstracts internal schema details and exposes a stable resource model

## Resource Model Overview
Resource                   | Method | Description
----------------------------------------------------------------------------
/api/auth/me               | GET    | Return user information
api/auth/register          | POST   | Register new user
api/auth/login             | POST   | Log user in
api/auth/logout            | POST   | Log user out
----------------------------------------------------------------------------
api/categories             | GET    | Receive all categories
api/categories/:id/quizzes | GET    | Retrieve quizzes within category
api/quizzes/:id/questions  | GET    | Retrive questions within a certain quiz
api/sessions               | POST   | Initialize new session
api/sessions/:id/answer    | POST   | Submit answers
api/sessions/:id/finalize  | POST   | Finalize session

## Endpoint Specifications

See: documentation/ENDPOINT_SPEC.md 
|| /Users/jakob/Desktop/Jakob/Programmering/geoquiz/documentation/ENDPOINT_SPEC.md

## Invariants Enforced by API
- A question can only be answered once per session
- Selected option must belong to question
- Session must be active
- Final score is calculated on server-side

## Data Exposure Policy
What is never exposed:
- AnswerOption.is_Correct
- Internal join tables (QuizQuestion)
- Raw relational structure

The API exposes a domain-oriented view, not the physical schema