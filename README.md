# 🚀 [Your Project Title Here]

> ⚠️ **Replace everything in `[ ]` brackets with your actual content before submission.**

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | CodeX |
| **Track** | AI |
| **Team Lead** | Harsh Sharma — in.harshsharma@gmail.com |
| **Members** | Ankit Kumar, Kartikeya Arya, Auyash Dasmohapatra |

---

## 🎯 Problem Statement

> In 2–3 sentences: What problem does your project solve? Who experiences this problem?

Field investigating officers and forensic technicians routinely struggle to prioritize dozens of recovered crime scene items under intense time pressure and without instant forensic expertise, causing crippling lab backlogs and the loss of perishable evidence. Our project solves this by converting raw field observations into an automated, risk-adjusted Forensic Science Laboratory (FSL) submission schedule grounded in real degradation science. This ensures volatile evidence—such as rapidly degrading biological DNA, weather-threatened impression marks, and remotely wipeable digital devices—is flagged, correctly packaged, and tested before it spoils.

---

## 💡 Solution

> In 2–3 sentences: What did you build? How does it solve the problem above?

We built FSL Forensic Triage, a real-time, interactive decision-support application powered by IBM Bob that turns unstructured field notes into a prioritized laboratory dispatch schedule. Investigating officers simply describe raw observations—or push dynamic scene updates—and the system parses and cross-references each exhibit against an authoritative 76-parameter forensic matrix. It instantly ranks evidence by degradation risk, flags urgent items (such as remote-wipeable smartphones and bloody weapons) with immediate action triggers, and generates exhibit-specific packaging advisories to preserve chain of custody.

---

## ✨ Key Features

- **Feature 1:** Interactive Natural Language Scene Logging & Dynamic Updates

Allows field investigators to enter free-form narrative observations or push incremental discovery updates (e.g., secondary sweeps yielding touch DNA or weapons), automatically extracting and contextualizing exhibits in real time.
- **Feature 2:** Domain-Grounded Forensic Matrix Mapping (EVID-001 to EVID-076)

Eliminates black-box hallucination by deterministically binding extracted items to a 76-parameter forensic taxonomy with verified probative values, testing requirements, and degradation timelines.
- **Feature 3:** Dynamic Contextual Risk Escalation Engine

Intelligently recalibrates base priority scores to flag urgent degradation hazards—such as escalating live smartphones to Priority 10 due to remote-wipe risks or bloody weapons to Priority 9 for immediate DNA preservation.
- **Feature 4:** Automated FSL Submission Scheduling & Lab Routing

Categorizes items into clear dispatch timelines (IMMEDIATE, SAME SHIFT, NORMAL QUEUE) and links them directly to specialized forensic units (e.g., NIBIN ballistics entry, mobile forensic extraction, DNA STR profiling).
- **Feature 5:** [Optional]

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | JavaScript,CSS |
| **Frameworks** | [e.g., FastAPI, React] |
| **IBM Technologies** | IBM Bob |
| **Databases** | [e.g., PostgreSQL, Redis] |
| **Other** | [e.g., Docker, GitHub Actions] |

---

## 📁 Repository Structure

```
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> **Copy these exact steps from your [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/[your-repo].git
cd [your-repo]

# 2. Install dependencies
[your install command here]

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run the project
[your run command here]
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

> Be honest — judges appreciate transparency over overclaiming.

- [Limitation 1: e.g., "Authentication is mocked — not production-ready"]
- [Limitation 2: e.g., "Only tested on Chrome"]
- [Limitation 3: e.g., "Feature X is scaffolded but not fully implemented"]

---

## 🏅 What We're Most Proud Of

[Tell the judges what part of your submission is strongest and worth paying close attention to.]

---
