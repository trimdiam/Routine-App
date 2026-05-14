// app.js — SFS Routine App — Main Entry Point

import { listenCurrentDay, listenPeriodTimings } from './db.js';
import { initClassView, setClassViewDay, updateClassViewTimings, invalidateClassCache } from './views/classView.js';
import { initTeacherView, setTeacherViewDay, updateTeacherViewTimings, invalidateTeacherCache } from './views/teacherView.js';
import { initMasterView, setMasterViewDay, renderMasterIfActive, invalidateMasterCache } from './views/masterView.js';
import { initAdmin } from './admin.js';

// ── Change this to the real admin password before deployment ──
const ADMIN_PASSWORD = 'sfs@admin2024';

let currentDay = 1;
let dayUnsubscribe = null;
let timingsUnsubscribe = null;

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════

function showSection(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.header-nav-btn').forEach(b => b.classList.remove('active'));

  const section = document.getElementById(`section-${id}`);
  if (section) section.classList.add('active');

  const btn = document.querySelector(`.header-nav-btn[data-section="${id}"]`);
  if (btn) btn.classList.add('active');

  // Close mobile nav
  document.getElementById('header-nav').classList.remove('open');

  // Trigger master view render when switching to it (lazy)
  if (id === 'master') renderMasterIfActive();
}

// ══════════════════════════════════════════════════════
// AUTH — simple session-stored password gate
// ══════════════════════════════════════════════════════

function isAdminUnlocked() {
  return sessionStorage.getItem('sfs_admin') === '1';
}

function unlockAdmin() {
  sessionStorage.setItem('sfs_admin', '1');
}

function lockAdmin() {
  sessionStorage.removeItem('sfs_admin');
}

function showLoginScreen() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

function handleLogin() {
  const pw = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  if (pw === ADMIN_PASSWORD) {
    unlockAdmin();
    showApp();
    showSection('admin');
    err.textContent = '';
  } else {
    err.textContent = 'Incorrect password. Please try again.';
    document.getElementById('login-password').value = '';
  }
}

// ══════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  // CSS animation handles fadeIn; remove after 3 s
  setTimeout(() => toast.remove(), 3300);
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════

async function init() {
  // Show app shell immediately
  showApp();
  showSection('class');

  // ── Navigation buttons ──
  document.querySelectorAll('.header-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.section;
      if (id === 'admin') {
        if (!isAdminUnlocked()) { showLoginScreen(); return; }
      }
      showSection(id);
    });
  });

  // ── Mobile hamburger ──
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('header-nav').classList.toggle('open');
  });

  // ── Login form ──
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('login-back-btn').addEventListener('click', () => {
    showApp();
    showSection('class');
  });

  // ── Admin logout ──
  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    lockAdmin();
    showSection('class');
    showToast('Admin panel locked.', 'info');
  });

  // ── Listen to current school day (real-time) ──
  dayUnsubscribe = listenCurrentDay(data => {
    currentDay = data.currentDay;
    document.getElementById('header-day-badge').textContent = `Day ${data.currentDay}`;
    setClassViewDay(data.currentDay);
    setTeacherViewDay(data.currentDay);
    setMasterViewDay(data.currentDay);
  });

  // ── Listen to period timings (real-time) ──
  timingsUnsubscribe = listenPeriodTimings(timings => {
    updateClassViewTimings(timings);
    updateTeacherViewTimings(timings);
  });

  // ── Initialise views ──
  initClassView(showToast);
  await initTeacherView(showToast);   // async: populates teacher dropdown
  initMasterView();
  initAdmin(showToast, showSection);
}

init().catch(err => {
  console.error('App init failed:', err);
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#f87171;font-family:sans-serif;text-align:center;padding:2rem;">
    <div>
      <p style="font-size:1.25rem;margin-bottom:0.5rem">Failed to initialise app</p>
      <p style="font-size:0.875rem;opacity:0.7">${err.message}</p>
      <p style="font-size:0.8rem;opacity:0.5;margin-top:0.5rem">Check the Firebase config in firebase.js</p>
    </div>
  </div>`;
});
