"use strict";

import { fetchTeachers, fetchSchedule, fetchGroups } from "./api.js";
import { renderLayout, renderExit } from "./components.js";
import { initGlobal } from "./global.js";

renderLayout();
renderExit();
initGlobal();

// DOM елементи
const els = {
  greeting: document.querySelector(".greeting"),
  labelDate: document.querySelector(".date"),
  scheduleGrid: document.querySelector(".schedule-grid"),
  userId: localStorage.getItem("userId"),
  messageContainer: document.querySelector(".message-container"),
};

const state = {
  teacher: [],
  schedule: [],
  group: [],
  currentTeacher: [],
  today: new Date(),
  todayString: "",
  lessonTime: new Map([
    [1, "8:30-9:50"],
    [2, "10:05-11:25"],
    [3, "11:55-13:15"],
    [4, "13:30-14:50"],
    [5, "15:05-16:25"],
    [6, "16:40-18:00"],
  ]),
};

const renderHeader = function () {
  els.greeting.textContent = `Вітаю, ${state.currentTeacher.full_name}`;
  // Сьогоднішня дата
  const days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П'ятниця",
    "Субота",
  ];
  const weekday = days[state.today.getDay()];
  const year = state.today.getFullYear();
  const month = String(state.today.getMonth() + 1).padStart(2, "0");
  const day = String(state.today.getDate()).padStart(2, "0");

  state.todayString = `${year}-${month}-${day}`;
  els.labelDate.textContent = `${weekday}, ${day}.${month}.${year}`;
};

// Рендер карток
const renderLessonCard = function () {
  const scheduleTeacher = state.schedule.filter(
    (teacher) => state.currentTeacher.id == teacher.teacher_id,
  );
  // Пари за поточний день
  const selectpara = scheduleTeacher.filter(
    (lesson) => lesson.date === state.todayString,
  );

  if (selectpara.length === 0) {
    els.scheduleGrid.insertAdjacentHTML(
      "afterbegin",
      "<h2>Сьогодні немає пар</h2>",
    );
  }
  selectpara.forEach(function (lesson) {
    const [groupId] = state.group.filter(
      (group) => lesson.group_id == group.id,
    );

    const html = `            <div class="schedule-card">
              <div class="card-header">
                <span class="time"><i class="bi bi-clock"></i> ${state.lessonTime.get(lesson.lesson_number)}</span>
                <span class="status-badge">Наступна</span>
              </div>

              <h3>${lesson.subject}</h3>

              <div class="card-details">
                <div class="detail-item">
                  <i class="bi bi-people"></i> <span>${groupId.name}</span>
                </div>
                <div class="detail-item">
                  <i class="bi bi-geo-alt"></i><span>Ауд. ${lesson.room}</span>
                </div>
              </div>
            </div>`;
    els.scheduleGrid.insertAdjacentHTML("afterbegin", html);

    const currentCard = els.scheduleGrid.firstElementChild;
    const currentBadge = currentCard.querySelector(".status-badge");

    // Статус карток
    const cardStatus = function () {
      const realTime = state.today.getHours() * 60 + state.today.getMinutes();
      const time1 = state.lessonTime.get(lesson.lesson_number).split("-");

      const startOfTheClass = time1[0].split(":");
      const startOfTheClassMinute =
        Number(startOfTheClass[0]) * 60 + Number(startOfTheClass[1]);

      const endOfTheClass = time1[1].split(":");
      const endOfTheClassMinute =
        Number(endOfTheClass[0]) * 60 + Number(endOfTheClass[1]);

      if (startOfTheClassMinute < realTime && realTime < endOfTheClassMinute) {
        currentBadge.textContent = "Зараз";
        currentCard.classList.add("schedule-active");
        currentBadge.classList.add("active");
      } else if (realTime > startOfTheClassMinute) {
        currentBadge.textContent = "Пройшла";
        currentBadge.classList.remove("active");
        currentCard.classList.remove("schedule-active");
      } else if (realTime < startOfTheClassMinute) {
        currentBadge.textContent = "Наступна";
      }
    };
    cardStatus();
    setInterval(cardStatus, 60000);
  });
};

// Повідомлення
const renderMessage = function () {
  // Шукаємо пари, які вже пройшли, але тема не заповнена
  const uncompletedLessons = state.schedule.filter((lesson) => {
    const isMyLesson = lesson.teacher_id === state.currentTeacher.id;
    const isPastLesson = new Date(lesson.date) <= state.today;
    const hasNoTopic = lesson.topic === "" || lesson.topic === null;

    return isMyLesson && isPastLesson && hasNoTopic;
  });
  //
  if (uncompletedLessons.length > 0) {
    uncompletedLessons.forEach(function (les) {
      const nameGroup = state.group.find((g) => g.id === les.group_id);
      const html = `                        <div class="message">
              <div class="message-content">
                <i class="bi bi-exclamation-circle-fill"></i
                ><span>У вас не заповнений журнал в групі ${nameGroup.name} за ${les.date}</span>
              </div>
              <div class="message-btn"><button data-lessonName=${les.subject} data-group=${les.group_id}>Перейти до журналу</button></div>
            </div>

`;
      els.messageContainer.insertAdjacentHTML("afterbegin", html);
    });
  }
};

const render = async function () {
  const [teacher, schedule, group] = await Promise.all([
    fetchTeachers(),
    fetchSchedule(),
    fetchGroups(),
  ]);

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == els.userId,
  );

  state.teacher = teacher;
  state.schedule = schedule;
  state.group = group;
  state.currentTeacher = currentTeacher;

  renderHeader();
  renderLessonCard();
  renderMessage();
  const messageBtn = document.querySelectorAll(".message-btn");

  messageBtn.forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem("lessonName", btn.dataset.lessonName);
      localStorage.setItem("groupId", btn.dataset.group);
      window.location.href = "/html/teacher_html/teacher-journal.html";
    });
  });
};
render();
