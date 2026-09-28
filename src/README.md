# src/ layout

This project is an **AI assistant that runs inside IBM Bob**, so there is no separate backend or web app. The assistant is defined by plain-text configuration:

| Path | What it is |
|---|---|
| `../.bob/skills/evidence-triage/SKILL.md` | The assistant's logic: categories, scoring rubric, crime-type weights, urgent and hidden-value rules, and the exact output format. Bob loads this from the project. |
| `sample-inputs/` | Mock crime scene cases used to test and demonstrate the assistant. All data is invented. |
| `.env.example` | Environment variables. None are required. |

Bob requires the skill to sit under `.bob/skills/` at the repository root, which is why it is not inside `src/`.

To run the assistant, see `../docs/setup-guide.md`.