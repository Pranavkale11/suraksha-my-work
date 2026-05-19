---
title: SuRaksha MAPS Backend
emoji: 🛡️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# SuRaksha MAPS v4.0

Welcome to **SuRaksha MAPS (Multi-Agent Policy System) v4.0**. This project is designed to automate the ingestion, gap detection, and compliance tracking of regulatory circulars (such as those from the RBI) for financial institutions.

---

## 🧭 Project Flow

The overall flow of the SuRaksha MAPS platform operates as follows:

1. **Authentication & Zero-Trust RBAC:** Users log in and are securely routed to their department-specific dashboards.
2. **Regulatory Ingestion (Watcher):** Compliance Officers upload PDF or TXT circulars. The system automatically parses these documents, extracting text, tables, and specific regulatory clauses.
3. **Gap Detection:** The parsed clauses are run against the organization's existing internal policies using vector similarity searches and NLP to identify *"Covered"* areas, *"Suspected Gaps,"* or *"Confirmed Gaps"*.
4. **Triage & Validation:** Identified gaps are sent to a Triage Queue for human review. Authorized users can approve, dismiss, or escalate these gaps.
5. **Multi-Agent Path (MAP) Creation:** Approving a gap automatically creates a MAP, routing the task to the relevant department (e.g., IT, Legal, Risk) for remediation.

---

## 📦 Modules Explanation

### 1. Backend (`/backend`) - *Current Deployment*
* **Framework:** FastAPI (Python) with Pydantic for validation.
* **Database:** MongoDB Atlas.
* **Purpose:** Exposes RESTful APIs, handles database interactions, and runs the core business logic.
* **Key Services:**
  * `auth`: Handles registration, login, and token generation.
  * `circulars`: Manages document uploads, GridFS storage, and ingestion triggers.
  * `gap_detector`: The engine that compares new clauses against existing policies.
  * `parsers`: Contains logic to extract text from unstructured data.

### 2. Frontend (`/frontend`)
* **Framework:** React + TypeScript + Vite.
* **Purpose:** Provides the user interface for all roles.
* **Key Components:**
  * `AdminDashboard`: Global oversight for CISO and system admins.
  * `DepartmentDashboard`: Tailored views for specific roles like IT Lead, Legal Head, etc.
  * `Circulars`: The board where uploaded circulars are tracked.
  * `GapDetection`: Interface to trigger and review gap analysis.
  * `Triage Queue`: The sign-off and validation page for potential gaps.

### 3. Mock Data & Seeding (`/mock-data`)
Contains scripts and JSON data to seed the database with mock policies, users, and gaps for testing purposes.

---

## 🚀 Deployment Notes (Hugging Face Spaces)

This backend repository is configured to deploy natively as a **Docker** container on Hugging Face Spaces. 

* The application runs on port `7860` as required by the Hugging Face infrastructure.
* Ensure your Environment Variables/Secrets (like your MongoDB URI) are configured in the Hugging Face **Settings -> Variables and secrets** dashboard rather than using a local `.env` file.