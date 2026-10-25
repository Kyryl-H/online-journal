"use strict";

import { postNewPassword } from "./api.js";
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
  newPassword: document.querySelector(".new-password"),
  repeatedPassword: document.querySelector(".repeated-password"),
  form: document.querySelector("form"),
  submitBtn: document.querySelector(".btn"),
};

initPasswordToggles();
watchFieldErrors(els.form);

const validate = (password, repeated) => {
  let valid = true;

  if (password.length < 8) {
    setFieldError(els.newPassword, "Мінімум 8 символів");
    valid = false;
  } else if (!/[a-zA-Z]/.test(password)) {
    setFieldError(els.newPassword, "Додайте хоча б одну латинську літеру");
    valid = false;
  }

  if (!repeated) {
    setFieldError(els.repeatedPassword, "Повторіть пароль");
    valid = false;
  } else if (password !== repeated) {
    setFieldError(els.repeatedPassword, "Паролі не збігаються");
    valid = false;
  }
  return valid;
};

els.form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const password = els.newPassword.value;
  if (!validate(password, els.repeatedPassword.value)) {
    focusFirstError(els.form);
    shake(els.form);
    return;
  }

  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) {
    notify("Посилання недійсне або застаріле. Запросіть нове.");
    shake(els.form);
    return;
  }

  let done = false;
  setLoading(els.submitBtn, true);

  try {
    const data = await postNewPassword(password, token);
    if (!data) {
      notify("Помилка сервера. Спробуйте ще раз.");
      shake(els.form);
      return;
    }

    done = true;
    notify("Пароль оновлено. Переходимо до входу…", "success", 1800);
    navigateWithFade("/", 1500);
  } catch (err) {
    console.error(err);
    notify(err.message || "Не вдалося оновити пароль. Спробуйте ще раз.");
    shake(els.form);
  } finally {
    if (!done) setLoading(els.submitBtn, false);
  }
});
