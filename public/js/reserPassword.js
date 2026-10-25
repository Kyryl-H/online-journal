"use strict";
import { sendLetter } from "./api.js";
import {
  notify,
  setFieldError,
  watchFieldErrors,
  focusFirstError,
  shake,
  setLoading,
} from "./auth-ui.js";

const els = {
  email: document.querySelector(".email"),
  form: document.querySelector("form"),
  submitBtn: document.querySelector(".reset"),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

watchFieldErrors(els.form);

const REDIRECT_MESSAGES = {
  "invalid-link":
    "Посилання недійсне або його час дії минув. Замовте нове скидання пароля.",
};

const reason = new URLSearchParams(window.location.search).get("error");
if (reason && REDIRECT_MESSAGES[reason]) {
  notify(REDIRECT_MESSAGES[reason], "error", 7000);
  history.replaceState(null, "", window.location.pathname);
}

els.form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = els.email.value.trim();
  if (!email || !EMAIL_RE.test(email)) {
    setFieldError(
      els.email,
      email ? "Перевірте адресу електронної пошти" : "Введіть електронну пошту",
    );
    focusFirstError(els.form);
    shake(els.form);
    return;
  }

  setLoading(els.submitBtn, true);
  try {
    const respons = await sendLetter(email);
    if (!respons) {
      shake(els.form); // повідомлення про помилку показує api.js
      return;
    }
    notify(
      respons.message || "Лист надіслано. Перевірте пошту.",
      "success",
      6000,
    );
  } catch (err) {
    console.error(err);
    notify(err.message || "Не вдалося надіслати лист. Спробуйте ще раз.");
    shake(els.form);
  } finally {
    setLoading(els.submitBtn, false);
  }
});
