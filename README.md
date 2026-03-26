# IMPRO — AI Career Growth Companion


![IMPRO Demo](demo.gif)

> *Not an employee monitoring system. An AI companion that grows with you.*

IMPRO is a desktop AI companion that continuously analyses your work behaviour, identifies skill gaps, and guides your personal growth — privately, visually, and without your employer watching over your shoulder.

---

## How it works

```
User data  →  Behaviour analysis  →  TCS skill scoring  →  Gap report  →  Learning path
```

IMPRO evaluates every employee across three dimensions:

| Dimension | What it measures | How |
|-----------|-----------------|-----|
| **T** — Technical | Role-specific skills (e.g. Python, GDPR, CRM) | Behaviour data + ESCO taxonomy |
| **C** — Cognitive | How you think and reason | Scenario-based assessment (Bloom's Taxonomy) |
| **S** — Social | Communication, empathy, teamwork | Peer feedback + ESI framework |

Weights are role-specific — a developer's T score matters more than their S score; the opposite is true for sales.

---

## The companion 

Each role gets a companion animal that evolves as you grow (example):

| Role | Companion |
|------|-----------|
| Software Engineer | 🐙 Byte the Octopus |
| Product Lawyer | 🦉 Lex the Owl |
| Sales Manager | 🦊 Finn the Fox |
| HR Specialist | 🐕 Scout the Dog |

Earn XP by uploading work data, closing skill gaps, and completing learning. XP unlocks companion evolution and company-defined rewards.

---

## Setup

**Prerequisites:** Node.js v24.13.1+

```bash
git clone https://github.com/luuuuukez/IMPRO.git
cd IMPRO
npm install
```

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

Run:

```bash
npm start
```

---



