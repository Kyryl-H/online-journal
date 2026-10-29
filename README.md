# 🎓 Online Journal & Class Schedule (Aleph)

**Student:** Kyryl Hodlevskyi  
**Group:** P-43  
**Specialty:** 121 — Software Engineering  
**Educational Institution:** VSP "Zhytomyr Technological Professional College of Kyiv National University of Construction and Architecture"

## 📝 Project Description

A web application designed to manage and organize educational processes. The project uses a modular architecture with role-based functionality for different types of users (**Teacher, Curator, Student**) and provides a convenient interface for viewing class schedules, managing academic performance, and analyzing statistics.

**Coursework and Diploma Project Topic:**  
**"Development of a Web Application for an Electronic Journal and Class Schedule for an Educational Institution"**

The project has reached its primary coursework release milestone. The Frontend features a fully responsive dark-themed UI, role-based access, interactive performance statistics, and PDF report generation. The Backend is built on Node.js and Express.js, organized in a clean MVC structure inside `src/`, backed by a MySQL database via Sequelize ORM, validated with `express-validator`, and secured using JWT and `.env` configuration.

## 🔑 Test Accounts

Secure JWT-based authentication with role verification is implemented for testing purposes.

> **The following credentials are fictional test accounts created exclusively for demonstrating the application.**

### 👨‍🎓 Student

- **Login:** `k.hodlevskyi@ztfk.edu.ua`
- **Password:** `11111111H`

### 👨‍🏫 Teacher / Curator

- **Login:** `v.dashkevych@ztfk.edu.ua`
- **Password:** `33333333V`

## 🛠 Technology Stack

- **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox/Grid, Dark Mode), Vanilla JavaScript (ES6 Modules).
- **Dashboards & Analytics:** **Chart.js** for performance visualization, **PDFKit** for PDF report generation.
- **Backend:** Node.js, Express.js (`server.js` entry point), JWT, bcrypt, `express-validator`.
- **Data:** MySQL / PostgreSQL database using Sequelize ORM.
- **Architecture:** Structured MVC architecture inside `src/`, Separation of Concerns (SoC), Service layers, and Data Transfer Objects (DTOs).

## ✨ Key Features

### 1. 🔐 Role-Based Routing & Security

- Secure JWT authentication, password hashing, and reset flow with token expiration.
- Dynamic user redirection based on role after authentication.
- Middleware-protected routes (`is-teacher`, `is-student`) to enforce access rights.
- Environment variables management via `.env`.

### 2. 📅 Dynamic Class Schedule

- Weekly class schedule with lessons grouped by days.
- Interactive week pagination (**±4 weeks from the current date**).
- Navigation between different academic weeks.
- Schedule filtering by selected group.
- Display of lesson times and dynamic schedule rendering.

### 3. 👨‍💼 Curator Dashboard & Reporting

- Dynamic rendering of the student list with real-time search and filtering.
- Sorting students according to the Ukrainian alphabet.
- Academic performance overview, grade distribution visualization, and attendance tracking.
- Interactive **Chart.js** diagrams with custom legends.
- **PDF Report Export:** Downloadable PDF summaries for student grades and attendance records formatted with custom Cyrillic TTF fonts.

### 4. 📊 Statistics & Analytics

- Visual representation of academic performance and grade distribution analysis.
- Support for both 5-point and 12-point grading scales with seamless conversion logic for average calculation.
- Dynamic statistics updates based on selected periods or subjects.

### 5. 🧩 State Management & API Integration

- Full REST API coverage for Core CRUD operations across Teacher and Student entities.
- Business logic decoupled into Service layers (`scheduleService.js`, `gradesReport.js`, `passesReport.js`).
- DTOs (Data Transfer Objects) ensuring consistent API response structures.
- Robust payload validation via `express-validator`.

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Kyryl-H/online-journal.git
```

### 2. Navigate to the project directory

```bash
cd online-journal
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a .env file in the root directory and add your database credentials and JWT secret key:

```bash
PORT=3000
DB_NAME=online_journal
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
```

### 5. Import the Database

Import the provided SQL dump file dump.sql into your local MySQL server.

### 6. Start the local server

```bash
npm start
```

### 7. Open the application

Open the following address in your browser:

```text
http://localhost:3000
```

## 🚧 Plans for the Future (Roadmap)

- [x] Integrating a real relational database (**PostgreSQL / MySQL**).
- [x] Creating a **RESTful API** for client-server communication.
- [x] Importing test JSON data into the database.
- [x] Implement CRUD operations for core entities.
- [x] Set up a secure authentication system.
- [x] Hash passwords.
- [x] Implement JWT or session-based authentication.
- [x] Middleware for verifying roles and access rights.
- [x] Full-featured electronic grade book.
- [x] Adding and editing grades.
- [x] Attendance tracking.
- [x] Expanding the functionality of the user dashboard.
- [x] Optimizing and refactoring CSS.
- [x] Full responsiveness for mobile devices.
- [x] UX/UI improvements.
- [ ] Testing and error handling.
- [ ] REST API documentation.
- [ ] Preparing the application for deployment.

## 📌 Current Status

**Phase 1 (Coursework Core Milestone) Complete.**
The application now features a fully functional REST API, JWT-based authentication, and a connected MySQL database via Sequelize. Both teacher and student interfaces are active, allowing full CRUD operations for core educational entities. The codebase is currently undergoing architectural refactoring—extracting business logic into dedicated Service layers and DTOs—to prepare a clean, scalable MVC structure before final testing and deployment.
