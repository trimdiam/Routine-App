// db.js — All Firestore read/write functions for SFS Routine App

import { db } from './firebase.js';
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, collectionGroup, query, where, orderBy, onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// ─────────────────────────────────────────────
// TEACHERS
// ─────────────────────────────────────────────

export async function getAllTeachers() {
  const snap = await getDocs(collection(db, 'teachers'));
  return snap.docs.map(d => d.data());
}

export async function getTeacher(initials) {
  const snap = await getDoc(doc(db, 'teachers', initials));
  return snap.exists() ? snap.data() : null;
}

export async function upsertTeacher(initials, data) {
  await setDoc(doc(db, 'teachers', initials), data, { merge: true });
}

// ─────────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────────

export async function getAllSubjects() {
  const snap = await getDocs(collection(db, 'subjects'));
  const subjects = {};
  snap.docs.forEach(d => { subjects[d.data().code] = d.data().name; });
  return subjects;
}

export async function upsertSubject(code, name) {
  await setDoc(doc(db, 'subjects', String(code)), { code, name }, { merge: true });
}

// ─────────────────────────────────────────────
// SETTINGS — SCHOOL DAY
// ─────────────────────────────────────────────

export async function getCurrentDay() {
  const snap = await getDoc(doc(db, 'settings', 'schoolDay'));
  return snap.exists() ? snap.data() : { currentDay: 1, lastUpdated: null };
}

export async function setCurrentDay(dayNumber) {
  await setDoc(doc(db, 'settings', 'schoolDay'), {
    currentDay: dayNumber,
    lastUpdated: serverTimestamp()
  });
}

export function listenCurrentDay(callback) {
  return onSnapshot(doc(db, 'settings', 'schoolDay'), snap => {
    if (snap.exists()) callback(snap.data());
  });
}

// ─────────────────────────────────────────────
// SETTINGS — PERIOD TIMINGS
// ─────────────────────────────────────────────

export async function getPeriodTimings() {
  const snap = await getDoc(doc(db, 'settings', 'periodTimings'));
  if (!snap.exists()) {
    return { period1: null, period2: null, period3: null, period4: null, period5: null, period6: null };
  }
  return snap.data();
}

export async function setPeriodTimings(timings) {
  await setDoc(doc(db, 'settings', 'periodTimings'), timings, { merge: true });
}

export function listenPeriodTimings(callback) {
  return onSnapshot(doc(db, 'settings', 'periodTimings'), snap => {
    callback(snap.exists() ? snap.data() : {
      period1: null, period2: null, period3: null,
      period4: null, period5: null, period6: null
    });
  });
}

// ─────────────────────────────────────────────
// ROUTINE — READ
// ─────────────────────────────────────────────

/**
 * Get all slots for a given day and period.
 * Returns array of slot objects.
 */
export async function getSlotsForPeriod(dayNumber, periodNumber) {
  const ref = collection(db, 'routine', String(dayNumber), 'periods', String(periodNumber), 'slots');
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get the full routine for a specific day.
 * Returns: { period1: [slots], period2: [slots], ... period6: [slots] }
 */
export async function getRoutineForDay(dayNumber) {
  const result = {};
  for (let p = 1; p <= 6; p++) {
    result[`period${p}`] = await getSlotsForPeriod(dayNumber, p);
  }
  return result;
}

/**
 * Get the full routine for a specific class across all 7 days.
 * Returns: { day1: { period1: slot|null, ... }, ... day7: {...} }
 */
export async function getRoutineForClass(className) {
  const result = {};
  for (let d = 1; d <= 7; d++) {
    result[`day${d}`] = {};
    for (let p = 1; p <= 6; p++) {
      const slots = await getSlotsForPeriod(d, p);
      // For value-cate-split: a class may appear in involvedClasses
      const slot = slots.find(s =>
        s.className === className ||
        (s.involvedClasses && s.involvedClasses.includes(className))
      );
      result[`day${d}`][`period${p}`] = slot || null;
    }
  }
  return result;
}

/**
 * Get a teacher's schedule for a specific day.
 * Returns: { period1: slot|null, ... period6: slot|null }
 */
export async function getTeacherScheduleForDay(teacherInitials, dayNumber) {
  const result = {};
  for (let p = 1; p <= 6; p++) {
    const slots = await getSlotsForPeriod(dayNumber, p);
    const slot = slots.find(s => s.teacherInitials === teacherInitials);
    result[`period${p}`] = slot || null;
  }
  return result;
}

// ─────────────────────────────────────────────
// ROUTINE — WRITE
// ─────────────────────────────────────────────

/**
 * Upsert a single slot.
 * slotId convention: className for regular, className_track for value-cate-split
 */
export async function upsertSlot(dayNumber, periodNumber, slotId, slotData) {
  const ref = doc(db, 'routine', String(dayNumber), 'periods', String(periodNumber), 'slots', slotId);
  await setDoc(ref, slotData, { merge: true });
}

export async function deleteSlot(dayNumber, periodNumber, slotId) {
  const ref = doc(db, 'routine', String(dayNumber), 'periods', String(periodNumber), 'slots', slotId);
  await deleteDoc(ref);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Resolve subject name(s) from code(s).
 * Handles both single code (number) and dual-subject array ([4,7]).
 */
export function resolveSubjectName(subjectCode, subjectsMap) {
  if (Array.isArray(subjectCode)) {
    return subjectCode.map(c => subjectsMap[c] || `Subject ${c}`).join(' / ');
  }
  return subjectsMap[subjectCode] || `Subject ${subjectCode}`;
}

/**
 * Format period timing string. Returns "--:-- to --:--" if null.
 */
export function formatTiming(timingObj) {
  if (!timingObj || !timingObj.start || !timingObj.end) return '--:-- to --:--';
  return `${timingObj.start} – ${timingObj.end}`;
}

/**
 * Get active period index (0-based) based on current time and timings.
 * Returns -1 if no timings set or outside all periods.
 */
export function getActivePeriodIndex(timings) {
  if (!timings) return -1;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 1; i <= 6; i++) {
    const t = timings[`period${i}`];
    if (!t || !t.start || !t.end) continue;
    const [sh, sm] = t.start.split(':').map(Number);
    const [eh, em] = t.end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (currentMinutes >= startMin && currentMinutes < endMin) return i - 1;
  }
  return -1;
}

// ─────────────────────────────────────────────
// USER ↔ TEACHER LINKING (portal integration)
// ─────────────────────────────────────────────

/** Read a single /users/{uid} document. Returns data or null. */
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

/** Write the teacherInitials field on a user doc (admin action). */
export async function setUserTeacherInitials(uid, initials) {
  await setDoc(doc(db, 'users', uid), { teacherInitials: initials }, { merge: true });
}

/**
 * List all users with role === 'teacher'.
 * Returns array of { uid, ...userData }.
 * Requires admin rule (current rules allow admin to read all users).
 */
export async function getAllTeacherUsers() {
  const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/**
 * Fetch the full 7-day schedule for a given teacher (by initials).
 * Uses a collectionGroup query across all /routine/{day}/periods/{period}/slots.
 * Returns: { 1: { 1: slot, 2: slot, ... }, 2: {...}, ... 7: {...} }
 *
 * Requires composite index: collection group "slots", field teacherInitials Asc.
 * Firebase will print an auto-create link in console on first run.
 */
export async function getTeacherScheduleByInitials(initials) {
  const q = query(collectionGroup(db, 'slots'), where('teacherInitials', '==', initials));
  const snap = await getDocs(q);
  const schedule = {};
  for (let d = 1; d <= 7; d++) schedule[d] = {};
  snap.forEach(s => {
    // path: routine/{day}/periods/{period}/slots/{slotId}
    const parts = s.ref.path.split('/');
    const day = parseInt(parts[1], 10);
    const period = parseInt(parts[3], 10);
    if (schedule[day]) schedule[day][period] = { id: s.id, ...s.data() };
  });
  return schedule;
}
