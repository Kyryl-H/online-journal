"use strict";

import { fetchUsers } from "/js/api.js";

const els = {
  loginForm: document.querySelector("form"),
  email: document.querySelector(".email"),
  password: document.querySelector(".password"),
};

els.loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  // логін за ролями
  // пізніше буде переписуватися
  const user = await fetchUsers();
  console.log(user);
  const currentUser = user.find((u) => u.login === els.email.value);
  console.log(currentUser);
  if (currentUser) {
    if (currentUser.role === "student") {
      localStorage.setItem("userId", currentUser.id);
      window.location.href = "./html/student_html/main.html";
    } else if (currentUser.role === "teacher") {
      localStorage.setItem("userId", currentUser.id);
      window.location.href = "./html/teacher_html/teacher-main.html";
    } else {
      console.log("role undefined");
    }
  } else {
    console.log("Користувача ne знайдено");
  }
});
