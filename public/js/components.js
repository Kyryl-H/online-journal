"use strict";

const MOBILE_QUERY = "(max-width: 768px)";

// Бургер-меню, затемнення, Esc та кнопки з data-action="logout"
const initLayoutEvents = function () {
  const body = document.body;
  const burger = document.querySelector("[data-sidebar-toggle]");

  const setSidebar = function (open) {
    body.classList.toggle("sidebar-open", open);
    burger?.setAttribute("aria-expanded", String(open));
    const icon = burger?.querySelector(".bi");
    icon?.classList.toggle("bi-list", !open);
    icon?.classList.toggle("bi-x-lg", open);
  };

  burger?.addEventListener("click", () =>
    setSidebar(!body.classList.contains("sidebar-open")),
  );
  document
    .querySelector(".sidebar-backdrop")
    ?.addEventListener("click", () => setSidebar(false));
  document
    .querySelectorAll(".sidebar .nav-link")
    .forEach((link) => link.addEventListener("click", () => setSidebar(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebar(false);
  });
  window.matchMedia(MOBILE_QUERY).addEventListener("change", (e) => {
    if (!e.matches) setSidebar(false);
  });

  // Кнопка «Вийти» поза навігацією (профіль на мобільному) відкриває
  // ту саму модалку, що й пункт у sidebar
  document.addEventListener("click", (e) => {
    if (e.target.closest('[data-action="logout"]')) {
      document.querySelector(".exit .nav-link")?.click();
    }
  });
};

export const renderLayout = function (role, isCurator = false) {
  let navLinks = "";

  if (role === "teacher") {
    navLinks = `
        <li><a href="/teacher/teacher-main.html" data-target="main" class="nav-link"><i class="bi bi-house icon"></i> <span class="link-name">Головна</span></a></li>
        <li><a href="/teacher/teacher-profil.html" data-target="profil" class="nav-link"><i class="bi bi-person icon"></i><span class="link-name">Особистий кабінет</span></a></li>
        <li><a href="/teacher/journal-main.html" data-target="journal" class="nav-link"><i class="bi bi-book icon"></i><span class="link-name">Журнал</span></a></li>
        <li><a href="/teacher/teacher-schedule.html" data-target="schedule" class="nav-link"><i class="bi bi-journal-text icon"></i><span class="link-name">Розклад</span></a></li>`;
    if (isCurator) {
      navLinks += `<li><a href="/teacher/teacher-profil-curator.html" data-target="profil-curator" class="nav-link"><i class="bi bi-people icon"></i><span class="link-name">Кабінет куратора</span></a></li>`;
    }
  } else if (role === "student") {
    navLinks = `
        <li><a href="/student/student-main.html" data-target="main" class="nav-link"><i class="bi bi-house icon"></i> <span class="link-name">Головна</span></a></li>
        <li><a href="/student/student-profil.html" data-target="profil" class="nav-link"><i class="bi bi-person icon"></i><span class="link-name">Мій профіль</span></a></li>
        <li><a href="/student/student-schedule.html" data-target="schedule" class="nav-link"><i class="bi bi-journal-text icon"></i><span class="link-name">Розклад</span></a></li>
    `;
  }

  const html = `
    <header class="header">
      <div class="logo-header">
        <button class="icon-btn burger-btn" data-sidebar-toggle aria-label="Меню" aria-expanded="false">
          <i class="bi bi-list"></i>
        </button>
        <i class="bi bi-book"></i><h4>Онлайн журнал</h4>
      </div>
      <ul class="nav-list-top">
        <li>
          <button class="icon-btn" data-theme-toggle aria-label="Змінити тему">
            <i class="bi bi-moon-stars"></i>
          </button>
        </li>
        <li class="nav-el-top notif">
          <div class="el" aria-haspopup="true" aria-label="Повідомлення">
            <i class="bi bi-bell-fill"></i>
            <span class="notif-badge">5</span>
          </div>

          <div class="notif-dropdown" role="dialog" aria-label="Повідомлення">
            <div class="notif-header">
              <h3 class="notif-title">Повідомлення</h3>
              <span class="notif-count">5</span>
            </div>

            <ul class="notif-list">
              <li class="notif-item notif-item--unread">
                <div class="notif-icon"><i class="bi bi-exclamation-circle-fill"></i></div>
                <div class="notif-body">
                  <p class="notif-text">Не заповнено тему до уроку: Вища математика, П-13</p>
                  <span class="notif-time">Сьогодні, 10:30</span>
                </div>
              </li>
              <li class="notif-item notif-item--unread">
                <div class="notif-icon"><i class="bi bi-exclamation-circle-fill"></i></div>
                <div class="notif-body">
                  <p class="notif-text">Не заповнено тему до уроку: Фізика, П-11</p>
                  <span class="notif-time">Сьогодні, 08:45</span>
                </div>
              </li>
              <li class="notif-item">
                <div class="notif-icon notif-icon--info"><i class="bi bi-arrow-left-right"></i></div>
                <div class="notif-body">
                  <p class="notif-text">Заміна в розкладі: Інформатика, ауд. 214, П-13</p>
                  <span class="notif-time">Вчора, 16:20</span>
                </div>
              </li>
              <li class="notif-item">
                <div class="notif-icon"><i class="bi bi-exclamation-circle-fill"></i></div>
                <div class="notif-body">
                  <p class="notif-text">Не виставлено оцінки: Програмування, П-12</p>
                  <span class="notif-time">26 вер, 14:10</span>
                </div>
              </li>
              <li class="notif-item">
                <div class="notif-icon notif-icon--info"><i class="bi bi-check-circle-fill"></i></div>
                <div class="notif-body">
                  <p class="notif-text">Оцінки за вересень збережено</p>
                  <span class="notif-time">25 вер, 12:05</span>
                </div>
              </li>
            </ul>

            <button class="notif-clear" type="button">Позначити всі як прочитані</button>
          </div>
        </li>      </ul>
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
    <div class="sidebar-backdrop"></div>
  `;
  document.body.insertAdjacentHTML("afterbegin", html);
  if (window.syncThemeButtons) window.syncThemeButtons();
  initLayoutEvents();
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
