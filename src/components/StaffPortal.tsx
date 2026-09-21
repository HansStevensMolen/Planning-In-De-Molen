import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  AlertTriangle, 
  Megaphone, 
  Users, 
  ArrowLeftRight, 
  Sparkles, 
  CheckCheck, 
  Phone, 
  Mail,
  User,
  Plus,
  Send,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Facebook,
  Search,
  ExternalLink,
  MessageCircle,
  X,
  PhoneCall,
  Edit3,
  Shield,
  ChevronRight,
  Info,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Lock,
  Printer,
  AlarmClock,
  BellRing,
  LogOut,
  KeyRound,
  ShieldCheck,
  Archive,
  Repeat
} from 'lucide-react';
import { Employee, Shift, Notice, SwapRequest, EmployeeAvailability, DayAvailability, Department, RecurringAvailability, RecurringShiftPreference, RecurringFrequency } from '../types';
import InDeMolenLogo from './InDeMolenLogo';
import StaffGuideModal from './StaffGuideModal';
import StaffProfileModal from './StaffProfileModal';
import SchedulePrintModal from './SchedulePrintModal';
import StaffLogin from './StaffLogin';
import { 
  openWhatsAppForEmployee, 
  exportEmployeeToICS, 
  exportEmployeeToAppleCalendar, 
  exportEmployeeToGoogleCalendarICS, 
  exportEmployeeToOutlook, 
  openEmailForEmployee, 
  formatPhoneForCall, 
  formatPhoneForWhatsApp,
  generateGoogleCalendarUrl,
  generateOutlookWebUrl,
  openGoogleCalendarForShift
} from '../utils/notificationUtils';
import { AVAILABLE_WEEKS, getWeekMeta, isAvailabilityPastDeadline, getAvailabilityDeadlineInfo, isWeekAvailabilityLocked, CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER, getDateOfISOWeek, getDayDateInfo, getAutoActiveWeeks, getAutoArchivedWeeks } from '../utils/weekUtils';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';
import StaffHoursTracker from './StaffHoursTracker';
import { calculateShiftDurationHours } from '../utils/employeeAgeUtils';

interface StaffPortalProps {
  employees: Employee[];
  shifts: Shift[];
  notices: Notice[];
  swapRequests: SwapRequest[];
  availabilities: EmployeeAvailability[];
  onAcknowledgeShift: (shiftId: string) => void;
  onAddSwapRequest: (request: Omit<SwapRequest, 'id' | 'status' | 'date'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onAddEmployee?: (employee: Omit<Employee, 'id'>) => Employee | void;
  onUpdateAvailability: (employeeId: string, weekNumber: number, days: DayAvailability[]) => void;
  onSignUpForOpenShift?: (swapRequestId: string, employeeId: string, employeeName: string, note?: string) => void;
  onCancelSignUpOpenShift?: (swapRequestId: string, employeeId: string) => void;
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

import { 
  getBeginTimes as getBeginTimesUtil, 
  getEndTimes as getEndTimesUtil,
  normalizeAvailabilityTime
} from '../utils/availabilityTimeOptions';

export const getBeginTimes = (day: number): string[] => getBeginTimesUtil(day);
export const getEndTimes = (day: number, startTime: string): string[] => getEndTimesUtil(day, startTime);


const CATEGORY_ICONS = {
  planning: '📅',
  wijziging: '🔄',
  belangrijk: '⚠️',
  algemeen: '💬'
};

const CATEGORY_COLORS = {
  planning: 'bg-blue-50 text-blue-700 border-blue-100',
  wijziging: 'bg-amber-50 text-amber-700 border-amber-100',
  belangrijk: 'bg-red-50 text-red-700 border-red-100',
  algemeen: 'bg-slate-50 text-slate-700 border-slate-100'
};

export interface Shift24HourAlert {
  shift: Shift;
  isWithin24Hours: boolean;
  isOngoing: boolean;
  timeRemainingText: string;
  dayLabel: string;
  formattedDate: string;
  totalHours: number;
}

/**
 * Calculates whether a shift starts within 24 hours or is currently ongoing,
 * providing rich Dutch countdown information for visual indicators.
 */
export const getShift24HourDetails = (shift: Shift, now: Date = new Date()): Shift24HourAlert | null => {
  if (!shift.startTime) return null;

  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = (shift.endTime || '23:59').split(':').map(Number);

  // App Day mapping: 0 = Maandag, ..., 6 = Zondag
  const jsDay = now.getDay();
  const currentAppDay = jsDay === 0 ? 6 : jsDay - 1;
  const currentISOWeek = CURRENT_WEEK_NUMBER;

  let shiftDate: Date;

  if (shift.weekNumber) {
    const monday = getDateOfISOWeek(shift.weekNumber, now.getFullYear());
    shiftDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + shift.day, startH, startM || 0, 0, 0);
  } else {
    // Relative to current day
    shiftDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM || 0, 0, 0);
    if (shift.day === (currentAppDay + 1) % 7) {
      shiftDate.setDate(shiftDate.getDate() + 1);
    } else if (shift.day !== currentAppDay) {
      const dayDiff = (shift.day - currentAppDay + 7) % 7;
      shiftDate.setDate(shiftDate.getDate() + dayDiff);
    }
  }

  // Calculate shift end datetime (handling shifts past midnight, e.g. 17:00 - 01:00)
  const endDate = new Date(shiftDate.getTime());
  if (endH < startH || (endH === startH && (endM || 0) < (startM || 0))) {
    endDate.setDate(endDate.getDate() + 1);
  }
  endDate.setHours(endH, endM || 0, 0, 0);

  const msToStart = shiftDate.getTime() - now.getTime();
  const msToEnd = endDate.getTime() - now.getTime();

  const isOngoing = msToStart <= 0 && msToEnd > 0;
  const isWithin24Hours = (msToStart > 0 && msToStart <= 24 * 60 * 60 * 1000) || isOngoing;

  if (!isWithin24Hours && !isOngoing) {
    return null;
  }

  let timeRemainingText = '';
  if (isOngoing) {
    timeRemainingText = `Nu actief (tot ${shift.endTime})`;
  } else {
    const totalMinutes = Math.max(0, Math.floor(msToStart / (1000 * 60)));
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) {
      timeRemainingText = `Begint over ${m} min`;
    } else if (m === 0) {
      timeRemainingText = `Begint over ${h} uur`;
    } else {
      timeRemainingText = `Begint over ${h}u en ${m}m`;
    }
  }

  let durationHours = (endDate.getTime() - shiftDate.getTime()) / (1000 * 60 * 60);
  durationHours = Math.round(durationHours * 10) / 10;

  const isToday = shiftDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTomorrow = shiftDate.toDateString() === tomorrow.toDateString();

  let dayLabel = DAYS_OF_WEEK[shift.day] || 'Dienst';
  if (isToday) {
    dayLabel = `Vandaag (${DAYS_OF_WEEK[shift.day]})`;
  } else if (isTomorrow) {
    dayLabel = `Morgen (${DAYS_OF_WEEK[shift.day]})`;
  }

  const formattedDate = shiftDate.toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return {
    shift,
    isWithin24Hours,
    isOngoing,
    timeRemainingText,
    dayLabel,
    formattedDate,
    totalHours: durationHours
  };
};

const isShiftWithin24Hours = (dayIndex: number, startTimeStr: string, weekNumber?: number): boolean => {
  const dummyShift: Shift = {
    id: 'temp_check',
    employeeId: '',
    day: dayIndex,
    startTime: startTimeStr,
    endTime: '23:59',
    weekNumber,
    status: 'published',
    acknowledged: false,
    updatedAt: Date.now()
  };
  const details = getShift24HourDetails(dummyShift);
  return !!details?.isWithin24Hours;
};

export default function StaffPortal({
  employees,
  shifts,
  notices,
  swapRequests,
  availabilities,
  onAcknowledgeShift,
  onAddSwapRequest,
  onUpdateEmployee,
  onAddEmployee,
  onUpdateAvailability,
  onSignUpForOpenShift,
  onCancelSignUpOpenShift
}: StaffPortalProps) {
  // Authenticated Staff Member ID (Personal Login with PIN)
  const [loggedInStaffId, setLoggedInStaffId] = useState<string | null>(() => {
    try {
      const local = localStorage.getItem('staff_logged_in_id');
      if (local && employees.some(e => e.id === local)) return local;
      const session = sessionStorage.getItem('staff_logged_in_id');
      if (session && employees.some(e => e.id === session)) return session;
    } catch {
      // ignore storage errors
    }
    return null;
  });

  // Keep loggedInStaffId in sync if the list of employees changes
  React.useEffect(() => {
    if (loggedInStaffId && !employees.some(e => e.id === loggedInStaffId)) {
      setLoggedInStaffId(null);
      try {
        localStorage.removeItem('staff_logged_in_id');
        sessionStorage.removeItem('staff_logged_in_id');
      } catch {}
    }
  }, [employees, loggedInStaffId]);

  const activeEmployeeId = loggedInStaffId || '';

  const handleStaffLoginSuccess = (employee: Employee, rememberMe: boolean) => {
    setLoggedInStaffId(employee.id);
    try {
      if (rememberMe) {
        localStorage.setItem('staff_logged_in_id', employee.id);
        sessionStorage.removeItem('staff_logged_in_id');
      } else {
        sessionStorage.setItem('staff_logged_in_id', employee.id);
        localStorage.removeItem('staff_logged_in_id');
      }
    } catch {}
    setSuccessMsg(`Welkom terug, ${employee.name}! Je bent veilig ingelogd in je persoonlijke portaal.`);
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  const handleStaffLogout = () => {
    try {
      localStorage.removeItem('staff_logged_in_id');
      sessionStorage.removeItem('staff_logged_in_id');
    } catch {}
    setLoggedInStaffId(null);
    setSuccessMsg('Je bent veilig uitgelogd. Tot de volgende dienst!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };
  
  // Profile modal state for self-service editing (naam, GSM, facebook)
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileModalTarget, setProfileModalTarget] = useState<Employee | null>(null);
  const [showSchedulePrintModal, setShowSchedulePrintModal] = useState<boolean>(false);

  const handleOpenEditMyProfile = () => {
    setProfileModalTarget(currentEmployee || null);
    setShowProfileModal(true);
  };

  const handleOpenCreateNewProfile = () => {
    setProfileModalTarget(null);
    setShowProfileModal(true);
  };

  const handleSaveEmployeeProfile = (updated: Employee) => {
    onUpdateEmployee(updated);
    if (selectedColleagueForModal?.id === updated.id) {
      setSelectedColleagueForModal(updated);
    }
    setSuccessMsg(`✅ Jouw gegevens (${updated.name}) zijn succesvol opgeslagen!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleAddNewEmployeeProfile = (newEmpData: Omit<Employee, 'id'>) => {
    if (onAddEmployee) {
      const created = onAddEmployee(newEmpData);
      setShowProfileModal(false);
      if (created) {
        handleStaffLoginSuccess(created, true);
        setSuccessMsg(`🎉 Welkom bij Café In De Molen, ${created.name}! Je bent succesvol toegevoegd en direct ingelogd. Duid nu jouw beschikbaarheid aan.`);
      } else {
        setSuccessMsg(`🎉 Welkom, ${newEmpData.name}! Je bent geregistreerd in het personeelssysteem.`);
      }
      setTimeout(() => setSuccessMsg(null), 6000);
    }
  };
  
  // Tabs within Staff Portal
  const [activeSubTab, setActiveSubTab] = useState<'rooster' | 'uren' | 'beschikbaarheid' | 'ruilen' | 'berichten' | 'collegas'>('rooster');

  // Roster week selection state
  const [selectedRosterWeek, setSelectedRosterWeek] = useState<number>(CURRENT_WEEK_NUMBER);
  const [showRosterArchiveMenu, setShowRosterArchiveMenu] = useState<boolean>(false);
  const [showAvailArchiveMenu, setShowAvailArchiveMenu] = useState<boolean>(false);

  // Availability state: default to the first open week (CURRENT_WEEK_NUMBER + 2)
  const [selectedWeek, setSelectedWeek] = useState<number>(CURRENT_WEEK_NUMBER + 2);
  const [tempAvailability, setTempAvailability] = useState<Record<number, { status: DayAvailability['status'], notes: string, startTime?: string, endTime?: string }>>({});

  // Input states for mandatory first-login contact data entry
  const [firstLoginEmail, setFirstLoginEmail] = useState<string>('');
  const [firstLoginPhone, setFirstLoginPhone] = useState<string>('');

  // Form states
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<string>('');
  const [swapReason, setSwapReason] = useState<string>('');
  const [targetColleagueId, setTargetColleagueId] = useState<string>('');

  // Modals and view filter
  const [showLateNoticeModal, setShowLateNoticeModal] = useState<boolean>(false);
  const [lateNoticeWeek, setLateNoticeWeek] = useState<number>(CURRENT_WEEK_NUMBER);
  const [rosterDeptFilter, setRosterDeptFilter] = useState<'all' | 'zaal' | 'keuken'>('all');

  // Colleagues directory state
  const [selectedColleagueForModal, setSelectedColleagueForModal] = useState<Employee | null>(null);
  const [colleagueSearchQuery, setColleagueSearchQuery] = useState<string>('');
  const [colleagueDeptFilter, setColleagueDeptFilter] = useState<'all' | 'zaal' | 'keuken'>('all');
  const [isEditingMyContact, setIsEditingMyContact] = useState<boolean>(false);
  const [editPhoneInput, setEditPhoneInput] = useState<string>('');
  const [editFacebookInput, setEditFacebookInput] = useState<string>('');

  // Info message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Staff Guide modal state
  const [showStaffGuideModal, setShowStaffGuideModal] = useState<boolean>(false);

  // Calendar integration modal state
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarTargetShift, setCalendarTargetShift] = useState<Shift | null>(null);
  const [calendarTypeTab, setCalendarTypeTab] = useState<'google' | 'apple' | 'outlook' | 'universal'>('google');

  // Active Employee object
  const currentEmployee = employees.find(e => e.id === activeEmployeeId);

  // Only Flexi, Student and Extra can enter fixed/recurring availability
  const isFlexiStudentExtra = Boolean(
    currentEmployee && (
      currentEmployee.statuut === 'Flexi' ||
      currentEmployee.statuut === 'Student' ||
      currentEmployee.statuut === 'Extra'
    )
  );

  const [availViewMode, setAvailViewMode] = useState<'weekly' | 'recurring'>('weekly');
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('every_week');
  const [recurringActive, setRecurringActive] = useState<boolean>(true);
  const [recurringDays, setRecurringDays] = useState<RecurringShiftPreference[]>(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: i,
      status: 'available' as const,
      startTime: 'Open',
      endTime: 'Sluit',
      notes: ''
    }));
  });
  const [recurringNotes, setRecurringNotes] = useState<string>('');

  // Sync recurring availability from currentEmployee
  React.useEffect(() => {
    if (currentEmployee?.recurringAvailability) {
      setRecurringFrequency(currentEmployee.recurringAvailability.frequency || 'every_week');
      setRecurringActive(currentEmployee.recurringAvailability.active !== false);
      setRecurringNotes(currentEmployee.recurringAvailability.notes || '');
      if (currentEmployee.recurringAvailability.days && currentEmployee.recurringAvailability.days.length === 7) {
        setRecurringDays(currentEmployee.recurringAvailability.days);
      }
    } else {
      setRecurringFrequency('every_week');
      setRecurringActive(true);
      setRecurringNotes('');
      setRecurringDays(Array.from({ length: 7 }, (_, i) => ({
        day: i,
        status: 'available' as const,
        startTime: 'Open',
        endTime: 'Sluit',
        notes: ''
      })));
    }
  }, [currentEmployee?.id, currentEmployee?.recurringAvailability]);

  const handleSaveRecurringAvailability = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentEmployee) return;

    const updatedEmp: Employee = {
      ...currentEmployee,
      recurringAvailability: {
        frequency: recurringFrequency,
        active: recurringActive,
        days: recurringDays,
        notes: recurringNotes.trim() || undefined,
        updatedAt: Date.now()
      }
    };

    onUpdateEmployee(updatedEmp);
    setSuccessMsg('🔁 Je vaste beschikbaarheid is succesvol opgeslagen! De beheerder kan dit direct meenemen in de planning.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleApplyRecurringToSelectedWeek = () => {
    if (!currentEmployee?.recurringAvailability?.days) return;
    const newTemp: Record<number, { status: DayAvailability['status'], notes: string, startTime?: string, endTime?: string }> = {};
    currentEmployee.recurringAvailability.days.forEach(rd => {
      newTemp[rd.day] = {
        status: rd.status,
        notes: rd.notes || '',
        startTime: rd.startTime || 'Open',
        endTime: rd.endTime || 'Sluit'
      };
    });
    setTempAvailability(newTemp);
    setSuccessMsg(`⚡ Jouw vaste beschikbaarheid is overgenomen voor Week ${selectedWeek}! Klik hieronder op "Opslaan & Versturen" om te bevestigen.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleOpenColleagueModal = (colleague: Employee) => {
    setSelectedColleagueForModal(colleague);
    setIsEditingMyContact(false);
    if (colleague.id === currentEmployee?.id) {
      setEditPhoneInput(colleague.phone || '');
      setEditFacebookInput(colleague.facebookUrl || '');
    }
  };

  const handleSaveMyContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;
    const updated: Employee = {
      ...currentEmployee,
      phone: editPhoneInput.trim(),
      facebookUrl: editFacebookInput.trim() || undefined
    };
    onUpdateEmployee(updated);
    setSelectedColleagueForModal(updated);
    setIsEditingMyContact(false);
    setSuccessMsg('Jouw contactgegevens en Facebook-profiel zijn succesvol bijgewerkt!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Sync inputs with current employee when profile changes or they log in/out
  React.useEffect(() => {
    if (currentEmployee) {
      setFirstLoginEmail(currentEmployee.email || '');
      setFirstLoginPhone(currentEmployee.phone || '');
    }
  }, [activeEmployeeId, currentEmployee?.id]);

  // Load existing availability when employee or week shifts
  React.useEffect(() => {
    const existing = availabilities.find(a => a.employeeId === activeEmployeeId && a.weekNumber === selectedWeek);
    const initialTemp: Record<number, { status: DayAvailability['status'], notes: string, startTime?: string, endTime?: string }> = {};
    
    // Default 7 days to 'available'
    for (let d = 0; d < 7; d++) {
      initialTemp[d] = {
        status: 'available',
        notes: '',
        startTime: 'Open',
        endTime: 'Sluit'
      };
    }
    
    if (existing) {
      existing.days.forEach(dayAvail => {
        initialTemp[dayAvail.day] = {
          status: dayAvail.status,
          notes: dayAvail.notes || '',
          startTime: normalizeAvailabilityTime(dayAvail.startTime) || 'Open',
          endTime: normalizeAvailabilityTime(dayAvail.endTime) || 'Sluit'
        };
      });
    }
    setTempAvailability(initialTemp);
  }, [activeEmployeeId, selectedWeek, availabilities]);

  // Active weeks vs automatically archived previous weeks
  const staffActiveWeeks = getAutoActiveWeeks(CURRENT_WEEK_NUMBER, [], shifts);
  const staffArchivedWeeks = getAutoArchivedWeeks(CURRENT_WEEK_NUMBER, shifts, availabilities);

  const isSelectedRosterWeekArchived = selectedRosterWeek < CURRENT_WEEK_NUMBER;
  const isSelectedAvailWeekArchived = selectedWeek < CURRENT_WEEK_NUMBER;

  // Filters for the selected roster week
  const rosterWeekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedRosterWeek);
  const personalShifts = rosterWeekShifts.filter(s => s.employeeId === activeEmployeeId && s.status === 'published');
  const personalWeekHours = React.useMemo(() => {
    return Math.round(personalShifts.reduce((acc, sh) => acc + calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day), 0) * 10) / 10;
  }, [personalShifts]);
  const unconfirmedShifts = personalShifts.filter(s => !s.acknowledged);
  const otherEmployees = sortEmployeesByFirstName(employees.filter(e => e.id !== activeEmployeeId));

  // Live timer to update countdown for shifts within 24 hours
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute shifts starting within 24 hours or ongoing for active employee (checked across all published shifts)
  const allPersonalPublishedShifts = shifts.filter(s => s.employeeId === activeEmployeeId && s.status === 'published');
  const upcomingShifts24h = allPersonalPublishedShifts
    .map(sh => getShift24HourDetails(sh, currentTime))
    .filter((d): d is Shift24HourAlert => d !== null && d.isWithin24Hours)
    .sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1;
      if (!a.isOngoing && b.isOngoing) return 1;
      return a.shift.startTime.localeCompare(b.shift.startTime);
    });

  const nextUrgentShift = upcomingShifts24h[0] || null;

  // All published shifts for the team view (filter by Zaal / Keuken / Alle for the selected week)
  const publishedTeamShifts = rosterWeekShifts.filter(s => {
    if (s.status !== 'published') return false;
    if (rosterDeptFilter === 'all') return true;
    return (s.department || 'zaal') === rosterDeptFilter;
  });

  const handleSelectEmployee = (id: string) => {
    setLoggedInStaffId(id);
    setSelectedShiftForSwap('');
    setSwapReason('');
    setTargetColleagueId('');
    setSuccessMsg(null);
  };

  const handleSaveFirstLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstLoginEmail.trim() || !firstLoginPhone.trim()) {
      alert('Vul a.u.b. zowel je e-mailadres als je mobiele nummer (GSM) in.');
      return;
    }
    onUpdateEmployee({
      ...currentEmployee,
      email: firstLoginEmail.trim(),
      phone: firstLoginPhone.trim(),
      firstLoginComplete: true
    });
    setSuccessMsg('Je contactgegevens zijn opgeslagen en je portal is nu ontgrendeld! Welkom.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSaveAvailability = () => {
    if (isWeekAvailabilityLocked(selectedWeek, CURRENT_WEEK_NUMBER)) {
      setSuccessMsg(`🔒 Week ${selectedWeek} is vergrendeld. Beschikbaarheden voor de huidige week en volgende week kunnen niet gewijzigd worden.`);
      setTimeout(() => setSuccessMsg(null), 6000);
      return;
    }

    const daysArray: DayAvailability[] = Object.entries(tempAvailability).map(([dayStr, info]) => {
      const typedInfo = info as { status: DayAvailability['status']; notes: string, startTime?: string, endTime?: string };
      return {
        day: parseInt(dayStr, 10),
        status: typedInfo.status,
        notes: typedInfo.notes,
        startTime: typedInfo.status !== 'unavailable' ? (typedInfo.startTime || 'Open') : undefined,
        endTime: typedInfo.status !== 'unavailable' ? (typedInfo.endTime || 'Sluit') : undefined
      };
    });

    onUpdateAvailability(activeEmployeeId, selectedWeek, daysArray);
    setSuccessMsg(`✅ Bedankt! Je beschikbaarheid voor Week ${selectedWeek} is netjes opgeslagen & veilig gesynchroniseerd!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleAcknowledgeClick = (shiftId: string) => {
    onAcknowledgeShift(shiftId);
    setSuccessMsg('Dienst succesvol gelezen & bevestigd! De manager ziet nu een groen vinkje.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSubmitSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForSwap || !swapReason) {
      alert('Vul a.u.be. alle velden in.');
      return;
    }

    onAddSwapRequest({
      shiftId: selectedShiftForSwap,
      requesterId: activeEmployeeId,
      reason: swapReason,
      targetEmployeeId: targetColleagueId || undefined
    });

    setSuccessMsg('Je ruilverzoek is ingediend! De manager heeft een melding ontvangen.');
    setSelectedShiftForSwap('');
    setSwapReason('');
    setTargetColleagueId('');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // If not logged in, render the secure Personal Staff Login component
  if (!loggedInStaffId || !currentEmployee) {
    return (
      <div className="space-y-6 font-sans">
        {showStaffGuideModal && (
          <StaffGuideModal
            isOpen={showStaffGuideModal}
            onClose={() => setShowStaffGuideModal(false)}
          />
        )}
        <StaffLogin
          employees={employees}
          onLoginSuccess={handleStaffLoginSuccess}
          onRegisterNewEmployee={handleOpenCreateNewProfile}
        />
        {showProfileModal && (
          <StaffProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            employee={profileModalTarget}
            onSaveEmployee={handleSaveEmployeeProfile}
            onAddEmployee={handleAddNewEmployeeProfile}
            allEmployeesCount={employees.length}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Eenvoudige Header met directe knop naar Handleiding */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
            IDM
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 uppercase tracking-tight">Personeelsportaal</h1>
            <p className="text-xs text-slate-500 font-medium">In De Molen • Rooster & Beschikbaarheid</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStaffGuideModal(true)}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          title="Bekijk de handleiding"
        >
          <BookOpen size={14} className="text-orange-600" />
          <span>Uitleg / Handleiding</span>
        </button>
      </div>

      {/* Persoonlijke sessie & account balk */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
            {currentEmployee.avatarUrl ? (
              <img src={currentEmployee.avatarUrl} alt={currentEmployee.name} className="w-full h-full object-cover" />
            ) : (
              currentEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-white">{currentEmployee.name}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>Persoonlijk Ingelogd</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{currentEmployee.department === 'keuken' ? '👨‍🍳 Keuken' : '🍽️ Zaal'}</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{currentEmployee.statuut}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <KeyRound size={11} className="text-orange-400" />
                <span>PIN: ••••</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleOpenEditMyProfile}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
            title="Geef zelf je naam, GSM, Facebookprofiel en persoonlijke pincode in"
          >
            <Edit3 size={13} />
            <span>Mijn Gegevens & PIN</span>
          </button>

          <button
            type="button"
            onClick={handleStaffLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-200 text-slate-300 border border-slate-700 hover:border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
            title="Log uit van dit apparaat"
          >
            <LogOut size={13} />
            <span>Uitloggen</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-100 text-emerald-950 font-bold rounded-2xl p-3.5 border border-emerald-300 flex items-center space-x-2.5 text-xs shadow-xs">
          <Check size={16} className="shrink-0 text-emerald-600 stroke-[3]" />
          <span>{successMsg}</span>
        </div>
      )}

      {currentEmployee && (
        <>
          {/* Welcome & Contact Quickbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm text-white shadow-xs uppercase shrink-0"
                  style={{ backgroundColor: currentEmployee.color }}
                >
                  {currentEmployee.avatarUrl ? (
                    <img src={currentEmployee.avatarUrl} alt={currentEmployee.name} className="w-full h-full object-cover" />
                  ) : (
                    currentEmployee.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-800">Hallo, {currentEmployee.name}!</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {currentEmployee.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {currentEmployee.statuut}
                  </p>
                </div>
              </div>

              {unconfirmedShifts.length > 0 ? (
                <div className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                  <span>{unconfirmedShifts.length} dienst(en) te bevestigen</span>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Rooster bevestigd ✓</span>
                </div>
              )}
            </div>

            {/* Compacte contactgegevens */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {currentEmployee.phone ? (
                  <a
                    href={`tel:${currentEmployee.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold transition"
                    title="Bellen"
                  >
                    <Phone size={12} className="text-orange-500" />
                    <span>{currentEmployee.phone}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEditMyProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-[11px] cursor-pointer"
                  >
                    <Phone size={11} className="text-amber-600" />
                    <span>+ GSM toevoegen</span>
                  </button>
                )}

                {currentEmployee.facebookUrl ? (
                  <a
                    href={currentEmployee.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold transition"
                  >
                    <Facebook size={12} className="text-blue-600" />
                    <span>Facebook</span>
                    <ExternalLink size={10} className="text-blue-400" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEditMyProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px] cursor-pointer"
                  >
                    <Facebook size={11} className="text-blue-500" />
                    <span>+ Facebook</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenEditMyProfile}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Edit3 size={12} />
                <span>Gegevens wijzigen</span>
              </button>
            </div>
          </div>

          {/* VISUAL INDICATOR: NEXT SHIFT WITHIN 24 HOURS (PROMINENT ALERT BANNER) */}
          {nextUrgentShift && (
            <div 
              id="shift-24h-reminder-banner"
              className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-orange-300 relative overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Decorative subtle background elements */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                    <AlarmClock size={24} className="stroke-[2.5] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white text-red-600 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block shrink-0" />
                        {nextUrgentShift.isOngoing ? '🚨 Nu Actief' : '⏰ Dienst Binnen 24 Uur!'}
                      </span>
                      <span className="bg-black/25 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                        {nextUrgentShift.timeRemainingText}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
                      {nextUrgentShift.dayLabel}: {nextUrgentShift.shift.startTime} – {nextUrgentShift.shift.endTime} ({nextUrgentShift.totalHours} uur)
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/95 mt-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg border border-white/15">
                        {(nextUrgentShift.shift.department || currentEmployee.department) === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                      </span>
                      <span className="text-white/85">
                        {nextUrgentShift.formattedDate}
                      </span>
                      {nextUrgentShift.shift.notes && (
                        <span className="italic bg-white/15 px-2 py-0.5 rounded-lg border border-white/15 max-w-xs truncate" title={nextUrgentShift.shift.notes}>
                          "{nextUrgentShift.shift.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick interactive action buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end pt-2 lg:pt-0 border-t border-white/20 lg:border-t-0">
                  {!nextUrgentShift.shift.acknowledged ? (
                    <button
                      type="button"
                      onClick={() => handleAcknowledgeClick(nextUrgentShift.shift.id)}
                      className="px-4 py-2 bg-white hover:bg-orange-50 active:scale-95 text-orange-950 font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} className="stroke-[3] text-orange-600" />
                      <span>Dienst Bevestigen</span>
                    </button>
                  ) : (
                    <div className="bg-white/20 border border-white/30 text-white font-black text-xs uppercase tracking-tight px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                      <CheckCheck size={14} className="text-emerald-300 stroke-[3]" />
                      <span>Gezien & Bevestigd ✓</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('rooster');
                      setSuccessMsg(null);
                    }}
                    className="px-3 py-2 bg-black/20 hover:bg-black/30 active:scale-95 border border-white/20 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CalendarIcon size={13} />
                    <span>Bekijk in Rooster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCalendarTargetShift(nextUrgentShift.shift);
                      setCalendarTypeTab('google');
                      setShowCalendarModal(true);
                    }}
                    className="px-3 py-2 bg-black/20 hover:bg-black/30 active:scale-95 border border-white/20 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    title="Toevoegen aan je smartphone of Google/Apple agenda"
                  >
                    <Clock size={13} />
                    <span>In Agenda 📅</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShiftForSwap(nextUrgentShift.shift.id);
                      setActiveSubTab('ruilen');
                      setSuccessMsg(null);
                    }}
                    className="px-3 py-2 bg-black/20 hover:bg-black/30 active:scale-95 border border-white/20 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    title="Dienst ruilen met een collega"
                  >
                    <ArrowLeftRight size={13} />
                    <span>Ruilen 🔄</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Beschikbaarheid herinnering (compact) */}
          {!availabilities.some(a => a.employeeId === activeEmployeeId && a.weekNumber === NEXT_WEEK_NUMBER) && (
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="font-semibold">Beschikbaarheid voor <strong>Week {NEXT_WEEK_NUMBER}</strong> nog niet doorgegeven.</span>
              </div>
              <button
                onClick={() => {
                  setSelectedWeek(NEXT_WEEK_NUMBER);
                  setActiveSubTab('beschikbaarheid');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl transition cursor-pointer text-xs shrink-0 self-end sm:self-auto"
              >
                Nu invullen →
              </button>
            </div>
          )}

      {/* Staff Tab menu - Vereenvoudigd */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-1 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveSubTab('rooster'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[100px] relative ${
            activeSubTab === 'rooster' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <CalendarIcon size={14} />
          <span>Mijn Rooster</span>
          {nextUrgentShift && (
            <span 
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-tight animate-pulse shadow-xs ml-1"
              title="Volgende dienst binnen 24 uur!"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
              <span>&lt;24u</span>
            </span>
          )}
        </button>
        <button
          id="staff-tab-uren-btn"
          onClick={() => { setActiveSubTab('uren'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[110px] ${
            activeSubTab === 'uren' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Clock size={14} />
          <span>Uren-tracker ⏱️</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('beschikbaarheid'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[110px] ${
            activeSubTab === 'beschikbaarheid' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Sparkles size={14} className="text-amber-500 fill-amber-300" />
          <span>Beschikbaarheid</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('ruilen'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[90px] ${
            activeSubTab === 'ruilen' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <ArrowLeftRight size={14} />
          <span>Ruilen</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('berichten'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[100px] ${
            activeSubTab === 'berichten' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Megaphone size={14} />
          <span>Berichten ({notices.length})</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('collegas'); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-center rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 duration-100 min-w-[90px] ${
            activeSubTab === 'collegas' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-orange-50/50'
          }`}
        >
          <Users size={14} />
          <span>Collega's</span>
        </button>
      </div>

      {/* SUBPAGE CONTENT */}

      {/* 1. MY ROSTER & WEEK ROSTER */}
      {activeSubTab === 'rooster' && (
        <div className="space-y-4">
          {/* Week Selector Bar for Schedule */}
          <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider mr-1">Rooster Week:</span>
              {staffActiveWeeks.map(w => {
                const wk = w.weekNumber;
                const isSelected = selectedRosterWeek === wk;
                return (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => setSelectedRosterWeek(wk)}
                    title={`${w.label}: ${w.dateRange}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition duration-100 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                        : 'bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200'
                    }`}
                  >
                    <span>Week {wk}</span>
                    {wk === CURRENT_WEEK_NUMBER && (
                      <span className={`text-[8px] px-1 py-0.2 rounded font-black ${
                        isSelected ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        Huidig
                      </span>
                    )}
                    {wk === NEXT_WEEK_NUMBER && (
                      <span className={`text-[8px] px-1 py-0.2 rounded font-black ${
                        isSelected ? 'bg-slate-200 text-slate-900' : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}>
                        Volgende
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Archive Dropdown */}
              {staffArchivedWeeks.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowRosterArchiveMenu(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition duration-100 active:scale-95 flex items-center gap-1.5 border cursor-pointer ${
                      isSelectedRosterWeekArchived
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                    title="Vorige weken worden automatisch gearchiveerd"
                  >
                    <Archive size={12} />
                    <span>Archief ({staffArchivedWeeks.length})</span>
                    <ChevronDown size={11} className={`transition-transform duration-200 ${showRosterArchiveMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showRosterArchiveMenu && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        📦 Vorige Weken (Automatisch Gearchiveerd)
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                        {staffArchivedWeeks.map(aw => {
                          const isSel = selectedRosterWeek === aw.weekNumber;
                          const countShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === aw.weekNumber && s.status === 'published').length;
                          return (
                            <button
                              key={aw.weekNumber}
                              type="button"
                              onClick={() => {
                                setSelectedRosterWeek(aw.weekNumber);
                                setShowRosterArchiveMenu(false);
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
                                {countShifts} diensten
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

            <div className="text-xs font-bold text-slate-600 bg-orange-50/60 border border-orange-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span>📅 {getWeekMeta(selectedRosterWeek).label}:</span>
              <span className="text-orange-950 font-black">{getWeekMeta(selectedRosterWeek).dateRange}</span>
            </div>
          </div>

          {/* Archived Week Notice */}
          {isSelectedRosterWeekArchived && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <Archive size={16} className="text-amber-700 shrink-0" />
                <span>
                  📦 Je bekijkt een gearchiveerde week: Week {selectedRosterWeek} ({getWeekMeta(selectedRosterWeek).dateRange}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRosterWeek(CURRENT_WEEK_NUMBER)}
                className="px-2.5 py-1 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Naar Huidige Week ({CURRENT_WEEK_NUMBER})
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Personal shifts list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                <Clock size={16} className="text-orange-500" />
                <span>Jouw aankomende diensten</span>
              </h3>
              {personalShifts.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('uren'); setSuccessMsg(null); }}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-xl border border-orange-200 transition cursor-pointer flex items-center gap-1"
                  title="Bekijk de volledige uren-tracker voor deze week"
                >
                  <span>⏱️ {personalWeekHours}u</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>

            {/* Directe Agenda / Delen balk */}
            {personalShifts.length > 0 && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600">Diensten delen of opslaan:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarTargetShift(null);
                      setCalendarTypeTab('google');
                      setShowCalendarModal(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Opslaan in Google, Apple of Outlook Agenda"
                  >
                    <CalendarIcon size={12} className="text-indigo-600" />
                    <span>Agenda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsAppForEmployee(currentEmployee, personalShifts, selectedWeek)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Verstuur overzicht via WhatsApp"
                  >
                    <span>💬 WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEmailForEmployee(currentEmployee, personalShifts, selectedWeek)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Verstuur naar e-mail"
                  >
                    <Mail size={12} />
                  </button>
                </div>
              </div>
            )}

            {personalShifts.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-150 shadow-sm text-slate-400 text-xs">
                Geen geplande diensten voor jou deze week! Geniet van je vrije tijd.
              </div>
            ) : (
              <div className="space-y-3">
                {personalShifts.map((sh) => {
                  const alertDetails = getShift24HourDetails(sh, currentTime);
                  const isUrgent = !!alertDetails?.isWithin24Hours;
                  return (
                    <div 
                      key={sh.id} 
                      className={`bg-white p-4 rounded-2xl border shadow-sm transition space-y-3 relative overflow-hidden ${
                        isUrgent
                          ? 'border-red-400 ring-4 ring-red-100 bg-red-50/20 shadow-md'
                          : (!sh.acknowledged ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100')
                      }`}
                    >
                      {isUrgent ? (
                        <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-gradient-to-r from-red-600 to-orange-600 text-[10px] text-white font-black tracking-wider uppercase flex items-center gap-1 shadow-xs animate-pulse">
                          <AlarmClock size={11} className="stroke-[3]" />
                          <span>{alertDetails?.isOngoing ? 'Nu bezig' : 'Binnen 24 uur'} • {alertDetails?.timeRemainingText}</span>
                        </span>
                      ) : (
                        !sh.acknowledged && (
                          <span className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-amber-500 text-[9px] text-white font-bold tracking-wider uppercase">Nieuw</span>
                        )
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                            <span>{DAYS_OF_WEEK[sh.day]}</span>
                            <span className="text-[11px] font-black text-orange-950 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-md shadow-2xs">
                              {getDayDateInfo(selectedRosterWeek, sh.day).shortDate}
                            </span>
                          </h4>
                          <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-orange-950 font-black bg-orange-50 px-2.5 py-1 rounded-lg w-fit border-2 border-orange-100 uppercase tracking-tight">
                            <Clock size={12} className="text-orange-500 shrink-0 stroke-[2.5]" />
                            <span>{sh.startTime} - {sh.endTime}</span>
                            <span className="text-orange-600 font-extrabold ml-1">({calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day)}u)</span>
                          </div>
                        </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Afdeling</span>
                        <p className="text-xs font-black text-slate-750 capitalize">{(sh.department || currentEmployee.department) === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}</p>
                      </div>
                    </div>

                    {sh.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        "{sh.notes}"
                      </p>
                    )}

                    {/* Acknowledge & Calendar button */}
                    <div className="flex items-center gap-2 pt-1">
                      {!sh.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledgeClick(sh.id)}
                          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 duration-100"
                        >
                          <Check size={14} className="stroke-[3]" />
                          <span>Bevestigen</span>
                        </button>
                      ) : (
                        <div className="flex-1 bg-emerald-100 text-emerald-950 border-2 border-emerald-200 rounded-xl p-2 text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5">
                          <CheckCheck size={14} className="text-emerald-600 shrink-0 stroke-[3]" />
                          <span>Gezien</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCalendarTargetShift(sh);
                          setCalendarTypeTab('google');
                          setShowCalendarModal(true);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Zet deze specifieke dienst direct in Google Agenda, Apple Agenda of Outlook"
                      >
                        <CalendarIcon size={14} className="text-indigo-600" />
                        <span className="hidden sm:inline">Agenda</span>
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Right panel: Whole team roster view - Vibrant Palette Style */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-orange-50/30 p-2.5 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                  📅 Algemene Planning
                </h3>
                <span className="text-[9px] text-orange-600 font-black bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md uppercase tracking-tight animate-pulse">Live</span>
              </div>

              {/* Department filter tabs for staff + Print PDF button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-white p-1 rounded-xl border border-orange-200 text-xs font-bold shadow-xs">
                  <button
                    type="button"
                    onClick={() => setRosterDeptFilter('all')}
                    className={`px-3 py-1 rounded-lg transition text-[11px] font-black uppercase tracking-tight ${
                      rosterDeptFilter === 'all'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-orange-600'
                    }`}
                  >
                    Alles
                  </button>
                  <button
                    type="button"
                    onClick={() => setRosterDeptFilter('zaal')}
                    className={`px-3 py-1 rounded-lg transition text-[11px] font-black uppercase tracking-tight ${
                      rosterDeptFilter === 'zaal'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-orange-600'
                    }`}
                  >
                    🍽️ Zaal (IDM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRosterDeptFilter('keuken')}
                    className={`px-3 py-1 rounded-lg transition text-[11px] font-black uppercase tracking-tight ${
                      rosterDeptFilter === 'keuken'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-orange-600'
                    }`}
                  >
                    🍳 Keuken (IDM)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSchedulePrintModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-orange-50 text-slate-800 hover:text-orange-600 border border-orange-200 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  title="Print PDF van het weekrooster in een strak formaat voor in de keuken of kantine"
                >
                  <Printer size={13} className="text-orange-600" />
                  <span>Print PDF 🖨️</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-orange-100 p-4 shadow-sm overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {DAYS_OF_WEEK.map((day, dayIdx) => {
                  const dayDateInfo = getDayDateInfo(selectedRosterWeek, dayIdx);
                  const dayShifts = publishedTeamShifts.filter(s => s.day === dayIdx);

                  return (
                    <div key={day} className="space-y-3">
                      <div className="bg-orange-50/70 p-2 rounded-2xl text-center border-2 border-orange-200/80 shadow-2xs">
                        <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{day.slice(0, 3)}</div>
                        <div className="text-xs font-black text-orange-950 bg-white border border-orange-200 rounded-lg py-0.5 px-1 mt-0.5 shadow-2xs">
                          {dayDateInfo.shortDate}
                        </div>
                      </div>

                      <div className="space-y-2 min-h-[300px]">
                        {dayShifts.map((sh) => {
                          const emp = employees.find(e => e.id === sh.employeeId);
                          if (!emp) return null;

                          const isSelf = emp.id === activeEmployeeId;
                          const alertDetails = getShift24HourDetails(sh, currentTime);
                          const isUrgent = !!alertDetails?.isWithin24Hours;
                          const borderStyle = isSelf
                            ? (isUrgent ? 'border-red-500 ring-4 ring-red-100 bg-red-50/25 font-bold animate-[pulse_2.5s_infinite]' : 'border-orange-500 ring-2 ring-orange-100 bg-orange-50/30 font-bold')
                            : (isUrgent ? 'border-red-300 ring-2 ring-red-50 bg-red-50/10' : 'border-orange-50/80 bg-orange-50/10');

                          return (
                            <div
                              key={sh.id}
                              className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${borderStyle}`}
                            >
                              <div>
                                <div className="flex items-center space-x-1.5 mb-1.5">
                                  <div 
                                    className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[8px] font-black text-white shrink-0 uppercase ring-1 ring-orange-100"
                                    style={{ backgroundColor: emp.color }}
                                  >
                                    {emp.avatarUrl ? (
                                      <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                                    ) : (
                                      emp.name.split(' ').map(n => n[0]).join('')
                                    )}
                                  </div>
                                  <span className="text-[10px] font-extrabold text-slate-800 truncate" title={emp.name}>
                                    {emp.name.split(' ')[0]}
                                  </span>
                                </div>
                                <span className="text-[9px] font-black text-slate-600 block tracking-tight">
                                  {sh.startTime} - {sh.endTime}
                                </span>
                                {isUrgent && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-tight w-fit animate-pulse shadow-xs">
                                    <AlarmClock size={8} className="stroke-[3]" />
                                    <span>{alertDetails?.isOngoing ? 'Nu bezig' : '<24u'}</span>
                                  </span>
                                )}
                              </div>

                              <div className="mt-2.5 pt-1.5 border-t border-orange-50/100 flex items-center justify-between">
                                <span className="text-[8px] px-1.5 py-0.5 bg-orange-100/60 text-orange-950 font-black uppercase rounded">
                                  {emp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                                </span>
                                {sh.acknowledged && (
                                  <CheckCheck size={12} className="text-emerald-600 stroke-[3.5]" title="Gezien" />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {dayShifts.length === 0 && (
                          <div className="text-[10px] text-slate-350 italic text-center py-12 font-semibold">
                            Geen diensten
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. UREN-TRACKER VOOR MEDEWERKERS (TOTAAL GEWERKTE UREN PER WEEK OP BASIS VAN GOEDGEKEURDE DIENSTEN) */}
      {activeSubTab === 'uren' && (
        <StaffHoursTracker
          currentEmployee={currentEmployee}
          shifts={shifts}
          initialWeekNumber={selectedRosterWeek}
          onAcknowledgeShift={onAcknowledgeShift}
        />
      )}

      {/* 3. SWAP / OVERDRACHT REQUESTS & OPEN SHIFTS */}
      {activeSubTab === 'ruilen' && (
        <div className="space-y-6">
          
          {/* 📢 OPEN SHIFTS BOARD (OPENGESTELDE SHIFTEN VOOR INTEKENING) */}
          {(() => {
            const openShifts = swapRequests.filter(r => r.isOpenShift && r.status === 'pending');
            return (
              <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                      📢
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <span>Openstaande Shiften (Ruilbord)</span>
                        {openShifts.length > 0 && (
                          <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                            {openShifts.length} {openShifts.length === 1 ? 'open dienst' : 'open diensten'}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        Diensten die zijn opengesteld door de beheerder of collega's. Schrijf je in om aan te geven dat je kunt inspringen!
                      </p>
                    </div>
                  </div>
                </div>

                {openShifts.length === 0 ? (
                  <div className="bg-white/85 rounded-2xl p-6 text-center border-2 border-dashed border-amber-200 text-slate-500 text-xs font-semibold">
                    ✨ Er zijn op dit moment geen openstaande shiften die ingevuld moeten worden. Alles is bezet!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openShifts.map((req) => {
                      const shift = shifts.find(s => s.id === req.shiftId);
                      if (!shift) return null;
                      const shiftWeek = shift.weekNumber || CURRENT_WEEK_NUMBER;
                      const dayInfo = getDayDateInfo(shiftWeek, shift.day);
                      const hasSignedUp = Boolean(req.candidates?.some(c => c.employeeId === activeEmployeeId));
                      const candidates = req.candidates || [];

                      return (
                        <div 
                          key={req.id} 
                          className={`bg-white rounded-2xl p-4 border-2 shadow-xs space-y-3 transition flex flex-col justify-between ${
                            hasSignedUp ? 'border-emerald-400 bg-emerald-50/20' : 'border-amber-200 hover:border-amber-300 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 inline-block mb-1">
                                  Week {shiftWeek} • {shift.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                                </span>
                                <h4 className="font-extrabold text-sm text-slate-800">
                                  {dayInfo.dayNameFull} {dayInfo.shortDate}
                                </h4>
                              </div>
                              <span className="text-xs font-black text-slate-800 bg-orange-100/70 border border-orange-200 px-2.5 py-1 rounded-lg font-mono">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </div>

                            {req.reason && (
                              <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                                "{req.reason}"
                              </p>
                            )}

                            {/* Candidates enrolled */}
                            <div className="pt-1">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center justify-between mb-1.5">
                                <span>Kandidaten ({candidates.length}):</span>
                                {hasSignedUp && (
                                  <span className="text-emerald-700 font-black flex items-center gap-1 text-[10px]">
                                    <Check size={11} className="stroke-[3]" /> Jij bent ingetekend
                                  </span>
                                )}
                              </div>
                              {candidates.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {candidates.map(c => (
                                    <span 
                                      key={c.employeeId} 
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                        c.employeeId === activeEmployeeId 
                                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      {c.employeeName} {c.employeeId === activeEmployeeId && '(Jij)'}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Nog geen kandidaten ingetekend</span>
                              )}
                            </div>
                          </div>

                          {/* Action button */}
                          <div className="pt-2 border-t border-slate-100 mt-2">
                            {hasSignedUp ? (
                              <button
                                type="button"
                                onClick={() => onCancelSignUpOpenShift && onCancelSignUpOpenShift(req.id, activeEmployeeId)}
                                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <X size={13} />
                                <span>Mijn intekening intrekken</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onSignUpForOpenShift && currentEmployee) {
                                    onSignUpForOpenShift(req.id, activeEmployeeId, currentEmployee.name, 'Beschikbaar voor deze shift');
                                  }
                                }}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-xs transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Check size={14} className="stroke-[3]" />
                                <span>🙋 Ik kan inspringen! (Intekenen)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Submit swap form - Vibrant Palette Theme */}
            <div className="lg:col-span-1 bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100 h-fit space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-tight">
                  <ArrowLeftRight size={16} className="text-orange-500 shrink-0 stroke-[2.5]" />
                  <span>Nieuw ruilverzoek indienen</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Meld hier een dienst aan die je wilt ruilen of overdragen.</p>
              </div>

              {personalShifts.length === 0 ? (
                <div className="text-xs text-slate-500 font-black bg-orange-50/20 p-4 text-center rounded-2xl border-2 border-dashed border-orange-150">
                  Je bent deze week niet ingepland, dus je hebt geen diensten om te ruilen.
                </div>
              ) : (
                <form onSubmit={handleSubmitSwap} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Welke van jouw diensten?</label>
                    <select
                      required
                      value={selectedShiftForSwap}
                      onChange={(e) => setSelectedShiftForSwap(e.target.value)}
                      className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="" disabled>Selecteer dienst...</option>
                      {personalShifts.map((sh) => (
                        <option key={sh.id} value={sh.id}>
                          {DAYS_OF_WEEK[sh.day]} ({getDayDateInfo(sh.weekNumber || selectedRosterWeek, sh.day).shortDate}) • {sh.startTime} - {sh.endTime}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Specifiek overdragen aan colleague? (Optioneel)</label>
                    <select
                      value={targetColleagueId}
                      onChange={(e) => setTargetColleagueId(e.target.value)}
                      className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="">Aanbieden aan iedereen</option>
                      {otherEmployees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.department === 'keuken' ? 'Keuken' : 'Zaal'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-600 tracking-tight">Reden van het ruilen</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="E.g. Familie verjaardag of studieverplichting..."
                      value={swapReason}
                      onChange={(e) => setSwapReason(e.target.value)}
                      className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-850 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none animate-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition duration-150 active:scale-95 cursor-pointer"
                  >
                    Ruilverzoek Versturen +
                  </button>
                </form>
              )}
            </div>

            {/* Global swap requests list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Geplaatste Ruilverzoeken van Collega's</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {swapRequests.filter(r => !r.isOpenShift).map((req) => {
                  const requester = req.requesterId === 'beheerder'
                    ? { id: 'beheerder', name: 'Beheerder', color: '#f97316' }
                    : employees.find(e => e.id === req.requesterId);
                  const shift = shifts.find(s => s.id === req.shiftId);
                  const target = req.targetEmployeeId ? employees.find(e => e.id === req.targetEmployeeId) : null;
                  
                  if (!requester || !shift) return null;

                  const isOwnRequest = requester.id === activeEmployeeId;

                  return (
                    <div 
                      key={req.id} 
                      className={`bg-white rounded-3xl p-5 border-2 shadow-sm space-y-3 relative overflow-hidden transition hover:shadow-md ${
                        isOwnRequest ? 'border-orange-550 border-orange-500 bg-orange-50/15 font-bold' : 'border-orange-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2.5">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white uppercase shadow-md shrink-0 ring-1 ring-orange-200"
                            style={{ backgroundColor: requester.color }}
                          >
                            {requester.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">
                              {requester.name} {isOwnRequest && '(Jij)'}
                            </h4>
                            <span className="text-[9px] font-bold uppercase text-slate-400">Gevraagd op: {req.date}</span>
                          </div>
                        </div>

                        <span>
                          {req.status === 'pending' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-950 border border-orange-200 uppercase tracking-tight">Wacht op akkoord</span>
                          ) : req.status === 'approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-950 border border-emerald-200 uppercase tracking-tight">Ruil goedgekeurd</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight">Geweigerd</span>
                          )}
                        </span>
                      </div>

                      <div className="bg-orange-50/20 p-3.5 rounded-2xl border border-orange-100 text-[11px] text-slate-650 space-y-1.5 font-medium">
                        <div className="flex justify-between font-black text-slate-800 uppercase tracking-tight text-[10px]">
                          <span>Originele Dienst:</span>
                          <span>{DAYS_OF_WEEK[shift.day]} ({getDayDateInfo(shift.weekNumber || CURRENT_WEEK_NUMBER, shift.day).shortDate})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tijdstip:</span>
                          <span className="font-bold text-slate-700">{shift.startTime} - {shift.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bestemd voor:</span>
                          <span className="font-bold text-slate-700">{target ? target.name : 'Iedereen collega'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 italic bg-orange-50/5 p-2.5 rounded-xl border border-orange-50/80">
                        "{req.reason}"
                      </p>
                    </div>
                  );
                })}

                {swapRequests.filter(r => !r.isOpenShift).length === 0 && (
                  <div className="bg-white p-10 text-center rounded-3xl border-2 border-orange-100 md:col-span-2 text-slate-400 text-xs font-bold uppercase">
                    Er zijn momenteel geen onderlinge ruilverzoeken ingediend.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GROUP NOTICE BOARD */}
      {activeSubTab === 'berichten' && (
        <div className="space-y-4 font-sans text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Megaphone size={16} className="text-orange-500 shrink-0" />
              <span>Mededelingen</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Updates en berichten vanuit de zaak.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {notices
              .filter((not) => !not.targetEmployeeId || not.targetEmployeeId === currentEmployee.id)
              .map((not) => {
                const isPersonalReminder = not.targetEmployeeId === currentEmployee.id;
                return (
                  <div 
                    key={not.id} 
                    className={`p-5 rounded-3xl shadow-sm border-2 relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition ${
                      isPersonalReminder
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-white border-orange-100'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-current ${CATEGORY_COLORS[not.category]}`}>
                            {CATEGORY_ICONS[not.category]} {not.category}
                          </span>
                          {isPersonalReminder && (
                            <span className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-[9px] bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1">
                              <BellRing size={10} className="text-amber-700 animate-pulse" />
                              <span>Persoonlijke Herinnering</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-bold uppercase">{not.date}</span>
                      </div>

                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight leading-snug">{not.title}</h4>
                      <p className="text-xs text-slate-650 leading-relaxed">{not.content}</p>
                    </div>

                    <div className="pt-3 border-t border-orange-50 text-[10px] text-slate-400 flex justify-between items-center mt-4 font-bold uppercase">
                      <span>Auteur: <strong className="text-slate-600">{not.author}</strong></span>
                      <span className="text-emerald-800 font-black flex items-center gap-0.5 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-250"><CheckCheck size={11} className="stroke-[3.5]" /> Gelezen</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 2b. DOORGEVEN BESCHIKBAARHEID */}
      {activeSubTab === 'beschikbaarheid' && (
        <div className="space-y-6 font-sans text-left">
          
          {/* Header */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-orange-500 shrink-0" />
                <span>Beschikbaarheid Doorgeven</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Duid per dag aan wanneer je kunt werken voor de huidige week en de komende 5 weken (vertrouwelijk voor de beheerder).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                🗓️ Huidige week + 5 komende weken open
              </span>
            </div>
          </div>

          {/* Mode Selector for Flexi / Student / Extra */}
          {isFlexiStudentExtra && (
            <div className="bg-white p-2.5 rounded-2xl border-2 border-orange-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAvailViewMode('weekly')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
                    availViewMode === 'weekly'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CalendarIcon size={14} />
                  <span>Wekelijks Invullen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvailViewMode('recurring')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
                    availViewMode === 'recurring'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Repeat size={14} />
                  <span>Vaste Beschikbaarheid 🔁 ({currentEmployee?.statuut})</span>
                  {currentEmployee?.recurringAvailability?.active && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium px-2">
                {availViewMode === 'recurring' ? (
                  <span className="text-orange-950 font-black">🔁 Vaste wekelijkse of tweewekelijkse shiften</span>
                ) : (
                  <span>Specifieke planning per week beheren</span>
                )}
              </div>
            </div>
          )}

          {/* VIEW 1: RECURRING AVAILABILITY FORM (Flexi, Student, Extra) */}
          {availViewMode === 'recurring' && isFlexiStudentExtra ? (
            <div className="space-y-6">
              {/* Frequency Header & Toggle */}
              <div className="bg-white p-5 rounded-3xl border-2 border-orange-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100">
                  <div>
                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <Repeat size={16} className="text-orange-500" />
                      <span>Vaste Beschikbaarheid Instellen ({currentEmployee?.name} • {currentEmployee?.statuut})</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Als {currentEmployee?.statuut} kun je hier vaste shiften opgeven die je elke week of om de 2 weken wilt draaien.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 shrink-0">
                    <input
                      type="checkbox"
                      checked={recurringActive}
                      onChange={(e) => setRecurringActive(e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 cursor-pointer"
                    />
                    <span className="text-xs font-black uppercase text-orange-950">Vaste beschikbaarheid actief</span>
                  </label>
                </div>

                {/* Frequency selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 tracking-tight block">
                    Frequentie van jouw vaste shiften:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('every_week')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                        recurringFrequency === 'every_week'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 uppercase">Elke Week</span>
                        {recurringFrequency === 'every_week' && <span className="text-orange-600 font-black text-xs">✓</span>}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Wekelijks hetzelfde vaste patroon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('even_weeks')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                        recurringFrequency === 'even_weeks'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 uppercase">Om de 2 weken (Even)</span>
                        {recurringFrequency === 'even_weeks' && <span className="text-orange-600 font-black text-xs">✓</span>}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Week 38, 40, 42... (Even weeknummers)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('odd_weeks')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                        recurringFrequency === 'odd_weeks'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 uppercase">Om de 2 weken (Oneven)</span>
                        {recurringFrequency === 'odd_weeks' && <span className="text-orange-600 font-black text-xs">✓</span>}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Week 37, 39, 41... (Oneven weeknummers)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Days Matrix */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-orange-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-orange-50">
                  <div>
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight">
                      Vaste shiften per weekdag
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Duid per dag aan of je vast beschikbaar bent en tussen welke uren.
                    </p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-black uppercase">
                    <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ja</span>
                    <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Voorkeur</span>
                    <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Nee</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                  {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                    const currentPref = recurringDays[dayIdx] || {
                      day: dayIdx,
                      status: 'available',
                      startTime: 'Open',
                      endTime: 'Sluit',
                      notes: ''
                    };

                    return (
                      <div
                        key={dayIdx}
                        className={`p-3.5 rounded-2xl border-2 transition flex flex-col justify-between space-y-2.5 ${
                          currentPref.status === 'preferred' ? 'bg-amber-50/50 border-amber-300' :
                          currentPref.status === 'available' ? 'bg-emerald-50/40 border-emerald-200' :
                          'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{dayName}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              currentPref.status === 'preferred' ? 'bg-amber-400' :
                              currentPref.status === 'available' ? 'bg-emerald-500' :
                              'bg-rose-500'
                            }`} />
                          </div>

                          {/* Status Selector */}
                          <div className="grid grid-cols-3 gap-1 text-center font-sans mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setRecurringDays(prev => {
                                  const next = [...prev];
                                  next[dayIdx] = { ...next[dayIdx], day: dayIdx, status: 'available' };
                                  return next;
                                });
                              }}
                              className={`py-1 rounded-lg text-[9px] font-black uppercase transition tracking-tight cursor-pointer ${
                                currentPref.status === 'available'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              Ja
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRecurringDays(prev => {
                                  const next = [...prev];
                                  next[dayIdx] = { ...next[dayIdx], day: dayIdx, status: 'preferred' };
                                  return next;
                                });
                              }}
                              className={`py-1 rounded-lg text-[9px] font-black uppercase transition tracking-tight cursor-pointer ${
                                currentPref.status === 'preferred'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              Voorkeur
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRecurringDays(prev => {
                                  const next = [...prev];
                                  next[dayIdx] = { ...next[dayIdx], day: dayIdx, status: 'unavailable' };
                                  return next;
                                });
                              }}
                              className={`py-1 rounded-lg text-[9px] font-black uppercase transition tracking-tight cursor-pointer ${
                                currentPref.status === 'unavailable'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              Nee
                            </button>
                          </div>

                          {/* Times if available or preferred */}
                          {currentPref.status !== 'unavailable' && (
                            <div className="space-y-1.5 pt-2">
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecurringDays(prev => {
                                      const next = [...prev];
                                      next[dayIdx] = { ...next[dayIdx], startTime: 'Open', endTime: 'Sluit' };
                                      return next;
                                    });
                                  }}
                                  className={`text-[8px] font-black py-0.5 px-1 rounded border transition cursor-pointer ${
                                    currentPref.startTime === 'Open' && currentPref.endTime === 'Sluit'
                                      ? 'bg-orange-500 text-white border-orange-600'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'
                                  }`}
                                >
                                  Hele dag
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecurringDays(prev => {
                                      const next = [...prev];
                                      next[dayIdx] = { ...next[dayIdx], startTime: '18u00', endTime: 'Sluit' };
                                      return next;
                                    });
                                  }}
                                  className={`text-[8px] font-black py-0.5 px-1 rounded border transition cursor-pointer ${
                                    currentPref.startTime === '18u00' && currentPref.endTime === 'Sluit'
                                      ? 'bg-orange-500 text-white border-orange-600'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'
                                  }`}
                                >
                                  Avond
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1 bg-white/70 p-1.5 rounded-lg border border-slate-200">
                                <div>
                                  <span className="text-[7.5px] font-black text-slate-400 block uppercase mb-0.5">Van</span>
                                  <select
                                    value={currentPref.startTime || 'Open'}
                                    onChange={(e) => {
                                      const newStart = e.target.value;
                                      setRecurringDays(prev => {
                                        const next = [...prev];
                                        next[dayIdx] = { ...next[dayIdx], startTime: newStart };
                                        return next;
                                      });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[9px] font-bold text-slate-700 cursor-pointer"
                                  >
                                    {getBeginTimes(dayIdx).map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[7.5px] font-black text-slate-400 block uppercase mb-0.5">Tot</span>
                                  <select
                                    value={currentPref.endTime || 'Sluit'}
                                    onChange={(e) => {
                                      const newEnd = e.target.value;
                                      setRecurringDays(prev => {
                                        const next = [...prev];
                                        next[dayIdx] = { ...next[dayIdx], endTime: newEnd };
                                        return next;
                                      });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[9px] font-bold text-slate-700 cursor-pointer"
                                  >
                                    {getEndTimes(dayIdx, currentPref.startTime || 'Open').map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Note per day */}
                        <input
                          type="text"
                          placeholder="Opmerking..."
                          value={currentPref.notes || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecurringDays(prev => {
                              const next = [...prev];
                              next[dayIdx] = { ...next[dayIdx], notes: val };
                              return next;
                            });
                          }}
                          className="w-full bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-[9.5px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* General notes & Save */}
                <div className="pt-3 border-t border-orange-100 space-y-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                      Algemene opmerkingen over je vaste beschikbaarheid (optioneel):
                    </label>
                    <textarea
                      rows={2}
                      value={recurringNotes}
                      onChange={(e) => setRecurringNotes(e.target.value)}
                      placeholder="E.g. In de even weken heb ik geen avondles op donderdag, studentencontract max 20u/week..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-slate-500 font-medium">
                      💡 Tip: Nadat je dit opslaat, kun je in het wekelijkse overzicht met 1 klik je vaste shiften overnemen naar elke gewenste week.
                    </p>

                    <button
                      type="button"
                      onClick={handleSaveRecurringAvailability}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} className="stroke-[3]" />
                      <span>Vaste Beschikbaarheid Opslaan ✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Optional Quick-Apply Banner for Flexi/Student/Extra with active recurring availability */}
              {isFlexiStudentExtra && currentEmployee?.recurringAvailability?.active && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      🔁
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-tight">
                        Vaste Beschikbaarheid Actief ({
                          currentEmployee.recurringAvailability.frequency === 'every_week' ? 'Elke week' :
                          currentEmployee.recurringAvailability.frequency === 'even_weeks' ? 'Om de 2 weken (Even)' : 'Om de 2 weken (Oneven)'
                        })
                      </h4>
                      <p className="text-[11px] text-blue-800 font-medium">
                        Wil je jouw vaste shiften overnemen voor geselecteerde <strong>Week {selectedWeek}</strong>?
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyRecurringToSelectedWeek}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-tight rounded-xl transition shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <span>⚡ Vaste shiften toepassen op Week {selectedWeek}</span>
                  </button>
                </div>
              )}

              {/* Week Selection Hub */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CalendarIcon size={13} className="text-orange-500" />
                <span>Kies een week (Huidige week + komende 5 weken)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Steeds 6 weken actief beschikbaar
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {staffActiveWeeks.map((w) => {
                const weekNum = w.weekNumber;
                const isLockedWeek = isWeekAvailabilityLocked(weekNum, CURRENT_WEEK_NUMBER);
                const hasFilled = availabilities.some(a => a.employeeId === activeEmployeeId && a.weekNumber === weekNum);
                const isSelected = selectedWeek === weekNum;
                return (
                  <button
                    key={weekNum}
                    onClick={() => {
                      setSelectedWeek(weekNum);
                      setSuccessMsg(null);
                    }}
                    title={`${w.label}: ${w.dateRange}`}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>Week {weekNum}</span>
                    {w.isCurrent && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase flex items-center gap-0.5 ${
                        isSelected ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        <Lock size={8} />
                        <span>Huidig (Vast)</span>
                      </span>
                    )}
                    {w.isNext && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                        isSelected ? 'bg-slate-300 text-slate-950' : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}>
                        <Lock size={8} />
                        <span>Volgende (Vast)</span>
                      </span>
                    )}
                    {!isLockedWeek && (
                      hasFilled ? (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          ✓ Ingevuld
                        </span>
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
                        }`}>
                          Open
                        </span>
                      )
                    )}
                  </button>
                );
              })}

              {/* Archive dropdown for staff availability past weeks */}
              {staffArchivedWeeks.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowAvailArchiveMenu(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition duration-100 active:scale-95 flex items-center gap-1.5 border cursor-pointer ${
                      isSelectedAvailWeekArchived
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                    title="Vorige weken worden automatisch gearchiveerd"
                  >
                    <Archive size={12} />
                    <span>Archief ({staffArchivedWeeks.length})</span>
                    <ChevronDown size={11} className={`transition-transform duration-200 ${showAvailArchiveMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showAvailArchiveMenu && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        📦 Vorige Weken (Automatisch Gearchiveerd)
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                        {staffArchivedWeeks.map(aw => {
                          const isSel = selectedWeek === aw.weekNumber;
                          const hasFilledPast = availabilities.some(a => a.employeeId === activeEmployeeId && a.weekNumber === aw.weekNumber);
                          return (
                            <button
                              key={aw.weekNumber}
                              type="button"
                              onClick={() => {
                                setSelectedWeek(aw.weekNumber);
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
                                {hasFilledPast ? '✓ Ingevuld' : 'Niet ingevuld'}
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
            
            {/* Status compact info */}
            {(() => {
              const isSelectedLocked = isWeekAvailabilityLocked(selectedWeek, CURRENT_WEEK_NUMBER);
              const isCurrentWeek = selectedWeek === CURRENT_WEEK_NUMBER;
              const isNextWeek = selectedWeek === NEXT_WEEK_NUMBER;
              const deadlineInfo = getAvailabilityDeadlineInfo(selectedWeek, CURRENT_WEEK_NUMBER);

              if (isCurrentWeek) {
                return (
                  <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-200 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900 mt-0.5">
                        <Lock size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-amber-950">Huidige week (Week {selectedWeek}) ligt vast</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                            Niet wijzigbaar
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                          Het werkrooster voor deze week is actief en loopt al. Je beschikbaarheid is hieronder ter inzage zichtbaar, maar kan niet meer gewijzigd worden via het portaal.
                        </p>
                        <p className="text-[11px] text-amber-800 font-medium mt-1">
                          💡 Dringend een shift ruilen? Gebruik het tabblad <strong>Diensten Ruilen</strong> of neem contact op met Hans.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ruilen')}
                      className="px-3.5 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-center cursor-pointer border border-amber-300"
                    >
                      <ArrowLeftRight size={13} />
                      <span>Naar Diensten Ruilen</span>
                    </button>
                  </div>
                );
              }

              if (isNextWeek) {
                return (
                  <div className="bg-slate-100/90 border border-slate-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-900 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 text-slate-800 mt-0.5">
                        <Lock size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">Volgende week (Week {selectedWeek}) ligt vast</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                            Niet wijzigbaar
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          Het werkrooster voor volgende week is reeds definitief opgesteld door de beheerder. Beschikbaarheden liggen vast en kunnen niet meer aangepast worden.
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">
                          💡 Heb je toch een wissel nodig? Gebruik <strong>Diensten Ruilen</strong> of vraag het aan Hans.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ruilen')}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-center cursor-pointer border border-slate-300"
                    >
                      <ArrowLeftRight size={13} />
                      <span>Naar Diensten Ruilen</span>
                    </button>
                  </div>
                );
              }

              if (isSelectedLocked) {
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-slate-700">
                    <span className="flex items-center gap-2">
                      <Lock size={14} className="text-slate-500" />
                      <span>Week {selectedWeek} ligt in het verleden en is gearchiveerd (niet wijzigbaar).</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Gearchiveerd
                    </span>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-900">
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span><strong>Week {selectedWeek} staat open:</strong> Duid per dag aan wanneer je kunt werken en klik onderaan op 'Opslaan & Versturen'.</span>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 shrink-0 border border-emerald-200">
                    {deadlineInfo.badgeText}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Main Availability Matrix */}
          <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-sm space-y-6">
            {(() => {
              const isSelectedLocked = isWeekAvailabilityLocked(selectedWeek, CURRENT_WEEK_NUMBER);
              return (
                <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 border-orange-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">
                          Status instellen voor week {selectedWeek}
                        </h4>
                        {isSelectedLocked ? (
                          <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Lock size={11} /> Alleen-lezen (Vastgelegd)
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            ✓ Open voor invoer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-orange-950 font-medium mt-0.5">
                        {isSelectedLocked
                          ? '🔒 Beschikbaarheden voor deze week liggen vast en kunnen niet gewijzigd worden.'
                          : 'Maandag t/m zaterdag zijn we gewoon open • Zon- en feestdagen vanaf 10u00 open.'}
                      </p>
                    </div>
                    {!isSelectedLocked && (
                      <div className="flex gap-2 text-[10px] font-black uppercase">
                        <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ja</span>
                        <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Nee</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                      const currentVal = tempAvailability[dayIdx] || { status: 'available', notes: '' };
                      const isSunday = dayIdx === 6;
                      return (
                        <div 
                          key={dayIdx} 
                          className={`p-4 rounded-2xl border-2 transition duration-150 flex flex-col justify-between space-y-3 ${
                            isSelectedLocked ? 'opacity-85 ' : ''
                          }${
                            currentVal.status === 'preferred' ? 'bg-amber-50/50 border-amber-300' :
                            currentVal.status === 'available' ? 'bg-emerald-50/40 border-emerald-200' :
                            'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between mb-1.5">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{dayName}</span>
                                </div>
                                <span className="inline-block text-[11px] font-black text-orange-950 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-md mt-0.5 shadow-2xs">
                                  {getDayDateInfo(selectedWeek, dayIdx).shortDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {isSelectedLocked && (
                                  <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-slate-200">
                                    <Lock size={8} /> Vast
                                  </span>
                                )}
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  currentVal.status === 'preferred' ? 'bg-amber-400' :
                                  currentVal.status === 'available' ? 'bg-emerald-500' :
                                  'bg-rose-500'
                                }`} />
                              </div>
                            </div>
                            
                            {/* Button toggles */}
                            <div className="grid grid-cols-1 gap-1 text-center font-sans mt-2">
                              <button
                                type="button"
                                disabled={isSelectedLocked}
                                onClick={() => !isSelectedLocked && setTempAvailability(prev => ({
                                  ...prev,
                                  [dayIdx]: { ...prev[dayIdx], status: 'available' }
                                }))}
                                className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all tracking-tight ${
                                  isSelectedLocked ? 'cursor-not-allowed opacity-75 ' : 'cursor-pointer '
                                }${
                                  currentVal.status === 'available'
                                    ? 'bg-emerald-500 text-white font-black border border-emerald-500'
                                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                                }`}
                              >
                                ✓ Beschikbaar
                              </button>
                              
                              <button
                                type="button"
                                disabled={isSelectedLocked}
                                onClick={() => !isSelectedLocked && setTempAvailability(prev => ({
                                  ...prev,
                                  [dayIdx]: { ...prev[dayIdx], status: 'unavailable' }
                                }))}
                                className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all tracking-tight ${
                                  isSelectedLocked ? 'cursor-not-allowed opacity-75 ' : 'cursor-pointer '
                                }${
                                  currentVal.status === 'unavailable'
                                    ? 'bg-rose-500 text-white font-black border border-rose-500'
                                    : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
                                }`}
                              >
                                ✕ Niet-beschikbaar
                              </button>
                            </div>
                          </div>

                          {/* Start- and end-time selection */}
                          {currentVal.status !== 'unavailable' && (
                            <div className="space-y-1.5 pt-1.5 border-t border-dashed border-slate-200 text-[10px]">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Uren:</label>
                                <span className="text-[8.5px] font-black text-orange-950 bg-orange-100/90 border border-orange-200 px-1.5 py-0.5 rounded">
                                  {currentVal.startTime || 'Open'} - {currentVal.endTime || 'Sluit'}
                                </span>
                              </div>

                              {/* Snelkeuze knoppen voor Open, Sluit en Hulpsluit */}
                              <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                                <button
                                  type="button"
                                  disabled={isSelectedLocked}
                                  onClick={() => !isSelectedLocked && setTempAvailability(prev => ({
                                    ...prev,
                                    [dayIdx]: { ...prev[dayIdx], startTime: 'Open', endTime: 'Sluit' }
                                  }))}
                                  className={`px-1 py-1 rounded-md font-black transition border text-center ${
                                    isSelectedLocked ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer '
                                  }${
                                    (currentVal.startTime || 'Open') === 'Open' && (currentVal.endTime || 'Sluit') === 'Sluit'
                                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                      : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200'
                                  }`}
                                  title="Vanaf opening tot sluiting"
                                >
                                  Open - Sluit
                                </button>
                                <button
                                  type="button"
                                  disabled={isSelectedLocked}
                                  onClick={() => !isSelectedLocked && setTempAvailability(prev => ({
                                    ...prev,
                                    [dayIdx]: { ...prev[dayIdx], startTime: 'Open', endTime: 'Hulpsluit' }
                                  }))}
                                  className={`px-1 py-1 rounded-md font-black transition border text-center ${
                                    isSelectedLocked ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer '
                                  }${
                                    (currentVal.startTime || 'Open') === 'Open' && currentVal.endTime === 'Hulpsluit'
                                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                      : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200'
                                  }`}
                                  title="Vanaf opening tot hulpsluiting"
                                >
                                  Open - Hulpsluit
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1 bg-orange-50/20 p-1.5 rounded-lg border border-orange-100">
                                <div>
                                  <span className="text-[7.5px] font-black text-slate-400 block uppercase mb-0.5">Van (Begin)</span>
                                  <select
                                    disabled={isSelectedLocked}
                                    value={currentVal.startTime || 'Open'}
                                    onChange={(e) => {
                                      if (isSelectedLocked) return;
                                      const newStart = e.target.value;
                                      const validEnds = getEndTimes(dayIdx, newStart);
                                      let newEnd = currentVal.endTime || 'Sluit';
                                      if (!validEnds.includes(newEnd)) {
                                        newEnd = validEnds[0] || 'Sluit';
                                      }
                                      setTempAvailability(prev => ({
                                        ...prev,
                                        [dayIdx]: { ...prev[dayIdx], startTime: newStart, endTime: newEnd }
                                      }));
                                    }}
                                    className={`w-full bg-white border border-slate-200 rounded px-1 py-1 text-[9.5px] font-bold text-slate-700 focus:outline-none ${
                                      isSelectedLocked ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'cursor-pointer'
                                    }`}
                                  >
                                    {getBeginTimes(dayIdx).map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[7.5px] font-black text-slate-400 block uppercase mb-0.5">Tot (Eind)</span>
                                  <select
                                    disabled={isSelectedLocked}
                                    value={currentVal.endTime || 'Sluit'}
                                    onChange={(e) => {
                                      if (isSelectedLocked) return;
                                      setTempAvailability(prev => ({
                                        ...prev,
                                        [dayIdx]: { ...prev[dayIdx], endTime: e.target.value }
                                      }));
                                    }}
                                    className={`w-full bg-white border border-slate-200 rounded px-1 py-1 text-[9.5px] font-bold text-slate-700 focus:outline-none ${
                                      isSelectedLocked ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'cursor-pointer'
                                    }`}
                                  >
                                    {getEndTimes(dayIdx, currentVal.startTime || 'Open').map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Short notes input */}
                          <div className="space-y-1 pt-2 border-t border-dashed border-slate-200">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Toelichting:</label>
                            <input
                              type="text"
                              disabled={isSelectedLocked}
                              placeholder={isSelectedLocked ? '(Vergrendeld)' : 'bijv. studie, gezin...'}
                              value={currentVal.notes}
                              onChange={(e) => !isSelectedLocked && setTempAvailability(prev => ({
                                ...prev,
                                [dayIdx]: { ...prev[dayIdx], notes: e.target.value }
                              }))}
                              className={`w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-orange-400 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-700 focus:outline-none ${
                                isSelectedLocked ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form actions */}
                  {isSelectedLocked ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-orange-100 gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Lock size={16} className="text-amber-600 shrink-0" />
                        <span>
                          Beschikbaarheden voor <strong>Week {selectedWeek}</strong> {selectedWeek === CURRENT_WEEK_NUMBER ? '(huidige week)' : selectedWeek === NEXT_WEEK_NUMBER ? '(volgende week)' : ''} liggen vast en kunnen niet gewijzigd worden.
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('ruilen')}
                          className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-orange-200"
                        >
                          <ArrowLeftRight size={13} />
                          <span>Naar Diensten Ruilen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWeek(CURRENT_WEEK_NUMBER + 2);
                            setSuccessMsg(null);
                          }}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                        >
                          <span>Naar Week {CURRENT_WEEK_NUMBER + 2} (Open voor invoer) →</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-orange-50 gap-4">
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Check size={14} className="text-emerald-500" />
                        <span>Klik hiernaast om deze beschikbaarheden live door te geven aan het beheerderpaneel.</span>
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleSaveAvailability}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Opslaan & Versturen →</span>
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
            </>
          )}
        </div>
      )}

      {/* 4. TEAM CALLBOOK / COLLEGA'S */}
      {activeSubTab === 'collegas' && (
        <div className="space-y-4 font-sans text-left">
          {/* Header & Subtitle */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users size={16} className="text-orange-500 shrink-0" />
                <span>Collega's</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik op een collega voor contactgegevens (telefoon en Facebook).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                id="staff-colleagues-add-employee-btn"
                type="button"
                onClick={handleOpenCreateNewProfile}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Nieuwe medewerker toevoegen</span>
              </button>
              <button
                id="staff-colleagues-edit-profile-btn"
                type="button"
                onClick={handleOpenEditMyProfile}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={12} />
                <span>Mijn contactgegevens wijzigen</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={colleagueSearchQuery}
                onChange={(e) => setColleagueSearchQuery(e.target.value)}
                placeholder="Zoek een collega op naam..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border-2 border-orange-100 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition shadow-sm"
              />
              {colleagueSearchQuery && (
                <button
                  type="button"
                  onClick={() => setColleagueSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-orange-100 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setColleagueDeptFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                  colleagueDeptFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Alle ({employees.length})
              </button>
              <button
                type="button"
                onClick={() => setColleagueDeptFilter('zaal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                  colleagueDeptFilter === 'zaal'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                🍽️ Zaal ({employees.filter(e => e.department === 'zaal').length})
              </button>
              <button
                type="button"
                onClick={() => setColleagueDeptFilter('keuken')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                  colleagueDeptFilter === 'keuken'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                🍳 Keuken ({employees.filter(e => e.department === 'keuken').length})
              </button>
            </div>
          </div>

          {/* Colleague Cards Grid - ONLY shows Name & Department (No Level/Niveau/Statuut!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
            {sortEmployeesByFirstName(employees
              .filter(emp => {
                const matchesSearch = emp.name.toLowerCase().includes(colleagueSearchQuery.toLowerCase());
                const matchesDept = colleagueDeptFilter === 'all' || emp.department === colleagueDeptFilter;
                return matchesSearch && matchesDept;
              }))
              .map((emp) => {
                const isMe = emp.id === currentEmployee?.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleOpenColleagueModal(emp)}
                    className="bg-white p-4 rounded-3xl border-2 border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenColleagueModal(emp); }}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div 
                        className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center font-black text-xs text-white uppercase shadow-sm shrink-0 ring-2 ring-orange-50 group-hover:scale-105 transition"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-800 truncate group-hover:text-orange-600 transition">
                            {emp.name}
                          </h4>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-orange-100 text-orange-800 font-black rounded-md uppercase shrink-0">
                              Jij
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            {emp.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                            <Phone size={10} />
                            <span>Contact & Facebook</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-orange-500 text-orange-500 group-hover:text-white flex items-center justify-center transition shrink-0 ml-2">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
          </div>

          {employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(colleagueSearchQuery.toLowerCase());
            const matchesDept = colleagueDeptFilter === 'all' || emp.department === colleagueDeptFilter;
            return matchesSearch && matchesDept;
          }).length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-orange-200">
              <p className="text-xs font-bold text-slate-600">Geen collega's gevonden voor "{colleagueSearchQuery}".</p>
              <button
                type="button"
                onClick={() => { setColleagueSearchQuery(''); setColleagueDeptFilter('all'); }}
                className="mt-3 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
              >
                Filters wissen
              </button>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* MODAL: COLLEAGUE CONTACT DETAILS ("BIJ DOORKLIKKEN TELEFOONNUMMER OF LINK NAAR FACEBOOK") */}
      {selectedColleagueForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 text-left">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedColleagueForModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-4">
                <div 
                  className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center font-black text-base text-white uppercase shadow-md shrink-0 ring-4 ring-white/30 border border-white"
                  style={{ backgroundColor: selectedColleagueForModal.color }}
                >
                  {selectedColleagueForModal.avatarUrl ? (
                    <img src={selectedColleagueForModal.avatarUrl} alt={selectedColleagueForModal.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedColleagueForModal.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedColleagueForModal.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedColleagueForModal.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                    </span>
                    {selectedColleagueForModal.id === currentEmployee?.id && (
                      <span className="text-[10px] font-black bg-white text-orange-700 px-2 py-0.5 rounded-full uppercase">
                        Jouw Profiel
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Option to Edit Own Contact Info if viewing self */}
              {selectedColleagueForModal.id === currentEmployee?.id && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedColleagueForModal(null);
                      handleOpenEditMyProfile();
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 transition hover:bg-orange-100"
                  >
                    <Edit3 size={13} />
                    <span>✏️ Mijn gegevens bewerken (naam, GSM, Facebook)</span>
                  </button>
                </div>
              )}

              {/* TELEFOONNUMMER SECTIE */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Phone size={13} className="text-orange-500" />
                        <span>Telefoonnummer (GSM)</span>
                      </span>
                      {selectedColleagueForModal.phone && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Beschikbaar
                        </span>
                      )}
                    </div>

                    <div className="text-base font-extrabold text-slate-800 tracking-wide">
                      {selectedColleagueForModal.phone || 'Geen telefoonnummer ingesteld'}
                    </div>

                    {selectedColleagueForModal.phone && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${formatPhoneForCall(selectedColleagueForModal.phone)}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          <PhoneCall size={14} />
                          <span>Direct Bellen</span>
                        </a>
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(selectedColleagueForModal.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* FACEBOOK LINK SECTIE */}
                  <div className="bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#1877F2] flex items-center gap-1.5">
                        <Facebook size={14} />
                        <span>Facebook Profiel</span>
                      </span>
                      {selectedColleagueForModal.facebookUrl && (
                        <span className="text-[10px] font-bold text-[#1877F2] bg-[#1877F2]/10 px-2 py-0.5 rounded-full">
                          Gekoppeld
                        </span>
                      )}
                    </div>

                    {selectedColleagueForModal.facebookUrl ? (
                      <div>
                        <p className="text-xs text-slate-600 mb-2 truncate">
                          {selectedColleagueForModal.facebookUrl}
                        </p>
                        <a
                          href={selectedColleagueForModal.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877F2] hover:bg-[#0C63D4] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          <Facebook size={15} />
                          <span>Open Facebook Profiel</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">
                          Geen directe Facebook-link opgegeven door deze collega.
                        </p>
                        <a
                          href={`https://www.facebook.com/search/top?q=${encodeURIComponent(selectedColleagueForModal.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-blue-50 text-[#1877F2] border border-[#1877F2]/30 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <Search size={13} />
                          <span>Zoek "{selectedColleagueForModal.name}" op Facebook</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

              {/* Privacy Notice regarding Experience Level / Niveau */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
                <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Vertrouwelijk personeelsbeleid:</strong> Ervaringsniveaus (beginner/gemiddeld/ervaren), evaluaties en contractstatuten zijn strikt vertrouwelijk en enkel in te kijken door de beheerder (Hans Stevens).
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedColleagueForModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friendly Late Submission Notice Modal */}
      {showLateNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 text-left space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shrink-0">
                ⏰
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  Graag op tijd doorgeven ;-)
                </h3>
                <p className="text-[11px] text-amber-700 font-bold">
                  Herinnering: Beschikbaarheid tijdig indienen • Week {lateNoticeWeek}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-slate-700 text-xs leading-relaxed">
              <p className="font-bold text-slate-900">
                Hoi {currentEmployee.name}! 👋
              </p>
              <p>
                Je beschikbaarheid voor <strong>Week {lateNoticeWeek}</strong> is zojuist alsnog veilig opgeslagen en doorgestuurd naar beheerder Hans.
              </p>
              <div className="font-bold text-amber-950 bg-amber-100/90 p-3 rounded-xl border border-amber-300">
                Mag we je wel vriendelijk vragen om je beschikbaarheden voortaan <u>minstens 2 weken voor aanvang</u> van het weekrooster door te geven? ;-)
              </div>
              <p className="text-slate-600">
                Zo heeft Hans voldoende tijd om het werkschema tijdig en evenwichtig klaar te maken voor het hele team van In De Molen. Bedankt voor je begrip en hulp!
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLateNoticeModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Begrepen, zal ik doen! 👍 ;-)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Calendar Integration Modal (Google, Apple, Outlook & Universal) */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-indigo-200 overflow-hidden my-4 space-y-0 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 p-5 text-white relative">
              <button
                type="button"
                onClick={() => {
                  setShowCalendarModal(false);
                  setCalendarTargetShift(null);
                }}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
                title="Sluiten"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  📅
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-200">
                    Agenda Synchronisatie • In De Molen
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    {calendarTargetShift ? 'Dienst Toevoegen aan Agenda' : `Week ${selectedWeek} in je Agenda`}
                  </h3>
                </div>
              </div>

              {calendarTargetShift ? (
                <div className="mt-2.5 bg-white/15 backdrop-blur-xs rounded-xl px-3 py-2 text-xs flex items-center justify-between border border-white/20">
                  <span className="font-bold">
                    {DAYS_OF_WEEK[calendarTargetShift.day]}: {calendarTargetShift.startTime} - {calendarTargetShift.endTime}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tight bg-white/30 px-2 py-0.5 rounded-md">
                    {(calendarTargetShift.department || currentEmployee.department) === 'keuken' ? 'Keuken' : 'Zaal'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-sky-100 mt-2 font-medium">
                  Kies je agenda (Google, Apple of Outlook) om jouw <strong>{personalShifts.length} diensten</strong> direct toe te voegen met automatische herinneringen.
                </p>
              )}
            </div>

            {/* Sub Tabs */}
            <div className="bg-slate-100 p-2 flex gap-1 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setCalendarTypeTab('google')}
                className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                  calendarTypeTab === 'google'
                    ? 'bg-white text-red-700 shadow-sm border border-red-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>🔴 Google / Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarTypeTab('apple')}
                className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                  calendarTypeTab === 'apple'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>🍏 Apple Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarTypeTab('outlook')}
                className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 cursor-pointer ${
                  calendarTypeTab === 'outlook'
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>🔷 Outlook</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              {/* GOOGLE AGENDAL PANEL */}
              {calendarTypeTab === 'google' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-red-900 font-extrabold text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">🔴</span> Google Agenda (Gmail & Android)
                      </span>
                      <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                        calendar.google.com
                      </span>
                    </div>
                    <p className="text-xs text-red-800 leading-relaxed font-medium">
                      Google Agenda ondersteunt zowel directe synchronisatie via de browser als import via een iCal-bestand.
                    </p>
                  </div>

                  {calendarTargetShift ? (
                    <div className="space-y-3">
                      <a
                        href={generateGoogleCalendarUrl(currentEmployee, calendarTargetShift, selectedWeek)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <ExternalLink size={15} />
                        <span>Sla deze Dienst Direct Op in Google Agenda ↗</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => exportEmployeeToGoogleCalendarICS(currentEmployee, [calendarTargetShift], selectedWeek)}
                        className="w-full py-2.5 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download Dienst als .ics bestand</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => exportEmployeeToGoogleCalendarICS(currentEmployee, personalShifts, selectedWeek)}
                        className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Download size={16} />
                        <span>Download Volledig Weekrooster voor Google Agenda (.ics)</span>
                      </button>

                      {personalShifts.length > 0 && (
                        <div className="border border-slate-200 rounded-2xl p-3 space-y-2 bg-slate-50">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Of voeg direct per dienst toe met 1 klik:
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {personalShifts.map((sh) => (
                              <div key={sh.id} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800">
                                  {DAYS_OF_WEEK[sh.day]}: {sh.startTime} - {sh.endTime}
                                </span>
                                <a
                                  href={generateGoogleCalendarUrl(currentEmployee, sh, selectedWeek)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
                                >
                                  <span>In Google Agenda ↗</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">💡 Hoe importeer je het weekbestand in Google Agenda?</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-650 font-medium">
                      <li>Download het <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">.ics</code> bestand met de knop hierboven.</li>
                      <li>Open <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-red-650 underline font-bold">calendar.google.com</a> op je laptop of telefoon.</li>
                      <li>Klik op <em>Instellingen (tandwiel) &gt; Importeren en exporteren</em> en selecteer het gedownloade bestand. Klaar!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* APPLE AGENDA PANEL */}
              {calendarTypeTab === 'apple' && (
                <div className="space-y-4">
                  <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-slate-900 font-extrabold text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">🍏</span> Apple Agenda (iPhone, iPad & Mac)
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-300 font-bold">
                        iOS & macOS
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Op een iPhone of Mac opent het kalenderbestand automatisch de native <strong>Apple Agenda</strong> app.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportEmployeeToAppleCalendar(
                      currentEmployee, 
                      calendarTargetShift ? [calendarTargetShift] : personalShifts, 
                      selectedWeek
                    )}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download size={16} />
                    <span>
                      {calendarTargetShift ? 'Download & Open Deze Dienst in Apple Agenda' : 'Download & Open Weekrooster in Apple Agenda'}
                    </span>
                  </button>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                    <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-tight">📱 Hoe werkt dit op je iPhone?</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-650 font-medium">
                      <li>Tik op de knop <strong>"Download & Open Weekrooster in Apple Agenda"</strong> hierboven.</li>
                      <li>Safari of je browser vraagt of je het bestand wil openen. Tik op <strong>Open</strong>.</li>
                      <li>De Apple Agenda app verschijnt met een overzicht van je shifts. Tik rechtsboven op <strong>"Voeg alle toe"</strong>.</li>
                      <li>Al je shifts zijn nu opgeslagen in je agenda met een <strong>automatische herinnering 1 uur voor aanvang</strong>!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* OUTLOOK PANEL */}
              {calendarTypeTab === 'outlook' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-blue-900 font-extrabold text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">🔷</span> Microsoft Outlook
                      </span>
                      <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                        Office 365 / Web
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Geschikt voor Microsoft Outlook desktop, Outlook Web en de Outlook mobiele app voor iOS/Android.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => exportEmployeeToOutlook(
                        currentEmployee, 
                        calendarTargetShift ? [calendarTargetShift] : personalShifts, 
                        selectedWeek
                      )}
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Download size={16} />
                      <span>
                        {calendarTargetShift ? 'Download Dienst voor Outlook (.ics)' : 'Download Weekrooster voor Outlook (.ics)'}
                      </span>
                    </button>

                    {calendarTargetShift ? (
                      <a
                        href={generateOutlookWebUrl(currentEmployee, calendarTargetShift, selectedWeek)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>Open & Sla op in Outlook Web ↗</span>
                      </a>
                    ) : (
                      <a
                        href="https://outlook.live.com/calendar/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>Ga naar Outlook Web Agenda ↗</span>
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">💡 Hoe importeer je in Outlook?</p>
                    <p className="text-slate-650 font-medium">
                      Dubbelklik op het gedownloade <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">.ics</code> bestand om direct Outlook te openen en de diensten in je werkkalender te plaatsen.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">
                Eet-staminée In De Molen • Agenda Koppeling
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCalendarModal(false);
                  setCalendarTargetShift(null);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer"
              >
                Sluiten
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Staff Step-by-Step Guide Modal */}
      {showStaffGuideModal && (
        <StaffGuideModal
          isOpen={showStaffGuideModal}
          onClose={() => setShowStaffGuideModal(false)}
        />
      )}

      {/* Staff Self-Service Profile Modal (Naam, Telefoonnummer, Facebook) */}
      <StaffProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        employee={profileModalTarget}
        onSaveEmployee={handleSaveEmployeeProfile}
        onAddEmployee={handleAddNewEmployeeProfile}
        onSelectEmployeeId={(id) => setLoggedInStaffId(id)}
        allEmployeesCount={employees.length}
      />

      {/* Schedule Print Modal (Kitchen & Canteen A4 Landscape Print/PDF) */}
      {showSchedulePrintModal && (
        <SchedulePrintModal
          isOpen={showSchedulePrintModal}
          onClose={() => setShowSchedulePrintModal(false)}
          employees={employees}
          shifts={shifts}
          initialWeek={selectedWeek}
          initialDepartment={rosterDeptFilter === 'all' ? 'keuken' : rosterDeptFilter}
        />
      )}

    </div>
  );
}
