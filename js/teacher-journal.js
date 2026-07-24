"use strict";

const lessonName = localStorage.getItem("lessonName");
const groupId = localStorage.getItem("groupId");
const selectGroup = document.querySelector(".select-group");
const comeback = document.querySelector(".comeback");
const monthContainer = document.querySelector(".month-container");
const monthBtn = document.querySelectorAll(".monthbtn");
const tbody = document.querySelector("tbody");
const dateContainer = document.querySelector(".date-container");
const searchInput = document.querySelector(".search-input");

const render = async function () {
  try {
    const p1 = await fetch("/data/groups.json");
    const p2 = await fetch("/data/schedule.json");
    const p3 = await fetch("/data/students.json");
    const p4 = await fetch("/data/grades.json");

    const [responsGroup, scheduleRespons, studentRespons, gradesRespons] =
      await Promise.all([p1, p2, p3, p4]);

    const group = await responsGroup.json();
    const schedule = await scheduleRespons.json();
    const student = await studentRespons.json();
    const grades = await gradesRespons.json();

    const currentGroup = group.filter((g) => g.id == groupId);
    selectGroup.textContent = `${lessonName} ${currentGroup[0].name}`;
    //
    const date = new Date();
    let month = date.getMonth(); // для рендеренгу оцінок за певний місяць
    monthContainer.onclick = function (e) {
      let target = e.target;
      if (!target.classList.contains("monthbtn")) return;
      month = Number(target.dataset.number);
      monthBtn.forEach((btn) => {
        btn.classList.remove("monthbtn-active");
      });
      target.classList.add("monthbtn-active");
      renderTable();
    }; // рендеринг таблиці
    const renderTable = async function (searchQuery = "") {
      dateContainer.innerHTML = "";
      tbody.innerHTML = "";
      const years = date.getFullYear();
      const beginningOfTheMonth = new Date(years, month, 1);
      const endOfTheMonth = new Date(years, month + 1, 0);
      const currentmonth = schedule
        .filter((group) => group.group_id == groupId)
        .filter((sub) => sub.subject == lessonName)
        .filter((month) => {
          const [day, monthD, years] = month.date.split("-");
          return (
            new Date(years, Number(monthD) - 1, day) >= beginningOfTheMonth &&
            new Date(years, Number(monthD) - 1, day) <= endOfTheMonth
          );
        });
      if (currentmonth.length === 0) {
        dateContainer.insertAdjacentHTML(
          "beforeend",
          `<tr><td id="date-null">У цьому місяці занять немає</td></tr>`,
        );
        return;
      }
      // render date
      dateContainer.insertAdjacentHTML(
        "beforeend",
        `<th class="sticky-corner">Учень/День</th>`,
      );
      currentmonth.forEach(function (lesson) {
        const [day, monthD, years] = lesson.date.split("-");
        const html = `<th>${day}/${monthD}</th>`;
        dateContainer.insertAdjacentHTML("beforeend", html);
      });
      // render student
      let studentByGroup = student.filter((stud) => stud.group_id == groupId);
      studentByGroup = studentByGroup.filter((s) =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      studentByGroup.sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "uk"),
      );

      studentByGroup.forEach(function (student, i) {
        let html = `                <tr class="row">
                        <td><div>${i + 1}.${student.full_name}</div></td>
                      
      `;
        currentmonth.forEach(function (lesson) {
          const gradesValue = grades.find(
            (stud) =>
              stud.student_id == student.id && stud.schedule_id == lesson.id,
          );
          if (gradesValue) {
            html += `<td><input type="text" class="grade-input" value="${gradesValue.value}"/></td>`;
          } else {
            html += `<td><input type="text" class="grade-input" /></td>`;
          }
        });
        html += "</tr>";
        tbody.insertAdjacentHTML("beforeend", html);
      });
    };
    searchInput.addEventListener("input", () => {
      renderTable(searchInput.value);
    });

    renderTable();
  } catch (err) {
    console.error(`Помилка: ${err.message}`);
  }
};

//повернення на сторінку вибору пар
comeback.addEventListener("click", function () {
  window.location.href = "/html//teacher_html/journal-main.html";
});
render();
