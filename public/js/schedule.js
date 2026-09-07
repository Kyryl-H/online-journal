"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

const currentPath = window.location.pathname;
const currentRole = currentPath.includes("teacher") ? "teacher" : "student";
const state = {
  date: new Date(),
  monday: "",
  sunday: "",
  count: 0,
  groupListLesson: new Map(),
};

const els = {
  groupSelect: document.querySelector(".group-select"),
  lessonContainer: document.querySelectorAll(".lesson-container"),
  comebackBtn: document.querySelector(".comeback"),
  nextBtn: document.querySelector(".next"),
};

// Селект вибору груп
// Генерація груп в селекті
const renderGroupSelect = function (groups) {
  groups.forEach(function (g) {
    const html = `<option value="${g.id}">${g.name}</option>`;
    els.groupSelect.insertAdjacentHTML("beforeend", html);
  });
};
// Передача вибраної групи на рендеринг
const setupEventListeners = function () {
  els.groupSelect.addEventListener("change", async function (e) {
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
    const groupId = e.target.value;
    const weekSchedule = await fetchWeekSchedule(
      groupId,
      state.monday,
      state.sunday,
    );
    const groupedData = renderWeek(weekSchedule);
    renderSchedule(groupedData);
  });
};

const fetchWeekSchedule = async function (groupId, mon, sun) {
  const start = mon.toISOString().split("T")[0];
  const end = sun.toISOString().split("T")[0];

  // const response = await fetch(`/api/schedule?groupId=${groupId}&start=${start}&end=${end}`);
  // const data = await response.json();

  return [
    {
      id: 101,
      date: "2026-09-08",
      subject: "Основи програмування",
      lesson_number: 2,
      room: "306",
      teacherName: "Дашкевич В.В.",
    },
    {
      id: 102,
      date: "2026-09-09",
      subject: "Алгоритми",
      lesson_number: 1,
      room: "413",
      teacherName: "Дашкевич В.В.",
    },
  ];
};

// Всі пари на поточний тиждень
const renderWeek = function (fetchWeekSchedule) {
  // Групуємо пари по днях тижнів
  state.groupListLesson.set(1, []);
  state.groupListLesson.set(2, []);
  state.groupListLesson.set(3, []);
  state.groupListLesson.set(4, []);
  state.groupListLesson.set(5, []);

  fetchWeekSchedule.forEach(function (lesson) {
    const dayOfWeek = new Date(lesson.date).getDay();
    if (state.groupListLesson.has(dayOfWeek)) {
      state.groupListLesson.get(dayOfWeek).push(lesson);
    }
  });

  return state.groupListLesson;
};

// Генерація розкладу
const renderSchedule = function (groupListLesson) {
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
        const html = `
                      <div class="lesson-card">
                  <div class="lesson-number">${les.lesson_number}</div>

                  <div class="lesson-info">
                    <div class="lesson-name">${les.subject}</div>
                    <div class="lesson-teacher">${les.teacherName}. </div>
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

  els.nextBtn.addEventListener("click", async function () {
    if (state.count < 4) {
      state.count++;
      state.monday.setDate(state.monday.getDate() + 7);
      state.sunday.setDate(state.sunday.getDate() + 7);

      const weekSchedule = await fetchWeekSchedule(
        els.groupSelect.value,
        state.monday,
        state.sunday,
      );
      const groupedData = renderWeek(weekSchedule);
      renderSchedule(groupedData);
      checkButtons();
    }
  });

  els.comebackBtn.addEventListener("click", async function () {
    if (state.count > -4) {
      state.count--;
      state.monday.setDate(state.monday.getDate() - 7);
      state.sunday.setDate(state.sunday.getDate() - 7);

      const weekSchedule = await fetchWeekSchedule(
        els.groupSelect.value,
        state.monday,
        state.sunday,
      );
      const groupedData = renderWeek(weekSchedule);
      renderSchedule(groupedData);
      checkButtons();
    }
  });
};
const render = async function () {
  renderLayout(currentRole, true);
  renderExit();
  initGlobal();

  // const groupRespons = await fetch("/api/group");
  // const groups = await groupRespons.json();
  const mockGroups = [
    { id: 1, name: "П-13" },
    { id: 2, name: "К-49" },
    { id: 3, name: "С-15" },
  ];
  const mockScheduleResponse = [
    {
      id: 101,
      date: "2026-09-08",
      subject: "Основи програмування",
      lesson_number: 2,
      room: "306",
      teacherName: "Дашкевич В.В.",
    },
    {
      id: 102,
      date: "2026-09-09",
      subject: "Алгоритми та структури даних",
      lesson_number: 1,
      room: "413",
      teacherName: "Дашкевич В.В.",
    },
  ];
  const dayNumber = state.date.getDay();
  const currentDay = dayNumber === 0 ? 7 : dayNumber;

  // Понеділок поточного тижня
  state.monday = new Date(state.date);
  state.monday.setDate(state.monday.getDate() - (currentDay - 1));

  // Неділя поточного тижня
  state.sunday = new Date(state.monday);
  state.sunday.setDate(state.sunday.getDate() + 6);

  renderGroupSelect(mockGroups);
  setupEventListeners();
  const initialSchedule = await fetchWeekSchedule(
    els.groupSelect.value,
    state.monday,
    state.sunday,
  );
  const initialGroupedData = renderWeek(initialSchedule);
  renderSchedule(initialGroupedData);
  weeksBtn();
};
render();
