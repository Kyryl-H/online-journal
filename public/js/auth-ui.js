"use strict";

/*  Повідомлення (тости)  */
export const notify = (text, type = "error", ms = 5000) => {
  document.querySelectorAll(".auth-toast").forEach((el) => el.remove());

  const toast = document.createElement("div");
  toast.className = `auth-toast auth-toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.style.setProperty("--toast-ms", `${ms}ms`);

  const label = document.createElement("span");
  label.className = "auth-toast__text";
  label.textContent = text;
  toast.append(label);

  toast.addEventListener("click", () => toast.remove());
  document.body.append(toast);
  setTimeout(() => toast.remove(), ms);
  return toast;
};

/*  Око «показати / сховати пароль»  */
export const initPasswordToggles = (root = document) => {
  root.querySelectorAll(".eye-toggle").forEach((btn) => {
    const input = btn.closest(".input-box")?.querySelector("input");
    if (!input) return;

    // не забираємо фокус із поля при кліку мишею / дотику
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      const { selectionStart, selectionEnd } = input;

      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute(
        "aria-label",
        show ? "Сховати пароль" : "Показати пароль",
      );
      try {
        input.setSelectionRange(selectionStart, selectionEnd);
      } catch {}
    });
  });
};

/*  Помилки під полями  */
const getSlot = (input) => {
  const box = input.closest(".input-box");
  if (!box) return null;

  let slot = box.querySelector(".field-error");
  if (!slot) {
    slot = document.createElement("span");
    slot.className = "field-error";
    slot.id = `${input.id || input.name}-error`;
    slot.setAttribute("aria-live", "polite");
    box.append(slot);
  }
  return slot;
};

export const setFieldError = (input, message = "") => {
  const slot = getSlot(input);
  if (!slot) return;

  slot.textContent = message;
  input.closest(".input-box").classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  if (message) input.setAttribute("aria-describedby", slot.id);
  else input.removeAttribute("aria-describedby");
};

// Помилка зникає, щойно користувач починає друкувати в полі
export const watchFieldErrors = (form) =>
  form.addEventListener("input", (e) => {
    if (e.target.matches(".input-box input")) setFieldError(e.target, "");
  });

export const focusFirstError = (form) =>
  form.querySelector(".input-box.has-error input")?.focus();

/*  Анімації станів  */
export const shake = (el) => {
  el.classList.remove("is-shake");
  void el.offsetWidth; // перезапуск анімації
  el.classList.add("is-shake");
  el.addEventListener("animationend", () => el.classList.remove("is-shake"), {
    once: true,
  });
};

export const setLoading = (btn, loading) => {
  btn.disabled = loading;
  btn.classList.toggle("is-loading", loading);
  btn.setAttribute("aria-busy", String(loading));
};

// Плавне зникнення картки перед переходом на іншу сторінку
export const navigateWithFade = (url, delay = 350) => {
  document.body.classList.add("is-leaving");
  setTimeout(() => {
    window.location.href = url;
  }, delay);
};
