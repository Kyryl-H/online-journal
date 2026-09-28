"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";
import { fetchTeacherJournalMain } from "../api.js";

const renderLesson = async function () {
  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  const els = {
    btnContainer: document.querySelector(".btn-container"),
    userId: localStorage.getItem("userId"),
  };

  const data = await fetchTeacherJournalMain();
  // Пошук груп з предметами в яких викладається
  data.subjects.forEach((group) => {
    const html = `
            <button class="btn" data-lesson-name="${group.subjectName}" data-group="${group.groupID}">${group.subjectName} ${group.group}</button>`;

    els.btnContainer.insertAdjacentHTML("beforeend", html);
  });

  // Відкриття журналу з вибраними даними заняття
  els.btnContainer.onclick = async function (e) {
    let target = e.target;
    if (!target.classList.contains("btn")) return;

    const lessonName = target.dataset.lessonName;
    const groupId = target.dataset.group;
    const path = window.location.pathname;

    const safeLessonName = encodeURIComponent(lessonName);
    window.location.href = `/teacher/teacher-journal.html?groupId=${groupId}&lessonName=${safeLessonName}&path=${path}`;
  };
};
renderLesson();
