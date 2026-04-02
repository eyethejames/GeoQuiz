
## Resource Model Overview
Resource                    | Method | Description
----------------------------------------------------------------------------
/api/auth/me                | GET    | Return user information
/api/auth/register          | POST   | Register new user
/api/auth/login             | POST   | Log user in
/api/auth/logout            | POST   | Log user out
----------------------------------------------------------------------------
/api/categories             | GET    | Receive all categories
/api/categories/:id/quizzes | GET    | Retrieve quizzes within category
/api/quizzes/:id/questions  | GET    | Retrive questions within a certain quiz
/api/sessions               | POST   | Initialize new session
/api/sessions/:id/answer    | POST   | Submit answers
/api/sessions/:id/finalize  | POST   | Finalize session

## Endpoint Specifications

1. GET /api/auth/me
Response:
```json
    {
        "userId": 1234,
        "username": "Jakob"
    }
```
Status Codes:
- 200 OK - authenticated user returned
- 401 Unauthorized - missing/invalid/expired auth session
- 500 Internal Server Error - unexpected server failure

2. POST /api/auth/register
Request:
```json
    {
        "username": "Jakob",
        "password": "..."
    }
```

Response:
```json
    {
        "userId": 123,
        "created_at": "dd/mm/yyyy, hh:mm:ss PM"
    }
```
Status Codes:
- 201 Created - user created and logged in
- 400 Bad Request - invalid username/password format
- 409 Conflict - username already exists
- 500 Internal Server Error - unexpected server failure

3. POST /api/auth/login
Request:
```json
    {
        "username": "Jakob",
        "password": "..."
    }
```

Response:
```json
    {
        "userId": 0123,
        "session_token": "...",
        "created_at": "dd/mm/yyyy, hh:mm:ss PM"
    }
```
Status Codes:
- 200 OK - login succeeded and session cookie set
- 400 Bad Request - invalid request payload
- 401 Unauthorized - invalid credentials
- 500 Internal Server Error - unexpected server failure

4. POST api/auth/logout
Request:
```json
    {
        
    }
```

Response:
```json
    {
        "boolean": true
    }
```
Status Codes:
- 200 OK - logout succeeded (cookie cleared)
- 401 Unauthorized - no valid active session
- 500 Internal Server Error - unexpected server failure

----------------------------------------------------------------------------
5. GET api/categories
Response: 
```json
[
  {
    "categoryId": 1,
    "name": "Europe"
  }
]
```
Status Codes:
- 200 OK - categories returned
- 500 Internal Server Error - unexpected server failure

6. GET api/categories/:id/quizzes
Response (200 OK)
```json
[
  {
    "quizId": 1,
    "title": "European Capitals"
  },
  {
    "quizId": 2,
    "title": "EU Member States"
  }
]
```
Status Codes:
- 200 OK - quizzes returned
- 400 Bad Request - invalid category id
- 500 Internal Server Error - unexpected server failure

7. GET api/quizzes/:id/questions
Example Response:
```json
{
  "quizId": 1,
  "questions": [
    {
      "questionId": 10,
      "prompt": "What is the capital of France?",
      "options": [
        { "optionId": 1, "text": "Paris" },
        { "optionId": 2, "text": "Rome" }
      ]
    }
  ]
}
```
Status Codes:
- 200 OK - questions returned
- 400 Bad Request - invalid quiz id
- 500 Internal Server Error - unexpected server failure

8. POST api/sessions
Request:
```json
{
  "quizId": 3,
  "userId": 123
}
```

Response:
```json
{
  "sessionId": 15,
  "startedAt": "dd/mm/yyyy, hh:mm:ss PM"
}
```
Status Codes:
- 201 Created - session created
- 400 Bad Request - missing/invalid quizId or userId
- 401 Unauthorized - user not authenticated (if session-derived user is required)
- 500 Internal Server Error - unexpected server failure

9. POST api/sessions/:id/answer
Request:
```json
{
  "questionId": 10,
  "selectedOptionId": 2
}
```

Response:
```json
{
  "correct": false,
  "score": 3
}
```
Status Codes:
- 200 OK - answer accepted and score updated
- 400 Bad Request - invalid payload or option/question mismatch
- 404 Not Found - session not found
- 409 Conflict - session finalized or question already answered
- 500 Internal Server Error - unexpected server failure

10. POST api/sessions/:id/finalize
Request:
```json
{

}
```

Response:
```json
{
  "sessionId": 10000,
  "score": 5,
  "finishedAt": "dd/mm/yyyy, hh:mm:ss PM",
  "answeredCount": 3,
  "totalQuestions": 3,
  "alreadyFinalized": true
}
```
Status Codes:
- 200 OK - session finalized (or already finalized)
- 400 Bad Request - invalid session id
- 404 Not Found - session not found
- 500 Internal Server Error - unexpected server failure
