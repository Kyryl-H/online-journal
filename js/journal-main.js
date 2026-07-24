"use strict";

const btnContainer = document.querySelector(".btn-container");
const userId = localStorage.getItem("userId");
const render = async function () {
  const p1 = await fetch("/data/teachers.json");
  const p2 = await fetch("/data/groups.json");
  const p3 = await fetch("/data/users.json");
  const p4 = await fetch("/data/schedule.json");

  const [teacherRespons, groupsRespons, userRespons, scheduleRespons] =
    await Promise.all([p1, p2, p3, p4]);

  const teacher = await teacherRespons.json();
  const grop = await groupsRespons.json();
  const user = await userRespons.json();
  const shedule = await scheduleRespons.json();

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == userId,
  );
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

      btnContainer.insertAdjacentHTML("beforeend", html);
    });
  });
  btnContainer.onclick = function (e) {
    let target = e.target;
    if (!target.classList.contains("btn")) return;
    localStorage.setItem("lessonName", e.target.dataset.lessonName);
    localStorage.setItem("groupId", e.target.dataset.group);
    window.location.href = "/html/teacher_html/teacher-journal.html";
  };
};
render();
