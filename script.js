// === GLOBAL VARIABLES ===
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const themeToggle = document.getElementById("themeToggle");

let calendar;

// === FULLCALENDAR INITIALIZATION ===
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek,dayGridDay",
    },
    events: [],
  });
  calendar.render();
  loadTasks(); // Load saved tasks after calendar initializes
});

// === TO-DO LIST FUNCTIONALITY ===
function addTask() {
  const taskText = taskInput.value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskTime = document.getElementById("taskTime").value;

  if (taskText === "") return;

  const li = document.createElement("li");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;
  taskSpan.className = "task-text";

  const dateSpan = document.createElement("small");
  if (taskDate) {
    const formattedDate = new Date(taskDate).toLocaleDateString();
    const formattedTime = taskTime ? ` @ ${taskTime}` : "";
    dateSpan.textContent = ` (Due: ${formattedDate}${formattedTime})`;
    dateSpan.style.marginLeft = "8px";
    dateSpan.style.fontSize = "12px";
    dateSpan.style.color = "#555";
  }

  const textWrapper = document.createElement("div");
  textWrapper.appendChild(taskSpan);
  if (taskDate) textWrapper.appendChild(dateSpan);

  const btnContainer = document.createElement("div");
  btnContainer.className = "task-buttons";

  const completeBtn = document.createElement("button");
  completeBtn.textContent = "✔️";
  completeBtn.onclick = () => {
    taskSpan.classList.toggle("done");
    saveTasks();
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
  };

  btnContainer.appendChild(completeBtn);
  btnContainer.appendChild(deleteBtn);

  li.appendChild(textWrapper);
  li.appendChild(btnContainer);
  taskList.appendChild(li);

  addTaskToCalendar(taskText, taskDate, taskTime);
  saveTasks();

  taskInput.value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTime").value = "";
}

function addTaskToCalendar(taskText, taskDate, taskTime) {
  if (!taskDate || !calendar) return;

  const startDateTime = taskTime ? `${taskDate}T${taskTime}` : taskDate;

  calendar.addEvent({
    title: taskText,
    start: startDateTime,
    allDay: !taskTime,
  });
}

// === SAVE & LOAD TASKS ===
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    const text = li.querySelector(".task-text")?.textContent || "";
    const isDone = li.querySelector(".task-text")?.classList.contains("done") || false;
    const dateSmall = li.querySelector("small")?.textContent || "";
    tasks.push({ text, isDone, dateSmall });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => {
    const li = document.createElement("li");

    const taskSpan = document.createElement("span");
    taskSpan.textContent = task.text;
    taskSpan.className = "task-text";
    if (task.isDone) taskSpan.classList.add("done");

    const dateSpan = document.createElement("small");
    dateSpan.textContent = task.dateSmall;
    dateSpan.style.marginLeft = "8px";
    dateSpan.style.fontSize = "12px";
    dateSpan.style.color = "#555";

    const textWrapper = document.createElement("div");
    textWrapper.appendChild(taskSpan);
    if (task.dateSmall) textWrapper.appendChild(dateSpan);

    const btnContainer = document.createElement("div");
    btnContainer.className = "task-buttons";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔️";
    completeBtn.onclick = () => {
      taskSpan.classList.toggle("done");
      saveTasks();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => {
      li.remove();
      saveTasks();
    };

    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(textWrapper);
    li.appendChild(btnContainer);
    taskList.appendChild(li);
  });
}

// === DARK MODE TOGGLE ===
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// === POMODORO TIMER ===
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let isBreak = false;

function updateTimerDisplay() {
  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        isBreak = !isBreak;

        if (isBreak) {
          minutes = 5;
          document.getElementById("timerStatus").textContent = "Break time!";
        } else {
          minutes = 25;
          document.getElementById("timerStatus").textContent = "Focus time";
        }
        seconds = 0;
        updateTimerDisplay();
        startTimer();
        return;
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isBreak = false;
  minutes = 25;
  seconds = 0;
  updateTimerDisplay();
  document.getElementById("timerStatus").textContent = "Focus time";
}

updateTimerDisplay(); // initial call

// === THEME COLOR SWITCHING ===
function setTheme(color) {
  switch (color) {
    case "green":
      document.documentElement.style.setProperty("--accent-color", "#2e7d32");
      document.documentElement.style.setProperty("--accent-dark", "#1b5e20");
      document.documentElement.style.setProperty("--accent-light", "#d0f0dc");
      document.documentElement.style.setProperty("--text-heading", "#2e7d32");
      document.documentElement.style.setProperty("--btn-hover", "#388e3c");
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(to right, #56ab2f, #a8e063)");
      break;
    case "blue":
      document.documentElement.style.setProperty("--accent-color", "#1976d2");
      document.documentElement.style.setProperty("--accent-dark", "#0d47a1");
      document.documentElement.style.setProperty("--accent-light", "#dceeff");
      document.documentElement.style.setProperty("--text-heading", "#1976d2");
      document.documentElement.style.setProperty("--btn-hover", "#2196f3");
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(to right, #36d1dc, #5b86e5)");
      break;
    case "orange":
      document.documentElement.style.setProperty("--accent-color", "#e65100");
      document.documentElement.style.setProperty("--accent-dark", "#bf360c");
      document.documentElement.style.setProperty("--accent-light", "#ffead6");
      document.documentElement.style.setProperty("--text-heading", "#e65100");
      document.documentElement.style.setProperty("--btn-hover", "#ff7043");
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(to right, #f3904f, #ffcc70)");
      break;
    default: // purple
      document.documentElement.style.setProperty("--accent-color", "#6600af");
      document.documentElement.style.setProperty("--accent-dark", "#4c0070");
      document.documentElement.style.setProperty("--accent-light", "#f0d9ff");
      document.documentElement.style.setProperty("--text-heading", "#6600af");
      document.documentElement.style.setProperty("--btn-hover", "#7a36be");
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(to right, #8e2de2, #ef6794)");
  }

  localStorage.setItem("themeColor", color);
}

// === APPLY SAVED THEME COLOR ===
const savedColor = localStorage.getItem("themeColor");
if (savedColor) {
  setTheme(savedColor);
  const activeBtn = document.querySelector(`.theme-buttons button[data-color="${savedColor}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// === THEME BUTTON HANDLERS ===
document.querySelectorAll(".theme-buttons button").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const color = btn.getAttribute("data-color");
    if (!color) return;

    setTheme(color);

    // Remove previous active and set new one
    document.querySelectorAll(".theme-buttons button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
