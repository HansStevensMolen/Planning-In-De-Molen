import { Shift, Employee, EmployeeAvailability, Notice } from '../types';
import { CURRENT_WEEK_NUMBER } from './weekUtils';

export const DAYS_OF_WEEK = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

/**
 * Finds all employees who:
 * 1. Are active staff members (excluding Hans Stevens / beheerder and 'open_shift')
 * 2. Are NOT the employee currently giving up / assigned to this shift
 * 3. Match the department (if specified on the shift)
 * 4. Are NOT already scheduled for another shift on the same day in that week
 * 5. Have indicated availability (available or preferred) on that day in their availability submission
 *    or recurring availability preferences.
 */
export function findAvailableUnscheduledStaffForShift(
  shift: Shift,
  allEmployees: Employee[],
  allShifts: Shift[],
  allAvailabilities: EmployeeAvailability[]
): Employee[] {
  const shiftWeek = shift.weekNumber || CURRENT_WEEK_NUMBER;
  const shiftDay = shift.day;

  return allEmployees.filter(emp => {
    // 1. Exclude manager (emp1) and open_shift placeholder
    if (emp.id === 'emp1' && emp.role === 'beheerder') return false;
    if (emp.id === 'open_shift') return false;
    if (!emp.active) return false;

    // 2. Exclude current owner of the shift (if any)
    if (shift.employeeId && emp.id === shift.employeeId && shift.employeeId !== 'open_shift') {
      return false;
    }

    // 3. Department matching: if shift has explicit department, match or verify capability
    if (shift.department && emp.department && emp.department !== shift.department) {
      return false;
    }

    // 4. Check if employee is ALREADY SCHEDULED on that same day in this week
    const isAlreadyScheduledOnDay = allShifts.some(s => 
      s.employeeId === emp.id &&
      (s.weekNumber || CURRENT_WEEK_NUMBER) === shiftWeek &&
      s.day === shiftDay &&
      s.id !== shift.id
    );
    if (isAlreadyScheduledOnDay) {
      return false; // Not "niet-ingepland"
    }

    // 5. Check if employee submitted availability for this week and is available/preferred
    const empAvail = allAvailabilities.find(a => 
      a.employeeId === emp.id && 
      a.weekNumber === shiftWeek
    );

    if (empAvail && empAvail.days && empAvail.days.length > 0) {
      const dayAvail = empAvail.days.find(d => d.day === shiftDay);
      if (dayAvail && (dayAvail.status === 'available' || dayAvail.status === 'preferred')) {
        return true;
      }
      // If explicit submission marked unavailable for this day, respect that
      if (dayAvail && dayAvail.status === 'unavailable') {
        return false;
      }
    }

    // 6. Fallback to recurring availability preferences if no specific week submission
    if (emp.recurringAvailability?.active && emp.recurringAvailability.days) {
      const recDay = emp.recurringAvailability.days.find(d => d.day === shiftDay);
      if (recDay && (recDay.status === 'available' || recDay.status === 'preferred')) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Generates personal targeted notices for all available & unscheduled staff members
 * when a shift becomes available/free.
 */
export function generateFreedShiftNotices(
  shift: Shift,
  availableEmployees: Employee[]
): Notice[] {
  const shiftWeek = shift.weekNumber || CURRENT_WEEK_NUMBER;
  const dayName = DAYS_OF_WEEK[shift.day] || `Dag ${shift.day}`;
  const deptLabel = shift.department === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
  const today = new Date().toISOString().split('T')[0];

  return availableEmployees.map(emp => ({
    id: `notice_freed_${shift.id}_${emp.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: `🔔 Shift Vrijgekomen: ${dayName} (${shift.startTime} - ${shift.endTime})`,
    content: `Beste ${emp.name}, er is zojuist een ${deptLabel}-dienst vrijgekomen op ${dayName} (${shift.startTime} - ${shift.endTime}) in Week ${shiftWeek}. Volgens jouw beschikbaarheid ben je op deze dag beschikbaar en nog niet ingepland! Je kunt deze dienst direct aannemen via het Ruilbord in je personeelsportaal.`,
    date: today,
    category: 'planning',
    author: 'Café In De Molen (Planning)',
    targetEmployeeId: emp.id,
    shiftId: shift.id,
    readBy: [],
    dismissedBy: []
  }));
}
