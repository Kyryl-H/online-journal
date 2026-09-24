"use strict";
import { renderLayout, renderLessonCard, renderExit } from "./components.js";
import { initGlobal } from "./global.js";
import { fetchScheduleForDay } from "./api.js";

const els = {
  greeting: document.querySelector(".greeting"),
  labelDate: document.querySelector(".date"),
  scheduleGrid: document.querySelector(".schedule-grid"),
};

const currentPath = window.location.pathname;
const currentRole = currentPath.includes("teacher") ? "teacher" : "student";
// Дата
const renderHeader = function (fullName) {
  els.greeting.textContent = `Вітаю, ${fullName}`;

  const today = new Date();
  const days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П'ятниця",
    "Субота",
  ];
  const weekday = days[today.getDay()];
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  els.labelDate.textContent = `${weekday}, ${day}.${month}.${year}`;
};

const initTeacherPage = async function () {
  const data = await fetchScheduleForDay();
  //     : {
  //         role: "student",
  //         isCurator: false,
  //         fullName: "Годлевський Кирил",
  //         schedule: [
  //           {
  //             time: "8:30-9:50",
  //             subject: "Основи програмування",
  //             room: "403",
  //             teacherName: "Дашкевич В.",
  //           },
  //         ],
  //       };
  if (!data) {
    renderLayout(currentRole, false);
    renderExit();
    initGlobal();

    els.greeting.textContent = "Помилка завантаження даних";
    return;
  }
  renderLayout(data.role, data.isCurator);
  renderExit();
  initGlobal();

  renderHeader(data.fullName);
  if (data.schedule.length !== 0) {
    data.schedule.forEach((lesson) => {
      renderLessonCard(lesson, data.role, els.scheduleGrid);
    });
  } else {
    const html = `<div class="schedule-card"><h1 >${data.message}</h1></div>`;
    els.scheduleGrid.insertAdjacentHTML("afterbegin", html);
  }
};

initTeacherPage();
