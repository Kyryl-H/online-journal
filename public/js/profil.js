"use strict";

import { renderLayout, renderExit } from "./components.js";
import { initGlobal, escapeHtml, showLoader, hideLoader } from "./global.js";
import { fetchTeacherProfile, fetchStudentGrades, showToast } from "./api.js";
import { initPasswordReset } from "./password-reset.js";

initPasswordReset(".resetPassword");

const els = {
  fullName: document.querySelector(".fullName"),
  valueGrop: document.querySelector(".group"),
  gmail: document.querySelector(".gmail"),
  statisticConteiner: document.querySelector(".statistic"),
  curator: document.querySelector(".curator"),
  subjectsContainer: document.querySelector(".subjects-taught"),
};

const getStudentStatsFallback = async () => {
  const data = await fetchStudentGrades();
  const grades = Array.isArray(data.grades) ? data.grades : [];
  const numericValues = grades
    .map((grade) => Number(grade.value))
    .filter((value) => Number.isFinite(value) && value > 0);

  const totalMisses = grades.filter(
    (grade) => String(grade.value).trim().toLowerCase() === "н",
  ).length;

  const average = numericValues.length
    ? +(
        numericValues.reduce((sum, item) => sum + item, 0) /
        numericValues.length
      ).toFixed(2)
    : 0;

  return {
    overallAcademicPerformance: average,
    totalNumberOfPasses: totalMisses,
    monthAcademicPerformance: average,
    monthNumberOfPasses: totalMisses,
  };
};

const renderInfo = function (fullName, group, email, curator) {
  els.fullName.textContent = fullName || "—";
  els.valueGrop.textContent = Array.isArray(group)
    ? group.join(", ")
    : group || "—";
  els.gmail.textContent = email || "—";

  if (els.curator) {
    els.curator.textContent = curator || "—";
  }
};

const renderTeacherSubjects = function (subjects) {
  if (!els.subjectsContainer) return;

  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  if (!safeSubjects.length) {
    els.subjectsContainer.insertAdjacentHTML(
      "beforeend",
      '<div class="info-row"><div class="info-label">Предмети не знайдено</div></div>',
    );
    return;
  }

  const html = safeSubjects
    .map(
      (subject) => `
        <div class="info-row">
          <div class="icon-box"><i class="bi bi-book-half"></i></div>
          <div class="info-label">${escapeHtml(subject.name || "Предмет")}</div>
          <div class="info-value">${escapeHtml(subject.group || "—")}</div>
        </div>
      `,
    )
    .join("");

  els.subjectsContainer.insertAdjacentHTML("beforeend", html);
};

const renderStatistic = function (statistics) {
  const stats = {
    overallAcademicPerformance:
      statistics?.overallAcademicPerformance ?? statistics?.averageGrade ?? 0,
    totalNumberOfPasses:
      statistics?.totalNumberOfPasses ?? statistics?.totalPasses ?? 0,
    monthAcademicPerformance:
      statistics?.monthAcademicPerformance ?? statistics?.monthAverage ?? 0,
    monthNumberOfPasses:
      statistics?.monthNumberOfPasses ?? statistics?.monthPasses ?? 0,
  };

  const html = `
    <div class="info-row">
      <div class="icon-box"><i class="bi bi-bar-chart-fill"></i></div>
      <div class="info-label">Загальна успішність:</div>
      <div class="info-value">${escapeHtml(String(stats.overallAcademicPerformance))}</div>
    </div>
    <div class="info-row">
      <div class="icon-box"><i class="bi bi-calendar-x-fill"></i></div>
      <div class="info-label">Загальна кількість пропусків:</div>
      <div class="info-value">${escapeHtml(String(stats.totalNumberOfPasses))}</div>
    </div>
    <div class="info-row">
      <div class="icon-box"><i class="bi bi-graph-up-arrow"></i></div>
      <div class="info-label">Успішність за місяць:</div>
      <div class="info-value">${escapeHtml(String(stats.monthAcademicPerformance))}</div>
    </div>
    <div class="info-row">
      <div class="icon-box"><i class="bi bi-clock-history"></i></div>
      <div class="info-label">Кількість пропусків за місяць:</div>
      <div class="info-value">${escapeHtml(String(stats.monthNumberOfPasses))}</div>
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

    const role = (localStorage.getItem("role") || "").toUpperCase();

    renderInfo(
      data.fullName,
      data.group,
      data.email,
      role === "STUDENT" ? data.curator : "",
    );

    if (role === "TEACHER") {
      renderTeacherSubjects(Array.isArray(data.subject) ? data.subject : []);
      return;
    }

    let studentStatistics = data.statistics || {};
    const hasRealStats = Object.values(studentStatistics).some(
      (value) => value !== null && value !== undefined && value !== 0,
    );

    if (!hasRealStats) {
      studentStatistics = await getStudentStatsFallback();
    }

    renderStatistic(studentStatistics);
  } catch (err) {
    console.error(`Помилка: ${err}`);
    showToast("Помилка завантаження даних");
  } finally {
    hideLoader();
  }
};

render();
