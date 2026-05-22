// app.js — SFS Routine App — Main Entry Point

import { db, auth } from './firebase.js';
import { listenCurrentDay, listenPeriodTimings } from './db.js';
import { initClassView, setClassViewDay, updateClassViewTimings } from './views/classView.js';
import { initTeacherView, setTeacherViewDay, updateTeacherViewTimings } from './views/teacherView.js';
import { initMasterView, setMasterViewDay, renderMasterIfActive } from './views/masterView.js';
import { initAdmin } from './admin.js';

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

let dayUnsubscribe = null;
let timingsUnsubscribe = null;
let adminInitialised = false;

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

  document.getElementById('header-nav').classList.remove('open');

  if (id === 'master') renderMasterIfActive();
}

// ══════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════

function showLoginScreen() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    err.textContent = 'Please enter your email and password.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in…';
  err.textContent = '';

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Check role in Firestore
    const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
    const role = userSnap.exists() ? userSnap.data().role : null;

    if (role !== 'admin') {
      await signOut(auth);
      err.textContent = 'Access denied. Admin accounts only.';
      return;
    }

    showApp();
    showSection('admin');
  } catch (e) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
      err.textContent = 'Incorrect email or password.';
    } else if (e.code === 'auth/too-many-requests') {
      err.textContent = 'Too many attempts. Try again later.';
    } else {
      err.textContent = `Sign-in failed: ${e.message}`;
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    showSection('class');
    showToast('Signed out.', 'info');
  } catch (e) {
    showToast('Sign-out failed.', 'error');
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
  setTimeout(() => toast.remove(), 3300);
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════

async function init() {
  showApp();
  showSection('class');

  // ── Navigation ──
  document.querySelectorAll('.header-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.section;
      if (id === 'admin') {
        if (!auth.currentUser) { showLoginScreen(); return; }
        showSection('admin');
        return;
      }
      showSection(id);
    });
  });

  // ── Mobile menu ──
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('header-nav').classList.toggle('open');
  });

  // ── Login form ──
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('login-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-password').focus();
  });
  document.getElementById('login-back-btn').addEventListener('click', () => {
    showApp();
    showSection('class');
  });

  // ── Admin logout ──
  document.getElementById('admin-logout-btn').addEventListener('click', handleLogout);

  // ── Auth state — auto-show admin if already signed in ──
  onAuthStateChanged(auth, async user => {
    if (user) {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const role = userSnap.exists() ? userSnap.data().role : null;
      if (role === 'admin' && !adminInitialised) {
        adminInitialised = true;
        initAdmin(showToast, showSection);
        showSection('admin');
      }
    } else {
      adminInitialised = false;
    }
  });

  // ── Real-time day listener ──
  dayUnsubscribe = listenCurrentDay(data => {
    document.getElementById('header-day-badge').textContent = `Day ${data.currentDay}`;
    setClassViewDay(data.currentDay);
    setTeacherViewDay(data.currentDay);
    setMasterViewDay(data.currentDay);
  });

  // ── Real-time timings listener ──
  timingsUnsubscribe = listenPeriodTimings(timings => {
    updateClassViewTimings(timings);
    updateTeacherViewTimings(timings);
  });

  // ── Initialise display views ──
  initClassView(showToast);
  await initTeacherView(showToast);
  initMasterView();
}

init().catch(err => {
  console.error('App init failed:', err);
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;
    min-height:100vh;color:#f87171;font-family:sans-serif;text-align:center;padding:2rem;">
    <div>
      <p style="font-size:1.25rem;margin-bottom:0.5rem">Failed to initialise app</p>
      <p style="font-size:0.875rem;opacity:0.7">${err.message}</p>
      <p style="font-size:0.8rem;opacity:0.5;margin-top:0.5rem">Check the Firebase config in firebase.js</p>
    </div>
  </div>`;
});
