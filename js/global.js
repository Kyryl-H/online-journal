"use strict";
export const initGlobal = function () {
  // DOM елементи
  const els = {
    sidebar: document.querySelector(".sidebar"),
    btnToggle: document.querySelector(".toggle-btn"),
    links: document.querySelectorAll(".nav-link"),
    exitBtn: document.querySelector(".exit"),
    overlay: document.querySelector(".overlay"),
    modal: document.querySelector(".modal"),
    btnCloseModal: document.querySelector(".btn-close-modal"),
    btnCloseNo: document.querySelector(".exitBtnNo"),
    btnCloseYes: document.querySelector(".exitBtnYes"),
    collapse: localStorage.getItem("collapse"),
  };
  // Бокове меню
  const nav = function () {
    // Запамятовування стану згортання
    if (els.btnToggle && els.sidebar) {
      els.btnToggle.addEventListener("click", function () {
        els.sidebar.classList.toggle("collapsed");
        if (els.sidebar.classList.contains("collapsed")) {
          localStorage.setItem("collapse", "true");
        } else {
          localStorage.setItem("collapse", "false");
        }
      });

      // Згортання бокового меню з localStorage
      if (els.collapse === "false") {
        els.sidebar.classList.remove("collapsed");
      } else {
        els.sidebar.classList.add("collapsed");
      }
      setTimeout(() => document.body.classList.remove("stop-animation"), 10);
    }
    // Додати відображення(підсвітку) перебування на панелі керування
    const currentPath = window.location.pathname;

    els.links.forEach((lin) => {
      lin.classList.remove("nav-active");
      const href = lin.getAttribute("href");
      if (href === "#" || !href) return;
      if (
        currentPath === lin.pathname ||
        (currentPath.includes("journal") && lin.dataset.target === "journal")
      ) {
        lin.classList.add("nav-active");
      }
    });
  };
  // Вихід через модальне вікно
  const setupExit = function () {
    const openModal = function () {
      els.overlay.classList.remove("hidden");
      els.modal.classList.remove("hidden");
    };
    const closeModal = function () {
      els.overlay.classList.add("hidden");
      els.modal.classList.add("hidden");
    };

    els.overlay.addEventListener("click", closeModal);
    els.btnCloseModal.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Bacspace" && !els.modal.classList.contains("hidden")) {
        closeModal();
      }
    });
    els.exitBtn.addEventListener("click", function () {
      openModal();
    });
    els.btnCloseNo.addEventListener("click", function () {
      closeModal();
    });
    els.btnCloseYes.addEventListener("click", function () {
      closeModal();
      window.location.href = "/index.html";
    });
  };

  nav();
  setupExit();
};
