"use strict";

import { renderLayout, renderExit } from "../components.js";
import { initGlobal } from "../global.js";
import {
  fetchJournalData,
  postGrades,
  showToast,
  updateTopic,
  createLessons,
  deleteLesson,
} from "../api.js";

const urlParams = new URLSearchParams(window.location.search);

const state = {
  groupId: urlParams.get("groupId"),
  lessonName: urlParams.get("lessonName"),
  path: urlParams.get("path"),
  dateParams: urlParams.get("data") ?? "",
  scheduleId: urlParams.get("scheduleId") ?? "",
  newGrades: [],
  editLessonId: "",

  schedule: [],
  student: [],
  subject: [],
  grades: [],
  date: new Date(),
  month: "",
};
// DOM елемен
const els = {
  selectGroup: document.querySelector(".select-group"),
  comeback: document.querySelector(".comeback"),
  monthContainer: document.querySelector(".month-container"),
  monthBtn: document.querySelectorAll(".monthbtn"),
  tbody: document.querySelector("tbody"),
  dateContainer: document.querySelector(".date-container"),
  searchInput: document.querySelector(".search-input"),
  monthfirst: document.querySelector(".monthbtn"),
  createLessonBtn: document.querySelector(".create-lesson"),
  btnCloseLessonModal: document.querySelector(".btn-close-lessonModal"),
  inputTopicLesson: document.querySelector(".input-topic-lesson"),
  modalOverlay: document.querySelector(".modal-overlay"),
  saveData: document.querySelector(".saveData"),
  printOutbtn: document.querySelector(".print-outbtn"),
  lessonType: document.querySelector(".lesson-type"),
  lessonDate: document.querySelector(".lesson-date"),
  lessonTopic: document.querySelector(".lesson-topic"),
  lessonRoom: document.querySelector(".lesson-room"),
  lessonHomework: document.querySelector(".lesson-homework"),
  lessonNumber: document.querySelector(".lesson-number"),
  modalSaveBtn: document.querySelector(".modal-save-btn"),
  deleteContainer: document.getElementById("delete-container"),
  modalDeleteBtn: document.querySelector(".modal-delete-btn"),
  lessonDelete: document.querySelector(".lesson-delete"),
};

// Рендеринг блока з місяцями
const renderMonthHeader = function (lessonName, groupName) {
  state.month = state.dateParams
    ? Number(state.dateParams.split("-")[1]) - 1
    : state.date.getMonth();

  els.selectGroup.textContent = `${lessonName} ${groupName}`;
  // Налаштування вибору місяця
  if (state.month === 6 || state.month === 7) {
    state.month = 8;
    els.monthfirst.classList.add("monthbtn-active");
  }
  // Добавляння поточнову місяцу статус активного
  const monthActiv = document.querySelector(`[data-number="${state.month}"]`);
  monthActiv.classList.add("monthbtn-active");
  // Навігація по місяцях
  els.monthContainer.onclick = async function (e) {
    let target = e.target;
    if (!target.classList.contains("monthbtn")) return;
    state.month = Number(target.dataset.number);
    // Потрібно оптимізувати
    const data = await fetchJournalData(
      state.groupId,
      state.lessonName,
      state.month,
      true,
    );
    if (data) {
      state.schedule = data.schedule;
      state.grades = data.grades;

      els.monthBtn.forEach((btn) => {
        btn.classList.remove("monthbtn-active");
      });

      target.classList.add("monthbtn-active");
      renderTable(els.searchInput.value);
    } else {
      return;
    }
  };
};

// Рендеринг таблиці
const renderTable = function (searchQuery = "") {
  // Очищення вмісту таблиці
  els.dateContainer.innerHTML = "";
  els.tbody.innerHTML = "";
  // Обрахунок знаходження поточного місяця
  if (state.schedule.length === 0) {
    els.dateContainer.insertAdjacentHTML(
      "beforeend",
      `<tr><td id="date-null" class="date-null">У цьому місяці занять немає</td></tr>`,
    );
    return;
  }
  // Генерування дат в журналі
  els.dateContainer.insertAdjacentHTML(
    "beforeend",
    `<th class="sticky-corner">Учень/День</th>`,
  );
  state.schedule.forEach(function (lesson) {
    const d = new Date(lesson.date);
    const day = String(d.getDate()).padStart(2, "0");
    const monthD = String(d.getMonth() + 1).padStart(2, "0");

    const html = `<th data-id=${lesson.id}>${day}/${monthD} <button class="insert-lesson" data-scheduleId =${lesson.id} data-date=${lesson.date.split("T")[0]}><i class="bi bi-pencil-square"></i></button>
</th>`;
    els.dateContainer.insertAdjacentHTML("beforeend", html);
  });

  // Пошук студентів
  const filterStudent = state.student.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  filterStudent.forEach(function (student, i) {
    let html = `                <tr class="row">
                        <td><div>${i + 1}.${student.fullName}</div></td>
                      
      `;
    // Якщо є оцінка в базі інпут малюємо з оцінкою, немає малюємо пустий інпут
    state.schedule.forEach(function (lesson) {
      const gradesValue = state.grades.find(
        (grade) =>
          grade.studentId == student.id && grade.scheduleId == lesson.id,
      );
      if (gradesValue) {
        html += `<td><input type="text" class="grade-input" data-studentId=${student.id} data-scheduleId = ${lesson.id} value="${gradesValue.value}"/></td>`;
      } else {
        html += `<td><input type="text" class="grade-input" data-studentId=${student.id} data-scheduleId = ${lesson.id} /></td>`;
      }
    });
    html += "</tr>";
    els.tbody.insertAdjacentHTML("beforeend", html);
  });
};

// Пошук студентів
const initSearch = function () {
  els.searchInput.addEventListener("input", function () {
    renderTable(els.searchInput.value);
  });
};

const showLessonModal = function () {
  els.modalOverlay.classList.remove("hidden");
};
const hideLessonModal = function () {
  els.modalOverlay.classList.add("hidden");
  els.modalSaveBtn.classList.remove("edit");
  els.modalSaveBtn.classList.remove("create");
};

// Валідація модального вікна
const validateLessonForm = function () {
  const topicLength = els.lessonTopic.value.trim().length;
  const type = els.lessonType.value;

  let isDateValid = true;
  if (!els.lessonDate.disabled) {
    isDateValid = els.lessonDate.value !== "" && els.lessonDate.checkValidity();
  }

  if (type === "Зошит" || type === "Рубіж" || type === "Семестр") {
    els.modalSaveBtn.disabled = topicLength > 255 || !isDateValid;
  } else {
    els.modalSaveBtn.disabled =
      !(topicLength > 5 && topicLength < 255) || !isDateValid;
  }
};

els.lessonTopic.addEventListener("input", validateLessonForm);

els.lessonType.addEventListener("change", validateLessonForm);

const initLessonModal = function () {
  // Редагування заняття
  els.dateContainer.addEventListener("click", function (e) {
    const btn = e.target.closest(".insert-lesson");

    if (!btn) return;

    const parent = btn.parentElement;
    const lesson = state.schedule.find(
      (l) => l.id === Number(parent.dataset.id),
    );
    if (!lesson) {
      console.error("Заняття не знайдено");
      showToast("Заняття не знайдено");
      return;
    }
    state.editLessonId = lesson.id;
    window.customSelect.set(els.lessonType, lesson.lessonType);
    els.lessonDate.value = lesson.date?.split("T")[0] ?? "";
    window.customSelect.set(els.lessonNumber, lesson.lessonNumber ?? "");
    els.lessonRoom.value = lesson.room ?? "";
    els.lessonTopic.value = lesson.topic ?? "";
    els.lessonHomework.value = lesson.homework ?? "";
    els.lessonDelete.value = "";

    els.modalSaveBtn.classList.add("edit");
    els.deleteContainer.style.display = "block";
    els.modalDeleteBtn.style.display = "block";
    els.modalDeleteBtn.disabled = true;

    showLessonModal();
  });

  // Закрити кнопкою
  els.btnCloseLessonModal.addEventListener("click", hideLessonModal);

  // Закрити по overlay
  els.modalOverlay.addEventListener("click", function (e) {
    if (e.target === els.modalOverlay) hideLessonModal();
  });

  // Закрити по Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideLessonModal();
  });
};

// Створення нового зайняття
const createLesson = function () {
  els.createLessonBtn.addEventListener("click", function () {
    window.customSelect.set(els.lessonType, "Пара");
    els.lessonDate.value = "";
    els.lessonRoom.value = "";
    els.lessonTopic.value = "";
    els.lessonHomework.value = "";

    els.modalSaveBtn.classList.add("create");
    els.deleteContainer.style.display = "none";
    els.modalDeleteBtn.style.display = "none";

    showLessonModal();
  });
};

// Перевірка введених оцінок
const initGradeValidation = function () {
  document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("grade-input")) return;

    const input = e.target;
    const value = input.value.trim();

    const valid =
      value === "" ||
      value === "н" ||
      value === "Н" ||
      (Number(value) >= 1 && Number(value) <= state.subject.gradingSystem);

    if (!valid) {
      input.classList.add("input-values-error");
    } else {
      input.classList.remove("input-values-error");
    }

    if (els.tbody.querySelector(".input-values-error")) {
      els.saveData.disabled = true;
    } else {
      els.saveData.disabled = false;
    }

    if (valid) {
      if (
        state.newGrades.find(
          (v) =>
            v.studentId === input.dataset.studentid &&
            v.scheduleId === input.dataset.scheduleid,
        )
      ) {
        const i = state.newGrades.findIndex(
          (v) =>
            v.studentId === input.dataset.studentid &&
            v.scheduleId === input.dataset.scheduleid,
        );
        state.newGrades[i].value = value;
      } else {
        state.newGrades.push({
          value: `${value}`,
          studentId: input.dataset.studentid,
          scheduleId: input.dataset.scheduleid,
        });
        console.log(state.newGrades);
      }
    }
  });
};
// Відправка оцінок в БД
els.saveData.addEventListener("click", async function () {
  try {
    const gradesPush = await postGrades(state.newGrades);
    state.newGrades = [];
    showToast(gradesPush.message, "info-msg");
  } catch (err) {
    console.error("Помилка при збереженні:", err);
  }
});
// Кнопка створення/оновлення заняття
els.modalSaveBtn.addEventListener("click", async function () {
  let lesson = {};
  lesson = {
    lessonType: els.lessonType.value,
    date: els.lessonDate.value,
    lessonNumber: els.lessonNumber.value,
    room: els.lessonRoom.value,
    topic: els.lessonTopic.value,
    homework: els.lessonHomework.value,
  };
  if (els.modalSaveBtn.classList.contains("edit")) {
    try {
      lesson.id = state.editLessonId;

      const update = await updateTopic(lesson);

      const lessonIndex = state.schedule.findIndex(
        (l) => l.id === Number(state.editLessonId),
      );
      if (lessonIndex !== -1) {
        console.log("Дані оновлені!");
        state.schedule[lessonIndex].lessonType = update.lesson.lessonType;
        state.schedule[lessonIndex].date = update.lesson.date;
        state.schedule[lessonIndex].lessonNumber = update.lesson.lessonNumber;
        state.schedule[lessonIndex].room = update.lesson.room;
        state.schedule[lessonIndex].topic = update.lesson.topic;
        state.schedule[lessonIndex].homework = update.lesson.homework;
      }

      hideLessonModal();
      renderTable();
      showToast(update.message, "info-msg");
    } catch (err) {
      console.error("Помилка при збереженні:", err);
      showToast("Помилка при збереженні");
    }
  } else if (els.modalSaveBtn.classList.contains("create")) {
    try {
      lesson.subjectId = state.subject.id;
      const newLesson = await createLessons(lesson);

      state.schedule.push(newLesson.lesson);
      hideLessonModal();
      renderTable();
      showToast(newLesson.message, "info-msg");
    } catch (err) {
      console.error("Помилка при збереженні:", err);
      showToast("Помилка при збереженні");
    }
  }
});

els.deleteContainer.addEventListener("input", function (e) {
  if (e.target.value.trim() === "ВИДАЛИТИ") {
    els.modalDeleteBtn.disabled = false;
  } else {
    els.modalDeleteBtn.disabled = true;
  }
});

els.modalDeleteBtn.addEventListener("click", async () => {
  if (state.editLessonId) {
    const del = await deleteLesson(state.editLessonId);

    const scheduleIndex = state.schedule.findIndex(
      (l) => l.id === Number(state.editLessonId),
    );
    state.schedule.splice(scheduleIndex, 1);

    hideLessonModal();
    renderTable();
    showToast(del.message, "info-msg");
  } else {
    console.error("Помилка видалення: заняття не знайжено");
    showToast("Заняття не знайжено");
  }
});

// Кнопка "Назад"
const initNavigation = function () {
  els.comeback.addEventListener("click", function () {
    window.location.href = `${state.path}`;
  });
};
// Валідація дат
const setDateLimits = function () {
  const dateInput = document.getElementById("lesson-date");
  if (!dateInput) return;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let startYear, endYear;
  if (currentMonth >= 8) {
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  dateInput.min = `${startYear}-09-01`;
  dateInput.max = `${endYear}-06-30`;
};

const formatDateUA = (iso) => iso.split("-").reverse().join(".");

const setupDateValidation = function () {
  const dateInput = document.getElementById("lesson-date");
  const errorEl = document.getElementById("lesson-date-error");
  if (!dateInput || !errorEl) return;

  setDateLimits();

  // Повертає текст помилки або "" якщо все гаразд
  const getError = () => {
    const { validity, value, min, max } = dateInput;

    if (validity.badInput) return "Введіть повну та коректну дату";
    if (validity.valueMissing || !value) return "Оберіть дату";
    if (validity.rangeUnderflow)
      return `Дата не може бути раніше ${formatDateUA(min)}`;
    if (validity.rangeOverflow)
      return `Дата не може бути пізніше ${formatDateUA(max)}`;

    return "";
  };

  const showError = (message) => {
    errorEl.textContent = message;
    dateInput.classList.toggle("invalid", Boolean(message));
    dateInput.setCustomValidity(message); // щоб працював form.checkValidity()
  };

  // Під час набору: не лаємось, поки дата неповна, але прибираємо помилку, коли стала валідною
  dateInput.addEventListener("input", () => {
    dateInput.setCustomValidity(""); // скидаємо, щоб validity оновилась
    if (!getError()) showError("");
  });

  dateInput.addEventListener("change", () => {
    dateInput.setCustomValidity("");
    showError(getError());
  });

  dateInput.addEventListener("blur", () => {
    dateInput.setCustomValidity("");
    showError(getError());
  });

  // Для виклику перед збереженням
  dateInput.validateDate = () => {
    dateInput.setCustomValidity("");
    const message = getError();
    showError(message);
    return !message;
  };
};

setupDateValidation();
const initModalValidation = function () {
  const modalContainer = document.querySelector(".input-topic-lesson");

  const validate = () => {
    const isTypeValid = els.lessonType.value.trim() !== "";
    const isRoomValid = els.lessonRoom.value.trim() !== "";
    const isTimeValid = els.lessonNumber.value.trim() !== "";

    const isDateValid =
      els.lessonDate.value.trim() !== "" && els.lessonDate.checkValidity();

    els.modalSaveBtn.disabled = !(
      isTypeValid &&
      isDateValid &&
      isRoomValid &&
      isTimeValid
    );
  };

  modalContainer.addEventListener("input", validate);
  modalContainer.addEventListener("change", validate);

  validate();
};
// Ініціалізація функціоналу сторінки
const moreFunctionality = function () {
  initSearch();
  initLessonModal();
  createLesson();
  initGradeValidation();
  initNavigation();
  setDateLimits();
  initModalValidation();
};
const render = async function () {
  if (!state.groupId || !state.lessonName) {
    console.error("Помилка: не передано параметри групи");
    window.location.href = "/teacher/journal-main.html";
    return;
  }

  const data = await fetchJournalData(
    state.groupId,
    state.lessonName,
    state.dateParams
      ? Number(state.dateParams.split("-")[1]) - 1
      : state.date.getMonth(),
  );

  if (!data) {
    console.log("Помилка завантаження даних");
    window.location.href = "/teacher/journal-main.html";
  }

  renderLayout("teacher", true);
  renderExit();
  initGlobal();

  state.schedule = data.schedule;
  state.student = data.student;
  state.grades = data.grades;
  state.subject = data.subject;

  renderMonthHeader(state.subject.name, data.subject.group.name);
  renderTable();
  moreFunctionality();

  if (state.date && state.scheduleId) {
    console.log(state.scheduleId);
    const currentBtn = document.querySelector(
      `.insert-lesson[data-scheduleid="${state.scheduleId}"]`,
    );
    if (currentBtn) {
      currentBtn.click();
    }
  }
};

render();
