"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "../global.js";
import { showToast } from "../api.js";

const SORT_DESC = true; // true: нові оцінки зверху

const els = {
  average: document.querySelector(".summary-average"),
  count: document.querySelector(".summary-count"),
  miss: document.querySelector(".summary-miss"),
  tableWrap: document.querySelector(".journal-table-wrap"),
  tableBody: document.querySelector(".journal-table-body"),
  subject: document.querySelector(".filter-subject"),
  period: document.querySelector(".filter-period"),
  reset: document.querySelector(".filter-reset"),
  filterCount: document.querySelector(".filter-count"),
  modal: document.querySelector(".hw-modal"),
  mSubject: document.querySelector(".hw-subject"),
  mDate: document.querySelector(".hw-date-text"),
  mTopic: document.querySelector(".hw-topic"),
  mText: document.querySelector(".hw-text"),
};

let allGrades = []; // повний масив із бекенду, завантажується один раз
let visibleGrades = []; // те, що зараз у таблиці (для модалки)
let lastFocused = null;

const normalizeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const isMiss = (value) => String(value).trim().toLowerCase() === "н";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("uk-UA") : "—";

// Єдине місце, де поля бекенду мапляться на дані модалки
const getDetails = (grade) => ({
  subject: grade.subjectName || "Предмет",
  date: formatDate(grade.date),
  topic: (grade.topic || "").trim(),
  homework: (grade.homework || "").trim(),
});

const getStudentGrades = async () => {
  const response = await fetch("/api/student/grades", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Не вдалося завантажити журнал");
  }

  return (await response.json()).grades || [];
};

/*  Фільтри  */
const getPeriodStart = (period) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "week") {
    // понеділок поточного тижня, 00:00
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
  }
  if (period === "month") {
    // рівно місяць тому від сьогодні
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  return null; // "За весь час"
};

const fillSubjects = (grades) => {
  const subjects = [
    ...new Set(grades.map((g) => g.subjectName).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "uk"));

  els.subject.length = 1; // лишаємо тільки "Всі предмети"
  subjects.forEach((name) => {
    els.subject.add(new Option(name, name)); 
  });
};

const applyFilters = () => {
  const subject = els.subject.value;
  const periodStart = getPeriodStart(els.period.value);

  const filtered = allGrades.filter((grade) => {
    if (subject !== "all" && grade.subjectName !== subject) return false;
    if (periodStart) {
      if (!grade.date) return false;
      if (new Date(grade.date) < periodStart) return false;
    }
    return true;
  });

  renderSummary(filtered); // віджети рахуються за відфільтрованими даними
  renderTable(filtered);

  els.filterCount.textContent = `Показано ${filtered.length} з ${allGrades.length}`;
  els.reset.disabled = subject === "all" && els.period.value === "all";
  els.tableWrap.scrollTop = 0; // після зміни фільтра повертаємось до початку
};

const resetFilters = () => {
  els.subject.value = "all";
  els.period.value = "all";
  // нативний select змінено програмно: сповіщаємо кастомний select
  els.subject.dispatchEvent(new Event("change", { bubbles: true }));
};

/*  Рендер  */
const renderSummary = (grades) => {
  const validValues = grades
    .map((grade) => normalizeNumber(grade.value))
    .filter((value) => value !== null && value > 0);

  const totalMisses = grades.filter((grade) => isMiss(grade.value)).length;

  const average = validValues.length
    ? (
        validValues.reduce((sum, item) => sum + item, 0) / validValues.length
      ).toFixed(2)
    : "0.00";

  els.average.textContent = average;
  els.count.textContent = String(grades.length);
  els.miss.textContent = String(totalMisses);
};

const renderTable = (grades) => {
  if (!grades.length) {
    visibleGrades = [];
    const text = allGrades.length
      ? "За обраними фільтрами нічого не знайдено"
      : "Немає оцінок для відображення";
    els.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">${text}</td>
      </tr>
    `;
    return;
  }

  visibleGrades = grades.slice().sort((a, b) => {
    const diff = new Date(a.date || 0) - new Date(b.date || 0);
    return SORT_DESC ? -diff : diff;
  });

  els.tableBody.innerHTML = visibleGrades
    .map((grade, index) => {
      const { topic, homework } = getDetails(grade);
      const hasDetails = Boolean(topic || homework);

      return `
        <tr>
          <td>${escapeHtml(grade.subjectName || "—")}</td>
          <td>${escapeHtml(grade.teacherFullName || "—")}</td>
          <td>${escapeHtml(formatDate(grade.date))}</td>
          <td class="grade-cell ${isMiss(grade.value) ? "is-miss" : ""}">
            <span class="grade-chip">${escapeHtml(grade.value || "—")}</span>
          </td>
          <td>${escapeHtml(grade.room || "—")}</td>
          <td class="details-cell">
            <button
              type="button"
              class="hw-btn"
              data-index="${index}"
              ${hasDetails ? "" : "disabled"}
              title="${hasDetails ? "Тема та домашнє завдання" : "Немає даних"}"
              aria-label="Деталі заняття: ${escapeHtml(grade.subjectName || "")}"
            >
              <i class="bi bi-journal-text"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
};

/*  Модальне вікно  */
const setText = (el, text, placeholder) => {
  el.textContent = text || placeholder; 
  el.classList.toggle("is-empty", !text);
};

const openModal = (grade) => {
  const details = getDetails(grade);

  els.mSubject.textContent = details.subject;
  els.mDate.textContent = details.date;
  setText(els.mTopic, details.topic, "Тема не вказана");
  setText(els.mText, details.homework, "Домашнє завдання не задано");

  lastFocused = document.activeElement;
  els.modal.hidden = false;
  document.body.classList.add("modal-open");
  els.modal.querySelector(".hw-ok").focus();
};

const closeModal = () => {
  if (els.modal.hidden) return;
  els.modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocused?.focus?.();
};

const initModal = () => {
  els.tableBody.addEventListener("click", (event) => {
    const btn = event.target.closest(".hw-btn");
    if (!btn || btn.disabled) return;
    const grade = visibleGrades[Number(btn.dataset.index)];
    if (grade) openModal(grade);
  });

  els.modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-hw-close]")) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
};

const initFilters = () => {
  // перемальовування миттєво, без запитів до сервера
  els.subject.addEventListener("change", applyFilters);
  els.period.addEventListener("change", applyFilters);
  els.reset.addEventListener("click", resetFilters);
};

const render = async function () {
  try {
    showLoader();
    renderLayout("STUDENT", true);
    renderExit();
    initGlobal();
    initModal();
    initFilters();

    allGrades = await getStudentGrades();
    fillSubjects(allGrades);
    applyFilters(); // перший рендер: фільтри за замовчуванням
  } catch (err) {
    console.error(err);
    showToast(err.message || "Помилка завантаження журналу");
  } finally {
    hideLoader();
  }
};

render();
