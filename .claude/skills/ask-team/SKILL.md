---
name: ask-team
description: Ask the Landman Command expert team a question. The orchestrator picks the right experts, has them work on it, and returns one combined answer. Consultation only; nothing in the app is changed.
argument-hint: "[question]"
context: fork
agent: orchestrator
background: false
disable-model-invocation: true
---
Answer this question for the Landman Command Product Owner by consulting the right experts on the team:

$ARGUMENTS

Follow your orchestrator instructions: choose the fewest experts that cover the question, run independent consultations in parallel, reconcile their findings, and return one combined answer with the experts consulted, the evidence, the open decisions, and your recommendation. This is a consultation: no expert changes any file.
