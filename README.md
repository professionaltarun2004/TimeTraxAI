# TimeTraxAI – Workforce Intelligence OS

🚀 **Live Demo (Vercel Deployment):** [https://my-webfolio-mes63hriq-tarun-sandilya-balivadas-projects.vercel.app/](https://my-webfolio-mes63hriq-tarun-sandilya-balivadas-projects.vercel.app/)

**TimeTraxAI** is an autonomous, AI-powered Operating System designed to ingest calendar meeting activity and automatically attribute workforce costs, detect financial waste, and predict project risks in real time. 

Built to solve the **"HR Cost Intelligence"** problem statement, this application moves beyond static dashboards to deliver an active, event-processing Intelligence Center that operates like Datadog or LangSmith for human capital.

---

## 🏗️ System Architecture & Agent Pipeline

![System Architecture](./assets/TimeTrax%20system%20architecture.png)

Instead of a standard CRUD application, TimeTraxAI runs an autonomous pipeline of six distinct agents. Every meeting event passes sequentially through this pipeline:

1. **Calendar Agent (Ingestion):** Ingests raw meeting metadata (Title, Attendees, Organizer, Duration).
2. **Attribution Agent (Classification):** Leverages OpenRouter (`gpt-4o-mini`) and heuristic scoring to probabilistically map the meeting to a specific business project or budget.
3. **Cost Agent (Financial Allocation):** Cross-references attendees against the HR salary database to calculate precise workforce dollar expenditure for the event.
4. **Leakage Agent (Waste Detection):** Analyzes the meeting structure to flag operational bloat (e.g., too many attendees, unnecessary recurring syncs).
5. **Risk Agent (Predictive Scoring):** Updates the global Risk Heatmap for the project based on the latest financial and operational signals.
6. **Executive Agent (Synthesis):** Updates the real-time velocity metrics and forecasts predicted weekly burn rates.

---

## 🧮 Mathematical Engines & Algorithms

The system relies on three deterministic mathematical engines to drive its intelligence.

### 1. Workforce Cost Engine
The system iterates through all attendees, maps them to their specific HR salary band to find their hourly rate (or uses a blended average of $150/hr), and calculates:
```text
Meeting Cost = Duration (hours) × Sum(Employee Hourly Rates)
```

### 2. Leakage (Waste) Detection Engine
Meetings are structurally scanned for inefficiencies to calculate an estimated Dollar Waste and Leakage Score (0-100):
*   **Large Meeting Penalty:** Attendees > 10 → `Score +40` | `Waste = 20% of Cost`
*   **Recurring Bloat:** Recurring & Duration ≥ 1.5h → `Score +30` | `Waste = 15% of Cost`
*   **Leadership Over-Involvement:** ≥ 2 Leaders in a meeting of ≤ 5 people → `Score +30` | `Waste = 30% of Cost`
*   **Low Participation:** Attendees < 3 & Duration > 1h → `Score +10` | `Waste = 10% of Cost`

### 3. Global Project Risk Engine
Projects are scored (0-100) dynamically based on aggregate metrics. If a project crosses 70, it triggers a **HIGH RISK** (Red) alert on the Heatmap:
*   **Cost Factor (40%):** Normalized total expenditure against baseline thresholds.
*   **Leakage Factor (30%):** The average Leakage Score across all meetings in the project.
*   **Overload Factor (20%):** Meeting frequency vs. a healthy operational baseline.
*   **Context Switching (10%):** Ratio of unique attendees touching the project.

---

## 🧠 AI Integration & Explainability

We integrate **OpenRouter (`openai/gpt-4o-mini`)** to drive the unstructured reasoning inside the Attribution and Executive Agents. 

To solve the "black box" problem of AI in enterprise environments, we built an **Explainability Trace Drawer**. Every attribution decision made by the AI generates a transparent **Confidence Score** derived from:
*   Keyword Match Score (Max 40)
*   Organizer Department Affinity (Max 20)
*   Attendee Vector Match (Max 20)
*   Historical Context (Max 20)

If Confidence > 85%, the system **Auto Approves** the attribution. If < 85%, it routes the event to the Governance Panel for **Human Review**.

---

## 🚀 Getting Started

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Boot the OS:**
   Open the application and click **"Boot OS"** to initiate the high-fidelity simulated event stream and watch the agents process data in real time.

### Deployment

This project is configured perfectly for Vercel. 
Simply run `vercel` in your CLI or import the repository into your Vercel Dashboard. The `vercel.json` SPA configuration is already included.

---

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS v4 (with native Dark/Light mode engine)
- **Data Visualization:** Recharts (Dynamic Time-Series)
- **AI Orchestration:** OpenRouter API
- **Icons:** Lucide React
