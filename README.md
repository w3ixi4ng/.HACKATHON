# SMU:Serve 

A modern web application designed to streamline the tracking and management of community service hours for organizations and members. The platform facilitates project creation, member participation, and administrative oversight through a user-friendly interface and robust role-based access controls.

---

## Overview

The Community Service Hours Tracker enables:
- Members to join community service projects and log hours.
- Organization Committees to manage projects and approve submitted hours.
- Administrators to oversee platform activities and manage user roles.

The application is built using React (TypeScript) with Vite, styled with TailwindCSS, and leverages Supabase for authentication and database management.

---

## Key Features

- Secure User Authentication with role-based access control.
- Project Creation and Enrollment workflows.
- Service Hour Submission and approval mechanism.
- Admin Dashboard for user and project management.
- Fully responsive UI optimized for both desktop and mobile experiences.
- Modular, scalable codebase with clear component abstractions.

---

## 📁 Project Directory Structure

```
/src
├── components/
│   ├── Layout.tsx              # Application layout wrapper
│   ├── Auth.tsx                # Authentication form component
│   ├── CreateProjectModal.tsx  # Modal for initiating new projects
│   ├── SubmitHoursModal.tsx    # Modal for logging service hours
│   ├── EditProjectModal.tsx    # Modal for updating project details
│
├── pages/
│   ├── Projects.tsx            # Browse and explore available projects
│   ├── MyProjects.tsx          # Dashboard of a member's enrolled projects
│   ├── Hours.tsx               # View and manage submitted service hours
│   ├── Admin.tsx               # Administrative control panel
│   ├── UserManagement.tsx      # Interface for managing users and roles
│
├── contexts/
│   └── AuthContext.tsx         # Global authentication state provider
│
├── lib/
│   └── supabase.ts             # Supabase client and helper functions
│
├── App.tsx                     # Main app shell
├── main.tsx                    # Entry point rendering the app
└── index.css                   # Global styles
```
## Technology Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | React (Vite + TypeScript)           |
| Styling       | TailwindCSS, PostCSS                |
| Backend       | Supabase (Authentication & Database)|
| State Mgmt    | React Context API                   |
| Tooling       | Vite, ESLint                        |

---

## Setup & Installation

### Prerequisites
- Node.js (v18.x or higher)
- A Supabase Project with configured Authentication and Database tables.
- Supabase API keys set in an .env file.
- Supabase API required

### Steps to Run Locally
```bash
git clone https://github.com/your-username/community-service-tracker.git
cd community-service-tracker
npm install
npm run dev
