"use strict";

export const renderLayout = function () {
  const html = `    <header class="header">
      <div class="logo-header">
        <i class="bi bi-book"></i>
        <h4>Онлайн журнал</h4>
      </div>
      <ul class="nav-list-top">
        <li class="nav-el-top">
          <div class="el"><i class="bi bi-bell-fill"></i></div>
        </li>
        <li class="nav-el-top">
          <div class="el"><i class="bi bi-gear-fill"></i></div>
        </li>
      </ul>
    </header>

    <nav class="sidebar">
      <div class="logo-section">
        <button class="toggle-btn"><i class="bi bi-list icon"></i></button>
      </div>
      <ul class="nav-list">
        <li>
          <a
            href="/html/teacher_html/teacher-main.html"
            data-target="main"
            class="nav-link active"
            ><i class="bi bi-house icon"></i>
            <span class="link-name">Головна</span>
          </a>
        </li>
        <li>
          <a
            href="/html/teacher_html/teacher-profil.html"
            data-target="profil"
            class="nav-link"
            ><i class="bi bi-person icon"></i>
            <span class="link-name">Особистий кабінет</span></a
          >
        </li>
        <li>
          <a
            href="/html//teacher_html/journal-main.html"
            data-target="journal"
            class="nav-link"
            ><i class="bi bi-book icon"></i
            ><span class="link-name">Журнал</span></a
          >
        </li>
        <li>
          <a
            href="/html/teacher_html/teacher-schedule.html"
            data-target="schedule"
            class="nav-link"
            ><i class="bi bi-journal-text icon"></i
            ><span class="link-name">Розклад</span></a
          >
        </li>
        <li>
          <a
            href="/html/teacher_html/teacher-profil-curator.html"
            data-target="profil-curator"
            class="nav-link"
            ><i class="bi bi-people icon"></i
            ><span class="link-name">Кабінет куратора</span></a
          >
        </li>
        <li class="exit">
          <a href="#" class="nav-link"
            ><i class="bi bi-box-arrow-right icon"></i
            ><span class="link-name">Вихід з акаунту</span></a
          >
        </li>
      </ul>
    </nav>
`;
  document.body.insertAdjacentHTML("afterbegin", html);
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
