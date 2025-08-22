// --- Search ---
const searchBar = document.getElementById("searchBar");
const courseCards = document.querySelectorAll(".course-card");

if (searchBar) {
searchBar.addEventListener("keyup", () => {
const text = searchBar.value.toLowerCase();
courseCards.forEach(card => {
const title = (card.dataset.title || '').toLowerCase();
card.style.display = title.includes(text) ? "block" : "none";
});
});
}

// --- Filters ---
document.querySelectorAll("select").forEach(select => {
if (select && select.id && ["categoryFilter","levelFilter","priceFilter"].includes(select.id)) {
select.addEventListener("change", filterCourses);
}
});

function filterCourses() {
const catEl = document.getElementById("categoryFilter");
const lvEl = document.getElementById("levelFilter");
const priceEl = document.getElementById("priceFilter");
if (!catEl || !lvEl || !priceEl) return; // not on catalog page

const cat = catEl.value;
const lv = lvEl.value;
const price = priceEl.value;

document.querySelectorAll(".course-card").forEach(card => {
const match =
(cat === 'all' || card.dataset.category === cat) &&
(lv === 'all' || card.dataset.level === lv) &&
(price === 'all' || card.dataset.price === price);
card.style.display = match ? "block" : "none";
});
}

// --- Enroll (localStorage) ---
document.querySelectorAll(".enroll-btn").forEach(btn => {
btn.addEventListener("click", (e) => {
const card = e.currentTarget.closest(".course-card");
const titleEl = card ? card.querySelector("h3") : null;
const courseTitle = titleEl ? titleEl.textContent.trim() : null;
if (!courseTitle) return;
let enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
if (!enrolled.includes(courseTitle)) {
  enrolled.push(courseTitle);
  localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
  alert(courseTitle + " added to your courses!");
} else {
  alert("Already enrolled!");
}

});
});

// --- Dark Mode Toggle ---
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
themeToggle.addEventListener("click", () => {
document.body.classList.toggle("dark");
});
}

function getCourseProgressPercent(courseTitle) {
const normalized = (courseTitle || '').replace(/\s+/g, ' ').trim();
const key =  `lxCourseProgress::${normalized}`;
try {
const raw = localStorage.getItem(key);
if (!raw) return 0;
const data = JSON.parse(raw);
const completedCount = (data.completed || []).length;
const total = Number(data.total) || 0; // use saved total
if (!total) return 0;
return Math.round((completedCount / total) * 100);
} catch {
return 0;
}
}

const RATING_KEY = 'lxCourseRatings'; // map: { "Course Title": 1-5 }

function loadRatings() {
try { return JSON.parse(localStorage.getItem(RATING_KEY)) || {}; }
catch { return {}; }
}
function saveRatings(map) {
localStorage.setItem(RATING_KEY, JSON.stringify(map));
}
function setCourseRating(title, value) {
const map = loadRatings();
map[title] = value;
saveRatings(map);
}
function getCourseRating(title) {
const map = loadRatings();
return map[title] || 0;
}

document.addEventListener('DOMContentLoaded', () => {
// Update card progress bars
document.querySelectorAll('.course-card').forEach(card => {
const title = card.querySelector('h3')?.textContent?.trim();
const pct = getCourseProgressPercent(title);
const bar = card.querySelector('.progress');
if (bar && Number.isFinite(pct)) bar.style.width = pct + '%';
});

// Interactive rating stars
document.querySelectorAll('.course-card').forEach(card => {
const title = card.querySelector('h3')?.textContent?.trim();
const starsEl = card.querySelector('.stars');
if (!title || !starsEl) return;
starsEl.innerHTML = '';
starsEl.style.userSelect = 'none';
const current = getCourseRating(title);

for (let i = 1; i <= 5; i++) {
  const s = document.createElement('span');
  s.textContent = i <= current ? '★' : '☆';
  s.style.cursor = 'pointer';
  s.style.fontSize = '18px';
  s.style.marginRight = '2px';

  s.addEventListener('mouseenter', () => {
    for (let j = 1; j <= 5; j++) {
      starsEl.children[j-1].textContent = j <= i ? '★' : '☆';
    }
  });
  s.addEventListener('mouseleave', () => {
    const saved = getCourseRating(title);
    for (let j = 1; j <= 5; j++) {
      starsEl.children[j-1].textContent = j <= saved ? '★' : '☆';
    }
  });
  s.addEventListener('click', () => {
    setCourseRating(title, i);
    for (let j = 1; j <= 5; j++) {
      starsEl.children[j-1].textContent = j <= i ? '★' : '☆';
    }
  });

  starsEl.appendChild(s);
}
});

// ——— Auth header sync ———
const userPill = document.getElementById('userPill');
const loginLink = document.getElementById('loginLink');
const logoutBtn = document.getElementById('logoutBtn');

// Read session: set these keys on login/register success
const currentUser = localStorage.getItem('lxCurrentUser'); // e.g., user id/username
const displayName = localStorage.getItem('lxUserName') || currentUser;

if (currentUser) {
if (userPill) userPill.textContent = displayName || 'User';
if (loginLink) loginLink.style.display = 'none';
if (logoutBtn) logoutBtn.style.display = '';
} else {
if (userPill) userPill.textContent = 'Guest';
if (loginLink) loginLink.style.display = '';
if (logoutBtn) logoutBtn.style.display = 'none';
}

// Logout handler (page-safe)
if (logoutBtn && !logoutBtn.dataset.bound) {
logoutBtn.addEventListener('click', () => {
localStorage.removeItem('lxCurrentUser');
// keep lxUserName if you want, or clear it as well:
// localStorage.removeItem('lxUserName');
// Immediately reflect UI and send to login
if (userPill) userPill.textContent = 'Guest';
if (loginLink) loginLink.style.display = '';
logoutBtn.style.display = 'none';
window.location.href = 'login.html';
});
logoutBtn.dataset.bound = '1';
}

});