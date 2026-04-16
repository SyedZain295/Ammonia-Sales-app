# ammonia-sales-app

**Quick start:** See [How to Run the Application](#how-to-run-the-application) below (Codespaces or local Docker).

## Project overview
`ammonia-sales-app` is a minimal full-stack demo that records ammonia sales with one click.  
The frontend provides one main action: **Sell 1 kg of Ammonia**.  
When clicked, it calls the backend API, which stores a sale in SQLite and returns confirmation.

## Architecture overview
- **Frontend** (`frontend`): static HTML/CSS/JS served by Nginx
- **Backend** (`backend`): Node.js + Express REST API
- **Database** (`backend/db/sales.db`): SQLite file persisted on disk
- **Container orchestration**: Docker Compose for one-command startup

Flow:
1. User opens frontend page.
2. User clicks `Sell 1 kg of Ammonia`.
3. Frontend sends `POST /api/sales` to backend.
4. Backend validates payload and inserts a row in SQLite.
5. Frontend displays `Sale recorded`, refreshes summary cards, and updates latest sales list.

## How to Run the Application

### GitHub Codespaces (Recommended)

1. Open this repository in GitHub Codespaces  
2. Run in terminal:

```bash
cp .env.example .env
docker compose up --build -d
```

3. Open forwarded port **8080** in the browser  

---

### Local (Docker)

1. Ensure Docker is installed and running  
2. Run:

```bash
cp .env.example .env
docker compose up --build -d
```

3. Open:

- http://localhost:8080  
- http://localhost:8080/api/health  

---

### Testing the Application

1. Open the app  
2. Select an amount using the slider  
3. Click **Record Sale**  
4. Verify:

   - success message appears  
   - totals update  
   - latest transaction updates  

---

### Stopping the Application

```bash
docker compose down
```

## Tech stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express, CORS
- Database: SQLite (`sqlite3` driver)
- Testing: Node built-in test runner (`node:test`)
- Containerization: Docker, Docker Compose
- Codespaces support: `.devcontainer/devcontainer.json`

## Project structure
```text
.
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── db/
│   ├── src/
│   │   ├── app.js
│   │   ├── db.js
│   │   └── server.js
│   └── tests/
│       └── sales.test.js
├── .devcontainer/
│   └── devcontainer.json
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## How to run the app
### Local (Docker Desktop)
1. Ensure Docker Desktop is installed and running.
2. Copy env template:
   - PowerShell: `Copy-Item .env.example .env`
3. Start the app:
   - `docker compose up --build -d`
4. Open:
   - App UI: `http://localhost:8080`
   - Health check: `http://localhost:8080/api/health`
5. Stop when done:
   - `docker compose down`

### Quick reset (clear values)
If you want to reset totals/sales:
- `docker compose down`
- delete `backend/db/sales.db`
- `docker compose up --build -d`

## How to run in GitHub Codespaces
1. Open repository in GitHub Codespaces.
2. Copy env file:
   - `cp .env.example .env`
3. Run:
   - `docker compose up --build -d`
4. Open forwarded ports:
   - `8080` for app UI
5. Verify:
   - open `/api/health` on the 8080 forwarded URL
6. Stop:
   - `docker compose down`

## API endpoints
- `GET /api/health`  
  Response: `{ "status": "ok" }`

- `POST /api/sales`  
  Request body (expected):
  ```json
  { "amount_kg": 1 }
  ```
  Response example:
  ```json
  {
    "success": true,
    "message": "Sale recorded",
    "sale": {
      "id": 1,
      "amount_kg": 1,
      "price_eur": 500,
      "created_at": "2026-04-16 00:00:00"
    }
  }
  ```

- `GET /api/sales`  
  Returns all stored sales ordered by newest first:
  ```json
  {
    "count": 1,
    "sales": [
      {
        "id": 1,
        "amount_kg": 1,
        "price_eur": 500,
        "created_at": "2026-04-16 00:00:00"
      }
    ]
  }
  ```

- `DELETE /api/sales`  
  Clears all stored sales for demo reset:
  ```json
  {
    "success": true,
    "message": "All sales cleared"
  }
  ```

## Database schema
SQLite table: `sales`

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount_kg REAL NOT NULL,
  price_eur REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

On each valid sale button click:
- `amount_kg = 1`
- `price_eur = 500` (or `FIXED_PRICE_EUR` from env)
- `created_at = CURRENT_TIMESTAMP`

## How to test the button flow
1. Run `docker compose up --build`.
2. Open frontend at `http://localhost:8080`.
3. Click **Sell 1 kg of Ammonia**.
4. Confirm status shows `Sale recorded`.
5. Confirm total sales and total revenue update.
6. Confirm latest 5 sales list updates.
7. Use **Reset demo data** button and confirm counters return to zero.
8. Optional API checks:
   - `http://localhost:3000/api/sales`
   - `http://localhost:3000/api/health`

Backend unit/integration-style test:
- `cd backend && npm install && npm test`

## Cloud deployment readiness
This project is deployable to common cloud runtimes with minimal changes:
- Separate frontend and backend containers already defined
- Runtime configuration via environment variables (`PORT`, `DB_PATH`, `FIXED_PRICE_EUR`)
- Health endpoint included for probes (`GET /api/health`)
- Stateless API layer except SQLite file mount

For production scale, replace SQLite with a managed SQL database and use a persistent volume strategy.

## Team development workflow with AI agents
- Humans define requirements, architecture, acceptance criteria, and release decisions.
- Humans review and approve all final code and infrastructure changes.
- AI agents assist with scaffolding, coding, testing, Docker setup, documentation, and safe refactoring.
- Asynchronous unattended AI work is used only for bounded tasks (for example drafting tests, improving docs, proposing refactors).
- All AI-generated output is validated through tests and human review before merge/deployment.
- Team alignment is maintained via shared requirements, explicit acceptance criteria, code review, and automated checks.

### Optimization goals
The team optimizes for:
- **Performance**: fast API responses and lightweight frontend
- **Development Time**: simple architecture and rapid iteration
- **Cost**: low runtime footprint and minimal service dependencies
- **Accuracy**: deterministic sale-recording behavior and validated input
- **Usability**: one-click workflow with clear status feedback
- **Security**: no hardcoded secrets and least-complex exposure surface
- **Scalability**: containerized services with clear upgrade path
- **Extensibility/Maintainability**: modular backend files and documented API
- **Traceability**: explicit requirements, logs, tests, and review process
