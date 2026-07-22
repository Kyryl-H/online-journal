"use strict";
const greeting = document.querySelector(".greeting");
const labelDate = document.querySelector(".date");
const scheduleGrid = document.querySelector(".schedule-grid");
const userId = localStorage.getItem("userId");
const render = async function (userId) {
  // привітання
  const teachers = await fetch("/data/teachers.json");
  const teacher = await teachers.json();

  const [currentTeacher] = teacher.filter(
    (teacher) => teacher.user_id == userId,
  );
  greeting.textContent = `Вітаю, ${currentTeacher.full_name}`;
  const teacher_id = currentTeacher.id;
  // дата
  const days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П'ятниця",
    "Субота",
  ];
  const today = new Date();
  const weekday = days[today.getDay()];
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const todayString = `${day}-${month}-${year}`;
  labelDate.textContent = `${weekday}, ${day}.${month}.${year}`;
  // картки
  const schedules = await fetch("/data/schedule.json");
  const schedule = await schedules.json();
  const scheduleTeacher = schedule.filter(
    (teacher) => teacher_id == teacher.teacher_id,
  );
  const selectpara = scheduleTeacher.filter(
    (lesson) => lesson.date === todayString,
  );
  const lessonTime = new Map([
    [1, "8:30-9:50"],
    [2, "10:05-11:25"],
    [3, "11:55-13:15"],
    [4, "13:30-14:50"],
    [5, "15:05-16:25"],
    [6, "16:40-18:00"],
  ]);

  const groups = await fetch("/data/groups.json");
  const group = await groups.json();
  selectpara.forEach(async function (lesson) {
    // час пар
    const [groupId] = group.filter((group) => lesson.group_id == group.id);

    const html = `            <div class="schedule-card">
              <div class="card-header">
                <span class="time"><i class="bi bi-clock"></i> ${lessonTime.get(lesson.lesson_number)}</span>
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
    scheduleGrid.insertAdjacentHTML("afterbegin", html);
    // статус карток

    const cardStatus = function () {
      const statusDadge = document.querySelector(".status-badge");
      const realTime = today.getHours() * 60 + today.getMinutes();
      // const realTime = 520; // 520, 610

      const time1 = lessonTime.get(lesson.lesson_number).split("-");
      // start Of The Class
      const startOfTheClass = time1[0].split(":");
      const startOfTheClassMinute =
        Number(startOfTheClass[0]) * 60 + Number(startOfTheClass[1]);
      // end Of The Class
      const endOfTheClass = time1[1].split(":");
      const endOfTheClassMinute =
        Number(endOfTheClass[0]) * 60 + Number(endOfTheClass[1]);
      const scheduleCard = statusDadge.closest(".schedule-card");

      if (startOfTheClassMinute < realTime && realTime < endOfTheClassMinute) {
        statusDadge.textContent = "Зараз";
        scheduleCard.classList.add("schedule-active");
        statusDadge.classList.add("active");
      } else if (realTime > startOfTheClassMinute) {
        statusDadge.textContent = "Пройшла";
        statusDadge.classList.remove("active");
      } else if (realTime < startOfTheClassMinute) {
        statusDadge.textContent = "Наступна";
      }
    };
    setInterval(cardStatus(), 60000);
  });
  // повідомлення
};
render(userId);
