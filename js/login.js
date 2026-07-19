"use strict";

const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  window.location.href = "./html/teacher_html/teacher-main.html";
});
