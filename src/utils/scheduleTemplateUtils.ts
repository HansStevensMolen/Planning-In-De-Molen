import { ScheduleTemplate, TemplateShift, Shift, Employee, EmployeeAvailability, Department } from '../types';
import { safeStorage } from './safeStorage';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { canEmployeeWorkSluitOrHulpsluit } from './employeeSortUtils';
import { getEffectiveEmployeeAvailability } from './weekUtils';

const STORAGE_KEY = 'in_de_molen_schedule_templates_v1';

/**
 * Kant-en-klare horeca roostersjablonen voor Café-Eet-Staminée "In De Molen"
 */
export const BUILT_IN_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 'builtin_volle_bezetting_zaterdag',
    name: 'Volle bezetting zaterdag',
    description: 'Complete weekend-topbezetting met lunch (zaal+keuken), avondploeg met sluitdienst (02:30), hulpsluit en keukenbrigade.',
    category: 'day',
    targetDay: 5, // Zaterdag
    isBuiltIn: true,
    createdAt: 1718000000000,
    shifts: [
      { day: 5, department: 'zaal', startTime: '11:30', endTime: '16:00', role: 'Zaal Lunch', notes: 'Lunchservice & terras' },
      { day: 5, department: 'keuken', startTime: '12:00', endTime: '15:30', role: 'Keuken Lunch', notes: 'Lunchbereiding' },
      { day: 5, department: 'zaal', startTime: '16:00', endTime: '02:30', role: 'Zaal Sluit', notes: 'Shiftverantwoordelijke & sluitdienst' },
      { day: 5, department: 'zaal', startTime: '17:00', endTime: '00:00', role: 'Zaal Hulpsluit', notes: 'Hulpsluit (koffiemachine & kassa)' },
      { day: 5, department: 'zaal', startTime: '18:00', endTime: '23:30', role: 'Zaal Versterking', notes: 'Piekuren bediening' },
      { day: 5, department: 'keuken', startTime: '16:30', endTime: '22:30', role: 'Keuken Chef', notes: 'Warme & koude keuken' },
      { day: 5, department: 'keuken', startTime: '17:30', endTime: '22:00', role: 'Keuken Hulp', notes: 'Afwas & voorbereiding' }
    ]
  },
  {
    id: 'builtin_vrijdagavond_topdrukte',
    name: 'Vrijdagavond Topdrukte',
    description: 'Stevige avondbezetting voor de start van het weekend. Inclusief sluitdienst tot 02:30, hulpsluit en dubbele keukenkracht.',
    category: 'day',
    targetDay: 4, // Vrijdag
    isBuiltIn: true,
    createdAt: 1718000000000,
    shifts: [
      { day: 4, department: 'zaal', startTime: '16:00', endTime: '02:30', role: 'Zaal Sluit', notes: 'Sluitdienst café' },
      { day: 4, department: 'zaal', startTime: '17:00', endTime: '00:00', role: 'Zaal Hulpsluit', notes: 'Hulpsluit' },
      { day: 4, department: 'zaal', startTime: '18:00', endTime: '23:00', role: 'Zaal Bediening', notes: 'Tafelbediening & bar' },
      { day: 4, department: 'keuken', startTime: '16:30', endTime: '22:30', role: 'Keuken Chef', notes: 'Avondservice' },
      { day: 4, department: 'keuken', startTime: '17:30', endTime: '22:00', role: 'Keuken Hulp', notes: 'Afwas & dessert' }
    ]
  },
  {
    id: 'builtin_drukke_zondag_familiedag',
    name: 'Drukke Zondag (Familiedag)',
    description: 'Vroege opening vanaf 10:00 uur voor wandelaars en gezinnen. Doorlopende bediening tot sluiting om 00:30.',
    category: 'day',
    targetDay: 6, // Zondag
    isBuiltIn: true,
    createdAt: 1718000000000,
    shifts: [
      { day: 6, department: 'zaal', startTime: '10:00', endTime: '16:00', role: 'Zaal Ochtend/Middag', notes: 'Opening om 10u00' },
      { day: 6, department: 'keuken', startTime: '10:30', endTime: '15:30', role: 'Keuken Lunch', notes: 'Zondagse lunch' },
      { day: 6, department: 'zaal', startTime: '16:00', endTime: '00:30', role: 'Zaal Sluit', notes: 'Zondagssluiting 00:30' },
      { day: 6, department: 'zaal', startTime: '17:00', endTime: '23:00', role: 'Zaal Hulpsluit', notes: 'Afwas & bediening' },
      { day: 6, department: 'keuken', startTime: '16:30', endTime: '22:00', role: 'Keuken Avond', notes: 'Avondkaart' }
    ]
  },
  {
    id: 'builtin_standaard_weekdag',
    name: 'Standaard Weekdag (Ma - Do)',
    description: 'Efficiënte bezetting voor een gewone openingsdag. Zaalsluit om 01:30 en keuken tot 22:00.',
    category: 'day',
    targetDay: 1, // Dinsdag / Weekdag
    isBuiltIn: true,
    createdAt: 1718000000000,
    shifts: [
      { day: 1, department: 'zaal', startTime: '16:00', endTime: '01:30', role: 'Zaal Sluit', notes: 'Tap & sluitdienst' },
      { day: 1, department: 'zaal', startTime: '17:30', endTime: '23:00', role: 'Zaal Bediening', notes: 'Tafelopvolging' },
      { day: 1, department: 'keuken', startTime: '16:30', endTime: '22:00', role: 'Keuken Chef', notes: 'Avondkeuken' }
    ]
  },
  {
    id: 'builtin_volledig_weekend',
    name: 'Volledig Weekend (Vr + Za + Zo)',
    description: 'Alle shiften voor het complete weekend gebundeld (vrijdagavond, volle zaterdag en familie-zondag).',
    category: 'weekend',
    isBuiltIn: true,
    createdAt: 1718000000000,
    shifts: [
      // Vrijdag (4)
      { day: 4, department: 'zaal', startTime: '16:00', endTime: '02:30', role: 'Zaal Sluit', notes: 'Vr Sluit' },
      { day: 4, department: 'zaal', startTime: '17:00', endTime: '00:00', role: 'Zaal Hulpsluit', notes: 'Vr Hulpsluit' },
      { day: 4, department: 'zaal', startTime: '18:00', endTime: '23:00', role: 'Zaal Bediening', notes: 'Vr Bediening' },
      { day: 4, department: 'keuken', startTime: '16:30', endTime: '22:30', role: 'Keuken Chef', notes: 'Vr Keuken' },
      { day: 4, department: 'keuken', startTime: '17:30', endTime: '22:00', role: 'Keuken Hulp', notes: 'Vr Hulp' },
      // Zaterdag (5)
      { day: 5, department: 'zaal', startTime: '11:30', endTime: '16:00', role: 'Zaal Lunch', notes: 'Za Lunch' },
      { day: 5, department: 'keuken', startTime: '12:00', endTime: '15:30', role: 'Keuken Lunch', notes: 'Za Lunch' },
      { day: 5, department: 'zaal', startTime: '16:00', endTime: '02:30', role: 'Zaal Sluit', notes: 'Za Sluit' },
      { day: 5, department: 'zaal', startTime: '17:00', endTime: '00:00', role: 'Zaal Hulpsluit', notes: 'Za Hulpsluit' },
      { day: 5, department: 'zaal', startTime: '18:00', endTime: '23:30', role: 'Zaal Versterking', notes: 'Za Bediening' },
      { day: 5, department: 'keuken', startTime: '16:30', endTime: '22:30', role: 'Keuken Chef', notes: 'Za Keuken' },
      { day: 5, department: 'keuken', startTime: '17:30', endTime: '22:00', role: 'Keuken Hulp', notes: 'Za Hulp' },
      // Zondag (6)
      { day: 6, department: 'zaal', startTime: '10:00', endTime: '16:00', role: 'Zaal Ochtend', notes: 'Zo Ochtend' },
      { day: 6, department: 'keuken', startTime: '10:30', endTime: '15:30', role: 'Keuken Lunch', notes: 'Zo Lunch' },
      { day: 6, department: 'zaal', startTime: '16:00', endTime: '00:30', role: 'Zaal Sluit', notes: 'Zo Sluit' },
      { day: 6, department: 'zaal', startTime: '17:00', endTime: '23:00', role: 'Zaal Hulp', notes: 'Zo Hulp' },
      { day: 6, department: 'keuken', startTime: '16:30', endTime: '22:00', role: 'Keuken Avond', notes: 'Zo Keuken' }
    ]
  }
];

/**
 * Haalt alle beschikbare sjablonen op (ingebouwd + eigen opgeslagen presets)
 */
export function getLocalTemplates(): ScheduleTemplate[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return BUILT_IN_TEMPLATES;
    const parsed = JSON.parse(raw) as ScheduleTemplate[];
    
    // Voeg eventuele ontbrekende built-ins toe
    const customIds = new Set(parsed.map(t => t.id));
    const missingBuiltIns = BUILT_IN_TEMPLATES.filter(b => !customIds.has(b.id));
    return [...missingBuiltIns, ...parsed];
  } catch (err) {
    console.error('Fout bij ophalen lokale sjablonen:', err);
    return BUILT_IN_TEMPLATES;
  }
}

/**
 * Laadt sjablonen uit Firestore met lokale fallback
 */
export async function loadTemplatesFromCloud(): Promise<ScheduleTemplate[]> {
  try {
    const colRef = collection(db, 'schedule_templates');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const cloudTemplates = snap.docs.map(doc => doc.data() as ScheduleTemplate);
      // Combineer met built-ins
      const cloudIds = new Set(cloudTemplates.map(t => t.id));
      const missingBuiltIns = BUILT_IN_TEMPLATES.filter(b => !cloudIds.has(b.id));
      const combined = [...missingBuiltIns, ...cloudTemplates];
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (err) {
    console.warn('[Firebase] Kon sjablonen niet uit cloud laden, gebruik lokale:', err);
  }
  return getLocalTemplates();
}

/**
 * Slaat een nieuw of bewerkt sjabloon op (zowel lokaal als in cloud)
 */
export async function saveTemplate(template: ScheduleTemplate): Promise<ScheduleTemplate[]> {
  const current = getLocalTemplates();
  const existingIdx = current.findIndex(t => t.id === template.id);
  let updated: ScheduleTemplate[];
  
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...template, updatedAt: Date.now() };
  } else {
    updated = [template, ...current];
  }

  safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Async save naar Firestore
  try {
    const docRef = doc(db, 'schedule_templates', template.id);
    await setDoc(docRef, template, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Kon sjabloon niet naar cloud opslaan:', err);
  }

  return updated;
}

/**
 * Verwijdert een door de beheerder aangemaakt sjabloon
 */
export async function deleteTemplate(templateId: string): Promise<ScheduleTemplate[]> {
  const current = getLocalTemplates();
  const updated = current.filter(t => t.id !== templateId);
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  try {
    const docRef = doc(db, 'schedule_templates', templateId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firebase] Kon sjabloon niet uit cloud verwijderen:', err);
  }

  return updated;
}

/**
 * Maakt een sjabloon aan op basis van de huidige shiften van een dag of week
 */
export function createTemplateFromCurrentShifts(
  name: string,
  description: string,
  category: 'day' | 'weekend' | 'week',
  sourceShifts: Shift[],
  targetDay?: number
): ScheduleTemplate {
  const templateShifts: TemplateShift[] = sourceShifts.map(s => ({
    id: `tpl_shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    day: s.day,
    department: s.department || 'zaal',
    startTime: s.startTime,
    endTime: s.endTime,
    role: s.role || (s.department === 'keuken' ? 'Keuken' : 'Zaal'),
    notes: s.notes || '',
    employeeId: s.employeeId !== 'open_shift' ? s.employeeId : undefined
  }));

  return {
    id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    description,
    category,
    targetDay: category === 'day' ? targetDay : undefined,
    shifts: templateShifts,
    createdAt: Date.now(),
    isBuiltIn: false
  };
}

/**
 * Past een sjabloon toe op een doelweek:
 * - mode === 'overwrite': vervangt shiften op de betreffende dagen
 * - mode === 'merge': voegt de shiften toe zonder bestaande te wissen
 * - targetDayOverride: overschrijft de dag indien het een dagsjabloon is dat op een andere dag wordt toegepast
 */
export function applyTemplateToWeek(
  template: ScheduleTemplate,
  targetWeek: number,
  mode: 'overwrite' | 'merge',
  existingShifts: Shift[],
  employees: Employee[],
  availabilities: EmployeeAvailability[] = [],
  targetDayOverride?: number
): { newShifts: Shift[]; addedCount: number; warnings: string[] } {
  const warnings: string[] = [];
  
  // Bepaal welke dagen beïnvloed worden
  const affectedDays = new Set<number>();
  template.shifts.forEach(ts => {
    const finalDay = targetDayOverride !== undefined && template.category === 'day' ? targetDayOverride : ts.day;
    affectedDays.add(finalDay);
  });

  // Base shifts afhankelijk van overwrite of merge
  let baseShifts = [...existingShifts];
  if (mode === 'overwrite') {
    baseShifts = baseShifts.filter(s => {
      const sWeek = s.weekNumber || targetWeek;
      if (sWeek !== targetWeek) return true;
      return !affectedDays.has(s.day);
    });
  }

  // Medewerkers die al een dienst hebben in deze doelweek
  const scheduledOnDay = (day: number) => {
    return new Set(
      baseShifts
        .filter(s => (s.weekNumber || targetWeek) === targetWeek && s.day === day && s.employeeId)
        .map(s => s.employeeId)
    );
  };

  const addedShifts: Shift[] = [];

  template.shifts.forEach((tplShift, idx) => {
    const finalDay = targetDayOverride !== undefined && template.category === 'day' ? targetDayOverride : tplShift.day;
    const shiftId = `shift_tpl_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    
    let assignedEmpId = tplShift.employeeId || '';
    
    // Controleer of de vaste medewerker beschikbaar is
    if (assignedEmpId && assignedEmpId !== 'open_shift') {
      const emp = employees.find(e => e.id === assignedEmpId);
      if (emp) {
        const eff = getEffectiveEmployeeAvailability(emp, targetWeek, availabilities);
        const dayAvail = eff.availability?.days?.find(d => d.day === finalDay);
        if (dayAvail && dayAvail.status === 'unavailable') {
          warnings.push(`⚠️ ${emp.name} is volgens beschikbaarheid NIET beschikbaar op dag ${finalDay + 1}.`);
        }
      }
    }

    // Als er geen medewerker was gekoppeld, zoek de beste beschikbare kandidaat voor de afdeling
    if (!assignedEmpId || assignedEmpId === 'open_shift') {
      const dayScheduled = scheduledOnDay(finalDay);
      
      const candidate = employees.find(emp => {
        if (emp.id === 'emp1' && emp.role === 'beheerder') return false;
        if (emp.department !== tplShift.department) return false;
        if (dayScheduled.has(emp.id)) return false; // Nog niet ingepland op deze dag
        
        const eff = getEffectiveEmployeeAvailability(emp, targetWeek, availabilities);
        const dayAvail = eff.availability?.days?.find(d => d.day === finalDay);
        return dayAvail && (dayAvail.status === 'available' || dayAvail.status === 'preferred');
      });

      if (candidate) {
        assignedEmpId = candidate.id;
        dayScheduled.add(candidate.id);
      } else {
        assignedEmpId = 'open_shift'; // Open dienst indien niemand direct beschikbaar is
      }
    }

    const createdShift: Shift = {
      id: shiftId,
      employeeId: assignedEmpId,
      department: tplShift.department,
      weekNumber: targetWeek,
      day: finalDay,
      startTime: tplShift.startTime,
      endTime: tplShift.endTime,
      role: tplShift.role || (tplShift.department === 'keuken' ? 'Keuken' : 'Zaal'),
      notes: tplShift.notes ? `${tplShift.notes} (Sjabloon: ${template.name})` : `Sjabloon: ${template.name}`,
      status: 'draft', // Altijd als concept inladen zodat beheerder kan nakijken vóór publicatie
      acknowledged: false
    };

    addedShifts.push(createdShift);
  });

  return {
    newShifts: [...baseShifts, ...addedShifts],
    addedCount: addedShifts.length,
    warnings
  };
}
