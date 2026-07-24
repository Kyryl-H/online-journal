"use strict";
const userId = localStorage.getItem("userId");
const render = async function () {
  try {
    const p1 = await fetch("/data/teachers.json");
    const p2 = await fetch("/data/groups.json");
    const p3 = await fetch("/data/users.json");
    const p4 = await fetch("/data/schedule.json");

    const [teacherRespons, groupsRespons, userRespons, scheduleRespons] =
      await Promise.all([p1, p2, p3, p4]);

    const teacher = await teacherRespons.json();
    const grop = await groupsRespons.json();
    const user = await userRespons.json();
    const sheduleDate = await scheduleRespons.json();

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
  } catch (err) {
    console.error(`Помилка: ${err.message}`);
  }
};
render();
// скидання пароля
