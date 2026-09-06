"use strict";

export const renderLayout = function (role, isCurator = false) {
  let navLinks = "";

  if (role === "teacher") {
    navLinks = `
        <li><a href="/teacher/main" data-target="main" class="nav-link"><i class="bi bi-house icon"></i> <span class="link-name">Головна</span></a></li>
        <li><a href="/teacher/profil" data-target="profil" class="nav-link"><i class="bi bi-person icon"></i><span class="link-name">Особистий кабінет</span></a></li>
        <li><a href="/teacher/journal/main" data-target="journal" class="nav-link"><i class="bi bi-book icon"></i><span class="link-name">Журнал</span></a></li>
        <li><a href="/teacher/schedule" data-target="schedule" class="nav-link"><i class="bi bi-journal-text icon"></i><span class="link-name">Розклад</span></a></li>`;
    if (isCurator) {
      navLinks += `<li><a href="/teacher/profil-curator" data-target="profil-curator" class="nav-link"><i class="bi bi-people icon"></i><span class="link-name">Кабінет куратора</span></a></li>`;
    }
  } else if (role === "student") {
    navLinks = `
        <li><a href="/student/main" data-target="main" class="nav-link"><i class="bi bi-house icon"></i> <span class="link-name">Головна</span></a></li>
        <li><a href="/student/profil" data-target="profil" class="nav-link"><i class="bi bi-person icon"></i><span class="link-name">Мій профіль</span></a></li>
        <li><a href="/student/schedule" data-target="schedule" class="nav-link"><i class="bi bi-journal-text icon"></i><span class="link-name">Розклад</span></a></li>
    `;
  }

  const html = `
    <header class="header">
      <div class="logo-header">
        <i class="bi bi-book"></i><h4>Онлайн журнал</h4>
      </div>
      <ul class="nav-list-top">
        <li class="nav-el-top"><div class="el"><i class="bi bi-bell-fill"></i></div></li>
        <li class="nav-el-top"><div class="el"><i class="bi bi-gear-fill"></i></div></li>
      </ul>
    </header>

    <nav class="sidebar">
      <div class="logo-section"><button class="toggle-btn"><i class="bi bi-list icon"></i></button></div>
      <ul class="nav-list">
        ${navLinks}
        <li class="exit">
          <a href="#" class="nav-link"><i class="bi bi-box-arrow-right icon"></i><span class="link-name">Вихід з акаунту</span></a>
        </li>
      </ul>
    </nav>
  `;
  document.body.insertAdjacentHTML("afterbegin", html);
};

export const renderLessonCard = function (lesson, role, containerElement) {
  const detailIcon = role === "teacher" ? "bi-people" : "bi-person";
  const detailText = role === "teacher" ? lesson.groupName : lesson.teacherName;

  const html = `
    <div class="schedule-card">
      <div class="card-header">
        <span class="time"><i class="bi bi-clock"></i> ${lesson.time}</span>
        <span class="status-badge">Наступна</span>
      </div>
      <h3>${lesson.subject}</h3>
      <div class="card-details">
        <div class="detail-item"><i class="bi ${detailIcon}"></i> <span>${detailText}</span></div>
        <div class="detail-item"><i class="bi bi-geo-alt"></i><span>Ауд. ${lesson.room}</span></div>
      </div>
    </div>
  `;
  containerElement.insertAdjacentHTML("beforeend", html);

  // Знаходимо щойно створену картку
  const currentCard = containerElement.lastElementChild;
  const currentBadge = currentCard.querySelector(".status-badge");

  // Оновлення статусів
  const updateCardStatus = function () {
    const today = new Date();
    const realTime = today.getHours() * 60 + today.getMinutes();
    const timeParts = lesson.time.split("-");

    const startParts = timeParts[0].split(":");
    const startMinute = Number(startParts[0]) * 60 + Number(startParts[1]);

    const endParts = timeParts[1].split(":");
    const endMinute = Number(endParts[0]) * 60 + Number(endParts[1]);

    if (startMinute <= realTime && realTime <= endMinute) {
      currentBadge.textContent = "Зараз";
      currentCard.classList.add("schedule-active");
      currentBadge.classList.add("active");
    } else if (realTime > endMinute) {
      currentBadge.textContent = "Пройшла";
      currentBadge.classList.remove("active");
      currentCard.classList.remove("schedule-active");
    } else {
      currentBadge.textContent = "Наступна";
    }
  };

  updateCardStatus();
  setInterval(updateCardStatus, 60000);
};
export const renderExit = function () {
  const html = `    <div class="modal hidden">
      <button class="btn-close-modal"><i class="bi bi-x-circle"></i></button>

      <h2>Ви впевнені що хочете вийти?</h2>
      <button class="exitBtn exitBtnNo">Ні</button>
      <button class="exitBtn exitBtnYes">Так</button>
    </div>
    <div class="overlay hidden"></div>
`;
  document.body.insertAdjacentHTML("beforeend", html);
};
