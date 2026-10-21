"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "./global.js";
import { getGroup, getSchedule, getMySchedule, showToast } from "./api.js";

const MAX_WEEK_OFFSET = 4;

const EMPTY_CARD = `
  <div class="lesson-card lesson-card--empty">
    <div class="empty-info">
      <i class="bi bi-cup-hot"></i>
      <p>Пари відсутні</p>
    </div>
  </div>
`;

const role = (localStorage.getItem("role") || "STUDENT").toUpperCase();

const state = {
  role,
  // "my"    — усі пари викладача (у картці показуємо групу)
  // "group" — розклад вибраної групи (у картці показуємо викладача)
  mode: role === "STUDENT" ? "group" : "my",
  weekOffset: 0,
  groups: [],
  myGroupId: null,
  selectedGroupId: null,
};

const els = {
  groupSelect: document.querySelector(".group-select"),
  groupSelector: document.querySelector(".group-selector"),
  lessonContainers: document.querySelectorAll(".lesson-container"),
  comebackBtn: document.querySelector(".comeback"),
  nextBtn: document.querySelector(".next"),
  weekLabel: document.querySelector(".current-week"),
  tabs: document.querySelectorAll(".tab-btn"),
};

//  Дати

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatShort = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;

const getWeekRange = function (offset) {
  const monday = new Date();
  const daysFromMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysFromMonday + offset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
};

// "YYYY-MM-DD" розбираємо як локальну дату, щоб уникнути зсуву через UTC
const parseLessonDate = function (value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
};

// Понеділок = 1 ... Неділя = 7
const getWeekday = (value) => ((parseLessonDate(value).getDay() + 6) % 7) + 1;

//  Рендер

const updateControls = function () {
  const { monday, sunday } = getWeekRange(state.weekOffset);

  els.nextBtn?.classList.toggle("none", state.weekOffset >= MAX_WEEK_OFFSET);
  els.comebackBtn?.classList.toggle(
    "none",
    state.weekOffset <= -MAX_WEEK_OFFSET,
  );
  els.groupSelector?.classList.toggle("none", state.mode === "my");
  els.tabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.mode === state.mode),
  );

  if (els.weekLabel) {
    els.weekLabel.textContent =
      state.weekOffset === 0
        ? "Поточний"
        : `${formatShort(monday)} – ${formatShort(sunday)}`;
  }
};

const renderGroupOptions = function () {
  if (!els.groupSelect) return;

  if (!state.groups.length) {
    els.groupSelect.replaceChildren(new Option("Немає груп", ""));
    return;
  }

  els.groupSelect.replaceChildren(
    ...state.groups.map(
      (group) =>
        new Option(
          group.name || "Група",
          group.id,
          false,
          Number(group.id) === state.selectedGroupId,
        ),
    ),
  );
};

const groupByWeekday = function (lessons) {
  const byDay = new Map([1, 2, 3, 4, 5].map((day) => [day, []]));

  lessons.forEach((lesson) => {
    byDay.get(getWeekday(lesson.date))?.push(lesson);
  });
  byDay.forEach((list) => list.sort((a, b) => a.lessonNumber - b.lessonNumber));

  return byDay;
};

const renderLesson = function (lesson) {
  const secondary =
    state.mode === "my" ? lesson.groupName : lesson.teacherFullName;

  return `
    <div class="lesson-card">
      <div class="lesson-number">${escapeHtml(String(lesson.lessonNumber ?? ""))}</div>
      <div class="lesson-info">
        <div class="lesson-name">${escapeHtml(lesson.subjectName || "—")}</div>
        <div class="lesson-teacher">${escapeHtml(secondary || "—")}</div>
      </div>
      <div class="lesson-room">${escapeHtml(lesson.room || "—")}</div>
    </div>
  `;
};

const renderSchedule = function (lessons) {
  const byDay = groupByWeekday(lessons);

  els.lessonContainers.forEach((container) => {
    const dayLessons = byDay.get(Number(container.dataset.day)) ?? [];
    container.innerHTML = dayLessons.length
      ? dayLessons.map(renderLesson).join("")
      : EMPTY_CARD;
  });
};

//  Дані

// Повертає масив пар або null, якщо api.js уже показав помилку
const fetchLessons = async function () {
  const { monday, sunday } = getWeekRange(state.weekOffset);
  const start = formatDate(monday);
  const end = formatDate(sunday);

  let lessons;
  if (state.mode === "my") {
    lessons = await getMySchedule(start, end);
  } else if (state.selectedGroupId) {
    lessons = await getSchedule(state.selectedGroupId, start, end);
  } else {
    return [];
  }

  return Array.isArray(lessons) ? lessons : null;
};

// Захист від гонки: показуємо лише відповідь на останній запит
let lastRequestId = 0;

const loadSchedule = async function () {
  const requestId = ++lastRequestId;
  const lessons = await fetchLessons();

  if (requestId !== lastRequestId || lessons === null) return;
  renderSchedule(lessons);
};

const initGroups = async function () {
  const data = await getGroup();
  if (!data) return;

  state.groups = Array.isArray(data.group) ? data.group : [];
  state.myGroupId = data.myGroup ? Number(data.myGroup.id) : null;
  state.selectedGroupId =
    state.myGroupId ??
    (state.groups.length ? Number(state.groups[0].id) : null);

  renderGroupOptions();
};

//  Керування

const withLoader = async function (task) {
  showLoader();
  try {
    await task();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Помилка завантаження даних");
  } finally {
    hideLoader();
  }
};

const refresh = function () {
  updateControls();
  return withLoader(loadSchedule);
};

const shiftWeek = function (delta) {
  const next = state.weekOffset + delta;
  if (Math.abs(next) > MAX_WEEK_OFFSET) return;

  state.weekOffset = next;
  refresh();
};

const setupEventListeners = function () {
  els.groupSelect?.addEventListener("change", () => {
    state.selectedGroupId = Number(els.groupSelect.value) || null;
    refresh();
  });

  els.nextBtn?.addEventListener("click", () => shiftWeek(1));
  els.comebackBtn?.addEventListener("click", () => shiftWeek(-1));

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.mode;
      if (!mode || mode === state.mode) return;

      state.mode = mode;
      refresh();
    });
  });
};

const init = function () {
  return withLoader(async () => {
    renderLayout(state.role, localStorage.getItem("isCurator"));
    renderExit();
    initGlobal();

    setupEventListeners();
    updateControls();

    await initGroups();
    await loadSchedule();
  });
};

init();
