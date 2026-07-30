"use strict";

export const fetchGrades = async function () {
  try {
    const response = await fetch("/data/grades.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження оцінок: ${err}`);
  }
};
export const fetchGroups = async function () {
  try {
    const response = await fetch("/data/groups.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження груп: ${err}`);
  }
};
export const fetchSchedule = async function () {
  try {
    const response = await fetch("/data/schedule.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження розкладу: ${err}`);
  }
};
export const fetchStudents = async function () {
  try {
    const response = await fetch("/data/students.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження студентів: ${err}`);
  }
};
export const fetchTeachers = async function () {
  try {
    const response = await fetch("/data/teachers.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження викладачів: ${err}`);
  }
};
export const fetchUsers = async function () {
  try {
    const response = await fetch("/data/users.json");
    return await response.json();
  } catch (err) {
    console.error(`Помилка завантаження користувачів: ${err}`);
  }
};
