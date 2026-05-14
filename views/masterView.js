// views/masterView.js — Full Day Matrix Overview

import { getRoutineForDay, getAllSubjects } from '../db.js';

const CLASSES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

let cachedSubjects = null;
let currentDay = 1;
let autoLoadDone = false;

export function initMasterView() {
  document.querySelectorAll('#master-day-pills .day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#master-day-pills .day-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDay = parseInt(pill.dataset.day, 10);
      render();
    });
  });
}

export function setMasterViewDay(day) {
  currentDay = day;
  document.querySelectorAll('#master-day-pills .day-pill').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.day, 10) === day);
  });

  // Render on first day set or whenever master section is active
  if (!autoLoadDone || document.getElementById('section-master').classList.contains('active')) {
    autoLoadDone = true;
    render();
  }
}

export function renderMasterIfActive() {
  if (document.getElementById('section-master').classList.contains('active')) {
    render();
  }
}

export function invalidateMasterCache() {
  cachedSubjects = null;
}

async function render() {
  const body = document.getElementById('master-view-body');
  const title = document.getElementById('master-view-title');
  title.textContent = `Day ${currentDay} — All Classes`;

  // Skeleton: show a loading state
  body.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted);">Loading matrix...</div>`;

  try {
    if (!cachedSubjects) cachedSubjects = await getAllSubjects();
    const dayData = await getRoutineForDay(currentDay);
    renderMatrix(body, dayData);
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load data. Check your connection.</p></div>`;
    console.error(e);
  }
}

function renderMatrix(body, dayData) {
  const headers = CLASSES.map(c => `<th>Class ${c}</th>`).join('');

  const rows = ROMAN.map((roman, pIdx) => {
    const slots = dayData[`period${pIdx + 1}`] || [];

    const cells = CLASSES.map(cls => {
      // For split slots two documents exist; find the first matching
      const slot = slots.find(s =>
        s.className === cls ||
        (s.involvedClasses && s.involvedClasses.includes(cls))
      );

      if (!slot) {
        return `<td class="cell-regular"><div class="cell-content"><span class="cell-subject" style="color:var(--text-muted)">—</span></div></td>`;
      }

      if (slot.slotType === 'value-cate-split') {
        return `<td class="cell-split"><div class="cell-content">
          <span class="cell-subject">Val/Cate</span>
          <span class="cell-teacher">${slot.teacherInitials || ''}</span>
        </div></td>`;
      }

      if (slot.slotType === 'dual-subject') {
        return `<td class="cell-dual"><div class="cell-content">
          <span class="cell-subject">Eng I/II</span>
          <span class="cell-teacher">${slot.teacherInitials || ''}</span>
        </div></td>`;
      }

      const fullName = cachedSubjects[slot.subjectCode] || String(slot.subjectCode);
      const short = fullName.length > 11 ? fullName.slice(0, 10) + '…' : fullName;
      return `<td class="cell-regular"><div class="cell-content">
        <span class="cell-subject">${short}</span>
        <span class="cell-teacher">${slot.teacherInitials || ''}</span>
      </div></td>`;
    }).join('');

    return `<tr>
      <td>Period ${roman}</td>
      ${cells}
    </tr>`;
  }).join('');

  body.innerHTML = `
    <div class="master-grid-wrap">
      <table class="master-grid">
        <thead><tr><th>Period</th>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
