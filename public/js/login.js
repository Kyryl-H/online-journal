"use strict";
import { showToast } from "./api.js";

const els = {
  email: document.querySelector(".email"),
  password: document.querySelector(".password"),
  loginBtn: document.querySelector(".login"),
};

els.loginBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gmail: els.email.value,
        password: els.password.value,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.userRole);
    localStorage.setItem("isCurator", data.isCurator);

    // Робимо редірект залежно від ролі
    if (data.userRole === "TEACHER") {
      window.location.href = "./teacher/teacher-main.html";
    } else if (data.userRole === "STUDENT") {
      window.location.href = "./student/student-main.html";
    }
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
});
