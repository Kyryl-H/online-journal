"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";

const currentPath = window.location.pathname;
const currentRole = currentPath.includes("teacher") ? "teacher" : "student";

const renderLesson = async function () {
  renderLayout(currentRole, true);
  renderExit();
  initGlobal();

  const els = {
    btnContainer: document.querySelector(".btn-container"),
    userId: localStorage.getItem("userId"),
  };

  // const respons = await fetch(`/api/journalMain/${currentRole}/${userId}`);
  // const data = respons.json();
  const mockData = [
    { subjectName: "Алгоритми та структури даних", group: "P-13", groupID: 1 },
    { subjectName: "Бази даних", group: "k-49", groupID: 2 },
    { subjectName: "Графічний дизайн", group: "S-15", groupID: 3 },
  ];
  // Пошук груп з предметами в яких викладається
  mockData.forEach((group) => {
    const html = `
            <button class="btn" data-lesson-name="${group.subjectName}" data-group="${group.groupID}">${group.subjectName} ${group.group}</button>`;

    els.btnContainer.insertAdjacentHTML("beforeend", html);
  });

  // Відкриття журналу з вибраними даними заняття
  els.btnContainer.onclick = function (e) {
    let target = e.target;
    if (!target.classList.contains("btn")) return;

    const lessonName = target.dataset.lessonName;
    const groupId = target.dataset.group;
    const path = window.location.pathname;

    const safeLessonName = encodeURIComponent(lessonName);
    window.location.href = `/teacher/teacher-journal?groupID=${groupId}&lessonName=${safeLessonName}&path=${path}`;
  };
};
renderLesson();
