"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";
import { getCuratorGroup, getCuratorStudents } from "../api.js";

const state = {
  chartInstance: null,
  currentSudents: [],
  nameGroup: "",
};
//  DOM
const els = {
  select: document.querySelector(".group-select"),
  studentContainer: document.querySelector(".student-container"),
  searchInput: document.querySelector(".search-input"),
  groupGrades: document.querySelector(".group-grades"),
  groupPasses: document.querySelector(".group-passes"),
  ctx: document.getElementById("gradesChart"),
  legendDiagram: document.querySelector(".legend-diagram"),
  legendRows: document.querySelectorAll(".legend-row"),
  modalOverlay: document.querySelector(".modal-overlay"),
  reportBtn: document.querySelector(".report-btn"),
  btnCloseModal: document.querySelector(".btn-close-modal"),
  messageList: document.querySelector(".message-group-list"),
  messageStatistic: document.querySelector(".message-group-statistic"),

  monthSelect: document.querySelector("#month-select"),
  periodSelect: document.querySelector("#report-period"),
  exportHint: document.querySelector(".export-hint"),
};

//  Логіка місяців
const MONTHS = [
  { value: 8, name: "Вересень" },
  { value: 9, name: "Жовтень" },
  { value: 10, name: "Листопад" },
  { value: 11, name: "Грудень" },
  { value: 0, name: "Січень" },
  { value: 1, name: "Лютий" },
  { value: 2, name: "Березень" },
  { value: 3, name: "Квітень" },
  { value: 4, name: "Травень" },
  { value: 5, name: "Червень" },
];

const getDefaultMonth = () => {
  const m = new Date().getMonth();
  return m === 6 || m === 7 ? 8 : m;
};

export const getSelectedMonth = () => Number(els.monthSelect.value);
const getSelectedMonthName = () =>
  els.monthSelect.selectedOptions[0]?.text ?? "";

const updateExportHint = () => {
  els.exportHint.hidden = els.periodSelect.value !== "month";
  els.exportHint.querySelector(".export-month-name").textContent =
    getSelectedMonthName();
};

const initMonthSelect = (onMonthChange) => {
  els.monthSelect.innerHTML = MONTHS.map(
    ({ value, name }) => `<option value="${value}">${name}</option>`,
  ).join("");
  els.monthSelect.value = String(getDefaultMonth());

  els.monthSelect.addEventListener("change", () => {
    updateExportHint();
    onMonthChange(getSelectedMonth());
  });
  els.periodSelect.addEventListener("change", updateExportHint);
  updateExportHint();
};

// Основні функції

const renderStudentList = (students, searchQuery = "") => {
  els.studentContainer.innerHTML = "";

  students = students
    .filter((s) => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "uk"));

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

const renderStatistics = (statistics) => {
  els.groupPasses.textContent = statistics.totalPasses;
  els.groupGrades.textContent = `${statistics.averageGrade}%`;
  renderChart(statistics.diagramData);
};

const renderChart = (dataArr) => {
  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  // Перевіряємо, чи всі значення дорівнюють нулю
  const isEmpty = dataArr.every((val) => val === 0);

  const chartData = isEmpty ? [1] : dataArr;

  const bgColors = isEmpty
    ? ["#374151"]
    : ["#0f766e", "#2563eb", "#f59e0b", "#0ea5e9"];

  state.chartInstance = new Chart(els.ctx, {
    type: "doughnut",
    data: {
      labels: ["Відмінно", "Добре", "Задовільно", "Незадовільно"],
      datasets: [
        {
          data: chartData,
          backgroundColor: bgColors,
          borderWidth: 2,
          // Прибираємо  обводку, якщо це порожній стан
          borderColor: isEmpty ? "transparent" : "#ffffff",
          hoverOffset: isEmpty ? 0 : 15,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: !isEmpty },
      },
      layout: { padding: 15 },
      onHover: function (event, elements) {
        if (isEmpty) return;

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

  const rect = els.ctx.getBoundingClientRect();
  els.legendDiagram.style.top = ` ${rect.top + window.scrollY + 35}px`;
  els.legendDiagram.style.left = `${rect.right + window.scrollX + 10}px`;
};
// Беремо місяць з аргументу або прямо з селекта
const loadDashboardForGroup = async function (groupId, monthParam) {
  const year = new Date().getFullYear();
  const month = monthParam !== undefined ? monthParam : getSelectedMonth();

  const student = await getCuratorStudents(groupId, year, month);

  state.currentSudents = student.students;
  renderStudentList(state.currentSudents);
  renderStatistics(student.statistics);
};

const setupEventListeners = () => {
  els.select.addEventListener("change", (e) => {
    els.searchInput.value = "";
    loadDashboardForGroup(e.target.value);

    const selectedGroupName = e.target.options[e.target.selectedIndex].text;
    els.messageList.textContent = `Список студентів групи ${selectedGroupName}`;
    els.messageStatistic.textContent = `Статистика групи ${selectedGroupName}`;
  });

  els.searchInput.addEventListener("input", (e) => {
    renderStudentList(state.currentSudents, e.target.value);
  });

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

const initApp = async () => {
  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  // Ініціалізуємо селект місяців
  // При його зміні перезавантажуємо дані для вибраної групи
  initMonthSelect((selectedMonth) => {
    if (els.select.value) {
      loadDashboardForGroup(els.select.value, selectedMonth);
    }
  });

  const group = await getCuratorGroup();

  group.forEach((g) => {
    els.select.insertAdjacentHTML(
      "beforeend",
      `<option value="${g.id}">${g.name}</option>`,
    );
  });

  if (els.select.value) {
    loadDashboardForGroup(els.select.value);

    const selectedGroupName = els.select.options[els.select.selectedIndex].text;
    state.nameGroup = selectedGroupName;

    els.messageList.textContent = `Список студентів групи ${state.nameGroup}`;
    els.messageStatistic.textContent = `Статистика групи ${state.nameGroup}`;
  }

  setupEventListeners();
};

initApp();
