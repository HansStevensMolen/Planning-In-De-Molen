import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Facebook, Check, Sparkles, Building2, Briefcase, AlertCircle, ExternalLink, KeyRound, Eye, EyeOff, UserPlus, Calendar, ShieldAlert } from 'lucide-react';
import { Employee, Department, EmployeeStatuut, ExperienceLevel } from '../types';
import { calculateAge } from '../utils/employeeAgeUtils';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null; // if null, creating new employee
  onSaveEmployee: (employee: Employee) => void;
  onAddEmployee?: (employeeData: Omit<Employee, 'id'>) => Employee | void;
  onSelectEmployeeId?: (id: string) => void;
  allEmployeesCount: number;
}

export default function StaffProfileModal({
  isOpen,
  onClose,
  employee,
  onSaveEmployee,
  onAddEmployee,
  onSelectEmployeeId,
  allEmployeesCount
}: StaffProfileModalProps) {
  const isNew = !employee;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [facebook, setFacebook] = useState('');
  const [department, setDepartment] = useState<Department>('zaal');
  const [statuut, setStatuut] = useState<EmployeeStatuut>('Student');
  const [birthDate, setBirthDate] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('Beginner');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedAge = calculateAge(birthDate);
  const isMinor = calculatedAge !== null && calculatedAge < 18;

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setPhone(employee.phone || '');
      setFacebook(employee.facebookUrl || '');
      setDepartment(employee.department || 'zaal');
      setStatuut(employee.statuut || 'Student');
      setBirthDate(employee.birthDate || '');
      setExperience(employee.experience || 'Beginner');
      setEmail(employee.email || '');
      setPin(employee.pin || '1234');
    } else {
      setName('');
      setPhone('');
      setFacebook('');
      setDepartment('zaal');
      setStatuut('Student');
      setBirthDate('');
      setExperience('Beginner');
      setEmail('');
      setPin('1234');
    }
    setError(null);
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const normalizeFacebookUrl = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('facebook.com/') || trimmed.startsWith('www.facebook.com/')) {
      return `https://${trimmed}`;
    }
    const cleanHandle = trimmed.replace(/^@/, '');
    return `https://www.facebook.com/${cleanHandle}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanBirthDate = birthDate.trim();
    const cleanPin = pin.trim() || (employee?.pin ? employee.pin : '1234');
    const normalizedFacebook = normalizeFacebookUrl(facebook);

    if (!cleanName) {
      setError('Vul a.u.b. je volledige naam in.');
      return;
    }

    if (!cleanPhone) {
      setError('Vul a.u.b. een telefoonnummer (GSM) in zodat het team je kan bereiken.');
      return;
    }

    // Mandatory Date of Birth check for students
    if (statuut === 'Student' && !cleanBirthDate) {
      setError('Geboortedatum is wettelijk verplicht voor studenten om de arbeidsregels voor minderjarigen (-18 jaar: max 23u en max 8u/dag) te kunnen controleren.');
      return;
    }

    if (!/^[0-9]{4}$/.test(cleanPin)) {
      setError('De pincode moet exact 4 cijfers bevatten (bijv. 1234).');
      return;
    }

    if (isNew) {
      const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
      const chosenColor = colors[allEmployeesCount % colors.length];
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
      const parts = bgs[allEmployeesCount % bgs.length].split(' ');

      const newEmpData: Omit<Employee, 'id'> = {
        name: cleanName,
        department,
        statuut,
        birthDate: cleanBirthDate || undefined,
        experience,
        color: chosenColor,
        textBgColor: `${parts[0]} ${parts[1]}`,
        textColor: parts[2],
        email: cleanEmail || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@idemolen.be`,
        phone: cleanPhone,
        facebookUrl: normalizedFacebook || undefined,
        active: true,
        firstLoginComplete: true,
        pin: cleanPin
      };

      if (onAddEmployee) {
        const created = onAddEmployee(newEmpData);
        if (created && onSelectEmployeeId) {
          onSelectEmployeeId(created.id);
        }
      }
    } else if (employee) {
      const updatedEmployee: Employee = {
        ...employee,
        name: cleanName,
        phone: cleanPhone,
        birthDate: cleanBirthDate || undefined,
        facebookUrl: normalizedFacebook || undefined,
        department,
        statuut,
        experience,
        email: cleanEmail || employee.email,
        firstLoginComplete: true,
        pin: cleanPin
      };

      onSaveEmployee(updatedEmployee);
      if (onSelectEmployeeId) {
        onSelectEmployeeId(updatedEmployee.id);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs font-sans overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-200 max-w-lg w-full overflow-hidden my-auto text-left">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white relative">
          <button
            id="staff-profile-modal-close-btn"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              {isNew ? <UserPlus size={24} className="stroke-[2.5]" /> : <User size={24} className="stroke-[2.5]" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">
                {isNew ? 'Nieuwe medewerker toevoegen' : 'Jouw profiel bij In De Molen'}
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {isNew ? 'Jezelf Toevoegen Aan Het Team' : 'Mijn Gegevens Bewerken'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-orange-100 font-medium mt-2 leading-relaxed">
            {isNew 
              ? 'Vul je gegevens in om jezelf toe te voegen aan het personeelsportaal van Café In De Molen. Je wordt direct ingelogd zodat je jouw beschikbaarheden kunt doorgeven.' 
              : 'Werk je contactgegevens en persoonlijke instellingen bij zodat collega\'s en de planner jou makkelijk kunnen bereiken.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="bg-rose-50 text-rose-850 p-3 rounded-2xl border border-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Naam */}
          <div className="space-y-1.5">
            <label htmlFor="staff-profile-name" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
              <User size={14} className="text-orange-600 stroke-[2.5]" />
              <span>Volledige Naam <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="staff-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. Sophie De Smet"
              required
              className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>

          {/* 2. Telefoonnummer */}
          <div className="space-y-1.5">
            <label htmlFor="staff-profile-phone" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
              <Phone size={14} className="text-orange-600 stroke-[2.5]" />
              <span>Telefoonnummer (GSM voor WhatsApp) <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="staff-profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="bijv. 0470 12 34 56"
              required
              className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <p className="text-[10px] text-slate-500 font-medium">
              Nodig voor de WhatsApp-planning en oproepen bij collegaruil.
            </p>
          </div>

          {/* 3. E-mailadres */}
          <div className="space-y-1.5">
            <label htmlFor="staff-profile-email" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-orange-600 stroke-[2.5]" />
                <span>E-mailadres</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold lowercase">(voor agenda & updates)</span>
            </label>
            <input
              id="staff-profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bijv. sophie.desmet@gmail.com"
              className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>

          {/* 4. Facebook Profiel */}
          <div className="space-y-1.5">
            <label htmlFor="staff-profile-facebook" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Facebook size={14} className="text-blue-600 stroke-[2.5]" />
                <span>Facebook Profiel</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold lowercase">link of naam (optioneel)</span>
            </label>
            <div className="relative">
              <input
                id="staff-profile-facebook"
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="bijv. facebook.com/sophie.desmet of @sophie.desmet"
                className="w-full bg-orange-50/20 border-2 border-orange-100 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition pr-8"
              />
              {facebook.trim() && (
                <a
                  href={normalizeFacebookUrl(facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1"
                  title="Test link"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* 5. Afdeling, Statuut & Ervaringsniveau */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="staff-profile-dept" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
                <Building2 size={13} className="text-orange-500" />
                <span>Afdeling</span>
              </label>
              <select
                id="staff-profile-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="zaal">🍽️ Zaal</option>
                <option value="keuken">🍳 Keuken</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="staff-profile-statuut" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
                <Briefcase size={13} className="text-orange-500" />
                <span>Statuut</span>
              </label>
              <select
                id="staff-profile-statuut"
                value={statuut}
                onChange={(e) => setStatuut(e.target.value as EmployeeStatuut)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="Student">Student</option>
                <option value="Flexi">Flexi-job</option>
                <option value="Vast">Vaste medewerker</option>
                <option value="Extra">Extra</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="staff-profile-experience" className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
                <Sparkles size={13} className="text-orange-500" />
                <span>Ervaring</span>
              </label>
              <select
                id="staff-profile-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Gemiddeld">Gemiddeld</option>
                <option value="Ervaren">Ervaren</option>
                <option value="Verantwoordelijke">Verantwoordelijke</option>
              </select>
            </div>
          </div>

          {/* 5b. Geboortedatum & Leeftijdscontrole (Wettelijk verplicht voor studenten) */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            statuut === 'Student' 
              ? 'bg-amber-50/70 border-amber-300 shadow-xs' 
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
              <label htmlFor="staff-profile-birthdate" className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-1.5">
                <Calendar size={14} className={statuut === 'Student' ? 'text-amber-600' : 'text-slate-500'} />
                <span>Geboortedatum</span>
                {statuut === 'Student' ? (
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200/90 border border-amber-300 px-2 py-0.5 rounded-full">
                    Verplicht voor studenten *
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium lowercase">(optioneel)</span>
                )}
              </label>

              {calculatedAge !== null && (
                <div className="flex items-center gap-1">
                  {isMinor ? (
                    <span className="text-[11px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <ShieldAlert size={12} className="text-rose-600" />
                      <span>{calculatedAge} jaar • Minderjarig (-18)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                      ✓ {calculatedAge} jaar • Meerderjarig (18+)
                    </span>
                  )}
                </div>
              )}
            </div>

            <input
              id="staff-profile-birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required={statuut === 'Student'}
              className="w-full bg-white border-2 border-slate-300 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />

            {statuut === 'Student' && (
              <div className="mt-2 text-[11px] font-semibold leading-relaxed">
                {isMinor ? (
                  <div className="text-rose-900 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-start gap-1.5">
                    <ShieldAlert size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Belgische wetgeving studenten &lt; 18 jaar:</strong> Mag <u>niet na 23u00</u> werken en <u>maximaal 8 uur per dag</u>. Het systeem blokkeert automatisch overtredingen bij de roosterplanning.
                    </span>
                  </div>
                ) : calculatedAge !== null ? (
                  <p className="text-emerald-800">
                    ✓ Meerderjarig: mag na 23u00 werken en sluitdiensten draaien.
                  </p>
                ) : (
                  <p className="text-amber-800">
                    ℹ️ Vul je geboortedatum in zodat we weten of de regels voor -18 jaar (verbod op werk na 23u00 & max 8u/dag) van toepassing zijn.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 6. Persoonlijke 4-cijferige Pincode */}
          <div className="space-y-1.5 p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl">
            <div className="flex justify-between items-center">
              <label htmlFor="staff-profile-pin" className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-1.5">
                <KeyRound size={14} className="text-orange-600" />
                <span>Persoonlijke Pincode (4 cijfers)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPin ? 'Verberg' : 'Toon'}</span>
              </button>
            </div>
            <input
              id="staff-profile-pin"
              type={showPin ? 'text' : 'password'}
              maxLength={4}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1234"
              className="w-full bg-white border border-orange-300 text-slate-900 rounded-xl px-3 py-2 text-sm font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
              🔒 Met deze pincode log je veilig in. Kies gerust een eigen 4-cijferige pincode (standaard is 1234).
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-3">
            <button
              id="staff-profile-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-tight rounded-xl transition cursor-pointer"
            >
              Annuleren
            </button>
            <button
              id="staff-profile-submit-btn"
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={16} className="stroke-[3]" />
              <span>{isNew ? 'Jezelf Toevoegen & Starten' : 'Gegevens Opslaan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
