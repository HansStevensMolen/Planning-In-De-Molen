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
  BookOpen,
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
  getLocalAppSettings
} from './services/firebase';
import { AppSettings } from './types';
import { sortEmployeesByFirstName, deduplicateEmployees } from './utils/employeeSortUtils';
import { CURRENT_WEEK_NUMBER } from './utils/weekUtils';
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
  // Load state from localStorage or fallback to defaults
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('cafe_employees');
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sortEmployeesByFirstName(deduplicateEmployees(parsed));
        }
      } catch (e) {
        // ignore
      }
    }
    return sortEmployeesByFirstName(INITIAL_EMPLOYEES);
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('cafe_shifts');
    if (saved) {
      try {
        const parsed: Shift[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
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
  const [showHowToDialog, setShowHowToDialog] = useState(true);
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

        if (cloudEmployees && cloudEmployees.length > 0) {
          setEmployees(sortEmployeesByFirstName(deduplicateEmployees(cloudEmployees)));
          hasDataInCloud = true;
        }
        if (cloudShifts && cloudShifts.length > 0) {
          setShifts(cloudShifts);
          hasDataInCloud = true;
        }
        if (cloudAvailabilities && cloudAvailabilities.length > 0) {
          setAvailabilities(cloudAvailabilities);
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
      if (isMounted && updatedEmployees && updatedEmployees.length > 0) {
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

  const shToLogTitle = (status: 'draft' | 'published') => {
    return status === 'draft' ? 'Ontwerp-dienst gemaakt' : 'Dienst direct gepubliceerd';
  };

  // Action: Update Shift details
  const handleUpdateShift = (updatedShift: Shift) => {
    const nextShifts = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);
    const empName = employees.find(e => e.id === updatedShift.employeeId)?.name || 'Onbekend';
    addLog(
      'Dienst bijgewerkt',
      `Planning aangepast voor ${empName} op ${DAYS_OF_WEEK[updatedShift.day]} (${updatedShift.startTime} - ${updatedShift.endTime}) [Week ${updatedShift.weekNumber || CURRENT_WEEK_NUMBER}]`
    );
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
  };

  // Action: Publish draft shifts (for a specific week or all) & alert team
  const handlePublishAllDrafts = (targetWeek?: number) => {
    const draftsToPublish = shifts.filter(s => 
      s.status === 'draft' && (targetWeek === undefined || (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek)
    );
    const draftCount = draftsToPublish.length;
    if (draftCount === 0) return;

    const publishedShifts = shifts.map(s => {
      if (s.status === 'draft' && (targetWeek === undefined || (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek)) {
        return { ...s, status: 'published' as const };
      }
      return s;
    });
    setShifts(publishedShifts);
    saveShiftsToCloud(publishedShifts);
    
    const weekLabel = targetWeek ? `Week ${targetWeek}` : 'Alle Weken';

    // Add nice system log
    addLog('Rooster Gepubliceerd', `${draftCount} ontwerp-diensten officieel geactiveerd voor ${weekLabel}`);

    // Insert automatic notice to the group notice board
    const newNotice: Notice = {
      id: `notice_${Date.now()}`,
      title: `📅 Planning ${weekLabel} gepubliceerd!`,
      content: `Het weekrooster voor ${weekLabel} is officieel herzien en de nieuwste diensten zijn geplaatst. Controleer direct jouw persoonlijke uren in het portaal en vergeet niet op "Bevestigen als Gezien" te klikken!`,
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
          shiftsCount: draftCount,
          notes: `${draftCount} diensten zijn zojuist officieel gepubliceerd.`
        })
      });
    }

    // Automatic Cloud Backup Snapshot of the finalized schedule
    const weekForBackup = targetWeek || CURRENT_WEEK_NUMBER;
    const weekShifts = publishedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === weekForBackup);
    createScheduleBackupInCloud(
      weekForBackup,
      weekShifts,
      'Hans Stevens (Beheerder)',
      `Definitieve Planning Week ${weekForBackup} (${weekShifts.length} diensten)`,
      `Automatische cloud snapshot bij publiceren van ${draftCount} diensten`,
      true
    ).then(() => {
      addLog('Cloud Backup Aangemaakt', `Definitieve planning voor Week ${weekForBackup} veilig gearchiveerd in Google Cloud Firestore`);
    }).catch(err => {
      console.warn('Cloud schedule backup error:', err);
    });
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
        shiftsCount: weekShifts.length
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

  // Action: Employee marks shift as acknowledged
  const handleAcknowledgeShift = (shiftId: string) => {
    const nextShifts = shifts.map(s => s.id === shiftId ? { ...s, acknowledged: true } : s);
    setShifts(nextShifts);
    saveShiftsToCloud(nextShifts);

    const targetShift = shifts.find(s => s.id === shiftId);
    if (targetShift) {
      const emp = employees.find(e => e.id === targetShift.employeeId);
      addLog(
        'Dienst Gecheckt',
        `${emp ? emp.name : 'Medewerker'} heeft zijn dienst op ${DAYS_OF_WEEK[targetShift.day]} bevestigd`
      );
    }
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
    const nextNotices = [notice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);

    addLog('Dienst Opengesteld', `Dienst op ${dayName} (${targetShift.startTime} - ${targetShift.endTime}) opengesteld voor intekening`);
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
    const nextNotices = [notice, ...notices];
    setNotices(nextNotices);
    saveNoticesToCloud(nextNotices);

    addLog('Openstaande dienst aangemaakt', `Openstaande dienst op ${dayName} (${newShift.startTime} - ${newShift.endTime}) opengesteld voor intekening [Week ${newShift.weekNumber}]`);
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

            <button
              onClick={() => setShowHowToDialog(true)}
              className="p-2.5 bg-white hover:bg-orange-50 border border-orange-200 rounded-xl text-slate-600 hover:text-orange-600 transition shadow-sm"
              title="Uitleg & Workflowgids"
            >
              <BookOpen size={16} />
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
        
        {/* Dynamic tutorial banner if visible */}
        {showHowToDialog && (
          <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-xl border-2 border-orange-100 border-b-4 border-b-orange-250 mb-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 translate-y-1/4 translate-x-1/4 shrink-0 text-orange-500">
              <Sparkles size={300} />
            </div>

            <button 
              onClick={() => setShowHowToDialog(false)}
              className="absolute top-4 right-4 text-orange-400 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 p-2 rounded-full transition border border-orange-200"
            >
              <X size={16} />
            </button>

            <div className="max-w-3xl space-y-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Sparkles size={20} className="shrink-0 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider">Hoe communiceer je je planning het beste?</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
                De beste & gemakkelijkste methode om wijzigingen te communiceren
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Het communiceren van roosters is vaak een uitdaging. De meest effectieve manier is een <strong className="text-orange-600">gesloten feedbackloop op één centraal platform</strong>. Met deze applicatie pak je dat zo aan:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-orange-50/50 p-4 rounded-2xl border-2 border-orange-100 space-y-2">
                  <div className="text-xs font-black text-orange-600 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-black inline-flex items-center justify-center">1</span>
                    <span>Werk met Ontwerpen</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Plan diensten in als <strong className="text-orange-700">Ontwerp (Draft)</strong>. Je personeel ziet ze niet, zodat je rustig kunt sleutelen zonder chaos te creëren. Pas als het rooster af is, publiceer je alles in één klik.
                  </p>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-2xl border-2 border-emerald-100 space-y-2">
                  <div className="text-xs font-black text-emerald-700 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-black inline-flex items-center justify-center">2</span>
                    <span>Gezien-bevestiging</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Je medewerkers kunnen hun shift via hun portaal direct <strong className="text-emerald-700">bevestigen ("Gezien")</strong>. Jij ziet als manager direct een groen vinkje verschijnen. Nooit meer discussies!
                  </p>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl border-2 border-blue-100 space-y-2">
                  <div className="text-xs font-black text-blue-700 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-505 bg-blue-500 text-white text-[11px] font-black inline-flex items-center justify-center">3</span>
                    <span>Self-service Ruilen</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Medewerkers zetten een shift <strong className="text-blue-700">openbaar te ruil</strong> en selecteren optioneel een vervanger. Jij keurt het goed in je beheerderstaken en de app werkt het rooster direct live bij.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">💡 Klik hierboven op <strong className="text-orange-600">Personeel Portal</strong> om te ervaren hoe medewerkers hun rooster bekijken en bevestigen!</span>
                <button
                  onClick={() => setShowHowToDialog(false)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-1.5 shrink-0"
                >
                  <span>Aan de Slag</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </button>
              </div>
            </div>
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
        latestNotice={notices.length > 0 ? notices[0] : null}
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
