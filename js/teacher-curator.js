"use strict";
const userId = localStorage.getItem("userId");
const render = async function () {
  const select = document.querySelector(".group-select");
  const studentContainer = document.querySelector(".student-container");
  const searchInput = document.querySelector(".search-input");
  const groupGrades = document.querySelector(".group-grades");
  const groupPasses = document.querySelector(".group-passes");
  try {
    const p1 = await fetch("/data/teachers.json");
    const p2 = await fetch("/data/groups.json");
    const p3 = await fetch("/data/students.json");
    const [res1, res2, res3] = await Promise.all([p1, p2, p3]);

    const curator = await res1.json();
    const group = await res2.json();
    const student = await res3.json();

    const [currentcurator] = curator.filter((cur) => cur.user_id == userId);
    const curatorId = currentcurator.id;
    // вибір групи

    const currentgroup = group.filter((group) => group.curator_id == curatorId);
    currentgroup.forEach(function (g) {
      const html = `<option value="${g.id}">${g.name}</option>`;
      select.insertAdjacentHTML("beforeend", html);
    });
    //рендеринг картки студента за його ід

    const renderStudentList = function (groupid, searchQuery = "") {
      studentContainer.innerHTML = "";

      let groupStudent = student.filter((g) => g.group_id == groupid);
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
    });
    // перша заргузка
    renderStudentList(select.value);
    // пошук студентів
    searchInput.addEventListener("input", () => {
      renderStudentList(select.value, searchInput.value);
    });
  } catch (err) {
    console.error(`Помилка: ${err.message}`);
  }
};
render();
