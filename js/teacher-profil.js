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

const userId = localStorage.getItem("userId");
const render = async function () {
  const teacher = await fetchTeachers();
  const grop = await fetchGroups();
  const user = await fetchUsers();
  const sheduleDate = await fetchSchedule();

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == userId,
  );
  //ПІБ
  const fullName = document.querySelector(".fullName");
  fullName.textContent = currentTeacher.full_name;
  const curatodId = currentTeacher.id;
  // посада
  //Група
  const selectgrop = grop.filter((grop) => grop.curator_id == curatodId);
  const nameGroup = selectgrop.map((grop) => grop.name);
  const valueGrop = document.querySelector(".group");
  valueGrop.textContent = nameGroup.join(", ");
  //пошта
  const gmail = document.querySelector(".gmail");
  const [currentUser] = user.filter((user) => user.id == userId);
  gmail.textContent = currentUser.login;
  // предмети які викладаються
  const subjectsTaught = document.querySelector(".subjects-taught");
  const teacherSubjects = {};
  sheduleDate
    .filter((lesson) => lesson.teacher_id == currentTeacher.id)
    .forEach((lesson) => {
      if (!teacherSubjects[lesson.subject]) {
        teacherSubjects[lesson.subject] = new Set();
      }
      teacherSubjects[lesson.subject].add(lesson.group_id);
    });
  Object.entries(teacherSubjects).forEach(([subjectName, groupIdsSet]) => {
    const groupNamesArray = [...groupIdsSet].map((id) => {
      const foundGroup = grop.find((g) => g.id === id);

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

    subjectsTaught.insertAdjacentHTML("beforeend", html);
  });
};
render();
// скидання пароля
