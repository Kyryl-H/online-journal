"use strict";

// ТИМЧАСОВІ ЗМІННІ (видалимо, коли з'явиться JWT)
const tempUserId = 1;
const tempRole = "teacher";

export const showErrorToast = function (message) {
  const errorDiv = document.createElement("div");

  errorDiv.classList.add("error-msg");

  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
};

export const fetchScheduleForDay = async function () {
  try {
    const response = await fetch("/api/teacher/scheduleForDay", {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка сервера");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showErrorToast(err.message);
    return null;
  }
};

export const fetchTeacherProfile = async function () {
  try {
    const respons = await fetch("/api/teacher/profil", {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });
    return await respons.json();
  } catch (err) {
    console.error(err);
    showErrorToast(err.message);
    return null;
  }
};
