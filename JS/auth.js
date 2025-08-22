const AUTH_KEYS = {
users: 'lxUsers',
current: 'lxCurrentUser'
};

// simple non-cryptographic hash for demo
function hash(s) {
let h = 0;
for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
return String(h);
}

function loadUsers() {
try { return JSON.parse(localStorage.getItem(AUTH_KEYS.users)) || {}; }
catch { return {}; }
}
function saveUsers(users) {
localStorage.setItem(AUTH_KEYS.users, JSON.stringify(users));
}
function setCurrentUser(username) {
localStorage.setItem(AUTH_KEYS.current, username);
localStorage.setItem('lxUserName', username); // for backward compatibility
}
function getCurrentUser() {
return localStorage.getItem(AUTH_KEYS.current);
}
function logoutUser() {
localStorage.removeItem(AUTH_KEYS.current);
}

function registerUser(username, password) {
const users = loadUsers();
if (users[username]) return { ok: false, error: 'Username already exists' };
users[username] = { passwordHash: hash(password) };
saveUsers(users);
setCurrentUser(username);
return { ok: true };
}

function loginUser(username, password) {
const users = loadUsers();
const rec = users[username];
if (!rec) return { ok: false, error: 'User not found' };
if (rec.passwordHash !== hash(password)) return { ok: false, error: 'Invalid password' };
setCurrentUser(username);
return { ok: true };
}

// Navbar helper
function injectNavbarUser() {
const pill = document.getElementById('userPill');
const u = getCurrentUser();
if (pill) pill.textContent = u ? u : 'Guest';

const loginLink = document.getElementById('loginLink');
const logoutBtn = document.getElementById('logoutBtn');
if (u) {
if (loginLink) loginLink.style.display = 'none';
if (logoutBtn) {
logoutBtn.style.display = 'inline-block';
logoutBtn.onclick = () => {
logoutUser();
injectNavbarUser();
location.href = 'login.html';
};
}
} else {
if (loginLink) loginLink.style.display = 'inline-block';
if (logoutBtn) logoutBtn.style.display = 'none';
}
}

document.addEventListener('DOMContentLoaded', injectNavbarUser);