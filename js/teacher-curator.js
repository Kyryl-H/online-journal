"use strict";
const userId = localStorage.getItem("userId");
const render = async function () {
  const select = document.querySelector(".group-select");
  const studentContainer = document.querySelector(".student-container");
  const searchInput = document.querySelector(".search-input");
  const groupGrades = document.querySelector(".group-grades");
  const groupPasses = document.querySelector(".group-passes");
  const ctx = document.getElementById("gradesChart");
  const monthEl = document.querySelector(".month");
  const legendDiagram = document.querySelector(".legend-diagram");
  const legendRow = document.querySelectorAll(".legend-row");
  const modalOverlay = document.querySelector(".modal-overlay");
  const reportBtn = document.querySelector(".report-btn");
  const btnCloseModal = document.querySelector(".btn-close-modal");
  let myChart = null;

  try {
    const p1 = await fetch("/data/teachers.json");
    const p2 = await fetch("/data/groups.json");
    const p3 = await fetch("/data/students.json");
    const p4 = await fetch("/data/grades.json");
    const p5 = await fetch("/data/schedule.json");
    const [res1, res2, res3, res4, res5] = await Promise.all([
      p1,
      p2,
      p3,
      p4,
      p5,
    ]);

    const curator = await res1.json();
    const group = await res2.json();
    const student = await res3.json();
    const grades = await res4.json();
    const schedule = await res5.json();

    const [currentcurator] = curator.filter((cur) => cur.user_id == userId);
    const curatorId = currentcurator.id;
    // вибір групи
    const currentgroup = group.filter((group) => group.curator_id == curatorId);
    currentgroup.forEach(function (g) {
      const html = `<option value="${g.id}">${g.name}</option>`;
      select.insertAdjacentHTML("beforeend", html);
    });
    //рендеринг картки студента за його ід
    let groupStudent;
    const renderStudentList = function (groupid, searchQuery = "") {
      studentContainer.innerHTML = "";

      groupStudent = student.filter((g) => g.group_id == groupid);
      groupStudent = groupStudent.filter((s) =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      groupStudent.sort((a, b) => a.full_name.localeCompare(b.full_name, "uk"));
      groupStudent.forEach((stud, i) => {
        const html = `            <div class="card-row">
              <div class="student-number">${i + 1}</div>
              <div class="icon-box"><i class="bi bi-person"></i></div>
              <div class="full-name">${stud.full_name}</div>
            </div>
`;
        studentContainer.insertAdjacentHTML("beforeend", html);
      });
    };
    // зміна групи в рендеренгу
    select.addEventListener("change", function (e) {
      const selectValue = e.target.value;
      renderStudentList(selectValue);
      renderStatistics(selectValue);
    });
    // перша заргузка
    renderStudentList(select.value);
    // пошук студентів
    searchInput.addEventListener("input", () => {
      renderStudentList(select.value, searchInput.value);
    });
    // right card
    //current month
    const date = new Date();
    const days = [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ];
    const year = date.getFullYear();
    const month = 8;
    monthEl.textContent = days[month];

    //  рендер статистики
    const renderStatistics = function (selectValue) {
      const sheduleOfMonth = schedule
        .filter((group) => group.group_id == selectValue)
        .filter((lesson) => {
          const [day, monthD, years] = lesson.date.split("-");
          return (
            new Date(years, Number(monthD) - 1, day) >=
              new Date(year, month, 1) &&
            new Date(years, Number(monthD) - 1, day) <=
              new Date(year, month + 1, 0)
          );
        })
        .map((day) => day.id);
      const currentStudent = groupStudent.map((st) => st.id);
      const grade = grades.filter(
        (g) =>
          sheduleOfMonth.includes(g.schedule_id) &&
          currentStudent.includes(g.student_id),
      );
      let countN = 0;
      let sum = 0;
      grade.forEach(function (g) {
        if (g.value === "н") {
          countN++;
        } else {
          sum += Number(g.value);
        }
      });
      groupPasses.textContent = countN;
      groupGrades.textContent = (sum / (grade.length - countN)).toFixed(2);
      // підрахунок оцінок для діаграми
      let dataGradeDiagram = [0, 0, 0, 0];
      grade.forEach(function (el) {
        const currentLesson = schedule.find((les) => les.id == el.schedule_id);
        if (currentLesson.grading_system === 5) {
          if (Number(el.value) === 5) {
            dataGradeDiagram[0]++;
          }
          if (Number(el.value) === 4) {
            dataGradeDiagram[1]++;
          }
          if (Number(el.value) === 3) {
            dataGradeDiagram[2]++;
          }
          if (Number(el.value) === 2) {
            dataGradeDiagram[3]++;
          }
        }
        if (currentLesson.grading_system === 12) {
          if (Number(el.value) >= 10 && Number(el.value) <= 12) {
            dataGradeDiagram[0]++;
          }
          if (Number(el.value) >= 7 && Number(el.value) <= 9) {
            dataGradeDiagram[1]++;
          }
          if (Number(el.value) >= 4 && Number(el.value) <= 6) {
            dataGradeDiagram[2]++;
          }
          if (Number(el.value) >= 1 && Number(el.value) <= 3) {
            dataGradeDiagram[3]++;
          }
        }
      });
      //малювання діаграми
      if (myChart) {
        myChart.destroy();
      }

      myChart = new Chart(ctx, {
        type: "doughnut",

        data: {
          labels: [
            "Відмінно (10-12 або 5)",
            "Добре (7-9 або 4)",
            "Задовільно (4-6 або 3)",
            "Незадовільно (1-3 або 2)",
          ],

          datasets: [
            {
              data: dataGradeDiagram,

              backgroundColor: ["#0f766e", "#2563eb", "#f59e0b", "#0ea5e9"],

              borderWidth: 2,

              borderColor: "#ffffff",
              hoverOffset: 15,
            },
          ],
        },

        options: {
          cutout: "60%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          layout: {
            padding: 15,
          },
          onHover: function (event, elements) {
            if (elements.length > 0) {
              const activeIndex = elements[0].index;
              legendRow.forEach((row) => {
                row.classList.remove("hovered");
                if (row.dataset.index == activeIndex) {
                  row.classList.add("hovered");
                }
              });
            } else {
              legendRow.forEach((row) => row.classList.remove("hovered"));
            }
          },
        },
      });
    };
    // розташування легенди
    const rect = ctx.getBoundingClientRect();
    legendDiagram.style.top = `${rect.top + window.scrollY + 30}px`;
    legendDiagram.style.left = `${rect.left + window.scrollX + 220}px`;
    // підсвітка вибраного сектора
    legendRow.forEach((row) => {
      row.addEventListener("mouseenter", function () {
        const index = this.getAttribute("data-index");

        myChart.setActiveElements([{ datasetIndex: 0, index: Number(index) }]);
        myChart.update();
      });
      row.addEventListener("mouseleave", function () {
        myChart.setActiveElements([]);
        myChart.update();
      });
    });
    // кнопка експорту
    reportBtn.addEventListener("click", function () {
      modalOverlay.classList.remove("hidden");
    });
    modalOverlay.addEventListener("click", function (e) {
      const target = e.target;
      if (target.classList.contains("modal-overlay")) {
        modalOverlay.classList.add("hidden");
      }
    });
    btnCloseModal.addEventListener("click", function () {
      modalOverlay.classList.add("hidden");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        modalOverlay.classList.add("hidden");
      }
    });
    renderStatistics(select.value);
  } catch (err) {
    console.error(`Помилка: ${err.message}`);
  }
};
render();
