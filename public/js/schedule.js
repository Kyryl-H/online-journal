"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";
import { getGroup, getSchedule, getMySchedule } from "./api.js";

const state = {
  date: new Date(),
  monday: "",
  sunday: "",
  count: 0,
  mode: "my", // "my" - мій розклад, "group" - розклад групи
  groupListLesson: new Map(),
};

const els = {
  groupSelect: document.querySelector(".group-select"),
  groupSelector: document.querySelector(".group-selector"),
  lessonContainer: document.querySelectorAll(".lesson-container"),
  comebackBtn: document.querySelector(".comeback"),
  nextBtn: document.querySelector(".next"),
  tabs: document.querySelectorAll(".tab-btn"),
};

// ---------- Допоміжні функції ----------

// Формат YYYY-MM-DD за локальним часом
const formatDate = function (d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Показ / ховання кнопок переходу по тижнях на межах
const checkButtons = function () {
  els.nextBtn.classList.toggle("none", state.count >= 4);
  els.comebackBtn.classList.toggle("none", state.count <= -4);
};

// Скидання на поточний тиждень
const resetWeek = function () {
  const dayNumber = state.date.getDay();
  const currentDay = dayNumber === 0 ? 7 : dayNumber;

  // Понеділок поточного тижня
  state.monday = new Date(state.date);
  state.monday.setDate(state.monday.getDate() - (currentDay - 1));

  // Неділя поточного тижня
  state.sunday = new Date(state.monday);
  state.sunday.setDate(state.sunday.getDate() + 6);

  state.count = 0;
  checkButtons();
};

//  Селект груп

const renderGroupSelect = function (groups) {
  groups.forEach(function (g) {
    const html = `<option value="${g.id}">${g.name}</option>`;
    els.groupSelect.insertAdjacentHTML("beforeend", html);
  });
};

//  Групування та рендер розкладу

// Групуємо пари по днях тижня
const renderWeek = function (weekSchedule) {
  state.groupListLesson.set(1, []);
  state.groupListLesson.set(2, []);
  state.groupListLesson.set(3, []);
  state.groupListLesson.set(4, []);
  state.groupListLesson.set(5, []);

  weekSchedule.forEach(function (lesson) {
    const dayOfWeek = new Date(lesson.date).getDay();
    if (state.groupListLesson.has(dayOfWeek)) {
      state.groupListLesson.get(dayOfWeek).push(lesson);
    }
  });

  return state.groupListLesson;
};

// Вставляємо пари у відповідні блоки днів
const renderSchedule = function (groupListLesson) {
  els.lessonContainer.forEach(function (container) {
    container.innerHTML = "";
  });

  groupListLesson.forEach(function (lessonsList, dayNumber) {
    const dayBlock = document.querySelector(`[data-day="${dayNumber}"]`);
    if (!dayBlock) return;

    // Якщо пар немає - пишемо про це, інакше вставляємо пари
    if (lessonsList.length === 0) {
      const html = `
        <div class="lesson-card lesson-card--empty">
          <div class="empty-info">
            <i class="bi bi-cup-hot"></i>
            <p>Пари відсутні</p>
          </div>
        </div>
      `;
      dayBlock.insertAdjacentHTML("beforeend", html);
    } else {
      lessonsList.forEach(function (les) {
        // У "Мій розклад" показуємо групу, у розкладі групи - викладача
        const secondLine =
          state.mode === "my" ? les.groupName : `${les.teacherFullName}.`;

        const html = `
          <div class="lesson-card">
            <div class="lesson-number">${les.lessonNumber}</div>

            <div class="lesson-info">
              <div class="lesson-name">${les.subjectName}</div>
              <div class="lesson-teacher">${secondLine}</div>
            </div>

            <div class="lesson-room">${les.room}</div>
          </div>
        `;
        dayBlock.insertAdjacentHTML("beforeend", html);
      });
    }
  });
};

//  Завантаження розкладу

const loadSchedule = async function () {
  const start = formatDate(state.monday);
  const end = formatDate(state.sunday);

  let data;
  if (state.mode === "my") {
    data = await getMySchedule(start, end);
  } else {
    if (!els.groupSelect.value) return;
    data = await getSchedule(els.groupSelect.value, start, end);
  }

  if (!Array.isArray(data)) return;

  const groupedData = renderWeek(data);
  renderSchedule(groupedData);
};

//  Перемикання режимів

const setMode = function (mode) {
  state.mode = mode;

  els.tabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  // У режимі "Мій розклад" селект груп не потрібен
  els.groupSelector.classList.toggle("none", mode === "my");

  resetWeek();
  loadSchedule();
};

//  Події

const setupEventListeners = function () {
  // Вкладки "Мій розклад" / "Розклад групи"
  els.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setMode(tab.dataset.mode);
    });
  });

  // Вибір іншої групи
  els.groupSelect.addEventListener("change", function () {
    resetWeek();
    loadSchedule();
  });
};

// Перехід на інший тиждень
const shiftWeek = async function (delta) {
  const next = state.count + delta;
  if (next > 4 || next < -4) return;

  state.count = next;
  state.monday.setDate(state.monday.getDate() + delta * 7);
  state.sunday.setDate(state.sunday.getDate() + delta * 7);

  checkButtons();
  await loadSchedule();
};

const weeksBtn = function () {
  els.nextBtn.addEventListener("click", function () {
    shiftWeek(1);
  });
  els.comebackBtn.addEventListener("click", function () {
    shiftWeek(-1);
  });
};

//  Старт

const render = async function () {
  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  const groups = await getGroup();
  renderGroupSelect(groups.group);

  setupEventListeners();
  weeksBtn();

  setMode("my");
};

render();
