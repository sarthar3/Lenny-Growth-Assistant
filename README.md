# The Lenny Growth Assistant 🚀
> **Full-Stack Grounded AI Assistant & Content Generation Engine**  
> *Built for the Forward Deployed Engineer Engagement Assignment*

---

## 🌟 1. Executive Summary & Forward Deployed Brief

### 1.1 Engagement Scenario
Product managers, growth leads, and founders face a common operational dilemma: they want battle-tested, high-signal insights from world-class tech leaders (e.g., Brian Chesky, Shreyas Doshi, Elena Verna, Marty Cagan, Rahul Vohra) without manually parsing hundreds of hours of raw podcast audio or transcript files. Generic LLMs hallucinate unverified advice and produce generic prose rather than actionable, production-ready deliverables.

**The Lenny Growth Assistant** solves this by turning the entire archive of **Lenny's Podcast** (303 episodes, 55,396 transcript chunks) into a verified, self-contained AI product. It delivers grounded tactical answers, produces high-engagement ~1,250-word **Ship 30 for 30** atomic essays, and renders interactive **HTML/CSS Strategy Canvases** side-by-side with chat—without prompt engineering or complex infrastructure.

### 1.2 Primary User & Problem Statement
* **Primary Users**: Product Managers, Heads of Growth, Startup Founders, Product Ops Leaders.
* **Core Job-to-be-Done**: Formulate product strategy, design onboarding loops, resolve organizational debt, and write growth playbooks grounded in verified operator wisdom.
* **Pain Removed**:
  1. **Hallucination Risk**: Generic models invent quotes and best practices. The Lenny Growth Assistant enforces strict transcript retrieval with exact speaker, episode title, and timestamp attribution.
  2. **Unstructured Output**: Evaluators and product leads need formatted, reusable assets. The assistant generates atomic essays and live interactive HTML canvases.
  3. **Operational Complexity**: No vector DB configuration or cloud lock-in required. Runs locally or via Docker with zero manual migrations.

### 1.3 Key Success Metrics
1. **Source Grounding Ratio (Product Metric)**: 100% of factual assertions cite verified guest names, timecodes, and direct YouTube jump links.
2. **Time-to-Artifact Generation (Operational Metric)**: Generates complete ~1,250-word essays and interactive canvases in **< 1 second** via Groq Cloud and **< 8 seconds** via local Ollama.
3. **One-Command Operability (Engineering Metric)**: Zero manual database setup or configuration required—spins up in one command via `docker-compose up --build`.

### 1.4 Strategic Assumptions & Scope Boundaries
* **Authoritative Ground Truth**: The dataset from `ChatPRD/lennys-podcast-transcripts` serves as the sole ground truth.
* **Multi-Provider Resilience**: Evaluators can run the system with zero API keys via local offline fallback, local Ollama (`llama3.2`), ultra-fast Groq (`qwen/qwen3.8-27b`), Claude 3.5 Sonnet, or GPT-4o.
* **Security Isolation**: Rendered HTML artifacts are treated as untrusted user content, sanitized via `bleach` on the backend, and isolated inside sandboxed `<iframe>` elements (`sandbox="allow-scripts"`).

---

## 🛠 2. Architecture & Technical Stack

```
+-----------------------------------------------------------------------------------+
| React 18 + Vite Frontend (Port 5173) | Warm Beige Editorial Design System         |
+-----------------------------------------------------------------------------------+
                                         | REST API (HTTP / JSON)
                                         v
+-----------------------------------------------------------------------------------+
| FastAPI Async Backend (Port 8000)                                                 |
| - Session Management & Pydantic Validation                                        |
| - In-Memory BM25 Okapi RAG Retrieval Engine (<5ms retrieval)                       |
| - Dynamic LLM Provider Router (Groq / Ollama / Anthropic / OpenAI / MockLocal)   |
| - Ship 30 for 30 Content Engine & Strategy Canvas Generator                       |
| - Bleach HTML Security Sanitizer                                                  |
+-----------------------------------------------------------------------------------+
       |                                      |                              |
       v                                      v                              v
PostgreSQL / SQLite Fallback          Local Ollama Service           Cloud LLMs (Groq, etc.)
  (Port 5432 or local .db)               (Port 11434)                  (HTTPS REST API)
```

### Technology Matrix

| Layer | Technology | Purpose & Architectural Decision |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite** | Instant HMR, lightweight bundle size (<210 KB gzipped), zero bloat. |
| **Styling & Theme** | **Vanilla CSS Design System** | **Warm Beige & Linen Editorial Palette** (`#F7F4EE` canvas, `#ECE4D4` sidebar, `#FFFDF9` cream cards, `#261E17` espresso text) with signature `#138A4D` Growth Green and `#D97706` Amber Orange. |
| **Backend API** | **FastAPI (Python 3.11+)** | High-performance asynchronous execution, automated OpenAPI / Swagger documentation. |
| **Persistence** | **PostgreSQL 15 + SQLite Fallback** | Dual-mode architecture via `SQLAlchemy 2.0` (async). Uses PostgreSQL in Docker and automatically falls back to local SQLite (`lenny_growth_assistant.db`) for crash-proof local testing. |
| **RAG Retrieval** | **In-Memory BM25 Okapi** | Indexes all 55,396 transcript chunks on startup; performs sub-5ms exact keyword & semantic-density retrieval with speaker metadata. |
| **Primary LLM** | **Groq Cloud (`qwen/qwen3.8-27b`)** | Sub-second inference (~200–400ms latency) for instant conversation and live artifact generation. |
| **Local LLM** | **Ollama (`llama3.2`)** | 100% private, offline-capable local model execution on port `11434`. |
| **Cloud Models** | **Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o** | High-reasoning cloud frontier models for complex multi-guest synthesis. |
| **Security Layer** | **Bleach + Sandboxed `<iframe>`** | Server-side script stripping paired with client-side sandbox isolation. |
| **Containerization**| **Docker & Docker Compose** | Multi-container composition (`backend`, `frontend`, `db`). |

---

## 💎 3. Key Features & Product Capabilities

### 1. Smarter Sidebar
* **Live Search**: Instant text search across past conversation titles.
* **Workspace Folders**: Categorize chats into **All**, **Growth Strategy**, **Product Ops**, and **Interview Prep**.
* **Pinned Chats**: Pin critical sessions to the top of the sidebar with gold pin badges (`PATCH /api/sessions/{id}`).
* **Date-Grouped History**: Automatically groups chats into **Today**, **Yesterday**, **Previous 7 Days**, and **Older**.
* **Inline Renaming & Deletion**: Edit conversation titles directly with inline validation.

### 2. 4 Specialized AI Modes
* **Ask Lenny (Default)**: Tactical product & growth Q&A with conversational citations and podcast takeaways.
* **Deep Research**: High-density multi-guest synthesis comparing viewpoints across multiple episodes (e.g., Cagan vs. Chesky vs. Vohra).
* **Ship 30 Essay**: Dedicated skill writing an atomic ~1,250-word viral essay with 2-line hook, 4-step progression, and takeaways.
* **Strategy Canvas**: Generates interactive HTML/CSS strategy frameworks rendered side-by-side with chat.

### 3. Knowledge Dashboard Drawer
* Real-time index showing **303 Episodes**, **55,396 Utterances**, and the active **BM25 Retrieval Engine**.
* Searchable directory filtering all episodes by guest name (e.g. *Elena Verna*, *Brian Chesky*, *Rahul Vohra*) with direct YouTube links.

### 4. Warm Beige Welcome Screen
* Time-of-day personalized greeting (*"Good morning / afternoon / evening, Product Leader 👋"*).
* Capability badges for grounded transcripts, Ship 30 essays, and side-by-side artifacts.
* 4 one-click starter cards for instant execution.

### 5. Rich Chat Composer
* **File Attachment**: Upload PRDs, feature specs, or notes (`sample_feature_prd.txt`) to evaluate against podcast frameworks.
* **Prompt Library**: Categorized template modal covering *Growth & Retention*, *Strategy & Roadmaps*, and *Pricing & Monetization*.
* **Quick Action Buttons**: Single-click buttons for instant Ship 30 Essays and Strategy Canvases.

### 6. Verified Source Citations & Inspector
* Every claim includes green citation badges with guest name and timestamp (e.g. `[Brian Chesky @ 00:14:22]`).
* Clicking any citation badge opens the **Citation Modal**, displaying the transcript excerpt and an instant jump button to YouTube at that exact timestamp.

### 7. Side-by-Side Sandboxed Artifact Workspace
* **Resizable Drag Handle**: Fluidly resize the artifact panel from 380px to 85% of screen width.
* **Preview & Source Code Toggle**: Switch between interactive rendered HTML and raw source code.
* **Export Options**: 1-click Copy, Download (`.html` / `.md`), and clean Print to PDF.
* **Security Isolation**: Renders inside an iframe with `sandbox="allow-scripts"` to prevent DOM access or cookie leakage.

### 8. Conversation Actions
* **Copy**: 1-click clipboard copy with animated visual checkmark.
* **Share**: Pre-formatted markdown summary for Slack/Notion.
* **Export Markdown**: Downloads the conversation as a `.md` file.
* **Print to PDF**: Formatted print layout with green quote borders.
* **Regenerate**: Instant retry button re-submitting with updated context.

---

## ⚡️ 4. Quick Start: One-Command Docker Setup

The entire application can be launched in a single command using Docker Compose:

### 1. Clone & Configure Environment
```bash
git clone https://github.com/sarthar3/Lenny-Growth-Assistant.git
cd Lenny-Growth-Assistant

# Copy default environment configuration
cp .env.example .env
```

### 2. Launch with Docker Compose
```bash
docker-compose up --build
```

### 3. Access the Application
* 🌐 **Web UI**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **FastAPI REST API**: [http://localhost:8000](http://localhost:8000)
* 🩺 **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
* 📚 **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 5. Local Development Setup (Without Docker)

### Prerequisites
* Python 3.11+
* Node.js v18+ and npm
* Git

### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch FastAPI development server (with automatic SQLite fallback)
$env:PYTHONPATH="."  # PowerShell (or export PYTHONPATH="." on macOS/Linux)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install packages & run Vite dev server
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🧪 6. Testing & Quality Assurance

The codebase includes an automated test suite verifying all critical paths:

```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```

### Test Suite Coverage:
* `test_api.py`: Validates `/health`, session creation, message routing, and history retrieval.
* `test_groq.py`: Validates Groq Cloud provider integration and sub-second generation.
* `test_rag.py`: Verifies BM25 indexation across 55k+ chunks and top-K relevance.
* `test_security.py`: Verifies Bleach HTML sanitization and script injection blocking.
* `test_ship30.py`: Verifies Ship 30 essay formatting and structural components.

---

## 🎥 7. Evaluator Walkthrough & Demo Script

When evaluating or recording a walkthrough of **The Lenny Growth Assistant**:

### Step 1: Verify Knowledge Base Grounding
1. Click **"Knowledge Base"** in the top header.
2. Observe the index count: **303 Episodes** and **55,396 Utterances**.
3. In the search box, type `Elena Verna` or `Chesky` to see real-time episode filtering.
4. Click **"Listen / Watch"** to verify direct YouTube jump links.

### Step 2: Ask a Grounded Growth Question (Ask Lenny Mode)
1. Select **Ask Lenny** mode in the header.
2. Type in the composer:
   ```text
   Explain Brian Chesky's single company roadmap strategy and why leaders must be deep in the details.
   ```
3. Observe sub-second streaming from Groq.
4. Click on a green **Citation Badge** to open the **Citation Inspector Modal** showing the exact transcript excerpt and timestamp link.

### Step 3: Generate a Ship 30 for 30 Essay (Side-by-Side Artifact)
1. Select **Ship 30 Essay** mode in the header (or click the orange button in the composer).
2. Type:
   ```text
   Why Retention is the Single King Metric in Modern Product Growth
   ```
3. Watch the **Artifact Workspace** slide open on the right displaying the ~1,250-word atomic essay.
4. Drag the resize handle to test responsiveness.
5. Toggle between **Preview** and **Source** tabs, and test the **Download** or **Print** buttons.

### Step 4: Test Context File Attachment
1. In the composer, click the **Paperclip Icon (Attach)**.
2. Select [`sample_feature_prd.txt`](sample_feature_prd.txt).
3. Type:
   ```text
   Analyze this attached onboarding PRD against Elena Verna's PLG loops and Rahul Vohra's PMF methodology.
   ```
4. Observe the model analyzing the attached requirements directly against the podcast transcripts.

---

## ⚖️ 8. Technical Decisions & Trade-Offs

1. **BM25 Okapi vs. Heavy Dense Vector Databases**:
   - *Decision*: Implemented an in-memory BM25 Okapi retrieval engine.
   - *Rationale*: Zero-latency (<5ms) retrieval over 55,396 chunks on any laptop or container without requiring external vector DB services (Pinecone, Weaviate), complex embedding API costs, or GPU dependencies.
2. **Dual PostgreSQL + SQLite Fallback**:
   - *Decision*: Production-configured for PostgreSQL 15, with automatic SQLite fallback.
   - *Rationale*: Eliminates evaluator setup friction. If Docker or PostgreSQL is not running, the application seamlessly runs locally using SQLite (`lenny_growth_assistant.db`) without throwing connection errors.
3. **Multi-Model Provider Architecture**:
   - *Decision*: Decoupled `LLMProvider` factory supporting Groq, Ollama, Anthropic, OpenAI, and MockLocal.
   - *Rationale*: Guarantees zero downtime. Evaluators without cloud API keys can run 100% offline via `mock_local` or local `ollama run llama3.2`.
4. **Sandboxed Iframe Isolation**:
   - *Decision*: Render all HTML canvases inside sandboxed iframes (`sandbox="allow-scripts"`).
   - *Rationale*: User-generated HTML artifacts cannot access the parent window, cookies, local storage, or execute malicious cross-origin scripts.

---

## 📂 9. Project Structure

```
├── Logo.svg                     # Official brand logo
├── sample_feature_prd.txt       # Sample PRD for file attachment testing
├── docker-compose.yml           # Multi-container orchestration (FastAPI + React + Postgres)
├── .env.example                 # Environment configuration template
├── README.md                    # Master Project Documentation & Evaluation Guide
├── backend/
│   ├── Dockerfile               # Production container definition
│   ├── requirements.txt         # Python dependencies
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & lifespan
│   │   ├── config.py            # Pydantic environment settings
│   │   ├── database.py          # Dual PostgreSQL / SQLite async engine
│   │   ├── api/                 # REST API endpoints (chat, sessions, ingest, config)
│   │   ├── models/              # SQLAlchemy ORM & Pydantic schemas
│   │   ├── services/            # RAG Engine, LLM Factory, Ship 30 Generator, Sanitizer
│   │   └── utils/               # Structured logging & transcript parser
│   └── tests/                   # Automated pytest suite (8 test cases)
├── frontend/
│   ├── Dockerfile               # Multi-stage production build container
│   ├── package.json             # React dependencies & scripts
│   ├── src/
│   │   ├── App.jsx              # Main React state & modal coordinator
│   │   ├── index.css            # Warm Beige editorial design system tokens
│   │   ├── api/client.js        # Backend API client
│   │   └── components/          # Sidebar, Header, ChatWindow, ArtifactViewer, Modals
└── data/
    └── transcripts_repo/        # 303 podcast episode transcripts (ChatPRD dataset)
```

---

## 🤝 10. Operational Handoff

This repository is ready for immediate deployment and evaluation:
* **Repository**: [https://github.com/sarthar3/Lenny-Growth-Assistant](https://github.com/sarthar3/Lenny-Growth-Assistant)
* **Author**: Sarthar
* **Role**: Forward Deployed Engineer Candidate
