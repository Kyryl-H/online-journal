"use strict";

import {
  fetchTeachers,
  fetchGroups,
  fetchStudents,
  fetchGrades,
  fetchSchedule,
} from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

const state = {
  curatorId: null,
  groups: [],
  students: [],
  grades: [],
  schedule: [],
  currentGroupStudents: [],
  chartInstance: null,
};

//DOM Елементи
const els = {
  select: document.querySelector(".group-select"),
  studentContainer: document.querySelector(".student-container"),
  searchInput: document.querySelector(".search-input"),
  groupGrades: document.querySelector(".group-grades"),
  groupPasses: document.querySelector(".group-passes"),
  ctx: document.getElementById("gradesChart"),
  monthEl: document.querySelector(".month"),
  legendDiagram: document.querySelector(".legend-diagram"),
  legendRows: document.querySelectorAll(".legend-row"),
  modalOverlay: document.querySelector(".modal-overlay"),
  reportBtn: document.querySelector(".report-btn"),
  btnCloseModal: document.querySelector(".btn-close-modal"),
};

// ЛІВА КАРТКА: Список студентів
const renderStudentList = (groupId, searchQuery = "") => {
  els.studentContainer.innerHTML = "";

  // Фільтруємо студентів для поточної групи та зберігаємо в State для правої картки
  state.currentGroupStudents = state.students
    .filter((s) => s.group_id == groupId)
    .filter((s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "uk"));

  // Малюємо HTML
  state.currentGroupStudents.forEach((stud, i) => {
    const html = `
      <div class="card-row">
        <div class="student-number">${i + 1}</div>
        <div class="icon-box"><i class="bi bi-person"></i></div>
        <div class="full-name">${stud.full_name}</div>
      </div>`;
    els.studentContainer.insertAdjacentHTML("beforeend", html);
  });
};

// ПРАВА КАРТКА: Статистика
const renderStatistics = (groupId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = 8; // Вересень

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  // Фільтруємо розклад
  const scheduleIdsOfMonth = state.schedule
    .filter((lesson) => lesson.group_id == groupId)
    .filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= startOfMonth && lessonDate <= endOfMonth;
    })
    .map((lesson) => lesson.id);

  const studentIds = state.currentGroupStudents.map((st) => st.id);

  // Знаходимо оцінки потрібних студентів за потрібні заняття
  const currentGrades = state.grades.filter(
    (g) =>
      scheduleIdsOfMonth.includes(g.schedule_id) &&
      studentIds.includes(g.student_id),
  );

  let passes = 0;
  let gradesSum = 0;
  let dataGradeDiagram = [0, 0, 0, 0];

  // Рахуємо пропуски, середній бал та дані для графіка
  currentGrades.forEach((g) => {
    if (g.value.toLowerCase() === "н") {
      passes++;
    } else {
      const val = Number(g.value);
      gradesSum += val;

      const lesson = state.schedule.find((les) => les.id == g.schedule_id);

      if (lesson.grading_system === 5) {
        if (val === 5) dataGradeDiagram[0]++;
        else if (val === 4) dataGradeDiagram[1]++;
        else if (val === 3) dataGradeDiagram[2]++;
        else if (val === 2) dataGradeDiagram[3]++;
      } else if (lesson.grading_system === 12) {
        if (val >= 10) dataGradeDiagram[0]++;
        else if (val >= 7) dataGradeDiagram[1]++;
        else if (val >= 4) dataGradeDiagram[2]++;
        else if (val >= 1) dataGradeDiagram[3]++;
      }
    }
  });

  // Оновлюємо UI
  els.groupPasses.textContent = passes;
  const average =
    currentGrades.length > passes
      ? (gradesSum / (currentGrades.length - passes)).toFixed(2)
      : 0;
  els.groupGrades.textContent = average;

  renderChart(dataGradeDiagram);
};

// ДІАГРАМА
const renderChart = (dataArr) => {
  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  state.chartInstance = new Chart(els.ctx, {
    type: "doughnut",
    data: {
      labels: ["Відмінно", "Добре", "Задовільно", "Незадовільно"],
      datasets: [
        {
          data: dataArr,
          backgroundColor: ["#0f766e", "#2563eb", "#f59e0b", "#0ea5e9"],
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 15,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      layout: { padding: 15 },
      onHover: function (event, elements) {
        if (elements.length > 0) {
          const activeIndex = elements[0].index;
          els.legendRows.forEach((row) => {
            row.classList.toggle("hovered", row.dataset.index == activeIndex);
          });
        } else {
          els.legendRows.forEach((row) => row.classList.remove("hovered"));
        }
      },
    },
  });

  // Розміщення кастомної легенди
  const rect = els.ctx.getBoundingClientRect();
  els.legendDiagram.style.top = ` ${rect.top + window.scrollY + 35}px`;
  els.legendDiagram.style.left = `${rect.right + window.scrollX + 10}px`;
};

// СЛУХАЧІ ПОДІЙ
const setupEventListeners = () => {
  // Вибір групи
  els.select.addEventListener("change", (e) => {
    els.searchInput.value = "";
    renderStudentList(e.target.value);
    renderStatistics(e.target.value);
  });

  // Пошук
  els.searchInput.addEventListener("input", (e) => {
    renderStudentList(els.select.value, e.target.value);
  });

  // Підсвітка секторів при наведенні на легенду
  els.legendRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      const index = Number(this.getAttribute("data-index"));
      state.chartInstance.setActiveElements([{ datasetIndex: 0, index }]);
      state.chartInstance.update();
    });
    row.addEventListener("mouseleave", function () {
      state.chartInstance.setActiveElements([]);
      state.chartInstance.update();
    });
  });

  // Модальне вікно
  els.reportBtn.addEventListener("click", () =>
    els.modalOverlay.classList.remove("hidden"),
  );
  els.btnCloseModal.addEventListener("click", () =>
    els.modalOverlay.classList.add("hidden"),
  );
  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay"))
      els.modalOverlay.classList.add("hidden");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") els.modalOverlay.classList.add("hidden");
  });
};

// ГОЛОВНА ФУНКЦІЯ: Запуск додатку
const initApp = async () => {
  renderLayout();
  renderExit();
  initGlobal();

  const userId = localStorage.getItem("userId");

  const [teachers, groups, students, grades, schedule] = await Promise.all([
    fetchTeachers(),
    fetchGroups(),
    fetchStudents(),
    fetchGrades(),
    fetchSchedule(),
  ]);

  state.groups = groups;
  state.students = students;
  state.grades = grades;
  state.schedule = schedule;

  const currentCurator = teachers.find((t) => t.user_id == userId);
  state.curatorId = currentCurator.id;

  const curatorGroups = groups.filter((g) => g.curator_id == state.curatorId);
  curatorGroups.forEach((g) => {
    els.select.insertAdjacentHTML(
      "beforeend",
      `<option value="${g.id}">${g.name}</option>`,
    );
  });

  //Ставимо слухачі та робимо перший рендер
  setupEventListeners();

  if (els.select.value) {
    renderStudentList(els.select.value);
    renderStatistics(els.select.value);
  }
};
initApp();
