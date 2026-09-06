"use strict";
import { renderLayout, renderLessonCard, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

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
  // const userId = localStorage.getItem("userId");
  // const respons = await fetch(`/api/main/${currentRole}/${userId}`);
  // const data = await respons.json();
  const mockData =
    currentRole === "teacher"
      ? {
          role: "teacher",
          isCurator: true,
          fullName: "Дашкевич Володимир",
          schedule: [
            {
              time: "8:30-9:50",
              subject: "Основи програмування",
              room: "403",
              groupName: "П-23",
            },
          ],
        }
      : {
          role: "student",
          isCurator: false,
          fullName: "Годлевський Кирил",
          schedule: [
            {
              time: "8:30-9:50",
              subject: "Основи програмування",
              room: "403",
              teacherName: "Дашкевич В.",
            },
          ],
        };

  renderLayout(mockData.role, mockData.isCurator);
  renderExit();
  initGlobal();

  renderHeader(mockData.fullName);

  mockData.schedule.forEach((lesson) => {
    renderLessonCard(lesson, mockData.role, els.scheduleGrid);
  });
};

initTeacherPage();
