// admin.js — Admin Panel Logic

import {
  getCurrentDay, setCurrentDay, listenCurrentDay,
  getPeriodTimings, setPeriodTimings,
  getAllTeachers, upsertTeacher,
  getAllSubjects, upsertSubject,
  getRoutineForDay, upsertSlot, deleteSlot
} from './db.js';
import { runSeed } from './seed.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const CLASSES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

let showToast = null;
let switchSection = null;
let cachedTeachers = {};
let cachedSubjects = {};
let dayUnsubscribe = null;
let currentAdminDay = 1;
let editorClass = '';
let slotModalCtx = null; // { dayNumber, periodNumber, className, existingSlot }

export function initAdmin(toastFn, sectionFn) {
  showToast = toastFn;
  switchSection = sectionFn;

  initAdminTabs();
  initDayControl();
  initTimingsEditor();
  initTeacherPanel();
  initSubjectPanel();
  initRoutineEditor();
  initSeedPanel();
  initModals();
}

// ══════════════════════════════════════════════════════
// ADMIN TABS
// ══════════════════════════════════════════════════════

function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const panel = document.getElementById(`admin-panel-${tab.dataset.adminTab}`);
      if (panel) panel.style.display = '';

      // Lazy-load panel content
      const tabId = tab.dataset.adminTab;
      if (tabId === 'teachers') loadTeachers();
      if (tabId === 'subjects') loadSubjects();
      if (tabId === 'timings') loadTimings();
    });
  });
}

// ══════════════════════════════════════════════════════
// DAY CONTROL
// ══════════════════════════════════════════════════════

function initDayControl() {
  // Listen to real-time day changes
  dayUnsubscribe = listenCurrentDay(data => {
    currentAdminDay = data.currentDay;
    document.getElementById('admin-current-day').textContent = `Day ${data.currentDay}`;
    const lu = data.lastUpdated;
    if (lu && lu.toDate) {
      document.getElementById('admin-day-last-updated').textContent =
        `Last updated: ${lu.toDate().toLocaleString()}`;
    } else {
      document.getElementById('admin-day-last-updated').textContent = 'Last updated: —';
    }
    // Sync manual set pills
    document.querySelectorAll('#admin-day-set-pills .day-pill').forEach(p => {
      p.classList.toggle('active', parseInt(p.dataset.day, 10) === data.currentDay);
    });
  });

  document.getElementById('admin-advance-day').addEventListener('click', async () => {
    const next = currentAdminDay >= 7 ? 1 : currentAdminDay + 1;
    try {
      await setCurrentDay(next);
      showToast(`Advanced to Day ${next}`, 'success');
    } catch (e) {
      showToast('Failed to advance day.', 'error');
    }
  });

  document.getElementById('admin-set-day-btn').addEventListener('click', () => {
    const panel = document.getElementById('admin-panel-day');
    const setCard = panel.querySelector('.glass-card');
    setCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  document.querySelectorAll('#admin-day-set-pills .day-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      const day = parseInt(pill.dataset.day, 10);
      try {
        await setCurrentDay(day);
        showToast(`Day set to Day ${day}`, 'success');
      } catch (e) {
        showToast('Failed to set day.', 'error');
      }
    });
  });
}

// ══════════════════════════════════════════════════════
// PERIOD TIMINGS
// ══════════════════════════════════════════════════════

async function loadTimings() {
  const editor = document.getElementById('timings-editor');
  editor.innerHTML = '<div style="color:var(--text-muted);padding:1rem">Loading...</div>';
  try {
    const timings = await getPeriodTimings();
    renderTimingsEditor(timings);
  } catch (e) {
    editor.innerHTML = '<div style="color:var(--error)">Failed to load timings.</div>';
  }
}

function renderTimingsEditor(timings) {
  const editor = document.getElementById('timings-editor');
  editor.innerHTML = ROMAN.map((roman, idx) => {
    const key = `period${idx + 1}`;
    const t = timings[key] || {};
    return `<div class="period-timing-item">
      <div class="period-timing-label">Period ${roman}</div>
      <div class="timing-inputs">
        <input class="sfs-input" type="time" id="timing-start-${idx + 1}" value="${t.start || ''}" placeholder="--:--" />
        <span class="timing-sep">to</span>
        <input class="sfs-input" type="time" id="timing-end-${idx + 1}" value="${t.end || ''}" placeholder="--:--" />
      </div>
    </div>`;
  }).join('');
}

function initTimingsEditor() {
  document.getElementById('save-timings-btn').addEventListener('click', async () => {
    const timings = {};
    for (let i = 1; i <= 6; i++) {
      const start = document.getElementById(`timing-start-${i}`)?.value || null;
      const end = document.getElementById(`timing-end-${i}`)?.value || null;
      timings[`period${i}`] = (start && end) ? { start, end } : null;
    }
    try {
      await setPeriodTimings(timings);
      showToast('Timings saved!', 'success');
    } catch (e) {
      showToast('Failed to save timings.', 'error');
    }
  });
}

// ══════════════════════════════════════════════════════
// TEACHERS
// ══════════════════════════════════════════════════════

async function loadTeachers() {
  const list = document.getElementById('teachers-list');
  list.innerHTML = '<div style="color:var(--text-muted);padding:1rem">Loading...</div>';
  try {
    const teachers = await getAllTeachers();
    cachedTeachers = {};
    teachers.forEach(t => { cachedTeachers[t.initials] = t; });
    renderTeacherList(teachers);
  } catch (e) {
    list.innerHTML = '<div style="color:var(--error)">Failed to load teachers.</div>';
  }
}

function renderTeacherList(teachers) {
  const list = document.getElementById('teachers-list');
  const sorted = teachers.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
  if (!sorted.length) {
    list.innerHTML = '<div class="empty-state"><p>No teachers yet. Add one above.</p></div>';
    return;
  }
  list.innerHTML = sorted.map(t => {
    const isPending = !t.staffId;
    const idText = isPending ? '<span class="badge badge-pending">Pending ID</span>' : t.staffId;
    const ptBadge = t.isPartTime ? '<span class="badge badge-parttime">Part-time</span>' : '';
    return `<div class="teacher-card" data-initials="${t.initials}" style="cursor:pointer">
      <div class="teacher-avatar">${t.initials}</div>
      <div class="teacher-info">
        <div class="teacher-name">${t.fullName}</div>
        <div class="teacher-id">${idText}</div>
        <div class="teacher-badges">${ptBadge}</div>
      </div>
      <button class="btn btn-ghost btn-sm btn-icon" data-edit-teacher="${t.initials}" title="Edit">✏️</button>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-edit-teacher]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openTeacherModal(btn.dataset.editTeacher);
    });
  });
}

function initTeacherPanel() {
  document.getElementById('add-teacher-btn').addEventListener('click', () => openTeacherModal(null));
}

function openTeacherModal(initials) {
  const modal = document.getElementById('teacher-modal');
  const title = document.getElementById('teacher-modal-title');
  const iField = document.getElementById('t-initials');
  const nameField = document.getElementById('t-fullname');
  const idField = document.getElementById('t-staffid');
  const ptField = document.getElementById('t-parttime');

  if (initials && cachedTeachers[initials]) {
    const t = cachedTeachers[initials];
    title.textContent = 'Edit Teacher';
    iField.value = t.initials;
    iField.readOnly = true;
    nameField.value = t.fullName;
    idField.value = t.staffId || '';
    ptField.checked = !!t.isPartTime;
  } else {
    title.textContent = 'Add Teacher';
    iField.value = '';
    iField.readOnly = false;
    nameField.value = '';
    idField.value = '';
    ptField.checked = false;
  }

  modal.classList.add('open');
}

// ══════════════════════════════════════════════════════
// SUBJECTS
// ══════════════════════════════════════════════════════

async function loadSubjects() {
  const list = document.getElementById('subjects-list');
  list.innerHTML = '<div style="color:var(--text-muted);padding:1rem">Loading...</div>';
  try {
    const map = await getAllSubjects();
    cachedSubjects = map;
    renderSubjectList(map);
  } catch (e) {
    list.innerHTML = '<div style="color:var(--error)">Failed to load subjects.</div>';
  }
}

function renderSubjectList(map) {
  const list = document.getElementById('subjects-list');
  const entries = Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  if (!entries.length) {
    list.innerHTML = '<div class="empty-state"><p>No subjects yet.</p></div>';
    return;
  }
  list.innerHTML = entries.map(([code, name]) =>
    `<div class="subject-item" style="cursor:pointer" data-edit-subject="${code}">
      <div class="subject-code">${code}</div>
      <div class="subject-name">${name}</div>
      <button class="btn btn-ghost btn-sm btn-icon" style="margin-left:auto" data-edit-subject-btn="${code}" title="Edit">✏️</button>
    </div>`
  ).join('');

  list.querySelectorAll('[data-edit-subject-btn]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openSubjectModal(btn.dataset.editSubjectBtn);
    });
  });
}

function initSubjectPanel() {
  document.getElementById('add-subject-btn').addEventListener('click', () => openSubjectModal(null));
}

function openSubjectModal(code) {
  const modal = document.getElementById('subject-modal');
  const title = document.getElementById('subject-modal-title');
  const codeField = document.getElementById('s-code');
  const nameField = document.getElementById('s-name');

  if (code !== null && cachedSubjects[code] !== undefined) {
    title.textContent = 'Edit Subject';
    codeField.value = code;
    codeField.readOnly = true;
    nameField.value = cachedSubjects[code];
  } else {
    title.textContent = 'Add Subject';
    codeField.value = '';
    codeField.readOnly = false;
    nameField.value = '';
  }

  modal.classList.add('open');
}

// ══════════════════════════════════════════════════════
// ROUTINE EDITOR
// ══════════════════════════════════════════════════════

function initRoutineEditor() {
  document.getElementById('editor-class-select').addEventListener('change', e => {
    editorClass = e.target.value;
    if (editorClass) loadEditorGrid();
  });
}

async function loadEditorGrid() {
  const body = document.getElementById('routine-editor-body');
  body.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">Loading...</div>';

  try {
    if (!Object.keys(cachedSubjects).length) cachedSubjects = await getAllSubjects();
    if (!Object.keys(cachedTeachers).length) {
      const arr = await getAllTeachers();
      arr.forEach(t => { cachedTeachers[t.initials] = t; });
    }

    // Load all 7 days for the selected class
    const allDays = {};
    for (let d = 1; d <= 7; d++) {
      allDays[d] = await getRoutineForDay(d);
    }
    renderEditorGrid(body, allDays);
  } catch (e) {
    body.innerHTML = '<div style="color:var(--error)">Failed to load routine.</div>';
    console.error(e);
  }
}

function renderEditorGrid(body, allDays) {
  const dayHeaders = Array.from({length: 7}, (_, i) => `<th>Day ${i + 1}</th>`).join('');

  const rows = ROMAN.map((roman, pIdx) => {
    const cells = Array.from({length: 7}, (_, dIdx) => {
      const dayNumber = dIdx + 1;
      const slots = allDays[dayNumber][`period${pIdx + 1}`] || [];
      const slot = slots.find(s =>
        s.className === editorClass ||
        (s.involvedClasses && s.involvedClasses.includes(editorClass))
      );

      let cellClass = 'editor-cell';
      let innerHtml = '<span style="color:var(--text-muted);font-size:0.72rem">Empty</span>';

      if (slot) {
        if (slot.slotType === 'dual-subject') {
          cellClass += ' type-dual';
          innerHtml = `<span class="editor-cell-subject">English I/II</span><span class="editor-cell-teacher">${slot.teacherInitials}</span>`;
        } else if (slot.slotType === 'value-cate-split') {
          cellClass += ' type-split';
          const pool = (slot.involvedClasses || []).join('+');
          innerHtml = `<span class="editor-cell-subject">Val/Cate</span><span class="editor-cell-teacher">${slot.teacherInitials} · ${pool}</span>`;
        } else {
          const subName = cachedSubjects[slot.subjectCode] || `Sub ${slot.subjectCode}`;
          const short = subName.length > 12 ? subName.slice(0, 11) + '…' : subName;
          innerHtml = `<span class="editor-cell-subject">${short}</span><span class="editor-cell-teacher">${slot.teacherInitials || ''}</span>`;
        }
      }

      return `<td>
        <div class="${cellClass}"
             data-day="${dayNumber}" data-period="${pIdx + 1}"
             data-slot-id="${slot ? slot.id : ''}"
             data-slot-type="${slot ? slot.slotType : ''}"
             style="cursor:pointer">
          ${innerHtml}
        </div>
      </td>`;
    }).join('');

    return `<tr><th>Period ${roman}</th>${cells}</tr>`;
  }).join('');

  body.innerHTML = `
    <div class="routine-editor-wrap">
      <table class="routine-editor-table">
        <thead><tr><th>Period</th>${dayHeaders}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  body.querySelectorAll('.editor-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const dayNumber = parseInt(cell.dataset.day, 10);
      const periodNumber = parseInt(cell.dataset.period, 10);
      const slotId = cell.dataset.slotId;
      openSlotModal(dayNumber, periodNumber, slotId);
    });
  });
}

// ══════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════

function initModals() {
  // ── Slot Modal ──
  const slotModal = document.getElementById('slot-modal');
  document.getElementById('slot-modal-close').addEventListener('click', () => slotModal.classList.remove('open'));
  document.getElementById('slot-modal-cancel').addEventListener('click', () => slotModal.classList.remove('open'));
  slotModal.addEventListener('click', e => { if (e.target === slotModal) slotModal.classList.remove('open'); });

  document.getElementById('slot-type-select').addEventListener('change', e => {
    const isRegularOrDual = ['regular', 'dual-subject'].includes(e.target.value);
    document.getElementById('slot-form-regular').style.display = isRegularOrDual ? '' : 'none';
    document.getElementById('slot-form-split').style.display = isRegularOrDual ? 'none' : '';
  });

  document.getElementById('slot-modal-save').addEventListener('click', saveSlot);
  document.getElementById('slot-modal-delete').addEventListener('click', async () => {
    if (!slotModalCtx) return;
    const { dayNumber, periodNumber, slotId } = slotModalCtx;
    if (!slotId) { slotModal.classList.remove('open'); return; }
    try {
      await deleteSlot(dayNumber, periodNumber, slotId);
      showToast('Slot deleted.', 'success');
      slotModal.classList.remove('open');
      loadEditorGrid();
    } catch (e) {
      showToast('Failed to delete slot.', 'error');
    }
  });

  // ── Teacher Modal ──
  const teacherModal = document.getElementById('teacher-modal');
  document.getElementById('teacher-modal-close').addEventListener('click', () => teacherModal.classList.remove('open'));
  document.getElementById('teacher-modal-cancel').addEventListener('click', () => teacherModal.classList.remove('open'));
  teacherModal.addEventListener('click', e => { if (e.target === teacherModal) teacherModal.classList.remove('open'); });

  document.getElementById('teacher-modal-save').addEventListener('click', async () => {
    const initials = document.getElementById('t-initials').value.trim().toUpperCase();
    const fullName = document.getElementById('t-fullname').value.trim();
    const staffId = document.getElementById('t-staffid').value.trim() || null;
    const isPartTime = document.getElementById('t-parttime').checked;

    if (!initials || !fullName) { showToast('Initials and Full Name are required.', 'error'); return; }

    try {
      await upsertTeacher(initials, { initials, fullName, staffId, isPartTime });
      showToast('Teacher saved!', 'success');
      teacherModal.classList.remove('open');
      loadTeachers();
    } catch (e) {
      showToast('Failed to save teacher.', 'error');
    }
  });

  // ── Subject Modal ──
  const subjectModal = document.getElementById('subject-modal');
  document.getElementById('subject-modal-close').addEventListener('click', () => subjectModal.classList.remove('open'));
  document.getElementById('subject-modal-cancel').addEventListener('click', () => subjectModal.classList.remove('open'));
  subjectModal.addEventListener('click', e => { if (e.target === subjectModal) subjectModal.classList.remove('open'); });

  document.getElementById('subject-modal-save').addEventListener('click', async () => {
    const code = parseInt(document.getElementById('s-code').value, 10);
    const name = document.getElementById('s-name').value.trim();

    if (!code || !name) { showToast('Code and Name are required.', 'error'); return; }

    try {
      await upsertSubject(code, name);
      showToast('Subject saved!', 'success');
      subjectModal.classList.remove('open');
      loadSubjects();
    } catch (e) {
      showToast('Failed to save subject.', 'error');
    }
  });
}

async function openSlotModal(dayNumber, periodNumber, slotId) {
  slotModalCtx = { dayNumber, periodNumber, slotId };

  const modal = document.getElementById('slot-modal');
  const title = document.getElementById('slot-modal-title');
  const typeSelect = document.getElementById('slot-type-select');
  const subjectSelect = document.getElementById('slot-subject-select');
  const teacherSelect = document.getElementById('slot-teacher-select');
  const valueTeacher = document.getElementById('slot-value-teacher');
  const cateTeacher = document.getElementById('slot-cate-teacher');
  const poolSelect = document.getElementById('slot-pool-select');
  const deleteBtn = document.getElementById('slot-modal-delete');

  title.textContent = `Edit — Class ${editorClass} · Period ${ROMAN[periodNumber - 1]} · Day ${dayNumber}`;
  deleteBtn.style.display = slotId ? '' : 'none';

  // Populate subject dropdown
  if (!Object.keys(cachedSubjects).length) cachedSubjects = await getAllSubjects();
  subjectSelect.innerHTML = '<option value="">— Select Subject —</option>';
  Object.entries(cachedSubjects).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([code, name]) => {
    subjectSelect.innerHTML += `<option value="${code}">${code}. ${name}</option>`;
  });

  // Populate teacher dropdowns
  if (!Object.keys(cachedTeachers).length) {
    const arr = await getAllTeachers();
    arr.forEach(t => { cachedTeachers[t.initials] = t; });
  }
  const teacherOpts = Object.values(cachedTeachers)
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map(t => `<option value="${t.initials}">${t.fullName} (${t.initials})</option>`)
    .join('');

  teacherSelect.innerHTML = '<option value="">— Select Teacher —</option>' + teacherOpts;
  valueTeacher.innerHTML = '<option value="">— Select Teacher —</option>' + teacherOpts;
  cateTeacher.innerHTML = '<option value="">— Select Teacher —</option>' + teacherOpts;

  // Load existing slot if present
  typeSelect.value = 'regular';
  document.getElementById('slot-form-regular').style.display = '';
  document.getElementById('slot-form-split').style.display = 'none';

  if (slotId) {
    try {
      const slots = await getRoutineForDay(dayNumber);
      const periodSlots = slots[`period${periodNumber}`] || [];
      const existing = periodSlots.find(s => s.id === slotId);
      if (existing) {
        typeSelect.value = existing.slotType || 'regular';
        if (existing.slotType === 'value-cate-split') {
          document.getElementById('slot-form-regular').style.display = 'none';
          document.getElementById('slot-form-split').style.display = '';
          valueTeacher.value = existing.track === 'Value Education' ? existing.teacherInitials : '';
          cateTeacher.value = existing.track === 'Catechism' ? existing.teacherInitials : '';
          if (existing.involvedClasses) {
            const poolVal = existing.involvedClasses.join(',');
            poolSelect.value = poolVal;
          }
        } else {
          const code = Array.isArray(existing.subjectCode) ? existing.subjectCode[0] : existing.subjectCode;
          subjectSelect.value = String(code);
          teacherSelect.value = existing.teacherInitials || '';
        }
      }
    } catch (e) {
      console.error('Failed to load existing slot:', e);
    }
  }

  modal.classList.add('open');
}

async function saveSlot() {
  if (!slotModalCtx || !editorClass) return;
  const { dayNumber, periodNumber } = slotModalCtx;
  const modal = document.getElementById('slot-modal');
  const slotType = document.getElementById('slot-type-select').value;

  try {
    if (slotType === 'value-cate-split') {
      const valTeacher = document.getElementById('slot-value-teacher').value;
      const catTeacher = document.getElementById('slot-cate-teacher').value;
      const poolVal = document.getElementById('slot-pool-select').value;
      const involvedClasses = poolVal.split(',');

      if (!valTeacher || !catTeacher) { showToast('Select both teachers for split.', 'error'); return; }

      // Delete old slot if it exists
      if (slotModalCtx.slotId) await deleteSlot(dayNumber, periodNumber, slotModalCtx.slotId);

      const primaryClass = involvedClasses[0];
      await upsertSlot(dayNumber, periodNumber, `${primaryClass}_value`, {
        className: primaryClass, subjectCode: 8, teacherInitials: valTeacher,
        slotType: 'value-cate-split', track: 'Value Education',
        involvedClasses, room: 'Room 9'
      });
      await upsertSlot(dayNumber, periodNumber, `${primaryClass}_cate`, {
        className: primaryClass, subjectCode: 8, teacherInitials: catTeacher,
        slotType: 'value-cate-split', track: 'Catechism',
        involvedClasses, room: 'Room 10'
      });
    } else {
      const subjectCode = parseInt(document.getElementById('slot-subject-select').value, 10);
      const teacherInitials = document.getElementById('slot-teacher-select').value;

      if (!subjectCode || !teacherInitials) { showToast('Select subject and teacher.', 'error'); return; }

      const slotId = editorClass;
      const subCode = slotType === 'dual-subject' ? [4, 7] : subjectCode;
      await upsertSlot(dayNumber, periodNumber, slotId, {
        className: editorClass, subjectCode: subCode, teacherInitials,
        slotType, track: null, involvedClasses: null, room: null
      });
    }

    showToast('Slot saved!', 'success');
    modal.classList.remove('open');
    loadEditorGrid();
  } catch (e) {
    showToast('Failed to save slot.', 'error');
    console.error(e);
  }
}

// ══════════════════════════════════════════════════════
// SEED PANEL
// ══════════════════════════════════════════════════════

function initSeedPanel() {
  document.getElementById('seed-db-btn').addEventListener('click', () => {
    if (!confirm('This will overwrite all seeded data. Continue?')) return;
    runSeedFromAdmin();
  });
}

async function runSeedFromAdmin() {
  const btn = document.getElementById('seed-db-btn');
  const progress = document.getElementById('seed-progress');
  btn.disabled = true;
  progress.innerHTML = '<div style="color:var(--text-secondary)">🌱 Seeding database — this may take a minute…</div>';

  try {
    await runSeed();
    progress.innerHTML += '<div style="color:var(--success)">🎉 Database seeded successfully! Check browser console for details.</div>';
    showToast('Database seeded!', 'success');
  } catch (e) {
    progress.innerHTML += `<div style="color:var(--error)">❌ Seed failed: ${e.message}</div>`;
    showToast('Seed failed. Check console.', 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}
