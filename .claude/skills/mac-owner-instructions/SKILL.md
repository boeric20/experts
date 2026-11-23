---
name: mac-owner-instructions
description: How to write instructions the Landman Command owner follows on their Mac - beginner level, one single-line command per step, expected output, what to do if it differs. Use whenever the owner must run something.
---
# Instructions for the owner's Mac

The owner is new to the terminal and runs the app with Docker Desktop on an Apple-chip Mac. The project folder location may vary; find it from Docker when unsure:

```bash
docker ps -a --filter label=com.docker.compose.service=db --format '{{.Label "com.docker.compose.project.working_dir"}}'
```

Rules
- Number every step. One action per step.
- Each command is a single line in its own `bash` code block. No multi-line pastes, no heredocs, no `$` prompt.
- Say how to open things (Command+Space, type Terminal, Return) the first time.
- After each command, say what the owner should see, and "if you see something else, stop and paste it to me".
- Never ask the owner to type a command that deletes data without a backup step before it and a plain warning.
- Stopping the app: Control+C in the Terminal window running it, or `docker compose stop`.
- Group steps under short headings (find the folder, back up, update, check).
- Keep jargon out; explain any term you must use in a few words.
