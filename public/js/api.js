"use strict";

export const fetchGrades = async function () {
  try {
    const response = await fetch("/api/grades");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження оцінок: ${err}`);
  }
};
export const fetchGroups = async function () {
  try {
    const response = await fetch("/api/groups");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження груп: ${err}`);
  }
};
export const fetchSchedule = async function () {
  try {
    const response = await fetch("/api/schedule");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження розкладу: ${err}`);
  }
};
export const fetchStudents = async function () {
  try {
    const response = await fetch("/api/students");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження студентів: ${err}`);
  }
};
export const fetchTeachers = async function () {
  try {
    const response = await fetch("/api/teachers");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження викладачів: ${err}`);
  }
};
export const fetchUsers = async function () {
  try {
    const response = await fetch("/api/users");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження користувачів: ${err}`);
  }
};
