import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDoc,
  getDocFromServer,
  getDocs, 
  onSnapshot,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  EmployeeAvailability, 
  AvailabilitySubmissionBackup, 
  ScheduleBackup, 
  Shift, 
  Department,
  Employee,
  Notice,
  SwapRequest,
  ChangeLog,
  AppSettings
} from '../types';
import { CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER } from '../utils/weekUtils';

// 1. Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. Initialize Firestore
// Use configured firestoreDatabaseId if available, fallback to default
let db: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Fallback to default firestore database:', err);
  db = getFirestore(app);
}

// 3. Initialize Auth
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, db, auth, googleProvider };

/**
 * Validate connection to Firestore on boot as per Firestore skill instructions
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Cloud Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore is initializing.');
      return false;
    }
    // Expected on initial boot if doc does not exist yet, connection is still active
    return true;
  }
}
testConnection();

// Helper to format date in Dutch readable format: "07/09/2026 15:30"
export function formatDutchDateTime(timestamp: number | Date = new Date()): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return d.toLocaleString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Recursively strips undefined values from an object or array so that Firebase
 * Firestore setDoc / updateDoc never throws "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== undefined) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// ---------------------------------------------------------------------------
// A. AVAILABILITY PERSISTENCE & IMMUTABLE BACKUP ARCHIVE
// ---------------------------------------------------------------------------

/**
 * Saves availability to the active collection AND writes an immutable entry
 * into the 'availability_backups' collection so no submission is ever lost.
 */
export async function saveAvailabilityToCloudAndBackup(
  availability: EmployeeAvailability,
  employeeName: string = 'Medewerker',
  department: Department = 'zaal',
  notes: string = '',
  source: 'google_forms' | 'staff_portal' | 'manual' | 'excel' = 'staff_portal'
): Promise<AvailabilitySubmissionBackup> {
  const now = Date.now();
  const formattedDate = formatDutchDateTime(now);
  const backupId = `avail_backup_${availability.weekNumber}_${availability.employeeId}_${now}`;

  const cleanDays = (availability.days || []).map(day => {
    const d: any = {
      day: day.day,
      status: day.status
    };
    if (day.startTime) d.startTime = day.startTime;
    if (day.endTime) d.endTime = day.endTime;
    if (day.notes) d.notes = day.notes;
    return d;
  });

  const backupRecord: AvailabilitySubmissionBackup = {
    id: backupId,
    employeeId: availability.employeeId,
    employeeName,
    department,
    weekNumber: availability.weekNumber,
    submittedAt: now,
    formattedDate,
    days: cleanDays,
    notes: notes ? notes.trim() : undefined,
    source
  };

  try {
    // 1. Save to active availabilities doc: key by week_employee
    const activeDocRef = doc(db, 'availabilities', `w${availability.weekNumber}_${availability.employeeId}`);
    const activePayload = sanitizeForFirestore({
      id: availability.id || `av_${now}`,
      employeeId: availability.employeeId,
      weekNumber: availability.weekNumber,
      days: cleanDays,
      employeeName,
      department,
      lastUpdated: now,
      formattedDate
    });
    await setDoc(activeDocRef, activePayload, { merge: true });

    // 2. Write an immutable historical backup record in 'availability_backups'
    const backupDocRef = doc(db, 'availability_backups', backupId);
    const backupPayload = sanitizeForFirestore(backupRecord);
    await setDoc(backupDocRef, backupPayload);

    console.log(`[Firebase] Availability and backup saved successfully for ${employeeName} (W${availability.weekNumber})`);
  } catch (error) {
    console.error('[Firebase] Error saving availability backup to Firestore:', error);
  }

  // Also maintain in localStorage as immediate fallback
  try {
    const existingBackupsJson = localStorage.getItem('cafe_availability_backups');
    const existingBackups: AvailabilitySubmissionBackup[] = existingBackupsJson ? JSON.parse(existingBackupsJson) : [];
    const updatedBackups = [backupRecord, ...existingBackups];
    localStorage.setItem('cafe_availability_backups', JSON.stringify(updatedBackups.slice(0, 200)));
  } catch (e) {
    // silent storage quota fallback
  }

  return backupRecord;
}

/**
 * Fetches all immutable historical availability backups from Firestore.
 */
export async function fetchAvailabilityBackupsFromCloud(): Promise<AvailabilitySubmissionBackup[]> {
  try {
    const colRef = collection(db, 'availability_backups');
    const q = query(colRef, orderBy('submittedAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    const backups: AvailabilitySubmissionBackup[] = [];
    snapshot.forEach(docSnap => {
      backups.push(docSnap.data() as AvailabilitySubmissionBackup);
    });

    if (backups.length > 0) {
      localStorage.setItem('cafe_availability_backups', JSON.stringify(backups));
      return backups;
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch availability backups from Firestore, using local fallback:', error);
  }

  // Fallback to local storage
  const saved = localStorage.getItem('cafe_availability_backups');
  return saved ? JSON.parse(saved) : [];
}

/**
 * Fetches active employee availabilities from Firestore.
 */
export async function fetchActiveAvailabilitiesFromCloud(): Promise<EmployeeAvailability[]> {
  try {
    const colRef = collection(db, 'availabilities');
    const snapshot = await getDocs(colRef);

    const list: EmployeeAvailability[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: data.id || docSnap.id,
        employeeId: data.employeeId,
        weekNumber: data.weekNumber,
        days: data.days || []
      });
    });

    return list;
  } catch (error) {
    console.warn('[Firebase] Fetching active availabilities failed, falling back to local:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// B. SCHEDULE PERSISTENCE & DEFINITIVE SCHEDULE BACKUP ARCHIVE
// ---------------------------------------------------------------------------

/**
 * Creates an immutable backup snapshot of a finalized/published schedule for a week.
 */
export async function createScheduleBackupInCloud(
  weekNumber: number,
  shifts: Shift[],
  createdBy: string = 'Hans Stevens',
  versionTitle?: string,
  notes?: string,
  autoGenerated: boolean = false
): Promise<ScheduleBackup> {
  const now = Date.now();
  const formattedDate = formatDutchDateTime(now);
  const backupId = `schedule_backup_w${weekNumber}_${now}`;

  // Filter shifts specifically for this week if shifts include other weeks or all shifts
  // Note: shifts might have weekNumber or be the current week's active shifts
  const targetShifts = shifts;
  const publishedCount = targetShifts.filter(s => s.status === 'published').length;
  const draftCount = targetShifts.filter(s => s.status === 'draft').length;

  const defaultTitle = versionTitle || `Definitieve Planning Week ${weekNumber} (${publishedCount} diensten)`;

  const backup: ScheduleBackup = {
    id: backupId,
    weekNumber,
    createdAt: now,
    formattedDate,
    createdBy,
    versionTitle: defaultTitle,
    shiftsCount: targetShifts.length,
    publishedCount,
    draftCount,
    shifts: targetShifts,
    notes,
    autoGenerated
  };

  try {
    const backupDocRef = doc(db, 'schedule_backups', backupId);
    const sanitizedBackup = sanitizeForFirestore(backup);
    await setDoc(backupDocRef, sanitizedBackup);
    console.log(`[Firebase] Schedule backup created: ${backupId} (${targetShifts.length} shifts)`);
  } catch (error) {
    console.error('[Firebase] Error creating schedule backup in Firestore:', error);
  }

  // Also save to localStorage archive
  try {
    const existing = localStorage.getItem('cafe_schedule_backups');
    const list: ScheduleBackup[] = existing ? JSON.parse(existing) : [];
    const updated = [backup, ...list];
    localStorage.setItem('cafe_schedule_backups', JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    // ignore quota
  }

  return backup;
}

/**
 * Fetches all schedule backup snapshots from Firestore.
 */
export async function fetchScheduleBackupsFromCloud(): Promise<ScheduleBackup[]> {
  try {
    const colRef = collection(db, 'schedule_backups');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const list: ScheduleBackup[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ScheduleBackup);
    });

    if (list.length > 0) {
      localStorage.setItem('cafe_schedule_backups', JSON.stringify(list));
      return list;
    }
  } catch (error) {
    console.warn('[Firebase] Could not load schedule backups from cloud, using local cache:', error);
  }

  const localSaved = localStorage.getItem('cafe_schedule_backups');
  return localSaved ? JSON.parse(localSaved) : [];
}

/**
 * Saves the active shifts list to Firestore.
 */
export async function saveShiftsToCloud(shifts: Shift[]): Promise<void> {
  try {
    const activeScheduleRef = doc(db, 'current_schedule', 'active_shifts');
    const sanitizedPayload = sanitizeForFirestore({
      shifts,
      updatedAt: Date.now(),
      updatedAtFormatted: formatDutchDateTime()
    });
    await setDoc(activeScheduleRef, sanitizedPayload);
    console.log(`[Firebase] Saved ${shifts.length} shifts to Firestore.`);
  } catch (error) {
    console.warn('[Firebase] Could not save active shifts to Firestore:', error);
  }
}

/**
 * Fetches active shifts from Firestore.
 */
export async function fetchShiftsFromCloud(): Promise<Shift[] | null> {
  try {
    const docRef = doc(db, 'current_schedule', 'active_shifts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.shifts)) {
        return data.shifts as Shift[];
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch active shifts from Firestore:', error);
  }
  return null;
}

/**
 * Subscribes to real-time updates for active shifts from Firestore.
 */
export function subscribeToCloudShifts(callback: (shifts: Shift[]) => void): () => void {
  try {
    const docRef = doc(db, 'current_schedule', 'active_shifts');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.shifts)) {
          callback(data.shifts as Shift[]);
        }
      }
    }, (error) => {
      console.warn('[Firebase] subscribeToCloudShifts listener error:', error);
    });
  } catch (error) {
    console.warn('[Firebase] Could not subscribe to cloud shifts:', error);
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// D. EMPLOYEES CLOUD PERSISTENCE
// ---------------------------------------------------------------------------

export async function saveEmployeesToCloud(employees: Employee[]): Promise<void> {
  try {
    const docRef = doc(db, 'team', 'employees_list');
    const sanitizedPayload = sanitizeForFirestore({
      employees,
      updatedAt: Date.now(),
      updatedAtFormatted: formatDutchDateTime()
    });
    await setDoc(docRef, sanitizedPayload);
    console.log(`[Firebase] Saved ${employees.length} employees to team/employees_list.`);

    // Also sync individual documents in background batches of 25
    try {
      for (let i = 0; i < employees.length; i += 25) {
        const chunk = employees.slice(i, i + 25);
        const batch = writeBatch(db);
        chunk.forEach(e => {
          const empDocRef = doc(db, 'employees', e.id);
          batch.set(empDocRef, sanitizeForFirestore(e), { merge: true });
        });
        await batch.commit();
      }
    } catch (batchErr) {
      console.warn('[Firebase] Warning syncing individual employee docs:', batchErr);
    }
  } catch (error) {
    console.warn('[Firebase] Could not save employees to Firestore:', error);
  }
}

export async function fetchEmployeesFromCloud(): Promise<Employee[] | null> {
  try {
    const docRef = doc(db, 'team', 'employees_list');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.employees) && data.employees.length > 0) {
        return data.employees as Employee[];
      }
    }

    // Fallback: fetch from employees collection
    const empCol = await getDocs(collection(db, 'employees'));
    if (!empCol.empty) {
      const list: Employee[] = [];
      empCol.forEach(d => list.push(d.data() as Employee));
      if (list.length > 0) {
        return list;
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch employees from Firestore:', error);
  }
  return null;
}

export function subscribeToCloudEmployees(callback: (employees: Employee[]) => void): () => void {
  try {
    const docRef = doc(db, 'team', 'employees_list');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.employees) && data.employees.length > 0) {
          callback(data.employees as Employee[]);
        }
      }
    }, (error) => {
      console.warn('[Firebase] subscribeToCloudEmployees listener error:', error);
    });
  } catch (error) {
    console.warn('[Firebase] Could not subscribe to cloud employees:', error);
    return () => {};
  }
}

/**
 * Saves or updates an employee's avatar directly to Firestore.
 * Updates both the individual employee record and the centralized employees_list.
 */
export async function saveEmployeeAvatarToCloud(employeeId: string, avatarUrl: string | null): Promise<boolean> {
  try {
    // 1. Update individual employee doc
    const empDocRef = doc(db, 'employees', employeeId);
    await setDoc(empDocRef, sanitizeForFirestore({
      id: employeeId,
      avatarUrl: avatarUrl || null,
      avatarUpdatedAt: Date.now(),
      avatarUpdatedAtFormatted: formatDutchDateTime()
    }), { merge: true });

    // 2. Also update in the team/employees_list document
    const listDocRef = doc(db, 'team', 'employees_list');
    const snap = await getDoc(listDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.employees)) {
        const updatedEmployees = data.employees.map((e: Employee) => {
          if (e.id === employeeId) {
            return { ...e, avatarUrl: avatarUrl || undefined };
          }
          return e;
        });
        await setDoc(listDocRef, sanitizeForFirestore({
          employees: updatedEmployees,
          updatedAt: Date.now(),
          updatedAtFormatted: formatDutchDateTime()
        }));
      }
    }
    console.log(`[Firebase] Successfully updated avatar in cloud for employee: ${employeeId}`);
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to save avatar to Firestore:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// E. NOTICES CLOUD PERSISTENCE
// ---------------------------------------------------------------------------

export async function saveNoticesToCloud(notices: Notice[]): Promise<void> {
  try {
    const docRef = doc(db, 'bulletin', 'notices_list');
    const sanitizedPayload = sanitizeForFirestore({
      notices,
      updatedAt: Date.now()
    });
    await setDoc(docRef, sanitizedPayload);
  } catch (error) {
    console.warn('[Firebase] Could not save notices to Firestore:', error);
  }
}

export async function fetchNoticesFromCloud(): Promise<Notice[] | null> {
  try {
    const docRef = doc(db, 'bulletin', 'notices_list');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.notices)) {
        return data.notices as Notice[];
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch notices from Firestore:', error);
  }
  return null;
}

export function subscribeToCloudNotices(callback: (notices: Notice[]) => void): () => void {
  try {
    const docRef = doc(db, 'bulletin', 'notices_list');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.notices)) {
          callback(data.notices as Notice[]);
        }
      }
    }, (error) => {
      console.warn('[Firebase] subscribeToCloudNotices error:', error);
    });
  } catch (error) {
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// F. SWAP REQUESTS CLOUD PERSISTENCE
// ---------------------------------------------------------------------------

export async function saveSwapRequestsToCloud(swapRequests: SwapRequest[]): Promise<void> {
  try {
    const docRef = doc(db, 'schedule_requests', 'swaps_list');
    const sanitizedPayload = sanitizeForFirestore({
      swapRequests,
      updatedAt: Date.now()
    });
    await setDoc(docRef, sanitizedPayload);
  } catch (error) {
    console.warn('[Firebase] Could not save swap requests to Firestore:', error);
  }
}

export async function fetchSwapRequestsFromCloud(): Promise<SwapRequest[] | null> {
  try {
    const docRef = doc(db, 'schedule_requests', 'swaps_list');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.swapRequests)) {
        return data.swapRequests as SwapRequest[];
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch swap requests from Firestore:', error);
  }
  return null;
}

export function subscribeToCloudSwapRequests(callback: (swaps: SwapRequest[]) => void): () => void {
  try {
    const docRef = doc(db, 'schedule_requests', 'swaps_list');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.swapRequests)) {
          callback(data.swapRequests as SwapRequest[]);
        }
      }
    }, (error) => {
      console.warn('[Firebase] subscribeToCloudSwapRequests error:', error);
    });
  } catch (error) {
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// G. AVAILABILITIES COLLECTION CLOUD PERSISTENCE
// ---------------------------------------------------------------------------

export async function saveAllAvailabilitiesToCloud(availabilities: EmployeeAvailability[]): Promise<void> {
  try {
    const docRef = doc(db, 'planning_data', 'all_availabilities');
    const sanitizedPayload = sanitizeForFirestore({
      availabilities,
      updatedAt: Date.now()
    });
    await setDoc(docRef, sanitizedPayload);
  } catch (error) {
    console.warn('[Firebase] Could not save all availabilities to Firestore:', error);
  }
}

export async function fetchAllAvailabilitiesFromCloud(): Promise<EmployeeAvailability[] | null> {
  const map = new Map<string, EmployeeAvailability>();

  // 1. Fetch individual docs from collection `availabilities` (primary resilient storage)
  try {
    const colRef = collection(db, 'availabilities');
    const snapshot = await getDocs(colRef);
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.employeeId && data.weekNumber) {
        const key = `${data.employeeId}_${data.weekNumber}`;
        map.set(key, {
          id: data.id || docSnap.id,
          employeeId: data.employeeId,
          weekNumber: data.weekNumber,
          days: data.days || [],
          employeeName: data.employeeName,
          department: data.department
        });
      }
    });
  } catch (error) {
    console.warn('[Firebase] Could not fetch from availabilities collection:', error);
  }

  // 2. Also check planning_data/all_availabilities document
  try {
    const docRef = doc(db, 'planning_data', 'all_availabilities');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.availabilities)) {
        for (const item of data.availabilities) {
          if (item.employeeId && item.weekNumber) {
            const key = `${item.employeeId}_${item.weekNumber}`;
            if (!map.has(key)) {
              map.set(key, item);
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch all availabilities doc from Firestore:', error);
  }

  if (map.size > 0) {
    return Array.from(map.values());
  }
  return null;
}

/**
 * Reconstructs all staff and availabilities from the immutable availability_backups
 * and active availabilities collections, restoring the entire team to active state.
 */
export async function restoreFullTeamAndAvailabilitiesFromCloudArchive(): Promise<{
  employeeCount: number;
  availabilityCount: number;
  employees: Employee[];
  availabilities: EmployeeAvailability[];
}> {
  console.log('[Firebase] Starting full cloud archive restore...');
  const availSnap = await getDocs(collection(db, 'availabilities'));
  const backupSnap = await getDocs(collection(db, 'availability_backups'));

  const empMap = new Map<string, { id: string; name: string; department: Department }>();
  const availMap = new Map<string, EmployeeAvailability>();

  // Helper to register employee
  const registerEmp = (id: string, name: string, dept?: string) => {
    if (!id || !name) return;
    const cleanDept: Department = dept === 'keuken' ? 'keuken' : 'zaal';
    if (!empMap.has(id)) {
      empMap.set(id, { id, name: name.trim(), department: cleanDept });
    }
  };

  availSnap.forEach(d => {
    const data = d.data();
    if (data.employeeId) {
      registerEmp(data.employeeId, data.employeeName || data.employeeId, data.department);
      const key = `${data.employeeId}_${data.weekNumber}`;
      availMap.set(key, {
        id: data.id || d.id,
        employeeId: data.employeeId,
        weekNumber: data.weekNumber,
        days: data.days || [],
        employeeName: data.employeeName,
        department: data.department
      });
    }
  });

  backupSnap.forEach(d => {
    const data = d.data();
    if (data.employeeId) {
      registerEmp(data.employeeId, data.employeeName || data.employeeId, data.department);
      const key = `${data.employeeId}_${data.weekNumber}`;
      if (!availMap.has(key)) {
        availMap.set(key, {
          id: `w${data.weekNumber}_${data.employeeId}`,
          employeeId: data.employeeId,
          weekNumber: data.weekNumber,
          days: data.days || [],
          employeeName: data.employeeName,
          department: data.department
        });
      }
    }
  });

  // Always ensure Hans Stevens is present as manager
  if (!empMap.has('emp1')) {
    empMap.set('emp1', { id: 'emp1', name: 'Hans Stevens', department: 'zaal' });
  }

  // Pre-load current cloud employees and INITIAL_EMPLOYEES to preserve all fields (birthDate, phone, facebookUrl, etc.)
  const existingCloudEmployees = (await fetchEmployeesFromCloud()) || [];
  const existingEmployeesMap = new Map<string, Employee>();
  existingCloudEmployees.forEach(e => existingEmployeesMap.set(e.id, e));

  // Construct full Employee objects, preserving any existing contact info and settings
  const restoredEmployees: Employee[] = [];
  const PALETTE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
  const PALETTE_BGS = [
    'bg-indigo-50 border-indigo-200 text-indigo-700',
    'bg-pink-50 border-pink-200 text-pink-700',
    'bg-amber-50 border-amber-200 text-amber-700',
    'bg-emerald-50 border-emerald-200 text-emerald-700',
    'bg-cyan-50 border-cyan-200 text-cyan-700',
    'bg-violet-50 border-violet-200 text-violet-700',
    'bg-rose-50 border-rose-200 text-rose-700',
    'bg-teal-50 border-teal-200 text-teal-700'
  ];

  let colorIdx = 0;
  empMap.forEach((info, id) => {
    const existing = existingEmployeesMap.get(id);
    const isManager = id === 'emp1' || info.name.toLowerCase().includes('hans stevens');
    const color = existing?.color || (isManager ? '#0d9488' : PALETTE_COLORS[colorIdx % PALETTE_COLORS.length]);
    const bg = existing?.textBgColor || (isManager ? 'bg-teal-50 border-teal-200 text-teal-700' : PALETTE_BGS[colorIdx % PALETTE_BGS.length]);
    const bgParts = bg.split(' ');
    colorIdx++;

    restoredEmployees.push({
      id,
      name: existing?.name || info.name,
      department: existing?.department || info.department,
      statuut: existing?.statuut || (isManager ? 'Vast' : (info.department === 'keuken' ? 'Flexi' : 'Student')),
      experience: existing?.experience || (isManager ? 'Verantwoordelijke' : 'Ervaren'),
      contractDaysPerWeek: existing?.contractDaysPerWeek ?? (isManager ? 5 : 2),
      role: existing?.role || (isManager ? 'beheerder' : 'personeel'),
      color,
      textBgColor: existing?.textBgColor || `${bgParts[0]} ${bgParts[1]}`,
      textColor: existing?.textColor || bgParts[2],
      email: existing?.email || (isManager ? 'hans.stevens@gemeenteschoolbierbeek.be' : undefined),
      phone: existing?.phone || (isManager ? '0474623264' : undefined),
      birthDate: existing?.birthDate,
      facebookUrl: existing?.facebookUrl,
      avatarUrl: existing?.avatarUrl,
      active: existing?.active ?? true,
      firstLoginComplete: existing?.firstLoginComplete ?? true,
      pin: existing?.pin || '1234'
    });
  });

  // Also include any employees in existingCloudEmployees that didn't have an availability record
  existingCloudEmployees.forEach(e => {
    if (!restoredEmployees.some(re => re.id === e.id)) {
      restoredEmployees.push(e);
    }
  });

  const restoredAvailabilities = Array.from(availMap.values());

  // Save to Firestore collections
  await saveEmployeesToCloud(restoredEmployees);
  await saveAllAvailabilitiesToCloud(restoredAvailabilities);

  // Sync to individual docs in batch
  const batch = writeBatch(db);
  for (const a of restoredAvailabilities) {
    const docRef = doc(db, 'availabilities', `w${a.weekNumber}_${a.employeeId}`);
    batch.set(docRef, sanitizeForFirestore({
      id: `w${a.weekNumber}_${a.employeeId}`,
      employeeId: a.employeeId,
      weekNumber: a.weekNumber,
      employeeName: a.employeeName,
      department: a.department || 'zaal',
      days: a.days || [],
      lastUpdated: Date.now(),
      formattedDate: formatDutchDateTime()
    }), { merge: true });
  }
  await batch.commit();

  console.log(`[Firebase] Successfully restored ${restoredEmployees.length} employees and ${restoredAvailabilities.length} availabilities.`);
  return {
    employeeCount: restoredEmployees.length,
    availabilityCount: restoredAvailabilities.length,
    employees: restoredEmployees,
    availabilities: restoredAvailabilities
  };
}

export function subscribeToCloudAllAvailabilities(callback: (availabilities: EmployeeAvailability[]) => void): () => void {
  try {
    const docRef = doc(db, 'planning_data', 'all_availabilities');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.availabilities)) {
          callback(data.availabilities as EmployeeAvailability[]);
        }
      }
    }, (error) => {
      console.warn('[Firebase] subscribeToCloudAllAvailabilities error:', error);
    });
  } catch (error) {
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// H. CHANGE LOGS PERSISTENCE
// ---------------------------------------------------------------------------

export async function saveLogsToCloud(logs: ChangeLog[]): Promise<void> {
  try {
    const docRef = doc(db, 'audit', 'activity_logs');
    const sanitizedPayload = sanitizeForFirestore({
      logs: logs.slice(0, 100),
      updatedAt: Date.now()
    });
    await setDoc(docRef, sanitizedPayload);
  } catch (error) {
    console.warn('[Firebase] Could not save logs to Firestore:', error);
  }
}

export async function fetchLogsFromCloud(): Promise<ChangeLog[] | null> {
  try {
    const docRef = doc(db, 'audit', 'activity_logs');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.logs)) {
        return data.logs as ChangeLog[];
      }
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch logs from Firestore:', error);
  }
  return null;
}

// ---------------------------------------------------------------------------
// APP SETTINGS (AVAILABILITY SUBMISSION TOGGLE, ETC.)
// ---------------------------------------------------------------------------

export async function saveAppSettingsToCloud(settings: Partial<AppSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const payload = sanitizeForFirestore({
      ...settings,
      updatedAt: Date.now()
    });
    await setDoc(docRef, payload, { merge: true });
    // Cache locally
    const current = getLocalAppSettings();
    localStorage.setItem('cafe_app_settings', JSON.stringify({ ...current, ...settings }));
  } catch (error) {
    console.warn('[Firebase] Could not save app settings to Firestore:', error);
    const current = getLocalAppSettings();
    localStorage.setItem('cafe_app_settings', JSON.stringify({ ...current, ...settings }));
  }
}

export function getLocalAppSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('cafe_app_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.lockedWeeks)) {
        parsed.lockedWeeks = [CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER];
      }
      return parsed;
    }
  } catch {}
  return {
    availabilitySubmissionEnabled: true,
    lockedWeeks: [CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER],
    availabilityLockMessage: 'Het doorgeven van beschikbaarheden voor deze week is afgesloten door de beheerder.'
  };
}

export async function fetchAppSettingsFromCloud(): Promise<AppSettings> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as AppSettings;
      localStorage.setItem('cafe_app_settings', JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn('[Firebase] Could not fetch app settings from Firestore:', error);
  }
  return getLocalAppSettings();
}

export function subscribeToAppSettings(callback: (settings: AppSettings) => void): () => void {
  try {
    const docRef = doc(db, 'settings', 'general');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        localStorage.setItem('cafe_app_settings', JSON.stringify(data));
        callback(data);
      }
    }, (err) => {
      console.warn('[Firebase] Error in settings listener:', err);
    });
  } catch (e) {
    console.warn('[Firebase] Failed to setup settings listener:', e);
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// C. EXPORT UTILITIES (DOWNLOAD DIRECT JSON / CSV OF BACKUPS)
// ---------------------------------------------------------------------------

export function exportBackupAsJSON(data: any, fileName: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
