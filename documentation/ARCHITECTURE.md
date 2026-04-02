## RESTful resource model
The system is modeled around resources:
- categories
- quizzes
- sessions
- answers

A RESTful resource model means modeling the system around resources, and not just making random endpoints.

## What is a "resource"?
In REST, a resource is a noun that represents a thing in your system. In this case its categories, quizzes, questions, sessions, answers and users.

## What makes it RESTful?
REST says that URLs represent resources and HTTP methods represent actions

So instead of:

POST /createSESSION
POST /submitAnswer
GET /getQuestions

I do:

POST /api/sessions
POST /api/sessions/:id/answer
GET /api/quizzes/:id/questions

## Domain Model - Architecture
REST exposes that domain model via HTTP, so the API structure mirrors my database structure, and the flowchart mirrors my API.

Architecture: Domain -> ER -> Schema -> REST -> Flow -> UI

## Domain Modeling
The database schema is derived from an Entity-Relationship (ER) model.
The ER diagram defines the conceptual relationships between Users, Categories, Quizzes, Questions, Sessions, and Results.

The REST API structure mirrors this domain model.

## Syntax
I am using pg and raw SQL through client.query, not ORM (Object-Relational Mapping) or query builder with method calls. ORM-syntax requires that a table is an object from a library such as Prisma/Drizzle/Sequelise etc.