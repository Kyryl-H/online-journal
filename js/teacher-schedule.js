"use strict";

import { fetchGroups, fetchSchedule, fetchTeachers } from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

renderLayout();
renderExit();
initGlobal();

const state = {
  group: [],
  schedule: [],
  teacher: [],
  date: new Date(),
  monday: "",
  sunday: "",
  groupListLesson: new Map(),
  currentSchedule: [],
  count: 0,
};

const els = {
  groupSelect: document.querySelector(".group-select"),
  lessonContainer: document.querySelectorAll(".lesson-container"),
  comebackBtn: document.querySelector(".comeback"),
  nextBtn: document.querySelector(".next"),
};

// Селект вибору груп
// Генерація груп в селекті
const renderGroupSelect = function () {
  state.group.forEach(function (g) {
    const html = `<option value="${g.id}">${g.name}</option>`;
    els.groupSelect.insertAdjacentHTML("beforeend", html);
  });
};
// Передача вибраної групи на рендеринг
// Передача вибраної групи на рендеринг
const setupEventListeners = function () {
  els.groupSelect.addEventListener("change", function (e) {
    // Вираховуємо поточний понеділок та неділю від базової дати
    const dayNumber = state.date.getDay();
    const currentDay = dayNumber === 0 ? 7 : dayNumber;

    state.monday = new Date(state.date);
    state.monday.setDate(state.monday.getDate() - (currentDay - 1));

    state.sunday = new Date(state.monday);
    state.sunday.setDate(state.sunday.getDate() + 6);

    // Скидаємо лічильник тижнів
    state.count = 0;

    // Повертаємо кнопки, якщо вони були сховані на лімітах
    els.nextBtn.classList.remove("none");
    els.comebackBtn.classList.remove("none");

    // Генеруємо розклад для нової групи
    renderWeek(e.target.value, state.monday, state.sunday);
    renderSchedule();
  });
};

// Всі пари на поточний тиждень
const renderWeek = function (group, mon, sun) {
  state.currentSchedule = state.schedule.filter(
    (el) =>
      el.group_id == group &&
      new Date(el.date) >= mon &&
      new Date(el.date) <= sun,
  );
  // Групуємо пари по днях тижнів
  state.groupListLesson.set(1, []);
  state.groupListLesson.set(2, []);
  state.groupListLesson.set(3, []);
  state.groupListLesson.set(4, []);
  state.groupListLesson.set(5, []);

  state.currentSchedule.forEach(function (d) {
    const dayOfWeek = new Date(d.date).getDay();
    if (state.groupListLesson.has(dayOfWeek)) {
      state.groupListLesson.get(dayOfWeek).push(d);
    }
  });

  // Сортуємо порядок пар кожного дня
  state.groupListLesson.forEach(function (day) {
    day.sort((a, b) => a.lesson_number - b.lesson_number);
  });
};

// Генерація розкладу
const renderSchedule = function () {
  // Вставляємо пари у відповідні блоки
  if (els.lessonContainer) {
    els.lessonContainer.forEach(function (container) {
      container.innerHTML = "";
    });
  }

  state.groupListLesson.forEach(function (lessonsList, dayNumber) {
    const dayBlock = document.querySelector(`[data-day="${dayNumber}"]`);
    // Якщо пустий пишемо про відсутність пар, інакше вставляємо пари
    if (lessonsList.length === 0) {
      const html = `<div class="lesson-card lesson-card--empty">
                      <div class="empty-info">
                        <i class="bi bi-cup-hot"></i>
                        <p>Пари відсутні</p>
                      </div>
                    </div>
`;
      dayBlock.insertAdjacentHTML("beforeend", html);
    } else {
      lessonsList.forEach(function (les) {
        const [currentTeacher] = state.teacher.filter(
          (t) => t.id == les.teacher_id,
        );
        const teacherName = currentTeacher.full_name.split(" ");

        const html = `
                      <div class="lesson-card">
                  <div class="lesson-number">${les.lesson_number}</div>

                  <div class="lesson-info">
                    <div class="lesson-name">${les.subject}</div>
                    <div class="lesson-teacher">${teacherName[0]} ${teacherName[1][0]}.${teacherName[2][0]}. </div>
                  </div>

                  <div class="lesson-room">${les.room}</div>
                </div>
`;
        dayBlock.insertAdjacentHTML("beforeend", html);
      });
    }
  });
};

const weeksBtn = function () {
  // Ховання та показування кнопок
  const checkButtons = function () {
    if (state.count === 4) {
      els.nextBtn.classList.add("none");
    } else {
      els.nextBtn.classList.remove("none");
    }

    if (state.count === -4) {
      els.comebackBtn.classList.add("none");
    } else {
      els.comebackBtn.classList.remove("none");
    }
  };

  checkButtons();

  els.nextBtn.addEventListener("click", function () {
    if (state.count < 4) {
      state.count++;
      state.monday.setDate(state.monday.getDate() + 7);
      state.sunday.setDate(state.sunday.getDate() + 7);

      renderWeek(els.groupSelect.value, state.monday, state.sunday);
      renderSchedule();

      checkButtons();
    }
  });

  els.comebackBtn.addEventListener("click", function () {
    if (state.count > -4) {
      state.count--;
      state.monday.setDate(state.monday.getDate() - 7);
      state.sunday.setDate(state.sunday.getDate() - 7);

      renderWeek(els.groupSelect.value, state.monday, state.sunday);
      renderSchedule();

      checkButtons();
    }
  });
};
const render = async function () {
  const [group, schedule, teacher] = await Promise.all([
    fetchGroups(),
    fetchSchedule(),
    fetchTeachers(),
  ]);

  state.group = group;
  state.schedule = schedule;
  state.teacher = teacher;

  const dayNumber = state.date.getDay();
  const currentDay = dayNumber === 0 ? 7 : dayNumber;

  // Понеділок поточного тижня
  state.monday = new Date(state.date);
  state.monday.setDate(state.monday.getDate() - (currentDay - 1));

  // Неділя поточного тижня
  state.sunday = new Date(state.monday);
  state.sunday.setDate(state.sunday.getDate() + 6);

  renderGroupSelect();
  setupEventListeners();
  renderWeek(els.groupSelect.value, state.monday, state.sunday);
  renderSchedule();
  weeksBtn();
};
render();
