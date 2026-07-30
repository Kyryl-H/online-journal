"use strict";

import {
  fetchGroups,
  fetchSchedule,
  fetchStudents,
  fetchGrades,
} from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

renderLayout();
renderExit();
initGlobal();

const lessonName = localStorage.getItem("lessonName");
const groupId = localStorage.getItem("groupId");
const selectGroup = document.querySelector(".select-group");
const comeback = document.querySelector(".comeback");
const monthContainer = document.querySelector(".month-container");
const monthBtn = document.querySelectorAll(".monthbtn");
const tbody = document.querySelector("tbody");
const dateContainer = document.querySelector(".date-container");
const searchInput = document.querySelector(".search-input");
const monthfirst = document.querySelector(".monthbtn");
const datePanel = document.querySelector(".date-panel");
const insertColumRight = document.querySelector(".insert-colum-right");
const btnCloseLessonModal = document.querySelector(".btn-close-lessonModal");
const inputTopicLesson = document.querySelector(".input-topic-lesson");
const insertTopicBtn = document.querySelector(".insert-topic");

const render = async function () {
  const group = await fetchGroups();
  const schedule = await fetchSchedule();
  const student = await fetchStudents();
  const grades = await fetchGrades();

  const currentGroup = group.filter((g) => g.id == groupId);
  selectGroup.textContent = `${lessonName} ${currentGroup[0].name}`;
  // налаштування вибору місяця
  const date = new Date();
  let month = date.getMonth(); // для рендеренгу оцінок за певний місяць
  if (month === 6 || month === 7) {
    month = 8;
    monthfirst.classList.add("monthbtn-active");
  }

  const monthActiv = document.querySelector(`[data-number="${month}"]`);
  monthActiv.classList.add("monthbtn-active");

  monthContainer.onclick = function (e) {
    let target = e.target;
    if (!target.classList.contains("monthbtn")) return;
    month = Number(target.dataset.number);
    monthBtn.forEach((btn) => {
      btn.classList.remove("monthbtn-active");
    });
    target.classList.add("monthbtn-active");
    renderTable();
  };
  // рендеринг таблиці
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
        `<tr><td id="date-null" class="date-null">У цьому місяці занять немає</td></tr>`,
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

    studentByGroup.sort((a, b) => a.full_name.localeCompare(b.full_name, "uk"));

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
  // пошук студентів
  searchInput.addEventListener("input", () => {
    renderTable(searchInput.value);
  });

  // додавання стовчиків та тем
  dateContainer.addEventListener("dblclick", function (e) {
    const target = e.target;
    if (
      target.classList.contains("sticky-corner") ||
      target.classList.contains("date-null")
    )
      return;
    datePanel.classList.remove("hidden");

    const rect = target.getBoundingClientRect();
    datePanel.style.top = `${rect.bottom + window.scrollY + 5}px`;
    datePanel.style.left = `${rect.left + window.scrollX + 5}px`;
  });
  // ховання вікна
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !datePanel.classList.contains("hidden")) {
      datePanel.classList.add("hidden");
    }
    if (e.key === "Escape" && !inputTopicLesson.classList.contains("hidden")) {
      inputTopicLesson.classList.add("hidden");
      overlay.classList.add("hidden");
    }
  });
  document.addEventListener("click", function (e) {
    if (!datePanel.contains(e.target)) {
      datePanel.classList.add("hidden");
    }
  });
  // функціонал кнопок модального вікна
  //додавання колонки справа
  insertColumRight.addEventListener("click", function () {
    dateContainer.insertAdjacentHTML("beforeend", `<th></th>`);
    const row = document.querySelectorAll(".row");

    row.forEach(function (line) {
      line.insertAdjacentHTML(
        "beforeend",
        `<td><input type="text" class="grade-input" /></td>`,
      );
    });
  });
  // модальне вікно з темою заняття
  // показуєм
  insertTopicBtn.addEventListener("click", function () {
    inputTopicLesson.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });
  // ховаєм модальне вікно з темою заняття
  btnCloseLessonModal.addEventListener("click", function () {
    inputTopicLesson.classList.add("hidden");
    overlay.classList.add("hidden");
  });
  overlay.addEventListener("click", function () {
    inputTopicLesson.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  renderTable();
  // валідаці вводу користувача
  const gradeInput = document.querySelectorAll(".grade-input");
  const [currentmonth] = schedule
    .filter((group) => group.group_id == groupId)
    .filter((sub) => sub.subject == lessonName);
  gradeInput.forEach(function (grades) {
    grades.addEventListener("input", function () {
      if (
        (grades.value >= 1 && grades.value <= currentmonth.grading_system) ||
        grades.value === "н" ||
        grades.value === "Н"
      ) {
      } else {
        grades.classList.add("input-values-error");
        setTimeout(() => {
          grades.value = "";
          grades.classList.remove("input-values-error");
        }, 2000);
      }
    });
  });
};

//повернення на сторінку вибору пар
comeback.addEventListener("click", function () {
  window.location.href = "/html//teacher_html/journal-main.html";
});
render();
