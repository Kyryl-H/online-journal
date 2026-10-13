"use strict";

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

//  Базові хелпери

// Запит із токеном. Кидає Error з повідомленням сервера, якщо відповідь не ok.
const request = async function (url, { method = "GET", body } = {}) {
  const headers = { Authorization: "Bearer " + localStorage.getItem("token") };
  const hasBody = body !== undefined;

  if (hasBody) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Помилка сервера");
  }

  return data;
};

// Те саме, але помилку показує тостом і повертає null
const safeRequest = async function (url, options) {
  try {
    return await request(url, options);
  } catch (err) {
    console.error(err);
    showToast(err.message);
    return null;
  }
};

//  Головна, профіль

export const fetchScheduleForDay = () => safeRequest("/api/scheduleForDay");

export const fetchTeacherProfile = () => safeRequest("/api/profil");

export const fetchStudentGrades = () => safeRequest("/api/student/grades");

//  Журнал

export const fetchTeacherJournalMain = () =>
  safeRequest("/api/teacher/journalMain");

export const fetchJournalData = function (
  groupId,
  lessonName,
  month,
  isPartial = false,
) {
  const query = isPartial ? "?partial=true" : "";
  return safeRequest(
    `/api/teacher/journal/${groupId}/${encodeURIComponent(lessonName)}/${month}${query}`,
  );
};

export const postGrades = (grades) =>
  safeRequest("/api/teacher/post/grades", { method: "POST", body: grades });

export const updateTopic = (lesson) =>
  safeRequest("/api/teacher/journal/updateLesson", {
    method: "PATCH",
    body: lesson,
  });

export const createLessons = (lesson) =>
  safeRequest("/api/teacher/createLessons", { method: "POST", body: lesson });

export const deleteLesson = (lessonId) =>
  safeRequest(`/api/teacher/lessons/${lessonId}`, { method: "DELETE" });

//  Куратор

export const getCuratorGroup = () => safeRequest("/api/curator/groups");

export const getCuratorStudents = (groupId, year, month) =>
  safeRequest(`/api/curator/${groupId}/${year}/${month}`);

//  Розклад

// STUDENT: { myGroup, group: [усі групи] }, TEACHER: { group: [групи, де викладає] }
export const getGroup = () => safeRequest("/api/groups");

// Розклад групи за період — масив пар
export const getSchedule = (groupId, start, end) =>
  safeRequest(`/api/schedule/${groupId}/${start}/${end}`);

// Власний розклад викладача за період — масив пар
export const getMySchedule = (start, end) =>
  safeRequest(`/api/teacher-schedule/${start}/${end}`);

// Розклад власної групи студента: { role, group, schedule }. Кидає помилку.
export const getStudentOwnSchedule = (start, end) =>
  request(`/api/student/schedule?start=${start}&end=${end}`);

//  Інше

export const getMessage = () => safeRequest("/api/teacher/message");

// Кидає помилку — її показує сама форма
export const changePassword = (data) =>
  request("/api/teacher/change-password", { method: "PATCH", body: data });
