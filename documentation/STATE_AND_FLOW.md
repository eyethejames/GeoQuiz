
## State machine - Technical explanations
State machine is about different states for the system and which events flows between them.

Follows strict rules: From this state you can only go there

- Example: question -> feedback -> question -> finished

## Flow Chart - Users game flow
is about the user experience over time, decisions (has the user responded) and actions (API-calls, DB, UI-updates)

- Example: Start -> get quiz -> create session -> show question -> user response -> send to API -> show feedback -> next?

Question loop:
→ DISPLAY QUESTION (n / total)
→ USER SELECTED AN ANSWER?
→ YES: SEND ANSWER TO BACKEND | NO: STAY IN VIEW
→ CHECK CORRECTNESS + SCORE (FEEDBACK) WITH BACKEND
→ DISPLAY FEEDBACK
→ DISABLE OPTIONS
→ MORE QUESTIONS LEFT?
→ YES: REPEAT | NO: END GAME / GO TO FINAL SCORE

Each node/box in the flowchart is to represent one of the following:
1. A screen or view the user experiences as a phase - Category list, Quiz list, Question view, Feedback view
2. A user action that changes the flow - Pick category, pick quiz, press "Answer", press "Next
3. A system action with risk, waiting time or change of data - Get quizes, create session, send answer, save result

A good interactive app has one state machine in its code, and multiple flow charts that explains the different flows of it.

## SEE COMPLETE FLOW CHART OF THE GAME here: 
## documentation/diagrams/FlowChart.png
