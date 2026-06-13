# TimeTraxAI – Workforce Cost Intelligence Copilot

## Attendee Details

**Name:** Tarun Sandilya Balivada
**GitHub Username:** https://github.com/professionaltarun2004
**LinkedIn Profile:** https://linkedin.com/in/tarun-sandilya-balivada-937497252
**GitHub Project Repository:** https://github.com/professionaltarun2004/TimeTraxAI
**Vercel Deployment:** https://my-webfolio-mes63hriq-tarun-sandilya-balivadas-projects.vercel.app/

---

# Problem Statement Selected

**HR Cost Intelligence Engine**

---

# Project Description

TimeTraxAI is an AI-powered Workforce Cost Intelligence platform that helps organizations understand where workforce costs are being spent, where operational inefficiencies exist, and which projects are at risk of overruns.

Traditional organizations rely on manual timesheets, spreadsheets, and fragmented reporting systems to understand project costs. These methods are often inaccurate, delayed, and difficult to scale.

TimeTraxAI automates workforce cost attribution by analyzing meeting activity, organizational context, project signals, and employee participation patterns. It continuously allocates workforce costs to projects, detects inefficiencies, identifies cost leakages, and generates executive recommendations.

The platform is designed for Finance Leaders, Delivery Managers, Engineering Leadership, HR Operations, and Project Owners who need real-time visibility into workforce utilization and project spending.

---

# Approach

### Problem Understanding

The core challenge was not calculating meeting costs but understanding how workforce effort translates into project-level spending.

Organizations often know employee salaries but struggle to answer:

* Which project consumed the most workforce cost?
* Which recurring meetings create operational waste?
* Which projects are likely to exceed planned budgets?
* Where should leadership intervene?

### Solution Architecture

TimeTraxAI processes workforce activity through a multi-stage intelligence pipeline:

Calendar Events / Meeting Data

↓

Attribution Engine

↓

Cost Allocation Engine

↓

Leakage Detection Engine

↓

Risk Scoring Engine

↓

Executive Intelligence Layer

### AI Project Attribution Engine

Instead of assigning meetings using a simple keyword match, the system calculates confidence using multiple signals:

* Meeting Title Relevance
* Organizer Department Affinity
* Attendee Participation Patterns
* Historical Meeting Consistency

Example:

Title Match = 40 points

Organizer Match = 20 points

Attendee Match = 20 points

Historical Affinity = 15 points

Final Confidence = 95%

This approach provides explainable AI decisions rather than black-box classifications.

### Cost Attribution Engine

Meeting Cost = Duration × Sum(Employee Hourly Rates)

Costs are automatically allocated to projects and aggregated across:

* Projects
* Employees
* Teams

### Leakage Detection

The platform identifies:

* Excessive recurring meetings
* Leadership over-involvement
* High meeting density
* Operational inefficiencies

Each inefficiency contributes to a leakage score and estimated waste cost.

### Risk Engine

Projects are continuously evaluated using:

* Workforce Cost Growth
* Leakage Score
* Meeting Overload
* Organizational Complexity

This produces a dynamic project risk score used by leadership for decision-making.

### Explainability and Governance

To improve trust in AI decisions, every attribution includes:

* Confidence Score
* Reasoning Trace
* Approval Threshold Logic

High-confidence decisions are auto-approved while lower-confidence decisions can be routed for human review.

---

# Tech Stack and Tools Used

**Frontend:** React, Vite, Tailwind CSS, Recharts

**Backend:** Client-side processing architecture

**Database:** In-memory demo dataset

**AI Tools/API:** OpenRouter, Gemini Models

**Cloud/Deployment:** Vercel

**Other Tools:** Cursor, GitHub, Vercel CLI

---

# Key Features

* AI Workforce Cost Attribution
* Explainable Project Classification
* Real-Time Event Processing Pipeline
* Workforce Cost Allocation Engine
* Cost Leakage Detection
* Project Risk Scoring
* Executive Intelligence Dashboard
* Live Agent Activity Feed
* AI Forecast & Strategy Layer
* Governance and Confidence Scoring

---

# What is Working?

* Real-time event processing simulation
* Workforce cost calculation
* AI-powered project attribution
* Confidence scoring
* Cost leakage analysis
* Project risk engine
* Executive recommendations
* Interactive analytics dashboard
* Mobile-responsive interface
* Vercel deployment

---

# What is Still in Progress?

* Full Google Calendar OAuth integration
* Live organizational directory integration
* Human-in-the-loop approval workflow
* Advanced audit logging
* Multi-source enterprise integrations (Jira, GitHub, Slack)

---

# Screenshots or Demo

**Deployed Link:** [Your Vercel URL]

**Demo Video Link:** [Optional]

**Screenshots:** Dashboard, Attribution Engine, Risk Heatmap, Executive Intelligence Layer

---

# Challenges Faced

* Designing explainable AI attribution instead of simple classification
* Balancing automation with governance and trust
* Building a risk scoring framework under hackathon time constraints
* Creating real-time intelligence visualizations
* Managing deployment and integration challenges within limited time

---

# Learnings

* Importance of explainable AI in enterprise environments
* Workforce analytics is fundamentally a decision-support problem
* Risk scoring requires combining multiple organizational signals
* Human-in-the-loop systems increase trust and adoption
* Real business value comes from actionable insights rather than raw metrics

---

# Future Improvements

* Native Google Calendar integration
* Jira and GitHub activity correlation
* Workforce efficiency scoring
* Predictive budget overrun forecasting
* LLM-powered executive copilots
* Multi-agent orchestration
* Enterprise RBAC and governance controls

---

# Final Note

TimeTraxAI was built with a focus on explainability, governance, and executive decision support.

Rather than simply reporting workforce costs, the platform aims to answer a more valuable question:

“Where is workforce cost being spent, where is it being wasted, and what action should leadership take next?”

By combining AI attribution, cost intelligence, risk scoring, and explainable decision making, TimeTraxAI transforms workforce activity into actionable business intelligence.
