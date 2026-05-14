// seed.js — One-time idempotent seeding script for SFS Routine App
// Run via: node seed.js  OR  use the Admin Panel "Seed Database" button
// Uses setDoc (not addDoc) so running twice will not duplicate data.

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import {
  getFirestore, doc, setDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// ── Firebase init (same guard as firebase.js) ──
const firebaseConfig = {
  apiKey: "AIzaSyAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "st-francis-school-a3e7e.firebaseapp.com",
  projectId: "st-francis-school-a3e7e",
  storageBucket: "st-francis-school-a3e7e.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX"
};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────

const TEACHERS = [
  { initials: 'ELN',  fullName: 'Emilia Lyngdoh Nongbri',          staffId: 'SFST001', isPartTime: false },
  { initials: 'AN',   fullName: 'Asha Mary Nongkhlaw',              staffId: 'SFST002', isPartTime: false },
  { initials: 'ARLN', fullName: 'Andrea Rafelline Lyngdoh Nongbri', staffId: 'SFST003', isPartTime: false },
  { initials: 'QM',   fullName: 'Queency Mary Mawrie',              staffId: 'SFST004', isPartTime: false },
  { initials: 'FS',   fullName: 'Felicia Synjri',                   staffId: 'SFST005', isPartTime: false },
  { initials: 'IM',   fullName: 'Idahun Mawrie',                    staffId: 'SFST006', isPartTime: false },
  { initials: 'MP',   fullName: 'Michael Pamthet',                  staffId: 'SFST007', isPartTime: false },
  { initials: 'DP',   fullName: 'Dilang Pohshna',                   staffId: 'SFST008', isPartTime: false },
  { initials: 'PK',   fullName: 'Phisabet Kharumnuid',              staffId: 'SFST009', isPartTime: false },
  { initials: 'MBK',  fullName: 'Mary Banri Kharsyntiew',           staffId: 'SFST010', isPartTime: false },
  { initials: 'DS',   fullName: 'Dariker Songthiang',               staffId: 'SFST011', isPartTime: false },
  { initials: 'DN',   fullName: 'Darisha Nongrum',                  staffId: 'SFST012', isPartTime: false },
  { initials: 'ID',   fullName: 'Ittrila Dkhar',                    staffId: 'SFST013', isPartTime: false },
  { initials: 'YL',   fullName: 'Youlinda Lyngdoh',                 staffId: 'SFST014', isPartTime: false },
  { initials: 'IOH',  fullName: 'Iohhunlang Nongkhlaw',             staffId: 'SFST015', isPartTime: false },
  { initials: 'DOL',  fullName: 'Dolly Nongsiej',                   staffId: 'SFST016', isPartTime: false },
  { initials: 'MJ',   fullName: 'Merilin Jyndiang',                 staffId: 'SFST018', isPartTime: false },
  { initials: 'AKK',  fullName: 'Audilia Kharkongor',               staffId: 'SFST021', isPartTime: false },
  { initials: 'AM',   fullName: 'Aidahunshisha Mawrie',             staffId: 'SFST022', isPartTime: false },
  { initials: 'NS',   fullName: 'Niwanki Shylla',                   staffId: 'SFST019', isPartTime: false },
  { initials: 'VMK',  fullName: 'Vanessa Mary Kharkongor',          staffId: 'SFST020', isPartTime: false },
  { initials: 'BK',   fullName: 'Babit Kharsahnoh',                 staffId: 'SFST025', isPartTime: false },
  { initials: 'DM',   fullName: 'Daprikmen Massar',                 staffId: null,      isPartTime: true  },
  { initials: 'AP',   fullName: 'Anando Pohtam',                    staffId: null,      isPartTime: true  },
];

const SUBJECTS = [
  { code: 1,  name: 'Maths' },
  { code: 2,  name: 'Science' },
  { code: 3,  name: 'Social Studies' },
  { code: 4,  name: 'English I' },
  { code: 5,  name: 'Khasi / Alternative' },
  { code: 6,  name: 'Health Education' },
  { code: 7,  name: 'English II' },
  { code: 8,  name: 'Value Education' },
  { code: 9,  name: 'Computer' },
  { code: 10, name: 'Hindi' },
  { code: 11, name: 'Aptitude' },
  { code: 12, name: 'Arts' },
  { code: 13, name: 'P.E.' },
  { code: 14, name: 'Singing' },
  { code: 15, name: 'FLS (Foreign Language Studies)' },
];

// ─────────────────────────────────────────────
// ROUTINE DATA — ALL 7 DAYS
// Each entry: [dayNumber, periodNumber, slotId, slotData]
// slotId convention:
//   regular/dual-subject  → className  (e.g. "X", "IX")
//   value-cate-split      → className_track  (e.g. "IX_value", "IX_cate")
//   For split pools, className = primary class listed first in pool
// ─────────────────────────────────────────────

const ROUTINE_SLOTS = [

// ══════════════════════════════════════════════
// DAY 1
// ══════════════════════════════════════════════
// Period I
[1,1,'X',    { className:'X',    subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'IX',   { className:'IX',   subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'VIII', { className:'VIII', subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'VI',   { className:'VI',   subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'V',    { className:'V',    subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'IV',   { className:'IV',   subjectCode:8,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'III',  { className:'III',  subjectCode:2,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'II',   { className:'II',   subjectCode:5,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,1,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II
[1,2,'X',    { className:'X',    subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'ARLN', slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[1,2,'VIII', { className:'VIII', subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'VII',  { className:'VII',  subjectCode:4,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'VI',   { className:'VI',   subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'IV',   { className:'IV',   subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'III',  { className:'III',  subjectCode:3,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,2,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[1,3,'X',    { className:'X',    subjectCode:3,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'IX',   { className:'IX',   subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'VIII', { className:'VIII', subjectCode:1,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'VII',  { className:'VII',  subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'VI',   { className:'VI',   subjectCode:1,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'V',    { className:'V',    subjectCode:5,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'IV',   { className:'IV',   subjectCode:1,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'III',  { className:'III',  subjectCode:10,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'II',   { className:'II',   subjectCode:2,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,3,'I',    { className:'I',    subjectCode:1,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[1,4,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'MP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[1,4,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'VII',  { className:'VII',  subjectCode:5,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'V',    { className:'V',    subjectCode:1,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'IV',   { className:'IV',   subjectCode:10,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'III',  { className:'III',  subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'II',   { className:'II',   subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,4,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[1,5,'X',    { className:'X',    subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'VIII', { className:'VIII', subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'VI',   { className:'VI',   subjectCode:10,   teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'V',    { className:'V',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'IV',   { className:'IV',   subjectCode:11,   teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'III',  { className:'III',  subjectCode:12,   teacherInitials:'NS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'II',   { className:'II',   subjectCode:13,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'I',    { className:'I',    subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,5,'VI_dm',{ className:'VI',   subjectCode:10,   teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI
[1,6,'X',    { className:'X',    subjectCode:3,    teacherInitials:'AN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'IX',   { className:'IX',   subjectCode:1,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'VIII', { className:'VIII', subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'VII',  { className:'VII',  subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'V',    { className:'V',    subjectCode:3,    teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'IV',   { className:'IV',   subjectCode:7,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'III',  { className:'III',  subjectCode:1,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'II',   { className:'II',   subjectCode:8,    teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[1,6,'I',    { className:'I',    subjectCode:13,   teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],

// ══════════════════════════════════════════════
// DAY 2
// ══════════════════════════════════════════════
// Period I
[2,1,'X',    { className:'X',    subjectCode:2,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'IX',   { className:'IX',   subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'VIII', { className:'VIII', subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'V',    { className:'V',    subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'IV',   { className:'IV',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'III',  { className:'III',  subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'II',   { className:'II',   subjectCode:5,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,1,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II
[2,2,'X',    { className:'X',    subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'IX',   { className:'IX',   subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'VIII', { className:'VIII', subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'VII',  { className:'VII',  subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'VI',   { className:'VI',   subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'IV',   { className:'IV',   subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'III',  { className:'III',  subjectCode:8,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'II',   { className:'II',   subjectCode:7,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,2,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[2,3,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'DP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[2,3,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'VII',  { className:'VII',  subjectCode:6,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'VI',   { className:'VI',   subjectCode:5,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'V',    { className:'V',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'IV',   { className:'IV',   subjectCode:9,    teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'III',  { className:'III',  subjectCode:3,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,3,'I',    { className:'I',    subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[2,4,'X',    { className:'X',    subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'VIII', { className:'VIII', subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'VII',  { className:'VII',  subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'VI',   { className:'VI',   subjectCode:2,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'V',    { className:'V',    subjectCode:10,   teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'IV',   { className:'IV',   subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'III',  { className:'III',  subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'II',   { className:'II',   subjectCode:2,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,4,'I',    { className:'I',    subjectCode:7,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[2,5,'X',    { className:'X',    subjectCode:13,   teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'DP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[2,5,'VIII', { className:'VIII', subjectCode:1,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'VI',   { className:'VI',   subjectCode:1,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'V',    { className:'V',    subjectCode:3,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'IV',   { className:'IV',   subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'III',  { className:'III',  subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'II',   { className:'II',   subjectCode:11,   teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,5,'I',    { className:'I',    subjectCode:5,    teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI — includes VII/VIII Value/Cate split
[2,6,'X',    { className:'X',    subjectCode:6,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'IX',   { className:'IX',   subjectCode:13,   teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'VIII_value',{ className:'VIII', subjectCode:8, teacherInitials:'IM', slotType:'value-cate-split', track:'Value Education', involvedClasses:['VII','VIII'], room:'Room 9' }],
[2,6,'VIII_cate', { className:'VIII', subjectCode:8, teacherInitials:'FS', slotType:'value-cate-split', track:'Catechism',        involvedClasses:['VII','VIII'], room:'Room 10'}],
[2,6,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'V',    { className:'V',    subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'IV',   { className:'IV',   subjectCode:12,   teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'III',  { className:'III',  subjectCode:14,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'II',   { className:'II',   subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[2,6,'I',    { className:'I',    subjectCode:12,   teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],

// ══════════════════════════════════════════════
// DAY 3
// ══════════════════════════════════════════════
// Period I
[3,1,'X',    { className:'X',    subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'MP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[3,1,'VIII', { className:'VIII', subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'VII',  { className:'VII',  subjectCode:4,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'VI',   { className:'VI',   subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'V',    { className:'V',    subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'IV',   { className:'IV',   subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'III',  { className:'III',  subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'II',   { className:'II',   subjectCode:7,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,1,'IX_ds',{ className:'IX',   subjectCode:[4,7],teacherInitials:'DS',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
// Period II
[3,2,'X',    { className:'X',    subjectCode:1,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'VII',  { className:'VII',  subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'VI',   { className:'VI',   subjectCode:5,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'IV',   { className:'IV',   subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'III',  { className:'III',  subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'II',   { className:'II',   subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,2,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[3,3,'X',    { className:'X',    subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'IX',   { className:'IX',   subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'VIII', { className:'VIII', subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'VII',  { className:'VII',  subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'VI',   { className:'VI',   subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'V',    { className:'V',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'IV',   { className:'IV',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'III',  { className:'III',  subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'II',   { className:'II',   subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,3,'IX_dp',{ className:'IX',   subjectCode:5,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[3,4,'X',    { className:'X',    subjectCode:2,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'VIII', { className:'VIII', subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'VII',  { className:'VII',  subjectCode:7,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'VI',   { className:'VI',   subjectCode:8,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'V',    { className:'V',    subjectCode:8,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'IV',   { className:'IV',   subjectCode:9,    teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'III',  { className:'III',  subjectCode:2,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,4,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[3,5,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'MP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[3,5,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'VII',  { className:'VII',  subjectCode:13,   teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'VI',   { className:'VI',   subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'V',    { className:'V',    subjectCode:5,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'IV',   { className:'IV',   subjectCode:4,    teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'III',  { className:'III',  subjectCode:10,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'II',   { className:'II',   subjectCode:14,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'I',    { className:'I',    subjectCode:2,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,5,'V_vmk',{ className:'V',    subjectCode:5,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI
[3,6,'X',    { className:'X',    subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'IX',   { className:'IX',   subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'VIII', { className:'VIII', subjectCode:13,   teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'VII',  { className:'VII',  subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'VI',   { className:'VI',   subjectCode:1,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'V',    { className:'V',    subjectCode:7,    teacherInitials:'YL',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'IV',   { className:'IV',   subjectCode:10,   teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'III',  { className:'III',  subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'II',   { className:'II',   subjectCode:12,   teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'I',    { className:'I',    subjectCode:14,   teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'VII_dp',{ className:'VII', subjectCode:5,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[3,6,'VIII_vmk',{ className:'VIII',subjectCode:13, teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
];

// Days 4–7 continued in ROUTINE_SLOTS_PART2 below
const ROUTINE_SLOTS_PART2 = [

// ══════════════════════════════════════════════
// DAY 4
// ══════════════════════════════════════════════
// Period I
[4,1,'X',    { className:'X',    subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'IX',   { className:'IX',   subjectCode:11,   teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'VI',   { className:'VI',   subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'IV',   { className:'IV',   subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'III',  { className:'III',  subjectCode:2,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'II',   { className:'II',   subjectCode:5,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,1,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II
[4,2,'X',    { className:'X',    subjectCode:2,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'DP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[4,2,'VIII', { className:'VIII', subjectCode:4,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'VII',  { className:'VII',  subjectCode:9,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'V',    { className:'V',    subjectCode:1,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'IV',   { className:'IV',   subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'III',  { className:'III',  subjectCode:3,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'II',   { className:'II',   subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,2,'VII_vmk',{ className:'VII',subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[4,3,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'MP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[4,3,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'VIII', { className:'VIII', subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'VII',  { className:'VII',  subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'V',    { className:'V',    subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'IV',   { className:'IV',   subjectCode:9,    teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'III',  { className:'III',  subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'II',   { className:'II',   subjectCode:10,   teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,3,'VII_mbk',{ className:'VII',subjectCode:5,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[4,4,'X',    { className:'X',    subjectCode:2,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'IX',   { className:'IX',   subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'VIII', { className:'VIII', subjectCode:6,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'VI',   { className:'VI',   subjectCode:5,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'V',    { className:'V',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'IV',   { className:'IV',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'III',  { className:'III',  subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'I',    { className:'I',    subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,4,'IX_mp',{ className:'IX',   subjectCode:5,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[4,5,'X',    { className:'X',    subjectCode:6,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'VIII', { className:'VIII', subjectCode:15,   teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'VII',  { className:'VII',  subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'VI',   { className:'VI',   subjectCode:6,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'V',    { className:'V',    subjectCode:13,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'IV',   { className:'IV',   subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'III',  { className:'III',  subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'II',   { className:'II',   subjectCode:6,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,5,'I',    { className:'I',    subjectCode:11,   teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI — IX/X Value/Cate split
[4,6,'IX_value',{ className:'IX', subjectCode:8,   teacherInitials:'ELN',  slotType:'value-cate-split', track:'Value Education', involvedClasses:['IX','X'], room:'Room 9' }],
[4,6,'IX_cate', { className:'IX', subjectCode:8,   teacherInitials:'AN',   slotType:'value-cate-split', track:'Catechism',        involvedClasses:['IX','X'], room:'Room 10'}],
[4,6,'VIII', { className:'VIII', subjectCode:12,   teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'VII',  { className:'VII',  subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'VI',   { className:'VI',   subjectCode:13,   teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'V',    { className:'V',    subjectCode:12,   teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'IV',   { className:'IV',   subjectCode:12,   teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'III',  { className:'III',  subjectCode:14,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'II',   { className:'II',   subjectCode:2,    teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'I',    { className:'I',    subjectCode:14,   teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[4,6,'IX_ds',{ className:'IX',   subjectCode:8,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],

// ══════════════════════════════════════════════
// DAY 5
// ══════════════════════════════════════════════
// Period I
[5,1,'X',    { className:'X',    subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'VIII', { className:'VIII', subjectCode:6,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'VII',  { className:'VII',  subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'VI',   { className:'VI',   subjectCode:2,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'V',    { className:'V',    subjectCode:9,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'IV',   { className:'IV',   subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'III',  { className:'III',  subjectCode:3,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,1,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II
[5,2,'X',    { className:'X',    subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'IX',   { className:'IX',   subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'VIII', { className:'VIII', subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'VII',  { className:'VII',  subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'VI',   { className:'VI',   subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'IV',   { className:'IV',   subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'III',  { className:'III',  subjectCode:7,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'II',   { className:'II',   subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,2,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[5,3,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'MP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[5,3,'IX',   { className:'IX',   subjectCode:6,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'VIII', { className:'VIII', subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'VI',   { className:'VI',   subjectCode:1,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'V',    { className:'V',    subjectCode:1,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'IV',   { className:'IV',   subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'III',  { className:'III',  subjectCode:2,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'II',   { className:'II',   subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,3,'VIII_qm',{ className:'VIII',subjectCode:5,   teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[5,4,'X',    { className:'X',    subjectCode:3,    teacherInitials:'AN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'VIII', { className:'VIII', subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'VII',  { className:'VII',  subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'V',    { className:'V',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'IV',   { className:'IV',   subjectCode:3,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'III',  { className:'III',  subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'II',   { className:'II',   subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,4,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V — includes VII/VIII Value/Cate split
[5,5,'X',    { className:'X',    subjectCode:2,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'IX',   { className:'IX',   subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'VIII_value',{ className:'VIII', subjectCode:8, teacherInitials:'IM', slotType:'value-cate-split', track:'Value Education', involvedClasses:['VII','VIII'], room:'Room 9' }],
[5,5,'VIII_cate', { className:'VIII', subjectCode:8, teacherInitials:'FS', slotType:'value-cate-split', track:'Catechism',        involvedClasses:['VII','VIII'], room:'Room 10'}],
[5,5,'VI',   { className:'VI',   subjectCode:6,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'V',    { className:'V',    subjectCode:10,   teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'IV',   { className:'IV',   subjectCode:13,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'III',  { className:'III',  subjectCode:1,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'II',   { className:'II',   subjectCode:5,    teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,5,'I',    { className:'I',    subjectCode:5,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI
[5,6,'X',    { className:'X',    subjectCode:1,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'DP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[5,6,'VIII', { className:'VIII', subjectCode:8,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'VII',  { className:'VII',  subjectCode:8,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'VI',   { className:'VI',   subjectCode:10,   teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'V',    { className:'V',    subjectCode:3,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'IV',   { className:'IV',   subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'III',  { className:'III',  subjectCode:13,   teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'II',   { className:'II',   subjectCode:11,   teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'I',    { className:'I',    subjectCode:5,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'VI_dm',{ className:'VI',   subjectCode:10,   teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[5,6,'I_ap', { className:'I',    subjectCode:5,    teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],

// ══════════════════════════════════════════════
// DAY 6
// ══════════════════════════════════════════════
// Period I
[6,1,'X',    { className:'X',    subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'VIII', { className:'VIII', subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'VII',  { className:'VII',  subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'VI',   { className:'VI',   subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'V',    { className:'V',    subjectCode:9,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'IV',   { className:'IV',   subjectCode:8,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'III',  { className:'III',  subjectCode:8,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'II',   { className:'II',   subjectCode:7,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,1,'I',    { className:'I',    subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II — V/VI Value/Cate split
[6,2,'X',    { className:'X',    subjectCode:3,    teacherInitials:'AN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'IX',   { className:'IX',   subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'VIII', { className:'VIII', subjectCode:2,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'VII',  { className:'VII',  subjectCode:12,   teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'VI_value',{ className:'VI', subjectCode:8,   teacherInitials:'IM',   slotType:'value-cate-split', track:'Value Education', involvedClasses:['V','VI'], room:'Room 9' }],
[6,2,'VI_cate', { className:'VI', subjectCode:8,   teacherInitials:'MBK',  slotType:'value-cate-split', track:'Catechism',        involvedClasses:['V','VI'], room:'Room 10'}],
[6,2,'IV',   { className:'IV',   subjectCode:2,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'III',  { className:'III',  subjectCode:1,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'II',   { className:'II',   subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,2,'I',    { className:'I',    subjectCode:1,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III
[6,3,'X',    { className:'X',    subjectCode:3,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'IX',   { className:'IX',   subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'VIII', { className:'VIII', subjectCode:4,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'VII',  { className:'VII',  subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'VI',   { className:'VI',   subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'V',    { className:'V',    subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'IV',   { className:'IV',   subjectCode:3,    teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'III',  { className:'III',  subjectCode:3,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'II',   { className:'II',   subjectCode:10,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,3,'I',    { className:'I',    subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[6,4,'X',    { className:'X',    subjectCode:[4,7],teacherInitials:'ARLN', slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[6,4,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'VIII', { className:'VIII', subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'VII',  { className:'VII',  subjectCode:4,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'VI',   { className:'VI',   subjectCode:15,   teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'V',    { className:'V',    subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'IV',   { className:'IV',   subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'III',  { className:'III',  subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,4,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[6,5,'X',    { className:'X',    subjectCode:2,    teacherInitials:'PK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'VII',  { className:'VII',  subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'VI',   { className:'VI',   subjectCode:14,   teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'V',    { className:'V',    subjectCode:11,   teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'IV',   { className:'IV',   subjectCode:10,   teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'III',  { className:'III',  subjectCode:12,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'II',   { className:'II',   subjectCode:12,   teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'I',    { className:'I',    subjectCode:13,   teacherInitials:'AM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,5,'I_ap', { className:'I',    subjectCode:13,   teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI
[6,6,'X',    { className:'X',    subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'AN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'VIII', { className:'VIII', subjectCode:3,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'VII',  { className:'VII',  subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'VI',   { className:'VI',   subjectCode:6,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'V',    { className:'V',    subjectCode:14,   teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'IV',   { className:'IV',   subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'III',  { className:'III',  subjectCode:11,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'II',   { className:'II',   subjectCode:13,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'I',    { className:'I',    subjectCode:8,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'VII_fs',{ className:'VII', subjectCode:5,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[6,6,'IX_mp',{ className:'IX',   subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],

// ══════════════════════════════════════════════
// DAY 7
// ══════════════════════════════════════════════
// Period I
[7,1,'X',    { className:'X',    subjectCode:2,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'VIII', { className:'VIII', subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'VII',  { className:'VII',  subjectCode:9,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'VI',   { className:'VI',   subjectCode:7,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'V',    { className:'V',    subjectCode:4,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'IV',   { className:'IV',   subjectCode:4,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'III',  { className:'III',  subjectCode:5,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'II',   { className:'II',   subjectCode:4,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,1,'VII_vmk',{ className:'VII',subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period II
[7,2,'X',    { className:'X',    subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'IX',   { className:'IX',   subjectCode:1,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'VIII', { className:'VIII', subjectCode:6,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'VII',  { className:'VII',  subjectCode:7,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'VI',   { className:'VI',   subjectCode:9,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'V',    { className:'V',    subjectCode:2,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'IV',   { className:'IV',   subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'III',  { className:'III',  subjectCode:7,    teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'II',   { className:'II',   subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,2,'I',    { className:'I',    subjectCode:4,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period III — IX/X Value/Cate split
[7,3,'IX_value',{ className:'IX', subjectCode:8,   teacherInitials:'ELN',  slotType:'value-cate-split', track:'Value Education', involvedClasses:['IX','X'], room:'Room 9' }],
[7,3,'IX_cate', { className:'IX', subjectCode:8,   teacherInitials:'AN',   slotType:'value-cate-split', track:'Catechism',        involvedClasses:['IX','X'], room:'Room 10'}],
[7,3,'VIII', { className:'VIII', subjectCode:7,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'VII',  { className:'VII',  subjectCode:3,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'VI',   { className:'VI',   subjectCode:11,   teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'V',    { className:'V',    subjectCode:1,    teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'IV',   { className:'IV',   subjectCode:2,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'III',  { className:'III',  subjectCode:10,   teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'II',   { className:'II',   subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'I',    { className:'I',    subjectCode:7,    teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,3,'IX_ds',{ className:'IX',   subjectCode:8,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period IV
[7,4,'X',    { className:'X',    subjectCode:1,    teacherInitials:'MP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'IX',   { className:'IX',   subjectCode:2,    teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'VIII', { className:'VIII', subjectCode:5,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'VII',  { className:'VII',  subjectCode:11,   teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'VI',   { className:'VI',   subjectCode:3,    teacherInitials:'IM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'V',    { className:'V',    subjectCode:5,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'IV',   { className:'IV',   subjectCode:14,   teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'III',  { className:'III',  subjectCode:2,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'II',   { className:'II',   subjectCode:10,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'I',    { className:'I',    subjectCode:1,    teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,4,'V_vmk',{ className:'V',    subjectCode:5,    teacherInitials:'VMK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period V
[7,5,'X',    { className:'X',    subjectCode:3,    teacherInitials:'AN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'IX',   { className:'IX',   subjectCode:3,    teacherInitials:'ARLN', slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'VIII', { className:'VIII', subjectCode:14,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'VII',  { className:'VII',  subjectCode:15,   teacherInitials:'DM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'VI',   { className:'VI',   subjectCode:1,    teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'V',    { className:'V',    subjectCode:7,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'IV',   { className:'IV',   subjectCode:13,   teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'III',  { className:'III',  subjectCode:12,   teacherInitials:'BK',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'II',   { className:'II',   subjectCode:5,    teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'I',    { className:'I',    subjectCode:2,    teacherInitials:'IOH',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,5,'IX_dp',{ className:'IX',   subjectCode:3,    teacherInitials:'DP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
// Period VI
[7,6,'X',    { className:'X',    subjectCode:11,   teacherInitials:'QM',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'IX',   { className:'IX',   subjectCode:[4,7],teacherInitials:'DP',   slotType:'dual-subject', track:null, involvedClasses:null, room:null }],
[7,6,'VIII', { className:'VIII', subjectCode:11,   teacherInitials:'FS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'VII',  { className:'VII',  subjectCode:14,   teacherInitials:'MJ',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'VI',   { className:'VI',   subjectCode:12,   teacherInitials:'DS',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'V',    { className:'V',    subjectCode:3,    teacherInitials:null,   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'IV',   { className:'IV',   subjectCode:11,   teacherInitials:'ID',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'III',  { className:'III',  subjectCode:13,   teacherInitials:'DN',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'II',   { className:'II',   subjectCode:14,   teacherInitials:'AKK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'I',    { className:'I',    subjectCode:5,    teacherInitials:'DOL',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'VI_mbk',{ className:'VI',  subjectCode:12,   teacherInitials:'MBK',  slotType:'regular',      track:null, involvedClasses:null, room:null }],
[7,6,'V_ap', { className:'V',    subjectCode:3,    teacherInitials:'AP',   slotType:'regular',      track:null, involvedClasses:null, room:null }],
];

// ─────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────

async function seedTeachers() {
  console.log('Seeding teachers...');
  for (const t of TEACHERS) {
    await setDoc(doc(db, 'teachers', t.initials), t);
  }
  console.log(`✓ ${TEACHERS.length} teachers seeded`);
}

async function seedSubjects() {
  console.log('Seeding subjects...');
  for (const s of SUBJECTS) {
    await setDoc(doc(db, 'subjects', String(s.code)), s);
  }
  console.log(`✓ ${SUBJECTS.length} subjects seeded`);
}

async function seedSettings() {
  console.log('Seeding settings...');
  await setDoc(doc(db, 'settings', 'schoolDay'), {
    currentDay: 1,
    lastUpdated: serverTimestamp()
  });
  await setDoc(doc(db, 'settings', 'periodTimings'), {
    period1: null, period2: null, period3: null,
    period4: null, period5: null, period6: null
  });
  console.log('✓ Settings seeded');
}

async function seedRoutine() {
  console.log('Seeding routine (this may take a moment)...');
  const allSlots = [...ROUTINE_SLOTS, ...ROUTINE_SLOTS_PART2];
  let count = 0;
  for (const [day, period, slotId, data] of allSlots) {
    const ref = doc(db, 'routine', String(day), 'periods', String(period), 'slots', slotId);
    await setDoc(ref, data);
    count++;
  }
  console.log(`✓ ${count} routine slots seeded across 7 days`);
}

export async function runSeed() {
  console.log('═══════════════════════════════════════');
  console.log('SFS Routine App — Database Seed Script');
  console.log('═══════════════════════════════════════');
  try {
    await seedTeachers();
    await seedSubjects();
    await seedSettings();
    await seedRoutine();
    console.log('');
    console.log('✅ All data seeded successfully!');
    console.log('═══════════════════════════════════════');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    throw err;
  }
}

// Auto-run if called directly (browser context via button will call runSeed())
// For Node.js: node --input-type=module < seed.js  (after replacing CDN imports with npm pkg)
