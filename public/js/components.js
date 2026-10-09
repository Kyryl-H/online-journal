"use strict";
import { getMessage } from "./api.js";
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
          <button class="el notif-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Повідомлення">
            <i class="bi bi-bell-fill"></i>
            <span class="notif-badge" hidden>0</span>
          </button>

          <div class="notif-dropdown" role="dialog" aria-label="Повідомлення">
            <div class="notif-header">
              <h3 class="notif-title">Повідомлення</h3>
              <span class="notif-count">0</span>
            </div>
            <ul class="notif-list"></ul>
          </div>
        </li></ul>
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
  initNotifications(role);
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

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// "2026-09-30T00:00:00.000Z" > "30.09.2026"
const formatDate = (iso) => {
  const [y, m, d] = String(iso).split("T")[0].split("-");
  return `${d}.${m}.${y}`;
};

// Малює список і лічильники
const renderNotifications = function (lessons) {
  const root = document.querySelector(".notif");
  if (!root) return;

  const list = root.querySelector(".notif-list");
  const badge = root.querySelector(".notif-badge");
  const count = root.querySelector(".notif-count");

  badge.hidden = lessons.length === 0;
  badge.textContent = lessons.length > 9 ? "9+" : String(lessons.length);
  count.textContent = lessons.length;

  if (lessons.length === 0) {
    list.innerHTML = `<li class="notif-empty">Незаповнених занять немає</li>`;
    return;
  }

  list.innerHTML = lessons
    .map(
      (l) => `
    <li class="notif-item">
      <div class="notif-icon"><i class="bi bi-exclamation-circle-fill"></i></div>
      <div class="notif-body">
        <p class="notif-text">Не заповнений журнал</p>
        <p class="notif-meta">${escapeHtml(l.subject.name)} · ${escapeHtml(l.subject.group.name)}</p>
        <div class="notif-footer">
          <span class="notif-time"><i class="bi bi-calendar3"></i> ${formatDate(l.date)}</span>
          <button
            class="btn-primary notif-btn"
            type="button"
            data-group-id="${escapeHtml(l.subject.group.id)}"
            data-lesson-name="${escapeHtml(l.subject.name)}"
            data-date="${escapeHtml(l.date.split("T")[0])}"
            data-schedule-id="${escapeHtml(l.id)}"
          >Перейти</button>
        </div>
      </div>
    </li>`,
    )
    .join("");
};

// Відкриття/закриття, перехід до журналу, завантаження даних
const initNotifications = async function (role) {
  const root = document.querySelector(".notif");
  if (!root) return;

  const toggle = root.querySelector(".notif-toggle");
  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () =>
    setOpen(!root.classList.contains("is-open")),
  );
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Ті самі параметри, що й на головній сторінці
  root.querySelector(".notif-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".notif-btn");
    if (!btn) return;

    const params = new URLSearchParams({
      groupId: btn.dataset.groupId,
      lessonName: btn.dataset.lessonName,
      path: window.location.pathname,
      data: btn.dataset.date,
      scheduleId: btn.dataset.scheduleId,
    });
    window.location.href = `/teacher/teacher-journal.html?${params}`;
  });

  // Сповіщення про незаповнені пари є лише в викладача
  if (role !== "teacher") return renderNotifications([]);

  try {
    const res = await getMessage();
    renderNotifications(Array.isArray(res?.message) ? res.message : []);
  } catch (err) {
    console.error("Не вдалося завантажити повідомлення:", err);
    renderNotifications([]);
  }
};
