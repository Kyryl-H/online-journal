"use strict";
import { renderLayout, renderLessonCard, renderExit } from "./components.js";
import { initGlobal } from "./global.js";
import { fetchScheduleForDay, getMessage } from "./api.js";

const els = {
  greeting: document.querySelector(".greeting"),
  labelDate: document.querySelector(".date"),
  scheduleGrid: document.querySelector(".schedule-grid"),
  messageContainer: document.querySelector(".message-container"),
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

  const message = await getMessage();
  if (message.message !== 0) {
    message.message.forEach(function (l) {
      const html = `
  <div class="notice">
    <i class="bi bi-exclamation-circle-fill notice-icon"></i>
    <h3 class="notice-text">У вас не заповнений журнал за ${l.date.split("T")[0]} у групи ${l.subject.group.name}</h3>
    <button class="btn-primary notice-btn" data-groupId=${l.subject.group.id} data-lessonName='${l.subject.name}' data-date=${l.date.split("T")[0]} data-scheduleId=${l.id}>Перейти</button>
  </div>`;
      els.messageContainer.insertAdjacentHTML("beforeend", html);
    });
  }

  const path = window.location.pathname;

  els.messageContainer.addEventListener("click", function (e) {
    console.log(e.target);
    const btn = e.target.closest(".notice-btn");
    if (!btn) return;
    window.location.href = `/teacher/teacher-journal.html?groupId=${btn.dataset.groupid}&lessonName=${btn.dataset.lessonname}&path=${path}&data=${btn.dataset.date}&scheduleId=${btn.dataset.scheduleid}`;
  });
};

initTeacherPage();
