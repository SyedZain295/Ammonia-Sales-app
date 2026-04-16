# Ammonia Sales Platform

**Quick start:** See [How to Run the Application](#how-to-run-the-application) below (GitHub Codespaces or local Docker).

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
- **Database (`backend/db/sales.db`)**: **SQLite** file stored on the host under `backend/db/` via a Docker volume, so data survives container restarts until you delete the file or run `docker compose down` without relying on unnamed volumes for the DB path you mount.  
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

### Prerequisites

- **Docker** and **Docker Compose** (Docker Desktop includes Compose v2; use `docker compose`, not necessarily `docker-compose`).  
- A terminal open in the **repository root** — the directory that contains **`docker-compose.yml`** (if your clone has a nested folder, `cd` into that folder first).

### Configuration (`.env`)

Create a **`.env`** file next to `docker-compose.yml` to set the demo price per kilogram. The file is **not** committed (see `.gitignore`); each developer or Codespace creates their own.

**Linux / macOS / GitHub Codespaces (bash):**

```bash
printf "FIXED_PRICE_EUR=500\n" > .env
```

**Windows (PowerShell):**

```powershell
"FIXED_PRICE_EUR=500" | Out-File -FilePath .env -Encoding utf8
```

If you **skip** creating `.env`, Compose still starts: `FIXED_PRICE_EUR` falls back to **`500`** in `docker-compose.yml` (`${FIXED_PRICE_EUR:-500}`).

### GitHub Codespaces (recommended)

1. Open the repository in **GitHub Codespaces**.  
2. In the integrated terminal, go to the folder that contains `docker-compose.yml`:

   ```bash
   cd /workspaces/<your-repo-name>   # adjust if your layout uses a subfolder
   ls docker-compose.yml # should list the file
   ```

3. Create `.env` (optional but recommended for explicit pricing):

   ```bash
   printf "FIXED_PRICE_EUR=500\n" > .env
   ```

4. Build and start in the **background**:

   ```bash
   docker compose up --build -d
   ```

5. Open the **Ports** tab, find **8080**, and open the forwarded URL in the browser (or use “Open in Browser”).  
6. **Sanity checks** (optional, in the same Codespace):

   ```bash
   docker compose ps
   curl -s http://localhost:8080/api/health
   ```

   You should see JSON with `"status": "ok"` (or similar) from the health endpoint.

---

### Local machine (Docker Desktop)

1. Start **Docker Desktop** and wait until it is fully running.  
2. Open a terminal in the project root (folder with `docker-compose.yml`).  
3. Create `.env` as above (bash or PowerShell).  
4. Run:

   ```bash
   docker compose up --build -d
   ```

5. In the browser:

   - **App UI:** [http://localhost:8080](http://localhost:8080)  
   - **Health (via Nginx proxy):** [http://localhost:8080/api/health](http://localhost:8080/api/health)  
   - **Backend direct (if port 3000 is published):** [http://localhost:3000/api/health](http://localhost:3000/api/health)

6. View logs if something fails:

   ```bash
   docker compose logs --tail=80 frontend
   docker compose logs --tail=80 backend
   ```

---

### Testing the application (manual)

1. Open the app on port **8080**.  
2. Move the **slider** to choose a quantity (kg). The label should update (e.g. “Amount: X kg”).  
3. Click the main action button (**Record Sale** or **Purchase**, depending on your build).  
4. Confirm:

   - A **success** status message (e.g. “Sale recorded successfully”).  
   - **Total sales** increments.  
   - **Total revenue** matches `sum(price_eur)` for all rows (see pricing formula below).  
   - **Latest sale** and the **recent list** reflect the new transaction.

5. **API check** (optional):

   ```bash
   curl -s http://localhost:8080/api/sales | head -c 500
   ```

---

### Stopping the application

```bash
docker compose down
```

This stops and removes the Compose stack; your SQLite file under `backend/db/` remains on disk unless you delete it.

### Resetting all sales data

To start from an empty database:

```bash
docker compose down
rm -f backend/db/sales.db    # Linux / macOS / Codespaces
docker compose up --build -d
```

On Windows (PowerShell), remove `backend\db\sales.db` manually or use `Remove-Item` before bringing the stack up again.

---

### Troubleshooting

| Symptom | What to try |
|--------|-------------|
| `no configuration file provided` | Run `docker compose` from the directory that **contains** `docker-compose.yml` (`pwd` / `ls`). |
| Browser shows **502** on `/api/health` | Backend container not healthy; run `docker compose ps` and `docker compose logs backend`. |
| UI loads but slider does nothing | Hard-refresh the page (`Ctrl+Shift+R`); confirm `frontend/script.js` is loaded (browser devtools → Network). |
| Old UI after editing files | Rebuild: `docker compose up --build -d` (images cache static files from build time). |

---

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js, Express  
- **Database**: SQLite  
- **Containerization**: Docker, Docker Compose  
- **Dev environment**: GitHub Codespaces (optional)  

---

## Project Structure

```text
.
├── frontend/                 # Nginx + static UI (index.html, script.js, styles.css, nginx.conf)
│   └── Dockerfile
├── backend/                  # Express API + SQLite folder
│   ├── src/                  # app.js, server.js, db.js
│   ├── db/                   # sales.db created at runtime (gitignored)
│   ├── tests/                # optional API tests
│   └── Dockerfile
├── docker-compose.yml        # frontend + backend services
├── .devcontainer/            # optional Codespaces / Dev Container config
├── .env                      # local only — create yourself (see Configuration)
├── .gitignore
└── README.md
```

*(`.env` and `backend/db/*.db` are gitignored; create `.env` and the DB appears after the first sale.)*

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
{ "amount_kg": 200 }
```

**Success (201):**

```json
{
  "message": "Sale recorded",
  "amount_kg": 200,
  "price_eur": 100000
}
```

*(Example: `price_eur = amount_kg × FIXED_PRICE_EUR`. With `FIXED_PRICE_EUR=500`, `200 × 500 = 100000`.)*

**Validation error (400):** invalid or out-of-range `amount_kg` — response includes an `error` field (exact rules depend on backend version; check `backend/src/app.js`).

### List sales

`GET /api/sales`

Returns JSON such as:

```json
{
  "count": 3,
  "sales": [
    {
      "id": 3,
      "amount_kg": 200,
      "price_eur": 100000,
      "created_at": "2026-04-17 12:00:00"
    }
  ]
}
```

Sales are typically ordered **newest first** (see backend query). The UI uses this to show totals and the latest transactions.

### Optional: clear all sales (if implemented)

`DELETE /api/sales` may be available for demo resets; if not, delete `backend/db/sales.db` as described above.

### Backend tests (optional)

From the `backend` folder, with Node.js installed:

```bash
cd backend
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

# Ammonia Sales Platform

**Quick start:** See [How to Run the Application](#how-to-run-the-application) below (GitHub Codespaces or local Docker).

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
- **Database (`backend/db/sales.db`)**: **SQLite** file stored on the host under `backend/db/` via a Docker volume, so data survives container restarts until you delete the file or run `docker compose down` without relying on unnamed volumes for the DB path you mount.  
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

### Prerequisites

- **Docker** and **Docker Compose** (Docker Desktop includes Compose v2; use `docker compose`, not necessarily `docker-compose`).  
- A terminal open in the **repository root** — the directory that contains **`docker-compose.yml`** (if your clone has a nested folder, `cd` into that folder first).

### Configuration (`.env`)

Create a **`.env`** file next to `docker-compose.yml` to set the demo price per kilogram. The file is **not** committed (see `.gitignore`); each developer or Codespace creates their own.

**Linux / macOS / GitHub Codespaces (bash):**

```bash
printf "FIXED_PRICE_EUR=500\n" > .env
```

**Windows (PowerShell):**

```powershell
"FIXED_PRICE_EUR=500" | Out-File -FilePath .env -Encoding utf8
```

If you **skip** creating `.env`, Compose still starts: `FIXED_PRICE_EUR` falls back to **`500`** in `docker-compose.yml` (`${FIXED_PRICE_EUR:-500}`).

### GitHub Codespaces (recommended)

1. Open the repository in **GitHub Codespaces**.  
2. In the integrated terminal, go to the folder that contains `docker-compose.yml`:

   ```bash
   cd /workspaces/<your-repo-name>   # adjust if your layout uses a subfolder
   ls docker-compose.yml # should list the file
   ```

3. Create `.env` (optional but recommended for explicit pricing):

   ```bash
   printf "FIXED_PRICE_EUR=500\n" > .env
   ```

4. Build and start in the **background**:

   ```bash
   docker compose up --build -d
   ```

5. Open the **Ports** tab, find **8080**, and open the forwarded URL in the browser (or use “Open in Browser”).  
6. **Sanity checks** (optional, in the same Codespace):

   ```bash
   docker compose ps
   curl -s http://localhost:8080/api/health
   ```

   You should see JSON with `"status": "ok"` (or similar) from the health endpoint.

---

### Local machine (Docker Desktop)

1. Start **Docker Desktop** and wait until it is fully running.  
2. Open a terminal in the project root (folder with `docker-compose.yml`).  
3. Create `.env` as above (bash or PowerShell).  
4. Run:

   ```bash
   docker compose up --build -d
   ```

5. In the browser:

   - **App UI:** [http://localhost:8080](http://localhost:8080)  
   - **Health (via Nginx proxy):** [http://localhost:8080/api/health](http://localhost:8080/api/health)  
   - **Backend direct (if port 3000 is published):** [http://localhost:3000/api/health](http://localhost:3000/api/health)

6. View logs if something fails:

   ```bash
   docker compose logs --tail=80 frontend
   docker compose logs --tail=80 backend
   ```

---

### Testing the application (manual)

1. Open the app on port **8080**.  
2. Move the **slider** to choose a quantity (kg). The label should update (e.g. “Amount: X kg”).  
3. Click the main action button (**Record Sale** or **Purchase**, depending on your build).  
4. Confirm:

   - A **success** status message (e.g. “Sale recorded successfully”).  
   - **Total sales** increments.  
   - **Total revenue** matches `sum(price_eur)` for all rows (see pricing formula below).  
   - **Latest sale** and the **recent list** reflect the new transaction.

5. **API check** (optional):

   ```bash
   curl -s http://localhost:8080/api/sales | head -c 500
   ```

---

### Stopping the application

```bash
docker compose down
```

This stops and removes the Compose stack; your SQLite file under `backend/db/` remains on disk unless you delete it.

### Resetting all sales data

To start from an empty database:

```bash
docker compose down
rm -f backend/db/sales.db    # Linux / macOS / Codespaces
docker compose up --build -d
```

On Windows (PowerShell), remove `backend\db\sales.db` manually or use `Remove-Item` before bringing the stack up again.

---

### Troubleshooting

| Symptom | What to try |
|--------|-------------|
| `no configuration file provided` | Run `docker compose` from the directory that **contains** `docker-compose.yml` (`pwd` / `ls`). |
| Browser shows **502** on `/api/health` | Backend container not healthy; run `docker compose ps` and `docker compose logs backend`. |
| UI loads but slider does nothing | Hard-refresh the page (`Ctrl+Shift+R`); confirm `frontend/script.js` is loaded (browser devtools → Network). |
| Old UI after editing files | Rebuild: `docker compose up --build -d` (images cache static files from build time). |

---

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js, Express  
- **Database**: SQLite  
- **Containerization**: Docker, Docker Compose  
- **Dev environment**: GitHub Codespaces (optional)  

---

## Project Structure

```text
.
├── frontend/                 # Nginx + static UI (index.html, script.js, styles.css, nginx.conf)
│   └── Dockerfile
├── backend/                  # Express API + SQLite folder
│   ├── src/                  # app.js, server.js, db.js
│   ├── db/                   # sales.db created at runtime (gitignored)
│   ├── tests/                # optional API tests
│   └── Dockerfile
├── docker-compose.yml        # frontend + backend services
├── .devcontainer/            # optional Codespaces / Dev Container config
├── .env                      # local only — create yourself (see Configuration)
├── .gitignore
└── README.md
```

*(`.env` and `backend/db/*.db` are gitignored; create `.env` and the DB appears after the first sale.)*

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
{ "amount_kg": 200 }
```

**Success (201):**

```json
{
  "message": "Sale recorded",
  "amount_kg": 200,
  "price_eur": 100000
}
```

*(Example: `price_eur = amount_kg × FIXED_PRICE_EUR`. With `FIXED_PRICE_EUR=500`, `200 × 500 = 100000`.)*

**Validation error (400):** invalid or out-of-range `amount_kg` — response includes an `error` field (exact rules depend on backend version; check `backend/src/app.js`).

### List sales

`GET /api/sales`

Returns JSON such as:

```json
{
  "count": 3,
  "sales": [
    {
      "id": 3,
      "amount_kg": 200,
      "price_eur": 100000,
      "created_at": "2026-04-17 12:00:00"
    }
  ]
}
```

Sales are typically ordered **newest first** (see backend query). The UI uses this to show totals and the latest transactions.

### Optional: clear all sales (if implemented)

`DELETE /api/sales` may be available for demo resets; if not, delete `backend/db/sales.db` as described above.

### Backend tests (optional)

From the `backend` folder, with Node.js installed:

```bash
cd backend
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

#### Explanation of Optimization Dimensions

**Performance**  
The system uses a lightweight stack (Nginx + Node.js + SQLite), resulting in low latency and fast response times. The API performs simple operations with minimal overhead, ensuring efficient execution even in constrained environments.

**Development Time**  
The architecture is intentionally simple and modular, allowing rapid development and iteration. Using Docker and a minimal tech stack reduces setup complexity and enables quick deployment and testing cycles.

**Cost**  
The application requires minimal infrastructure resources. It runs using lightweight containers and does not depend on external paid services. SQLite eliminates the need for a managed database in the prototype stage.

**Accuracy**  
Input validation is implemented on the backend to ensure only valid transaction data is stored. Pricing is calculated deterministically using a fixed rule (`price = amount × 500`), avoiding inconsistencies.

**Usability**  
The user interface is designed for clarity and simplicity. A slider allows intuitive selection of the ammonia amount, and a single button executes the transaction. Immediate feedback ensures a smooth user experience.

**Security**  
The system avoids hardcoded secrets by using environment variables. Input validation prevents malformed requests, and the application exposes only minimal endpoints, reducing the attack surface.

**Scalability**  
The application is containerized and follows a clear separation between frontend, backend, and database layers. This structure allows easy migration to scalable cloud services (e.g., replacing SQLite with a managed database).

**Extensibility / Maintainability**  
The backend is organized into modular components (API routes, database logic, server setup), making it easy to extend functionality or modify behavior without impacting the entire system.

**Traceability**  
All changes are tracked via version control, and the system includes clear documentation, API definitions, and reproducible Docker-based environments. This ensures that development decisions and system behavior are transparent and verifiable.


