# How to Talk to Your Experts

A quick guide to getting answers from the Landman Command expert team in Claude Code. The
full list of experts is in `docs/expert-roster.md`; how the team works is in
`docs/AGENT_TEAM.md`.

You can always just describe what you want in plain words. The main session decides whether
to answer itself, ask one expert, or bring in the orchestrator. The patterns below let you
steer that choice when you want to.

Every example here is a question or a proposal request. Nothing in the app changes unless
you later approve building something.

## Ask the whole team

Start your message with `/ask-team`. The orchestrator reads your question, picks the experts
it needs (usually one to four), has them work on it, and gives you one combined answer.

```
/ask-team What should I know before we add Jones County parcels for the Stamford project?
```

You can also say it in plain words:

```
Have the orchestrator bring in whoever is needed and give me one answer: what should I know before we add Jones County parcels?
```

## Ask one specific expert

Name the expert in your message:

```
Have the texas-title-examiner explain what I need to prove ownership when the owner on the county record died five years ago.
```

Or type `@`, pick the expert from the list (for example `texas-title-examiner (agent)`), and
then type your question:

```
@"appraisal-district-analyst (agent)" Why does one tract in Haskell County show eleven owners?
```

Use this when you already know whose area the question is in. It is faster and cheaper
than asking the whole team.

## Example questions that bring several experts together

Each of these crosses several areas, so the orchestrator will bring in a group of experts
and combine their findings. The experts listed are the ones it is likely to choose; it may
pick differently.

### 1. Infrastructure near a project

```
/ask-team Which transmission lines, substations, and pipelines are near the Stamford project boundary, which public sources could show them on the map, and how accurate and current would that information be? Proposal only, don't build anything yet.
```

Likely experts: `transmission-infrastructure-analyst`, `pipeline-rrc-analyst`,
`gis-engineer`, `licensing-compliance-analyst`.

### 2. Tracking lease options and deadlines

```
/ask-team I want to track solar lease options for each landowner: payments, option deadlines, and who still needs to sign. How should this work in the app, from the screen I use in the truck to how the data is stored?
```

Likely experts: `land-agreements-analyst`, `landman-workflow-advisor`, `ux-designer`,
`database-engineer`.

### 3. Ownership research on a parcel

```
/ask-team For a parcel in the Haskell East Site, how do I get from the county appraisal owner to the actual record owner, and what should the parcel page show while that research is in progress?
```

Likely experts: `texas-title-examiner`, `appraisal-district-analyst`,
`public-records-researcher`, `frontend-ux-engineer`.

### 4. Sharing the app safely

```
/ask-team I want a coworker to use Landman Command from their laptop. What are the risks to my landowner data, what would have to change in the app, and what is the simplest safe way to do it?
```

Likely experts: `security-architect`, `devops-release-engineer`,
`backend-platform-engineer`.

## Tips

- **Add "proposal only, don't build anything yet"** when you want a plan you can review
  before anything changes.
- **Say who the answer is for** ("explain it so I can share it with my supervisor") to get
  the right level of detail.
- **Ask a follow-up in plain words** after a team answer, for example "go deeper on the
  pipeline part". The main session sends it to the right expert.
- **Fix the team itself with `/improve-team`**, for example
  `/improve-team The title examiner should always list the county clerk records to request.`
- **Cost:** a team question uses more of your usage than a normal message. One test with two
  experts cost about $0.73. Ask one expert directly when you know whose area it is.
- **See all experts:** type `/agents` in the terminal, or open `docs/expert-roster.md`.
