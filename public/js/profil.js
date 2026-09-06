"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

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
const renderInfo = function (fullName, grops, email, curator) {
  // ПІБ
  els.fullName.textContent = fullName;
  // Посада / Куратор
  if (currentRole === "student") {
    els.curator.textContent = curator;
  }
  // Група
  els.valueGrop.textContent = grops.join(", ");
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
        <div class="info-value">${s.grop}</div>
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
  // const userId = localStorage.getItem("userId");
  // const respons = await fetch(`/api/profil/${currentRole}/${userId}`);
  // const data = await respons.json();
  const mockData =
    currentRole === "teacher"
      ? {
          role: "teacher",
          isCurator: true,
          fullName: "Дашкевич Володимр Володимирович",
          group: ["P-13", "K-49"],
          email: "v.kdskfdkm.gmail.com",
          subject: [{ name: "Алгоритми й структура даних", grop: "P-13" }],
        }
      : {
          role: "student",
          isCurator: false,
          fullName: "Годлевський Кирил Васильович",
          curator: "Імператриця",
          group: ["P-43"],
          email: "h.sfdsdfd.gmail.com",
          statistics: {
            overallAcademicPerformance: 4.9,
            monthAcademicPerformance: 32,
            totalNumberOfPasses: 4.5,
            monthNumberOfPasses: 8,
          },
        };

  renderLayout(currentRole, mockData.isCurator);
  renderExit();
  initGlobal();

  renderInfo(
    mockData.fullName,
    mockData.group,
    mockData.email,
    currentRole === "student" ? mockData.curator : "",
  );

  if (currentRole === "teacher") {
    renderLesson(mockData.subject);
  } else if (currentRole === "student") {
    renderStatistic(mockData.statistics);
  }
};
render();
// скидання пароля
