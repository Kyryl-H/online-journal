"use strict";
import { changePassword } from "./api.js";
import { showLoader, hideLoader } from "./global.js";

const MIN_LENGTH = 8;

const FIELDS = [
  {
    name: "oldPassword",
    label: "Поточний пароль",
    autocomplete: "current-password",
  },
  { name: "newPassword", label: "Новий пароль", autocomplete: "new-password" },
  {
    name: "confirmPassword",
    label: "Повторіть новий пароль",
    autocomplete: "new-password",
  },
];

const buildModal = () => `
  <div class="pw-overlay hidden"></div>
  <div class="pw-modal hidden" role="dialog" aria-modal="true" aria-labelledby="pwTitle">
    <button class="pw-close" type="button" aria-label="Закрити"><i class="bi bi-x-lg"></i></button>
    <h2 id="pwTitle" class="pw-title">Зміна пароля</h2>
    <form class="pw-form" novalidate>
      ${FIELDS.map(
        (f) => `
        <div class="pw-field">
          <label for="pw-${f.name}">${f.label}</label>
          <div class="pw-input-wrap">
            <input class="pw-input" id="pw-${f.name}" name="${f.name}"
                   type="password" autocomplete="${f.autocomplete}" />
            <button class="pw-eye" type="button" aria-label="Показати пароль">
              <i class="bi bi-eye"></i>
            </button>
          </div>
          <span class="pw-error" data-error-for="${f.name}"></span>
        </div>`,
      ).join("")}
      <p class="pw-status" role="alert" hidden></p>
      <div class="pw-actions">
        <button class="pw-btn pw-btn-cancel" type="button">Скасувати</button>
        <button class="pw-btn pw-btn-submit" type="submit">Зберегти</button>
      </div>
    </form>
  </div>
`;

const validate = ({ oldPassword, newPassword, confirmPassword }) => {
  const errors = {};
  if (!oldPassword) errors.oldPassword = "Введіть поточний пароль";

  if (newPassword.length < MIN_LENGTH) {
    errors.newPassword = `Мінімум ${MIN_LENGTH} символів`;
  } else if (!/\p{L}/u.test(newPassword) || !/\d/.test(newPassword)) {
    errors.newPassword = "Пароль має містити літери та цифри";
  } else if (newPassword === oldPassword) {
    errors.newPassword = "Новий пароль збігається з поточним";
  }

  if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Паролі не збігаються";
  }
  return errors;
};

export const initPasswordReset = function (
  triggerSelector = "#resetPasswordBtn",
) {
  const trigger = document.querySelector(triggerSelector);
  if (!trigger) return;

  document.body.insertAdjacentHTML("beforeend", buildModal());

  const overlay = document.querySelector(".pw-overlay");
  const modal = document.querySelector(".pw-modal");
  const form = modal.querySelector(".pw-form");
  const status = modal.querySelector(".pw-status");
  const submitBtn = modal.querySelector(".pw-btn-submit");

  const showErrors = (errors = {}) => {
    form.querySelectorAll("[data-error-for]").forEach((el) => {
      const msg = errors[el.dataset.errorFor] || "";
      el.textContent = msg;
      form
        .querySelector(`[name="${el.dataset.errorFor}"]`)
        .classList.toggle("invalid", Boolean(msg));
    });
  };

  const setStatus = (text = "", type = "error") => {
    status.hidden = !text;
    status.textContent = text;
    status.className = `pw-status pw-status--${type}`;
  };

  const setBusy = (busy) => {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "Збереження..." : "Зберегти";
  };

  const open = () => {
    form.reset();
    showErrors();
    setStatus();
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
    form.elements.oldPassword.focus();
  };

  const close = () => {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
    trigger.focus();
  };

  trigger.addEventListener("click", open);
  overlay.addEventListener("click", close);
  modal.querySelector(".pw-close").addEventListener("click", close);
  modal.querySelector(".pw-btn-cancel").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
  });

  // Показати / сховати пароль
  modal.querySelectorAll(".pw-eye").forEach((btn) =>
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute(
        "aria-label",
        show ? "Сховати пароль" : "Показати пароль",
      );
      btn.querySelector(".bi").className =
        `bi ${show ? "bi-eye-slash" : "bi-eye"}`;
    }),
  );

  // Прибираємо помилку поля, коли користувач почав друкувати
  form.addEventListener("input", (e) => {
    const err = form.querySelector(`[data-error-for="${e.target.name}"]`);
    if (err) err.textContent = "";
    e.target.classList.remove("invalid");
    setStatus();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errors = validate(data);
    showErrors(errors);

    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      form.elements[firstInvalid].focus();
      return;
    }

    setBusy(true);
    showLoader();
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      form.reset();
      setStatus("Пароль успішно змінено", "success");
      setTimeout(close, 1500);
    } catch (err) {
      setStatus(err.message || "Не вдалося змінити пароль");
    } finally {
      hideLoader();
      setBusy(false);
    }
  });
};
