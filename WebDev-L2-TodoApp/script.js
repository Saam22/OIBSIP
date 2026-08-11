(function () {
  "use strict";

  const STORAGE_KEY = "saad-todo-tasks";
  const PENDING_ID = "pendingList";
  const COMPLETED_ID = "completedList";

  const form = document.getElementById("addForm");
  const input = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const splash = document.getElementById("splash");
  const app = document.getElementById("app");

  let tasks = [];

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      ", " +
      d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    );
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function updateCounts() {
    const pending = tasks.filter((t) => !t.completed).length;
    const done = tasks.length - pending;
    document.getElementById("pendingCount").textContent =
      pending + (pending === 1 ? " pending" : " pending");
    document.getElementById("completedCount").textContent =
      done + (done === 1 ? " completed" : " completed");
  }

  function toggleEmptyStates() {
    const pending = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    document.getElementById("pendingEmpty").classList.toggle("hidden", pending.length > 0);
    document.getElementById("completedEmpty").classList.toggle("hidden", done.length > 0);
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed-item" : "");
    li.dataset.id = task.id;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.completed;
    check.title = task.completed ? "Mark as pending" : "Mark as complete";
    check.addEventListener("change", () => toggleTask(task.id));

    const body = document.createElement("div");
    body.className = "task-body";

    const text = document.createElement("p");
    text.className = "task-text";
    text.textContent = task.text;
    body.appendChild(text);

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML =
      '<span class="added">+ ' + escapeHtml(formatTime(task.createdAt)) + "</span>" +
      (task.completedAt ? '<span class="done-at">&#10003; ' + escapeHtml(formatTime(task.completedAt)) + "</span>" : "");
    body.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.innerHTML = "&#9998;";
    editBtn.title = "Edit task";
    editBtn.addEventListener("click", () => startEdit(li, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete";
    deleteBtn.innerHTML = "&#10005;";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(check);
    li.appendChild(body);
    li.appendChild(actions);

    return li;
  }

  function render() {
    const pendingList = document.getElementById(PENDING_ID);
    const completedList = document.getElementById(COMPLETED_ID);
    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    tasks
      .filter((t) => !t.completed)
      .forEach((t) => pendingList.appendChild(createTaskElement(t)));

    tasks
      .filter((t) => t.completed)
      .forEach((t) => completedList.appendChild(createTaskElement(t)));

    updateCounts();
    toggleEmptyStates();
  }

  function addTask(text) {
    tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: text,
      completed: false,
      createdAt: Date.now(),
      completedAt: null
    });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    const li = document.querySelector('.task-item[data-id="' + id + '"]');
    const finish = () => {
      tasks = tasks.filter((t) => t.id !== id);
      saveTasks();
      render();
    };
    if (li) {
      li.classList.add("removing");
      setTimeout(finish, 220);
    } else {
      finish();
    }
  }

  function startEdit(li, task) {
    const body = li.querySelector(".task-body");
    const textEl = body.querySelector(".task-text");
    const metaEl = body.querySelector(".task-meta");

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.text;
    editInput.maxLength = 200;
    metaEl.style.display = "none";
    body.replaceChild(editInput, textEl);

    const done = (save) => {
      const value = editInput.value.trim();
      if (save && value) {
        task.text = value;
        saveTasks();
      }
      render();
    };

    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        done(true);
      } else if (e.key === "Escape") {
        done(false);
      }
    });
    editInput.addEventListener("blur", () => done(true));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = "";
    input.focus();
  });

  input.addEventListener("input", () => {
    addBtn.disabled = !input.value.trim();
  });

  loadTasks();
  render();

  setTimeout(() => {
    splash.classList.add("fade-out");
    app.classList.remove("hidden");
  }, 2000);
})();
