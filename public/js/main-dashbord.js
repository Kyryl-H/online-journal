"use strict";
import { renderLayout, renderLessonCard, renderExit } from "./components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "./global.js";
import { fetchScheduleForDay, getMessage, showToast } from "./api.js";

const els = {
  greeting: document.querySelector(".greeting"),
  labelDate: document.querySelector(".date"),
  scheduleGrid: document.querySelector(".schedule-grid"),
  messageContainer: document.querySelector(".message-container"),
};

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
  try {
    showLoader();
    const data = await fetchScheduleForDay();
    if (!data) {
      renderLayout(localStorage.getItem("role"), false);
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
      const html = `<div class="schedule-card"><h1 >${escapeHtml(data.message)}</h1></div>`;
      els.scheduleGrid.insertAdjacentHTML("afterbegin", html);
    }
    if (data.role === "TEACHER") {
      const message = await getMessage();
      if (message.message !== 0) {
        message.message.forEach(function (l) {
          const html = `
          <div class="notice">
          <i class="bi bi-exclamation-circle-fill notice-icon"></i>
          <h3 class="notice-text">У вас не заповнений журнал за ${escapeHtml(l.date.split("T")[0])} у групи ${escapeHtml(l.subject.group.name)}</h3>
          <button class="btn-primary notice-btn" data-groupId=${escapeHtml(l.subject.group.id)} data-lessonName='${escapeHtml(l.subject.name)}' data-date=${escapeHtml(l.date.split("T")[0])} data-scheduleId=${l.id}>Перейти</button>
          </div>`;
          els.messageContainer.insertAdjacentHTML("beforeend", html);
        });
        const path = window.location.pathname;

        els.messageContainer.addEventListener("click", function (e) {
          const btn = e.target.closest(".notice-btn");
          if (!btn) return;
          window.location.href = `/teacher/teacher-journal.html?groupId=${btn.dataset.groupid}&lessonName=${btn.dataset.lessonname}&path=${path}&data=${btn.dataset.date}&scheduleId=${btn.dataset.scheduleid}`;
        });
      }
    }
  } catch (err) {
    console.error(`Помилка: ${err}`);
    showToast("Помилка завантаження даних");
  } finally {
    hideLoader();
  }
};

initTeacherPage();
