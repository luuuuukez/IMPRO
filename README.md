# IMPRO

An AI-powered career growth companion that lives on your desktop.

## Prerequisites

- Node.js v24.13.1 or higher
- An Anthropic API key ([get one here](https://console.anthropic.com/))

## Setup

1. Clone the repo
```bash
   git clone https://github.com/luuuuukez/IMPRO.git
   cd IMPRO
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the root directory
```bash
   touch .env
```
   Add your API key:
```
   ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the app
```bash
   npm start
```

## What it does

IMPRO is a desktop AI companion that helps you understand 
your skill gaps and plan your career growth.

- Floating orb that lives on your desktop
- Chat interface for skill conversations
- File drop to analyse your skill profile
- Proactive nudges based on your growth trajectory

## Tech Stack

- Electron + React
- Claude API (Anthropic)