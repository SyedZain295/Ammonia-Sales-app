# Ammonia Sales Platform

**[How to run the application →](#how-to-run-the-application)**

---

---

## Project Overview

Ammonia Sales Platform is a minimal full-stack prototype for recording ammonia sale transactions through a one-button workflow.

The application demonstrates a complete end-to-end system: **frontend → backend → database**, fully containerized and cloud-deployable.

Users can select an amount of ammonia (in kg) using a slider and record a sale with a single button click. Each transaction is processed by the backend and stored in a SQLite database.

This repository fulfills the technical deliverable requirements:

- Fully functioning one-button app (one main action button; slider is for input only)
- Backend API with database integration
- Dockerized and cloud-deployable
- Runnable in GitHub Codespaces

---

## Architecture Overview

- **Frontend (`frontend`)**: static HTML/CSS/JS served by **Nginx** in its own container. The browser loads the UI from port **8080** (mapped to Nginx’s port 80 inside the container).  
- **Backend (`backend`)**: **Node.js + Express** REST API in a separate container, listening on port **3000** inside the Docker network.  
- **API routing**: Nginx proxies requests under **`/api/`** to the backend service (`http://backend:3000`). That way the frontend can call **`/api/sales`** and **`/api/health`** on the **same origin** as the page (port 8080), which avoids CORS issues and matches how the app runs in Codespaces behind forwarded URLs.  
- **Database (`ammonia-sales-app/backend/db/sales.db`)**: **SQLite** file stored on the host under `backend/db/` (relative to **`ammonia-sales-app/`**) via a Docker volume, so data survives container restarts until you delete the file or run `docker compose down` without relying on unnamed volumes for the DB path you mount.  
- **Container orchestration**: **Docker Compose** builds and starts both services with one command.

| Port (host) | Service | Purpose |
|-------------|----------------|---------|
| **8080**    | Frontend (Nginx) | Web UI; also proxies `/api/*` to the backend |
| **3000**    | Backend (Express)| Direct API access (optional; health/sales URLs work here too if you expose it) |

---

## System Flow

1. User opens the application  
2. User selects ammonia amount using the slider  
3. User clicks **Record Sale** (or **Purchase**, depending on build)  
4. Frontend sends `POST /api/sales` with `{ "amount_kg": <number> }`  
5. Backend validates input and calculates `price_eur`  
6. Sale is stored in SQLite  
7. UI updates with confirmation and latest data  

---

## How to Run the Application
### GitHub Codespaces

1. Open the repository on GitHub  
2. Click **Code → Codespaces → Create Codespace**  
3. In the terminal, run:

```bash
cp .env.example .env
docker compose up --build -d

**Local clone:** same — enter the app folder first:

```bash
cp .env.example .env

```

Open forwarded port 8080

***Local Docker***
```bash
git clone https://github.com/SyedZain295/AmmoniaOS
cd AmmoniaOS

cp .env.example .env
docker compose up --build -d
```

http://localhost:8080
http://localhost:8080/api/health



git clone https://github.com/SyedZain295/AmmoniaOS
cd AmmoniaOS

cp .env.example .env
docker compose up --build -d

**Local (Docker)**

```bash
git clone https://github.com/SyedZain295/AmmoniaOS
cd AmmoniaOS

cp .env.example .env
docker compose up --build -d
```





**Open:** app on port **8080** (Codespaces: **Ports** → 8080). Locally: [http://localhost:8080](http://localhost:8080) · health: [http://localhost:8080/api/health](http://localhost:8080/api/health)

**Try it:** move the slider → click **Record Sale** / **Purchase** → check that totals and latest sale update.

**Stop:** `docker compose down`

**Reset sales data:** from `ammonia-sales-app`, run `docker compose down`, delete `backend/db/sales.db`, then `docker compose up --build -d` again.

**If something fails:** confirm `pwd` shows `ammonia-sales-app` and `ls docker-compose.yml` works; then `docker compose ps` and `docker compose logs backend`. After UI changes, rebuild with `docker compose up --build -d`.

---

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js, Express  
- **Database**: SQLite  
- **Containerization**: Docker, Docker Compose  
- **Dev environment**: GitHub Codespaces (optional)  

---

## Project Structure

On GitHub, the repository root is **`Ammonia-Sales-app`**. The **containerized application** is under **`ammonia-sales-app/`**:

```text
Ammonia-Sales-app/                    # repository root
└── ammonia-sales-app/                # ← run all docker commands here
    ├── frontend/                     # Nginx + static UI
    │   └── Dockerfile
    ├── backend/
    │   ├── src/                      # app.js, server.js, db.js
    │   ├── db/                       # sales.db at runtime (gitignored)
    │   ├── tests/
    │   └── Dockerfile
    ├── docker-compose.yml
    ├── .devcontainer/                # optional
    ├── .env                          # local only (create yourself)
    ├── .gitignore
    └── README.md                     # app documentation (this file may live here or at repo root)
```

*(Paths like `backend/db/*.db` are relative to **`ammonia-sales-app/`**.)*

---

## API Endpoints

Base URL in the browser is the **frontend** origin (e.g. `http://localhost:8080`); paths below are relative to that (Nginx forwards `/api` to the backend).

### Health

`GET /api/health`

Returns service status (and may include uptime / metadata depending on build). Use this to verify the stack is up.

### Record sale

`POST /api/sales`  

**Headers:** `Content-Type: application/json`  

**Body:**

```json
{ "amount_kg": 10 }
```

**Success (201):**

```json
{
  "message": "Sale recorded",
  "amount_kg": 10,
  "price_eur": 7
}
```

*(Example: `price_eur = amount_kg × FIXED_PRICE_EUR`. With `FIXED_PRICE_EUR=0.7`, `10 × 0.7 = 7`.)*

**Validation error (400):** invalid or out-of-range `amount_kg` — response includes an `error` field (exact rules depend on backend version; check `ammonia-sales-app/backend/src/app.js`).

### List sales

`GET /api/sales`

Returns JSON such as:

```json
{
  "count": 3,
  "sales": [
    {
      "id": 3,
      "amount_kg": 10,
      "price_eur": 7,
      "created_at": "2026-04-17 12:00:00"
    }
  ]
}
```

Sales are typically ordered **newest first** (see backend query). The UI uses this to show totals and the latest transactions.

### Optional: clear all sales (if implemented)

`DELETE /api/sales` may be available for demo resets; if not, delete `ammonia-sales-app/backend/db/sales.db` (from repo root) or `backend/db/sales.db` when your working directory is `ammonia-sales-app/`.

### Backend tests (optional)

From **`ammonia-sales-app/backend`**, with Node.js installed:

```bash
cd ammonia-sales-app/backend
npm install
npm test
```

---

## Database Schema

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount_kg REAL NOT NULL,
  price_eur REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Pricing (demo):**

`price_eur = amount_kg × FIXED_PRICE_EUR` (set `FIXED_PRICE_EUR` in `.env`)

---

## Cloud Deployment Readiness

- Containerized services  
- Environment-based configuration  
- Health endpoint for probes  
- Replaceable database layer (SQLite → managed SQL for production scale)  

---

## Team Development Workflow with AI Agents

### Roles and Responsibilities

**Human team members**

- Define requirements and architecture  
- Ensure alignment with project goals  
- Review and approve all changes  
- Validate correctness and performance  

**AI agents**

- Generate code and structure  
- Assist with debugging  
- Improve documentation  
- Suggest optimizations  

### Asynchronous AI development

AI agents are used asynchronously for:

- Generating code  
- Improving documentation  
- Suggesting improvements  

All outputs are:

- Based on clear instructions  
- Reviewed by humans before merge or deployment  

### Team alignment

Maintained through:

- Clear requirements  
- Structured workflow  
- Code review  
- Shared architecture decisions  
- Version control  

### Optimization goals

| Dimension | Focus |
|-----------|--------|
| **Performance** | Fast, lightweight stack |
| **Development Time** | Simple architecture, rapid iteration |
| **Cost** | Minimal infrastructure |
| **Accuracy** | Validated inputs, deterministic pricing rules |
| **Usability** | Intuitive one-button workflow + clear feedback |
| **Security** | No hardcoded secrets; env-based config |
| **Scalability** | Container-ready; clear service boundaries |
| **Extensibility / Maintainability** | Modular structure |
| **Traceability** | Version control and documentation |

### Explanation of optimization dimensions

**Performance**  
The system uses a lightweight stack (Nginx + Node.js + SQLite), which keeps latency low and responses fast. The API performs simple operations with minimal overhead, so it runs efficiently even in constrained environments.

**Development time**  
The architecture is intentionally simple and modular, which supports rapid development and iteration. Docker and a small tech stack reduce setup friction and speed up deploy-and-test cycles.

**Cost**  
The application needs minimal infrastructure: lightweight containers and no mandatory paid services. SQLite avoids a managed database cost at the prototype stage.

**Accuracy**  
The backend validates input before persisting data. Pricing follows a deterministic rule: `price_eur = amount_kg × FIXED_PRICE_EUR` (configured in `.env`), which keeps calculations consistent.

**Usability**  
The UI stays clear: a slider selects quantity and one main button completes the sale. Status and summary areas give immediate feedback after each action.

**Security**  
Secrets and tunables are not hardcoded in source; use `.env` and Compose for configuration. Validation reduces malformed requests, and only a small API surface is exposed.

**Scalability**  
Services are containerized with a clean split between frontend, backend, and data. You can move to managed databases and horizontal scaling later without redesigning the whole app.

**Extensibility / maintainability**  
Backend code is split into routes, database access, and server startup, so new endpoints or rules can be added without touching unrelated parts of the codebase.

**Traceability**  
Changes live in version control; this README documents how to run, test, and reset the system so behavior and setup stay transparent for reviewers and teammates.

---

## Course / evaluation context

This project supports **TECH Deliverable 1 & 2** (one-button app + agentic organization). Evaluation criteria and development checklist: [Innovation and Complexity Management – development checklist](https://dominikboehler.de/inco_new/#development-checklist--evaluation-criteria).

*Innovation and Complexity Management — Course on web application development in a health context at Deggendorf Institute of Technology.*
