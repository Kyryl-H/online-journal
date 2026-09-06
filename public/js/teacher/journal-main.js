"use strict";

import { fetchTeachers, fetchGroups, fetchSchedule } from "../api.js";
import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";

renderLayout();
renderExit();
initGlobal();

const renderLesson = async function () {
  const els = {
    btnContainer: document.querySelector(".btn-container"),
    userId: localStorage.getItem("userId"),
  };

  const [teacher, grop, shedule] = await Promise.all([
    fetchTeachers(),
    fetchGroups(),
    fetchSchedule(),
  ]);

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == els.userId,
  );
  // Пошук груп з предметами в яких викладається
  const lessonSubject = {};
  const lessonAll = shedule
    .filter((lesson) => lesson.teacher_id === currentTeacher.id)
    .forEach((lesson) => {
      if (!lessonSubject[lesson.subject]) {
        lessonSubject[lesson.subject] = new Set();
      }
      lessonSubject[lesson.subject].add(lesson.group_id);
    });
  Object.entries(lessonSubject).forEach(([subjectName, groupIdsSet]) => {
    const groupNamesArray = [...groupIdsSet].map((id) => {
      const foundGroup = grop.find((g) => g.id === id);

      return foundGroup ? foundGroup.name : "Невідома група";
    });
    groupNamesArray.forEach((group) => {
      const html = `
            <button class="btn" data-lesson-name="${subjectName}" data-group="${[...groupIdsSet]}">${subjectName} ${group}</button>`;

      els.btnContainer.insertAdjacentHTML("beforeend", html);
    });
  });
  // Відкриття журналу з вибраними даними заняття
  els.btnContainer.onclick = function (e) {
    let target = e.target;
    if (!target.classList.contains("btn")) return;
    localStorage.setItem("lessonName", e.target.dataset.lessonName);
    localStorage.setItem("groupId", e.target.dataset.group);
    localStorage.setItem("href", window.location.href);
    window.location.href = "/html/teacher_html/teacher-journal.html";
  };
};
renderLesson();
