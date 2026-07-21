"use strict";

const loginForm = document.querySelector("form");
const gmail = document.querySelector(".gmail");
const password = document.querySelector(".password");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  // логін за ролями
  // пізніше буде переписуватися
  try {
    const respons = await fetch("./data/users.json");
    const user = await respons.json();
    const login = user.map((us) => us.login);
    if (login.includes(gmail.value)) {
      if (user[login.indexOf(gmail.value)].role === "student") {
        window.location.href = "./html/student_html/main.html";
      } else if (user[login.indexOf(gmail.value)].role === "teacher") {
        localStorage.setItem("userId", user[login.indexOf(gmail.value)].id);
        window.location.href = "./html/teacher_html/teacher-main.html";
      } else {
        console.log("role undefined");
      }
    } else {
      console.log("Користувача ne знайдено");
    }
  } catch (err) {
    console.error(err);
  }
});
