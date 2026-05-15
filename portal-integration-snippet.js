// portal-integration-snippet.js
// ─────────────────────────────────────────────────────────────────
// DROP THIS INTO YOUR MAIN PORTAL'S TEACHER DASHBOARD CODE.
//
// What it does:
//   - Reads the signed-in teacher's /users/{uid}.teacherInitials field
//   - Queries /routine/{day}/periods/{period}/slots collection-group
//     for every slot they teach across the 7-day cycle
//   - Returns a structured { 1: { 1: slot, 2: slot, ... }, ... 7: {} }
//
// Prerequisites:
//   1. The teacher's portal user doc has  teacherInitials: "<initials>"
//      (use the Routine App's Admin → Link Accounts panel to set this)
//   2. A composite Firestore index exists:
//        collection group: slots
//        field: teacherInitials, Ascending
//        query scope: Collection group
//      Firebase will print an auto-create link in the browser console
//      the first time the query runs.
//   3. The main portal already initializes the same Firebase project
//      (st-francis-school-a3e7e). No special auth setup needed —
//      collection-group reads on /routine/.../slots are public-read
//      under the current Firestore rules.
// ─────────────────────────────────────────────────────────────────

import { getFirestore, doc, getDoc, collection, collectionGroup, query, where, getDocs }
  from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

/**
 * Fetch the logged-in teacher's full 7-day schedule.
 * @param {firebase.User} user  — the currently signed-in Firebase Auth user
 * @returns {Promise<{
 *   initials: string|null,
 *   schedule: Object,        // { 1: { 1: slot, 2: slot, ... }, ... 7: {} }
 *   subjects: Object         // { 1: 'Maths', 2: 'Science', ... }
 * }>}
 */
export async function getMyTeachingSchedule(user) {
  const db = getFirestore();

  // 1. Look up this teacher's initials from their portal user doc
  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const initials = userSnap.exists() ? userSnap.data().teacherInitials : null;
  if (!initials) {
    return { initials: null, schedule: emptySchedule(), subjects: {} };
  }

  // 2. Pull subjects (small, ~15 docs) for label lookup
  const subjects = {};
  const subjectsSnap = await getDocs(collection(db, 'subjects'));
  subjectsSnap.forEach(s => {
    const d = s.data();
    if (d && d.code != null) subjects[d.code] = d.name;
  });

  // 3. Query the routine for every slot this teacher teaches
  const q = query(collectionGroup(db, 'slots'),
    where('teacherInitials', '==', initials));
  const slotsSnap = await getDocs(q);

  const schedule = emptySchedule();
  slotsSnap.forEach(s => {
    // path: routine/{day}/periods/{period}/slots/{slotId}
    const parts = s.ref.path.split('/');
    const day = parseInt(parts[1], 10);
    const period = parseInt(parts[3], 10);
    if (schedule[day]) schedule[day][period] = { id: s.id, ...s.data() };
  });

  return { initials, schedule, subjects };
}

function emptySchedule() {
  const s = {};
  for (let d = 1; d <= 7; d++) s[d] = {};
  return s;
}

// ─────────────────────────────────────────────────────────────────
// Example usage in your portal's teacher dashboard:
// ─────────────────────────────────────────────────────────────────
//
//   import { onAuthStateChanged, getAuth } from 'firebase/auth';
//   import { getMyTeachingSchedule } from './portal-integration-snippet.js';
//
//   onAuthStateChanged(getAuth(), async user => {
//     if (!user) return;
//     const { initials, schedule, subjects } = await getMyTeachingSchedule(user);
//
//     if (!initials) {
//       document.getElementById('my-routine').innerHTML =
//         '<p>Your account is not yet linked to a teacher record. ' +
//         'Please contact admin.</p>';
//       return;
//     }
//
//     // schedule[3][2] === { className:'IX', subjectCode:5, ... } | undefined
//     // subjects[5] === 'Khasi / Alternative'
//     renderInPortal(schedule, subjects);
//   });
//
// ─────────────────────────────────────────────────────────────────
