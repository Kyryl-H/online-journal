"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";

const bla = new URLSearchParams(window.location.search);

const state = {
  groupId: bla.get("groupID"),
  lessonName: bla.get("lessonName"),
  path: bla.get("path"),

  schedule: [],
  student: [],
  grades: [],
  date: new Date(),
  month: "",
};
// DOM елемен
const els = {
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
const renderMonthHeader = function (lessonName, groupName) {
  state.month = state.date.getMonth();

  els.selectGroup.textContent = `${lessonName} ${groupName}`;
  // Налаштування вибору місяця
  if (state.month === 6 || state.month === 7) {
    state.month = 8;
    els.monthfirst.classList.add("monthbtn-active");
  }
  // Добавляння поточнову місяцу статус активного
  const monthActiv = document.querySelector(`[data-number="${state.month}"]`);
  monthActiv.classList.add("monthbtn-active");
  // Навігація по місяцях
  els.monthContainer.onclick = async function (e) {
    let target = e.target;
    if (!target.classList.contains("monthbtn")) return;
    state.month = Number(target.dataset.number);
    els.monthBtn.forEach((btn) => {
      btn.classList.remove("monthbtn-active");
    });
    target.classList.add("monthbtn-active");
    // const respons = fetch(
    //   `/api/journal?groupId=${state.groupId}&lessonName=${state.lessonName}&month=${state.month}`,
    // );
    // const data = await respons.json();
    // state.schedule = data.lesson;
    // state.grades = data.grades;
    renderTable();
  };
};

// Рендеринг таблиці
const renderTable = function (searchQuery = "") {
  // Очищення вмісту таблиці
  els.dateContainer.innerHTML = "";
  els.tbody.innerHTML = "";
  // Обрахунок знаходження поточного місяця
  if (state.schedule.length === 0) {
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
  state.schedule.forEach(function (lesson) {
    const [years, monthD, day] = lesson.date.split("-");
    const html = `<th>${day}/${monthD}</th>`;
    els.dateContainer.insertAdjacentHTML("beforeend", html);
  });
  // Пошук студентів
  const filterStudent = state.student.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  filterStudent.forEach(function (student, i) {
    let html = `                <tr class="row">
                        <td><div>${i + 1}.${student.fullName}</div></td>
                      
      `;
    // Якщо є оцінка в базі інпут малюємо з оцінкою, немає малюємо пустий інпут
    state.schedule.forEach(function (lesson) {
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
  document.addEventListener("input", function (e) {
    if (!e.target.classList.contains("grade-input")) return;

    const input = e.target;
    const value = input.value.trim();

    const valid =
      value === "" ||
      value === "н" ||
      value === "Н" ||
      (Number(value) >= 1 && Number(value) <= state.schedule[0].grading_system);

    if (!valid) {
      input.classList.add("input-values-error");
    } else {
      input.classList.remove("input-values-error");
    }
  });
};

// Кнопка "Назад"
const initNavigation = function () {
  els.comeback.addEventListener("click", function () {
    window.location.href = `${state.path}`;
  });
};

// Ініціалізація функціоналу сторінки
const moreFunctionality = function () {
  initSearch();
  initDatePanel();
  initLessonModal();
  initColumnActions();
  initGradeValidation();
  initNavigation();
};
const render = async function () {
  const path = window.location.pathname;
  const currentRole = path.includes("teacher") ? "teacher" : "student";
  renderLayout(currentRole, true);
  renderExit();
  initGlobal();

  const mockData = {
    lessonName: "Алгоритми та структура даних",
    nameGroup: "П-13",
    lesson: [
      {
        id: 101,
        date: "2026-07-31",
        subject: "Основи програмування",
        grading_system: 5,
      },
    ],
    student: [{ id: 1, fullName: "Годлевський Кирил Васильович" }],
    grades: [
      { id: 501, student_id: 1, schedule_id: 101, value: "5" },
      { id: 502, student_id: 2, schedule_id: 101, value: "4" },
      { id: 503, student_id: 3, schedule_id: 101, value: "н" },
      { id: 504, student_id: 4, schedule_id: 101, value: "5" },
      { id: 505, student_id: 5, schedule_id: 101, value: "3" },
      { id: 506, student_id: 6, schedule_id: 101, value: "4" },
      { id: 507, student_id: 1, schedule_id: 102, value: "5" },
      { id: 508, student_id: 2, schedule_id: 102, value: "5" },
      { id: 509, student_id: 3, schedule_id: 102, value: "4" },
      { id: 510, student_id: 7, schedule_id: 102, value: "5" },
      { id: 511, student_id: 8, schedule_id: 102, value: "н" },
    ],
  };

  state.schedule = mockData.lesson;
  state.student = mockData.student;
  state.grades = mockData.grades;

  renderMonthHeader(mockData.lessonName, mockData.nameGroup);
  renderTable();
  moreFunctionality();
};

render();
