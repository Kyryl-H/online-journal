"use strict";
import { postLogin } from "./api.js";
import {
  notify,
  initPasswordToggles,
  setFieldError,
  watchFieldErrors,
  focusFirstError,
  shake,
  setLoading,
  navigateWithFade,
} from "./auth-ui.js";

const els = {
  form: document.querySelector("form"),
  email: document.querySelector(".email"),
  password: document.querySelector(".password"),
  loginBtn: document.querySelector(".login"),
  rememberMe: document.querySelector(".remember-me"),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

initPasswordToggles();
watchFieldErrors(els.form);

const validate = () => {
  const email = els.email.value.trim();
  let valid = true;

  if (!email) {
    setFieldError(els.email, "Введіть електронну пошту");
    valid = false;
  } else if (!EMAIL_RE.test(email)) {
    setFieldError(els.email, "Перевірте адресу електронної пошти");
    valid = false;
  }
  if (!els.password.value) {
    setFieldError(els.password, "Введіть пароль");
    valid = false;
  }
  return valid;
};

els.form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validate()) {
    focusFirstError(els.form);
    shake(els.form);
    return;
  }

  let leaving = false;
  setLoading(els.loginBtn, true);

  try {
    const data = await postLogin(
      els.email.value.trim(),
      els.password.value,
      els.rememberMe.checked,
    );

    if (!data) {
      shake(els.form); // повідомлення про помилку показує api.js
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.userRole);
    localStorage.setItem("isCurator", data.isCurator);

    // Редірект залежно від ролі
    const target =
      data.userRole === "TEACHER"
        ? "./teacher/teacher-main.html"
        : data.userRole === "STUDENT"
          ? "./student/student-main.html"
          : null;

    if (!target) {
      notify("Невідома роль користувача. Зверніться до адміністратора.");
      return;
    }

    leaving = true;
    navigateWithFade(target);
  } catch (err) {
    console.error(err);
    notify(err.message || "Не вдалося увійти. Спробуйте ще раз.");
    shake(els.form);
  } finally {
    if (!leaving) setLoading(els.loginBtn, false);
  }
});
