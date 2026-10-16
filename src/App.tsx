import React, { useState, useEffect } from 'react';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SHIFTS, 
  INITIAL_NOTICES, 
  INITIAL_SWAP_REQUESTS, 
  INITIAL_LOGS,
  INITIAL_AVAILABILITIES
} from './data/mockData';
import { Employee, Shift, Notice, SwapRequest, SwapCandidate, ChangeLog, EmployeeAvailability, DayAvailability } from './types';
import ManagerDashboard from './components/ManagerDashboard';
import StaffPortal from './components/StaffPortal';
import InDeMolenLogo from './components/InDeMolenLogo';
import { 
  Coffee, 
  ClipboardList, 
  Sparkles, 
  History, 
  HelpCircle, 
  Eye, 
  RotateCcw,
  ArrowRight,
  TrendingUp,
  X,
  MessageSquare,
  Mail,
  Phone,
  AlertTriangle,
  Share2,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { 
  saveAvailabilityToCloudAndBackup, 
  createScheduleBackupInCloud,
  saveShiftsToCloud,
  fetchShiftsFromCloud,
  subscribeToCloudShifts,
  saveEmployeesToCloud,
  fetchEmployeesFromCloud,
  subscribeToCloudEmployees,
  saveNoticesToCloud,
  fetchNoticesFromCloud,
  subscribeToCloudNotices,
  saveSwapRequestsToCloud,
  fetchSwapRequestsFromCloud,
  subscribeToCloudSwapRequests,
  saveAllAvailabilitiesToCloud,
  fetchAllAvailabilitiesFromCloud,
  subscribeToCloudAllAvailabilities,
  saveLogsToCloud,
  fetchLogsFromCloud,
  formatDutchDateTime,
  saveAppSettingsToCloud,
  fetchAppSettingsFromCloud,
  subscribeToAppSettings,
  getLocalAppSettings,
  restoreFullTeamAndAvailabilitiesFromCloudArchive
} from './services/firebase';
import { AppSettings } from './types';
import { CURRENT_WEEK_NUMBER, getWeekMeta } from './utils/weekUtils';
import { 
  sortEmployeesByFirstName, 
  deduplicateEmployees, 
  deduplicateEmployeesWithRemap,
  mergeAndDeduplicateTeam, 
  remapShiftsEmployeeIds, 
  remapAvailabilitiesEmployeeIds 
} from './utils/employeeSortUtils';
import ShareTeamModal from './components/ShareTeamModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import AutoWhatsAppModal, { AutoWhatsAppModalData } from './components/AutoWhatsAppModal';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import { 
  generateScheduleUpdateWhatsAppText, 
  generateNoticeWhatsAppText,
  isAutoWhatsAppPromptEnabled 
} from './utils/whatsappNotificationUtils';
import { 
  checkUpcomingAvailabilityReminders, 
  createAvailabilityReminderNotice, 
  createGroupAvailabilityReminderNotice 
} from './utils/availabilityReminderUtils';
import { 
  findAvailableUnscheduledStaffForShift, 
  generateFreedShiftNotices 
} from './utils/freedShiftNotificationUtils';

const DAYS_OF_WEEK = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

const SHARED_APP_URL = typeof window !== 'undefined'
  ? (window.location.hostname.includes('ais-dev')
      ? 'https://ais-pre-m2somphks3peywsj3udb6b-287536891405.europe-west3.run.app'
      : window.location.origin)
  : 'https://ais-pre-m2somphks3peywsj3udb6b-287536891405.europe-west3.run.app';

export default function App() {
  // Load state from localStorage or fallback to defaults (with intelligent field merging and strict deduplication)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('cafe_employees');
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { cleanEmployees } = mergeAndDeduplicateTeam(INITIAL_EMPLOYEES, parsed);
          return sortEmployeesByFirstName(cleanEmployees);
        }
      } catch (e) {
        // ignore
      }
    }
    return sortEmployeesByFirstName(INITIAL_EMPLOYEES);
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('cafe_shifts');
    const migratedDraft = localStorage.getItem('cafe_planning_draft_migrated_v3');
    if (saved && migratedDraft) {
      try {
        const parsed: Shift[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    localStorage.setItem('cafe_planning_draft_migrated_v3', 'true');
    return INITIAL_SHIFTS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('cafe_notices');
    if (saved) {
      try {
        const parsed: Notice[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_NOTICES;
  });

  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(() => {
    const saved = localStorage.getItem('cafe_swap_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_SWAP_REQUESTS;
  });

  const [logs, setLogs] = useState<ChangeLog[]>(() => {
    const saved = localStorage.getItem('cafe_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_LOGS;
  });

  const [availabilities, setAvailabilities] = useState<EmployeeAvailability[]>(() => {
    const saved = localStorage.getItem('cafe_availabilities');
    if (saved) {
      try {
        const parsed: EmployeeAvailability[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_AVAILABILITIES;
  });

  // Current main tab active: 'beheerder' (Manager) or 'personeel' (Staff) - defaults to 'personeel'
  const [activeTab, setActiveTab] = useState<'beheerder' | 'personeel'>('personeel');
  const [showLogsPanel, setShowLogsPanel] = useState(false);

  // Custom confirmation modals states
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [showDemoResetConfirm, setShowDemoResetConfirm] = useState<boolean>(false);

  // Beheerder login states (mits login)
  const [managerLoggedIn, setManagerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('manager_logged_in') === 'true';
  });
  const [managerEmailInput, setManagerEmailInput] = useState<string>('');
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const input = managerEmailInput.trim().toLowerCase();
    const password = managerPasswordInput.trim();

    if (!password) {
      setLoginError('Voer a.u.b. je pincode of wachtwoord in.');
      return;
    }

    // Find if any registered manager matches the email or name
    const matchedManager = employees.find(emp => 
      emp.role === 'beheerder' && 
      (emp.email.toLowerCase() === input || 
       emp.name.toLowerCase() === input ||
       (input.length >= 3 && emp.name.toLowerCase().includes(input)) ||
       ((input === 'hans.stevens2@gmail.com' || input === 'hans.stevens@gemeenteschoolbierbeek.be') && emp.id === 'emp1'))
    );

    const isMasterPassword = password === '1234';
    const isPersonalPinValid = matchedManager && matchedManager.pin && matchedManager.pin === password;

    if (!isMasterPassword && !isPersonalPinValid) {
      setLoginError('Ongeldige pincode/wachtwoord. Gebruik je persoonlijke pincode of de beheerders-PIN "1234".');
      return;
    }

    if (matchedManager) {
      if ((input === 'hans.stevens@gemeenteschoolbierbeek.be' || input === 'hans.stevens2@gmail.com') && matchedManager.email !== input) {
        const updatedHans = { ...matchedManager, name: 'Hans Stevens', email: input };
        setEmployees(prev => prev.map(emp => emp.id === 'emp1' ? updatedHans : emp));
      }
      setManagerLoggedIn(true);
      localStorage.setItem('manager_logged_in', 'true');
      setLoginError(null);
      
      // Log successful login
      const newLog: ChangeLog = {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        user: `${matchedManager.name} (Beheerder)`,
        action: 'Beheerder Ingelogd',
        details: `${matchedManager.name} is ingelogd op het beheerpaneel`
      };
      setLogs(prev => [newLog, ...prev]);
    } else if (isMasterPassword && (input === '' || input.includes('admin') || input.includes('hans') || input.includes('beheer') || input.includes('molen') || input.includes('stevens'))) {
      // Master fallback for administrator
      setManagerLoggedIn(true);
      localStorage.setItem('manager_logged_in', 'true');
      setLoginError(null);
      
      const newLog: ChangeLog = {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        user: 'Hoofdbeheerder',
        action: 'Beheerder Ingelogd',
        details: 'Hoofdbeheerder ingelogd via master pincode'
      };
      setLogs(prev => [newLog, ...prev]);
    } else {
      const activeManagers = employees.filter(e => e.role === 'beheerder').map(e => `${e.name}${e.email ? ` (${e.email})` : ''}`).join(', ');
      setLoginError(`E-mail of naam niet herkend als beheerder. Actieve beheerders: ${activeManagers || 'Hans Stevens'}.`);
    }
  };

  // Cloud Sharing & Firestore Synchronization States
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  // Automatic WhatsApp Share Notification Modal State
  const [autoWhatsAppModalData, setAutoWhatsAppModalData] = useState<AutoWhatsAppModalData | null>(null);

  // Cloud Archive Full Restore States
  const [isRestoringArchive, setIsRestoringArchive] = useState<boolean>(false);
  const [restoreNoticeMessage, setRestoreNoticeMessage] = useState<string | null>(null);

  const handleRestoreFullCloudArchive = async () => {
    setIsRestoringArchive(true);
    setRestoreNoticeMessage('⏳ Bezig met herstellen van personeel en beschikbaarheden uit Google Cloud...');
    try {
      const res = await restoreFullTeamAndAvailabilitiesFromCloudArchive();
      const { cleanEmployees, idRemap } = deduplicateEmployeesWithRemap(res.employees);
      const sorted = sortEmployeesByFirstName(cleanEmployees);
      const cleanAvails = remapAvailabilitiesEmployeeIds(res.availabilities, idRemap);
      setEmployees(sorted);
      setAvailabilities(cleanAvails);
      setRestoreNoticeMessage(`✅ Succesvol hersteld: alle ${sorted.length} personeelsleden en ${cleanAvails.length} beschikbaarheden staan weer live!`);
      addLog('Cloud Archief Hersteld', `${res.employeeCount} medewerkers en ${res.availabilityCount} ingevulde beschikbaarheden hersteld uit het archief`);
      setTimeout(() => setRestoreNoticeMessage(null), 8000);
    } catch (err) {
      console.error('Error during full archive restore:', err);
      setRestoreNoticeMessage('⚠️ Fout bij het herstellen van het archief. Probeer het opnieuw.');
      setTimeout(() => setRestoreNoticeMessage(null), 6000);
    } finally {
      setIsRestoringArchive(false);
    }
  };

  // Global App Settings (e.g. Availability Submissions enabled/locked by manager)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => getLocalAppSettings());

  // Subscribe to live App Settings from Firestore
  useEffect(() => {
    fetchAppSettingsFromCloud().then(settings => {
      if (settings) setAppSettings(settings);
    });
    const unsubscribe = subscribeToAppSettings((newSettings) => {
      setAppSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateAppSettings = (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    saveAppSettingsToCloud(updated);
    if (newSettings.availabilitySubmissionEnabled !== undefined) {
      addLog(
        'Instellingen Gewijzigd',
        `Beschikbaarheden doorgeven is nu ${newSettings.availabilitySubmissionEnabled ? 'OPENGESCHAKELD 🟢' : 'VERGRENDELD / GESLOTEN 🔒'} voor medewerkers`
      );
    }
    if (newSettings.lockedWeeks !== undefined) {
      addLog(
        'Week-Vergrendeling Gewijzigd',
        `Vergrendelde weken voor beschikbaarheden bijgewerkt: ${newSettings.lockedWeeks.length > 0 ? newSettings.lockedWeeks.map(w => `Week ${w}`).join(', ') : 'Alle weken geopend 🟢'}`
      );
    }
  };

  // 🛡️ Automatische Personeelsontdubbeling & Zelfherstel:
  // Detecteert en verwijdert eventuele dubbele personeelsrecords (op ID of naam) en koppelt shiften/beschikbaarheden direct opnieuw aan.
  useEffect(() => {
    const { cleanEmployees, idRemap } = deduplicateEmployeesWithRemap(employees);
    if (idRemap.size > 0 || cleanEmployees.length !== employees.length) {
      console.log(`[Auto-Heal Team] ${employees.length - cleanEmployees.length} dubbele personeelslid/leden succesvol samengevoegd.`);
      const sorted = sortEmployeesByFirstName(cleanEmployees);
      setEmployees(sorted);
      saveEmployeesToCloud(sorted);
      localStorage.setItem('cafe_employees', JSON.stringify(sorted));

      setShifts(prevShifts => {
        const updated = remapShiftsEmployeeIds(prevShifts, idRemap);
        saveShiftsToCloud(updated);
        return updated;
      });

      setAvailabilities(prevAvails => {
        const updated = remapAvailabilitiesEmployeeIds(prevAvails, idRemap);
        saveAllAvailabilitiesToCloud(updated);
        return updated;
      });

      addLog('Personeelslijst Opgeschoond', `${idRemap.size} dubbele medewerker(s) automatisch hersteld en samengevoegd`);
    }
  }, []);

  // ⏰ Automatische Herinneringsfunctie voor medewerkers die beschikbaarheid nog niet hebben ingevuld:
  // Wordt automatisch uitgevoerd op de dag dat de planning wordt opgesteld (woensdag, 2 weken vooraf).
  useEffect(() => {
    // Controleren of automatische herinneringen ingeschakeld zijn (standaard true)
    if (appSettings.autoAvailabilityRemindersEnabled === false) return;
    if (employees.length <= 1 || availabilities.length === 0) return;

    const checkResult = checkUpcomingAvailabilityReminders(employees, availabilities, appSettings);
    const { isReminderDay, alreadyRunToday, missingEmployees, targetWeekNumber } = checkResult;

    // Alleen uitvoeren als het vandaag de opsteldag is (woensdag) en nog niet eerder vandaag is gedraaid
    if (isReminderDay && !alreadyRunToday && missingEmployees.length > 0) {
      console.log(`[AutoReminder] Woensdag planningsdag gedetecteerd voor Week ${targetWeekNumber}. Versturen van herinneringen naar ${missingEmployees.length} medewerkers...`);

      const todayStr = new Date().toISOString().split('T')[0];
      const now = Date.now();

      // 1. Groepsoproep op het prikbord
      const groupNotice: Notice = {
        ...createGroupAvailabilityReminderNotice(missingEmployees.length, targetWeekNumber, 'Hans Stevens'),
        id: `notice_auto_avail_group_${targetWeekNumber}_${now}`,
        date: todayStr
      };

      // 2. Persoonlijke notificaties voor elke medewerker
      const individualNotices: Notice[] = missingEmployees.map((emp, idx) => ({
        ...createAvailabilityReminderNotice(emp, targetWeekNumber, 'Hans Stevens'),
        id: `notice_auto_avail_${emp.id}_${targetWeekNumber}_${now + idx + 1}`,
        date: todayStr
      }));

      const newNotices = [groupNotice, ...individualNotices, ...notices];
      setNotices(newNotices);
      saveNoticesToCloud(newNotices);

      // 3. Update settings timestamp zodat het maar 1x per woensdag draait
      const updatedSettings: AppSettings = {
        ...appSettings,
        lastAutoReminderRunDate: todayStr,
        lastAutoReminderSentCount: missingEmployees.length,
        lastAutoReminderTimestamp: now
      };
      setAppSettings(updatedSettings);
      saveAppSettingsToCloud(updatedSettings);

      addLog(
        'Automatische Beschikbaarheids-Herinnering Verzonden',
        `Woensdag-planningsdag: herinneringsnotificaties automatisch klaargezet voor ${missingEmployees.length} medewerkers voor Week ${targetWeekNumber}`
      );
    }
  }, [appSettings.autoAvailabilityRemindersEnabled, appSettings.lastAutoReminderRunDate, employees.length, availabilities.length]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cafe_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('cafe_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('cafe_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('cafe_swap_requests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem('cafe_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('cafe_availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  // Two-way Google Cloud Firestore Persistence & Real-time Live Listeners
  useEffect(() => {
    let isMounted = true;
    setCloudSyncStatus('syncing');

    async function loadCloudDataOnBoot() {
      try {
        const [
          cloudEmployees,
          cloudShifts,
          cloudAvailabilities,
          cloudNotices,
          cloudSwaps,
          cloudLogs
        ] = await Promise.all([
          fetchEmployeesFromCloud(),
          fetchShiftsFromCloud(),
          fetchAllAvailabilitiesFromCloud(),
          fetchNoticesFromCloud(),
          fetchSwapRequestsFromCloud(),
          fetchLogsFromCloud()
        ]);

        if (!isMounted) return;

        let hasDataInCloud = false;

        let currentShifts = cloudShifts || shifts;
        let currentAvails = cloudAvailabilities || availabilities;

        if (cloudEmployees && cloudEmployees.length > 1) {
          const { cleanEmployees, idRemap } = mergeAndDeduplicateTeam(INITIAL_EMPLOYEES, cloudEmployees);

          if (idRemap.size > 0) {
            console.log(`[Firestore Boot] Succesvol ${idRemap.size} dubbele personeelsrecords opgeschoond en samengevoegd.`);
            if (currentShifts && currentShifts.length > 0) {
              currentShifts = remapShiftsEmployeeIds(currentShifts, idRemap);
              saveShiftsToCloud(currentShifts);
            }
            if (currentAvails && currentAvails.length > 0) {
              currentAvails = remapAvailabilitiesEmployeeIds(currentAvails, idRemap);
              saveAllAvailabilitiesToCloud(currentAvails);
            }
          }

          const sorted = sortEmployeesByFirstName(cleanEmployees);
          setEmployees(sorted);
          saveEmployeesToCloud(sorted);
          localStorage.setItem('cafe_employees', JSON.stringify(sorted));
          hasDataInCloud = true;
        } else if (INITIAL_EMPLOYEES.length > 1) {
          // If cloud has <= 1 employee, restore our complete team with full data immediately
          const restoredTeam = sortEmployeesByFirstName(deduplicateEmployees(INITIAL_EMPLOYEES));
          setEmployees(restoredTeam);
          saveEmployeesToCloud(restoredTeam);
          hasDataInCloud = true;
        }

        if (currentShifts && currentShifts.length > 0) {
          setShifts(currentShifts);
          hasDataInCloud = true;
        }

        if (currentAvails && currentAvails.length > 0) {
          setAvailabilities(currentAvails);
          hasDataInCloud = true;
        } else if (INITIAL_AVAILABILITIES.length > 0) {
          setAvailabilities(INITIAL_AVAILABILITIES);
          saveAllAvailabilitiesToCloud(INITIAL_AVAILABILITIES);
          hasDataInCloud = true;
        }

        if (cloudNotices && cloudNotices.length > 0) {
          setNotices(cloudNotices);
        }
        if (cloudSwaps && cloudSwaps.length > 0) {
          setSwapRequests(cloudSwaps);
        }
        if (cloudLogs && cloudLogs.length > 0) {
          setLogs(cloudLogs);
        }

        // If Cloud Firestore is empty on boot, seed initial state so team members see data immediately
        if (!hasDataInCloud) {
          console.log('[Firestore] Seeding initial data to Cloud...');
          await Promise.all([
            saveEmployeesToCloud(employees),
            saveShiftsToCloud(shifts),
            saveAllAvailabilitiesToCloud(availabilities),
            saveNoticesToCloud(notices),
            saveSwapRequestsToCloud(swapRequests),
            saveLogsToCloud(logs)
          ]);
        }

        setCloudSyncStatus('synced');
        setLastCloudSyncTime(formatDutchDateTime());
      } catch (err) {
        console.warn('[Firestore] Initial cloud sync notice:', err);
        setCloudSyncStatus('synced');
      }
    }

    loadCloudDataOnBoot();

    // Subscribe to live cloud changes across all connected devices (phones, tablets, PC)
    const unsubShifts = subscribeToCloudShifts((updatedShifts) => {
      if (isMounted && updatedShifts && updatedShifts.length > 0) {
        setShifts(updatedShifts);
        setLastCloudSyncTime(formatDutchDateTime());
      }
    });

    const unsubEmployees = subscribeToCloudEmployees((updatedEmployees) => {
      if (isMounted && updatedEmployees && updatedEmployees.length > 1) {
        setEmployees(sortEmployeesByFirstName(deduplicateEmployees(updatedEmployees)));
        setLastCloudSyncTime(formatDutchDateTime());
      }
    });

    const unsubAvailabilities = subscribeToCloudAllAvailabilities((updatedAvails) => {
      if (isMounted && updatedAvails && updatedAvails.length > 0) {
        setAvailabilities(updatedAvails);
        setLastCloudSyncTime(formatDutchDateTime());
      }
    });

    const unsubNotices = subscribeToCloudNotices((updatedNotices) => {
      if (isMounted && updatedNotices) {
        setNotices(updatedNotices);
      }
    });

    const unsubSwaps = subscribeToCloudSwapRequests((updatedSwaps) => {
      if (isMounted && updatedSwaps) {
        setSwapRequests(updatedSwaps);
      }
    });

    return () => {
      isMounted = false;
      unsubShifts();
      unsubEmployees();
      unsubAvailabilities();
      unsubNotices();
      unsubSwaps();
    };
  }, []);

  const handleForceCloudSync = async () => {
    setCloudSyncStatus('syncing');
    try {
      await Promise.all([
        saveEmployeesToCloud(employees),
        saveShiftsToCloud(shifts),
        saveAllAvailabilitiesToCloud(availabilities),
        saveNoticesToCloud(notices),
        saveSwapRequestsToCloud(swapRequests),
        saveLogsToCloud(logs)
      ]);
      const now = formatDutchDateTime();
      setLastCloudSyncTime(now);
      setCloudSyncStatus('synced');
      addLog('Cloud Synchronisatie Voltooid', `Alle ${employees.length} medewerkers en ${shifts.length} diensten opgeslagen in Google Cloud Firestore`);
    } catch (err) {
      console.error('Manual force sync error:', err);
      setCloudSyncStatus('error');
    }
  };

  // Helper log addition
  const addLog = (action: string, details: string) => {
    const newLog: ChangeLog = {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      user: activeTab === 'beheerder' ? 'Hans Stevens (Manager)' : 'Personeel',
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Action: Add general Shift
  const handleAddShift = (shiftData: Omit<Shift, 'id' | 'updatedAt'>) => {
    const id = `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newShift: Shift = {
      ...shiftData,
      weekNumber: shiftData.weekNumber || CURRENT_WEEK_NUMBER,
      id,
      updatedAt: Date.now()
    };
    const nextShifts = [...shifts, newShift];
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);
    
    const empName = employees.find(e => e.id === shiftData.employeeId)?.name || 'Onbekend';
    addLog(
      shToLogTitle(shiftData.status),
      `${empName} ingepland op ${DAYS_OF_WEEK[shiftData.day]} (${shiftData.startTime} - ${shiftData.endTime}) [Week ${newShift.weekNumber}]`
    );
  };

  const shToLogTitle = (status: 'draft' | 'published' | 'archived') => {
    if (status === 'draft') return 'Ontwerp-dienst gemaakt';
    if (status === 'archived') return 'Gearchiveerde dienst';
    return 'Dienst direct gepubliceerd';
  };

  // Action: Update Shift details
  const handleUpdateShift = (updatedShift: Shift) => {
    const prevShift = shifts.find(s => s.id === updatedShift.id);
    const dayChanged = prevShift && prevShift.day !== updatedShift.day;
    const timeChanged = prevShift && (prevShift.startTime !== updatedShift.startTime || prevShift.endTime !== updatedShift.endTime);
    const deptChanged = prevShift && prevShift.department !== updatedShift.department;
    const notesChanged = prevShift && prevShift.notes !== updatedShift.notes;
    const empChanged = prevShift && prevShift.employeeId !== updatedShift.employeeId;

    // Als de beheerder een shift wijzigt (tijd, dag, afdeling of toewijzing), resetten we de bevestiging
    // zodat de medewerker direct een gele indicatie ("niet bevestigd") ziet en de nieuwe uren opnieuw moet bevestigen!
    let finalShift: Shift = { ...updatedShift };
    if (dayChanged || timeChanged || deptChanged || notesChanged || empChanged) {
      finalShift.acknowledged = false;
      finalShift.acknowledgedAt = undefined;
      finalShift.acknowledgedBy = undefined;
    }

    const nextShifts = shifts.map(s => s.id === finalShift.id ? finalShift : s);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);
    const empName = employees.find(e => e.id === finalShift.employeeId)?.name || 'Onbekend';
    addLog(
      'Dienst bijgewerkt',
      `Planning aangepast voor ${empName} op ${DAYS_OF_WEEK[finalShift.day]} (${finalShift.startTime} - ${finalShift.endTime}) [Week ${finalShift.weekNumber || CURRENT_WEEK_NUMBER}]`
    );

    // Stuur personeel een direct bericht/notificatie als hun shift gewijzigd werd
    // BELANGRIJK: Alleen als de shift reeds GEPUBLICEERD was (concept/draft shiften waren immers nooit definitief voor personeel)
    if (finalShift.status === 'published' && (dayChanged || timeChanged || deptChanged || notesChanged || empChanged)) {
      const weekNum = finalShift.weekNumber || CURRENT_WEEK_NUMBER;
      const deptLabel = finalShift.department === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
      
      const changeNotice: Notice = {
        id: `notice_shift_change_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `🔄 Shift Gewijzigd door Beheerder: ${DAYS_OF_WEEK[finalShift.day]} (Week ${weekNum})`,
        content: `Beste ${empName}, je dienst in Week ${weekNum} is gewijzigd door beheerder Hans Stevens naar ${DAYS_OF_WEEK[finalShift.day]} van ${finalShift.startTime} tot ${finalShift.endTime} (${deptLabel}). Gelieve dit te controleren in je personeelsrooster en opnieuw te bevestigen als 'Gezien'.`,
        date: new Date().toISOString().split('T')[0],
        category: 'wijziging',
        author: 'Hans Stevens (Beheerder)',
        targetEmployeeId: finalShift.employeeId,
        shiftId: finalShift.id,
        readBy: [],
        dismissedBy: []
      };

      let newNoticesList = [changeNotice, ...notices];

      // Indien shift herverdeeld werd naar iemand anders: breng ook de vorige medewerker op de hoogte indien zijn eerdere dienst gepubliceerd was
      if (empChanged && prevShift?.status === 'published' && prevShift?.employeeId && prevShift.employeeId !== 'open_shift') {
        const prevEmpName = employees.find(e => e.id === prevShift.employeeId)?.name || 'Collega';
        const reassignedNotice: Notice = {
          id: `notice_shift_reassigned_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title: `ℹ️ Shift Overgedragen: ${DAYS_OF_WEEK[prevShift.day]} (Week ${weekNum})`,
          content: `Beste ${prevEmpName}, je eerdere dienst op ${DAYS_OF_WEEK[prevShift.day]} (${prevShift.startTime} - ${prevShift.endTime}) in Week ${weekNum} is door de beheerder overgedragen aan ${empName}. Je bent hiervoor niet meer ingeroosterd.`,
          date: new Date().toISOString().split('T')[0],
          category: 'wijziging',
          author: 'Hans Stevens (Beheerder)',
          targetEmployeeId: prevShift.employeeId,
          readBy: [],
          dismissedBy: []
        };
        newNoticesList = [reassignedNotice, ...newNoticesList];
      }

      setNotices(newNoticesList);
      saveNoticesToCloud(newNoticesList);
    }

    // Als de shift zojuist is opengesteld (isOpenShift of 'open_shift'), stuur direct een bericht naar beschikbare personeelsleden die nog niet zijn ingepland
    const isNowOpen = finalShift.isOpenShift || finalShift.employeeId === 'open_shift';
    const wasAlreadyOpen = prevShift?.isOpenShift || prevShift?.employeeId === 'open_shift';
    if (finalShift.status === 'published' && isNowOpen && !wasAlreadyOpen) {
      const availableStaff = findAvailableUnscheduledStaffForShift(finalShift, employees, nextShifts, availabilities);
      if (availableStaff.length > 0) {
        const freedNotices = generateFreedShiftNotices(finalShift, availableStaff);
        setNotices(prev => {
          const combined = [...freedNotices, ...prev];
          saveNoticesToCloud(combined);
          return combined;
        });
      }
    }
  };

  // Action: Delete Shift
  const handleDeleteShift = (id: string) => {
    const target = shifts.find(s => s.id === id);
    if (!target) return;
    const nextShifts = shifts.filter(s => s.id !== id);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);
    
    // Also clear associated swap requests
    const nextSwaps = swapRequests.filter(r => r.shiftId !== id);
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    const empName = employees.find(e => e.id === target.employeeId)?.name || 'Onbekend';
    addLog('Dienst verwijderd', `Dienst van ${empName} op ${DAYS_OF_WEEK[target.day]} gecancelled [Week ${target.weekNumber || CURRENT_WEEK_NUMBER}]`);

    // Stuur personeel een direct bericht/notificatie als hun shift geannuleerd werd
    // BELANGRIJK: Alleen als de shift officieel GEPUBLICEERD was! Concept/ontwerp shiften waren immers nooit zichtbaar voor personeel
    if (target.status === 'published' && target.employeeId && target.employeeId !== 'open_shift') {
      const weekNum = target.weekNumber || CURRENT_WEEK_NUMBER;
      const deptLabel = target.department === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
      const cancelNotice: Notice = {
        id: `notice_shift_cancel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `❌ Shift Geannuleerd: ${DAYS_OF_WEEK[target.day]} (Week ${weekNum})`,
        content: `Beste ${empName}, je ingeplande dienst op ${DAYS_OF_WEEK[target.day]} (${target.startTime} - ${target.endTime}, ${deptLabel}) voor Week ${weekNum} is geannuleerd/verwijderd uit het rooster door de beheerder.`,
        date: new Date().toISOString().split('T')[0],
        category: 'wijziging',
        author: 'Hans Stevens (Beheerder)',
        targetEmployeeId: target.employeeId,
        readBy: [],
        dismissedBy: []
      };
      const nextNotices = [cancelNotice, ...notices];
      setNotices(nextNotices);
      saveNoticesToCloud(nextNotices);
    }
  };

  // Action: Publish schedule for a specific week (or all) & alert team
  const handlePublishAllDrafts = (targetWeek?: number) => {
    const targetW = targetWeek !== undefined ? targetWeek : CURRENT_WEEK_NUMBER;
    const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === targetW);
    
    if (weekShifts.length === 0 && targetWeek !== undefined) {
      return;
    }

    const publishedShifts = shifts.map(s => {
      if (targetWeek === undefined || (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek) {
        return { ...s, status: 'published' as const };
      }
      return s;
    });
    setShifts(publishedShifts);
    saveShiftsToCloud(publishedShifts);
    
    const weekLabel = targetWeek ? `Week ${targetWeek}` : 'Alle Weken';
    const publishedCount = targetWeek !== undefined ? weekShifts.length : shifts.length;

    // Add nice system log
    addLog('Rooster Gepubliceerd', `Planning voor ${weekLabel} (${publishedCount} diensten) officieel geactiveerd en zichtbaar gemaakt voor het personeel`);

    // Insert automatic notice to the group notice board
    const wMeta = targetWeek ? getWeekMeta(targetWeek) : null;
    const dateRangeStr = wMeta?.dateRange ? ` (${wMeta.dateRange})` : '';
    const newNotice: Notice = {
      id: `notice_${Date.now()}`,
      title: `📢 Planning ${weekLabel} is gepubliceerd!`,
      content: `De officiële planning voor ${weekLabel}${dateRangeStr} staat nu live in het personeelsportaal! Bekijk direct jouw ingeplande diensten en bevestig deze als "Gezien".`,
      date: new Date().toISOString().split('T')[0],
      category: 'planning',
      author: 'Hans Stevens (Beheerder)'
    };
    const nextNotices = [newNotice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);

    // Auto WhatsApp prompt for schedule publication
    if (isAutoWhatsAppPromptEnabled()) {
      setAutoWhatsAppModalData({
        isOpen: true,
        type: 'schedule_publish',
        title: `Planning ${weekLabel} Gepubliceerd!`,
        subtitle: `Het rooster staat direct live in het personeelsportaal en op het mededelingenbord. Deel dit direct in de WhatsApp teamgroep:`,
        defaultMessage: generateScheduleUpdateWhatsAppText({
          weekNumber: targetWeek || CURRENT_WEEK_NUMBER,
          shiftsCount: publishedCount,
          notes: `De definitieve planning voor ${weekLabel} staat online in het personeelsportaal. Gelieve je diensten te bekijken en te bevestigen!`
        })
      });
    }

    // Automatic Cloud Backup Snapshot of the finalized schedule
    const weekForBackup = targetWeek || CURRENT_WEEK_NUMBER;
    const finalizedWeekShifts = publishedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === weekForBackup);
    createScheduleBackupInCloud(
      weekForBackup,
      finalizedWeekShifts,
      'Hans Stevens (Beheerder)',
      `Definitieve Planning Week ${weekForBackup} (${finalizedWeekShifts.length} diensten)`,
      `Automatische cloud snapshot bij publiceren van ${publishedCount} diensten`,
      true
    ).then(() => {
      addLog('Cloud Backup Aangemaakt', `Definitieve planning voor Week ${weekForBackup} veilig gearchiveerd in Google Cloud Firestore`);
    }).catch(err => {
      console.warn('Cloud schedule backup error:', err);
    });
  };

  // Action: Unpublish / Hide schedule for a specific week (set back to draft / invisible for staff)
  const handleUnpublishWeek = (targetWeek: number) => {
    const targetShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek);
    if (targetShifts.length === 0) return;

    const unpublishedShifts = shifts.map(s => {
      if ((s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek) {
        return { ...s, status: 'draft' as const, acknowledged: false };
      }
      return s;
    });

    setShifts(unpublishedShifts);
    saveShiftsToCloud(unpublishedShifts);

    addLog('Rooster Ingetrokken', `Planning voor Week ${targetWeek} (${targetShifts.length} diensten) teruggezet naar concept / tijdelijk onzichtbaar gemaakt voor medewerkers`);
  };

  // Action: Register new Employee member
  const handleAddEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEmp: Employee = {
      ...empData,
      id
    };
    const nextEmployees = sortEmployeesByFirstName(deduplicateEmployees([...employees, newEmp]));
    setEmployees(nextEmployees);
    saveEmployeesToCloud(nextEmployees);
    addLog('Medewerker Geregistreerd', `${empData.name} toegevoegd aan de database`);
    return newEmp;
  };

  // Action: Edit Employee details
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const nextEmployees = sortEmployeesByFirstName(deduplicateEmployees(employees.map(e => e.id === updatedEmp.id ? updatedEmp : e)));
    setEmployees(nextEmployees);
    saveEmployeesToCloud(nextEmployees);
    addLog('Medewerkerinfo aangepast', `${updatedEmp.name} dossier bijgewerkt`);
  };

  // Action: Delete Employee
  const handleDeleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    if (target) {
      setEmployeeToDelete(target);
    }
  };

  const confirmDeleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    const nextEmployees = employees.filter(e => e.id !== id);
    setEmployees(nextEmployees);
    saveEmployeesToCloud(nextEmployees);
    
    // Safely delete associated shifts
    const nextShifts = shifts.filter(s => s.employeeId !== id);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    // Clear associated swap requests
    const nextSwaps = swapRequests.filter(r => r.requesterId !== id && r.targetEmployeeId !== id);
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    addLog('Medewerker Verwijderd', `${target.name} is verwijderd uit het systeem`);
    setEmployeeToDelete(null);
  };

  // Action: Bulk Synchronize Employees from Excel/CSV (add, update, delete)
  const handleBulkSyncEmployees = (newEmployeeList: Employee[], removedIds: string[]) => {
    // Hans Stevens (emp1) must never be accidentally removed
    const safeRemovedIds = removedIds.filter(id => id !== 'emp1');
    const safeList = deduplicateEmployees(newEmployeeList);
    const sortedList = sortEmployeesByFirstName(safeList);
    setEmployees(sortedList);
    saveEmployeesToCloud(sortedList);

    if (safeRemovedIds.length > 0) {
      const nextShifts = shifts.filter(s => !safeRemovedIds.includes(s.employeeId));
      setShifts(nextShifts);
      saveShiftsToCloud(nextShifts);

      const nextSwaps = swapRequests.filter(r => !safeRemovedIds.includes(r.requesterId) && !safeRemovedIds.includes(r.targetEmployeeId || ''));
      setSwapRequests(nextSwaps);
      saveSwapRequestsToCloud(nextSwaps);
    }
    addLog(
      'Personeel Gesynchroniseerd (Excel/CSV)',
      `Personeelsbestand bijgewerkt: ${safeList.length} medewerkers in totaal (${safeRemovedIds.length} verwijderd)`
    );
  };

  // Action: Post group notice
  const handleAddNotice = (noticeData: Omit<Notice, 'id' | 'date'>) => {
    const id = `notice_${Date.now()}`;
    const newNotice: Notice = {
      ...noticeData,
      id,
      date: new Date().toISOString().split('T')[0]
    };
    const nextNotices = [newNotice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
    addLog('Mededeling geplaatst', `Groepsbericht geplaatst: "${noticeData.title}"`);

    // Auto WhatsApp prompt for notice publication
    if (isAutoWhatsAppPromptEnabled()) {
      setAutoWhatsAppModalData({
        isOpen: true,
        type: 'notice_posted',
        title: `Bericht geplaatst: "${newNotice.title}"`,
        subtitle: `Het bericht staat direct live in het personeelsportaal en op het mededelingenbord. Deel dit direct via WhatsApp:`,
        defaultMessage: generateNoticeWhatsAppText(newNotice)
      });
    }
  };

  // Action: Manual trigger to share any schedule week via WhatsApp
  const handleShareWhatsAppSchedule = (targetWeek: number) => {
    const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek && s.status === 'published');
    setAutoWhatsAppModalData({
      isOpen: true,
      type: 'schedule_update',
      title: `Deel Rooster Week ${targetWeek}`,
      subtitle: `Stuur de actuele weekplanning van Week ${targetWeek} direct via WhatsApp naar de teamgroep:`,
      defaultMessage: generateScheduleUpdateWhatsAppText({
        weekNumber: targetWeek,
        shiftsCount: weekShifts.length,
        shifts: weekShifts,
        employees: employees
      })
    });
  };

  // Action: Manual trigger to share a notice via WhatsApp
  const handleShareWhatsAppNotice = (notice: Notice) => {
    setAutoWhatsAppModalData({
      isOpen: true,
      type: 'notice_posted',
      title: `Deel Bericht: "${notice.title}"`,
      subtitle: `Stuur dit mededelingenbord-bericht direct via WhatsApp naar het team:`,
      defaultMessage: generateNoticeWhatsAppText(notice)
    });
  };

  // Action: Delete group notice (Manager)
  const handleDeleteNotice = (noticeId: string) => {
    const target = notices.find(n => n.id === noticeId);
    const nextNotices = notices.filter(n => n.id !== noticeId);
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
    if (target) {
      addLog('Mededeling Verwijderd', `Bericht "${target.title}" verwijderd door de beheerder`);
    }
  };

  // Action: Add comment to a notice (Staff or Manager)
  const handleAddNoticeComment = (
    noticeId: string,
    authorId: string,
    authorName: string,
    authorRole: 'beheerder' | 'medewerker',
    content: string
  ) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId,
      authorName,
      authorRole,
      content: trimmed,
      createdAt: Date.now()
    };
    const nextNotices = notices.map(n => {
      if (n.id !== noticeId) return n;
      return {
        ...n,
        comments: [...(n.comments || []), newComment]
      };
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
    addLog('Reactie op Mededeling', `${authorName} heeft gereageerd op een mededeling`);
  };

  // Action: Toggle emoji reaction on notice
  const handleToggleNoticeReaction = (noticeId: string, emoji: string, employeeId: string) => {
    const nextNotices = notices.map(n => {
      if (n.id !== noticeId) return n;
      const reactions = { ...(n.reactions || {}) };
      const currentList = reactions[emoji] || [];
      const hasReacted = currentList.includes(employeeId);
      if (hasReacted) {
        const filtered = currentList.filter(id => id !== employeeId);
        if (filtered.length === 0) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = filtered;
        }
      } else {
        reactions[emoji] = [...currentList, employeeId];
      }
      return { ...n, reactions };
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Delete comment on notice
  const handleDeleteNoticeComment = (noticeId: string, commentId: string) => {
    const nextNotices = notices.map(n => {
      if (n.id !== noticeId) return n;
      return {
        ...n,
        comments: (n.comments || []).filter(c => c.id !== commentId)
      };
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Mark notice as read / viewed by employee (disappears once viewed)
  const handleMarkNoticeRead = (noticeId: string, employeeId: string) => {
    const nextNotices = notices.map(n => {
      if (n.id !== noticeId) return n;
      const readBy = Array.from(new Set([...(n.readBy || []), employeeId]));
      return { ...n, readBy };
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Dismiss notice (so it permanently disappears for this employee once viewed)
  const handleDismissNotice = (noticeId: string, employeeId: string) => {
    const nextNotices = notices.map(n => {
      if (n.id !== noticeId) return n;
      const readBy = Array.from(new Set([...(n.readBy || []), employeeId]));
      const dismissedBy = Array.from(new Set([...(n.dismissedBy || []), employeeId]));
      return { ...n, readBy, dismissedBy };
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Mark all notices as read for an employee
  const handleMarkAllNoticesRead = (employeeId: string) => {
    const nextNotices = notices.map(n => {
      if (!n.targetEmployeeId || n.targetEmployeeId === employeeId) {
        const readBy = Array.from(new Set([...(n.readBy || []), employeeId]));
        const dismissedBy = Array.from(new Set([...(n.dismissedBy || []), employeeId]));
        return { ...n, readBy, dismissedBy };
      }
      return n;
    });
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Employee or Manager marks shift as acknowledged/unacknowledged
  const handleAcknowledgeShift = (shiftId: string, confirmed: boolean = true, by?: string) => {
    const nextShifts = shifts.map(s => {
      if (s.id !== shiftId) return s;
      return {
        ...s,
        acknowledged: confirmed,
        acknowledgedBy: confirmed ? (by || 'Hans Stevens (Beheerder)') : undefined,
        acknowledgedAt: confirmed ? Date.now() : undefined,
        updatedAt: Date.now()
      };
    });
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    const targetShift = shifts.find(s => s.id === shiftId);
    if (targetShift) {
      const emp = employees.find(e => e.id === targetShift.employeeId);
      addLog(
        confirmed ? 'Dienst Bevestigd' : 'Bevestiging Herroepen',
        `${emp ? emp.name : 'Medewerker'} dienst op ${DAYS_OF_WEEK[targetShift.day]} is ${confirmed ? 'bevestigd (akkoord)' : 'teruggezet naar onbevestigd'}${by ? ` door ${by}` : ''}`
      );
    }
  };

  // Action: Manager bulk-acknowledges all published shifts of a week
  const handleBulkAcknowledgeWeek = (targetWeek: number, confirmed: boolean = true) => {
    const nextShifts = shifts.map(s => {
      if ((s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek && s.status === 'published') {
        return {
          ...s,
          acknowledged: confirmed,
          acknowledgedBy: confirmed ? 'Hans Stevens (Beheerder)' : undefined,
          acknowledgedAt: confirmed ? Date.now() : undefined,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);
    addLog(
      'Weekrooster Bevestigd',
      `Alle gepubliceerde diensten van Week ${targetWeek} zijn ${confirmed ? 'in 1x bevestigd door beheerder' : 'teruggezet naar onbevestigd'}`
    );
  };

  const handleUpdateAvailability = (employeeId: string, weekNumber: number, days: DayAvailability[]) => {
    const newEntry: EmployeeAvailability = {
      id: `av_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      employeeId,
      weekNumber,
      days
    };

    const existingIdx = availabilities.findIndex(a => a.employeeId === employeeId && a.weekNumber === weekNumber);
    let nextAvails: EmployeeAvailability[];
    if (existingIdx > -1) {
      nextAvails = [...availabilities];
      nextAvails[existingIdx] = {
        ...nextAvails[existingIdx],
        days
      };
    } else {
      nextAvails = [...availabilities, newEntry];
    }
    setAvailabilities(nextAvails);
    saveAllAvailabilitiesToCloud(nextAvails);

    const emp = employees.find(e => e.id === employeeId);
    addLog(
      'Beschikbaarheid Doorgegeven',
      `${emp?.name || 'Medewerker'} heeft beschikbaarheden voor Week ${weekNumber} ingevuld of bijgewerkt`
    );

    // Save & Backup to Firebase Cloud Firestore
    if (emp) {
      saveAvailabilityToCloudAndBackup(
        newEntry,
        emp.name,
        emp.department || 'zaal',
        'Ingezonden via personeelsportaal',
        'staff_portal'
      ).then(() => {
        addLog(
          'Cloud Backup Beschikbaarheid',
          `Beschikbaarheid van ${emp.name} (Week ${weekNumber}) automatisch opgeslagen in Google Cloud Backup`
        );
      }).catch(err => {
        console.warn('Cloud backup availability error:', err);
      });
    }
  };

  const handleBulkUpdateAvailability = (
    updatedAvailabilities: { employeeId: string; weekNumber: number; days: DayAvailability[]; notes?: string }[]
  ) => {
    if (!updatedAvailabilities || updatedAvailabilities.length === 0) return;

    const nextList = [...availabilities];
    for (const item of updatedAvailabilities) {
      const idx = nextList.findIndex(a => a.employeeId === item.employeeId && a.weekNumber === item.weekNumber);
      const entry: EmployeeAvailability = {
        id: idx > -1 ? nextList[idx].id : `av_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: item.employeeId,
        weekNumber: item.weekNumber,
        days: item.days
      };
      if (idx > -1) {
        nextList[idx] = entry;
      } else {
        nextList.push(entry);
      }
    }
    setAvailabilities(nextList);
    saveAllAvailabilitiesToCloud(nextList);

    const targetWeek = updatedAvailabilities[0]?.weekNumber || CURRENT_WEEK_NUMBER;
    addLog(
      'Excel Beschikbaarheid Geüpload',
      `${updatedAvailabilities.length} personeelsleden bijgewerkt via Excel bulk import voor Week ${targetWeek}`
    );

    // Save each to Firebase Cloud Firestore with source 'excel'
    updatedAvailabilities.forEach(item => {
      const emp = employees.find(e => e.id === item.employeeId);
      if (emp) {
        const entry: EmployeeAvailability = {
          id: `av_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: item.employeeId,
          weekNumber: item.weekNumber,
          days: item.days
        };
        saveAvailabilityToCloudAndBackup(
          entry,
          emp.name,
          emp.department || 'zaal',
          item.notes || 'In bulk geüpload via Excel spreadsheet',
          'excel'
        ).catch(err => {
          console.warn('Cloud backup excel availability error:', err);
        });
      }
    });
  };

  // Action: Restore Schedule from Cloud Backup
  const handleRestoreSchedule = (restoredShifts: Shift[], weekNumber: number) => {
    setShifts(restoredShifts);
    saveShiftsToCloud(restoredShifts);
    addLog(
      'Planning Hersteld uit Backup',
      `Definitieve planning voor Week ${weekNumber} (${restoredShifts.length} diensten) hersteld via Cloud Archief`
    );
  };

  const handleBatchUpdateShifts = (newShifts: Shift[], logDetails?: string) => {
    setShifts(newShifts);
    saveShiftsToCloud(newShifts);
    if (logDetails) {
      addLog('Planning Bijgewerkt (Cloud)', logDetails);
    }
  };

  // Action: Employee submits shift swap
  const handleAddSwapRequest = (swapData: Omit<SwapRequest, 'id' | 'status' | 'date'>) => {
    const id = `swap_${Date.now()}`;
    const req: SwapRequest = {
      ...swapData,
      id,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    const nextSwaps = [req, ...swapRequests];
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);
    
    const requester = employees.find(e => e.id === swapData.requesterId)?.name || 'Onbekend';
    const shift = shifts.find(s => s.id === swapData.shiftId);
    addLog(
      'Ruilverzoek Ingediend',
      `${requester} vraagt om zijn dienst op ${shift ? DAYS_OF_WEEK[shift.day] : '?' } te ruilen`
    );

    // Stuur direct een bericht/notificatie naar beschikbare personen met niet-ingeplande beschikbaarheden
    if (shift) {
      const availableStaff = findAvailableUnscheduledStaffForShift(shift, employees, shifts, availabilities);
      if (availableStaff.length > 0) {
        const freedNotices = generateFreedShiftNotices(shift, availableStaff);
        const nextNotices = [...freedNotices, ...notices];
        setNotices(nextNotices);
        saveNoticesToCloud(nextNotices);
      }
    }
  };

  // Action: Manager approves a shift trade request or assigns an open shift to a candidate
  const handleApproveSwap = (requestId: string, assignedCandidateId?: string) => {
    const req = swapRequests.find(r => r.id === requestId);
    if (!req) return;

    // Set request status to approved
    const nextSwaps = swapRequests.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    // Update shift owner in current state
    const targetShift = shifts.find(s => s.id === req.shiftId);
    if (targetShift) {
      const oldOwner = employees.find(e => e.id === targetShift.employeeId);
      
      // Select final recipient (either explicitly assigned candidate or target)
      let finalReceiverId = assignedCandidateId || req.targetEmployeeId;
      if (!finalReceiverId) {
        if (req.candidates && req.candidates.length > 0) {
          finalReceiverId = req.candidates[0].employeeId;
        } else {
          // Automatic assignment to another active colleague
          const candidates = employees.filter(e => e.id !== req.requesterId && e.role === oldOwner?.role && e.active);
          finalReceiverId = candidates.length > 0 ? candidates[0].id : employees[employees.length - 1].id;
        }
      }

      const newOwner = employees.find(e => e.id === finalReceiverId);

      // Mutate shift assignment and remove open shift flag
      const nextShifts = shifts.map(s => s.id === targetShift.id ? { 
        ...s, 
        employeeId: finalReceiverId!,
        isOpenShift: false,
        acknowledged: false // new colleague needs to view and re-confirm!
      } : s);
      setShifts(nextShifts);
      saveShiftsToCloud(nextShifts);

      const actionTitle = req.isOpenShift ? 'Openstaande Dienst Toegewezen' : 'Ruilverzoek Goedgekeurd';
      const logDetail = req.isOpenShift
        ? `Openstaande dienst op ${DAYS_OF_WEEK[targetShift.day]} (${targetShift.startTime} - ${targetShift.endTime}) toegewezen aan ${newOwner?.name}`
        : `Dienst op ${DAYS_OF_WEEK[targetShift.day]} verplaatst van ${oldOwner?.name} naar ${newOwner?.name}`;

      addLog(actionTitle, logDetail);

      // Automated Notice Board post to keep everybody informed!
      const updateNotice: Notice = {
        id: `notice_swap_${Date.now()}`,
        title: req.isOpenShift ? `🎉 Openstaande dienst ingevuld!` : `🔄 Roosterupdate: Goedgekeurde dienstruil!`,
        content: req.isOpenShift
          ? `De openstaande dienst op ${DAYS_OF_WEEK[targetShift.day]} (${targetShift.startTime} - ${targetShift.endTime}) is succesvol toegewezen aan ${newOwner?.name}. Bedankt voor het inspringen!`
          : `De beheerder heeft ingestemd met de ruil. De dienst op ${DAYS_OF_WEEK[targetShift.day]} van ${targetShift.startTime} tot ${targetShift.endTime} is overgedragen van ${oldOwner?.name} naar ${newOwner?.name}.`,
        date: new Date().toISOString().split('T')[0],
        category: 'wijziging',
        author: 'Systeem'
      };
      const nextNotices = [updateNotice, ...notices];
      setNotices(nextNotices);
      saveNoticesToCloud(nextNotices);
    }
  };

  // Action: Manager opens a shift for team candidates to sign up
  const handleOpenShiftForSwap = (shiftId: string, customReason?: string) => {
    const targetShift = shifts.find(s => s.id === shiftId);
    if (!targetShift) return;

    // 1. Mark shift as open in shifts list
    const nextShifts = shifts.map(s => s.id === shiftId ? { ...s, isOpenShift: true } : s);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    // 2. Create or reuse SwapRequest for this open shift
    const existingReq = swapRequests.find(r => r.shiftId === shiftId && r.status === 'pending');
    if (!existingReq) {
      const newSwap: SwapRequest = {
        id: `swap_open_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        shiftId: targetShift.id,
        requesterId: 'beheerder',
        reason: customReason || 'Openstaande dienst: wie kan er inspringen? Schrijf je direct in!',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        isOpenShift: true,
        candidates: []
      };
      const nextSwaps = [newSwap, ...swapRequests];
      setSwapRequests(nextSwaps);
      saveSwapRequestsToCloud(nextSwaps);
    }

    // 3. Post notice on board
    const dayName = DAYS_OF_WEEK[targetShift.day];
    const deptName = targetShift.department === 'keuken' ? 'Keuken' : 'Zaal';
    const notice: Notice = {
      id: `notice_open_${Date.now()}`,
      title: `📢 Openstaande dienst beschikbaar: ${dayName} (${targetShift.startTime} - ${targetShift.endTime})`,
      content: `Er is een openstaande ${deptName}-dienst aangemeld op ${dayName} (${targetShift.startTime} - ${targetShift.endTime}). Geïnteresseerde medewerkers kunnen zich nu intekenen via het Ruilbord in hun portaal!`,
      date: new Date().toISOString().split('T')[0],
      category: 'planning',
      author: 'Beheerder'
    };

    // 4. Stuur direct een persoonlijk bericht naar medewerkers met niet-ingeplande beschikbaarheden
    const availableStaff = findAvailableUnscheduledStaffForShift(targetShift, employees, nextShifts, availabilities);
    const personalNotices = generateFreedShiftNotices(targetShift, availableStaff);

    const nextNotices = [...personalNotices, notice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);

    addLog('Dienst Opengesteld', `Dienst op ${dayName} (${targetShift.startTime} - ${targetShift.endTime}) opengesteld voor intekening (${availableStaff.length} beschikbare medewerkers genotificeerd)`);
  };

  // Action: Manager creates an open shift directly on the schedule and publishes to swap board
  const handleCreateOpenShift = (shiftData: Omit<Shift, 'id' | 'updatedAt'>, customReason?: string) => {
    const id = `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newShift: Shift = {
      ...shiftData,
      weekNumber: shiftData.weekNumber || CURRENT_WEEK_NUMBER,
      id,
      isOpenShift: true,
      updatedAt: Date.now()
    };
    const nextShifts = [...shifts, newShift];
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    const newSwap: SwapRequest = {
      id: `swap_open_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      shiftId: id,
      requesterId: 'beheerder',
      reason: customReason || 'Openstaande dienst: wie kan er inspringen? Schrijf je direct in!',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      isOpenShift: true,
      candidates: []
    };
    const nextSwaps = [newSwap, ...swapRequests];
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    const dayName = DAYS_OF_WEEK[newShift.day];
    const deptName = newShift.department === 'keuken' ? 'Keuken' : 'Zaal';
    const notice: Notice = {
      id: `notice_open_${Date.now()}`,
      title: `📢 Openstaande dienst beschikbaar: ${dayName} (${newShift.startTime} - ${newShift.endTime})`,
      content: `Er is een openstaande ${deptName}-dienst aangemaakt voor ${dayName} (${newShift.startTime} - ${newShift.endTime}) [Week ${newShift.weekNumber}]. Geïnteresseerde medewerkers kunnen zich nu direct intekenen via het Ruilbord in hun portaal!`,
      date: new Date().toISOString().split('T')[0],
      category: 'planning',
      author: 'Beheerder'
    };

    // Stuur direct een persoonlijk bericht naar medewerkers met niet-ingeplande beschikbaarheden
    const availableStaff = findAvailableUnscheduledStaffForShift(newShift, employees, nextShifts, availabilities);
    const personalNotices = generateFreedShiftNotices(newShift, availableStaff);

    const nextNotices = [...personalNotices, notice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);

    addLog('Openstaande dienst aangemaakt', `Openstaande dienst op ${dayName} (${newShift.startTime} - ${newShift.endTime}) opengesteld voor intekening [Week ${newShift.weekNumber}] (${availableStaff.length} beschikbare medewerkers genotificeerd)`);
  };

  // Action: Employee signs up as candidate for an open shift
  const handleSignUpForOpenShift = (swapId: string, employeeId: string, employeeName: string, note?: string) => {
    const candidate: SwapCandidate = {
      employeeId,
      employeeName,
      signedUpAt: Date.now(),
      note
    };
    const nextSwaps = swapRequests.map(r => {
      if (r.id !== swapId) return r;
      const existing = r.candidates || [];
      if (existing.some(c => c.employeeId === employeeId)) return r;
      return {
        ...r,
        candidates: [...existing, candidate]
      };
    });
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);
    addLog('Intekening op Open Dienst', `${employeeName} heeft zich ingetekend als kandidaat voor een openstaande shift`);
  };

  // Action: Employee cancels their signup for an open shift
  const handleCancelSignUpOpenShift = (swapId: string, employeeId: string) => {
    const nextSwaps = swapRequests.map(r => {
      if (r.id !== swapId) return r;
      return {
        ...r,
        candidates: (r.candidates || []).filter(c => c.employeeId !== employeeId)
      };
    });
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);
  };

  // Action: Employee directly claims / fills themselves into an open shift ("zichzelf invullen")
  const handleSelfAssignOpenShift = (shiftId: string, employeeId: string) => {
    const targetShift = shifts.find(s => s.id === shiftId);
    const emp = employees.find(e => e.id === employeeId);
    if (!targetShift || !emp) return;

    // Mutate shift assignment: claim open shift
    const nextShifts = shifts.map(s => s.id === shiftId ? {
      ...s,
      employeeId,
      isOpenShift: false,
      status: 'published' as const,
      acknowledged: true, // Auto-acknowledged since employee claimed it themselves
      updatedAt: Date.now()
    } : s);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    // Resolve any matching pending SwapRequest
    const nextSwaps = swapRequests.map(r => {
      if (r.shiftId === shiftId && r.status === 'pending') {
        return { 
          ...r, 
          status: 'approved' as const, 
          targetEmployeeId: employeeId 
        };
      }
      return r;
    });
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    const dayName = DAYS_OF_WEEK[targetShift.day];
    const deptName = targetShift.department === 'keuken' ? 'Keuken' : 'Zaal';

    addLog(
      'Zelf Ingevuld op Open Dienst',
      `${emp.name} heeft zichzelf ingeroosterd op ${dayName} (${targetShift.startTime} - ${targetShift.endTime}) [${deptName}]`
    );

    // Automatic Notice Board announcement to celebrate and keep everyone in sync
    const claimNotice: Notice = {
      id: `notice_claimed_${Date.now()}`,
      title: `🎉 Open dienst ingevuld door ${emp.name}!`,
      content: `${emp.name} heeft zich zojuist ingeschreven op de openstaande ${deptName}-dienst voor ${dayName} (${targetShift.startTime} - ${targetShift.endTime}). Bedankt voor het inspringen!`,
      date: new Date().toISOString().split('T')[0],
      category: 'planning',
      author: 'Systeem'
    };
    const nextNotices = [claimNotice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);
  };

  // Action: Manager declines trade request
  const handleDeclineSwap = (requestId: string) => {
    const nextSwaps = swapRequests.map(r => r.id === requestId ? { ...r, status: 'geweigerd' as const } : r);
    setSwapRequests(nextSwaps);
    saveSwapRequestsToCloud(nextSwaps);

    const req = swapRequests.find(r => r.id === requestId);
    if (req) {
      const requester = employees.find(e => e.id === req.requesterId);
      addLog(
        'Ruilverzoek Geweigerd',
        `Ruilverzoek van ${requester?.name || 'Onbekend'} is afgewezen door de beheerder`
      );
    }
  };

  const confirmResetDemoData = () => {
    const defaultEmps = sortEmployeesByFirstName(INITIAL_EMPLOYEES);
    setEmployees(defaultEmps);
    setShifts(INITIAL_SHIFTS);
    setNotices(INITIAL_NOTICES);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    setLogs(INITIAL_LOGS);
    setAvailabilities(INITIAL_AVAILABILITIES);

    saveEmployeesToCloud(defaultEmps);
    saveShiftsToCloud(INITIAL_SHIFTS);
    saveNoticesToCloud(INITIAL_NOTICES);
    saveSwapRequestsToCloud(INITIAL_SWAP_REQUESTS);
    saveLogsToCloud(INITIAL_LOGS);
    saveAllAvailabilitiesToCloud(INITIAL_AVAILABILITIES);

    addLog('Herstel Demo-data', 'Alle roosters en instellingen teruggezet naar fabriekswaarden');
    setShowDemoResetConfirm(false);
  };

  // Helper: Reset demo values
  const handleResetDemoData = () => {
    setShowDemoResetConfirm(true);
  };

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 flex flex-col antialiased font-sans">
      
      {/* Dynamic Header with cozy cafe vibe - Vibrant Palette Theme */}
      <header className="bg-white border-b-4 border-orange-200 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 bg-white p-1.5 rounded-2xl border-2 border-orange-200 shadow-sm flex items-center justify-center">
              <InDeMolenLogo className="w-28 h-14" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">In De Molen</h1>
              <p className="text-orange-600 font-bold text-xs tracking-wide uppercase">Eet-staminée Personeelsplanning</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            
            {/* View Switching tabs - styled with Vibrant orange palette */}
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex">
              <button
                onClick={() => setActiveTab('beheerder')}
                id="btn-beheer-tab"
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-tight active:scale-95 flex items-center space-x-1 ${
                  activeTab === 'beheerder' 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                    : 'text-slate-600 hover:text-slate-850 hover:bg-orange-50/50'
                }`}
              >
                <span>Beheerder</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'beheerder' ? 'bg-orange-600 text-orange-100' : 'bg-slate-200 text-slate-500'}`}>Boss</span>
              </button>
              <button
                onClick={() => setActiveTab('personeel')}
                id="btn-personeel-tab"
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-tight active:scale-95 flex items-center space-x-1 ${
                  activeTab === 'personeel' 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                    : 'text-slate-600 hover:text-slate-850 hover:bg-orange-50/50'
                }`}
              >
                <span>Personeel Portal</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'personeel' ? 'bg-orange-600 text-orange-100' : 'bg-slate-200 text-slate-500'}`}>Staff</span>
              </button>
            </div>

            {/* Share with Team Button */}
            <button
              onClick={() => setShowShareModal(true)}
              id="btn-header-share-team"
              className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase transition-all tracking-tight active:scale-95 flex items-center space-x-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              title="Deel de personeelsplanning via WhatsApp of directe URL met het team"
            >
              <Share2 size={15} />
              <span>Delen met Team 📲</span>
            </button>

            {/* PWA Smartphone Install Button */}
            <PWAInstallButton variant="header" sharedUrl={SHARED_APP_URL} />

            {/* Cloud Real-time Status Badge */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-[11px] font-black uppercase text-emerald-800 transition flex items-center space-x-1.5 cursor-pointer"
              title="Google Cloud Firestore Real-time verbinding actief • Klik voor details en directe link"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Cloud Live</span>
              <Cloud size={13} className="text-emerald-700" />
            </button>

            {/* Cloud Archive Restore Button */}
            <button
              type="button"
              onClick={handleRestoreFullCloudArchive}
              disabled={isRestoringArchive}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase transition-all shadow-sm active:scale-95 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Herstel alle 46 personeelsleden en alle ingezonden beschikbaarheden rechtstreeks uit de Google Cloud backup"
            >
              <RotateCcw size={13} className={isRestoringArchive ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isRestoringArchive ? 'Herstellen...' : 'Archief Herstellen 🔄'}</span>
            </button>

            <button
              onClick={() => setShowLogsPanel(!showLogsPanel)}
              className="p-2.5 bg-white hover:bg-orange-50 border border-orange-200 rounded-xl text-slate-600 hover:text-orange-600 transition relative shadow-sm"
              title="Activiteiten Log"
            >
              <History size={16} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white" />
            </button>

            <button
              onClick={handleResetDemoData}
              className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-250 rounded-xl text-slate-400 hover:text-rose-600 transition shadow-sm"
              title="Herstel Demo Gegevens"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 font-sans">
        
        {/* Restore Notification Toast / Banner */}
        {restoreNoticeMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-sm flex items-center justify-between text-emerald-900 text-xs font-black uppercase tracking-tight animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{restoreNoticeMessage}</span>
            </div>
            <button 
              onClick={() => setRestoreNoticeMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Live System Logging Panel Drawer if toggled */}
        {showLogsPanel && (
          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-orange-100 border-b-4 border-b-orange-200 mb-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-orange-50">
              <div className="flex items-center space-x-2">
                <History size={18} className="text-orange-500" />
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">Systeemactiviteiten & Audit Logboek (Live)</h4>
              </div>
              <button 
                onClick={() => setShowLogsPanel(false)}
                className="text-orange-400 hover:text-orange-600 font-bold text-xs uppercase"
              >
                Sluiten
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2.5">
              {logs.map((log) => (
                <div key={log.id} className="text-xs flex justify-between items-start hover:bg-slate-50 p-1 rounded transition">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-700">
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded mr-1.5">{log.action}</span>
                      {log.details}
                    </p>
                    <p className="text-[9px] text-slate-400">{log.user}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render active workspace panel */}
        {activeTab === 'beheerder' ? (
          !managerLoggedIn ? (
            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-orange-200 space-y-6 max-w-xl mx-auto text-left relative overflow-hidden my-6">
              <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4 shrink-0 text-orange-500 pointer-events-none">
                <Sparkles size={180} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-850 border border-orange-200 tracking-wider">
                  🔒 Beveiligd Beheerder-Portaal
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Manager Inloggen ☕</h2>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Log in met je beheerderaccount om de personeelsplanning, mededelingen, en ruilverzoeken te beheren en medewerkers te kunnen verwijderen.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-50 text-rose-850 text-xs font-black rounded-xl p-4 border-2 border-rose-200 uppercase tracking-tight">
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleManagerLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-tight flex items-center gap-1.5">
                    <Mail size={13} className="text-orange-500 stroke-[2.5]" />
                    <span>Beheerder E-mail of Naam</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={managerEmailInput}
                    onChange={(e) => {
                      setManagerEmailInput(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Bijv: hans.stevens2@gmail.com of naam beheerder"
                    className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 rounded-xl px-4 py-3 text-xs font-bold tracking-normal focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-tight flex items-center gap-1.5">
                    <Phone size={13} className="text-orange-400 stroke-[2.5]" />
                    <span>Wachtwoord PIN</span>
                  </label>
                  <input
                    required
                    type="password"
                    value={managerPasswordInput}
                    onChange={(e) => {
                      setManagerPasswordInput(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Persoonlijke PIN of beheer-PIN 1234"
                    className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 rounded-xl px-4 py-3 text-xs font-bold tracking-normal focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-slate-600">Geregistreerde beheerders met toegang:</p>
                    <span className="text-[9px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                      👑 {employees.filter(e => e.role === 'beheerder').length} beheerder(s)
                    </span>
                  </div>
                  <div className="space-y-1">
                    {employees.filter(e => e.role === 'beheerder').map(mgr => (
                      <div key={mgr.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-amber-500">👑</span>
                          <span>{mgr.name}</span>
                          {mgr.email && <span className="text-slate-400 font-normal text-[11px]">({mgr.email})</span>}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-250">
                          PIN: {mgr.pin || '1234'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5 leading-tight">
                    Inloggen kan met het e-mailadres of de naam van een beheerder + persoonlijke pincode of de algemene beheer-PIN <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">1234</code>.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition duration-150 active:scale-95 cursor-pointer mt-2 text-center"
                >
                  Beheerder Inloggen →
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-transparent border-0 rounded-none shadow-none space-y-6">
              <div className="bg-orange-100 border-2 border-orange-200 text-orange-950 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <span className="text-xs font-bold uppercase tracking-tight">🔑 Je bent momenteel ingelogd als <strong className="text-orange-600">{employees.find(e => e.role === 'beheerder')?.name || 'Hans Stevens'} (Beheerder)</strong>. Je hebt volledige bewerk-rechten.</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setManagerLoggedIn(false);
                      localStorage.removeItem('manager_logged_in');
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-black rounded-xl text-xs uppercase tracking-tight shadow-md transition shrink-0 cursor-pointer"
                  >
                    Uitloggen
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('personeel');
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-tight shadow-md transition shrink-0"
                  >
                    Wissel naar personeel-view
                  </button>
                </div>
              </div>

              <ManagerDashboard
                employees={employees}
                shifts={shifts}
                notices={notices}
                swapRequests={swapRequests}
                logs={logs}
                availabilities={availabilities}
                onAddShift={handleAddShift}
                onUpdateShift={handleUpdateShift}
                onDeleteShift={handleDeleteShift}
                onPublishAllDrafts={handlePublishAllDrafts}
                onUnpublishWeek={handleUnpublishWeek}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onBulkSyncEmployees={handleBulkSyncEmployees}
                onAddNotice={handleAddNotice}
                onDeleteNotice={handleDeleteNotice}
                onAddNoticeComment={handleAddNoticeComment}
                onToggleNoticeReaction={handleToggleNoticeReaction}
                onDeleteNoticeComment={handleDeleteNoticeComment}
                onApproveSwap={handleApproveSwap}
                onDeclineSwap={handleDeclineSwap}
                onUpdateAvailability={(avail) => {
                  handleUpdateAvailability(avail.employeeId, avail.weekNumber, avail.days);
                }}
                onBulkUpdateAvailability={handleBulkUpdateAvailability}
                onRestoreSchedule={handleRestoreSchedule}
                onBatchUpdateShifts={handleBatchUpdateShifts}
                onOpenShareModal={() => setShowShareModal(true)}
                onOpenShiftForSwap={handleOpenShiftForSwap}
                onCreateOpenShift={handleCreateOpenShift}
                onSelfAssignOpenShift={handleSelfAssignOpenShift}
                onShareWhatsAppSchedule={handleShareWhatsAppSchedule}
                onShareWhatsAppNotice={handleShareWhatsAppNotice}
                appSettings={appSettings}
                onUpdateAppSettings={handleUpdateAppSettings}
                onAcknowledgeShift={handleAcknowledgeShift}
                onBulkAcknowledgeWeek={handleBulkAcknowledgeWeek}
                onRestoreFullCloudArchive={handleRestoreFullCloudArchive}
              />
            </div>
          )
        ) : (
          <div className="bg-transparent border-0 rounded-none shadow-none space-y-6">
            <div className="bg-orange-100 border-2 border-orange-200 text-orange-950 rounded-2xl p-4 text-xs font-bold uppercase tracking-tight">
              🧑‍🍳 Dit is het <span className="text-orange-600">Medewerkersportaal (Personeelsview)</span>. Medewerkers kunnen hier uren inzien, roosters bevestigen, en open diensten ruilen.
            </div>

            <StaffPortal
              employees={employees}
              shifts={shifts}
              notices={notices}
              swapRequests={swapRequests}
              availabilities={availabilities}
              appSettings={appSettings}
              onAcknowledgeShift={handleAcknowledgeShift}
              onAddSwapRequest={handleAddSwapRequest}
              onUpdateEmployee={handleUpdateEmployee}
              onAddEmployee={handleAddEmployee}
              onUpdateAvailability={handleUpdateAvailability}
              onSignUpForOpenShift={handleSignUpForOpenShift}
              onCancelSignUpOpenShift={handleCancelSignUpOpenShift}
              onSelfAssignOpenShift={handleSelfAssignOpenShift}
              onAddNoticeComment={handleAddNoticeComment}
              onToggleNoticeReaction={handleToggleNoticeReaction}
              onMarkNoticeRead={handleMarkNoticeRead}
              onDismissNotice={handleDismissNotice}
              onMarkAllNoticesRead={handleMarkAllNoticesRead}
            />
          </div>
        )}

      </main>

      {/* Vibrant Palette Footer */}
      <footer className="bg-slate-800 text-white px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-slate-900 shrink-0 mt-12 w-full">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Systeem Status: Live</span>
        </div>
        <div className="text-[11px] font-black text-slate-400 tracking-tight uppercase">
          Planning & Communicatie Hub • INGELOGD ALS: <span className="text-orange-400">{activeTab === 'beheerder' ? 'MANAGER' : 'MEDEWERKER'}</span> • UPDATE: LIVE
        </div>
      </footer>

      {/* Custom Confirmation Modals for Sandboxed iFrame compatibility */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-rose-100 relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="absolute right-0 bottom-0 opacity-5 translate-y-1/4 translate-x-1/4 shrink-0 text-rose-500 pointer-events-none">
              <AlertTriangle size={200} />
            </div>

            <div className="flex items-center space-x-3 text-rose-600 mb-4">
              <div className="w-10 h-10 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Gevaarzone</span>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Verwijder Medewerker</h3>
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-semibold mb-6">
              Weet je zeker dat je medewerker <strong className="text-slate-800 font-extrabold">"{employeeToDelete.name}"</strong> wilt verwijderen? Dit wist permanent hun medewerkersprofiel, al hun geplande shifts en eventuele openstaande ruilverzoeken.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-tight rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={() => confirmDeleteEmployee(employeeToDelete.id)}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-lg shadow-rose-100 transition cursor-pointer text-center"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {showDemoResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-orange-100 relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="absolute right-0 bottom-0 opacity-5 translate-y-1/4 translate-x-1/4 shrink-0 text-orange-500 pointer-events-none">
              <RotateCcw size={200} />
            </div>

            <div className="flex items-center space-x-3 text-orange-600 mb-4">
              <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <RotateCcw size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">Fabrieksinstellingen</span>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Demo Herstellen</h3>
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-semibold mb-6">
              Wil je alle ingevoerde wijzigingen herstellen naar het standaard demo-rooster van <strong className="text-orange-700">In De Molen</strong>? Alle handmatig toegevoegde shifts, logs en medewerkers worden hiermee overschreven.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDemoResetConfirm(false)}
                className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-tight rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={confirmResetDemoData}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-lg shadow-orange-100 transition cursor-pointer text-center"
              >
                Herstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share with Team & Cloud Sync Modal */}
      {showShareModal && (
        <ShareTeamModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          sharedUrl={SHARED_APP_URL}
          employeesCount={employees.length}
          shiftsCount={shifts.length}
          cloudSyncStatus={cloudSyncStatus}
          lastSyncTime={lastCloudSyncTime}
          onForceCloudSync={handleForceCloudSync}
        />
      )}

      {/* Floating In-App Real-time Notification Banner for updates & notices */}
      <InAppNotificationBanner
        latestNotice={(() => {
          // Alleen algemene groepsmededelingen tonen in de zwevende banner, geen persoonlijke shift-wijzigingen
          const generalNotices = notices.filter(n => !n.targetEmployeeId && n.category !== 'wijziging');
          return generalNotices.length > 0 ? generalNotices[0] : null;
        })()}
        onViewSchedule={() => {
          setActiveTab('personeel');
        }}
        onViewNotice={(notice) => {
          setActiveTab('personeel');
        }}
      />

      {/* Automatic WhatsApp Sharing Modal */}
      {autoWhatsAppModalData && (
        <AutoWhatsAppModal
          data={autoWhatsAppModalData}
          onClose={() => setAutoWhatsAppModalData(null)}
        />
      )}

      {/* Offline Status Indicator */}
      <OfflineIndicator />

    </div>
  );
}
