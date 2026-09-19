import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  Shift, 
  AvailabilitySubmissionBackup, 
  ScheduleBackup,
  EmployeeAvailability
} from '../types';
import { 
  fetchAvailabilityBackupsFromCloud, 
  fetchScheduleBackupsFromCloud, 
  createScheduleBackupInCloud, 
  exportBackupAsJSON,
  formatDutchDateTime,
  auth,
  googleProvider
} from '../services/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  Database, 
  CloudCheck, 
  Download, 
  RotateCcw, 
  Calendar, 
  Users, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  History,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  HardDrive
} from 'lucide-react';

interface BackupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  shifts: Shift[];
  employees: Employee[];
  managerName?: string;
  onRestoreSchedule: (restoredShifts: Shift[], weekNumber: number) => void;
}

const DAYS_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

export default function BackupManagerModal({
  isOpen,
  onClose,
  currentWeek,
  shifts,
  employees,
  managerName = 'Hans Stevens',
  onRestoreSchedule
}: BackupManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'availabilities' | 'schedules' | 'auth'>('availabilities');
  
  // Data states
  const [availBackups, setAvailBackups] = useState<AvailabilitySubmissionBackup[]>([]);
  const [scheduleBackups, setScheduleBackups] = useState<ScheduleBackup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedAvailId, setExpandedAvailId] = useState<string | null>(null);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

  // Filter states
  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all');
  const [searchEmployee, setSearchEmployee] = useState<string>('');

  // Create manual backup state
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupTitleInput, setBackupTitleInput] = useState<string>('');
  const [backupNotesInput, setBackupNotesInput] = useState<string>('');
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authError, setAuthError] = useState<string | null>(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load backups when opened
  useEffect(() => {
    if (isOpen) {
      loadAllBackups();
    }
  }, [isOpen]);

  const loadAllBackups = async () => {
    setLoading(true);
    try {
      const [avs, scs] = await Promise.all([
        fetchAvailabilityBackupsFromCloud(),
        fetchScheduleBackupsFromCloud()
      ]);
      setAvailBackups(avs);
      setScheduleBackups(scs);
    } catch (e) {
      console.error('Error loading backups from cloud:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleManualScheduleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBackup(true);
    try {
      const title = backupTitleInput.trim() || `Definitieve Planning Week ${currentWeek} (Handmatig Opgeslagen)`;
      const newBackup = await createScheduleBackupInCloud(
        currentWeek,
        shifts,
        currentUser?.displayName || managerName,
        title,
        backupNotesInput.trim()
      );
      setScheduleBackups(prev => [newBackup, ...prev]);
      setBackupSuccessMessage(`✅ Backup "${title}" succesvol gearchiveerd in Firestore Cloud!`);
      setBackupTitleInput('');
      setBackupNotesInput('');
      setTimeout(() => setBackupSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to create manual backup:', err);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = (backup: ScheduleBackup) => {
    if (confirm(`Weet je zeker dat je de definitieve planning van ${backup.formattedDate} wilt herstellen naar het actieve werkrooster?`)) {
      onRestoreSchedule(backup.shifts, backup.weekNumber);
      setBackupSuccessMessage(`✅ Planning voor week ${backup.weekNumber} hersteld uit backup!`);
      setTimeout(() => setBackupSuccessMessage(null), 3000);
    }
  };

  const handleDownloadAvailabilitiesJSON = () => {
    exportBackupAsJSON(availBackups, `in-de-molen-beschikbaarheden-backup-${Date.now()}.json`);
  };

  const handleDownloadSchedulesJSON = () => {
    exportBackupAsJSON(scheduleBackups, `in-de-molen-planningen-backup-${Date.now()}.json`);
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setAuthError(err.message || 'Kon niet inloggen met Google.');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Filtered availabilities
  const filteredAvailabilities = availBackups.filter(a => {
    if (filterWeek !== 'all' && a.weekNumber !== filterWeek) return false;
    if (searchEmployee && !a.employeeName.toLowerCase().includes(searchEmployee.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden my-4 max-h-[90vh] flex flex-col text-left">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-orange-500 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Database size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-tight text-white">Cloud Backup & Archief</h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Firestore Cloud Actief</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Permanente opslag van alle ingezonden beschikbaarheden en definitieve werkroosters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[140px] font-bold">{currentUser.displayName || currentUser.email}</span>
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  title="Uitloggen"
                  className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="Inloggen met Google om je beheerderaccount te koppelen"
              >
                <LogIn size={13} />
                <span>Google Inloggen</span>
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('availabilities')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'availabilities'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users size={14} />
              <span>Beschikbaarheden Logboek</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'availabilities' ? 'bg-orange-700 text-orange-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {availBackups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar size={14} />
              <span>Definitieve Planningen</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'schedules' ? 'bg-orange-700 text-orange-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {scheduleBackups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('auth')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'auth'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Cloud & Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllBackups}
              className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1 transition"
              title="Vernieuwen vanuit Firestore"
            >
              <RotateCcw size={12} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Vernieuwen</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {backupSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{backupSuccessMessage}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* TAB 1: BESCHIKBAARHEDEN LOGBOEK */}
          {activeTab === 'availabilities' && (
            <div className="space-y-4">
              
              {/* Header Info & Actions */}
              <div className="bg-orange-50/70 border-2 border-orange-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-tight text-orange-950 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-orange-600" />
                    <span>Onuitwisbaar Logboek van Alle Ingezonden Beschikbaarheden</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-normal max-w-2xl">
                    Iedere keer dat een medewerker (of beheerder) beschikbaarheden indient via het personeelsportaal, wordt een onveranderlijke momentopname met datum en tijd bewaard in Google Cloud Firestore.
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadAvailabilitiesJSON}
                    className="px-3.5 py-2 bg-white hover:bg-orange-100 text-orange-900 border border-orange-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Download alle beschikbaarheden als JSON-bestand voor op je computer"
                  >
                    <Download size={14} className="text-orange-600" />
                    <span>Download Volledig Logboek (.json)</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Week:</span>
                  <select
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Alle Weken ({availBackups.length})</option>
                    {[26, 27, 28, 29, 30].map(wk => (
                      <option key={wk} value={wk}>Week {wk}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Zoek op naam medewerker..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="text-xs text-slate-500 font-bold shrink-0">
                  {filteredAvailabilities.length} inzendingen getoond
                </div>
              </div>

              {/* Availabilities List */}
              {loading ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  Bezig met laden van cloud-backups...
                </div>
              ) : filteredAvailabilities.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <FileText size={28} className="mx-auto text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-700">Nog geen beschikbaarheids-backups gevonden</h4>
                  <p className="text-xs text-slate-500">
                    Zodra medewerkers hun formulier verzenden, verschijnen de gearchiveerde versies direct hier.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredAvailabilities.map((record) => {
                    const isExpanded = expandedAvailId === record.id;
                    const availableDaysCount = record.days.filter(d => d.status !== 'unavailable').length;

                    return (
                      <div
                        key={record.id}
                        className="bg-white border border-slate-200 hover:border-orange-200 rounded-2xl overflow-hidden transition shadow-xs"
                      >
                        <div
                          onClick={() => setExpandedAvailId(isExpanded ? null : record.id)}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-50/70"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0">
                              {record.employeeName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">{record.employeeName}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  record.department === 'keuken' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {record.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                                </span>
                                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                                  Week {record.weekNumber}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Clock size={12} className="text-slate-400" />
                                <span>Ingezonden op {record.formattedDate}</span>
                                {record.source === 'google_forms' && (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 rounded font-mono">Google Form</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 text-right">
                            <div>
                              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                                {availableDaysCount} van 7 dagen beschikbaar
                              </span>
                              {record.notes && (
                                <p className="text-[10px] italic text-slate-500 truncate max-w-[200px] mt-0.5">
                                  "{record.notes}"
                                </p>
                              )}
                            </div>
                            <div className="text-slate-400">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-3 animate-[fadeIn_0.15s_ease-out]">
                            <h5 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                              Gedetailleerde beschikbaarheid per dag (Inzending #{record.id}):
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                              {DAYS_NAMES.map((dName, dayIdx) => {
                                const d = record.days.find(x => x.day === dayIdx) || { status: 'unavailable' };
                                const isAvail = d.status === 'available' || d.status === 'preferred';

                                return (
                                  <div
                                    key={dayIdx}
                                    className={`p-2.5 rounded-xl border text-left text-xs ${
                                      d.status === 'preferred'
                                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                                        : d.status === 'available'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                        : 'bg-rose-50/60 border-rose-200 text-rose-800'
                                    }`}
                                  >
                                    <span className="font-extrabold block text-[10px] uppercase">{dName}</span>
                                    <span className="font-bold text-[11px] mt-0.5 block">
                                      {d.status === 'preferred' ? '⭐ Voorkeur' : d.status === 'available' ? '✓ Beschikbaar' : '✕ Niet'}
                                    </span>
                                    {isAvail && (d.startTime || d.endTime) && (
                                      <span className="text-[10px] font-mono block mt-1 bg-white/70 px-1 rounded">
                                        {d.startTime || 'Open'} - {d.endTime || 'Sluit'}
                                      </span>
                                    )}
                                    {d.notes && (
                                      <span className="text-[9px] italic text-slate-600 block mt-1">"{d.notes}"</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {record.notes && (
                              <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                                <strong className="text-slate-700">Algemene opmerking van medewerker:</strong> {record.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DEFINITIEVE PLANNINGEN SNAPSHOTS */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              
              {/* Form to create manual snapshot */}
              <div className="bg-orange-50/70 border-2 border-orange-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-tight text-orange-950 flex items-center gap-1.5">
                    <History size={16} className="text-orange-600" />
                    <span>Definitieve Planning Vastleggen & Archiveren</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                    Huidige Week: {currentWeek}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  Maak hier een permanente kopie van het huidige rooster voor Week {currentWeek}. Ook wanneer je op <strong>"Planning Publiceren"</strong> klikt in het dashboard, wordt er automatisch een snapshot gemaakt.
                </p>

                <form onSubmit={handleManualScheduleBackup} className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={`Titel (bv. 'Definitieve Planning Week ${currentWeek} - V1')`}
                      value={backupTitleInput}
                      onChange={(e) => setBackupTitleInput(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Notitie (bv. 'Goedgekeurd na overleg met keukenchef')"
                      value={backupNotesInput}
                      onChange={(e) => setBackupNotesInput(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">
                      Bevat {shifts.length} diensten ({shifts.filter(s => s.status === 'published').length} gepubliceerd)
                    </span>
                    <button
                      type="submit"
                      disabled={isCreatingBackup}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <HardDrive size={13} />
                      <span>{isCreatingBackup ? 'Opslaan...' : 'Nu Definitieve Backup Maken 💾'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Action bar */}
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                  Opgeslagen Planningen Archief ({scheduleBackups.length})
                </h4>
                <button
                  type="button"
                  onClick={handleDownloadSchedulesJSON}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Alle Planningen (.json)</span>
                </button>
              </div>

              {/* Schedule Backups List */}
              {loading ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  Bezig met laden...
                </div>
              ) : scheduleBackups.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <Calendar size={28} className="mx-auto text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-700">Nog geen definitieve planningen opgeslagen</h4>
                  <p className="text-xs text-slate-500">
                    Klik hierboven op "Nu Definitieve Backup Maken" of publiceer het weekrooster om de eerste backup vast te leggen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduleBackups.map((b) => {
                    const isExpanded = expandedScheduleId === b.id;

                    return (
                      <div
                        key={b.id}
                        className="bg-white border border-slate-200 hover:border-orange-200 rounded-2xl overflow-hidden transition shadow-xs"
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{b.versionTitle}</span>
                              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                                Week {b.weekNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                              <span>🕒 Opgeslagen op {b.formattedDate}</span>
                              <span>•</span>
                              <span>Door {b.createdBy}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-700">{b.shiftsCount} diensten ({b.publishedCount} gepubliceerd)</span>
                            </p>
                            {b.notes && (
                              <p className="text-xs italic text-slate-600 mt-1">"{b.notes}"</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setExpandedScheduleId(isExpanded ? null : b.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Layers size={13} />
                              <span>{isExpanded ? 'Verberg' : 'Bekijk Diensten'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRestore(b)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="Herstel deze opgeslagen planning naar het actieve scherm"
                            >
                              <RotateCcw size={13} />
                              <span>Herstellen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => exportBackupAsJSON(b, `planning-week-${b.weekNumber}-${b.id}.json`)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                              title="Download als JSON"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded shifts view */}
                        {isExpanded && (
                          <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2 animate-[fadeIn_0.15s_ease-out]">
                            <h5 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                              Inhoud van deze definitieve planning ({b.shifts.length} diensten):
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                              {b.shifts.map((sh, idx) => {
                                const emp = employees.find(e => e.id === sh.employeeId);
                                return (
                                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-left">
                                    <div className="flex justify-between items-center font-bold">
                                      <span className="text-slate-900">{emp?.name || 'Medewerker'}</span>
                                      <span className="text-orange-600 font-mono text-[10px]">{DAYS_NAMES[sh.day]}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                      {sh.startTime} - {sh.endTime} ({sh.department || 'zaal'})
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CLOUD & EXPORT OVERVIEW */}
          {activeTab === 'auth' && (
            <div className="space-y-4 text-left">
              
              {/* Firestore Cloud Status Card */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">Google Cloud Firestore Database</h3>
                    <p className="text-xs text-slate-400">
                      Gekoppeld en operationeel voor persistente gegevensopslag
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Project</span>
                    <span className="text-xs font-mono font-bold text-orange-400">gen-lang-client-0036186270</span>
                  </div>
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Beschikbaarheden Backups</span>
                    <span className="text-sm font-black text-white">{availBackups.length} opgeslagen</span>
                  </div>
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Planningen Snapshots</span>
                    <span className="text-sm font-black text-white">{scheduleBackups.length} opgeslagen</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Beheerder Authenticatie:</span>
                    <span className="text-xs text-slate-400">
                      {currentUser ? `Ingelogd via Google: ${currentUser.email}` : 'Niet ingelogd via Google (gebruikt PIN 1234)'}
                    </span>
                  </div>

                  <div>
                    {currentUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleSignOut}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        <LogOut size={13} />
                        <span>Google Uitloggen</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn size={13} />
                        <span>Inloggen met Google</span>
                      </button>
                    )}
                  </div>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800">
                    {authError}
                  </p>
                )}
              </div>

              {/* Complete Export Section */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-3">
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
                  <Download size={16} className="text-orange-600" />
                  <span>Totale Offline Backup Downloaden</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wil je een volledige kopie van alle gegevens op je eigen computer of USB-stick bewaren? Klik hieronder om alles in één JSON-bestand te downloaden:
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadAvailabilitiesJSON}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-orange-950 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Download size={14} className="text-orange-600" />
                    <span>Exporteer Alle Beschikbaarheden (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSchedulesJSON}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-orange-950 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Download size={14} className="text-orange-600" />
                    <span>Exporteer Alle Definitieve Planningen (.json)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-bold shrink-0">
          <span>In De Molen — Dataveiligheid & Cloud Archivering</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-xs transition"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
