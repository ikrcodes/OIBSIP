const USERS_KEY = 'fieldnote.demo.users.v1';
const SESSION_KEY = 'fieldnote.demo.session.v1';
const page = location.pathname.split('/').at(-1);

function readUsers() {
  try {
    const value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(value) ? value.filter((user) => user && typeof user.email === 'string' && typeof user.hash === 'string' && typeof user.salt === 'string') : [];
  } catch { return []; }
}
function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function passwordHash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function show(id, message, success = false) {
  const node = document.querySelector(`#${id}`);
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('success', success);
}

const registerForm = document.querySelector('#register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    show('register-message', '');
    const email = document.querySelector('#register-email').value.trim().toLowerCase();
    const password = document.querySelector('#register-password').value;
    if (!email || !password) return show('register-message', 'Please complete both fields.');
    if (!validEmail(email)) return show('register-message', 'Enter a valid email address.');
    if (password.length < 8 || !/\d/.test(password)) return show('register-message', 'Use at least 8 characters and include at least 1 number.');
    const users = readUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) return show('register-message', 'An account with this email already exists. Try signing in.');
    try {
      const salt = randomSalt();
      const hash = await passwordHash(password, salt);
      users.push({ email, salt, hash, createdAt: new Date().toISOString() });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      registerForm.reset();
      show('register-message', 'Account created. You can now sign in.', true);
      window.setTimeout(() => { location.href = 'login.html?registered=1'; }, 900);
    } catch {
      show('register-message', 'Secure browser hashing is unavailable. Open this demo on localhost or HTTPS.');
    }
  });
}

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  if (new URLSearchParams(location.search).has('registered')) show('login-message', 'Your demo account is ready. Sign in to continue.', true);
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    show('login-message', '');
    const email = document.querySelector('#login-email').value.trim().toLowerCase();
    const password = document.querySelector('#login-password').value;
    if (!email || !password) return show('login-message', 'Enter your email and password.');
    if (!validEmail(email)) return show('login-message', 'Email or password is incorrect.');
    try {
      const user = readUsers().find((item) => item.email.toLowerCase() === email);
      const candidate = user ? await passwordHash(password, user.salt) : '';
      if (!user || candidate !== user.hash) return show('login-message', 'Email or password is incorrect.');
      sessionStorage.setItem(SESSION_KEY, email);
      location.href = 'dashboard.html';
    } catch {
      show('login-message', 'Sign-in could not run in this browser. Open the demo on localhost or HTTPS.');
    }
  });
}

if (page === 'dashboard.html') {
  const email = sessionStorage.getItem(SESSION_KEY);
  const user = email && readUsers().find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) location.replace('login.html');
  else document.querySelector('#signed-in-email').textContent = user.email;
  document.querySelector('#logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.replace('login.html');
  });
}
