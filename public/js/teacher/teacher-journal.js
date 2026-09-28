"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";
import { fetchJournalData, postGrades, showToast } from "../api.js";

const urlParams = new URLSearchParams(window.location.search);

const state = {
  groupId: urlParams.get("groupId"),
  lessonName: urlParams.get("lessonName"),
  path: urlParams.get("path"),
  newGrades: [],

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
  saveData: document.querySelector(".saveData"),
  printOutbtn: document.querySelector(".print-outbtn"),
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
    // Потрібно оптимізувати
    const data = await fetchJournalData(
      state.groupId,
      state.lessonName,
      state.month,
      true,
    );
    if (data) {
      state.schedule = data.schedule;
      state.grades = data.grades;

      els.monthBtn.forEach((btn) => {
        btn.classList.remove("monthbtn-active");
      });

      target.classList.add("monthbtn-active");
      renderTable(els.searchInput.value);
    } else {
      return;
    }
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
    const d = new Date(lesson.date);
    const day = String(d.getDate()).padStart(2, "0");
    const monthD = String(d.getMonth() + 1).padStart(2, "0");

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
        (grade) =>
          grade.studentId == student.id && grade.scheduleId == lesson.id,
      );
      if (gradesValue) {
        html += `<td><input type="text" class="grade-input" data-studentId=${student.id} data-scheduleId = ${lesson.id} value="${gradesValue.value}"/></td>`;
      } else {
        html += `<td><input type="text" class="grade-input" data-studentId=${student.id} data-scheduleId = ${lesson.id} /></td>`;
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
  document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("grade-input")) return;

    const input = e.target;
    const value = input.value.trim();

    const valid =
      value === "" ||
      value === "н" ||
      value === "Н" ||
      (Number(value) >= 1 && Number(value) <= state.subject.gradingSystem);

    if (!valid) {
      input.classList.add("input-values-error");
    } else {
      input.classList.remove("input-values-error");
    }

    if (els.tbody.querySelector(".input-values-error")) {
      els.saveData.disabled = true;
    } else {
      els.saveData.disabled = false;
    }

    if (valid) {
      if (
        state.newGrades.find(
          (v) =>
            v.studentId === input.dataset.studentid &&
            v.scheduleId === input.dataset.scheduleid,
        )
      ) {
        const i = state.newGrades.findIndex(
          (v) =>
            v.studentId === input.dataset.studentid &&
            v.scheduleId === input.dataset.scheduleid,
        );
        state.newGrades[i].value = value;
      } else {
        state.newGrades.push({
          value: `${value}`,
          studentId: input.dataset.studentid,
          scheduleId: input.dataset.scheduleid,
        });
        console.log(state.newGrades);
      }
    }
  });
};
// Відправка оцінок в БД
els.saveData.addEventListener("click", async function () {
  try {
    const gradesPush = await postGrades(state.newGrades);
    state.newGrades = [];
    showToast(gradesPush.message, "info-msg");
  } catch (err) {
    console.error("Помилка при збереженні:", err);
  }
});
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
  if (!state.groupId || !state.lessonName) {
    console.error("Помилка: не передано параметри групи");
    window.location.href = "/teacher/journal-main.html";
    return;
  }

  const data = await fetchJournalData(
    state.groupId,
    state.lessonName,
    state.date.getMonth(),
  );

  if (!data) {
    console.log("Помилка завантаження даних");
    window.location.href = "/teacher/journal-main.html";
  }

  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  state.schedule = data.schedule;
  state.student = data.student;
  state.grades = data.grades;
  state.subject = data.subject;

  renderMonthHeader(state.subject.name, data.subject.group.name);
  renderTable();
  moreFunctionality();
};

render();
