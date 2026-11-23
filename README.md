# Landman Experts

A web app for talking to the Landman Command expert team: 30 experts, each with its own name,
personality, model, skills, and knowledge folder, plus an orchestrator that brings several
experts together and combines their answers.

The experts are defined in this repository and read when the site is built. Claude is called
only from Netlify Functions, so your Claude API key stays on Netlify's servers and never reaches
the browser.

## What is in this repository

| Path | What it is |
| --- | --- |
| `web/` | The React web app and its Netlify Functions |
| `netlify.toml` | Tells Netlify how to build and publish the app (no other settings needed) |
| `.claude/agents/` | One file per expert: instructions, personality, model |
| `.claude/skills/` | Skills the experts preload |
| `.claude/agent-memory/` | Lessons experts saved from earlier work |
| `knowledge/<agent-name>/` | Each expert's knowledge folder (Markdown, text, CSV, JSON, or PDF) |
| `docs/` | The team roster, models and personalities, how the team works, example prompts |
| `sdk/`, `.claude/agents/ruth.md` | The separate script for asking Ruth from your computer (not used by the web app) |

The team was copied from `boeric20/Landman-Interface` on 2026-11-23. That repository is where the
team is maintained; see "Updating the experts" below.

## Deploy to Netlify (step by step)

You need a Claude API key, a Netlify account, and about 10 minutes.

### 1. Get a Claude API key
1. Go to https://platform.claude.com and sign in (or create an account).
2. Add a payment method or credits under Billing. The API is billed per use, separately from a
   Claude.ai subscription.
3. Open **API keys**, choose **Create key**, name it "Landman Experts", and copy the key. It starts
   with `sk-ant-`. Keep it somewhere safe; you will paste it into Netlify in step 3.

### 2. Create the site on Netlify
1. Go to https://app.netlify.com and sign in with GitHub.
2. Choose **Add new project**, then **Import an existing project**, then **GitHub**.
3. Pick the repository **boeric20/experts**. If it is not listed, use the link to configure the
   Netlify app on GitHub and give it access to this repository.
4. Netlify reads `netlify.toml`, so leave the build settings as they are. Choose **Deploy**.
   The first deploy builds the site; it will not answer questions until step 3 is done.

### 3. Add the two environment variables
1. In your Netlify project, open **Project configuration**, then **Environment variables**.
2. Choose **Add a variable**, then **Add a single variable**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: the key from step 1
   - Turn on **Contains secret values**, and make sure the variable applies to **Functions**.
3. Add a second variable:
   - Key: `SITE_PASSWORD`
   - Value: a password you choose. Anyone with this password can use the site and spend your
     API credits, so make it long and share it only with people you trust.
   - Turn on **Contains secret values**.
4. Go to **Deploys**, choose **Trigger deploy**, then **Deploy site**, so the functions pick up the
   new variables.

### 4. Use it
1. Open the site address Netlify shows (it ends in `.netlify.app`).
2. Enter the site password.
3. Pick an expert from the sidebar and ask a question, or choose **Ask the whole team**.

If something fails, the app shows the reason: a missing variable, a wrong key, or a rate limit.

## How it works

- **One expert:** your message goes to `/api/chat`, which sends it to Claude with that expert's
  instructions, preloaded skills, memory, and knowledge folder, on the expert's own model
  (Opus, Sonnet, or Haiku, from the `model:` line in its file). The answer streams back.
- **Ask the whole team:** three steps, because Netlify stops any single function call after 60
  seconds:
  1. `/api/team-plan`: the orchestrator (Morgan) chooses one to four experts and writes each a
     question.
  2. `/api/chat` once per expert, in parallel, shown live in the app.
  3. `/api/team-answer`: the orchestrator combines the answers into one.
- **Web search** (the toggle at the top): lets experts check current facts on the web, with
  sources listed under the answer. It adds time and cost. If searches fail, web search may be
  turned off for your organization in the Claude Console; switch the toggle off.
- **Knowledge PDFs** are sent to Claude with the first message of a conversation and cached, so
  follow-up questions cost much less.
- **Refusal fallback:** for Opus and Sonnet experts, if Claude declines a request on policy
  grounds, the API automatically retries it on a fallback model and the app says so.
- **Conversations** are kept in your browser only (one per expert). "New conversation" clears it.

### Limits
- Each answer must finish within about 60 seconds (Netlify's limit). Very long reports or many web
  searches can be cut off; the app says when that happens. Ask a narrower question or turn off web
  search.
- Experts in the web chat cannot read your app's code, change files, or save new memory. They say
  what they would check instead.
- Costs: an Opus expert with a PDF knowledge file (Ruth) costs more per question than a Sonnet
  expert; a team question makes several calls. Watch usage in the Claude Console.

## Updating the experts

The app reads the team at build time, so any change pushed to this repository's `main` branch
redeploys the site with it.

- **Add a document for an expert:** put it in `knowledge/<agent-name>/` (Markdown, text, CSV,
  JSON, or PDF under 20 MB) and push. Other file types are skipped with a warning in the build log.
- **Change an expert:** edit `.claude/agents/<agent-name>.md`. The `model:` line must be `opus`,
  `sonnet`, or `haiku`. Keep the "Your name is ... Voice: ... Working style: ..." lines; the
  sidebar reads them.
- **Bring over changes from Landman Interface:** ask Claude Code to "sync the experts from
  Landman-Interface into the experts repo", which copies `.claude/agents`, `.claude/skills`,
  `.claude/agent-memory`, `knowledge`, and the team docs.
- **Hide an agent from the app:** add its name to `exclude` in `web/site.config.json` (the
  separate `ruth` agent used by `sdk/` is excluded this way; Ruth is in the app as
  `texas-title-examiner`).

## Developing locally

```bash
cd web
npm install
npm run build   # reads the team, typechecks, and builds the site into web/dist
npm test        # tests the three functions against a local stand-in for the Claude API (no API calls)
```

To run the site with its functions on your computer, install the Netlify CLI and run
`netlify dev` from the repository root, with `ANTHROPIC_API_KEY` and `SITE_PASSWORD` set in your
shell.
