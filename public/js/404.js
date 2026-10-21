const goBack = document.getElementById("goBack");
const home = document.querySelector(".btn-primary");
const role = localStorage.getItem("role");

if (role === "STUDENT") {
  home.href = "/student/student-main.html";
} else if (role === "TEACHER") {
  home.href = "/teacher/teacher-main.html";
} else {
  home.href = "/";
}

goBack.addEventListener("click", () => {
  if (history.length > 1) history.back();
  else location.href = "/";
});
