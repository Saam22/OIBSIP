# To-Do Web App

Interactive to-do list application for managing daily tasks — add, complete, edit, and delete tasks, organised into **Pending** and **Completed** lists.

**Author:** Saad Mohamed Hassan — Web Development & Designing Task 3 (Oasis Infobyte Internship)

## Features

- Input field + **Add Task** button to create new tasks
- New tasks appear immediately in the **Pending Tasks** list
- **Mark Complete** checkbox — completed tasks move to the **Completed Tasks** list
- **Edit** button — inline editing of task text (Enter to save, Esc to cancel)
- **Delete** button — permanently removes a task from either list
- Task count indicators: *"X pending"* and *"Y completed"* above each list
- Timestamps on every task showing when it was **added** and **completed**
- Tasks **persist across page refreshes** via `localStorage`
- Friendly empty-state messaging when a list has no items
- 2-second branded splash animation on load

## Tech Stack

- HTML5
- CSS3 (custom properties, flexbox, animations, responsive layout)
- Vanilla JavaScript (DOM manipulation, `localStorage`)

## Usage

Open `index.html` in any modern browser, or serve the folder:

```bash
# e.g. with Python
python -m http.server 8000
```

## Project Structure

```
├── index.html   # Markup: splash, add form, pending/completed sections
├── style.css    # Styling: dark theme, animations, responsive
├── script.js    # Logic: CRUD, counts, timestamps, localStorage persistence
└── README.md
```
