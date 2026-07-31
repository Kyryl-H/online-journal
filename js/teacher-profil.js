"use strict";

import {
  fetchTeachers,
  fetchGroups,
  fetchUsers,
  fetchSchedule,
} from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

renderLayout();
renderExit();
initGlobal();

// DOM елементи
const els = {
  fullName: document.querySelector(".fullName"),
  valueGrop: document.querySelector(".group"),
  gmail: document.querySelector(".gmail"),
  subjectsTaught: document.querySelector(".subjects-taught"),
  userId: localStorage.getItem("userId"),
};

const state = {
  teacher: [],
  grop: [],
  user: [],
  sheduleDate: [],
  currentTeacher: [],
};
// Особиста інформація
const renderInfo = function () {
  // ПІБ
  els.fullName.textContent = state.currentTeacher.full_name;
  const curatodId = state.currentTeacher.id;
  // Посада

  // Група
  const selectgrop = state.grop.filter((grop) => grop.curator_id == curatodId);
  const nameGroup = selectgrop.map((grop) => grop.name);
  els.valueGrop.textContent = nameGroup.join(", ");
  // Пошта
  const [currentUser] = state.user.filter((user) => user.id == els.userId);
  els.gmail.textContent = currentUser.login;
};

// Предмети які викладаються
const renderLesson = function () {
  const teacherSubjects = {};
  state.sheduleDate
    .filter((lesson) => lesson.teacher_id == state.currentTeacher.id)
    .forEach((lesson) => {
      if (!teacherSubjects[lesson.subject]) {
        teacherSubjects[lesson.subject] = new Set();
      }
      teacherSubjects[lesson.subject].add(lesson.group_id);
    });
  Object.entries(teacherSubjects).forEach(([subjectName, groupIdsSet]) => {
    const groupNamesArray = [...groupIdsSet].map((id) => {
      const foundGroup = state.grop.find((g) => g.id === id);

      return foundGroup ? foundGroup.name : "Невідома група";
    });

    const groupsString = groupNamesArray.join(", ");
    const html = `
      <div class="info-row">
        <div class="icon-box"><i class="bi bi-database"></i></div>
        <div class="info-label">${subjectName}:</div>
        <div class="info-value">${groupsString}</div>
      </div>
    `;

    els.subjectsTaught.insertAdjacentHTML("beforeend", html);
  });
};

const render = async function () {
  const [teacher, grop, user, sheduleDate] = await Promise.all([
    fetchTeachers(),
    fetchGroups(),
    fetchUsers(),
    fetchSchedule(),
  ]);

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == els.userId,
  );

  state.teacher = teacher;
  state.grop = grop;
  state.user = user;
  state.sheduleDate = sheduleDate;
  state.currentTeacher = currentTeacher;

  renderInfo();
  renderLesson();
};
render();
// скидання пароля
