# TheroPy AI

A modern AI-powered wellness companion built to make emotional support feel approachable, private, and easy to use.

TheroPy AI combines a polished Next.js frontend with a FastAPI backend to deliver supportive conversations, emotion-aware responses, mindfulness exercises, local chat history, and simple dataset upload workflows.

> **Important:** TheroPy AI is for supportive conversations and self-reflection. It is **not** a replacement for licensed mental health care or emergency services.

## Why TheroPy AI?

- **Beginner-friendly experience** with a clean chat interface and guided welcome prompts
- **Emotion-aware conversations** that detect tone and tailor supportive responses
- **Crisis-aware safeguards** that surface emergency resources for high-risk language
- **Mindfulness toolkit** with breathing exercises, grounding prompts, reminders, and soundscapes
- **Conversation memory** backed by SQLite for local persistence
- **Provider-ready setup** for connecting your own AI keys from the settings panel
- **Dataset upload support** for attaching CSV or JSON-based context to chats
- **Theme support** with light and dark modes

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Framer Motion
- Lucide React

### Backend
- FastAPI
- SQLite + aiosqlite
- HTTPX
- Pydantic

## Core Features

### 1. Supportive AI chat
Create conversations, send messages, regenerate responses, and keep a local history of your sessions.

### 2. Emotion detection
The app detects emotional cues such as anxiety, stress, sadness, anger, happiness, and neutral tone to shape responses.

### 3. Crisis support banner
If a message includes crisis-related language, the interface displays immediate crisis contact guidance.

### 4. Mindfulness Sanctuary
Users can open a dedicated mindfulness panel with guided exercises, timed practices, break reminders, and calming soundscapes.

### 5. Provider settings
Users can configure provider credentials locally through the UI and switch between available provider options.

### 6. Dataset integration
Users can upload CSV, JSON, or JSONL files and attach dataset context to a conversation.

## Getting Started

### Prerequisites
Make sure you have the following installed:

- Node.js 20+
- npm 10+
- Python 3.10+
- pip

### 1. Clone and enter the project
```bash
git clone https://github.com/Euphoriticjenni/theropy-ai.git
cd theropy-ai
```

### 2. Install frontend dependencies
```bash
npm ci
```

### 3. Install backend dependencies
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Start the backend
From the project root:
```bash
npm run backend
```

The API will be available at `http://localhost:8000`.

### 5. Start the frontend
In a second terminal:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## How to Use

1. Launch the backend and frontend.
2. Open the app in your browser.
3. Start a new conversation from the sidebar.
4. Type a message or choose a suggested prompt from the welcome screen.
5. Open **Settings** to configure your preferred AI provider.
6. Use **Mindfulness Sanctuary** for guided exercises.
7. Use **Dataset** to upload files and attach them to your active chat.

## Available Scripts

From `/home/runner/work/theropy-ai/theropy-ai`:

```bash
npm run dev      # Start the Next.js frontend
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run backend  # Start the FastAPI backend with Python
```

## API Overview

The backend exposes a small set of local API endpoints:

- `GET /api/health` — health check
- `GET /api/chats` — list conversations
- `POST /api/chats` — create a conversation
- `GET /api/chats/{chat_id}` — fetch a conversation and messages
- `DELETE /api/chats/{chat_id}` — delete a conversation
- `POST /api/chats/{chat_id}/messages` — send a message
- `POST /api/emotions/analyze` — analyze emotional tone
- `GET /api/memory` — list saved memory entries
- `POST /api/memory` — save a memory entry
- `POST /api/datasets/upload` — upload a dataset
- `GET /api/datasets` — list uploaded datasets

## Project Structure

```text
theropy-ai/
├── backend/            # FastAPI app, SQLite DB, uploaded datasets
├── public/             # Static assets
├── src/app/            # Next.js app entry, layout, global styles
├── src/components/     # Chat UI, settings, datasets, mindfulness tools
├── package.json        # Frontend scripts and dependencies
└── README.md           # Project documentation
```

## Privacy and Safety Notes

- API keys are stored locally in the browser through the settings panel.
- Chat history and uploaded dataset metadata are stored locally by the backend.
- The app includes crisis messaging, but it should not be relied on as an emergency response system.
- This project is best used as a supportive wellness tool, not as medical advice.

## Validation

The following project commands were verified in this repository:

```bash
npm run lint
npm run build
```

## Contributing

Contributions are welcome. If you plan to improve the UI, backend capabilities, or safety experience, please open an issue or pull request with a clear description of the change.

## License

No license file is currently included in this repository. Add one before distributing the project for broader use.
