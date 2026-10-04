"use strict";

// ТИМЧАСОВІ ЗМІННІ (видалимо, коли з'явиться JWT)
const tempUserId = 1;
const tempRole = "teacher";
// Спливаючі повідомлення про помилку
export const showToast = function (message, type = "error-msg") {
  const msgDiv = document.createElement("div");

  msgDiv.classList.add(type);

  msgDiv.textContent = message;

  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 5000);
};
// Головна сторінка
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
    showToast(err.message);
    return null;
  }
};
// Профіль
export const fetchTeacherProfile = async function () {
  try {
    const response = await fetch("/api/teacher/profil", {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};
// Журнал
export const fetchTeacherJournalMain = async function () {
  try {
    const response = await fetch(`/api/teacher/journalMain`, {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};
export const fetchJournalData = async function (
  groupId,
  lessonName,
  month,
  isPartial = false,
) {
  try {
    let url = `/api/teacher/journal/${groupId}/${lessonName}/${month}`;

    if (isPartial) {
      url += `?partial=true`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

export const postGrades = async function (grades) {
  try {
    const response = await fetch("/api/teacher/post/grades", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "user-id": tempUserId,
        "user-role": tempRole,
      },
      body: JSON.stringify(grades),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

export const getGroup = async function () {
  try {
    const response = await fetch("/api/groups", {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

export const getSchedule = async function (groupId, start, end) {
  try {
    const response = await fetch(`/api/schedule/${groupId}/${start}/${end}`, {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

export const getCuratorGroup = async function () {
  try {
    const response = await fetch("/api/curator/groups", {
      method: "GET",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};
export const getCuratorStudents = async function (groupId, year, month) {
  try {
    const response = await fetch(`/api/curator/${groupId}/${year}/${month}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

export const updateTopic = async function (lesson) {
  try {
    const response = await fetch(`/api/teacher/journal/updateLesson`, {
      method: "PATCH",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};
export const createLesson = async function (lesson) {
  try {
    const response = await fetch("/api/teacher/createLesson", {
      method: "POST",
      headers: {
        "user-id": tempUserId,
        "user-role": tempRole,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};
