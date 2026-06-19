# EmailGenie — AI Email Generation Assistant

EmailGenie generates professional emails using AI, compares two prompting strategies side-by-side, and evaluates output quality using three custom metrics.

## Features

- Generate emails from four inputs: Intent, Key Facts, Tone, and Business Name
- Compares two models simultaneously:
  - **Model A** — `llama-3.3-70b-versatile` using advanced Role-Playing + Few-Shot prompting
  - **Model B** — `openai/gpt-oss-120b` using basic single-instruction prompting
- Evaluates both outputs using 3 custom metrics: Fact Recall, Tone Accuracy, Professional Quality
- Saves full generation history with search and starring
- Exports evaluation data to CSV
- Generates shareable public links for any comparison result
- Visual performance report with charts and auto-written analysis

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts
- **Backend:** Node.js, Express
- **AI Provider:** Groq API (free tier)

## Setup Instructions

1. Clone the repository

## About This Project
Built by Nafij Jakir as a technical assessment project for [Company Name].
© 2026 Nafij Jakir. All rights reserved.
This code is shared publicly for portfolio and evaluation purposes only.
