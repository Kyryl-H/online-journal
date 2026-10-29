"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "../global.js";
import {
  getCuratorGroup,
  getCuratorStudents,
  getCuratorGradesReport,
  getCuratorPassesReport,
  showToast,
} from "../api.js";
const state = {
  chartInstance: null,
  lastChartData: null,
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
  legendRows: document.querySelectorAll(".legend-row"),
  modalOverlay: document.querySelector(".modal-overlay"),
  reportBtn: document.querySelector(".report-btn"),
  btnCloseModal: document.querySelector(".btn-close-modal"),
  messageList: document.querySelector(".message-group-list"),
  messageStatistic: document.querySelector(".message-group-statistic"),

  monthSelect: document.querySelector("#month-select"),
  periodSelect: document.querySelector("#report-period"),
  typeRadios: document.querySelectorAll('input[name="report-type"]'),
  exportBtn: document.querySelector(".modal-save-btn"),
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
// Періоди звіту залежно від його типу. value лишились тими самими, що й раніше
const periodOptions = {
  passes: [
    { value: "month", label: "Місяць" },
    { value: "semester-1", label: "Семестр 1" },
    { value: "semester-2", label: "Семестр 2" },
  ],
  grades: [
    { value: "milestone-1", label: "Рубіжна, 1 семестр" },
    { value: "milestone-2", label: "Рубіжна, 2 семестр" },
    { value: "semester-1", label: "Семестрова, 1 семестр" },
    { value: "semester-2", label: "Семестрова, 2 семестр" },
  ],
};

const getReportType = () =>
  document.querySelector('input[name="report-type"]:checked')?.value ??
  "passes";

const fillPeriodOptions = () => {
  const options = periodOptions[getReportType()];
  const previous = els.periodSelect.value;

  els.periodSelect.innerHTML = options
    .map(
      ({ value, label }) =>
        `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`,
    )
    .join("");

  // Лишаємо попередній вибір, якщо він є в новому списку (наприклад, «Семестр 1»)
  els.periodSelect.value = options.some((o) => o.value === previous)
    ? previous
    : options[0].value;

  updateExportHint();
};

const initPeriodSelect = () => {
  els.typeRadios.forEach((radio) =>
    radio.addEventListener("change", fillPeriodOptions),
  );
  fillPeriodOptions();
};

const PERIOD_RE = /^(milestone|semester)-([12])$/;
const KIND_NAMES = { milestone: "Рубіжна", semester: "Семестрова" };

// Навчальний рік починається у вересні; у липні–серпні показуємо рік, що завершився
const academicStartYear = () => {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

const SEMESTER_RE = /^semester-([12])$/;

// Місяць зі статистики на сторінці, якого стосується «Буде експортовано за місяць».
// monthSelect.value — індекс місяця 0–11, на сервер передаємо 1–12
const getStatsPeriod = () => {
  const raw = els.monthSelect.value;
  if (raw === "" || !Number.isInteger(Number(raw)))
    return { month: 0, year: 0 };

  const month = Number(raw) + 1;
  const startYear = academicStartYear();
  return { month, year: month >= 9 ? startYear : startYear + 1 };
};
const handleExport = async () => {
  const groupId = els.select.value;
  if (!groupId) return;

  const startYear = academicStartYear();
  const groupName = els.select.selectedOptions[0]?.text ?? "група";
  const yy = (y) => String(y).slice(2);

  let request;
  let filename;

  if (getReportType() === "grades") {
    const match = PERIOD_RE.exec(els.periodSelect.value);
    if (!match) return;
    const [, kind, semester] = match;
    request = () =>
      getCuratorGradesReport(groupId, { kind, semester, year: startYear });
    filename = `${KIND_NAMES[kind]}_${groupName}_${semester}-семестр_${yy(startYear)}-${yy(startYear + 1)}.pdf`;
  } else if (els.periodSelect.value === "month") {
    const { month, year } = getStatsPeriod();
    if (!month) return;
    const monthName = els.monthSelect.selectedOptions[0]?.text ?? month;
    request = () =>
      getCuratorPassesReport(groupId, { period: "month", month, year });
    filename = `Пропуски_${groupName}_${monthName}_${year}.pdf`;
  } else {
    const semester = SEMESTER_RE.exec(els.periodSelect.value)?.[1];
    if (!semester) return;
    request = () =>
      getCuratorPassesReport(groupId, {
        period: "semester",
        semester,
        year: startYear,
      });
    filename = `Пропуски_${groupName}_${semester}-семестр_${yy(startYear)}-${yy(startYear + 1)}.pdf`;
  }

  const originalHtml = els.exportBtn.innerHTML;
  els.exportBtn.disabled = true;
  els.exportBtn.textContent = "Формуємо PDF…";

  try {
    const blob = await request();
    downloadBlob(blob, filename.replace(/\s+/g, "_"));
    els.modalOverlay.classList.add("hidden");
    showToast("Звіт сформовано", "info-msg");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Не вдалося сформувати звіт");
  } finally {
    els.exportBtn.disabled = false;
    els.exportBtn.innerHTML = originalHtml;
  }
};
const initMonthSelect = (onMonthChange) => {
  els.monthSelect.innerHTML = MONTHS.map(
    ({ value, name }) =>
      `<option value="${escapeHtml(value)}">${escapeHtml(name)}</option>`,
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
        <div class="student-number">${escapeHtml(i + 1)}</div>
        <div class="icon-box"><i class="bi bi-person"></i></div>
        <div class="full-name">${escapeHtml(stud.fullName)}</div>
      </div>`;
    els.studentContainer.insertAdjacentHTML("beforeend", html);
  });
};

const renderStatistics = (statistics) => {
  els.groupPasses.textContent = statistics.totalPasses;
  els.groupGrades.textContent = `${statistics.averageGrade}%`;
  renderChart(statistics.diagramData);
};

const cssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const renderChart = (dataArr) => {
  state.lastChartData = dataArr; // для перемальовування при зміні теми

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  // Перевіряємо, чи всі значення дорівнюють нулю
  const isEmpty = dataArr.every((val) => val === 0);

  const chartData = isEmpty ? [1] : dataArr;

  const bgColors = isEmpty
    ? [cssVar("--input-border")]
    : [
        cssVar("--chart-perfect"),
        cssVar("--chart-good"),
        cssVar("--chart-satisfactory"),
        cssVar("--chart-unsatisfactory"),
      ];
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
          borderColor: isEmpty ? "transparent" : cssVar("--card-bg"),
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
};
// Перемальовуємо діаграму, коли змінилась тема (кнопка або системна)
const rerenderOnThemeChange = () => {
  if (state.lastChartData) renderChart(state.lastChartData);
};
new MutationObserver(rerenderOnThemeChange).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", rerenderOnThemeChange);

// Беремо місяць з аргументу або прямо з селекта
const loadDashboardForGroup = async function (groupId, monthParam) {
  const year = new Date().getFullYear();
  const month = monthParam !== undefined ? monthParam : getSelectedMonth();

  showLoader();
  try {
    const student = await getCuratorStudents(groupId, year, month);

    state.currentSudents = student.students;
    renderStudentList(state.currentSudents);
    renderStatistics(student.statistics);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
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

  els.exportBtn.addEventListener("click", handleExport);

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
  renderLayout(localStorage.getItem("role"), localStorage.getItem("isCurator"));
  renderExit();
  initGlobal();

  initPeriodSelect();
  // Ініціалізуємо селект місяців
  // При його зміні перезавантажуємо дані для вибраної групи
  initMonthSelect((selectedMonth) => {
    if (els.select.value) {
      loadDashboardForGroup(els.select.value, selectedMonth);
    }
  });

  showLoader();
  try {
    const group = await getCuratorGroup();

    group.forEach((g) => {
      els.select.insertAdjacentHTML(
        "beforeend",
        `<option value="${escapeHtml(g.id)}">${escapeHtml(g.name)}</option>`,
      );
    });

    if (els.select.value) {
      loadDashboardForGroup(els.select.value);

      const selectedGroupName =
        els.select.options[els.select.selectedIndex].text;
      state.nameGroup = selectedGroupName;

      els.messageList.textContent = `Список студентів групи ${state.nameGroup}`;
      els.messageStatistic.textContent = `Статистика групи ${state.nameGroup}`;
    }

    setupEventListeners();
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
};

initApp();
