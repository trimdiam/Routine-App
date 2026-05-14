// views/teacherView.js — Teacher Personal Schedule Display

import { getAllTeachers, getAllSubjects, getTeacherScheduleForDay, getActivePeriodIndex } from '../db.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

let cachedSubjects = null;
let cachedTeachers = null;
let teachersLoaded = false;
let currentTeacher = '';
let currentDay = 1;
let currentTimings = null;
let showToast = null;

export async function initTeacherView(toastFn) {
  showToast = toastFn;

  document.querySelectorAll('#teacher-day-pills .day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#teacher-day-pills .day-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDay = parseInt(pill.dataset.day, 10);
      if (currentTeacher) render();
    });
  });

  document.getElementById('teacher-select').addEventListener('change', e => {
    currentTeacher = e.target.value;
    render();
  });

  await populateTeacherDropdown();
}

export function setTeacherViewDay(day) {
  currentDay = day;
  document.querySelectorAll('#teacher-day-pills .day-pill').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.day, 10) === day);
  });
  if (currentTeacher) render();
}

export function updateTeacherViewTimings(t) {
  currentTimings = t;
  if (currentTeacher) render();
}

export function invalidateTeacherCache() {
  cachedSubjects = null;
  cachedTeachers = null;
  teachersLoaded = false;
}

async function populateTeacherDropdown() {
  const select = document.getElementById('teacher-select');
  try {
    const arr = await getAllTeachers();
    cachedTeachers = {};
    arr.forEach(t => { cachedTeachers[t.initials] = t; });
    teachersLoaded = true;

    const sorted = arr.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
    sorted.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.initials;
      opt.textContent = `${t.fullName} (${t.initials})`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('Failed to load teachers for dropdown:', e);
  }
}

async function render() {
  const body = document.getElementById('teacher-view-body');
  const title = document.getElementById('teacher-view-title');
  const subtitle = document.getElementById('teacher-view-subtitle');

  if (!currentTeacher) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><p>Select a teacher above to view their schedule.</p></div>`;
    return;
  }

  const teacher = cachedTeachers ? cachedTeachers[currentTeacher] : null;
  title.textContent = teacher ? teacher.fullName : currentTeacher;
  subtitle.textContent = `Day ${currentDay} Schedule`;

  body.innerHTML = skeletonRows(6);

  try {
    if (!cachedSubjects) cachedSubjects = await getAllSubjects();
    const schedule = await getTeacherScheduleForDay(currentTeacher, currentDay);
    renderTable(body, schedule);
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load schedule. Check your connection.</p></div>`;
    console.error(e);
  }
}

function renderTable(body, schedule) {
  const activePeriod = getActivePeriodIndex(currentTimings);

  const rows = ROMAN.map((roman, idx) => {
    const slot = schedule[`period${idx + 1}`];
    const isActive = idx === activePeriod;
    const timing = currentTimings ? currentTimings[`period${idx + 1}`] : null;
    const timeStr = (timing && timing.start && timing.end) ? `${timing.start} – ${timing.end}` : '--:-- to --:--';

    let classHtml = '<span style="color:var(--text-muted)">Free</span>';
    let subjectHtml = '';

    if (slot) {
      if (slot.slotType === 'value-cate-split') {
        const pool = (slot.involvedClasses || [slot.className]).join(' + ');
        classHtml = `Class ${pool}`;
        const track = slot.track || 'Value Ed. / Catechism';
        const room = slot.room ? ` · ${slot.room}` : '';
        subjectHtml = `${track}${room} <span class="badge badge-split" style="margin-left:4px">Split</span>`;
      } else if (slot.slotType === 'dual-subject') {
        classHtml = `Class ${slot.className}`;
        subjectHtml = `English I / II <span class="badge badge-dual" style="margin-left:4px">I/II</span>`;
      } else {
        classHtml = `Class ${slot.className}`;
        subjectHtml = cachedSubjects[slot.subjectCode] || `Subject ${slot.subjectCode}`;
      }
    }

    return `<tr class="${isActive ? 'active-period' : ''}">
      <td class="period-cell">Period ${roman}</td>
      <td class="time-cell">${timeStr}</td>
      <td class="subject-cell">${classHtml}</td>
      <td class="teacher-cell">${subjectHtml}</td>
    </tr>`;
  }).join('');

  body.innerHTML = `
    <div class="routine-table-wrap">
      <table class="routine-table">
        <thead><tr>
          <th>Period</th><th>Time</th><th>Class</th><th>Subject</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function skeletonRows(n) {
  return `<div class="routine-table-wrap"><table class="routine-table">
    <thead><tr><th>Period</th><th>Time</th><th>Class</th><th>Subject</th></tr></thead>
    <tbody>${Array.from({length: n}, () =>
      `<tr><td colspan="4"><div class="skeleton skeleton-row"></div></td></tr>`
    ).join('')}</tbody>
  </table></div>`;
}
