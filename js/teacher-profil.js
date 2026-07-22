"use strict";
const userId = localStorage.getItem("userId");
const render = async function () {
  const teachers = await fetch("/data/teachers.json");
  const teacher = await teachers.json();
  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == userId,
  );
  console.log("curent teacher");
  console.log(currentTeacher);
  //ПІБ
  const fullName = document.querySelector(".fullName");
  fullName.textContent = currentTeacher.full_name;
  const curatodId = currentTeacher.id;
  // посада
  //Група
  const grops = await fetch("/data/groups.json");
  const grop = await grops.json();
  console.log(grop);
  const selectgrop = grop.filter((grop) => grop.curator_id == curatodId);
  const nameGroup = selectgrop.map((grop) => grop.name);
  console.log(selectgrop);
  const valueGrop = document.querySelector(".group");
  valueGrop.textContent = nameGroup.join(", ");
  //пошта
  const gmail = document.querySelector(".gmail");
  const users = await fetch("/data/users.json");
  const user = await users.json();
  const [currentUser] = user.filter((user) => user.id == userId);
  gmail.textContent = currentUser.login;
  // предмети які викладаються
  const subjectsTaught = document.querySelector(".subjects-taught");
  const sheduleDates = await fetch("/data/schedule.json");
  const sheduleDate = await sheduleDates.json();
  const teacherSubjects = {};
  console.log(`id: ${currentTeacher.id}`);
  console.log(sheduleDate);
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
