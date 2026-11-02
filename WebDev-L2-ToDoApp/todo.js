const STORAGE_KEY = 'daymark.tasks.v1';
const form = document.querySelector('#task-form');
const input = document.querySelector('#new-task');
const pendingList = document.querySelector('#pending-list');
const completedList = document.querySelector('#completed-list');
const pendingCount = document.querySelector('#pending-count');
const completedCount = document.querySelector('#completed-count');

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.text === 'string' && typeof task.id === 'string') : [];
  } catch { return []; }
}
let tasks = loadTasks();
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function makeId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function stamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Added earlier' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function emptyMessage(list, text) {
  const li = document.createElement('li');
  li.className = 'empty';
  li.textContent = text;
  list.append(li);
}

function actionButton(label, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', handler);
  return button;
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = `item${task.completed ? ' done' : ''}`;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle';
  toggle.setAttribute('aria-label', task.completed ? 'Move task to pending' : 'Mark task complete');
  toggle.textContent = task.completed ? '✓' : '';
  toggle.addEventListener('click', () => updateTask(task.id, (item) => {
    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date().toISOString() : null;
  }));
  const content = document.createElement('div');
  const text = document.createElement('div');
  text.className = 'task-copy';
  text.textContent = task.text;
  const time = document.createElement('time');
  time.className = 'time';
  time.dateTime = task.completedAt || task.createdAt || '';
  time.textContent = task.completedAt ? `Completed ${stamp(task.completedAt)}` : `Added ${stamp(task.createdAt)}`;
  content.append(text, time);
  const actions = document.createElement('div');
  actions.className = 'item-actions';
  actions.append(actionButton('Edit', () => startEdit(task, content)), actionButton('Delete', () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    persist(); render();
  }));
  li.append(toggle, content, actions);
  return li;
}

function startEdit(task, content) {
  content.replaceChildren();
  const editForm = document.createElement('form');
  const editInput = document.createElement('input');
  editInput.className = 'edit-input';
  editInput.value = task.text;
  editInput.maxLength = 180;
  editInput.setAttribute('aria-label', 'Edit task');
  const save = document.createElement('button');
  save.type = 'submit'; save.textContent = 'Save';
  const cancel = document.createElement('button');
  cancel.type = 'button'; cancel.textContent = 'Cancel';
  editForm.append(editInput, save, cancel);
  content.append(editForm);
  editInput.focus(); editInput.select();
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = editInput.value.trim();
    if (!next) { editInput.focus(); return; }
    updateTask(task.id, (item) => { item.text = next; });
  });
  cancel.addEventListener('click', render);
}

function updateTask(id, mutate) {
  const task = tasks.find((item) => item.id === id);
  if (task) mutate(task);
  persist(); render();
}

function render() {
  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);
  pendingList.replaceChildren(); completedList.replaceChildren();
  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;
  if (!pending.length) emptyMessage(pendingList, 'Nothing waiting here. Add a task when you are ready.');
  if (!completed.length) emptyMessage(completedList, 'Finished tasks will appear here.');
  pending.forEach((task) => pendingList.append(renderTask(task)));
  completed.forEach((task) => completedList.append(renderTask(task)));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  tasks.unshift({ id: makeId(), text, completed: false, createdAt: new Date().toISOString(), completedAt: null });
  persist(); render(); form.reset(); input.focus();
});
render();
