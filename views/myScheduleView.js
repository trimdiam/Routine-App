// views/myScheduleView.js — Logged-in teacher's personal 7-day schedule.
// Reads /users/{uid}.teacherInitials, then queries the routine via
// collectionGroup('slots') and renders a Day × Period table.

import { getUserDoc, getTeacherScheduleByInitials, getAllSubjects, getTeacher } from '../db.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const DAY_LABELS = ['', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

let cachedSubjects = null;
let currentUid = null;

export function initMyScheduleView() {
  const printBtn = document.getElementById('my-schedule-print-btn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
}

/**
 * Render the schedule for the given Firebase Auth user.
 * Pass null/undefined to clear the view.
 */
export async function renderMySchedule(user) {
  const titleEl = document.getElementById('my-schedule-title');
  const subEl = document.getElementById('my-schedule-subtitle');
  const bodyEl = document.getElementById('my-schedule-body');
  if (!bodyEl) return;

  if (!user) {
    titleEl.textContent = 'Not signed in';
    bodyEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><p>Sign in with your portal account to view your schedule.</p></div>';
    return;
  }

  currentUid = user.uid;
  bodyEl.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading your schedule…</p></div>';

  try {
    const userData = await getUserDoc(user.uid);
    const initials = userData?.teacherInitials;

    if (!initials) {
      titleEl.textContent = user.email || 'Teacher';
      subEl.textContent = 'Account not yet linked to a teacher record.';
      bodyEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔗</div>
          <p>Your portal account is not linked to a teacher in the routine yet.</p>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.5rem;">
            Ask an admin to link your account in <strong>Admin → Link Accounts</strong>.
          </p>
        </div>`;
      return;
    }

    if (!cachedSubjects) cachedSubjects = await getAllSubjects();
    const teacher = await getTeacher(initials);
    const schedule = await getTeacherScheduleByInitials(initials);

    titleEl.textContent = `${teacher?.fullName || initials} (${initials})`;
    subEl.textContent = teacher?.fullName
      ? `${teacher.fullName} — full 7-day teaching routine`
      : `Initials: ${initials}`;

    bodyEl.innerHTML = renderTable(schedule, cachedSubjects);
  } catch (e) {
    console.error(e);
    if (e.code === 'failed-precondition' || /index/i.test(e.message)) {
      bodyEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚙️</div>
          <p>Firestore needs a one-time index on <code>slots.teacherInitials</code>.</p>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.5rem;">
            Open the browser console — Firebase prints a link that auto-creates it.
          </p>
        </div>`;
    } else {
      bodyEl.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load: ${e.message}</p></div>`;
    }
  }
}

function renderTable(schedule, subjects) {
  let html = '<div style="overflow-x:auto;"><table class="routine-table" style="width:100%; border-collapse:collapse; min-width:640px;">';
  html += '<thead><tr><th>Day</th>';
  for (let p = 1; p <= 6; p++) {
    html += `<th>Period ${ROMAN[p - 1]}</th>`;
  }
  html += '</tr></thead><tbody>';

  let totalPeriods = 0;
  for (let d = 1; d <= 7; d++) {
    html += `<tr><td style="font-weight:600; color:var(--gold-300);">${DAY_LABELS[d]}</td>`;
    for (let p = 1; p <= 6; p++) {
      const slot = schedule[d]?.[p];
      if (!slot) {
        html += '<td style="color:var(--text-muted); text-align:center; opacity:0.4;">—</td>';
      } else {
        totalPeriods++;
        html += `<td>${formatSlot(slot, subjects)}</td>`;
      }
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';

  html += `<div style="margin-top:1rem; font-size:0.82rem; color:var(--text-muted);">
    <strong style="color:var(--gold-300);">${totalPeriods}</strong> periods scheduled across the 7-day cycle.
  </div>`;
  return html;
}

function formatSlot(slot, subjects) {
  const codes = Array.isArray(slot.subjectCode) ? slot.subjectCode : [slot.subjectCode];
  const subjectName = codes.map(c => subjects[c] || `Subject ${c}`).join(' / ');
  let html = `<div style="font-weight:600;">${escapeHtml(subjectName)}</div>`;
  html += `<div style="font-size:0.78rem; color:var(--text-secondary);">Class ${escapeHtml(slot.className)}</div>`;
  if (slot.slotType === 'value-cate-split') {
    html += `<div style="font-size:0.72rem; color:var(--badge-split-text); margin-top:0.2rem;">${escapeHtml(slot.track || '')} · ${escapeHtml(slot.room || '')}</div>`;
  } else if (slot.slotType === 'dual-subject') {
    html += `<div style="font-size:0.72rem; color:var(--badge-dual-text); margin-top:0.2rem;">Dual subject</div>`;
  }
  return html;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
