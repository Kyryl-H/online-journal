"use strict";

import {
  fetchGroups,
  fetchSchedule,
  fetchStudents,
  fetchGrades,
} from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

renderLayout();
renderExit();
initGlobal();

const state = {
  group: [],
  schedule: [],
  student: [],
  grades: [],
  date: new Date(),
  month: "",
};

// DOM елементи
const els = {
  lessonName: localStorage.getItem("lessonName"),
  groupId: localStorage.getItem("groupId"),
  selectGroup: document.querySelector(".select-group"),
  comeback: document.querySelector(".comeback"),
  monthContainer: document.querySelector(".month-container"),
  monthBtn: document.querySelectorAll(".monthbtn"),
  tbody: document.querySelector("tbody"),
  dateContainer: document.querySelector(".date-container"),
  searchInput: document.querySelector(".search-input"),
  monthfirst: document.querySelector(".monthbtn"),
  datePanel: document.querySelector(".date-panel"),
  insertColumRight: document.querySelector(".insert-colum-right"),
  btnCloseLessonModal: document.querySelector(".btn-close-lessonModal"),
  inputTopicLesson: document.querySelector(".input-topic-lesson"),
  insertTopicBtn: document.querySelector(".insert-topic"),
  modalOverlay: document.querySelector(".modal-overlay"),
};

// Рендеринг блока з місяцями
const renderMonthHeader = function () {
  state.month = state.date.getMonth();

  const currentGroup = state.group.filter((g) => g.id == els.groupId);
  els.selectGroup.textContent = `${els.lessonName} ${currentGroup[0].name}`;
  // Налаштування вибору місяця
  if (state.month === 6 || state.month === 7) {
    state.month = 8;
    els.monthfirst.classList.add("monthbtn-active");
  }
  // Добавляння поточнову місяцу статус активного
  const monthActiv = document.querySelector(`[data-number="${state.month}"]`);
  monthActiv.classList.add("monthbtn-active");
  // Навігація по місяцях
  els.monthContainer.onclick = function (e) {
    let target = e.target;
    if (!target.classList.contains("monthbtn")) return;
    state.month = Number(target.dataset.number);
    els.monthBtn.forEach((btn) => {
      btn.classList.remove("monthbtn-active");
    });
    target.classList.add("monthbtn-active");
    renderTable();
  };
};

// Рендеринг таблиці
const renderTable = function (searchQuery = "") {
  // Очищення вмісту таблиці
  els.dateContainer.innerHTML = "";
  els.tbody.innerHTML = "";
  // Обрахунок знаходження поточного місяця
  const years = state.date.getFullYear();
  const beginningOfTheMonth = new Date(years, state.month, 1);
  const endOfTheMonth = new Date(years, state.month + 1, 0);
  const currentmonth = state.schedule
    .filter(
      (elment) =>
        elment.group_id == els.groupId && elment.subject == els.lessonName,
    )
    .filter((elment) => {
      const [years, monthD, day] = elment.date.split("-");
      return (
        new Date(years, Number(monthD) - 1, day) >= beginningOfTheMonth &&
        new Date(years, Number(monthD) - 1, day) <= endOfTheMonth
      );
    });
  if (currentmonth.length === 0) {
    els.dateContainer.insertAdjacentHTML(
      "beforeend",
      `<tr><td id="date-null" class="date-null">У цьому місяці занять немає</td></tr>`,
    );
    return;
  }
  // Генерування дат в журналі
  els.dateContainer.insertAdjacentHTML(
    "beforeend",
    `<th class="sticky-corner">Учень/День</th>`,
  );
  currentmonth.forEach(function (lesson) {
    const [years, monthD, day] = lesson.date.split("-");
    const html = `<th>${day}/${monthD}</th>`;
    els.dateContainer.insertAdjacentHTML("beforeend", html);
  });
  // Генерування студентів поточної групи
  let studentByGroup = state.student.filter(
    (stud) => stud.group_id == els.groupId,
  );
  // Пошук студентів
  studentByGroup = studentByGroup.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  // Сортування студентів по алфавіту
  studentByGroup.sort((a, b) => a.full_name.localeCompare(b.full_name, "uk"));

  studentByGroup.forEach(function (student, i) {
    let html = `                <tr class="row">
                        <td><div>${i + 1}.${student.full_name}</div></td>
                      
      `;
    // Якщо є оцінка в базі інпут малюємо з оцінкою, немає малюємо пустий інпут
    currentmonth.forEach(function (lesson) {
      const gradesValue = state.grades.find(
        (stud) =>
          stud.student_id == student.id && stud.schedule_id == lesson.id,
      );
      if (gradesValue) {
        html += `<td><input type="text" class="grade-input" value="${gradesValue.value}"/></td>`;
      } else {
        html += `<td><input type="text" class="grade-input" /></td>`;
      }
    });
    html += "</tr>";
    els.tbody.insertAdjacentHTML("beforeend", html);
  });
};

// Пошук студентів
const initSearch = function () {
  els.searchInput.addEventListener("input", function () {
    renderTable(els.searchInput.value);
  });
};

// Контекстне меню дат
const showDatePanel = function (target) {
  const rect = target.getBoundingClientRect();

  els.datePanel.style.top = `${rect.bottom + 5}px`;
  els.datePanel.style.left = `${rect.left}px`;

  els.datePanel.classList.remove("hidden");
};

const hideDatePanel = function () {
  els.datePanel.classList.add("hidden");
};

const initDatePanel = function () {
  // Відкрити меню
  els.dateContainer.addEventListener("dblclick", function (e) {
    const target = e.target.closest("th");

    if (
      !target ||
      target.classList.contains("sticky-corner") ||
      target.classList.contains("date-null")
    )
      return;

    showDatePanel(target);
  });

  // Закрити при кліку поза меню
  document.addEventListener("click", function (e) {
    if (
      els.datePanel.contains(e.target) ||
      e.target.closest(".date-container th")
    )
      return;

    hideDatePanel();
  });

  // Закрити по Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideDatePanel();
  });
};

// Модальне вікно заняття
const showLessonModal = function () {
  els.modalOverlay.classList.remove("hidden");
};

const hideLessonModal = function () {
  els.modalOverlay.classList.add("hidden");
};

const initLessonModal = function () {
  // Відкрити
  els.insertTopicBtn.addEventListener("click", function () {
    hideDatePanel();
    showLessonModal();
  });

  // Закрити кнопкою
  els.btnCloseLessonModal.addEventListener("click", hideLessonModal);

  // Закрити по overlay
  els.modalOverlay.addEventListener("click", function (e) {
    if (e.target === els.modalOverlay) hideLessonModal();
  });

  // Закрити по Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideLessonModal();
  });
};

// Робота зі стовпцями
const initColumnActions = function () {
  els.insertColumRight.addEventListener("click", function () {
    hideDatePanel();

    els.dateContainer.insertAdjacentHTML("beforeend", "<th>Нове заняття</th>");

    document.querySelectorAll(".row").forEach(function (row) {
      row.insertAdjacentHTML(
        "beforeend",
        `<td><input type="text" class="grade-input"></td>`,
      );
    });
  });
};

// Перевірка введених оцінок
const initGradeValidation = function () {
  const currentLesson = state.schedule.find(
    (lesson) =>
      lesson.group_id == els.groupId && lesson.subject == els.lessonName,
  );

  document.addEventListener("input", function (e) {
    if (!e.target.classList.contains("grade-input")) return;

    const input = e.target;
    const value = input.value.trim();

    const valid =
      value === "" ||
      value === "н" ||
      value === "Н" ||
      (Number(value) >= 1 && Number(value) <= currentLesson.grading_system);

    if (valid) {
      input.classList.remove("input-values-error");
      return;
    }

    input.classList.add("input-values-error");

    setTimeout(function () {
      input.value = "";
      input.classList.remove("input-values-error");
    }, 1500);
  });
};

// Кнопка "Назад"
const initNavigation = function () {
  els.comeback.addEventListener("click", function () {
    window.location.href = "/html/teacher_html/journal-main.html";
  });
};

// ==========================
// Ініціалізація функціоналу сторінки
// ==========================
const moreFunctionality = function () {
  initSearch();
  initDatePanel();
  initLessonModal();
  initColumnActions();
  initGradeValidation();
  initNavigation();
};
const render = async function () {
  const [group, schedule, student, grades] = await Promise.all([
    fetchGroups(),
    fetchSchedule(),
    fetchStudents(),
    fetchGrades(),
  ]);

  state.group = group;
  state.schedule = schedule;
  state.student = student;
  state.grades = grades;

  renderMonthHeader();
  renderTable();
  moreFunctionality();
};

render();
