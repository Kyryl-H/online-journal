"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";
import { fetchTeacherProfile } from "./api.js";

const currentPath = window.location.pathname;
const currentRole = currentPath.includes("teacher") ? "teacher" : "student";

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
  if (currentRole === "student") {
    els.curator.textContent = curator;
  }
  // Група
  els.valueGrop.textContent = groups.join(", ");
  // Пошта
  els.gmail.textContent = email;
};

// Предмети які викладаються
const renderLesson = function (subject) {
  subject.forEach(function (s) {
    const html = `
      <div class="info-row">
        <div class="icon-box"><i class="bi bi-database"></i></div>
        <div class="info-label">${s.name}:</div>
        <div class="info-value">${s.group}</div>
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
              <div class="info-value overall-academic-performance">${statistics.overallAcademicPerformance}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Загальна кількість пропусків(год):</div>
              <div class="info-value total-number-of-passes">${statistics.totalNumberOfPasses}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Успішність за місяць:</div>
              <div class="info-value month-academic-performance">${statistics.monthAcademicPerformance}</div>
            </div>
            <div class="info-row">
              <div class="icon-box"><i class="bi bi-database"></i></div>
              <div class="info-label">Кількість пропусків за місяць:</div>
              <div class="info-value month-number-of-passes">${statistics.monthNumberOfPasses}</div>
            </div>
`;
  els.statisticConteiner.insertAdjacentHTML("beforeend", html);
};

const render = async function () {
  const data = await fetchTeacherProfile();
  // const data =
  //     {
  //         role: "student",
  //         isCurator: false,
  //         fullName: "Годлевський Кирил Васильович",
  //         curator: "Імператриця",
  //         group: ["P-43"],
  //         email: "h.sfdsdfd.gmail.com",
  //         statistics: {
  //           overallAcademicPerformance: 4.9,
  //           monthAcademicPerformance: 32,
  //           totalNumberOfPasses: 4.5,
  //           monthNumberOfPasses: 8,
  //         }

  renderLayout(currentRole, data.isCurator);
  renderExit();
  initGlobal();

  renderInfo(
    data.fullName,
    data.group,
    data.email,
    currentRole === "student" ? data.curator : "",
  );

  if (currentRole === "teacher") {
    renderLesson(data.subject);
  } else if (currentRole === "student") {
    renderStatistic(data.statistics);
  }
};
render();
// скидання пароля
