import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, ShieldCheck, UserCheck, KeyRound, AlertCircle, Delete, ArrowRight, UserPlus, Plus } from 'lucide-react';
import { Employee } from '../types';
import InDeMolenLogo from './InDeMolenLogo';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';

interface StaffLoginProps {
  employees: Employee[];
  onLoginSuccess: (employee: Employee, rememberMe: boolean) => void;
  onSwitchToManager?: () => void;
  onRegisterNewEmployee?: () => void;
}

export default function StaffLogin({
  employees,
  onLoginSuccess,
  onSwitchToManager,
  onRegisterNewEmployee
}: StaffLoginProps) {
  const sortedEmployees = sortEmployeesByFirstName(employees.filter(e => e.active !== false));

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    // If there's a previously remembered last user hint
    const lastHint = localStorage.getItem('cafe_last_staff_hint_id');
    if (lastHint && sortedEmployees.some(e => e.id === lastHint)) {
      return lastHint;
    }
    return sortedEmployees[0]?.id || '';
  });

  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedEmployee = sortedEmployees.find(e => e.id === selectedEmployeeId);

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg(null);
      if (newPin.length === 4 && selectedEmployee) {
        // Auto-check if 4 digits entered
        validateAndLogin(newPin, selectedEmployee);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClearPin = () => {
    setPin('');
    setErrorMsg(null);
  };

  const validateAndLogin = (pinToTest: string, emp: Employee) => {
    setIsSubmitting(true);
    const expectedPin = emp.pin || '1234';

    if (pinToTest.trim() === expectedPin.trim()) {
      localStorage.setItem('cafe_last_staff_hint_id', emp.id);
      setErrorMsg(null);
      setTimeout(() => {
        onLoginSuccess(emp, rememberMe);
        setIsSubmitting(false);
      }, 150);
    } else {
      setIsSubmitting(false);
      setErrorMsg('Onjuiste pincode. Standaard is de pincode 1234, tenzij je deze eerder hebt gewijzigd. Vraag Hans bij verlies.');
      // Keep entered pin selected for quick retry
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setErrorMsg('Selecteer eerst jouw naam in de lijst of voeg jezelf toe als nieuwe medewerker.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Voer jouw 4-cijferige pincode in.');
      return;
    }
    validateAndLogin(pin, selectedEmployee);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-orange-200/80 overflow-hidden text-left relative">
        
        {/* Banner Header with Café In De Molen Branding */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner border border-white/25">
              <Lock size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">
                Beveiligde Toegang
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Personeelsportaal Login
              </h2>
            </div>
          </div>
          <p className="text-xs text-orange-100 font-medium leading-relaxed">
            Kies jouw naam en voer je persoonlijke 4-cijferige pincode in. Zo kan niemand anders in jouw beschikbaarheid rommelen.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Security Assurance Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-emerald-900">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-semibold leading-snug">
              <span className="font-black text-emerald-800">Persoonlijk afgeschermd: </span>
              Je vult alleen je eigen beschikbaarheid in. Beschikbaarheden van collega's zijn vergrendeld.
            </div>
          </div>

          {/* 1. Select Staff Member */}
          <div className="space-y-1.5">
            <label htmlFor="staff-select-employee" className="text-xs font-black text-slate-700 uppercase tracking-tight flex items-center justify-between">
              <span>1. Kies wie je bent:</span>
              {onRegisterNewEmployee && (
                <button
                  id="staff-quick-add-link"
                  type="button"
                  onClick={onRegisterNewEmployee}
                  className="text-[11px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <UserPlus size={12} className="stroke-[2.5]" />
                  <span>+ Nieuw? Voeg jezelf toe</span>
                </button>
              )}
            </label>
            
            <div className="relative">
              <select
                id="staff-select-employee"
                value={selectedEmployeeId}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    if (onRegisterNewEmployee) onRegisterNewEmployee();
                    return;
                  }
                  setSelectedEmployeeId(e.target.value);
                  setPin('');
                  setErrorMsg(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-2xl p-3.5 text-sm font-bold text-slate-800 focus:outline-none transition cursor-pointer appearance-none pr-10"
              >
                {sortedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department === 'keuken' ? 'Keuken' : 'Zaal'} • {emp.statuut})
                  </option>
                ))}
                {onRegisterNewEmployee && (
                  <option value="__add_new__">
                    ➕ [Nieuwe medewerker toevoegen...]
                  </option>
                )}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs">
                ▼
              </div>
            </div>

            {/* Selected Employee Preview Chip */}
            {selectedEmployee && (
              <div className="flex items-center space-x-3 p-2.5 bg-orange-50/60 rounded-2xl border border-orange-200/70 mt-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs uppercase shadow-xs shrink-0"
                  style={{ backgroundColor: selectedEmployee.color || '#ea580c' }}
                >
                  {selectedEmployee.avatarUrl ? (
                    <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    selectedEmployee.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-800 truncate">{selectedEmployee.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {selectedEmployee.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'} • {selectedEmployee.statuut}
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-white border border-orange-200 rounded-lg text-[10px] font-bold text-orange-700">
                  Geselecteerd ✓
                </div>
              </div>
            )}
          </div>

          {/* 2. 4-Digit PIN Code Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="staff-pin-input" className="text-xs font-black text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                <KeyRound size={14} className="text-orange-600" />
                <span>2. Jouw 4-cijferige pincode:</span>
              </label>
              <button
                id="staff-toggle-pin-visibility-btn"
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPin ? 'Verberg' : 'Toon'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="staff-pin-input"
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setPin(val);
                  setErrorMsg(null);
                  if (val.length === 4 && selectedEmployee) {
                    validateAndLogin(val, selectedEmployee);
                  }
                }}
                className="w-full tracking-[0.4em] text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-2xl p-3 text-slate-800 focus:outline-none transition"
              />
            </div>

            {/* Visual Indicator of Entered Digits */}
            <div className="flex justify-center space-x-2.5 py-1">
              {[0, 1, 2, 3].map(idx => (
                <div 
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    idx < pin.length 
                      ? 'bg-orange-500 scale-110 shadow-xs ring-2 ring-orange-200' 
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick On-Screen Touch Numpad (great for phones and tablets in the café) */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                id={`staff-keypad-${digit}`}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="h-11 bg-slate-100 hover:bg-orange-50 active:bg-orange-100 active:scale-95 text-slate-800 hover:text-orange-950 font-black text-base rounded-xl border border-slate-200 hover:border-orange-300 transition duration-100 flex items-center justify-center cursor-pointer shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              id="staff-keypad-clear"
              type="button"
              onClick={handleClearPin}
              className="h-11 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center cursor-pointer uppercase"
              title="Wissen"
            >
              C
            </button>
            <button
              id="staff-keypad-0"
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-11 bg-slate-100 hover:bg-orange-50 active:bg-orange-100 active:scale-95 text-slate-800 hover:text-orange-950 font-black text-base rounded-xl border border-slate-200 hover:border-orange-300 transition duration-100 flex items-center justify-center cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              id="staff-keypad-backspace"
              type="button"
              onClick={handleBackspace}
              className="h-11 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 font-bold rounded-xl border border-slate-200 transition flex items-center justify-center cursor-pointer"
              title="Wissen"
            >
              <Delete size={16} />
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start space-x-2 text-xs text-rose-800 font-semibold animate-shake">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                id="staff-remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
              />
              <span>Onthoud mij op dit apparaat</span>
            </label>
          </div>

          {/* Action Login Button */}
          <button
            id="staff-submit-login-btn"
            type="submit"
            disabled={isSubmitting || !pin}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Inloggen op Portaal</span>
            <ArrowRight size={16} className="stroke-[2.5]" />
          </button>

          {/* 3. New Staff Member Callout Banner */}
          {onRegisterNewEmployee && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-dashed border-orange-300/80 rounded-2xl p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-orange-950 font-black text-xs uppercase tracking-tight">
                <UserPlus size={16} className="text-orange-600 stroke-[2.5]" />
                <span>Nieuwe Medewerker?</span>
              </div>
              <p className="text-[11px] text-slate-650 font-medium leading-relaxed">
                Sta je nog niet in de personeelslijst? Voeg jezelf eenvoudig toe met al je gegevens en kies direct jouw persoonlijke pincode!
              </p>
              <button
                id="staff-register-self-btn"
                type="button"
                onClick={onRegisterNewEmployee}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>Zelf Toevoegen Als Nieuwe Medewerker →</span>
              </button>
            </div>
          )}

          {/* First Login & Helper Hint */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-700 font-medium leading-relaxed">
            <p className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
              <span>💡 Hulp bij inloggen:</span>
            </p>
            <p>
              Standaard pincode is <span className="font-black bg-orange-100 px-1.5 py-0.5 rounded text-orange-950">1234</span>. Na het inloggen kan je jouw code altijd aanpassen onder <strong>"Mijn Gegevens"</strong>.
            </p>
          </div>

          {/* Switch to Manager login if needed */}
          {onSwitchToManager && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                id="staff-switch-to-manager-btn"
                type="button"
                onClick={onSwitchToManager}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition cursor-pointer"
              >
                Ben je beheerder? Schakel over naar het Beheerpaneel →
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
