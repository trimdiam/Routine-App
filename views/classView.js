// views/classView.js — Class Routine Display

import { getRoutineForDay, getAllSubjects, getAllTeachers, getActivePeriodIndex } from '../db.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

let cachedSubjects = null;
let cachedTeachers = null;
let currentClass = '';
let currentDay = 1;
let currentTimings = null;
let showToast = null;

export function initClassView(toastFn) {
  showToast = toastFn;

  const classSelect = document.getElementById('class-select');
  const printBtn = document.getElementById('class-print-btn');

  classSelect.addEventListener('change', () => {
    currentClass = classSelect.value;
    render();
  });

  document.querySelectorAll('#class-day-pills .day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#class-day-pills .day-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDay = parseInt(pill.dataset.day, 10);
      render();
    });
  });

  printBtn.addEventListener('click', () => window.print());
}

export function setClassViewDay(day) {
  currentDay = day;
  document.querySelectorAll('#class-day-pills .day-pill').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.day, 10) === day);
  });
  if (currentClass) render();
}

export function updateClassViewTimings(t) {
  currentTimings = t;
  if (currentClass) render();
}

export function invalidateClassCache() {
  cachedSubjects = null;
  cachedTeachers = null;
}

async function loadCaches() {
  if (!cachedSubjects) cachedSubjects = await getAllSubjects();
  if (!cachedTeachers) {
    const arr = await getAllTeachers();
    cachedTeachers = {};
    arr.forEach(t => { cachedTeachers[t.initials] = t; });
  }
}

async function render() {
  const body = document.getElementById('class-view-body');
  const title = document.getElementById('class-view-title');
  const subtitle = document.getElementById('class-view-subtitle');
  const printBtn = document.getElementById('class-print-btn');
  const printTitle = document.getElementById('print-title');

  if (!currentClass) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>Select a class above to view the routine.</p></div>`;
    printBtn.style.display = 'none';
    return;
  }

  title.textContent = `Class ${currentClass}`;
  subtitle.textContent = `Day ${currentDay} Routine`;
  printTitle.textContent = `Class ${currentClass} — Day ${currentDay} Routine`;
  printBtn.style.display = '';

  body.innerHTML = skeletonRows(6);

  try {
    await loadCaches();
    const dayData = await getRoutineForDay(currentDay);
    renderTable(body, dayData);
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load routine. Check your connection.</p></div>`;
    console.error(e);
  }
}

function renderTable(body, dayData) {
  const activePeriod = getActivePeriodIndex(currentTimings);

  const rows = ROMAN.map((roman, idx) => {
    const slots = dayData[`period${idx + 1}`] || [];
    const slot = slots.find(s =>
      s.className === currentClass ||
      (s.involvedClasses && s.involvedClasses.includes(currentClass))
    );

    const isActive = idx === activePeriod;
    const timing = currentTimings ? currentTimings[`period${idx + 1}`] : null;
    const timeStr = (timing && timing.start && timing.end) ? `${timing.start} – ${timing.end}` : '--:-- to --:--';

    let subjectHtml = '<span style="color:var(--text-muted)">—</span>';
    let teacherHtml = '';

    if (slot) {
      if (slot.slotType === 'dual-subject') {
        subjectHtml = `English I / II <span class="badge badge-dual" style="margin-left:4px">I/II</span>`;
        const t = cachedTeachers[slot.teacherInitials];
        teacherHtml = t ? t.fullName : (slot.teacherInitials || '');
      } else if (slot.slotType === 'value-cate-split') {
        subjectHtml = `Value Ed. / Catechism <span class="badge badge-split" style="margin-left:4px">Split</span>`;
        teacherHtml = `<div class="split-note">📍 Go to your respective room</div>`;
      } else {
        subjectHtml = cachedSubjects[slot.subjectCode] || `Subject ${slot.subjectCode}`;
        const t = cachedTeachers[slot.teacherInitials];
        teacherHtml = t ? t.fullName : (slot.teacherInitials || '');
      }
    }

    return `<tr class="${isActive ? 'active-period' : ''}">
      <td class="period-cell">Period ${roman}</td>
      <td class="time-cell">${timeStr}</td>
      <td class="subject-cell">${subjectHtml}</td>
      <td class="teacher-cell">${teacherHtml}</td>
    </tr>`;
  }).join('');

  body.innerHTML = `
    <div class="routine-table-wrap">
      <table class="routine-table">
        <thead><tr>
          <th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function skeletonRows(n) {
  return `<div class="routine-table-wrap"><table class="routine-table">
    <thead><tr><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th></tr></thead>
    <tbody>${Array.from({length: n}, () =>
      `<tr><td colspan="4"><div class="skeleton skeleton-row"></div></td></tr>`
    ).join('')}</tbody>
  </table></div>`;
}
