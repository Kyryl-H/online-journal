const ctx = document.getElementById("gradesChart");

new Chart(ctx, {
  type: "doughnut", // Тип: бублик
  data: {
    labels: ["10-12", "7-9", "4-6", "1-3"], // Назви секцій
    datasets: [
      {
        data: [12, 10, 6, 4], // Твої цифри (кількість студентів)
        backgroundColor: [
          "#0f766e", // Темно-бірюзовий
          "#2563eb", // Синій
          "#f59e0b", // Оранжевий
          "#0ea5e9", // Світло-блакитний
        ],
        borderWidth: 2, // Товщина ліній між шматками
        borderColor: "#ffffff",
      },
    ],
  },
  options: {
    cutout: "60%", // Розмір дірки всередині (щоб був бублик, а не пиріг)
    plugins: {
      legend: {
        display: false, // Ховаємо стандартну легенду, бо ти зверстаєш її сам поруч
      },
    },
  },
});
