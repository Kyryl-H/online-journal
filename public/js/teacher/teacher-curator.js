"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";
import { getCuratorGroup, getCuratorStudents } from "../api.js";

const state = {
  chartInstance: null,
  currentSudents: [],
  nameGroup: "",
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
  messageList: document.querySelector(".message-group-list"),
  messageStatistic: document.querySelector(".message-group-statistic"),
};

// ЛІВА КАРТКА: Список студентів
const renderStudentList = (students, searchQuery = "") => {
  els.studentContainer.innerHTML = "";

  // Пошук студентів
  students = students
    .filter((s) => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "uk"));

  // Малюємо HTML
  students.forEach((stud, i) => {
    const html = `
      <div class="card-row">
        <div class="student-number">${i + 1}</div>
        <div class="icon-box"><i class="bi bi-person"></i></div>
        <div class="full-name">${stud.fullName}</div>
      </div>`;
    els.studentContainer.insertAdjacentHTML("beforeend", html);
  });
};

// ПРАВА КАРТКА: Статистика
const renderStatistics = (statistics) => {
  // Оновлюємо UI
  const months = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ];

  const currentMonthIndex = new Date().getMonth();

  els.monthEl.textContent = months[currentMonthIndex];
  els.groupPasses.textContent = statistics.totalPasses;
  els.groupGrades.textContent = statistics.averageGrade;

  renderChart(statistics.diagramData);
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
// Завантаження даних
const loadDashboardForGroup = async function (groupId) {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const student = await getCuratorStudents(groupId, year, month);

  state.currentSudents = student.students;
  renderStudentList(state.currentSudents);
  renderStatistics(student.statistics);
};

// СЛУХАЧІ ПОДІЙ
const setupEventListeners = () => {
  // Вибір групи
  els.select.addEventListener("change", (e) => {
    els.searchInput.value = "";
    loadDashboardForGroup(e.target.value);

    const selectedGroupName = e.target.options[e.target.selectedIndex].text;

    els.messageList.textContent = `Список студентів групи ${selectedGroupName}`;
    els.messageStatistic.textContent = `Статистика групи ${selectedGroupName}`;
  });

  // Пошук
  els.searchInput.addEventListener("input", (e) => {
    renderStudentList(state.currentSudents, e.target.value);
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
  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  const group = await getCuratorGroup();

  group.forEach((g) => {
    els.select.insertAdjacentHTML(
      "beforeend",
      `<option value="${g.id}">${g.name}</option>`,
    );
  });

  //Ставимо слухачі та робимо перший рендер
  setupEventListeners();

  if (els.select.value) {
    loadDashboardForGroup(els.select.value);
    state.nameGroup = els.select.value;
  }
};
initApp();
