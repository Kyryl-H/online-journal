"use strict";

import { fetchUsers } from "/js/api.js";

const loginForm = document.querySelector("form");
const email = document.querySelector(".email");
const password = document.querySelector(".password");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  // логін за ролями
  // пізніше буде переписуватися
  const user = await fetchUsers();
  console.log(user);
  const currentUser = user.find((u) => u.login === email.value);
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
