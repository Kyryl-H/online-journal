# 🎓 Online Journal & Class Schedule (Aleph)

**Student:** Kyryl Hodlevskyi  
**Group:** P-43  
**Specialty:** 121 — Software Engineering  
**Educational Institution:** VSP "Zhytomyr Technological Professional College of Kyiv National University of Construction and Architecture"

## 📝 Project Description

A web application designed to manage and organize educational processes. The project uses a modular architecture with role-based functionality for different types of users (**Teacher, Curator, Student**) and provides a convenient interface for viewing class schedules, managing academic performance, and analyzing statistics.

**Coursework and Diploma Project Topic:**  
**"Development of a Web Application for an Electronic Journal and Class Schedule for an Educational Institution"**

The project is currently under active development. The main Frontend functionality is complete, featuring a fully responsive dark-themed UI, role-based access, a dynamic class schedule, and interactive performance statistics. The Backend is built with Node.js and Express.js, successfully integrated with a relational database via Sequelize ORM, and secured with JWT authentication.

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
- **Dashboards & Analytics:** **Chart.js** for academic performance visualization.
- **Backend:** Node.js, Express.js, JWT, bcrypt.
- **Data:** MySQL / PostgreSQL database using Sequelize ORM.
- **Architecture:** Modular MVC structure, DRY, Separation of Concerns (SoC), with business logic extracted into Service layers and DTOs.

## ✨ Key Features

### 1. 🔐 Role-Based Routing & Security

- Secure JWT authentication and hashed passwords.
- Dynamic user redirection based on their role after authentication.
- Separate interfaces for Students, Teachers, and Curators.
- Middleware-protected routes to enforce access rights.

### 2. 📅 Dynamic Class Schedule

- Weekly class schedule with lessons grouped by days.
- Interactive week pagination (**±4 weeks from the current date**).
- Navigation between different academic weeks.
- Schedule filtering by selected group.
- Display of lesson times.
- Dynamic schedule rendering.

### 3. 👨‍💼 Curator Dashboard

- Dynamic rendering of the student list.
- Real-time student search and filtering.
- Sorting students according to the Ukrainian alphabet.
- Calculation of average grades.
- Display of student attendance information.
- Academic performance overview.
- Grade distribution visualization using 5-point and 12-point grading scales.
- Interactive **Chart.js** diagrams with a custom legend.

### 4. 📊 Statistics & Analytics

- Visual representation of academic performance.
- Grade distribution analysis.
- Support for both 5-point and 12-point grading scales.
- Dynamic statistics updates based on the selected data.

### 5. 🧩 State Management & API Integration

- Application data is separated from DOM manipulation and fetched dynamically from backend controllers.
- DTOs (Data Transfer Objects) ensure clean data formatting before reaching the client side.

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

### 4. Start the local server

```bash
npm start
```

### 5. Open the application

Open the following address in your browser:

```text
http://localhost:3000
```

## 🚧 Plans for the Future (Roadmap)

- [x] Integrating a real relational database (**PostgreSQL / MySQL**).
- [ ] Creating a **RESTful API** for client-server communication.
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

**The project is in active development.**
The application now features a fully functional REST API, JWT-based authentication, and a connected MySQL database via Sequelize. Both teacher and student interfaces are active, allowing full CRUD operations for core educational entities. The codebase is currently undergoing architectural refactoring—extracting business logic into dedicated Service layers and DTOs—to prepare a clean, scalable MVC structure before final testing and deployment.
