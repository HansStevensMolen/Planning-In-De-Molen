import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  UserPlus, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertTriangle, 
  Megaphone, 
  Users, 
  FileText, 
  ArrowLeftRight, 
  FileCheck, 
  Sparkles, 
  CircleAlert, 
  CheckCheck, 
  X,
  Mail,
  Phone,
  Tag,
  Share2,
  UtensilsCrossed,
  Utensils,
  Copy,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Download,
  Database,
  HardDrive,
  RotateCcw,
  Facebook,
  FileSpreadsheet,
  Bot,
  Printer,
  Archive,
  Camera,
  Lock,
  KeyRound,
  CalendarPlus,
  Zap,
  Send,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Bell,
  BellRing,
  Eye,
  Info,
  BarChart3
} from 'lucide-react';
import { Employee, Shift, Notice, SwapRequest, ChangeLog, EmployeeStatuut, ExperienceLevel, EmployeeAvailability, DayAvailability, Department, WeekMeta, AppSettings } from '../types';
import NotificationModal from './NotificationModal';
import BackupManagerModal from './BackupManagerModal';
import ExcelEmployeeSyncModal from './ExcelEmployeeSyncModal';
import ExcelAvailabilityBulkModal from './ExcelAvailabilityBulkModal';
import { GeminiRoosterModal } from './GeminiRoosterModal';
import SchedulePrintModal from './SchedulePrintModal';
import { EmployeeAvatarModal } from './EmployeeAvatarModal';
import ShiftReminderModal from './ShiftReminderModal';
import StaffAvailabilityChart from './StaffAvailabilityChart';
import { AVAILABLE_WEEKS, HISTORICAL_WEEKS, getWeekMeta, isAvailabilityPastDeadline, isWeekArchived, isWeekAvailabilityLocked, UPCOMING_SIX_WEEKS_FROM_NEXT, CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER, getDayDateInfo, getAutoArchivedWeeks, getAutoActiveWeeks, getEffectiveEmployeeAvailability, isRecurringApplicableToWeek, DAYS_FULL_NL } from '../utils/weekUtils';
import { generateShiftsForWeek, generateSixUpcomingWeeksShifts, generateSmartAutoPlan } from '../utils/roosterGenerator';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';
import {
  calculateAge,
  formatBirthDate,
  isStudent,
  isMinorStudent,
  isStudentMissingBirthDate,
  validateMinorShift,
  isShiftEndingAfter23,
  calculateShiftDurationHours
} from '../utils/employeeAgeUtils';
import { CAFE_OPENING_HOURS, CAFE_SUMMARY_OPENING_HOURS } from '../utils/openingHours';

interface ManagerDashboardProps {
  employees: Employee[];
  shifts: Shift[];
  notices: Notice[];
  swapRequests: SwapRequest[];
  logs: ChangeLog[];
  availabilities: EmployeeAvailability[];
  onAddShift: (shift: Omit<Shift, 'id' | 'updatedAt'>) => void;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onPublishAllDrafts: (targetWeek?: number) => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
  onBulkSyncEmployees?: (newEmployees: Employee[], removedIds: string[]) => void;
  onAddNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  onApproveSwap: (requestId: string, assignedCandidateId?: string) => void;
  onDeclineSwap: (requestId: string) => void;
  onOpenShiftForSwap?: (shiftId: string, note?: string) => void;
  onCreateOpenShift?: (shift: Omit<Shift, 'id' | 'updatedAt'>, customReason?: string) => void;
  onUpdateAvailability?: (availability: EmployeeAvailability, notes?: string) => void;
  onBulkUpdateAvailability?: (
    updatedAvailabilities: { employeeId: string; weekNumber: number; days: DayAvailability[]; notes?: string }[]
  ) => void;
  onMarkNotified?: (employeeIds: string[], type: 'email' | 'whatsapp' | 'both') => void;
  onRestoreSchedule?: (restoredShifts: Shift[], weekNumber: number) => void;
  onBatchUpdateShifts?: (newShifts: Shift[], logDetails?: string) => void;
  onOpenShareModal?: () => void;
  onDeleteNotice?: (noticeId: string) => void;
  onAddNoticeComment?: (
    noticeId: string,
    authorId: string,
    authorName: string,
    authorRole: 'beheerder' | 'medewerker',
    content: string
  ) => void;
  onToggleNoticeReaction?: (noticeId: string, emoji: string, employeeId: string) => void;
  onDeleteNoticeComment?: (noticeId: string, commentId: string) => void;
  onSelfAssignOpenShift?: (shiftId: string, employeeId: string) => void;
  onShareWhatsAppSchedule?: (weekNumber: number) => void;
  onShareWhatsAppNotice?: (notice: Notice) => void;
  appSettings?: AppSettings;
  onUpdateAppSettings?: (settings: Partial<AppSettings>) => void;
}

const DAYS_OF_WEEK = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

const CATEGORY_COLORS = {
  planning: 'bg-blue-100 text-blue-800 border-blue-200',
  wijziging: 'bg-amber-100 text-amber-800 border-amber-200',
  belangrijk: 'bg-red-100 text-red-800 border-red-200',
  algemeen: 'bg-slate-100 text-slate-800 border-slate-200'
};

export default function ManagerDashboard({
  employees,
  shifts,
  notices,
  swapRequests,
  logs,
  availabilities,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onPublishAllDrafts,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onBulkSyncEmployees,
  onAddNotice,
  onApproveSwap,
  onDeclineSwap,
  onUpdateAvailability,
  onBulkUpdateAvailability,
  onMarkNotified,
  onRestoreSchedule,
  onBatchUpdateShifts,
  onOpenShareModal,
  onOpenShiftForSwap,
  onCreateOpenShift,
  onDeleteNotice,
  onAddNoticeComment,
  onToggleNoticeReaction,
  onDeleteNoticeComment,
  onSelfAssignOpenShift,
  onShareWhatsAppSchedule,
  onShareWhatsAppNotice,
  appSettings,
  onUpdateAppSettings
}: ManagerDashboardProps) {
  // Notices deletion & comments state for managers
  const [noticeToDeleteId, setNoticeToDeleteId] = useState<string | null>(null);
  const [managerNoticeReplyText, setManagerNoticeReplyText] = useState<{ [noticeId: string]: string }>({});

  // Tabs within manager dashboard: Zaal (IDM zaal), Keuken (IDM keuken), Beschikbaarheden (alleen beheerder!), etc.
  const [activeSubTab, setActiveSubTab] = useState<'zaal' | 'keuken' | 'beschikbaarheid' | 'notificaties' | 'verzoeken' | 'berichten' | 'team'>('zaal');

  // Availability overview state for managers
  const [selectedManagerWeek, setSelectedManagerWeek] = useState<number>(NEXT_WEEK_NUMBER);
  const [managerAvailSearch, setManagerAvailSearch] = useState<string>('');
  const [managerAvailDeptFilter, setManagerAvailDeptFilter] = useState<'all' | Department>('all');
  const [managerAvailStatuutFilter, setManagerAvailStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  const [managerAvailExperienceFilter, setManagerAvailExperienceFilter] = useState<'all' | ExperienceLevel>('all');
  const [showAvailabilityChart, setShowAvailabilityChart] = useState<boolean>(true);

  // Six-weeks horizon states
  const [showSixWeeksModal, setShowSixWeeksModal] = useState(false);
  const [sixWeeksSuccessMsg, setSixWeeksSuccessMsg] = useState<string | null>(null);

  // Dynamic active weeks and archive management
  const [extraWeekNumbers, setExtraWeekNumbers] = useState<number[]>([]);
  const [showArchiveMenu, setShowArchiveMenu] = useState(false);
  const [showAvailArchiveMenu, setShowAvailArchiveMenu] = useState(false);

  // In-app confirmation dialog states (no window.confirm or alert)
  const [showClearWeekModal, setShowClearWeekModal] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [showPublishSixWeeksConfirmModal, setShowPublishSixWeeksConfirmModal] = useState(false);

  // Modals state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showShiftReminderModal, setShowShiftReminderModal] = useState(false);
  const [reminderToast, setReminderToast] = useState<{
    shiftId: string;
    employeeName: string;
    dayName: string;
    dateStr: string;
    timeStr: string;
    department: string;
    phone?: string;
    whatsAppUrl: string | null;
  } | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showExcelSyncModal, setShowExcelSyncModal] = useState(false);
  const [showExcelAvailabilityModal, setShowExcelAvailabilityModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedAvailabilityDetail, setSelectedAvailabilityDetail] = useState<{ employee: Employee; weekNumber: number } | null>(null);
  const [showQuickNoticeModal, setShowQuickNoticeModal] = useState(false);
  const [isConfirmingDeleteShift, setIsConfirmingDeleteShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Partial<Shift> & { isNew: boolean }>({ isNew: true });
  const [shiftValidationError, setShiftValidationError] = useState<string | null>(null);
  
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ 
    name: '', 
    department: 'zaal' as Department, 
    statuut: 'Student' as EmployeeStatuut, 
    birthDate: '',
    experience: 'Beginner' as ExperienceLevel, 
    email: '', 
    phone: '', 
    facebookUrl: '', 
    pin: '1234',
    role: 'medewerker' as 'medewerker' | 'beheerder'
  });
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [bulkDepartment, setBulkDepartment] = useState<Department>('zaal');
  const [bulkStatuut, setBulkStatuut] = useState<EmployeeStatuut>('Student');
  const [bulkExperience, setBulkExperience] = useState<ExperienceLevel>('Beginner');

  // Employee Edit States
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpDepartment, setEditEmpDepartment] = useState<Department>('zaal');
  const [editEmpStatuut, setEditEmpStatuut] = useState<EmployeeStatuut>('Student');
  const [editEmpBirthDate, setEditEmpBirthDate] = useState('');
  const [editEmpExperience, setEditEmpExperience] = useState<ExperienceLevel>('Beginner');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpFacebook, setEditEmpFacebook] = useState('');
  const [editEmpPin, setEditEmpPin] = useState('1234');
  const [editEmpRole, setEditEmpRole] = useState<'medewerker' | 'beheerder'>('medewerker');
  const [selectedAvatarEmployee, setSelectedAvatarEmployee] = useState<Employee | null>(null);

  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'planning' as Notice['category'] });

  // Filter for roster grid
  const [selectedStatuutFilter, setSelectedStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  const [selectedExperienceFilter, setSelectedExperienceFilter] = useState<'all' | ExperienceLevel>('all');

  // Auto-planner state
  const [autoPlanWeek, setAutoPlanWeek] = useState<number>(NEXT_WEEK_NUMBER);
  const [showAutoPlanConfirmModal, setShowAutoPlanConfirmModal] = useState(false);
  const [showNoTeamModal, setShowNoTeamModal] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [showSchedulePrintModal, setShowSchedulePrintModal] = useState(false);

  // Active weeks dynamically generated: strictly >= CURRENT_WEEK_NUMBER
  const activeWeeks = getAutoActiveWeeks(CURRENT_WEEK_NUMBER, extraWeekNumbers, shifts);

  // Archived older weeks: all previous weeks strictly prior to CURRENT_WEEK_NUMBER are automatically archived
  const archivedWeeks = getAutoArchivedWeeks(CURRENT_WEEK_NUMBER, shifts, availabilities);

  const isCurrentWeekSelectedArchived = isWeekArchived(selectedManagerWeek, CURRENT_WEEK_NUMBER);

  // Calculated statistics for the selected active week
  const activeWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek);
  const loggedDraftShiftsCount = activeWeekShifts.filter(s => s.status === 'draft').length;
  const totalDraftShiftsCount = shifts.filter(s => s.status === 'draft').length;
  const loggedPendingSwapsCount = swapRequests.filter(sr => sr.status === 'pending').length;

  const totalShiftsCount = activeWeekShifts.length;
  const confirmedShiftsCount = activeWeekShifts.filter(s => s.acknowledged && s.status === 'published').length;
  const publishedShiftsCount = activeWeekShifts.filter(s => s.status === 'published').length;
  const confirmationRate = publishedShiftsCount > 0 ? Math.round((confirmedShiftsCount / publishedShiftsCount) * 100) : 0;

  // Action: Add Next Week dynamically
  const handleAddNewWeek = () => {
    const allActiveNums = activeWeeks.map(w => w.weekNumber);
    const maxWeek = Math.max(...allActiveNums, CURRENT_WEEK_NUMBER + 6);
    const nextW = maxWeek + 1;
    setExtraWeekNumbers(prev => [...prev, nextW]);
    setSelectedManagerWeek(nextW);
    setAutoPlanWeek(nextW);
    setSixWeeksSuccessMsg(`Week ${nextW} (${getWeekMeta(nextW).dateRange}) is automatisch toegevoegd aan de planningstool!`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
  };

  // Actions: Week-by-week Availability Locking by Manager
  const handleToggleWeekLock = (weekNum: number) => {
    const currentLocked = Array.isArray(appSettings?.lockedWeeks)
      ? [...appSettings.lockedWeeks]
      : [CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER];

    const isLocked = currentLocked.includes(weekNum);
    const nextList = isLocked
      ? currentLocked.filter(w => w !== weekNum)
      : [...currentLocked, weekNum].sort((a, b) => a - b);

    onUpdateAppSettings?.({ lockedWeeks: nextList });
  };

  const handleLockAllWeeks = () => {
    const allNums = activeWeeks.map(w => w.weekNumber);
    const currentLocked = Array.isArray(appSettings?.lockedWeeks) ? appSettings.lockedWeeks : [];
    const merged = Array.from(new Set([...currentLocked, ...allNums])).sort((a, b) => a - b);
    onUpdateAppSettings?.({ lockedWeeks: merged });
  };

  const handleUnlockAllWeeks = () => {
    onUpdateAppSettings?.({ lockedWeeks: [], availabilitySubmissionEnabled: true });
  };

  const handleResetDefaultWeeksLock = () => {
    onUpdateAppSettings?.({ lockedWeeks: [CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER] });
  };

  // Action: Copy previous week's schedule to current week
  const handleCopyPreviousWeekRoster = () => {
    const previousWeek = selectedManagerWeek - 1;
    const sourceShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === previousWeek);
    if (sourceShifts.length === 0) {
      setSixWeeksSuccessMsg(`Er zijn geen diensten gevonden in Week ${previousWeek} om te kopiëren naar Week ${selectedManagerWeek}.`);
      setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
      return;
    }
    const currentWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek);
    if (currentWeekShifts.length > 0) {
      setShowCopyWeekModal(true);
      return;
    }
    executeCopyPreviousWeek();
  };

  const executeCopyPreviousWeek = () => {
    const previousWeek = selectedManagerWeek - 1;
    const sourceShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === previousWeek);
    sourceShifts.forEach(s => {
      onAddShift({
        employeeId: s.employeeId,
        department: s.department,
        weekNumber: selectedManagerWeek,
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes ? `${s.notes} (Kopie W${previousWeek})` : `Kopie uit Week ${previousWeek}`,
        status: 'draft',
        acknowledged: false
      });
    });
    setShowCopyWeekModal(false);
    setSixWeeksSuccessMsg(`Succes! ${sourceShifts.length} diensten uit Week ${previousWeek} zijn gekopieerd naar Week ${selectedManagerWeek} als concept!`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
  };

  // Action: Clear active week's schedule (Wis knop)
  const handleClearWeekRoster = () => {
    const currentWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek);
    if (currentWeekShifts.length === 0) {
      setSixWeeksSuccessMsg(`Er zijn momenteel geen ingevulde diensten in Week ${selectedManagerWeek} om te wissen.`);
      setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
      return;
    }
    setShowClearWeekModal(true);
  };

  const confirmClearWeekRoster = () => {
    const currentWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek);
    const count = currentWeekShifts.length;
    if (onBatchUpdateShifts) {
      const remainingShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) !== selectedManagerWeek);
      onBatchUpdateShifts(remainingShifts, `Alle ${count} diensten voor Week ${selectedManagerWeek} gewist`);
    } else {
      currentWeekShifts.forEach(s => onDeleteShift(s.id));
    }
    setShowClearWeekModal(false);
    setSixWeeksSuccessMsg(`Succes! Alle ${count} diensten voor Week ${selectedManagerWeek} zijn gewist.`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
  };

  // 6-Weken Horizon Management: Prepare/Fill and Publish
  const handlePrepareSixWeeksHorizon = (forceOverwrite = false, publishDirectly = false) => {
    const targetWeeks = UPCOMING_SIX_WEEKS_FROM_NEXT;
    let updatedShifts = [...shifts];
    let totalAdded = 0;

    targetWeeks.forEach(wk => {
      const existingInWeek = updatedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === wk);
      if (forceOverwrite || existingInWeek.length < 15) {
        if (forceOverwrite) {
          updatedShifts = updatedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) !== wk);
        }
        const generated = generateSmartAutoPlan(wk, employees, availabilities, publishDirectly);
        updatedShifts.push(...generated);
        totalAdded += generated.length;
      } else if (publishDirectly) {
        updatedShifts = updatedShifts.map(s => {
          if ((s.weekNumber || CURRENT_WEEK_NUMBER) === wk && s.status === 'draft') {
            return { ...s, status: 'published' };
          }
          return s;
        });
      }
    });

    if (onBatchUpdateShifts) {
      onBatchUpdateShifts(
        updatedShifts,
        `6-weken planning klaargezet (W${targetWeeks[0]} t/m W${targetWeeks[targetWeeks.length - 1]}): ${totalAdded} diensten gegenereerd/aangevuld`
      );
    } else if (onRestoreSchedule) {
      onRestoreSchedule(updatedShifts, NEXT_WEEK_NUMBER);
    }

    setSixWeeksSuccessMsg(
      publishDirectly
        ? `Geweldig! Alle planningen voor de komende 6 weken (Week ${targetWeeks[0]} t/m ${targetWeeks[targetWeeks.length - 1]}) zijn klaargezet én direct gepubliceerd voor het personeel!`
        : `Succes! De planningshorizon voor de komende 6 weken (Week ${targetWeeks[0]} t/m ${targetWeeks[targetWeeks.length - 1]}) is volledig voorbereid met evenwichtige bezetting voor Zaal en Keuken!`
    );
    setTimeout(() => setSixWeeksSuccessMsg(null), 8000);
  };

  const handlePublishAllSixWeeks = () => {
    const targetWeeks = UPCOMING_SIX_WEEKS_FROM_NEXT;
    const draftCount = shifts.filter(s => targetWeeks.includes(s.weekNumber || CURRENT_WEEK_NUMBER) && s.status === 'draft').length;
    if (draftCount === 0) {
      setSixWeeksSuccessMsg('Alle diensten voor de komende 6 weken zijn al definitief gepubliceerd!');
      setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
      return;
    }
    setShowPublishSixWeeksConfirmModal(true);
  };

  const executePublishAllSixWeeks = () => {
    const targetWeeks = UPCOMING_SIX_WEEKS_FROM_NEXT;
    const draftCount = shifts.filter(s => targetWeeks.includes(s.weekNumber || CURRENT_WEEK_NUMBER) && s.status === 'draft').length;
    const updatedShifts = shifts.map(s => {
      if (targetWeeks.includes(s.weekNumber || CURRENT_WEEK_NUMBER) && s.status === 'draft') {
        return { ...s, status: 'published' as const };
      }
      return s;
    });

    if (onBatchUpdateShifts) {
      onBatchUpdateShifts(updatedShifts, `Alle 6 weken (W${targetWeeks[0]} t/m W${targetWeeks[targetWeeks.length - 1]}) definitief gepubliceerd (${draftCount} diensten)`);
    }

    onAddNotice({
      title: `📢 6 Weken Planningen Gepubliceerd (Week ${targetWeeks[0]} t/m ${targetWeeks[targetWeeks.length - 1]})!`,
      content: 'Het management heeft de roosters voor de komende 6 weken definitief gepubliceerd. Controleer al je diensten in het portaal en sync ze naar je Google, Apple of Outlook agenda!',
      category: 'planning',
      author: 'Hans Stevens (Beheerder)'
    });

    setShowPublishSixWeeksConfirmModal(false);
    setSixWeeksSuccessMsg(`Succes! ${draftCount} concept-diensten over de komende 6 weken zijn nu gepubliceerd en direct zichtbaar voor het personeel!`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 8000);
  };

  // Handle open shift modal for adding
  const handleOpenAddShift = (employeeId: string, day: number) => {
    setIsConfirmingDeleteShift(false);
    const emp = employees.find(e => e.id === employeeId);
    const defaultDept = emp?.department || (activeSubTab === 'keuken' ? 'keuken' : 'zaal');
    setSelectedShift({
      isNew: true,
      employeeId,
      department: defaultDept,
      weekNumber: selectedManagerWeek,
      day,
      startTime: '16:00',
      endTime: '23:00',
      notes: '',
      status: 'draft',
      acknowledged: false
    });
    setShowShiftModal(true);
  };

  // Snelle Actie: Direct nieuw formulier openen voor actieve week
  const handleOpenCreateShiftQuickAction = () => {
    setIsConfirmingDeleteShift(false);
    const sorted = sortEmployeesByFirstName(employees);
    const firstEmp = sorted[0] || employees[0];
    const defaultDept = activeSubTab === 'keuken' ? 'keuken' : (firstEmp?.department || 'zaal');
    setSelectedShift({
      isNew: true,
      employeeId: firstEmp?.id || '',
      department: defaultDept,
      weekNumber: selectedManagerWeek,
      day: 0,
      startTime: '16:00',
      endTime: '23:00',
      notes: '',
      status: 'draft',
      acknowledged: false
    });
    setShiftValidationError(null);
    setShowShiftModal(true);
  };

  // Handle open shift modal for editing
  const handleOpenEditShift = (shift: Shift) => {
    setIsConfirmingDeleteShift(false);
    setSelectedShift({
      ...shift,
      weekNumber: shift.weekNumber || selectedManagerWeek,
      isNew: false
    });
    setShiftValidationError(null);
    setShowShiftModal(true);
  };

  // 1-Click Shift-herinnering sturen naar medewerker ter voorbereiding op de komende werkdag
  const handleSendSingleShiftReminder = (targetShift: Shift) => {
    const emp = employees.find(e => e.id === targetShift.employeeId);
    if (!emp) return;

    const wNum = targetShift.weekNumber || selectedManagerWeek;
    const dayInfo = getDayDateInfo(wNum, targetShift.day);
    const dayName = DAYS_FULL_NL[targetShift.day] || `Dag ${targetShift.day + 1}`;
    const deptLabel = (targetShift.department || emp.department) === 'keuken' ? 'Keuken' : 'Zaal';

    // 1. Update de shift met timestamp van herinnering
    const updatedShift: Shift = {
      ...targetShift,
      lastReminderSentAt: Date.now()
    };
    onUpdateShift(updatedShift);

    // Als modal open staat voor deze shift, update ook de selectedShift state
    if (selectedShift && selectedShift.id === targetShift.id) {
      setSelectedShift(prev => ({ ...prev, lastReminderSentAt: updatedShift.lastReminderSentAt }));
    }

    // 2. Plaats een officiële shift-herinnering notificatie / prikbordbericht
    const noticeTitle = `🔔 Shift-herinnering: ${dayName} ${dayInfo.shortDate} (${targetShift.startTime} - ${targetShift.endTime})`;
    const noticeContent = `Beste ${emp.name}, dit is een vriendelijke herinnering vanuit beheerder Hans voor je geplande dienst in de ${deptLabel} op ${dayName} (${dayInfo.shortDate}) van ${targetShift.startTime} tot ${targetShift.endTime}. Gelieve ter voorbereiding op de werkdag je shift te controleren en je aanwezigheid te bevestigen in het medewerkersportaal. Veel succes!`;

    onAddNotice({
      title: noticeTitle,
      content: noticeContent,
      category: 'planning',
      author: 'Beheerder Hans',
      targetEmployeeId: emp.id,
      shiftId: targetShift.id
    });

    // 3. Optionele directe WhatsApp koppeling bij gekend telefoonnummer
    let waUrl: string | null = null;
    if (emp.phone) {
      const raw = emp.phone.replace(/[^0-9]/g, '');
      const intlPhone = (raw.startsWith('0') && raw.length === 10) ? '32' + raw.substring(1) : raw;
      const waText = encodeURIComponent(
        `Hallo ${emp.name}! 👋\n\nDit is een herinnering vanuit In De Molen voor je dienst:\n📅 ${dayName} ${dayInfo.shortDate}\n⏰ ${targetShift.startTime} - ${targetShift.endTime} (${deptLabel})\n\nGelieve je aanwezigheid tijdig te bevestigen in het portaal. Tot dan!`
      );
      waUrl = `https://wa.me/${intlPhone}?text=${waText}`;
    }

    // 4. Toon direct interactieve bevestiging/toast voor de beheerder
    setReminderToast({
      shiftId: targetShift.id,
      employeeName: emp.name,
      dayName,
      dateStr: dayInfo.shortDate,
      timeStr: `${targetShift.startTime} - ${targetShift.endTime}`,
      department: deptLabel,
      phone: emp.phone,
      whatsAppUrl: waUrl
    });

    // Auto dismiss na 8 seconden
    setTimeout(() => {
      setReminderToast(prev => prev?.shiftId === targetShift.id ? null : prev);
    }, 8000);
  };

  const handleSendBatchReminders = (shiftsToRemind: Shift[]) => {
    if (shiftsToRemind.length === 0) return;
    shiftsToRemind.forEach(sh => {
      handleSendSingleShiftReminder(sh);
    });
    setSixWeeksSuccessMsg(`🔔 Shift-herinneringen verstuurd naar ${shiftsToRemind.length} medewerker(s)! Notificaties zijn direct klaargezet in het medewerkersportaal.`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    const isOpen = Boolean(selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift');
    const effectiveEmpId = selectedShift.employeeId || (isOpen ? 'open_shift' : '');
    
    if (!effectiveEmpId || selectedShift.day === undefined || !selectedShift.startTime || !selectedShift.endTime) return;

    const shiftDept = selectedShift.department || (employees.find(e => e.id === effectiveEmpId)?.department) || (activeSubTab === 'keuken' ? 'keuken' : 'zaal');
    const targetWeekNumber = selectedShift.weekNumber !== undefined ? selectedShift.weekNumber : selectedManagerWeek;
    const assignedEmp = employees.find(e => e.id === effectiveEmpId);

    // Controleer strikte arbeidswetgeving voor minderjarige studenten (< 18: max 23u00 en max 8u/dag)
    if (assignedEmp) {
      const minorValidation = validateMinorShift(
        assignedEmp,
        { startTime: selectedShift.startTime, endTime: selectedShift.endTime, day: selectedShift.day },
        shifts.filter(s => s.weekNumber === targetWeekNumber),
        selectedShift.id
      );

      if (!minorValidation.valid) {
        setShiftValidationError(minorValidation.error || 'Deze dienst is wettelijk niet toegestaan voor minderjarige studenten.');
        return;
      }
    }

    if (isOpen && onCreateOpenShift && selectedShift.isNew) {
      onCreateOpenShift({
        employeeId: effectiveEmpId,
        department: shiftDept,
        weekNumber: targetWeekNumber,
        day: selectedShift.day,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        notes: selectedShift.notes || '',
        status: (selectedShift.status as 'draft' | 'published') || 'published',
        acknowledged: false,
        isOpenShift: true
      }, selectedShift.notes || 'Openstaande dienst: wie kan er inspringen? Schrijf je direct in!');
      setSixWeeksSuccessMsg('📢 Openstaande dienst direct in de planning opengezet voor intekening door medewerkers!');
      setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
    } else if (selectedShift.isNew) {
      onAddShift({
        employeeId: effectiveEmpId,
        department: shiftDept,
        weekNumber: targetWeekNumber,
        day: selectedShift.day,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        notes: selectedShift.notes || '',
        status: (selectedShift.status as 'draft' | 'published') || (isOpen ? 'published' : 'draft'),
        acknowledged: false,
        isOpenShift: isOpen
      });
      if (isOpen) {
        setSixWeeksSuccessMsg('📢 Nieuwe openstaande shift aangemaakt in de planning.');
        setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
      }
    } else {
      onUpdateShift({
        id: selectedShift.id!,
        employeeId: effectiveEmpId,
        department: shiftDept,
        weekNumber: targetWeekNumber,
        day: selectedShift.day,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        notes: selectedShift.notes || '',
        acknowledged: selectedShift.acknowledged || false,
        status: (selectedShift.status as 'draft' | 'published') || 'draft',
        isOpenShift: isOpen,
        updatedAt: Date.now()
      });
      if (isOpen && onOpenShiftForSwap && selectedShift.id) {
        onOpenShiftForSwap(selectedShift.id, selectedShift.notes || 'Openstaande dienst');
        setSixWeeksSuccessMsg('📢 Dienst in de planning opengesteld voor medewerkers om zichzelf in te vullen!');
        setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
      }
    }
    if (targetWeekNumber !== selectedManagerWeek) {
      setSelectedManagerWeek(targetWeekNumber);
      setAutoPlanWeek(targetWeekNumber);
    }
    setShiftValidationError(null);
    setShowShiftModal(false);
  };

  const handleDeleteShiftClick = (id: string) => {
    onDeleteShift(id);
    setIsConfirmingDeleteShift(false);
    setShowShiftModal(false);
    setSixWeeksSuccessMsg('Dienst succesvol verwijderd');
    setTimeout(() => setSixWeeksSuccessMsg(null), 4000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name) return;

    if (newEmp.statuut === 'Student' && !newEmp.birthDate) {
      alert('Geboortedatum is verplicht voor studenten om de wetgeving voor minderjarigen (-18 jaar: max tot 23u00 & max 8u/dag) te handhaven.');
      return;
    }

    // Direct color styling depending on index to match beautifully
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
    const chosenColor = colors[employees.length % colors.length];
    
    // Choose light border backgrounds
    const bgs = [
      'bg-indigo-50 border-indigo-200 text-indigo-700',
      'bg-pink-50 border-pink-200 text-pink-700',
      'bg-amber-50 border-amber-200 text-amber-700',
      'bg-emerald-50 border-emerald-200 text-emerald-700',
      'bg-cyan-50 border-cyan-200 text-cyan-700',
      'bg-violet-50 border-violet-200 text-violet-700',
      'bg-rose-50 border-rose-200 text-rose-700',
      'bg-teal-50 border-teal-200 text-teal-700'
    ];
    const bgStyles = bgs[employees.length % bgs.length];
    const parts = bgStyles.split(' ');

    onAddEmployee({
      name: newEmp.name,
      department: newEmp.department || 'zaal',
      statuut: newEmp.statuut,
      birthDate: newEmp.birthDate ? newEmp.birthDate : undefined,
      experience: newEmp.experience,
      color: chosenColor,
      textBgColor: `${parts[0]} ${parts[1]}`,
      textColor: parts[2],
      email: newEmp.email || '',
      phone: newEmp.phone || '',
      facebookUrl: newEmp.facebookUrl.trim() || undefined,
      active: true,
      firstLoginComplete: true,
      pin: newEmp.pin.trim() || '1234',
      role: newEmp.role || 'medewerker'
    });

    if (newEmp.role === 'beheerder') {
      setSixWeeksSuccessMsg(`👑 Beheerder ${newEmp.name} is succesvol toegevoegd met volledige beheerrechten en inlogtoegang!`);
      setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
    }

    setNewEmp({ name: '', department: 'zaal', statuut: 'Student', birthDate: '', experience: 'Beginner', email: '', phone: '', facebookUrl: '', pin: '1234', role: 'medewerker' });
    setShowEmployeeModal(false);
  };

  const handleBulkCreateEmployees = (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkNamesText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
    const bgs = [
      'bg-indigo-50 border-indigo-200 text-indigo-700',
      'bg-pink-50 border-pink-200 text-pink-700',
      'bg-amber-50 border-amber-200 text-amber-700',
      'bg-emerald-50 border-emerald-200 text-emerald-700',
      'bg-cyan-50 border-cyan-200 text-cyan-700',
      'bg-violet-50 border-violet-200 text-violet-700',
      'bg-rose-50 border-rose-200 text-rose-700',
      'bg-teal-50 border-teal-200 text-teal-700'
    ];

    names.forEach((name, idx) => {
      const globalIndex = employees.length + idx;
      const chosenColor = colors[globalIndex % colors.length];
      const bgStyles = bgs[globalIndex % bgs.length];
      const parts = bgStyles.split(' ');

      onAddEmployee({
        name,
        department: bulkDepartment || 'zaal',
        statuut: bulkStatuut,
        experience: bulkExperience,
        color: chosenColor,
        textBgColor: `${parts[0]} ${parts[1]}`,
        textColor: parts[2],
        email: '',
        phone: '',
        active: true,
        firstLoginComplete: true,
        pin: '1234',
        role: 'medewerker'
      });
    });

    setBulkNamesText('');
    setIsBulkMode(false);
    setShowEmployeeModal(false);
  };

  const handleStartEmployeeEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEditEmpName(emp.name);
    setEditEmpDepartment(emp.department || 'zaal');
    setEditEmpStatuut(emp.statuut);
    setEditEmpBirthDate(emp.birthDate || '');
    setEditEmpExperience(emp.experience);
    setEditEmpEmail(emp.email || '');
    setEditEmpPhone(emp.phone || '');
    setEditEmpFacebook(emp.facebookUrl || '');
    setEditEmpPin(emp.pin || '1234');
    setEditEmpRole(emp.role || 'medewerker');
  };

  const handleSaveEmployeeEdit = (emp: Employee) => {
    if (!editEmpName.trim()) {
      alert('Vul een naam in.');
      return;
    }
    if (editEmpStatuut === 'Student' && !editEmpBirthDate) {
      alert('Geboortedatum is verplicht voor studenten om de wetgeving voor minderjarigen (-18 jaar: max tot 23u00 & max 8u/dag) te handhaven.');
      return;
    }
    const cleanPin = editEmpPin.trim() || '1234';
    onUpdateEmployee({
      ...emp,
      name: editEmpName,
      department: editEmpDepartment,
      statuut: editEmpStatuut,
      birthDate: editEmpBirthDate ? editEmpBirthDate : undefined,
      experience: editEmpExperience,
      email: editEmpEmail,
      phone: editEmpPhone,
      facebookUrl: editEmpFacebook.trim() || undefined,
      pin: cleanPin,
      role: editEmpRole
    });
    setEditingEmployeeId(null);
  };

  const handleResetEmployeePin = (emp: Employee) => {
    onUpdateEmployee({
      ...emp,
      pin: '1234'
    });
    setSixWeeksSuccessMsg(`De pincode van ${emp.name} is succesvol gereset naar 1234!`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    onAddNotice({
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      author: 'Hans Stevens (Beheerder)'
    });

    setNewNotice({ title: '', content: '', category: 'planning' });
    setShowQuickNoticeModal(false);
    setSixWeeksSuccessMsg('Mededeling succesvol geplaatst! Je personeel ziet dit direct op hun portaal.');
    setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
  };

  // Smart Auto-scheduling algorithm enforcing the manager's exact staffing requirements:
  // - Overdag: 2 personen per dag
  // - Avond Ma & Di: 4 personen (waarvan 1 sluit en 1 hulpsluit)
  // - Avond Wo & Do: 5 personen (waarvan 1 sluit en 1 hulpsluit)
  // - Avond Vr, Za & Zo: 7 personen (waarvan 1 sluit en 1 hulpsluit)
  const handleAutoPlanClick = () => {
    // Check if there are employees to schedule
    const activeStaff = employees.filter(e => e.active !== false);
    if (!employees || employees.length === 0 || activeStaff.length === 0) {
      setShowNoTeamModal(true);
      return;
    }
    // Open in-app styled confirmation modal
    setShowAutoPlanConfirmModal(true);
  };

  const handleExecuteAutoPlan = () => {
    setShowAutoPlanConfirmModal(false);

    const activeStaff = employees.filter(e => e.active !== false);
    if (!employees || employees.length === 0 || activeStaff.length === 0) {
      setShowNoTeamModal(true);
      return;
    }

    // Generate the smart shifts for the week
    const newPlannedShifts = generateSmartAutoPlan(autoPlanWeek, employees, availabilities, false);

    if (newPlannedShifts.length === 0) {
      setShowNoTeamModal(true);
      return;
    }

    // Atomic update of shifts
    const otherWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) !== autoPlanWeek);
    const combinedShifts = [...otherWeekShifts, ...newPlannedShifts];

    if (onBatchUpdateShifts) {
      onBatchUpdateShifts(
        combinedShifts,
        `Slimme planning gegenereerd voor Week ${autoPlanWeek} (${newPlannedShifts.length} diensten: 2 overdag, 4/5/7 avond met sluit & hulpsluit)`
      );
    } else {
      // Fallback
      shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === autoPlanWeek).forEach(s => {
        onDeleteShift(s.id);
      });
      newPlannedShifts.forEach(s => {
        onAddShift(s);
      });
    }

    // Switch view to the planned week
    setSelectedManagerWeek(autoPlanWeek);
    setSixWeeksSuccessMsg(`Slimme planning voor Week ${autoPlanWeek} succesvol gegenereerd (${newPlannedShifts.length} diensten)!`);
    setTimeout(() => setSixWeeksSuccessMsg(null), 6000);
  };

  // Handler to apply schedule generated by Gemini AI
  const handleApplyGeminiProposal = (
    newShifts: Shift[],
    publishImmediately: boolean,
    targetWeek: number,
    aiSummary?: string
  ) => {
    const otherShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) !== targetWeek);
    const preparedShifts = newShifts.map(s => ({
      ...s,
      status: publishImmediately ? ('published' as const) : ('draft' as const)
    }));
    const combinedShifts = [...otherShifts, ...preparedShifts];

    setSelectedManagerWeek(targetWeek);
    if (onBatchUpdateShifts) {
      onBatchUpdateShifts(
        combinedShifts,
        `Gemini AI roostervoorstel toegepast voor Week ${targetWeek} (${preparedShifts.length} diensten, ${publishImmediately ? 'gepubliceerd' : 'ontwerp'})${aiSummary ? ` • ${aiSummary.slice(0, 100)}...` : ''}`
      );
    } else {
      shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWeek).forEach(s => onDeleteShift(s.id));
      preparedShifts.forEach(s => onAddShift(s));
    }
  };

  // Quick helper to populate standard sample team if the team list is currently empty
  const handleLoadSampleTeam = () => {
    setShowNoTeamModal(false);
    const sampleStaff: Omit<Employee, 'id'>[] = [
      { name: 'Pat', department: 'zaal', statuut: 'Vast', experience: 'Verantwoordelijke', contractDaysPerWeek: 4, color: '#3b82f6', textBgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', email: 'pat@example.be', phone: '0471 11 22 33', active: true, firstLoginComplete: true },
      { name: 'Matthias', department: 'zaal', statuut: 'Vast', experience: 'Verantwoordelijke', contractDaysPerWeek: 4, color: '#6366f1', textBgColor: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700', email: 'matthias@example.be', phone: '0472 22 33 44', active: true, firstLoginComplete: true },
      { name: 'Sophie De Smet', department: 'zaal', statuut: 'Student', experience: 'Ervaren', color: '#ec4899', textBgColor: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700', email: 'sophie@example.be', phone: '0473 33 44 55', active: true, firstLoginComplete: true },
      { name: 'Thomas Janssen', department: 'zaal', statuut: 'Student', experience: 'Gemiddeld', color: '#10b981', textBgColor: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', email: 'thomas@example.be', phone: '0474 44 55 66', active: true, firstLoginComplete: true },
      { name: 'Emma Claes', department: 'zaal', statuut: 'Student', experience: 'Ervaren', color: '#f59e0b', textBgColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', email: 'emma@example.be', phone: '0475 55 66 77', active: true, firstLoginComplete: true },
      { name: 'Lucas Wouters', department: 'zaal', statuut: 'Flexi', experience: 'Gemiddeld', color: '#8b5cf6', textBgColor: 'bg-violet-50 border-violet-200', textColor: 'text-violet-700', email: 'lucas@example.be', phone: '0476 66 77 88', active: true, firstLoginComplete: true },
      { name: 'Lotte Peeters', department: 'zaal', statuut: 'Student', experience: 'Beginner', color: '#06b6d4', textBgColor: 'bg-cyan-50 border-cyan-200', textColor: 'text-cyan-700', email: 'lotte@example.be', phone: '0477 77 88 99', active: true, firstLoginComplete: true },
      { name: 'Noah Maes', department: 'zaal', statuut: 'Flexi', experience: 'Ervaren', color: '#ef4444', textBgColor: 'bg-rose-50 border-rose-200', textColor: 'text-rose-700', email: 'noah@example.be', phone: '0478 88 99 00', active: true, firstLoginComplete: true },
      { name: 'Julie Jacobs', department: 'zaal', statuut: 'Student', experience: 'Beginner', color: '#14b8a6', textBgColor: 'bg-teal-50 border-teal-200', textColor: 'text-teal-700', email: 'julie@example.be', phone: '0479 99 00 11', active: true, firstLoginComplete: true },
      { name: 'Milan Willems', department: 'zaal', statuut: 'Student', experience: 'Gemiddeld', color: '#f97316', textBgColor: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700', email: 'milan@example.be', phone: '0470 12 34 56', active: true, firstLoginComplete: true },
      { name: 'Amber Mertens', department: 'zaal', statuut: 'Extra', experience: 'Gemiddeld', color: '#64748b', textBgColor: 'bg-slate-50 border-slate-200', textColor: 'text-slate-700', email: 'amber@example.be', phone: '0471 23 45 67', active: true, firstLoginComplete: true },
      { name: 'Sander Goossens', department: 'zaal', statuut: 'Student', experience: 'Beginner', color: '#a855f7', textBgColor: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', email: 'sander@example.be', phone: '0472 34 56 78', active: true, firstLoginComplete: true }
    ];

    sampleStaff.forEach(s => onAddEmployee(s));
  };

  // Helper to render statuut badge
  const renderStatuutBadge = (statuut: EmployeeStatuut, emp?: Employee) => {
    const is4Day = emp?.contractDaysPerWeek === 4 || (emp && (emp.name === "Pat" || emp.name.toLowerCase().includes("matthias") || emp.name.toLowerCase().includes("mathias")));
    const stylings: Record<EmployeeStatuut, string> = {
      Student: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Flexi: 'bg-amber-50 text-amber-800 border-amber-200',
      Vast: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      Extra: 'bg-rose-50 text-rose-800 border-rose-200'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black uppercase border ${stylings[statuut]}`}>
        {statuut} {is4Day ? '(4d)' : ''}
      </span>
    );
  };

  // Helper to render experience badge
  const renderExperienceBadge = (experience: ExperienceLevel) => {
    const stylings: Record<ExperienceLevel, string> = {
      Beginner: 'bg-slate-50 text-slate-800 border-slate-200',
      Gemiddeld: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      Ervaren: 'bg-pink-50 text-pink-800 border-pink-200',
      Verantwoordelijke: 'bg-purple-50 text-purple-800 border-purple-200'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black uppercase border ${stylings[experience]}`}>
        {experience}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ⚡ SNELLE ACTIES (QUICK ACTIONS) SECTIE */}
      <section 
        id="quick-actions-panel"
        aria-label="Snelle Acties"
        className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-slate-800 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-orange-500 text-white rounded-xl shadow-sm">
                <Zap size={16} className="fill-white" />
              </span>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Snelle Acties</span>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Snellere Workflow
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Directe knoppen voor dagelijks beheer • Actieve week: <strong className="text-orange-400 font-bold">Week {selectedManagerWeek}</strong> ({getWeekMeta(selectedManagerWeek).dateRange})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* 1. Directe knop: Nieuwe Dienst Aanmaken */}
            <button
              id="quick-action-create-shift-btn"
              type="button"
              onClick={handleOpenCreateShiftQuickAction}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer hover:shadow-lg"
              title="Open direct het venster om een nieuwe dienst aan te maken"
            >
              <CalendarPlus size={17} className="stroke-[2.5]" />
              <span>Nieuwe Dienst Aanmaken</span>
            </button>

            {/* Directe knop: Openstaande Dienst Instellen */}
            <button
              id="quick-action-create-open-shift-btn"
              type="button"
              onClick={() => {
                setSelectedShift({
                  isNew: true,
                  isOpenShift: true,
                  weekNumber: selectedManagerWeek,
                  department: activeSubTab === 'keuken' ? 'keuken' : 'zaal',
                  employeeId: employees[0]?.id || '',
                  startTime: '11:30',
                  endTime: activeSubTab === 'keuken' ? '23:00' : '01:00',
                  day: 4, // Vrijdag
                  status: 'published',
                  acknowledged: false,
                  notes: 'Openstaande dienst: wie kan er inspringen? Schrijf je direct in!'
                });
                setShowShiftModal(true);
              }}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer hover:shadow-lg"
              title="Stel direct een openstaande dienst in waarop medewerkers kunnen intekenen via het Ruilbord"
            >
              <Megaphone size={17} className="stroke-[2.5]" />
              <span>Open Dienst Instellen 📢</span>
            </button>

            {/* Directe knop: Shift-Herinneringen Komende Werkdag */}
            <button
              id="quick-action-shift-reminders-btn"
              type="button"
              onClick={() => setShowShiftReminderModal(true)}
              className="px-4 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all duration-150 cursor-pointer hover:shadow-lg"
              title="Stuur met 1 klik een shift-herinnering naar medewerkers ter voorbereiding op de komende werkdag"
            >
              <BellRing size={17} className="stroke-[2.5] animate-pulse" />
              <span>Herinneringen Werkdag 🔔</span>
            </button>

            {/* 2. Directe knop: Mededeling Plaatsen */}
            <button
              id="quick-action-post-notice-btn"
              type="button"
              onClick={() => setShowQuickNoticeModal(true)}
              className="px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-750 text-white font-black text-xs uppercase tracking-tight rounded-xl border border-slate-700 hover:border-orange-500/60 shadow-sm flex items-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Plaats direct een mededeling voor het personeelsteam"
            >
              <Megaphone size={17} className="text-orange-400 stroke-[2.5]" />
              <span>Mededeling Plaatsen</span>
            </button>

            {/* Directe knop: Deel Rooster via WhatsApp / Messenger */}
            {onShareWhatsAppSchedule && (
              <button
                id="quick-action-whatsapp-schedule-btn"
                type="button"
                onClick={() => onShareWhatsAppSchedule(selectedManagerWeek)}
                className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer hover:shadow-lg"
                title="Deel de actuele weekplanning direct via WhatsApp of Facebook Messenger in de teamgroep"
              >
                <MessageSquare size={17} className="stroke-[2.5]" />
                <span>Deel Rooster (WhatsApp / Messenger) 💬</span>
              </button>
            )}

            {/* Quick jump to notice board if there are active notices */}
            {notices.length > 0 && (
              <button
                id="quick-action-view-board-btn"
                type="button"
                onClick={() => setActiveSubTab('berichten')}
                className="px-3 py-2.5 sm:py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700/60 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Bekijk alle actieve mededelingen op het prikbord"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">Prikbord ({notices.length})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Overview Stat Cards - Vibrant Palette Theme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100 shrink-0">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-orange-650 text-orange-600 font-extrabold uppercase tracking-wide">Aantal diensten</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalShiftsCount}</h3>
            <p className="text-xs text-slate-500">{publishedShiftsCount} gepubliceerd • {loggedDraftShiftsCount} draft</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-100 shrink-0">
            <FileCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">Gezien/Bevestigd</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{confirmationRate}%</h3>
            <p className="text-xs text-slate-500">{confirmedShiftsCount} van de {publishedShiftsCount} bevestigd</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-100 relative shrink-0">
            <ArrowLeftRight size={24} />
            {loggedPendingSwapsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] text-white font-black rounded-full flex items-center justify-center border border-white animate-pulse">!</span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wide">Ruilverzoeken</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{loggedPendingSwapsCount} openstaand</h3>
            <p className="text-xs text-slate-500">Wacht op jouw actie</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 flex items-center space-x-4">
          <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg shadow-pink-100 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] text-pink-600 font-extrabold uppercase tracking-wide">Actief Personeel</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{employees.length}</h3>
            <p className="text-xs text-slate-500">Aantal medewerkers</p>
          </div>
        </div>
      </div>

      {/* Draft shifts bar - Vibrant Palette Theme */}
      {loggedDraftShiftsCount > 0 ? (
        <div className="bg-orange-100 rounded-3xl border-2 border-orange-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3 text-orange-950">
            <CircleAlert size={20} className="shrink-0 text-orange-600" />
            <div>
              <p className="font-extrabold text-sm uppercase tracking-tight">
                Je hebt {loggedDraftShiftsCount} niet-gepubliceerde diensten in ontwerp voor Week {selectedManagerWeek}
              </p>
              <p className="text-xs text-orange-850">
                Je medewerkers kunnen deze diensten pas zien zodra je ze officieel publiceert.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button 
              onClick={() => onPublishAllDrafts(selectedManagerWeek)}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-2 shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer"
            >
              <CheckCheck size={16} />
              <span>Publiceer Week {selectedManagerWeek} Rooster ({loggedDraftShiftsCount})</span>
            </button>
            {onShareWhatsAppSchedule && (
              <button 
                type="button"
                onClick={() => onShareWhatsAppSchedule(selectedManagerWeek)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 shrink-0 cursor-pointer"
                title="Deel de planning direct via WhatsApp of Facebook Messenger"
              >
                <MessageSquare size={15} />
                <span>Deel WhatsApp / Messenger</span>
              </button>
            )}
          </div>
        </div>
      ) : totalDraftShiftsCount > 0 ? (
        <div className="bg-amber-50 rounded-3xl border-2 border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-950">
            <CircleAlert size={20} className="shrink-0 text-amber-600" />
            <div>
              <p className="font-extrabold text-sm uppercase tracking-tight">
                Week {selectedManagerWeek} is up-to-date! Er zijn nog {totalDraftShiftsCount} concepten in andere weken.
              </p>
              <p className="text-xs text-amber-850">
                Wil je alle resterende ontwerp-diensten over alle weken tegelijk publiceren?
              </p>
            </div>
          </div>
          <button 
            onClick={() => onPublishAllDrafts()}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-2 shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer"
          >
            <CheckCheck size={16} />
            <span>Publiceer Alle Concepten ({totalDraftShiftsCount})</span>
          </button>
        </div>
      ) : null}

      {/* Sub Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-100 p-1 flex flex-wrap gap-1 md:gap-0">
        <button
          onClick={() => setActiveSubTab('zaal')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer ${
            activeSubTab === 'zaal' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <CalendarIcon size={16} />
          <span>Planning & Rooster</span>
        </button>
        <button
          onClick={() => setActiveSubTab('beschikbaarheid')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer ${
            activeSubTab === 'beschikbaarheid' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Sparkles size={16} className="text-amber-500 fill-amber-300" />
          <span>Beschikbaarheden</span>
          <span className="hidden xl:inline-block text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-black">Alleen Beheerder</span>
        </button>
        <button
          onClick={() => setShowNotificationModal(true)}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer text-slate-700 hover:bg-emerald-50 hover:text-emerald-800`}
          title="Verstuur diensten via WhatsApp of exporteer naar Outlook"
        >
          <Share2 size={16} className="text-emerald-600" />
          <span>Notificaties & Delen</span>
        </button>
        <button
          onClick={() => setShowBackupModal(true)}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer text-slate-700 hover:bg-orange-50 hover:text-orange-850`}
          title="Bekijk de cloud backup van alle beschikbaarheden en definitieve planningen"
        >
          <Database size={16} className="text-orange-600" />
          <span>Backups & Archief</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveSubTab('verzoeken')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition relative active:scale-95 cursor-pointer ${
            activeSubTab === 'verzoeken' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <ArrowLeftRight size={16} />
          <span>Ruilverzoeken</span>
          {loggedPendingSwapsCount > 0 && (
            <span className="shrink-0 ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-black">
              {loggedPendingSwapsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('berichten')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer ${
            activeSubTab === 'berichten' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Megaphone size={16} />
          <span>Meldingsbord</span>
        </button>
        <button
          onClick={() => setActiveSubTab('team')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer ${
            activeSubTab === 'team' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Users size={16} />
          <span>Personeel</span>
        </button>
      </div>

      {/* Content Areas */}

      {/* 1. PLANNING TAB */}
      {(activeSubTab === 'zaal' || activeSubTab === 'keuken') && (() => {
        const activeDept: Department = 'zaal';
        const isZaal = true;
        const deptEmployees = sortEmployeesByFirstName(
          employees.filter(emp => {
            const matchStatuut = selectedStatuutFilter === 'all' || emp.statuut === selectedStatuutFilter;
            const matchExperience = selectedExperienceFilter === 'all' || emp.experience === selectedExperienceFilter;
            return matchStatuut && matchExperience;
          })
        );

        return (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Weekplanning & Rooster (In De Molen)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300">
                  📋 Alle Medewerkers ({deptEmployees.length})
                </span>
              </div>
              <p className="text-xs text-orange-600 font-bold uppercase">
                Centraal weekrooster voor alle medewerkers • Klik op een vak om in te plannen
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedStatuutFilter}
                onChange={(e) => setSelectedStatuutFilter(e.target.value as any)}
                className="bg-white border-2 border-orange-100 rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">Alle Statuten</option>
                <option value="Student">Student</option>
                <option value="Flexi">Flexi</option>
                <option value="Vast">Vast</option>
                <option value="Extra">Extra</option>
              </select>

              <select
                value={selectedExperienceFilter}
                onChange={(e) => setSelectedExperienceFilter(e.target.value as any)}
                className="bg-white border-2 border-orange-100 rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">Alle Ervaring</option>
                <option value="Beginner">Beginner</option>
                <option value="Gemiddeld">Gemiddeld</option>
                <option value="Ervaren">Ervaren</option>
                <option value="Verantwoordelijke">Verantwoordelijke</option>
              </select>

              <button
                type="button"
                onClick={() => setShowGeminiModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer tracking-tight"
                title="Genereer een AI roostervoorstel via Gemini API op basis van beschikbaarheid"
              >
                <Bot size={16} className="text-slate-950" />
                <span>Gemini AI Voorstel ✨</span>
              </button>

              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer tracking-tight"
                  title="Deel de planning en link met het team via WhatsApp of directe URL"
                >
                  <Share2 size={15} />
                  <span>Delen met Team 🔗</span>
                </button>
              )}

              <button
                onClick={() => setShowNotificationModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer tracking-tight"
                title="Notificeer personeel via WhatsApp of exporteer naar Outlook"
              >
                <Share2 size={15} />
                <span>📲 Personeel Notificeren</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSchedulePrintModal(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer tracking-tight"
                title="Print het huidige weekrooster in een strak, print-vriendelijk formaat voor in de keuken van het café"
              >
                <Printer size={15} />
                <span>Print PDF 🖨️</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('beschikbaarheid')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer tracking-tight"
                title="Bekijk de visuele Recharts grafiek van de personeelsbeschikbaarheid per dag"
              >
                <BarChart3 size={15} />
                <span>Beschikbaarheid Grafiek 📊</span>
              </button>

              <button
                onClick={() => {
                  setSelectedShift({
                    isNew: true,
                    employeeId: deptEmployees[0]?.id || employees[0]?.id || '',
                    department: activeDept,
                    weekNumber: selectedManagerWeek,
                    day: 0,
                    startTime: '17:00',
                    endTime: '01:00',
                    notes: '',
                    status: 'draft',
                    acknowledged: false
                  });
                  setShowShiftModal(true);
                }}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 tracking-tight cursor-pointer"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Nieuwe Dienst +</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedShift({
                    isNew: true,
                    isOpenShift: true,
                    employeeId: deptEmployees[0]?.id || employees[0]?.id || '',
                    department: activeDept,
                    weekNumber: selectedManagerWeek,
                    day: 4, // Vrijdag
                    startTime: '11:30',
                    endTime: '01:00',
                    notes: 'Openstaande dienst: wie kan er inspringen? Schrijf je direct in!',
                    status: 'published',
                    acknowledged: false
                  });
                  setShowShiftModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 tracking-tight cursor-pointer"
                title="Stel direct een openstaande dienst in waarop medewerkers kunnen intekenen via het Ruilbord"
              >
                <Megaphone size={15} className="stroke-[2.5]" />
                <span>Open Dienst Instellen 📢</span>
              </button>
            </div>
          </div>

          {/* Interactive Shift-Herinnering Toast Banner */}
          {reminderToast && (
            <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 shadow-xs ring-2 ring-amber-250">
                  <BellRing size={20} className="animate-bounce stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-tight text-amber-950">
                      Shift-Herinnering Verstuurd naar {reminderToast.employeeName}!
                    </p>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      {reminderToast.department}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-0.5">
                    Dienst op <strong>{reminderToast.dayName} ({reminderToast.dateStr})</strong> van <strong>{reminderToast.timeStr}</strong>. Notificatie is direct klaargezet in het personeelsportaal.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {reminderToast.whatsAppUrl && (
                  <a
                    href={reminderToast.whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    title={`Open direct in WhatsApp voor ${reminderToast.phone}`}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Bericht</span>
                  </a>
                )}
                <button 
                  type="button" 
                  onClick={() => setReminderToast(null)}
                  className="p-1.5 hover:bg-amber-200/80 rounded-xl text-amber-800 text-xs font-bold cursor-pointer transition"
                  title="Sluiten"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Success message banner for 6-weeks actions */}
          {sixWeeksSuccessMsg && (
            <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 text-white rounded-2xl shrink-0">
                  <CheckCheck size={18} />
                </div>
                <p className="text-xs font-bold leading-relaxed">{sixWeeksSuccessMsg}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSixWeeksSuccessMsg(null)}
                className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-800 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* 6-WEKEN HORIZON KAART: Telkens 6 weken vooruit klaargezet */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-3xl p-5 text-white shadow-lg border-2 border-orange-400">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-white/20 rounded-xl text-lg">🗓️</span>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>6-Weken Planning Horizon (W{UPCOMING_SIX_WEEKS_FROM_NEXT[0]} t/m W{UPCOMING_SIX_WEEKS_FROM_NEXT[UPCOMING_SIX_WEEKS_FROM_NEXT.length - 1]})</span>
                    <span className="bg-white text-orange-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Telkens 6 Weken Vooruit
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-orange-100 font-medium max-w-2xl leading-relaxed">
                  Vanaf volgende week (Week {NEXT_WEEK_NUMBER}) zijn de werkplanningen 6 weken vooruit klaargezet en ingevuld voor zowel <strong>Zaal als Keuken</strong>. Personeel kan hun shifts vroegtijdig bekijken en beschikbaarheden tijdig doorgeven.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePrepareSixWeeksHorizon(false, false)}
                  className="px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-700 text-xs font-black uppercase rounded-2xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Controleer en vul alle 6 weken vooruit aan met complete, gebalanceerde roosters"
                >
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Bereid 6 Weken Voor</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishAllSixWeeks}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase rounded-2xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Publiceer alle concept-diensten in de 6-weken horizon direct voor het personeel"
                >
                  <Megaphone size={15} />
                  <span>Publiceer 6 Weken</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSixWeeksModal(true)}
                  className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-black uppercase rounded-2xl transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Bekijk de details en statistieken van alle 6 weken op een rij"
                >
                  <FileText size={15} />
                  <span>Overzicht 6 Weken</span>
                </button>
              </div>
            </div>

            {/* Quick mini-pills for each of the 6+ weeks */}
            <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {UPCOMING_SIX_WEEKS_FROM_NEXT.map((wk) => {
                const meta = getWeekMeta(wk);
                const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === wk);
                const draftCount = weekShifts.filter(s => s.status === 'draft').length;
                const isSelected = selectedManagerWeek === wk;
                const isPublished = weekShifts.length > 0 && draftCount === 0;

                return (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => {
                      setSelectedManagerWeek(wk);
                      setAutoPlanWeek(wk);
                    }}
                    className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white text-orange-900 shadow-md ring-2 ring-white scale-[1.03]'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-black uppercase ${isSelected ? 'text-orange-600' : 'text-orange-200'}`}>
                        W{wk}
                      </span>
                      {wk === NEXT_WEEK_NUMBER && (
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                          isSelected ? 'bg-orange-500 text-white' : 'bg-white text-orange-700'
                        }`}>
                          Volgende
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] font-bold truncate ${isSelected ? 'text-slate-600' : 'text-orange-100'}`}>
                      {meta.dateRange.split('–')[0]?.trim()}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/15">
                      <span className={`text-[11px] font-black ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                        {weekShifts.length} shifts
                      </span>
                      <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-300 animate-pulse'}`} title={isPublished ? 'Gepubliceerd' : `${draftCount} concepten`}></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Week Selector Bar - "Vanaf volgende week" selector */}
          <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-orange-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-sm">
                <CalendarIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Weekrooster Selectie
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    isCurrentWeekSelectedArchived
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {isCurrentWeekSelectedArchived ? `📦 Week ${selectedManagerWeek} (Archief)` : `Week ${selectedManagerWeek} actief`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {getWeekMeta(selectedManagerWeek).label} • {getWeekMeta(selectedManagerWeek).dateRange}
                </p>
              </div>
            </div>

            {/* Week pill buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              {activeWeeks.map((w) => {
                const isSelected = selectedManagerWeek === w.weekNumber;
                const weekShiftCount = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === w.weekNumber).length;
                const weekDraftCount = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === w.weekNumber && s.status === 'draft').length;

                return (
                  <button
                    key={w.weekNumber}
                    type="button"
                    onClick={() => {
                      setSelectedManagerWeek(w.weekNumber);
                      setAutoPlanWeek(w.weekNumber);
                    }}
                    className={`px-3 py-2 rounded-2xl text-xs font-black uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300 scale-[1.02]'
                        : 'bg-orange-50/80 hover:bg-orange-100 text-slate-700 border border-orange-200'
                    }`}
                  >
                    <span>{w.shortLabel}</span>
                    {w.isUpcoming && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                      }`}>
                        Vanaf volgend
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {weekShiftCount}
                    </span>
                    {weekDraftCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${weekDraftCount} ontwerp-diensten`}></span>
                    )}
                  </button>
                );
              })}

              {/* Add Next Week Button */}
              <button
                type="button"
                onClick={handleAddNewWeek}
                className="px-3 py-2 rounded-2xl text-xs font-black uppercase bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1 transition cursor-pointer shadow-sm"
                title="Voeg automatisch de volgende week toe aan de planning"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>+ Week</span>
              </button>

              {/* Archive Dropdown Toggle */}
              {archivedWeeks.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowArchiveMenu(prev => !prev)}
                    className="px-3 py-2 rounded-2xl text-xs font-black uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                    title="Bekijk oudere gearchiveerde weken"
                  >
                    <Archive size={14} className="text-slate-500" />
                    <span>Archief ({archivedWeeks.length})</span>
                  </button>

                  {showArchiveMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 tracking-wider border-b border-slate-100">
                        📦 Gearchiveerde Weken
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                        {archivedWeeks.map((aw) => {
                          const isSel = selectedManagerWeek === aw.weekNumber;
                          const shiftCount = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === aw.weekNumber).length;
                          return (
                            <button
                              key={aw.weekNumber}
                              type="button"
                              onClick={() => {
                                setSelectedManagerWeek(aw.weekNumber);
                                setAutoPlanWeek(aw.weekNumber);
                                setShowArchiveMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                isSel ? 'bg-amber-100 text-amber-900 font-black' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <div>Week {aw.weekNumber}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{aw.dateRange}</div>
                              </div>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {shiftCount} shifts
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick helper: copy previous week & clear week & print PDF */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSchedulePrintModal(true)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black uppercase rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                title={`Print Week ${selectedManagerWeek} als strakke PDF voor in de keuken van het café`}
              >
                <Printer size={14} className="text-rose-600" />
                <span>Print PDF (Keuken/Café)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPreviousWeekRoster}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title={`Kopieer diensten van Week ${selectedManagerWeek - 1} naar Week ${selectedManagerWeek}`}
              >
                <RotateCcw size={14} />
                <span>Kopieer W{selectedManagerWeek - 1}</span>
              </button>

              <button
                type="button"
                onClick={handleClearWeekRoster}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-rose-200"
                title={`Wis alle ingevulde diensten in Week ${selectedManagerWeek}`}
              >
                <Trash2 size={14} className="text-rose-600" />
                <span>Wis W{selectedManagerWeek}</span>
              </button>
            </div>
          </div>

          {/* Banner when viewing an archived week */}
          {isCurrentWeekSelectedArchived && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 text-amber-800 rounded-xl">
                  <Archive size={18} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide">
                    📦 Je bekijkt een gearchiveerde week: Week {selectedManagerWeek} ({getWeekMeta(selectedManagerWeek).dateRange})
                  </div>
                  <div className="text-xs text-amber-700 font-medium">
                    Oudere weken worden automatisch gearchiveerd. Je kunt de historie nog steeds inzien en exporteren.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedManagerWeek(CURRENT_WEEK_NUMBER);
                  setAutoPlanWeek(CURRENT_WEEK_NUMBER);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
              >
                Naar Huidige Week (W{CURRENT_WEEK_NUMBER})
              </button>
            </div>
          )}

          {/* Slimme Auto-Planner Control Card */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl border-2 border-orange-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl animate-pulse">⚡</span>
                  <h3 className="text-base font-black uppercase tracking-tight">Slimme Auto-Planner</h3>
                </div>
                <p className="text-xs text-orange-100 font-bold max-w-3xl leading-relaxed">
                  Genereer automatisch een optimaal werkschema: <strong>Overdag 2 personen</strong>, 's avonds <strong>Ma & Di: 4 pers.</strong>, <strong>Wo & Do: 5 pers.</strong>, <strong>Vr, Za & Zo: 7 pers.</strong> (waarvan <strong>1 sluit</strong> en <strong>1 hulpsluit</strong>). Respecteert ingediende beschikbaarheden, gewenste uren en contractlimieten.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <div className="flex flex-col text-left space-y-1">
                  <label className="text-[10px] font-black uppercase text-orange-200">Gebruik Beschikbaarheid:</label>
                  <select
                    value={autoPlanWeek}
                    onChange={(e) => setAutoPlanWeek(parseInt(e.target.value))}
                    className="bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none cursor-pointer transition"
                  >
                    {activeWeeks.map((w) => (
                      <option key={w.weekNumber} className="text-slate-800 font-bold" value={w.weekNumber}>
                        Week {w.weekNumber} ({w.dateRange.split('–')[0]?.trim()}) {w.isNext ? '• Volgende week' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGeminiModal(true)}
                  className="px-5 py-3.5 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-slate-900 text-xs font-black uppercase rounded-2xl shadow-lg transition duration-100 active:scale-95 cursor-pointer mt-auto border-0 flex items-center gap-2"
                  title="Genereer een slim voorstel voor het weekrooster via de server-side Gemini API"
                >
                  <Bot size={16} className="text-orange-700" />
                  <span>Gemini AI Voorstel ✨</span>
                </button>

                <button
                  onClick={handleAutoPlanClick}
                  className="px-5 py-3.5 bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 text-xs font-black uppercase rounded-2xl shadow-lg transition duration-100 active:scale-95 cursor-pointer mt-auto border-0"
                >
                  Genereer Planning 🪄
                </button>
              </div>
            </div>
          </div>

          {/* Planning Voortgang Status Bar */}
          {(() => {
            const currentWeekShifts = shifts.filter(s => 
              (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek && 
              (!activeDept || s.department === activeDept)
            );
            const openCount = currentWeekShifts.filter(s => s.isOpenShift).length;
            const draftCount = currentWeekShifts.filter(s => !s.isOpenShift && s.status === 'draft').length;
            const publishedCount = currentWeekShifts.filter(s => !s.isOpenShift && s.status === 'published').length;
            const acknowledgedCount = currentWeekShifts.filter(s => s.acknowledged).length;

            return (
              <div className="bg-white rounded-3xl p-4 border-2 border-orange-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-1.5">
                    <span>📊 Voortgang Week {selectedManagerWeek}</span>
                    <span className="text-slate-500 font-bold text-[11px]">({isZaal ? 'Zaal' : 'Keuken'})</span>:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Open Chip */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs" title="Openstaande shiften waarop personeel kan intekenen">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{openCount} Open</span>
                  </span>

                  {/* Ontwerp Chip */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs" title="Concept-shiften die nog niet definitief gepubliceerd zijn">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{draftCount} Ontwerp</span>
                  </span>

                  {/* Gepubliceerd Chip */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs" title="Gepubliceerde shiften, zichtbaar voor medewerkers">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{publishedCount} Gepubliceerd</span>
                    {publishedCount > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold ml-0.5" title="Waarvan gezien door medewerker">
                        ({acknowledgedCount} ✓)
                      </span>
                    )}
                  </span>

                  <span className="text-[11px] font-bold text-slate-400 pl-1">
                    Totaal: {currentWeekShifts.length}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Grid view - Vibrant Palette Style with Sticky Column (Names) and Sticky Row (Days) */}
          <div className="bg-white rounded-3xl shadow-md border-2 border-orange-100 overflow-hidden flex flex-col">
            <div className="overflow-auto max-h-[75vh] relative">
              <table className="min-w-full table-fixed border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-orange-50 shadow-xs">
                  <tr>
                    <th className="sticky left-0 top-0 z-30 w-52 min-w-[210px] max-w-[210px] px-4 py-3.5 text-left text-xs font-black text-slate-700 uppercase tracking-wider bg-orange-50 border-b-2 border-r-2 border-orange-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between">
                        <span>Medewerker ({isZaal ? 'Zaal' : 'Keuken'})</span>
                        <span className="text-[9px] font-black text-orange-700 bg-orange-200/80 px-1.5 py-0.5 rounded-md normal-case">
                          📌
                        </span>
                      </div>
                    </th>
                    {DAYS_OF_WEEK.map((day, dIdx) => {
                      const dayDateInfo = getDayDateInfo(selectedManagerWeek, dIdx);
                      const eveningTarget = dIdx <= 1 ? 4 : dIdx <= 3 ? 5 : 7;
                      return (
                        <th key={day} className="px-3 py-3 text-left text-xs font-black text-slate-700 uppercase tracking-wider border-b-2 border-r-2 border-orange-200 min-w-[145px] bg-orange-50/90">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-black text-xs text-slate-800 tracking-tight">{day}</span>
                            <span className="text-[11px] font-black text-orange-950 bg-orange-200/90 border border-orange-300 px-2 py-0.5 rounded-lg shadow-2xs">
                              {dayDateInfo.shortDate}
                            </span>
                          </div>
                          <div className="text-[9px] font-semibold text-slate-500 normal-case mt-0.5">
                            2 overdag • {eveningTarget} avond
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* RIJ: OPENSTAANDE SHIFTEN WAAR MEDEWERKERS ZICHZELF KUNNEN INVULLEN */}
                  <tr className="bg-amber-50/60 hover:bg-amber-100/40 transition-colors border-b-2 border-amber-300">
                    {/* Sticky Column: Open Diensten Badge */}
                    <td className="sticky left-0 z-10 w-52 min-w-[210px] max-w-[210px] px-4 py-3.5 whitespace-nowrap bg-amber-100/95 border-r-2 border-b-2 border-amber-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 ring-2 ring-amber-300">
                          📢
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-amber-950 uppercase tracking-tight">Open Shiften</span>
                            <span className="text-[9px] bg-amber-300 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase">Zelf invullen</span>
                          </div>
                          <div className="text-[10px] font-bold text-amber-800 truncate">
                            Medewerkers plannen zichzelf in
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Columns */}
                    {DAYS_OF_WEEK.map((day, dayIdx) => {
                      const dayOpenShifts = shifts.filter(s =>
                        (s.isOpenShift || s.employeeId === 'open_shift') &&
                        s.day === dayIdx &&
                        (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek &&
                        (s.department === (isZaal ? 'zaal' : 'keuken') || !s.department)
                      );

                      return (
                        <td key={`open-col-${dayIdx}`} className="px-2 py-2.5 border-r border-b border-amber-200 align-top bg-amber-50/30 min-w-[135px]">
                          <div className="space-y-1.5 min-h-[64px] flex flex-col justify-start">
                            {dayOpenShifts.map((sh) => {
                              const swap = swapRequests.find(r => r.shiftId === sh.id);
                              const candidatesCount = swap?.candidates?.length || 0;
                              const assignedEmp = sh.employeeId && sh.employeeId !== 'open_shift' ? employees.find(e => e.id === sh.employeeId) : null;

                              return (
                                <div
                                  key={sh.id}
                                  onClick={() => handleOpenEditShift(sh)}
                                  className="p-2 rounded-xl text-left border-2 border-amber-400 bg-amber-100/80 hover:bg-amber-200/90 hover:border-amber-500 shadow-xs cursor-pointer transition relative group/openshift"
                                  title="Klik om deze openstaande shift te bewerken of toe te wijzen"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                                      <Clock size={11} className="text-amber-700 shrink-0" />
                                      {sh.startTime} - {sh.endTime}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 font-black uppercase rounded bg-amber-500 text-white shadow-2xs">
                                      Open
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 mt-1">
                                    <span className="truncate max-w-[85px]">
                                      {assignedEmp ? `${assignedEmp.name.split(' ')[0]}` : 'Open (iedereen)'}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                      candidatesCount > 0 ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200/80 text-amber-900'
                                    }`}>
                                      {candidatesCount > 0 ? `👥 ${candidatesCount}` : '⏳ Open'}
                                    </span>
                                  </div>

                                  {sh.notes && (
                                    <p className="text-[9.5px] italic text-amber-800 line-clamp-1 mt-0.5">
                                      {sh.notes}
                                    </p>
                                  )}
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => {
                                setShiftValidationError(null);
                                setSelectedShift({
                                  isNew: true,
                                  weekNumber: selectedManagerWeek,
                                  day: dayIdx,
                                  department: isZaal ? 'zaal' : 'keuken',
                                  isOpenShift: true,
                                  employeeId: 'open_shift',
                                  status: 'published',
                                  startTime: '17:00',
                                  endTime: '01:00',
                                  notes: 'Openstaande shift: wie kan er inspringen? Schrijf je direct in!'
                                });
                                setShowShiftModal(true);
                              }}
                              className="w-full py-1 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200 border border-dashed border-amber-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 mt-auto"
                              title={`Nieuwe openstaande shift openzetten voor ${day}`}
                            >
                              <Plus size={11} className="stroke-[3]" />
                              <span>+ Open Dienst</span>
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {deptEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-xs font-bold text-slate-400 uppercase border-b border-orange-100">
                        Geen medewerkers gevonden in afdeling {isZaal ? 'Zaal' : 'Keuken'} met de geselecteerde filters.
                      </td>
                    </tr>
                  ) : (
                    deptEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-orange-50/20 transition-colors group">
                        {/* Employee Info Column - Sticky */}
                        <td className="sticky left-0 z-10 w-52 min-w-[210px] max-w-[210px] px-4 py-4 whitespace-nowrap bg-white group-hover:bg-orange-50/90 border-r-2 border-b border-orange-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] transition-colors">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shadow-sm text-white uppercase ring-2 ring-orange-200 border border-white shrink-0"
                              style={{ backgroundColor: emp.color }}
                            >
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                              ) : (
                                emp.name.split(' ').map(n => n[0]).join('')
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-black text-slate-800 truncate" title={emp.name}>{emp.name}</div>
                              <div className="text-[10px] font-black text-orange-600 uppercase tracking-wide truncate">{emp.statuut} ({emp.experience})</div>
                            </div>
                          </div>
                        </td>

                        {/* Days columns */}
                        {DAYS_OF_WEEK.map((day, dayIdx) => {
                          const dayShifts = shifts.filter(s => 
                            s.employeeId === emp.id && 
                            s.day === dayIdx &&
                            (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedManagerWeek
                          );
                          const empAvailResult = getEffectiveEmployeeAvailability(emp, selectedManagerWeek, availabilities);
                          const empDayAvail = empAvailResult.availability?.days.find(d => d.day === dayIdx);
                          return (
                            <td key={dayIdx} className="px-2 py-3 border-r border-b border-orange-100 align-top min-h-[96px] min-w-[135px]">
                            <div className="space-y-2 min-h-[64px] flex flex-col justify-start">
                              {dayShifts.map((sh) => {
                                const candidatesCount = swapRequests.find(r => r.shiftId === sh.id)?.candidates?.length || 0;
                                return (
                                <div
                                  key={sh.id}
                                  onClick={() => handleOpenEditShift(sh)}
                                  className={`p-2.5 rounded-2xl text-left border cursor-pointer transition relative group/shift hover:shadow-md ${emp.textBgColor} ${
                                    sh.isOpenShift 
                                      ? 'border-2 border-amber-400 bg-amber-50/60 ring-1 ring-amber-300/70 shadow-xs' 
                                      : sh.status === 'draft' 
                                        ? 'border-2 border-dashed border-slate-300 bg-slate-50/80 opacity-90' 
                                        : 'border border-emerald-200/90 bg-white/95 hover:border-emerald-300 shadow-2xs'
                                  }`}
                                >
                                  {/* Shift times and quick action buttons */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                      <Clock size={11} className="inline opacity-70 text-slate-500" />
                                      {sh.startTime} - {sh.endTime}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* 1-Click Shift-Herinnering Knop */}
                                      {!sh.isOpenShift && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendSingleShiftReminder(sh);
                                          }}
                                          className={`p-0.5 rounded transition cursor-pointer ${
                                            sh.lastReminderSentAt
                                              ? 'text-amber-800 bg-amber-100 hover:bg-amber-200 ring-1 ring-amber-300'
                                              : 'opacity-0 group-hover/shift:opacity-100 hover:bg-amber-100 text-amber-700'
                                          }`}
                                          title={sh.lastReminderSentAt 
                                            ? `Herinnering verstuurd om ${new Date(sh.lastReminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Klik om opnieuw te sturen.` 
                                            : `Stuur met 1 klik een shift-herinnering naar ${emp.name} ter voorbereiding op de werkdag`
                                          }
                                        >
                                          <Bell size={11} className={sh.lastReminderSentAt ? 'fill-amber-600 text-amber-700' : 'stroke-[2.5]'} />
                                        </button>
                                      )}
                                      {onOpenShiftForSwap && !sh.isOpenShift && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenShiftForSwap(sh.id, sh.notes || 'Openstaande dienst: wie kan er inspringen?');
                                            setSixWeeksSuccessMsg(`📢 Dienst op ${DAYS_OF_WEEK[sh.day]} opengesteld voor intekening op het Ruilbord!`);
                                            setTimeout(() => setSixWeeksSuccessMsg(null), 4000);
                                          }}
                                          className="opacity-0 group-hover/shift:opacity-100 p-0.5 hover:bg-amber-200 text-amber-800 rounded transition cursor-pointer"
                                          title="Stel deze dienst direct open voor intekening op het Ruilbord"
                                        >
                                          <Megaphone size={11} className="stroke-[2.5]" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteShift(sh.id);
                                          setSixWeeksSuccessMsg(`Dienst verwijderd voor ${emp.name}`);
                                          setTimeout(() => setSixWeeksSuccessMsg(null), 3000);
                                        }}
                                        className="opacity-0 group-hover/shift:opacity-100 p-0.5 hover:bg-rose-200 text-rose-700 rounded transition cursor-pointer"
                                        title="Dienst direct wissen"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Visuele Status Indicator Chip: 'Open', 'Ontwerp', 'Gepubliceerd' */}
                                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                    {sh.isOpenShift ? (
                                      <span 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveSubTab('verzoeken');
                                        }}
                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs transition cursor-pointer"
                                        title="Openstaande dienst op het ruilbord. Klik om kandidaten te bekijken."
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span>Open</span>
                                        {candidatesCount > 0 ? (
                                          <span className="text-[8px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-extrabold ml-0.5">
                                            {candidatesCount} kand.
                                          </span>
                                        ) : null}
                                      </span>
                                    ) : sh.status === 'draft' ? (
                                      <span 
                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs"
                                        title="Ontwerp status: conceptversie, nog niet gepubliceerd"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span>Ontwerp</span>
                                      </span>
                                    ) : (
                                      <span 
                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                                        title="Gepubliceerd: definitief ingepland en zichtbaar voor personeel"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Gepubliceerd</span>
                                        {sh.acknowledged ? (
                                          <span className="text-emerald-700 font-black text-[9px] ml-0.5" title="Gezien door medewerker">✓</span>
                                        ) : (
                                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping ml-0.5" title="Nog niet bevestigd door medewerker" />
                                        )}
                                      </span>
                                    )}

                                    {/* Role badge (Sluit, Hulpsluit, Overdag) */}
                                    {(sh.endTime === 'Sluit' || (sh.notes?.toLowerCase().includes('sluit') && !sh.notes?.toLowerCase().includes('hulpsluit'))) && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                        🌙 Sluit
                                      </span>
                                    )}
                                    {(sh.endTime === 'Hulpsluit' || sh.notes?.toLowerCase().includes('hulpsluit')) && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                        🌓 Hulpsluit
                                      </span>
                                    )}
                                    {(sh.endTime === '18u00' || sh.notes?.toLowerCase().includes('overdag') || sh.notes?.toLowerCase().includes('dagdienst')) && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                        ☀️ Overdag
                                      </span>
                                    )}

                                    {/* Shift-Herinnering Indicator Chip */}
                                    {sh.lastReminderSentAt && (
                                      <span 
                                        className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs"
                                        title={`Shift-herinnering verstuurd op ${new Date(sh.lastReminderSentAt).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                                      >
                                        <BellRing size={8} className="text-amber-700 shrink-0" />
                                        <span>Herinnerd</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Notes summary */}
                                  {sh.notes && (
                                    <p className="text-[10px] italic text-slate-500 truncate mt-1">
                                      "{sh.notes}"
                                    </p>
                                  )}

                                  {/* Visual decoration */}
                                  <span 
                                    className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-md" 
                                    style={{ backgroundColor: emp.color }}
                                  />
                                </div>
                                );
                              })}

                              {/* Availability & Preference chip if no shift yet */}
                              {dayShifts.length === 0 && empDayAvail && (
                                <div 
                                  onClick={() => handleOpenAddShift(emp.id, dayIdx)}
                                  className={`p-1.5 rounded-xl border text-center transition cursor-pointer hover:shadow-xs mb-1 ${
                                    empDayAvail.status === 'preferred'
                                      ? 'bg-amber-50/90 border-amber-250 text-amber-950 hover:bg-amber-100'
                                      : empDayAvail.status === 'available'
                                        ? 'bg-emerald-50/80 border-emerald-250 text-emerald-950 hover:bg-emerald-100'
                                        : 'bg-rose-50/80 border-rose-250 text-rose-800 hover:bg-rose-100'
                                  }`}
                                  title={`Opgegeven beschikbaarheid: ${empDayAvail.status === 'preferred' ? 'Voorkeur' : empDayAvail.status === 'available' ? 'Beschikbaar' : 'Niet-beschikbaar'}${empDayAvail.status !== 'unavailable' ? ` (${empDayAvail.startTime || 'Open'} - ${empDayAvail.endTime || 'Sluit'})` : ''}${empDayAvail.notes ? `\n"${empDayAvail.notes}"` : ''}. Klik om dienst in te plannen.`}
                                >
                                  <div className="flex items-center justify-center gap-1 font-black text-[10px] leading-tight">
                                    <span>{empDayAvail.status === 'preferred' ? '⭐ Voorkeur' : empDayAvail.status === 'available' ? '✓ Beschikbaar' : '✕ Niet-beschikbaar'}</span>
                                  </div>
                                  {empDayAvail.status !== 'unavailable' && (
                                    <div className="text-[9px] font-black text-slate-700 tracking-tight mt-0.5">
                                      {empDayAvail.startTime || 'Open'} - {empDayAvail.endTime || 'Sluit'}
                                    </div>
                                  )}
                                  {empDayAvail.notes && (
                                    <div className="text-[8.5px] italic text-slate-500 truncate mt-0.5 max-w-[120px] mx-auto">
                                      "{empDayAvail.notes}"
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Create button shown on cell focus/hover */}
                              <button
                                onClick={() => handleOpenAddShift(emp.id, dayIdx)}
                                className="w-full py-2 border-2 border-orange-100 border-dashed rounded-xl flex items-center justify-center text-orange-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/40 transition text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-30 cursor-pointer"
                              >
                                <Plus size={14} className="stroke-[3]" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>

          {/* Color hints - Status Legenda */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-600 pt-2 bg-orange-50/50 p-4 rounded-3xl border-2 border-orange-100">
            <span className="font-black text-orange-600 uppercase tracking-tight text-[11px]">Status Legenda:</span>
            
            {/* Open Chip */}
            <span className="flex items-center space-x-1.5 font-bold text-[11px] text-amber-950">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Open</span>
              </span>
              <span>Openstaande dienst (Ruilbord)</span>
            </span>

            {/* Ontwerp Chip */}
            <span className="flex items-center space-x-1.5 font-bold text-[11px] text-slate-700">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Ontwerp</span>
              </span>
              <span>Concept (Nog niet gepubliceerd)</span>
            </span>

            {/* Gepubliceerd Chip */}
            <span className="flex items-center space-x-1.5 font-bold text-[11px] text-emerald-900">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Gepubliceerd</span>
              </span>
              <span>Definitief & Zichtbaar</span>
            </span>

            {/* Acknowledged / Read status */}
            <span className="flex items-center space-x-1 font-bold text-[11px] text-slate-600 border-l border-orange-200 pl-3">
              <span className="text-emerald-600 font-black">✓</span>
              <span>Gezien door medewerker</span>
            </span>
            <span className="flex items-center space-x-1 font-bold text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span>Nog niet bevestigd</span>
            </span>
          </div>
        </div>
        );
      })()}

      {/* 1b. BESCHIKBAARHEID TAB - STRICTLY ADMIN ONLY */}
      {activeSubTab === 'beschikbaarheid' && (() => {
        const filteredEmployees = sortEmployeesByFirstName(
          employees.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(managerAvailSearch.toLowerCase());
            const matchStatuut = managerAvailStatuutFilter === 'all' || emp.statuut === managerAvailStatuutFilter;
            const matchExperience = managerAvailExperienceFilter === 'all' || emp.experience === managerAvailExperienceFilter;
            return matchSearch && matchStatuut && matchExperience && emp.id !== 'emp1'; // Don't show lead manager (Hans Stevens)
          })
        );

        const totalSubmittedThisWeek = employees.filter(emp => 
          emp.id !== 'emp1' && availabilities.some(a => a.employeeId === emp.id && a.weekNumber === selectedManagerWeek)
        ).length;

        return (
          <div className="space-y-6 font-sans text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Personeels-Beschikbaarheden Overzicht 📅</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    🔒 Alleen Zichtbaar voor Beheerder
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Volg live welke personeelsleden hun beschikbaarheden wel of niet hebben doorgegeven via het online formulier. Personeel heeft geen toegang tot dit blad.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityChart(prev => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center space-x-2 transition cursor-pointer border shadow-sm active:scale-95 ${
                    showAvailabilityChart
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-200'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                  }`}
                  title="Toon of verberg de visuele Recharts grafiek van de weekbeschikbaarheid"
                >
                  <BarChart3 size={15} />
                  <span>{showAvailabilityChart ? 'Grafiek Verbergen' : 'Visuele Grafiek Tonen 📊'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExcelAvailabilityModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer border border-emerald-500"
                  title="Excel bestand uploaden of sjabloon downloaden voor bulk beschikbaarheden"
                >
                  <FileSpreadsheet size={15} className="text-emerald-200" />
                  <span>📊 Excel Uploaden / Downloaden</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBackupModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase rounded-xl flex items-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer border border-slate-700"
                  title="Bekijk de cloud backup van alle ingezonden formulieren"
                >
                  <Database size={15} className="text-orange-400" />
                  <span>💾 Cloud Backups & Archief</span>
                </button>
              </div>
            </div>

            {/* Master Toggle: Beschikbaarheden Doorgeven Inschakelen / Uitschakelen */}
            <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-sm ${
              appSettings?.availabilitySubmissionEnabled !== false
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300'
                : 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-100 border-rose-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    appSettings?.availabilitySubmissionEnabled !== false
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-rose-600 text-white shadow-rose-200'
                  }`}>
                    {appSettings?.availabilitySubmissionEnabled !== false ? <Sparkles size={24} /> : <Lock size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        appSettings?.availabilitySubmissionEnabled !== false
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-200 text-rose-900 border border-rose-300'
                      }`}>
                        {appSettings?.availabilitySubmissionEnabled !== false ? '🟢 Doorgeven Geopend' : '🔒 Doorgeven Uitgeschakeld'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">Beheerders-controle</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                      {appSettings?.availabilitySubmissionEnabled !== false
                        ? 'Personeel kan momenteel beschikbaarheden invullen'
                        : 'Doorgeven van beschikbaarheden is vergrendeld voor personeel'}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {appSettings?.availabilitySubmissionEnabled !== false
                        ? 'Collega\'s (flexi, extra, student) kunnen via hun personeelsportaal beschikbaarheden voor komende weken doorgeven.'
                        : 'Medewerkers kunnen momenteel geen nieuwe beschikbaarheden indienen of aanpassen in hun portaal.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const current = appSettings?.availabilitySubmissionEnabled !== false;
                      onUpdateAppSettings?.({ availabilitySubmissionEnabled: !current });
                    }}
                    className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-tight flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95 text-white ${
                      appSettings?.availabilitySubmissionEnabled !== false
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                    }`}
                  >
                    {appSettings?.availabilitySubmissionEnabled !== false ? (
                      <>
                        <Lock size={15} />
                        <span>Nu Uitschakelen (Vergrendelen)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Nu Openstellen voor Personeel</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Backup Status Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div>
                  <p className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                    Cloud Backup Actief & Beveiligd
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    Elke ingediende beschikbaarheid van het personeel wordt automatisch en onuitwisbaar gearchiveerd in Google Cloud Firestore.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupModal(true)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                Inzien in Archief →
              </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-orange-100 p-5 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wide">Status week {selectedManagerWeek}</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">
                    {totalSubmittedThisWeek} <span className="text-xs font-semibold text-slate-550">/ {employees.filter(e => e.id !== 'emp1').length} ingediend</span>
                  </p>
                </div>
                <span className="text-2xl bg-orange-50 p-3 rounded-2xl border-2 border-orange-100">📋</span>
              </div>
              <div className="bg-white border-2 border-emerald-100 p-5 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wide">Deelname Percentage</p>
                  <p className="text-2xl font-black text-emerald-800 mt-1">
                    {Math.round((totalSubmittedThisWeek / (employees.filter(e => e.id !== 'emp1').length || 1)) * 100)}%
                  </p>
                </div>
                <span className="text-2xl bg-emerald-50 p-3 rounded-2xl border-2 border-emerald-100">📈</span>
              </div>
              <div className="bg-white border-2 border-blue-100 p-5 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-700 tracking-wide">Eerste login compleet</p>
                  <p className="text-2xl font-black text-blue-800 mt-1">
                    {employees.filter(e => e.firstLoginComplete && e.id !== 'emp1').length} <span className="text-xs font-semibold text-slate-550 font-sans">collega's</span>
                  </p>
                </div>
                <span className="text-2xl bg-blue-50 p-3 rounded-2xl border-2 border-blue-100 border bg-slate-50">🔒</span>
              </div>
            </div>

            {/* Visuele Grafiek Personeelsbeschikbaarheid per Dag (Recharts) */}
            {showAvailabilityChart && (
              <StaffAvailabilityChart
                employees={employees}
                shifts={shifts}
                availabilities={availabilities}
                weekNumber={selectedManagerWeek}
                onSelectEmployeeDetail={(emp, wk) => setSelectedAvailabilityDetail({ employee: emp, weekNumber: wk })}
              />
            )}

            {/* Control Filters Area */}
            <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Select Week selector */}
              <div className="space-y-1.5 w-full md:w-auto text-left">
                <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Selecteer Week:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeWeeks.map(w => {
                    const wk = w.weekNumber;
                    const isLocked = isWeekAvailabilityLocked(wk, CURRENT_WEEK_NUMBER);
                    const isSelected = selectedManagerWeek === wk;
                    return (
                      <button
                        key={wk}
                        type="button"
                        onClick={() => {
                          setSelectedManagerWeek(wk);
                        }}
                        title={`${w.label}: ${w.dateRange}`}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition duration-100 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                            : 'bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200'
                        }`}
                      >
                        <span>Week {wk}</span>
                        {wk === CURRENT_WEEK_NUMBER && (
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black flex items-center gap-0.5 ${
                            isSelected ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            <Lock size={7} /> Huidig
                          </span>
                        )}
                        {wk === NEXT_WEEK_NUMBER && (
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black flex items-center gap-0.5 ${
                            isSelected ? 'bg-slate-200 text-slate-900' : 'bg-slate-200 text-slate-700 border border-slate-300'
                          }`}>
                            <Lock size={7} /> Volgende
                          </span>
                        )}
                        {!isLocked && (
                          <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            Open
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Archive dropdown for past weeks */}
                  {archivedWeeks.length > 0 && (
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setShowAvailArchiveMenu(prev => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition duration-100 active:scale-95 flex items-center gap-1.5 border cursor-pointer ${
                          isCurrentWeekSelectedArchived
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                        }`}
                        title="Vorige weken worden automatisch gearchiveerd"
                      >
                        <Archive size={12} />
                        <span>Archief ({archivedWeeks.length})</span>
                        <ChevronDown size={11} className={`transition-transform duration-200 ${showAvailArchiveMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showAvailArchiveMenu && (
                        <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            📦 Vorige Weken (Automatisch Gearchiveerd)
                          </div>
                          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                            {archivedWeeks.map(aw => {
                              const isSel = selectedManagerWeek === aw.weekNumber;
                              const pastAvails = availabilities.filter(a => a.weekNumber === aw.weekNumber).length;
                              return (
                                <button
                                  key={aw.weekNumber}
                                  type="button"
                                  onClick={() => {
                                    setSelectedManagerWeek(aw.weekNumber);
                                    setShowAvailArchiveMenu(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition hover:bg-orange-50 cursor-pointer ${
                                    isSel ? 'bg-amber-50 font-black text-amber-900' : 'text-slate-700'
                                  }`}
                                >
                                  <div>
                                    <div className="font-black text-xs">Week {aw.weekNumber}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">{aw.dateRange}</div>
                                  </div>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {pastAvails} inzendingen
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Filters Search and Role */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="w-full sm:w-60 relative">
                  <input
                    type="text"
                    placeholder="Zoek medewerker..."
                    value={managerAvailSearch}
                    onChange={(e) => setManagerAvailSearch(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold tracking-normal focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Statuut select */}
                <select
                  value={managerAvailStatuutFilter}
                  onChange={(e) => setManagerAvailStatuutFilter(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-tight focus:outline-none cursor-pointer"
                >
                  <option value="all">Alle Statuten</option>
                  <option value="Student">Student</option>
                  <option value="Flexi">Flexi</option>
                  <option value="Vast">Vast</option>
                  <option value="Extra">Extra</option>
                </select>

                {/* Experience select */}
                <select
                  value={managerAvailExperienceFilter}
                  onChange={(e) => setManagerAvailExperienceFilter(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-tight focus:outline-none cursor-pointer"
                >
                  <option value="all">Alle Ervaring</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Gemiddeld">Gemiddeld</option>
                  <option value="Ervaren">Ervaren</option>
                  <option value="Verantwoordelijke">Verantwoordelijke</option>
                </select>
              </div>

            </div>

            {/* Matrix Table with Sticky Column (Names) and Sticky Row (Days) */}
            <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-auto max-h-[72vh] relative">
                <table className="min-w-full table-fixed border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-xs">
                    <tr>
                      <th 
                        scope="col" 
                        className="sticky left-0 top-0 z-30 w-56 min-w-[220px] max-w-[220px] px-5 py-4 text-left text-xs font-black uppercase text-slate-700 tracking-wider bg-slate-100 border-b-2 border-r-2 border-orange-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Medewerker</span>
                          <span className="text-[9px] font-black text-orange-600 bg-orange-100/70 border border-orange-200 px-1.5 py-0.5 rounded-md normal-case">
                            📌 Vastgezet
                          </span>
                        </div>
                      </th>
                      {DAYS_OF_WEEK.map((day, idx) => {
                        const dayDateInfo = getDayDateInfo(selectedManagerWeek, idx);
                        return (
                          <th 
                            key={idx} 
                            scope="col" 
                            className="sticky top-0 z-20 px-3 py-3 text-center text-xs font-black uppercase text-slate-700 tracking-wider bg-slate-100 border-b-2 border-r border-orange-200 min-w-[135px]"
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{day}</span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-950 font-black text-xs border border-orange-200 shadow-2xs">
                                {dayDateInfo.shortDate}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-xs text-slate-500 font-bold uppercase tracking-tight border-b border-slate-200">
                          Geen medewerkers gevonden voor deze zoekfilters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const effectiveResult = getEffectiveEmployeeAvailability(emp, selectedManagerWeek, availabilities);
                        const employeeAvail = effectiveResult.availability;
                        const isFromRecurring = effectiveResult.source === 'recurring';
                        
                        return (
                          <tr key={emp.id} className="hover:bg-orange-50/30 transition-all group">
                            
                            {/* Employee Bio details - Sticky First Column */}
                            <td className="sticky left-0 z-10 w-56 min-w-[220px] max-w-[220px] px-5 py-3.5 whitespace-nowrap bg-white group-hover:bg-orange-50/90 border-r-2 border-b border-orange-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] transition-colors">
                              <div className="flex items-center space-x-3 text-left">
                                <span 
                                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-black text-[10px] text-white uppercase shadow-sm border border-white shrink-0"
                                  style={{ backgroundColor: emp.color }}
                                >
                                  {emp.avatarUrl ? (
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                                  ) : (
                                    emp.name.split(' ').map(n => n[0]).join('')
                                  )}
                                </span>
                                <div className="truncate flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-black text-slate-800 leading-tight uppercase truncate max-w-[115px]" title={emp.name}>{emp.name}</p>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedAvailabilityDetail({ employee: emp, weekNumber: selectedManagerWeek })}
                                      className="p-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition cursor-pointer shrink-0"
                                      title="Bekijk alle weekdetails en uren van deze medewerker"
                                    >
                                      <Eye size={12} />
                                    </button>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider block truncate">
                                    {emp.statuut} {emp.contractDaysPerWeek === 4 ? '(4d)' : ''} ({emp.experience})
                                  </span>
                                  {employeeAvail ? (
                                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                      {isFromRecurring ? (
                                        <span className="text-[8px] font-black text-indigo-900 bg-indigo-100 border border-indigo-300 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5" title="Automatisch overgenomen van vaste beschikbaarheid van deze medewerker">
                                          🔁 Vaste herhaling
                                        </span>
                                      ) : selectedManagerWeek === CURRENT_WEEK_NUMBER ? (
                                        <span className="text-[8px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded inline-flex items-center gap-0.5" title="Huidige week (vastgelegd)">
                                          <Lock size={7} /> Huidig (Vast)
                                        </span>
                                      ) : selectedManagerWeek === NEXT_WEEK_NUMBER ? (
                                        <span className="text-[8px] font-black text-slate-800 bg-slate-200 border border-slate-300 px-1 py-0.2 rounded inline-flex items-center gap-0.5" title="Volgende week (vastgelegd)">
                                          <Lock size={7} /> Volgende (Vast)
                                        </span>
                                      ) : selectedManagerWeek < CURRENT_WEEK_NUMBER ? (
                                        <span className="text-[8px] font-black text-slate-600 bg-slate-100 border border-slate-300 px-1 py-0.2 rounded inline-block" title="Gearchiveerde week">
                                          Archief
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded inline-block" title="Komende week (specifiek ingediend)">
                                          ✓ Specifiek
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-0.5">
                                      <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded inline-block">
                                        Niet ingevuld
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Mon — Sun availability blocks */}
                            {Array.from({ length: 7 }).map((_, dayIdx) => {
                              const dayAvail = employeeAvail?.days.find(d => d.day === dayIdx);
                              
                              let bgClass = 'bg-slate-50/50 text-slate-400';
                              let badgeText = 'Geen opgave';
                              let icon = '⚪';
                              let hasNotes = false;

                              if (dayAvail) {
                                hasNotes = !!dayAvail.notes?.trim();
                                if (dayAvail.status === 'preferred') {
                                  bgClass = 'bg-amber-50/70 border-amber-300 text-amber-950 font-extrabold';
                                  badgeText = 'Voorkeur';
                                  icon = '⭐';
                                } else if (dayAvail.status === 'available') {
                                  bgClass = 'bg-emerald-50/60 border-emerald-300 text-emerald-950';
                                  badgeText = 'Beschikbaar';
                                  icon = '✓';
                                } else if (dayAvail.status === 'unavailable') {
                                  bgClass = 'bg-rose-50/60 border-rose-300 text-rose-800';
                                  badgeText = 'Niet-beschikbaar';
                                  icon = '✕';
                                }
                              }

                              return (
                                <td 
                                  key={dayIdx} 
                                  onClick={() => setSelectedAvailabilityDetail({ employee: emp, weekNumber: selectedManagerWeek })}
                                  className={`px-2 py-2.5 border-r border-b border-slate-200/70 text-center min-w-[140px] cursor-pointer transition hover:bg-orange-100/50 hover:shadow-xs group/cell ${bgClass}`}
                                  title="Klik om alle weekdetails te bekijken"
                                >
                                  <div className="flex flex-col items-center justify-center space-y-1">
                                    <div className="flex items-center justify-center gap-1">
                                      {isFromRecurring && <span className="text-[10px]" title="Vaste herhaling">🔁</span>}
                                      {dayAvail ? (
                                        dayAvail.status === 'preferred' ? (
                                          <span className="px-2 py-0.5 rounded-full bg-amber-200/95 text-amber-950 font-black text-[10.5px] inline-flex items-center gap-1 shadow-2xs border border-amber-300">
                                            <span>⭐</span>
                                            <span>Voorkeur</span>
                                          </span>
                                        ) : dayAvail.status === 'available' ? (
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10.5px] inline-flex items-center gap-1 shadow-2xs border border-emerald-300">
                                            <span>✓</span>
                                            <span>Beschikbaar</span>
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-black text-[10px] inline-flex items-center gap-0.5 shadow-2xs border border-rose-200">
                                            <span>✕</span>
                                            <span>Niet-beschikbaar</span>
                                          </span>
                                        )
                                      ) : (
                                        <span className="text-slate-400 text-[10px] font-semibold italic">Geen opgave</span>
                                      )}
                                    </div>

                                    {/* Uren / Tijdsvenster: Van wanneer tot wanneer */}
                                    {dayAvail && dayAvail.status !== 'unavailable' && (dayAvail.startTime || dayAvail.endTime) && (
                                      <div className="inline-flex items-center gap-1 text-[10px] font-black text-slate-900 bg-white/95 border border-slate-300 px-2 py-0.5 rounded-md shadow-2xs">
                                        <Clock size={10} className="text-orange-600 shrink-0" />
                                        <span>{dayAvail.startTime || 'Open'} - {dayAvail.endTime || 'Sluit'}</span>
                                      </div>
                                    )}

                                    {/* Opmerkingen / Toelichting */}
                                    {hasNotes && (
                                      <div className="text-[9px] text-slate-700 italic bg-amber-50/90 border border-amber-200 px-1.5 py-0.5 rounded text-center leading-tight max-w-[130px] truncate" title={dayAvail?.notes}>
                                        💬 "{dayAvail?.notes}"
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination/Filter helper message */}
              <div className="bg-slate-50 px-5 py-3 border-t border-orange-100 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Weergave: {filteredEmployees.length} van {employees.filter(e => e.id !== 'emp1').length} medewerkers</span>
                <span>💡 Tip: Gebruik de filters bovenaan om snel per statuut & ervaring te coördineren.</span>
              </div>
            </div>

          </div>
        );
      })()}

      {/* 2. RUILVERZOEKEN & OPENSTAANDE SHIFTEN TAB */}
      {activeSubTab === 'verzoeken' && (
        <div className="space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-orange-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 font-sans tracking-tight uppercase flex items-center gap-2">
                <span>Ruilverzoeken & Openstaande Shiften</span>
                {swapRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="text-xs bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black">
                    {swapRequests.filter(r => r.status === 'pending').length} open
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Beheer openstaande shiften waarop teamleden kunnen intekenen en keur onderlinge ruilverzoeken goed.</p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setSelectedShift({
                  isNew: true,
                  weekNumber: selectedManagerWeek,
                  status: 'draft',
                  day: 4,
                  startTime: '17:00',
                  endTime: '02:00',
                  notes: 'Openstaande shift: wie kan inspringen?'
                });
                setShowShiftModal(true);
              }}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 shadow-md transition cursor-pointer self-start sm:self-auto"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Nieuwe Openstaande Shift +</span>
            </button>
          </div>

          {/* SECTION A: OPENSTAANDE SHIFTEN MET INTEKENINGEN */}
          {(() => {
            const openShifts = swapRequests.filter(r => r.isOpenShift || r.requesterId === 'beheerder');
            const pendingOpenShifts = openShifts.filter(r => r.status === 'pending');
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <span>📢 Openstaande Shiften voor Intekening</span>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {pendingOpenShifts.length} actief
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Kandidaten kunnen hierop solliciteren via het Ruilbord in hun portaal</span>
                </div>

                {pendingOpenShifts.length === 0 ? (
                  <div className="bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-3xl p-6 text-center text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-800">Geen actieve openstaande shiften</p>
                    <p className="text-[11px] text-slate-500">
                      Wil je een dienst openstellen zodat medewerkers kunnen intekenen? Klik op een dienst in het rooster en kies <strong>"📢 Openstellen voor Intekening"</strong> of klik rechtsboven op <strong>"Nieuwe Openstaande Shift +"</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOpenShifts.map((req) => {
                      const shift = shifts.find(s => s.id === req.shiftId);
                      if (!shift) return null;
                      const originalEmp = employees.find(e => e.id === shift.employeeId);
                      const candidates = req.candidates || [];
                      const dayDateInfo = getDayDateInfo(shift.weekNumber || selectedManagerWeek, shift.day);

                      return (
                        <div 
                          key={req.id}
                          className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-4 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                                  📢 Open Dienst
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">Week {shift.weekNumber || selectedManagerWeek}</span>
                              </div>
                              <h4 className="font-black text-sm text-slate-800 tracking-tight mt-1">
                                {dayDateInfo.dayNameFull} {dayDateInfo.shortDate}
                              </h4>
                              <p className="text-xs font-bold text-orange-600">
                                {shift.startTime} - {shift.endTime} • {shift.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                              candidates.length > 0 ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}>
                              {candidates.length} {candidates.length === 1 ? 'kandidaat' : 'kandidaten'}
                            </span>
                          </div>

                          {originalEmp && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              Oorspronkelijk gepland: <strong className="text-slate-800">{originalEmp.name}</strong>
                            </div>
                          )}

                          {req.reason && (
                            <div className="text-xs italic bg-amber-50/70 border border-amber-200 text-amber-950 p-2.5 rounded-xl">
                              "{req.reason}"
                            </div>
                          )}

                          {/* Candidates list & assignment */}
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                              <span>Ingetekende teamleden ({candidates.length}):</span>
                              <span className="text-[9px] font-medium text-slate-400">Kies wie de dienst krijgt</span>
                            </label>

                            {candidates.length === 0 ? (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-400 italic">
                                Nog geen kandidaten. Medewerkers zien deze dienst op hun portaal en kunnen direct intekenen.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {candidates.map((cand) => {
                                  const candEmp = employees.find(e => e.id === cand.employeeId);
                                  return (
                                    <div 
                                      key={cand.employeeId}
                                      className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-black text-xs text-slate-850">{cand.employeeName}</span>
                                          {candEmp && renderStatuutBadge(candEmp.statuut)}
                                          {candEmp?.experience && (
                                            <span className="text-[9px] text-slate-500 font-semibold">({candEmp.experience})</span>
                                          )}
                                        </div>
                                        {cand.note && (
                                          <p className="text-[11px] text-slate-600 italic mt-0.5">"{cand.note}"</p>
                                        )}
                                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                          Ingetekend op: {new Date(cand.signedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          onApproveSwap(req.id, cand.employeeId);
                                          setSixWeeksSuccessMsg(`🎉 Openstaande dienst succesvol toegewezen aan ${cand.employeeName}!`);
                                          setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
                                        }}
                                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                                      >
                                        <Check size={13} className="stroke-[3]" />
                                        <span>Toewijzen ✓</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                onDeclineSwap(req.id);
                                setSixWeeksSuccessMsg('Openstelling geannuleerd.');
                                setTimeout(() => setSixWeeksSuccessMsg(null), 4000);
                              }}
                              className="w-full py-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Sluiten / Verwijderen
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* SECTION B: ONDERLINGE RUILVERZOEKEN TUSSEN MEDEWERKERS */}
          {(() => {
            const peerSwaps = swapRequests.filter(r => !r.isOpenShift && r.requesterId !== 'beheerder');
            return (
              <div className="space-y-3 pt-4 border-t-2 border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <span>🔄 Onderlinge Ruilverzoeken tussen Collega's</span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {peerSwaps.length} totaal
                  </span>
                </h3>

                {peerSwaps.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <Check size={20} className="text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-xs text-slate-700">Geen openstaande onderlinge verzoeken</h4>
                    <p className="text-[11px] text-slate-400">Alle onderlinge ruilingen zijn momenteel verwerkt.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {peerSwaps.map((req) => {
                      const requester = employees.find(e => e.id === req.requesterId);
                      const shift = shifts.find(s => s.id === req.shiftId);
                      const targetEmp = req.targetEmployeeId ? employees.find(e => e.id === req.targetEmployeeId) : null;
                      
                      if (!requester || !shift) return null;

                      return (
                        <div 
                          key={req.id} 
                          className={`bg-white rounded-3xl p-5 border-2 shadow-sm space-y-4 relative overflow-hidden ${
                            req.status === 'approved' ? 'border-emerald-500' : req.status === 'geweigerd' ? 'border-slate-300 bg-slate-50/50' : 'border-orange-100'
                          }`}
                        >
                          <div className="absolute top-4 right-4">
                            {req.status === 'pending' ? (
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-tight rounded-full bg-orange-100 border border-orange-200 text-orange-950">Wacht op beheerder</span>
                            ) : req.status === 'approved' ? (
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-tight rounded-full bg-emerald-100 border border-emerald-300 text-emerald-850">Goedgekeurd</span>
                            ) : (
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-tight rounded-full bg-slate-100 border border-slate-200 text-slate-600">Geweigerd</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm uppercase ring-2 ring-orange-200 border border-white"
                              style={{ backgroundColor: requester.color }}
                            >
                              {requester.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight">{requester.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Aangevraagd: {req.date}</p>
                            </div>
                          </div>

                          <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100 text-xs text-slate-755 space-y-2 font-medium">
                            <div className="flex justify-between font-black text-slate-800 uppercase tracking-tight">
                              <span>Originele Dienst:</span>
                              <span className="text-orange-600">{DAYS_OF_WEEK[shift.day]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tijdstip:</span>
                              <span className="font-bold text-slate-700">{shift.startTime} - {shift.endTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-750">Ruilen met / Overname door:</span>
                              {targetEmp ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 border border-orange-200 text-orange-950">
                                  {targetEmp.name}
                                </span>
                              ) : (
                                <span className="text-[11px] font-black uppercase text-orange-500 tracking-tight bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">Open Aanbod</span>
                              )}
                            </div>
                            {shift.notes && (
                              <div className="pt-2 border-t border-orange-100 text-slate-500 italic">
                                "{shift.notes}"
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-orange-650 uppercase tracking-wide font-black">Opgegeven Reden:</p>
                            <blockquote className="bg-orange-100/50 text-orange-950 px-3.5 py-2.5 rounded-xl text-xs italic border border-orange-200/50 font-medium">
                              "{req.reason}"
                            </blockquote>
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() => onDeclineSwap(req.id)}
                                className="flex-1 py-2.5 border-2 border-orange-200 hover:bg-orange-50 text-orange-700 hover:text-orange-900 text-xs font-black uppercase tracking-tight rounded-xl transition"
                              >
                                Weigeren
                              </button>
                              <button
                                onClick={() => onApproveSwap(req.id)}
                                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5"
                              >
                                <Check size={14} className="stroke-[3]" />
                                <span>Goedkeuren +</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. BERICHETEN TAB */}
      {activeSubTab === 'berichten' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          
          {/* Post notice form - Vibrant Palette Theme */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 space-y-4 md:col-span-1 h-fit">
            <div>
              <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-2 uppercase tracking-tight">
                <Megaphone size={16} className="text-orange-500 shrink-0" />
                <span>Nieuw bericht plaatsen</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Medewerkers zien dit direct opvallend op hun startscherm.</p>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Titel</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. Gewijzigde sluitdiensttijden"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Categorie</label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                  className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="planning">Planningsupdate 📅</option>
                  <option value="wijziging">Belangrijke Wijziging 🔄</option>
                  <option value="belangrijk">Urgent / Belangrijk ⚠️</option>
                  <option value="algemeen">Algemeen 💬</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Inhoud mededeling</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type hier je mededeling voor het team..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-lg transition duration-150 active:scale-95 cursor-pointer"
              >
                Groepsbericht Verzenden +
              </button>
            </form>
          </div>

          {/* Active Notices list */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Actieve Berichten op het Personeelspaneel</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {notices.length} {notices.length === 1 ? 'bericht' : 'berichten'}
              </span>
            </div>
            
            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-3xl border-2 border-dashed border-orange-200 text-slate-400 text-xs font-bold uppercase">
                  Er zijn momenteel geen actieve mededelingen.
                </div>
              ) : (
                notices.map((not) => {
                  const replyText = managerNoticeReplyText[not.id] || '';
                  const totalComments = not.comments?.length || 0;
                  const reactions = not.reactions || {};
                  const reactionEntries = Object.entries(reactions).filter(([_, users]) => users.length > 0);

                  return (
                    <div key={not.id} className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 space-y-4 relative">
                      <div className="flex items-start space-x-3.5">
                        <span className={`w-2.5 h-12 rounded-full shrink-0 ${
                          not.category === 'planning' ? 'bg-blue-400' : 
                          not.category === 'wijziging' ? 'bg-orange-400' : 
                          not.category === 'belangrijk' ? 'bg-rose-500' : 'bg-slate-400'
                        }`} />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-current ${CATEGORY_COLORS[not.category]}`}>
                              {not.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{not.date}</span>

                              {/* Direct Share button for Notice (WhatsApp & Messenger) */}
                              {onShareWhatsAppNotice && (
                                <button
                                  type="button"
                                  onClick={() => onShareWhatsAppNotice(not)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-blue-50 hover:from-emerald-100 hover:to-blue-100 text-slate-800 border border-slate-300 rounded-xl text-[10px] font-black transition cursor-pointer active:scale-95"
                                  title="Deel deze mededeling via WhatsApp of Facebook Messenger in de teamgroep"
                                >
                                  <MessageSquare size={11} className="text-emerald-600" />
                                  <span>Deel (WhatsApp / Messenger)</span>
                                </button>
                              )}
                              
                              {/* Delete Notice Button for Manager */}
                              {onDeleteNotice && (
                                noticeToDeleteId === not.id ? (
                                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl shadow-xs">
                                    <span className="text-[10px] font-black text-rose-700">Wissen?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteNotice(not.id);
                                        setNoticeToDeleteId(null);
                                      }}
                                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-xs transition active:scale-95"
                                    >
                                      Ja, wis
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setNoticeToDeleteId(null)}
                                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition"
                                    >
                                      Nee
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setNoticeToDeleteId(not.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    title="Mededeling verwijderen"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          <h4 className="font-black text-xs text-slate-800 font-sans uppercase tracking-tight">{not.title}</h4>
                          <p className="text-xs text-slate-650 leading-relaxed font-sans">{not.content}</p>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center text-[10px] text-slate-400 gap-2">
                            <span className="font-bold">Geplaatst door: <strong className="text-slate-600">{not.author}</strong></span>
                            
                            {/* Reactions Summary */}
                            {reactionEntries.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {reactionEntries.map(([emoji, userIds]) => (
                                  <span key={emoji} className="bg-orange-50 border border-orange-200 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                    {emoji} {userIds.length}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments & Replies Section */}
                      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 flex items-center gap-1.5">
                            <MessageCircle size={13} className="text-orange-500" />
                            <span>Reacties van Medewerkers ({totalComments})</span>
                          </span>
                        </div>

                        {/* List existing comments */}
                        {not.comments && not.comments.length > 0 ? (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {not.comments.map((cmt) => (
                              <div key={cmt.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-slate-800 text-[11px]">{cmt.authorName}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                      cmt.authorRole === 'beheerder'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {cmt.authorRole === 'beheerder' ? '👑 Beheerder' : 'Medewerker'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(cmt.createdAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })} • {new Date(cmt.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {onDeleteNoticeComment && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteNoticeComment(not.id, cmt.id)}
                                        className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition cursor-pointer"
                                        title="Verwijder deze reactie"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700 text-xs font-medium leading-snug">{cmt.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Nog geen reacties geplaatst op dit bericht.</p>
                        )}

                        {/* Manager quick reply form */}
                        {onAddNoticeComment && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!replyText.trim()) return;
                              onAddNoticeComment(
                                not.id,
                                'beheerder_hans',
                                'Hans Stevens',
                                'beheerder',
                                replyText.trim()
                              );
                              setManagerNoticeReplyText(prev => ({ ...prev, [not.id]: '' }));
                            }}
                            className="flex gap-2 pt-1"
                          >
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setManagerNoticeReplyText(prev => ({ ...prev, [not.id]: val }));
                              }}
                              placeholder="Reageer als beheerder (Hans Stevens)..."
                              className="flex-1 bg-white border border-slate-250 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1 transition cursor-pointer shadow-xs active:scale-95 shrink-0"
                            >
                              <Send size={12} />
                              <span>Reageren</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PERSOONEEL TAB */}
      {activeSubTab === 'team' && (
        <div className="space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Team Overzicht & Rechten</h2>
              <p className="text-xs text-orange-600 font-bold uppercase">Beheer je personeelsleden, contactgegevens, beheerdersrechten en statuten.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setNewEmp({
                    name: '',
                    department: 'zaal',
                    statuut: 'Vast',
                    experience: 'Verantwoordelijke',
                    role: 'beheerder',
                    email: '',
                    phone: '',
                    facebookUrl: '',
                    birthDate: '',
                    pin: '1234'
                  });
                  setShowEmployeeModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black uppercase tracking-tight rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-600/20 transition duration-150 active:scale-95 cursor-pointer"
                title="Voeg direct een extra beheerder toe met toegang tot het dashboard"
              >
                <Crown size={16} className="text-amber-200 stroke-[2.5]" />
                <span>+ Extra Beheerder Toevoegen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExcelSyncModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-tight rounded-xl flex items-center space-x-2 shadow-md transition duration-150 active:scale-95 cursor-pointer"
                title="Personeel importeren, updaten en exporteren via Excel (.xlsx / .csv)"
              >
                <FileSpreadsheet size={16} />
                <span>Excel Beheer (.xlsx / .csv)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewEmp({
                    name: '',
                    department: 'zaal',
                    statuut: 'Student',
                    experience: 'Beginner',
                    role: 'medewerker',
                    email: '',
                    phone: '',
                    facebookUrl: '',
                    birthDate: '',
                    pin: '1234'
                  });
                  setShowEmployeeModal(true);
                }}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl flex items-center space-x-2 shadow-lg transition duration-150 active:scale-95 cursor-pointer"
              >
                <UserPlus size={16} className="stroke-[3]" />
                <span>Nieuw Teamlid +</span>
              </button>
            </div>
          </div>

          {/* Actieve Beheerders Overzicht Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                  <Crown size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight text-amber-950">
                    Actieve Beheerders met Dashboard-Toegang
                  </h3>
                  <p className="text-[11px] text-amber-900 font-medium">
                    Deze personen kunnen inloggen op het Beheerdersdashboard met hun naam/e-mail en persoonlijke PIN.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {employees.filter(e => e.role === 'beheerder').map(admin => (
                  <span 
                    key={admin.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white border border-amber-300 text-amber-950 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{admin.name}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono">PIN: {admin.pin || '1234'}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortEmployeesByFirstName(employees).map((emp) => {
              const empShifts = shifts.filter(s => s.employeeId === emp.id);
              const publishedShifts = empShifts.filter(s => s.status === 'published');
              const publishedCount = publishedShifts.length;
              const unconfirmedCount = publishedShifts.filter(s => !s.acknowledged).length;

              // Acceptance status for current week
              const hasAcceptedWeekly = publishedCount > 0 && unconfirmedCount === 0;
              const hasUnconfirmedWeekly = publishedCount > 0 && unconfirmedCount > 0;

              const isEditing = editingEmployeeId === emp.id;

              return (
                <div key={emp.id} className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 flex flex-col justify-between space-y-4 hover:shadow-md transition duration-150 text-left">
                  {isEditing ? (
                    // EDIT MODE
                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase text-orange-600">Teamlid Bewerken</span>
                        <span className="text-[10px] text-slate-400 font-bold">ID: {emp.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Naam</label>
                          <input
                            type="text"
                            value={editEmpName}
                            onChange={(e) => setEditEmpName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-extrabold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Afdeling</label>
                          <select
                            value={editEmpDepartment}
                            onChange={(e) => setEditEmpDepartment(e.target.value as Department)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold cursor-pointer"
                          >
                            <option value="zaal">🍽️ Zaal</option>
                            <option value="keuken">🍳 Keuken</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Statuut</label>
                          <select
                            value={editEmpStatuut}
                            onChange={(e) => setEditEmpStatuut(e.target.value as EmployeeStatuut)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold cursor-pointer"
                          >
                            <option value="Student">Student</option>
                            <option value="Flexi">Flexi</option>
                            <option value="Vast">Vast</option>
                            <option value="Extra">Extra</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Ervaring</label>
                          <select
                            value={editEmpExperience}
                            onChange={(e) => setEditEmpExperience(e.target.value as ExperienceLevel)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold cursor-pointer"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Gemiddeld">Gemiddeld</option>
                            <option value="Ervaren">Ervaren</option>
                            <option value="Verantwoordelijke">Verantwoordelijke</option>
                          </select>
                        </div>
                      </div>

                      {/* Geboortedatum (verplicht voor studenten) */}
                      <div className="space-y-1 bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>🎂 Geboortedatum</span>
                            {editEmpStatuut === 'Student' && (
                              <span className="text-[8px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 uppercase">
                                Verplicht voor studenten
                              </span>
                            )}
                          </span>
                          {editEmpBirthDate && calculateAge(editEmpBirthDate) !== null && (
                            <span className="text-[10px] font-black text-slate-800">
                              {calculateAge(editEmpBirthDate)} jaar
                            </span>
                          )}
                        </label>
                        <input
                          type="date"
                          value={editEmpBirthDate}
                          onChange={(e) => setEditEmpBirthDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-850 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                        />
                        {editEmpBirthDate && calculateAge(editEmpBirthDate) !== null && (
                          <div className="pt-0.5">
                            {calculateAge(editEmpBirthDate)! < 18 ? (
                              <p className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 flex items-center gap-1">
                                <span>🔞</span>
                                <span>Minderjarig (&lt;18 jaar): mag niet na 23u00 werken en max. 8 uur per dag.</span>
                              </p>
                            ) : (
                              <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                <span>✓</span>
                                <span>Meerderjarig (18+ jaar)</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</label>
                          <input
                            type="email"
                            placeholder="mail@example.com"
                            value={editEmpEmail}
                            onChange={(e) => setEditEmpEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Telefoon</label>
                          <input
                            type="text"
                            placeholder="0470..."
                            value={editEmpPhone}
                            onChange={(e) => setEditEmpPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Facebook size={10} className="text-[#1877F2]" />
                          <span>Facebook Profiel URL</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.facebook.com/..."
                          value={editEmpFacebook}
                          onChange={(e) => setEditEmpFacebook(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <KeyRound size={11} className="text-orange-600" />
                            <span>Persoonlijke Pincode (PIN)</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">4 cijfers</span>
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="1234"
                            value={editEmpPin}
                            onChange={(e) => setEditEmpPin(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-24 bg-slate-50 border border-slate-250 text-slate-850 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold text-center tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setEditEmpPin('1234')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Reset naar 1234
                          </button>
                        </div>
                      </div>

                      {/* Rol & Rechten (Beheerder toewijzen) */}
                      <div className="space-y-1 bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={12} className="text-amber-600" />
                            <span>Rol & Rechten</span>
                          </span>
                          {editEmpRole === 'beheerder' && (
                            <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-300">
                              👑 Beheerder
                            </span>
                          )}
                        </label>
                        <select
                          value={editEmpRole}
                          onChange={(e) => setEditEmpRole(e.target.value as 'medewerker' | 'beheerder')}
                          className="w-full bg-white border border-slate-300 text-slate-850 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold cursor-pointer"
                        >
                          <option value="medewerker">Medewerker (Personeelsportaal)</option>
                          <option value="beheerder">👑 Beheerder (Beheerdersdashboard toegang)</option>
                        </select>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedAvatarEmployee(emp)}
                          className="w-full py-1.5 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-1.5 transition cursor-pointer"
                          title="Profielfoto maken met camera of uploaden"
                        >
                          <Camera size={13} className="stroke-[2.5]" />
                          <span>{emp.avatarUrl ? 'Foto Wijzigen (Camera)' : 'Foto Toevoegen (Camera)'}</span>
                        </button>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEmployeeEdit(emp)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition duration-100 active:scale-95 cursor-pointer text-center"
                        >
                          Opslaan ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEmployeeId(null)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase transition duration-100 active:scale-95 cursor-pointer text-center"
                        >
                          Annuleer
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3 text-left">
                          {/* AVATAR PLACEHOLDER / PHOTO WITH CAMERA BUTTON OVERLAY */}
                          <button
                            type="button"
                            onClick={() => setSelectedAvatarEmployee(emp)}
                            className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full shrink-0"
                            title="Klik om profielfoto via camera te maken of aan te passen"
                          >
                            <div 
                              className="w-13 h-13 rounded-full overflow-hidden flex items-center justify-center font-black text-sm text-white uppercase shadow-md ring-2 ring-orange-200 border-2 border-white relative transition duration-150 group-hover:scale-105"
                              style={{ backgroundColor: emp.color }}
                            >
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                              ) : (
                                emp.name.split(' ').map(n => n[0]).join('')
                              )}
                              
                              {/* Hover Camera Overlay */}
                              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={18} className="stroke-[2.5]" />
                              </div>
                            </div>

                            {/* Camera Indicator Badge */}
                            <span 
                              className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-md border transition ${
                                emp.avatarUrl 
                                  ? 'bg-emerald-500 text-white border-white' 
                                  : 'bg-white text-orange-600 border-orange-200 group-hover:bg-orange-500 group-hover:text-white'
                              }`}
                              title={emp.avatarUrl ? 'Foto actief in Firebase (klik om te wijzigen)' : 'Geen foto (klik om met camera te maken)'}
                            >
                              <Camera size={11} className="stroke-[2.5]" />
                            </span>
                          </button>

                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">{emp.name}</h4>
                              {emp.avatarUrl && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200" title="Profielfoto opgeslagen in Firebase">
                                  📸 Foto
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                emp.department === 'keuken' 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}>
                                {emp.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                              </span>
                              {emp.role === 'beheerder' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs">
                                  👑 Beheerder
                                </span>
                              )}
                              {renderStatuutBadge(emp.statuut)}
                              {emp.birthDate ? (
                                <span 
                                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                    isMinorStudent(emp)
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  }`}
                                  title={isMinorStudent(emp) ? 'Minderjarige student: mag niet na 23u00 werken en max 8u per dag' : '18+ medewerker'}
                                >
                                  🎂 {calculateAge(emp.birthDate)}j {isMinorStudent(emp) ? '(-18 Jr: max 23u)' : ''}
                                </span>
                              ) : isStudent(emp) ? (
                                <span 
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                  title="Geboortedatum is verplicht voor studenten om wettelijke -18 regels te controleren"
                                >
                                  ⚠️ Geboortedatum ontbreekt
                                </span>
                              ) : null}
                              {emp.role === 'beheerder' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-amber-100 text-amber-900 border border-amber-300">
                                  👑 Beheerder
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateEmployee({ ...emp, role: 'beheerder' });
                                    setSixWeeksSuccessMsg(`👑 ${emp.name} is nu Beheerder en heeft toegang tot het Beheerdersdashboard!`);
                                    setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition cursor-pointer"
                                  title={`Geef ${emp.name} beheerdersrechten`}
                                >
                                  <Crown size={10} className="text-amber-500" />
                                  <span>+ Maak Beheerder</span>
                                </button>
                              )}
                              {renderExperienceBadge(emp.experience)}
                              {hasAcceptedWeekly ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  ✓ Akkoord
                                </span>
                              ) : hasUnconfirmedWeekly ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                                  ⌛ Te Bevestigen
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight bg-slate-50 text-slate-500 border border-slate-200">
                                  Ongepland
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full border border-white ring-2 ${emp.active ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-300 ring-slate-100'}`} title={emp.active ? "Actief" : "Standby"} />
                          
                          {/* CAMERA PHOTO BUTTON */}
                          <button
                            type="button"
                            onClick={() => setSelectedAvatarEmployee(emp)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer"
                            title="Profielfoto maken met camera of uploaden naar Firebase"
                          >
                            <Camera size={13} className="stroke-[2.5]" />
                          </button>

                          {/* TOGGLE BEHEERDER BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextRole = emp.role === 'beheerder' ? 'medewerker' : 'beheerder';
                              onUpdateEmployee({ ...emp, role: nextRole });
                              setSixWeeksSuccessMsg(nextRole === 'beheerder' 
                                ? `👑 ${emp.name} is nu Beheerder en kan inloggen in het Beheerdersdashboard!`
                                : `${emp.name} is nu ingesteld als gewone medewerker.`);
                              setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
                            }}
                            className={`p-1.5 rounded-xl border transition cursor-pointer ${
                              emp.role === 'beheerder'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                : 'bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-800 border-slate-200'
                            }`}
                            title={emp.role === 'beheerder' ? "Beheerder (klik om te wijzigen naar medewerker)" : "Promoveer naar Beheerder (toegang tot dashboard)"}
                          >
                            <ShieldCheck size={13} className="stroke-[2.5]" />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleStartEmployeeEdit(emp)}
                            className="p-1.5 text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl transition cursor-pointer"
                            title="Medewerker bewerken (statuut, ervaring, etc.)"
                          >
                            <Tag size={13} className="stroke-[2.5]" />
                          </button>

                          {onDeleteEmployee && emp.id !== 'emp1' && (
                            <button
                              onClick={() => onDeleteEmployee(emp.id)}
                              className="p-1.5 text-rose-650 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-xl transition cursor-pointer"
                              title="Medewerker verwijderen"
                            >
                              <Trash2 size={13} className="stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display contact details if filled */}
                      {(emp.email || emp.phone || emp.facebookUrl) && (
                        <div className="text-[10px] text-slate-500 space-y-0.5 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-left">
                          {emp.email && <div className="flex items-center gap-1"><span className="text-slate-400">✉</span> {emp.email}</div>}
                          {emp.phone && <div className="flex items-center gap-1"><span className="text-slate-400">📞</span> {emp.phone}</div>}
                          {emp.facebookUrl && (
                            <div className="flex items-center gap-1">
                              <Facebook size={10} className="text-[#1877F2] shrink-0" />
                              <a href={emp.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline truncate max-w-[200px]">
                                Facebook Profiel ↗
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Personal Staff PIN code row */}
                      <div className="flex items-center justify-between text-[10px] bg-orange-50/70 p-1.5 rounded-xl border border-orange-200/60 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <KeyRound size={12} className="text-orange-600 shrink-0" />
                          <span className="font-bold text-slate-600">Login PIN:</span>
                          <span className="font-mono font-black text-xs text-orange-950 bg-white px-1.5 py-0.5 rounded border border-orange-200 shadow-xs tracking-wider">
                            {emp.pin || '1234'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResetEmployeePin(emp)}
                          className="text-[9px] font-black uppercase text-orange-700 hover:text-orange-900 bg-white hover:bg-orange-100 border border-orange-250 px-2 py-0.5 rounded-lg transition cursor-pointer"
                          title="Reset deze pincode terug naar 1234"
                        >
                          Reset naar 1234
                        </button>
                      </div>

                      <div className="border-t border-orange-50 my-1 py-1" />

                      <div className="flex items-center justify-between text-[11px]">
                        <div className="text-slate-500 font-bold uppercase tracking-tight">
                          Totaal: <strong className="text-orange-600 font-black">{empShifts.length}</strong> diensten
                        </div>

                        {publishedCount === 0 ? (
                          <span className="px-2.5 py-1 text-[10px] rounded-full bg-slate-100 text-slate-500 font-black border border-slate-200 uppercase tracking-tight text-center">
                            Geen shifts
                          </span>
                        ) : unconfirmedCount > 0 ? (
                          <span className="px-2.5 py-1 text-[10px] rounded-full bg-rose-100 text-rose-800 font-black border border-rose-200 uppercase tracking-tight animate-pulse">
                            {unconfirmedCount} Onbevestigd
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-200 uppercase tracking-tight text-center flex items-center gap-0.5 justify-center">
                            <Check size={11} className="stroke-[3.5]" /> Akkoord ✓
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {employees.filter(e => e.id !== 'emp1').length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center border-2 border-dashed border-orange-200 shadow-sm space-y-3">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl mx-auto flex items-center justify-center border border-orange-200">
                  <Users size={28} />
                </div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Geen personeelsleden geregistreerd</h3>
                <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                  Er zijn momenteel geen medewerkers in het systeem. Klik hierboven op <strong className="text-orange-600">"Nieuw Teamlid +"</strong> of gebruik <strong className="text-orange-600">"Excel Beheer (.xlsx / .csv)"</strong> om uw team in bulk in te laden.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(true)}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-md transition cursor-pointer"
                  >
                    + Teamlid Toevoegen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExcelSyncModal(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-tight rounded-xl transition border border-slate-200 cursor-pointer"
                  >
                    📊 Excel Importeren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* MEDEWERKER BESCHIKBAARHEID DETAIL OVERZICHT MODAL */}
      {selectedAvailabilityDetail && (() => {
        const targetEmp = selectedAvailabilityDetail.employee;
        const targetWk = selectedAvailabilityDetail.weekNumber;
        const meta = getWeekMeta(targetWk);
        const effResult = getEffectiveEmployeeAvailability(targetEmp, targetWk, availabilities);
        const effAvail = effResult.availability;
        const isFromRec = effResult.source === 'recurring';

        const scheduledShifts = shifts.filter(s => 
          s.employeeId === targetEmp.id && 
          (s.weekNumber || CURRENT_WEEK_NUMBER) === targetWk
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span 
                    className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm text-white uppercase shadow-md border-2 border-white/80 shrink-0"
                    style={{ backgroundColor: targetEmp.color }}
                  >
                    {targetEmp.avatarUrl ? (
                      <img src={targetEmp.avatarUrl} alt={targetEmp.name} className="w-full h-full object-cover" />
                    ) : (
                      targetEmp.name.split(' ').map(n => n[0]).join('')
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black uppercase tracking-tight">{targetEmp.name}</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {targetEmp.statuut}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {targetEmp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                      </span>
                    </div>
                    <p className="text-xs text-orange-100 font-medium">
                      Beschikbaarheidsdetails • <strong>Week {targetWk}</strong> ({meta.dateRange})
                      {isFromRec && ' • 🔁 Vaste herhaling'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAvailabilityDetail(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                  <span>Overzicht van alle ingediende voorkeuren & beschikbare uren:</span>
                  {effAvail ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Beschikbaarheid ingediend
                    </span>
                  ) : (
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⚠️ Nog niet ingediend door medewerker
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {DAYS_OF_WEEK.map((dName, dIdx) => {
                    const dInfo = getDayDateInfo(targetWk, dIdx);
                    const dAvail = effAvail?.days.find(d => d.day === dIdx);
                    const dShifts = scheduledShifts.filter(s => s.day === dIdx);

                    const status = dAvail?.status || 'none';
                    const isPref = status === 'preferred';
                    const isAv = status === 'available';
                    const isUn = status === 'unavailable';

                    return (
                      <div 
                        key={dIdx}
                        className={`p-3.5 rounded-2xl border transition ${
                          isPref ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200' :
                          isAv ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200' :
                          isUn ? 'bg-rose-50/60 border-rose-250 text-rose-950' :
                          'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-24 shrink-0">
                              <span className="font-black text-xs uppercase text-slate-800 block">{dName}</span>
                              <span className="text-[11px] font-bold text-orange-700">{dInfo.shortDate}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isPref ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-xs inline-flex items-center gap-1 border border-amber-300 shadow-2xs">
                                  ⭐ Voorkeur
                                </span>
                              ) : isAv ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs inline-flex items-center gap-1 border border-emerald-300 shadow-2xs">
                                  ✓ Beschikbaar
                                </span>
                              ) : isUn ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-black text-xs inline-flex items-center gap-1 border border-rose-200 shadow-2xs">
                                  ✕ Niet-beschikbaar
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Geen opgave</span>
                              )}
                            </div>
                          </div>

                          {/* Uren & Shift status */}
                          <div className="flex flex-wrap items-center gap-2">
                            {(isPref || isAv) && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-black text-slate-800">
                                <Clock size={12} className="text-orange-600" />
                                <span>Van: <strong>{dAvail?.startTime || 'Open'}</strong> tot <strong>{dAvail?.endTime || 'Sluit'}</strong></span>
                              </div>
                            )}

                            {dShifts.length > 0 ? (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                                📅 Shift ingepland: {dShifts.map(s => `${s.startTime}-${s.endTime}`).join(', ')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAvailabilityDetail(null);
                                  handleOpenAddShift(targetEmp.id, dIdx);
                                }}
                                className="px-2.5 py-1 text-[11px] font-black rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 transition cursor-pointer active:scale-95 flex items-center gap-1"
                              >
                                <Plus size={12} className="stroke-[3]" />
                                <span>Plan Dienst</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {dAvail?.notes && (
                          <div className="mt-2 text-xs italic text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/80">
                            💬 Toelichting van {targetEmp.name}: "{dAvail.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  💡 Tip: Je kunt in het toevoegen/bewerken venster van een dienst direct met één klik de gewenste uren overnemen.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAvailabilityDetail(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SHIFT TOEVOEGEN/BEWERKEN MODAL */}
      {showShiftModal && (() => {
        const modalWeekNumber = selectedShift.weekNumber !== undefined ? selectedShift.weekNumber : selectedManagerWeek;
        const currentDayIndex = selectedShift.day !== undefined ? selectedShift.day : 0;
        const currentAssignedEmp = employees.find(e => e.id === selectedShift.employeeId);
        const currentEmpAge = currentAssignedEmp ? calculateAge(currentAssignedEmp.birthDate) : null;
        const isSelectedEmpMinor = currentAssignedEmp ? isMinorStudent(currentAssignedEmp) : false;
        const isSelectedEmpMissingDob = currentAssignedEmp ? isStudentMissingBirthDate(currentAssignedEmp) : false;

        const currentShiftValidation = selectedShift.employeeId && selectedShift.startTime && selectedShift.endTime && selectedShift.day !== undefined
          ? validateMinorShift(
              currentAssignedEmp,
              { startTime: selectedShift.startTime, endTime: selectedShift.endTime, day: selectedShift.day },
              shifts.filter(s => s.weekNumber === modalWeekNumber),
              selectedShift.id
            )
          : { valid: true, isMinor: false, age: null, shiftHours: 0, error: undefined };

        const hasValidationError = !currentShiftValidation.valid || Boolean(shiftValidationError);
        const activeErrorMessage = currentShiftValidation.error || shiftValidationError;

        // Ensure all weeks including current week, upcoming weeks, archived weeks, and modalWeek are available
        const modalWeeks = (() => {
          const map = new Map<number, WeekMeta>();
          activeWeeks.forEach(w => map.set(w.weekNumber, w));
          archivedWeeks.forEach(w => {
            if (!map.has(w.weekNumber)) map.set(w.weekNumber, w);
          });
          if (!map.has(modalWeekNumber)) {
            map.set(modalWeekNumber, getWeekMeta(modalWeekNumber));
          }
          return Array.from(map.values()).sort((a, b) => a.weekNumber - b.weekNumber);
        })();

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">
                  {selectedShift.isNew ? 'Nieuwe Dienst Toevoegen' : 'Dienst Bewerken'}
                </h3>
                <button 
                  onClick={() => setShowShiftModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Wettelijke waarschuwingen voor minderjarigen & studenten */}
              {isSelectedEmpMissingDob && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Geboortedatum ontbreekt voor {currentAssignedEmp?.name}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Studenten &lt; 18 jaar mogen niet na 23u00 werken en maximaal 8u per dag. Vul de geboortedatum in via Medewerkers om de regels automatisch te handhaven.
                    </p>
                  </div>
                </div>
              )}

              {isSelectedEmpMinor && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 text-xs text-rose-950 flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black flex items-center gap-1.5">
                      <span>🔞 Minderjarige student ({currentAssignedEmp?.name}, {currentEmpAge} jaar)</span>
                    </p>
                    <p className="text-[11px] text-rose-800 mt-0.5 font-medium">
                      Arbeidswetgeving: verboden te werken na <strong>23u00</strong> (geen Sluit/Hulpsluit) en maximaal <strong>8 uur per dag</strong>.
                    </p>
                  </div>
                </div>
              )}

              {hasValidationError && (
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-3 text-xs text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-700 uppercase tracking-tight">Wettelijke Arbeidsbeperking (-18 Jaar)</p>
                    <p className="text-[11px] font-bold text-red-800 mt-0.5">{activeErrorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveShift} className="space-y-4">
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600">Weekrooster</label>
                    <span className="text-[11px] font-bold text-orange-600">
                      {getWeekMeta(modalWeekNumber).dateRange}
                    </span>
                  </div>
                  <select
                    value={modalWeekNumber}
                    onChange={(e) => {
                      const newWeek = parseInt(e.target.value);
                      setShiftValidationError(null);
                      setSelectedShift({ ...selectedShift, weekNumber: newWeek });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold cursor-pointer"
                  >
                    {modalWeeks.map(w => (
                      <option key={w.weekNumber} value={w.weekNumber}>
                        {w.label} ({w.dateRange}) {w.isUpcoming ? '• (Vanaf volgende week)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Medewerker</label>
                    <select
                      required
                      value={selectedShift.isOpenShift && (!selectedShift.employeeId || selectedShift.employeeId === 'open_shift') ? 'open_shift' : (selectedShift.employeeId || '')}
                      onChange={(e) => {
                        setShiftValidationError(null);
                        const empId = e.target.value;
                        if (empId === 'open_shift') {
                          setSelectedShift({
                            ...selectedShift,
                            employeeId: 'open_shift',
                            isOpenShift: true,
                            status: 'published'
                          });
                        } else {
                          const emp = employees.find(x => x.id === empId);
                          setSelectedShift({ 
                            ...selectedShift, 
                            employeeId: empId,
                            department: emp?.department || selectedShift.department || 'zaal'
                          });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>Kies medewerker...</option>
                      <option value="open_shift" className="font-black text-amber-900 bg-amber-100">
                        📢 OPEN DIENST (Zelf inplannen door medewerkers)
                      </option>
                      {sortEmployeesByFirstName(employees).map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.department === 'keuken' ? 'Keuken' : 'Zaal'} - {e.statuut}{e.birthDate && calculateAge(e.birthDate) ? ` - ${calculateAge(e.birthDate)}j` : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Afdeling (Tabblad)</label>
                    <select
                      required
                      value={selectedShift.department || 'zaal'}
                      onChange={(e) => setSelectedShift({ ...selectedShift, department: e.target.value as Department })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    >
                      <option value="zaal">🍽️ Zaal (IDM Zaal)</option>
                      <option value="keuken">🍳 Keuken (IDM Keuken)</option>
                    </select>
                  </div>
                </div>

                {/* Banner: Openstellen voor Zelf-Inplannen */}
                <div className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift'
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-tight text-slate-800">
                      <span>📢 Openstellen voor Zelf-Inplannen</span>
                      {(selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift') && (
                        <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                          Actief
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Zet deze shift open zodat personeelsleden zichzelf hierop in het portaal kunnen inroosteren.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpen = !(selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift');
                      setSelectedShift({
                        ...selectedShift,
                        isOpenShift: nextOpen,
                        employeeId: nextOpen && (!selectedShift.employeeId || selectedShift.employeeId === '') ? 'open_shift' : selectedShift.employeeId,
                        status: nextOpen ? 'published' : selectedShift.status
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer active:scale-95 shrink-0 border ${
                      selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {selectedShift.isOpenShift || selectedShift.employeeId === 'open_shift' ? '✓ Opengezet' : '+ Openzetten'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600">Dag van de week</label>
                      <span className="text-[11px] font-black text-orange-600">
                        {getDayDateInfo(modalWeekNumber, currentDayIndex).shortDate}
                      </span>
                    </div>
                    <select
                      required
                      value={selectedShift.day !== undefined ? selectedShift.day : 0}
                      onChange={(e) => {
                        setShiftValidationError(null);
                        setSelectedShift({ ...selectedShift, day: parseInt(e.target.value) });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {DAYS_OF_WEEK.map((d, idx) => {
                        const dayInfo = getDayDateInfo(modalWeekNumber, idx);
                        return (
                          <option key={idx} value={idx}>
                            {d} ({dayInfo.shortDate})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Dienststatus</label>
                    <select
                      required
                      value={selectedShift.status || 'draft'}
                      onChange={(e) => setSelectedShift({ ...selectedShift, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="draft">Ontwerp (Geheim)</option>
                      <option value="published">Gepubliceerd (Zichtbaar)</option>
                    </select>
                  </div>
                </div>

                {/* Medewerker Beschikbaarheidsindicator & 1-Klik Uren Overname */}
                {currentAssignedEmp && (() => {
                  const empAvailData = getEffectiveEmployeeAvailability(currentAssignedEmp, modalWeekNumber, availabilities);
                  const dayAvailInfo = empAvailData.availability?.days.find(d => d.day === currentDayIndex);
                  
                  if (!dayAvailInfo) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Info size={14} className="text-slate-400" />
                          <span>Geen specifieke beschikbaarheid opgegeven voor {DAYS_OF_WEEK[currentDayIndex]}</span>
                        </span>
                      </div>
                    );
                  }

                  const isPreferred = dayAvailInfo.status === 'preferred';
                  const isAvail = dayAvailInfo.status === 'available';
                  const isUnavail = dayAvailInfo.status === 'unavailable';

                  return (
                    <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                      isPreferred ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-200' :
                      isAvail ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200' :
                      'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-200'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-black uppercase text-[11px]">
                          <span>{isPreferred ? '⭐ Voorkeur Medewerker' : isAvail ? '✓ Beschikbaar' : '✕ Niet-beschikbaar'}</span>
                          {empAvailData.source === 'recurring' && (
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold lowercase">
                              🔁 vaste herhaling
                            </span>
                          )}
                        </div>
                        {(isPreferred || isAvail) && (dayAvailInfo.startTime || dayAvailInfo.endTime) && (
                          <button
                            type="button"
                            onClick={() => {
                              setShiftValidationError(null);
                              setSelectedShift({
                                ...selectedShift,
                                startTime: dayAvailInfo.startTime || 'Open',
                                endTime: dayAvailInfo.endTime || 'Sluit'
                              });
                            }}
                            className="text-[10px] font-black uppercase bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 px-2 py-1 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                            title="Klik om de opgegeven uren direct in te vullen"
                          >
                            <Zap size={11} className="fill-orange-500 text-orange-500" />
                            <span>Neem uren over ({dayAvailInfo.startTime || 'Open'} - {dayAvailInfo.endTime || 'Sluit'})</span>
                          </button>
                        )}
                      </div>

                      {(isPreferred || isAvail) && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                          <Clock size={12} className="text-orange-600 shrink-0" />
                          <span>Opgegeven uren: <strong className="text-orange-950 bg-white/90 px-1.5 py-0.5 rounded border border-orange-200">{dayAvailInfo.startTime || 'Open'} tot {dayAvailInfo.endTime || 'Sluit'}</strong></span>
                        </div>
                      )}

                      {dayAvailInfo.notes && (
                        <p className="text-[10.5px] italic text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/80">
                          Toelichting: "{dayAvailInfo.notes}"
                        </p>
                      )}

                      {isUnavail && (
                        <p className="text-[11px] font-black text-rose-700">
                          ⚠️ Let op: {currentAssignedEmp.name} heeft aangegeven niet beschikbaar te zijn op {DAYS_OF_WEEK[currentDayIndex]}!
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Begintijd</label>
                    <input
                      type="text"
                      required
                      placeholder="Bijv. Open, 16u00, 17u00"
                      value={selectedShift.startTime || ''}
                      onChange={(e) => {
                        setShiftValidationError(null);
                        setSelectedShift({ ...selectedShift, startTime: e.target.value });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Open', '10u00', '15u30', '16u00', '16u30', '17u00'].map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => {
                            setShiftValidationError(null);
                            setSelectedShift({ ...selectedShift, startTime: time });
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold transition cursor-pointer ${
                            selectedShift.startTime === time ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span>Eindtijd</span>
                      {isSelectedEmpMinor && (
                        <span className="text-[9px] font-black text-rose-600">Max. 23u00</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isSelectedEmpMinor ? "Bijv. 18u00, 22u00, 23u00" : "Bijv. 18u00, Sluit, Hulpsluit"}
                      value={selectedShift.endTime || ''}
                      onChange={(e) => {
                        setShiftValidationError(null);
                        setSelectedShift({ ...selectedShift, endTime: e.target.value });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(isSelectedEmpMinor 
                        ? ['18u00', '20u00', '21u00', '22u00', '23u00'] 
                        : ['18u00', '23u00', '23u30', 'Sluit', 'Hulpsluit']
                      ).map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => {
                            setShiftValidationError(null);
                            setSelectedShift({ ...selectedShift, endTime: time });
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold transition cursor-pointer ${
                            selectedShift.endTime === time ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Speciale instructies of opmerkingen</label>
                  <textarea
                    rows={2}
                    placeholder="Bijv: Inclusief opruimen"
                    value={selectedShift.notes || ''}
                    onChange={(e) => setSelectedShift({ ...selectedShift, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none animate-none"
                  />
                </div>

                {/* Openstaande Dienst Toggle */}
                <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3 space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-xs font-black uppercase tracking-tight text-amber-950 flex items-center gap-1.5">
                      <Megaphone size={14} className="text-amber-600 stroke-[2.5]" />
                      <span>📢 Openstaande Dienst (Ruilbord)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedShift.isOpenShift)}
                      onChange={(e) => setSelectedShift({ ...selectedShift, isOpenShift: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </label>
                  <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                    Stel deze dienst open voor het hele team. Flexi's, studenten en extra's zien dit direct op het Ruilbord en kunnen zich aanmelden als kandidaat.
                  </p>
                </div>

                {!selectedShift.isNew && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Bevestigd door medewerker:</span>
                    {selectedShift.acknowledged ? (
                      <span className="text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><Check size={12} className="mr-0.5 inline" /> Ja</span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">Nee</span>
                    )}
                  </div>
                )}

                {/* 1-Click Shift-Herinnering voor de Werkdag */}
                {!selectedShift.isNew && !selectedShift.isOpenShift && currentAssignedEmp && (
                  <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-tight text-amber-950 flex items-center gap-1.5">
                        <BellRing size={15} className="text-amber-600 stroke-[2.5]" />
                        <span>Shift-Herinnering Werkdag</span>
                      </span>
                      {selectedShift.lastReminderSentAt && (
                        <span className="text-[10px] text-amber-900 font-black bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300">
                          Herinnerd om {new Date(selectedShift.lastReminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                      Stuur met één klik een officiële herinneringsnotificatie naar <strong>{currentAssignedEmp.name}</strong> ter voorbereiding op de komende werkdag.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleSendSingleShiftReminder(selectedShift as Shift);
                        }}
                        className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Bell size={13} className="stroke-[2.5]" />
                        <span>{selectedShift.lastReminderSentAt ? 'Opnieuw Herinnering Sturen' : 'Stuur Shift-Herinnering (1-klik)'}</span>
                      </button>

                      {currentAssignedEmp.phone && (
                        <button
                          type="button"
                          onClick={() => {
                            const wNum = selectedShift.weekNumber || selectedManagerWeek;
                            const dayIdx = selectedShift.day !== undefined ? selectedShift.day : 0;
                            const dayInfo = getDayDateInfo(wNum, dayIdx);
                            const dayName = DAYS_FULL_NL[dayIdx];
                            const deptLabel = (selectedShift.department || currentAssignedEmp.department) === 'keuken' ? 'Keuken' : 'Zaal';
                            const raw = currentAssignedEmp.phone.replace(/[^0-9]/g, '');
                            const intlP = (raw.startsWith('0') && raw.length === 10) ? '32' + raw.substring(1) : raw;
                            const waMsg = encodeURIComponent(
                              `Hallo ${currentAssignedEmp.name}! 👋\n\nHerinnering vanuit In De Molen voor je shift:\n📅 ${dayName} ${dayInfo.shortDate}\n⏰ ${selectedShift.startTime} - ${selectedShift.endTime} (${deptLabel})\n\nGelieve je aanwezigheid tijdig te bevestigen in het portaal. Tot dan!`
                            );
                            window.open(`https://wa.me/${intlP}?text=${waMsg}`, '_blank');
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          title={`Open direct WhatsApp gesprek met ${currentAssignedEmp.phone}`}
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!selectedShift.isNew && selectedShift.id && onOpenShiftForSwap && !selectedShift.isOpenShift && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedShift.id && onOpenShiftForSwap) {
                          onOpenShiftForSwap(selectedShift.id, selectedShift.notes || 'Openstaande dienst: wie kan inspringen?');
                          setShowShiftModal(false);
                          setSixWeeksSuccessMsg(`📢 Dienst is nu opengesteld op het Ruilbord! Medewerkers kunnen direct intekenen.`);
                          setTimeout(() => setSixWeeksSuccessMsg(null), 5000);
                        }
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeftRight size={14} className="stroke-[2.5]" />
                      <span>📢 Openstellen voor Intekening (Ruilbord)</span>
                    </button>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {!selectedShift.isNew && (
                    <button
                      type="button"
                      onClick={() => handleDeleteShiftClick(selectedShift.id!)}
                      className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center border font-bold text-xs gap-1 cursor-pointer ${
                        isConfirmingDeleteShift 
                          ? 'bg-red-650 hover:bg-red-800 text-white border-red-700 animate-pulse' 
                          : 'bg-red-50 hover:bg-red-100 text-red-650 border-red-100'
                      }`}
                      title={isConfirmingDeleteShift ? "Nogmaals klikken om DEFINITIEF te verwijderen" : "Verwijder Dienst"}
                    >
                      <Trash2 size={16} className="stroke-[2.5]" />
                      {isConfirmingDeleteShift && <span>Zeker?</span>}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={!currentShiftValidation.valid}
                    className={`flex-1 py-2.5 text-white text-xs font-semibold rounded-xl shadow-sm transition ${
                      !currentShiftValidation.valid
                        ? 'bg-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                    }`}
                    title={!currentShiftValidation.valid ? currentShiftValidation.error : 'Dienst opslaan'}
                  >
                    Opslaan
                  </button>
                </div>

              </form>
            </div>
          </div>
        );
      })()}


      {/* MEDEWERKER TOEVOEGEN MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Teamlid Registreren</h3>
              <button 
                onClick={() => {
                  setShowEmployeeModal(false);
                  setIsBulkMode(false);
                }}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setIsBulkMode(false)}
                className={`flex-1 py-1.5 text-xs font-black uppercase tracking-tight rounded-lg transition cursor-pointer ${!isBulkMode ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Enkel toevoegen
              </button>
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className={`flex-1 py-1.5 text-xs font-black uppercase tracking-tight rounded-lg transition cursor-pointer ${isBulkMode ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Snelle lijst
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmployeeModal(false);
                  setShowExcelSyncModal(true);
                }}
                className="flex-1 py-1.5 text-xs font-black uppercase tracking-tight rounded-lg transition text-emerald-800 hover:text-emerald-950 flex items-center justify-center gap-1 bg-emerald-100/70 hover:bg-emerald-200/80 border border-emerald-300 cursor-pointer"
                title="Open Excel/CSV beheer om te exporteren, importeren en personen te verwijderen of toe te voegen"
              >
                <FileSpreadsheet size={13} />
                <span>Excel (.xlsx)</span>
              </button>
            </div>

            {!isBulkMode ? (
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Volledige Naam</label>
                  <input
                    type="text"
                    required
                    placeholder="Bijv: Thomas Janssen"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Afdeling (Tabblad)</label>
                  <select
                    required
                    value={newEmp.department || 'zaal'}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value as Department })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold cursor-pointer"
                  >
                    <option value="zaal">🍽️ Zaal (IDM Zaal)</option>
                    <option value="keuken">🍳 Keuken (IDM Keuken)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Statuut</label>
                    <select
                      required
                      value={newEmp.statuut}
                      onChange={(e) => setNewEmp({ ...newEmp, statuut: e.target.value as EmployeeStatuut })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="Student">Student</option>
                      <option value="Flexi">Flexi</option>
                      <option value="Vast">Vast</option>
                      <option value="Extra">Extra</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Ervaring</label>
                    <select
                      required
                      value={newEmp.experience}
                      onChange={(e) => setNewEmp({ ...newEmp, experience: e.target.value as ExperienceLevel })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Gemiddeld">Gemiddeld</option>
                      <option value="Ervaren">Ervaren</option>
                      <option value="Verantwoordelijke">Verantwoordelijke</option>
                    </select>
                  </div>
                </div>

                {/* Geboortedatum (verplicht voor studenten) */}
                <div className="space-y-1 bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>🎂 Geboortedatum</span>
                      {newEmp.statuut === 'Student' && (
                        <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 uppercase">
                          Verplicht voor student
                        </span>
                      )}
                    </span>
                    {newEmp.birthDate && calculateAge(newEmp.birthDate) !== null && (
                      <span className="text-xs font-black text-slate-800">
                        {calculateAge(newEmp.birthDate)} jaar
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    required={newEmp.statuut === 'Student'}
                    value={newEmp.birthDate || ''}
                    onChange={(e) => setNewEmp({ ...newEmp, birthDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {newEmp.birthDate && calculateAge(newEmp.birthDate) !== null ? (
                    <div className="pt-0.5">
                      {calculateAge(newEmp.birthDate)! < 18 ? (
                        <p className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 flex items-center gap-1">
                          <span>🔞</span>
                          <span>Minderjarig (&lt;18 jaar): mag niet na 23u00 werken en max. 8u/dag.</span>
                        </p>
                      ) : (
                        <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <span>✓</span>
                          <span>Meerderjarig (18+ jaar)</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      Wettelijk vereist voor studenten om arbeidstijden (&lt;18 regels) automatisch te beveiligen.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Telefoon (GSM)</label>
                    <input
                      type="text"
                      placeholder="0471..."
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Facebook URL</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={newEmp.facebookUrl}
                      onChange={(e) => setNewEmp({ ...newEmp, facebookUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <KeyRound size={13} className="text-orange-600" />
                      <span>Persoonlijke Pincode (PIN)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Standaard: 1234</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={newEmp.pin}
                    onChange={(e) => setNewEmp({ ...newEmp, pin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    De medewerker gebruikt deze code om persoonlijk in te loggen op het portaal.
                  </p>
                </div>

                {/* Rol & Beheerrechten */}
                <div className="space-y-1.5 bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-amber-600" />
                      <span>Rol & Bevoegdheden</span>
                    </span>
                    {newEmp.role === 'beheerder' && (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                        👑 Beheerder
                      </span>
                    )}
                  </label>
                  <select
                    value={newEmp.role || 'medewerker'}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as 'medewerker' | 'beheerder' })}
                    className="w-full bg-white border border-slate-300 text-slate-850 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="medewerker">Medewerker (Toegang tot Personeelsportaal)</option>
                    <option value="beheerder">👑 Beheerder (Volledige toegang tot Beheerdersdashboard)</option>
                  </select>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    {newEmp.role === 'beheerder' 
                      ? '👑 Deze beheerder kan inloggen in het Beheerdersdashboard met zijn/haar naam of e-mail en pincode.'
                      : 'Medewerkers hebben toegang tot hun eigen shifts, beschikbaarheden en ruilverzoeken.'}
                  </p>
                </div>

                <div className="bg-orange-50 text-orange-950 rounded-xl p-3 text-[10px] leading-relaxed border border-orange-100">
                  <strong>💡 Let op:</strong> Nieuw personeel logt in met hun naam en deze persoonlijke 4-cijferige pincode!
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(false)}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                  >
                    Opslaan
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleBulkCreateEmployees} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Namenlijst (één naam per regel)</label>
                  <p className="text-[10px] text-slate-500 leading-tight">Plak of typ hier een lijst met namen. Elk op een nieuwe regel.</p>
                  <textarea
                    required
                    rows={5}
                    placeholder="Thomas Janssen&#10;Sophie De Smet&#10;Jan Peeters"
                    value={bulkNamesText}
                    onChange={(e) => setBulkNamesText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl px-3 py-2 text-xs font-mono mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Standaard Afdeling</label>
                  <select
                    required
                    value={bulkDepartment}
                    onChange={(e) => setBulkDepartment(e.target.value as Department)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold cursor-pointer"
                  >
                    <option value="zaal">🍽️ Zaal (IDM Zaal)</option>
                    <option value="keuken">🍳 Keuken (IDM Keuken)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Standaard Statuut</label>
                    <select
                      required
                      value={bulkStatuut}
                      onChange={(e) => setBulkStatuut(e.target.value as EmployeeStatuut)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="Student">Student (Standaard)</option>
                      <option value="Flexi">Flexi</option>
                      <option value="Vast">Vast</option>
                      <option value="Extra">Extra</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Standaard Ervaring</label>
                    <select
                      required
                      value={bulkExperience}
                      onChange={(e) => setBulkExperience(e.target.value as ExperienceLevel)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="Beginner">Beginner (Standaard)</option>
                      <option value="Gemiddeld">Gemiddeld</option>
                      <option value="Ervaren">Ervaren</option>
                      <option value="Verantwoordelijke">Verantwoordelijke</option>
                    </select>
                  </div>
                </div>

                <div className="bg-orange-50 text-orange-950 rounded-xl p-3 text-[10px] leading-relaxed border border-orange-100">
                  <strong>💡 Sneltoevoegen:</strong> Alle medewerkers zijn meteen actief en kunnen onmiddellijk worden ingeroosterd!
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmployeeModal(false);
                      setIsBulkMode(false);
                    }}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                  >
                    Bulk uploaden
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Personeel Notificeren / Delen Modal (WhatsApp & Outlook) */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        employees={employees}
        shifts={shifts}
        weekNumber={selectedManagerWeek}
        onMarkNotified={(ids, type) => {
          if (onMarkNotified) {
            onMarkNotified(ids, type);
          }
        }}
      />

      {/* Cloud Backup & Archief Modal */}
      <BackupManagerModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        currentWeek={selectedManagerWeek}
        shifts={shifts}
        employees={employees}
        onRestoreSchedule={(restoredShifts, weekNum) => {
          if (onRestoreSchedule) {
            onRestoreSchedule(restoredShifts, weekNum);
          }
        }}
      />

      {/* 6-Weken Planning Horizon Modal */}
      {showSixWeeksModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-2 border-orange-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight flex items-center gap-2">
                    <span>6-Weken Planning Horizon</span>
                    <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      W{UPCOMING_SIX_WEEKS_FROM_NEXT[0]} t/m W{UPCOMING_SIX_WEEKS_FROM_NEXT[UPCOMING_SIX_WEEKS_FROM_NEXT.length - 1]}
                    </span>
                  </h3>
                  <p className="text-xs text-orange-100 font-medium">
                    Vanaf volgende week (Week {NEXT_WEEK_NUMBER}): complete personeelsplanningen 6 weken vooruit klaargezet voor Zaal en Keuken.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSixWeeksModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Highlights Policy Box */}
              <div className="bg-orange-50/70 border-2 border-orange-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1.5">
                <div className="font-black text-orange-900 flex items-center gap-2 uppercase tracking-wide">
                  <span>⚡</span>
                  <span>In De Molen Personeelsnormen in de 6-Weken Horizon</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-black">✓</span>
                    <span><strong>Pat & Matthias:</strong> Exact 4 dagen fulltime per week</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-black">✓</span>
                    <span><strong>Overig Vast personeel:</strong> 5 dagen / 38u fulltime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-black">✓</span>
                    <span><strong>Zondagopening:</strong> Vroegdienst va. 09:30/10:00 uur</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-black">✓</span>
                    <span><strong>2-Weken Regel:</strong> Beschikbaarheid deadline tijdig zichtbaar</span>
                  </li>
                </ul>
              </div>

              {/* Weeks Table */}
              <div className="border-2 border-orange-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="min-w-full divide-y-2 divide-orange-100">
                  <thead className="bg-orange-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase">Week</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase">Periode</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase">Totaal Shifts</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase">Zaal / Keuken</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-black text-slate-700 uppercase">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-orange-50 text-xs">
                    {UPCOMING_SIX_WEEKS_FROM_NEXT.map((wk) => {
                      const meta = getWeekMeta(wk);
                      const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === wk);
                      const zaalCount = weekShifts.filter(s => s.department === 'zaal').length;
                      const keukenCount = weekShifts.filter(s => s.department === 'keuken').length;
                      const draftCount = weekShifts.filter(s => s.status === 'draft').length;
                      const isPublished = weekShifts.length > 0 && draftCount === 0;

                      return (
                        <tr key={wk} className="hover:bg-orange-50/30 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap font-black text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>Week {wk}</span>
                              {wk === NEXT_WEEK_NUMBER && (
                                <span className="bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                  Volgende
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-600">
                            {meta.dateRange}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-black text-slate-800">
                            {weekShifts.length} diensten
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-500">
                            <span className="text-orange-600">{zaalCount} Zaal</span>
                            <span className="mx-1">•</span>
                            <span className="text-amber-700">{keukenCount} Keuken</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isPublished ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-black text-[10px] uppercase">
                                ✓ Gepubliceerd
                              </span>
                            ) : weekShifts.length > 0 ? (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>{draftCount} Concept(en)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-black text-[10px] uppercase">
                                Leeg
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedManagerWeek(wk);
                                setAutoPlanWeek(wk);
                                setShowSixWeeksModal(false);
                              }}
                              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                            >
                              Bekijk Rooster
                            </button>
                            {draftCount > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  onPublishAllDrafts(wk);
                                  setSixWeeksSuccessMsg(`Week ${wk} is succesvol gepubliceerd!`);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                              >
                                Publiceer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t-2 border-orange-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrepareSixWeeksHorizon(true, false)}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-black rounded-xl text-xs uppercase transition cursor-pointer"
                  title="Genereert verse evenwichtige planningen voor alle 6 weken"
                >
                  ⚡ Hergenereer Alle 6 Weken
                </button>
                <button
                  type="button"
                  onClick={handlePublishAllSixWeeks}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-sm transition cursor-pointer"
                >
                  📢 Publiceer Alle 6 Weken
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSixWeeksModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs uppercase transition cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Planner Confirmation Modal */}
      {showAutoPlanConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Slimme Planning Genereren
                  </h3>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                    Week {autoPlanWeek}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoPlanConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <p className="text-xs text-slate-500">
                Het algoritme vult Week {autoPlanWeek} automatisch in volgens de vaste bezettingsnormen en medewerker-beschikbaarheden:
              </p>

              <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-700">
                <div className="font-black text-orange-900 mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-600" /> Bezettingsregels:
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span><strong>Overdag:</strong> 2 personen per dag (11:00 - 18:00)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span><strong>Avond Ma & Di:</strong> 4 personen (1 sluit + 1 hulpsluit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span><strong>Avond Wo & Do:</strong> 5 personen (1 sluit + 1 hulpsluit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span><strong>Avond Vr, Za & Zo:</strong> 7 personen (1 sluit + 1 hulpsluit)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bestaande diensten voor <strong>Week {autoPlanWeek}</strong> worden overschreven door deze nieuwe ontwerp-planning.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAutoPlanConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleExecuteAutoPlan}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-orange-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Planning Genereren 🪄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Team / Empty Employees Warning Modal */}
      {showNoTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Geen Medewerkers Gevonden
                  </h3>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                    Team vereist voor planning
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNoTeamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Er zijn momenteel geen actieve personeelsleden geregistreerd om in te delen in het rooster. Je kunt handmatig medewerkers aanmaken, importeren via Excel, of direct het standaard voorbeeldteam inladen.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleLoadSampleTeam}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Standaard Voorbeeldteam Inladen (12 medewerkers)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoTeamModal(false);
                  setActiveSubTab('team');
                }}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Naar Medewerkers Beheer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel / CSV Employee Sync Modal */}
      <ExcelEmployeeSyncModal
        isOpen={showExcelSyncModal}
        onClose={() => setShowExcelSyncModal(false)}
        employees={employees}
        shifts={shifts}
        onBulkSyncEmployees={(newEmployees, removedIds) => {
          if (onBulkSyncEmployees) {
            onBulkSyncEmployees(newEmployees, removedIds);
          }
        }}
      />

      {/* Excel Availability Bulk Upload / Download Modal */}
      <ExcelAvailabilityBulkModal
        isOpen={showExcelAvailabilityModal}
        onClose={() => setShowExcelAvailabilityModal(false)}
        employees={employees}
        availabilities={availabilities}
        currentWeekNumber={selectedManagerWeek}
        onBulkUpdateAvailability={(updatedAvailabilities) => {
          if (onBulkUpdateAvailability) {
            onBulkUpdateAvailability(updatedAvailabilities);
          }
        }}
      />

      {/* Gemini AI Rooster Proposal Modal */}
      <GeminiRoosterModal
        isOpen={showGeminiModal}
        onClose={() => setShowGeminiModal(false)}
        employees={employees}
        availabilities={availabilities}
        availableWeeks={AVAILABLE_WEEKS}
        defaultWeekNumber={selectedManagerWeek || autoPlanWeek}
        onApplyProposal={handleApplyGeminiProposal}
      />

      {/* Canteen Schedule PDF / Print Export Modal */}
      <SchedulePrintModal
        isOpen={showSchedulePrintModal}
        onClose={() => setShowSchedulePrintModal(false)}
        employees={employees}
        shifts={shifts}
        initialWeek={selectedManagerWeek}
        initialDepartment={activeSubTab === 'keuken' ? 'keuken' : activeSubTab === 'zaal' ? 'zaal' : 'all'}
      />

      {/* Confirmation Modal: Clear Week Roster (Wis Knop) */}
      {showClearWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Weekrooster Wissen
                  </h3>
                  <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">
                    Week {selectedManagerWeek} ({getWeekMeta(selectedManagerWeek).dateRange})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClearWeekModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Weet je zeker dat je alle <strong>{activeWeekShifts.length} ingevulde diensten</strong> voor <strong>Week {selectedManagerWeek}</strong> wilt wissen? Deze actie verwijdert alle geplande uren voor deze week.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearWeekModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={confirmClearWeekRoster}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Wis Alle {activeWeekShifts.length} Diensten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Copy Previous Week */}
      {showCopyWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Copy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Diensten Kopiëren
                  </h3>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                    Van Week {selectedManagerWeek - 1} naar Week {selectedManagerWeek}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCopyWeekModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Week {selectedManagerWeek} bevat al <strong>{activeWeekShifts.length} diensten</strong>. Wil je de diensten uit Week {selectedManagerWeek - 1} hieraan toevoegen als nieuwe concept-diensten?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCopyWeekModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={executeCopyPreviousWeek}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Toevoegen als Concept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Publish Six Weeks Horizon */}
      {showPublishSixWeeksConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    6 Weken Definitief Publiceren
                  </h3>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                    Week {UPCOMING_SIX_WEEKS_FROM_NEXT[0]} t/m Week {UPCOMING_SIX_WEEKS_FROM_NEXT[UPCOMING_SIX_WEEKS_FROM_NEXT.length - 1]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishSixWeeksConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Weet je zeker dat je alle concept-diensten voor de komende 6 weken definitief wilt publiceren? Alle medewerkers kunnen hun diensten dan direct inzien en bevestigen.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPublishSixWeeksConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={executePublishAllSixWeeks}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Definitief Publiceren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📢 SNELLE MEDEDELING PLAATSEN MODAL */}
      {showQuickNoticeModal && (
        <div 
          id="quick-notice-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans"
        >
          <div 
            id="quick-notice-modal-content"
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border-2 border-orange-200 space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner shrink-0">
                  <Megaphone size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                    Mededeling Plaatsen
                  </h3>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                    Direct zichtbaar op het startscherm van het personeel
                  </p>
                </div>
              </div>
              <button
                id="close-quick-notice-modal-btn"
                type="button"
                onClick={() => setShowQuickNoticeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-tight flex items-center justify-between">
                  <span>Categorie</span>
                  <span className="text-[10px] text-slate-400 font-normal">Kies type bericht</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'planning', label: 'Planningsupdate 📅', color: 'border-blue-300 bg-blue-50 text-blue-800' },
                    { val: 'wijziging', label: 'Belangrijke Wijziging 🔄', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                    { val: 'belangrijk', label: 'Urgent / Belangrijk ⚠️', color: 'border-red-300 bg-red-50 text-red-800' },
                    { val: 'algemeen', label: 'Algemeen 💬', color: 'border-slate-300 bg-slate-50 text-slate-800' },
                  ].map(c => (
                    <button
                      type="button"
                      key={c.val}
                      onClick={() => setNewNotice({ ...newNotice, category: c.val as any })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                        newNotice.category === c.val
                          ? `${c.color} ring-2 ring-orange-500 shadow-xs font-black`
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Titel</label>
                  <span className="text-[10px] text-slate-400 font-medium">Snelvoorstellen:</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {[
                    `Rooster Week ${selectedManagerWeek} is online!`,
                    'Aangepaste sluitdiensttijden',
                    'Extra drukte verwacht'
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setNewNotice({ ...newNotice, title: preset })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-850 border border-orange-200 font-semibold transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  id="quick-notice-title-input"
                  type="text"
                  required
                  placeholder="Bijv. Gewijzigde sluitingstijden dit weekend"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Inhoud mededeling</label>
                <textarea
                  id="quick-notice-content-input"
                  required
                  rows={4}
                  placeholder="Typ hier de tekst voor het personeelsteam. Iedereen ziet dit direct op het personeelspaneel..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickNoticeModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  id="quick-notice-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Mededeling Plaatsen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Avatar / Camera Profile Photo Modal */}
      {selectedAvatarEmployee && (
        <EmployeeAvatarModal
          isOpen={!!selectedAvatarEmployee}
          onClose={() => setSelectedAvatarEmployee(null)}
          employee={selectedAvatarEmployee}
          onSaveAvatar={(empId, newAvatarUrl) => {
            const target = employees.find(e => e.id === empId);
            if (target) {
              const updated = {
                ...target,
                avatarUrl: newAvatarUrl || undefined
              };
              onUpdateEmployee(updated);
              setSelectedAvatarEmployee(updated);
            }
          }}
        />
      )}

      {/* Shift-Herinneringen Komende Werkdag Modal */}
      <ShiftReminderModal
        isOpen={showShiftReminderModal}
        onClose={() => setShowShiftReminderModal(false)}
        shifts={shifts}
        employees={employees}
        weekNumber={selectedManagerWeek}
        onSendSingleReminder={handleSendSingleShiftReminder}
        onSendBatchReminders={handleSendBatchReminders}
      />

    </div>
  );
}
