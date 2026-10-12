"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "./global.js";
import { fetchTeacherProfile, showToast } from "./api.js";
import { initPasswordReset } from "./password-reset.js";

initPasswordReset("#resetPasswordBtn");

// DOM елементи
const els = {
  fullName: document.querySelector(".fullName"),
  valueGrop: document.querySelector(".group"),
  gmail: document.querySelector(".gmail"),
  subjectsTaught: document.querySelector(".subjects-taught"),
  statisticConteiner: document.querySelector(".statistic"),
  curator: document.querySelector(".curator"),
};

// Особиста інформація
const renderInfo = function (fullName, groups, email, curator) {
  // ПІБ
  els.fullName.textContent = fullName;
  // Посада / Куратор
  if (localStorage.getItem("role") === "STUDENT") {
    els.curator.textContent = curator;
  }
  // Група
  els.valueGrop.textContent = Array.isArray(groups)
    ? groups.join(", ")
    : groups || "";
  // Пошта
  els.gmail.textContent = email;
};

// Предмети які викладаються
const renderLesson = function (subject) {
  subject.forEach(function (s) {
    const html = `
      <div class="info-row">
        <div class="icon-box"><i class="bi bi-database"></i></div>
        <div class="info-label">${escapeHtml(s.name)}:</div>
        <div class="info-value">${escapeHtml(s.group)}</div>
      </div>
    `;

    els.subjectsTaught.insertAdjacentHTML("beforeend", html);
  });
};
// Статистика студента
const renderStatistic = function (statistics) {
  const html = `            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Загальна успішність:</div>
              <div class="info-value overall-academic-performance">${escapeHtml(statistics.overallAcademicPerformance)}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Загальна кількість пропусків(год):</div>
              <div class="info-value total-number-of-passes">${escapeHtml(statistics.totalNumberOfPasses)}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Успішність за місяць:</div>
              <div class="info-value month-academic-performance">${escapeHtml(statistics.monthAcademicPerformance)}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Кількість пропусків за місяць:</div>
              <div class="info-value month-number-of-passes">${escapeHtml(statistics.monthNumberOfPasses)}</div>
            </div>
`;
  els.statisticConteiner.insertAdjacentHTML("beforeend", html);
};

const render = async function () {
  try {
    showLoader();
    const data = await fetchTeacherProfile();

    renderLayout(localStorage.getItem("role"));
    renderExit();
    initGlobal();

    renderInfo(
      data.fullName,
      data.group,
      data.email,
      localStorage.getItem("role") === "STUDENT" ? data.curator : "",
    );

    if (localStorage.getItem("role") === "TEACHER") {
      renderLesson(data.subject);
    } else if (localStorage.getItem("role") === "STUDENT") {
      renderStatistic(data.statistics);
    }
  } catch (err) {
    console.error(`Помилка: ${err}`);
    showToast("Помилка завантаження даних");
  } finally {
    hideLoader();
  }
};
render();
// скидання пароля
