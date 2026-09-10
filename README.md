# 🎓 Online Journal & Class Schedule

**Student:** Kyryl Hodlevskyi  
**Group:** P-33  
**Specialty:** 121 — Software Engineering  
**Educational Institution:** VSP "Zhytomyr Technological Professional College of Kyiv National University of Construction and Architecture"

## 📝 Project Description

A web application designed to manage and organize educational processes. The project uses a modular architecture with role-based functionality for different types of users (**Teacher, Curator, Student**) and provides a convenient interface for viewing class schedules, managing academic performance, and analyzing statistics.

**Coursework and Diploma Project Topic:**  
**"Development of a Web Application for an Electronic Journal and Class Schedule for an Educational Institution"**

The project is currently under active development. The main Frontend functionality has been implemented, including role-based access, a dynamic class schedule, academic performance data, and statistics. The Backend is being developed using Node.js and Express.js, with further integration with a relational database planned.

## 🔑 Test Accounts

Basic role-based authentication is currently implemented for testing purposes.

> **The following credentials are fictional test accounts created exclusively for demonstrating the application.**

### 👨‍🎓 Student

- **Login:** `k.hodlevskyi@ztfk.edu.ua`
- **Password:** `11111111`

### 👨‍🏫 Teacher / Curator

- **Login:** `v.dashkevych@ztfk.edu.ua`
- **Password:** `22222222`

## 🛠 Technology Stack

- **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES6 Modules).
- **Dashboards & Analytics:** **Chart.js** for academic performance visualization.
- **Backend:** Node.js, Express.js.
- **Data:** JSON files during development, with planned integration of a relational database.
- **Architecture:** Modular structure, DRY, Separation of Concerns (SoC), with gradual implementation of the MVC pattern on the server side.

## ✨ Key Features

### 1. 🔐 Role-Based Routing

- Dynamic user redirection based on their role after authentication.
- Separate interfaces for Students, Teachers, and Curators.
- Role-based access to application functionality.

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

### 5. 🧩 State Management

Application data is separated from DOM manipulation and stored in dedicated state structures.

This approach simplifies data management, interface updates, and future integration with the REST API.

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

- [ ] Integrating a real relational database (**PostgreSQL / MySQL**).
- [ ] Creating a **RESTful API** for client-server communication.
- [ ] Importing test JSON data into the database.
- [ ] Implement CRUD operations for core entities.
- [ ] Set up a secure authentication system.
- [ ] Hash passwords.
- [ ] Implement JWT or session-based authentication.
- [ ] Middleware for verifying roles and access rights.
- [ ] Full-featured electronic grade book.
- [ ] Adding and editing grades.
- [ ] Attendance tracking.
- [ ] Expanding the functionality of the user dashboard.
- [ ] Optimizing and refactoring CSS.
- [ ] Full responsiveness for mobile devices.
- [ ] UX/UI improvements.
- [ ] Testing and error handling.
- [ ] REST API documentation.
- [ ] Preparing the application for deployment.

## 📌 Current Status

**The project is in active development.**
At this stage, the core frontend has been implemented, featuring role-based logic, a dynamic schedule, a mentor dashboard, and the ability to view performance metrics and statistics.
Test data is stored in JSON files. The server-side component at Node.js/Express is being developed to create a REST API and integrate a relational database.
