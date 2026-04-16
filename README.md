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

- **Frontend (`frontend`)**: static HTML/CSS/JS served by Nginx  
- **Backend (`backend`)**: Node.js + Express REST API  
- **Database (`backend/db/sales.db`)**: SQLite persisted on disk  
- **Container orchestration**: Docker Compose  

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

Create a **`.env`** file in the project root (same folder as `docker-compose.yml`) if you want to override defaults. Example:

```bash
printf "FIXED_PRICE_EUR=500\n" > .env
```

(`FIXED_PRICE_EUR` defaults to `500` if `.env` is missing.)

### GitHub Codespaces (Recommended)

1. Open this repository in GitHub Codespaces  
2. In the terminal, from the folder that contains `docker-compose.yml`:

```bash
printf "FIXED_PRICE_EUR=500\n" > .env
docker compose up --build -d
```

3. Open the **forwarded port 8080** in the browser (Ports tab → 8080)

---

### Local (Docker)

1. Ensure Docker is installed and running  
2. From the project root (where `docker-compose.yml` lives):

```bash
printf "FIXED_PRICE_EUR=500\n" > .env
docker compose up --build -d
```

3. Open:

- App: [http://localhost:8080](http://localhost:8080)  
- Health: [http://localhost:8080/api/health](http://localhost:8080/api/health)  

---

### Testing the Application

1. Open the app  
2. Select an amount using the slider  
3. Click **Record Sale**  
4. Verify:

   - Success message appears  
   - Total sales updates  
   - Total revenue updates  
   - Latest transaction updates  

---

### Stopping the Application

```bash
docker compose down
```

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
├── frontend/
├── backend/
├── docker-compose.yml
├── .env
└── README.md
```

*(`.env` is listed in `.gitignore`; create it locally as shown above.)*

---

## API Endpoints

### Health

`GET /api/health`

### Record sale

`POST /api/sales`

**Example request body:**

```json
{ "amount_kg": 200 }
```

**Example response:**

```json
{
  "message": "Sale recorded",
  "amount_kg": 200,
  "price_eur": 100000
}
```

*(Illustrative numbers assume `FIXED_PRICE_EUR=500` in `.env`: `price_eur = amount_kg × FIXED_PRICE_EUR`.)*

`GET /api/sales` returns all stored sales for the dashboard.

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

---

## Course / evaluation context

This project supports **TECH Deliverable 1 & 2** (one-button app + agentic organization). Evaluation criteria and development checklist: [Innovation and Complexity Management – development checklist](https://dominikboehler.de/inco_new/#development-checklist--evaluation-criteria).

*Innovation and Complexity Management — Course on web application development in a health context at Deggendorf Institute of Technology.*
