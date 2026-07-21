"use strict";
//бокове меню
const sidebar = document.querySelector(".sidebar");
const btnToggle = document.querySelector(".toggle-btn");
let collapse = localStorage.getItem("collapse");
// запамятовування стану згортання
btnToggle.addEventListener("click", function () {
  sidebar.classList.toggle("collapsed");
  if (typeof Storage !== "undefined") {
    if (sidebar.classList.contains("collapsed") === true) {
      localStorage.setItem("collapse", "true");
    } else {
      localStorage.setItem("collapse", "false");
    }
  } else {
    console.log("Error not working Web storage");
  }
});
// згортання бокового меню з localStorage
document.addEventListener("DOMContentLoaded", function () {
  if (collapse === "false") {
    sidebar.classList.remove("collapsed");
  } else {
    sidebar.classList.add("collapsed");
  }
  setTimeout(() => document.body.classList.remove("stop-animation"), 10);
});
// додати відображення(підсвітку) перебування на панелі керування
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".nav-link");

  links.forEach((lin) => {
    lin.classList.remove("nav-active");

    if (lin.getAttribute("href") === "#" || !lin.getAttribute("href")) return;
    if (currentPath === lin.pathname) {
      lin.classList.add("nav-active");
    }
  });
});
// реалізувати функціонал виходу з акаунту точніше поки немає бекенда то аналог виходу
const exitBtn = document.querySelector(".exit");
const overlay = document.querySelector(".overlay");
const modal = document.querySelector(".modal");
const btnCloseModal = document.querySelector(".btn-close-modal");
const btnCloseNo = document.querySelector(".exitBtnNo");
const btnCloseYes = document.querySelector(".exitBtnYes");

const openModal = function () {
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
};
const closeModal = function () {
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
};

overlay.addEventListener("click", closeModal);
btnCloseModal.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Bacspace" || !modal.classList.contains("hidden")) {
    closeModal();
  }
});
exitBtn.addEventListener("click", function () {
  openModal();
});
btnCloseNo.addEventListener("click", function () {
  closeModal();
});
btnCloseYes.addEventListener("click", function () {
  closeModal();
  window.location.href = "/index.html";
});
