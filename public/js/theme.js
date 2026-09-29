/*
 * Підключати в <head> БЕЗ defer/async, на кожній сторінці (включно з login):
 *   <script src="theme.js"></script>
 * Так збережена тема застосується до першого малювання і не буде «спалаху».
 *
 * Кнопка-перемикач (де завгодно):
 *   <button class="icon-btn" data-theme-toggle aria-label="Змінити тему">
 *     <i class="bi bi-moon-stars"></i>
 *   </button>
 */
(() => {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const readSaved = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null; // localStorage недоступний (приватний режим тощо)
    }
  };

  const save = (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  };

  // Поточна тема: явний вибір користувача або системна
  const currentTheme = () =>
    root.dataset.theme || (systemDark.matches ? "dark" : "light");

  // Іконка показує, на що перемкнемо: у темній темі — сонце, у світлій — місяць
  const syncButtons = () => {
    const isDark = currentTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isDark));
      const icon = btn.querySelector(".bi");
      icon?.classList.toggle("bi-sun", isDark);
      icon?.classList.toggle("bi-moon-stars", !isDark);
    });
  };

  const setTheme = (theme) => {
    // .stop-animation (див. global.css) вимикає transition на час перемикання,
    // щоб кольори змінилися миттєво, а не «попливли»
    root.classList.add("stop-animation");
    root.dataset.theme = theme;
    save(theme);
    syncButtons();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("stop-animation")),
    );
  };

  // 1. Застосувати збережений вибір одразу (скрипт стоїть у <head>)
  const saved = readSaved();
  if (saved) root.dataset.theme = saved;

  // 2. Кнопки-перемикачі (можуть з'явитися в DOM пізніше)
  // Делегування: працює і для кнопок, які components.js додає в DOM пізніше
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-theme-toggle]")) {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    }
  });
  document.addEventListener("DOMContentLoaded", syncButtons);
  window.syncThemeButtons = syncButtons; // викликається з components.js

  // 3. Якщо користувач ще не обирав вручну — слідкуємо за системною темою
  systemDark.addEventListener("change", syncButtons);
})();
