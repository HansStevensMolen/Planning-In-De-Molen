import { Shift, Employee, EmployeeAvailability, Department } from '../types';

export interface RequiredSlot {
  period: 'overdag' | 'avond';
  roleType: 'dag' | 'sluit' | 'hulpsluit' | 'avond';
  department: Department;
  defaultStart: string;
  defaultEnd: string;
  notes: string;
}

export interface DayShiftRequirements {
  day: number;
  dayName: string;
  overdagCount: number;
  avondCount: number;
  slots: RequiredSlot[];
}

/**
 * Exact requirements as specified by the manager:
 * - Overdag: 2 personen elke dag (Ma t/m Zo)
 * - 's Avonds:
 *   - Maandag (0): 4 personen (1 sluit, 1 hulpsluit, 2 avond)
 *   - Dinsdag (1): 4 personen (1 sluit, 1 hulpsluit, 2 avond)
 *   - Woensdag (2): 5 personen (1 sluit, 1 hulpsluit, 3 avond)
 *   - Donderdag (3): 5 personen (1 sluit, 1 hulpsluit, 3 avond)
 *   - Vrijdag (4): 7 personen (1 sluit, 1 hulpsluit, 5 avond)
 *   - Zaterdag (5): 7 personen (1 sluit, 1 hulpsluit, 5 avond)
 *   - Zondag (6): 7 personen (1 sluit, 1 hulpsluit, 5 avond)
 * - Elke avonddienst bevat exact 1 sluit en 1 hulpsluit!
 */
export function getDailyShiftRequirements(day: number): DayShiftRequirements {
  const isSunday = day === 6;
  const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
  const dayName = dayNames[day] || `Dag ${day}`;

  const slots: RequiredSlot[] = [];

  // 1. OVERDAG: exact 2 personen
  if (isSunday) {
    // Zondag opening vanaf 10:00
    slots.push(
      {
        period: 'overdag',
        roleType: 'dag',
        department: 'zaal',
        defaultStart: '10u00',
        defaultEnd: '18u00',
        notes: 'Overdag Zaal (Opening 10u)'
      },
      {
        period: 'overdag',
        roleType: 'dag',
        department: 'keuken',
        defaultStart: '10u00',
        defaultEnd: '18u00',
        notes: 'Overdag Keuken (Brunch & lunch)'
      }
    );
  } else {
    // Maandag t/m Zaterdag overdag
    slots.push(
      {
        period: 'overdag',
        roleType: 'dag',
        department: 'zaal',
        defaultStart: 'Open',
        defaultEnd: '18u00',
        notes: 'Overdag Zaal (Dagdienst)'
      },
      {
        period: 'overdag',
        roleType: 'dag',
        department: 'keuken',
        defaultStart: 'Open',
        defaultEnd: '18u00',
        notes: 'Overdag Keuken (Dagdienst)'
      }
    );
  }

  // 2. 'S AVONDS:
  // Ma (0), Di (1): 4 personen
  // Wo (2), Do (3): 5 personen
  // Vr (4), Za (5), Zo (6): 7 personen
  let avondCount = 4;
  if (day === 2 || day === 3) {
    avondCount = 5;
  } else if (day >= 4) {
    avondCount = 7;
  }

  // A. Verplichte Sluit (1 persoon)
  slots.push({
    period: 'avond',
    roleType: 'sluit',
    department: 'zaal',
    defaultStart: isSunday ? '15u30' : '16u00',
    defaultEnd: 'Sluit',
    notes: 'Avonddienst • Sluit'
  });

  // B. Verplichte Hulpsluit (1 persoon)
  slots.push({
    period: 'avond',
    roleType: 'hulpsluit',
    department: 'zaal',
    defaultStart: isSunday ? '15u30' : '16u00',
    defaultEnd: 'Hulpsluit',
    notes: 'Avonddienst • Hulpsluit'
  });

  // C. Overige avondpersonen (avondCount - 2)
  const remainingAvondCount = avondCount - 2;

  if (day === 0 || day === 1) {
    // Ma, Di: remaining = 2 -> 1 Keuken avond, 1 Zaal avond
    slots.push(
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: '16u00',
        defaultEnd: '23u00',
        notes: 'Avonddienst Keuken'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'zaal',
        defaultStart: '17u00',
        defaultEnd: '23u00',
        notes: 'Avonddienst Zaal'
      }
    );
  } else if (day === 2 || day === 3) {
    // Wo, Do: remaining = 3 -> 2 Keuken avond, 1 Zaal avond
    slots.push(
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: '16u00',
        defaultEnd: '23u00',
        notes: 'Avonddienst Keuken (Chef/warme kant)'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: '17u00',
        defaultEnd: '23u00',
        notes: 'Avonddienst Keuken'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'zaal',
        defaultStart: '17u00',
        defaultEnd: '23u00',
        notes: 'Avonddienst Zaal'
      }
    );
  } else {
    // Vr (4), Za (5), Zo (6): remaining = 5 -> 3 Keuken avond, 2 Zaal avond
    const defaultEndHour = isSunday ? '23u00' : '23u30';
    slots.push(
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: isSunday ? '15u00' : '15u30',
        defaultEnd: defaultEndHour,
        notes: 'Avonddienst Keukenchef'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: '16u00',
        defaultEnd: defaultEndHour,
        notes: 'Avonddienst Keuken warme kant'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'keuken',
        defaultStart: '16u30',
        defaultEnd: defaultEndHour,
        notes: 'Avonddienst Keuken prep & desserts'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'zaal',
        defaultStart: '16u30',
        defaultEnd: isSunday ? '23u00' : '00u00',
        notes: 'Avonddienst Bar & Terras'
      },
      {
        period: 'avond',
        roleType: 'avond',
        department: 'zaal',
        defaultStart: '17u30',
        defaultEnd: isSunday ? '23u00' : '00u00',
        notes: 'Avonddienst Zaalbediening'
      }
    );
  }

  return {
    day,
    dayName,
    overdagCount: 2,
    avondCount,
    slots
  };
}

/**
 * Slimme Auto-Planner Engine:
 * Generates an optimal work schedule for a specific week number,
 * precisely meeting the manager's constraints:
 * - Overdag: 2 personen
 * - Ma & Di avond: 4 personen (1 sluit, 1 hulpsluit)
 * - Wo & Do avond: 5 personen (1 sluit, 1 hulpsluit)
 * - Vr, Za & Zo avond: 7 personen (1 sluit, 1 hulpsluit)
 * Respects:
 * - Submitted availabilities (preferred/available/unavailable)
 * - Specified start & end times
 * - Contract limits (Pat & Matthias 4 days fulltime, Vast 5 days, Flexi/Student 2-3 days)
 * - Experience balancing (Verantwoordelijke/Ervaren prioritized for Sluit)
 * - Department preferences (zaal vs keuken)
 */
export function generateSmartAutoPlan(
  weekNumber: number,
  employees: Employee[],
  availabilities: EmployeeAvailability[] = [],
  forcePublished = false
): Shift[] {
  if (!employees || employees.length === 0) {
    return [];
  }

  const activeEmployees = employees.filter(e => e.active !== false);
  const pool = activeEmployees.length > 0 ? activeEmployees : employees;

  // Track assigned shifts per employee in this week
  const shiftCounts: Record<string, number> = {};
  pool.forEach(emp => {
    shiftCounts[emp.id] = 0;
  });

  // Determine target max shifts per employee
  const targetShiftsPerEmp: Record<string, number> = {};
  pool.forEach(emp => {
    const is4DayFulltime = 
      emp.contractDaysPerWeek === 4 ||
      emp.name.toLowerCase().includes('pat') ||
      emp.name.toLowerCase().includes('matthias') ||
      emp.name.toLowerCase().includes('mathias');

    if (emp.statuut === 'Vast') {
      targetShiftsPerEmp[emp.id] = is4DayFulltime ? 4 : (emp.contractDaysPerWeek || 5);
    } else if (emp.statuut === 'Flexi') {
      targetShiftsPerEmp[emp.id] = 3;
    } else if (emp.statuut === 'Student') {
      targetShiftsPerEmp[emp.id] = 3;
    } else {
      targetShiftsPerEmp[emp.id] = 2; // Extra
    }
  });

  const generatedShifts: Shift[] = [];
  const now = Date.now();
  let shiftCounter = 1;

  // Plan day by day (0 = Maandag to 6 = Zondag)
  for (let day = 0; day < 7; day++) {
    const dayReq = getDailyShiftRequirements(day);
    const assignedToday = new Set<string>();

    for (const slot of dayReq.slots) {
      // Score all candidate employees for this specific slot
      let bestCandidate: Employee | null = null;
      let highestScore = -Infinity;
      let matchedStartTime = slot.defaultStart;
      let matchedEndTime = slot.defaultEnd;

      for (const emp of pool) {
        // Hard constraint: An employee cannot work twice on the same day
        if (assignedToday.has(emp.id)) {
          continue;
        }

        let score = 100; // Base score
        let candidateStart = slot.defaultStart;
        let candidateEnd = slot.defaultEnd;

        // 1. Availability check
        const empAvail = availabilities.find(a => a.employeeId === emp.id && a.weekNumber === weekNumber);
        if (empAvail) {
          const dayAvail = empAvail.days.find(d => d.day === day);
          if (dayAvail) {
            if (dayAvail.status === 'unavailable') {
              score -= 2000; // Strongly avoid
            } else if (dayAvail.status === 'preferred') {
              score += 800; // Big bonus
            } else if (dayAvail.status === 'available') {
              score += 400; // Standard available
            }

            // If user specified custom start/end time
            if (dayAvail.startTime) {
              candidateStart = dayAvail.startTime;
            }
            if (dayAvail.endTime) {
              candidateEnd = dayAvail.endTime;
            }

            // Specific role matching from availability notes or times
            const lowerNotes = (dayAvail.notes || '').toLowerCase();
            const lowerEnd = (dayAvail.endTime || '').toLowerCase();
            const lowerStart = (dayAvail.startTime || '').toLowerCase();

            if (slot.roleType === 'sluit') {
              if (lowerEnd.includes('sluit') || lowerNotes.includes('sluit')) {
                score += 500;
              }
            } else if (slot.roleType === 'hulpsluit') {
              if (lowerEnd.includes('hulpsluit') || lowerNotes.includes('hulpsluit')) {
                score += 500;
              }
            } else if (slot.roleType === 'dag') {
              if (lowerEnd.includes('18') || lowerStart.includes('open') || lowerStart.includes('10') || lowerNotes.includes('dag')) {
                score += 400;
              }
            }
          }
        } else {
          // No availability submitted for this week: neutral priority
          score += 50;
        }

        // 2. Department matching
        if (emp.department === slot.department) {
          score += 250;
        } else {
          score -= 80;
        }

        // 3. Experience matching
        if (slot.roleType === 'sluit') {
          if (emp.experience === 'Verantwoordelijke') {
            score += 450;
          } else if (emp.experience === 'Ervaren') {
            score += 350;
          } else if (emp.experience === 'Gemiddeld') {
            score += 150;
          } else if (emp.experience === 'Beginner') {
            score -= 300; // Beginner should not be sole sluit
          }
        } else if (slot.roleType === 'hulpsluit') {
          if (emp.experience === 'Ervaren' || emp.experience === 'Gemiddeld') {
            score += 250;
          }
        }

        // 4. Contract and workload balancing
        const currentCount = shiftCounts[emp.id] || 0;
        const targetCount = targetShiftsPerEmp[emp.id] || 4;

        if (currentCount < targetCount) {
          // Boost employees who still need shifts to fulfill their contract
          score += (targetCount - currentCount) * 120;
          if (emp.statuut === 'Vast') {
            score += 150; // Prioritize permanent staff getting their contracted shifts
          }
        } else {
          // Penalize employees who already met or exceeded their target
          score -= (currentCount - targetCount + 1) * 200;
        }

        // 5. Manager role nuance: Hans Stevens (emp1) is manager
        if (emp.id === 'emp1') {
          // Hans can work, but give staff members first pick if staff pool is adequate (> 6 members)
          if (pool.length > 6) {
            score -= 100;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestCandidate = emp;
          matchedStartTime = candidateStart;
          // Keep canonical role end times for Sluit and Hulpsluit
          if (slot.roleType === 'sluit') {
            matchedEndTime = 'Sluit';
          } else if (slot.roleType === 'hulpsluit') {
            matchedEndTime = 'Hulpsluit';
          } else if (slot.roleType === 'dag') {
            matchedEndTime = '18u00';
          } else {
            matchedEndTime = candidateEnd;
          }
        }
      }

      // If no valid candidate was found (e.g. extreme shortage), fallback to any employee not working today
      if (!bestCandidate) {
        bestCandidate = pool.find(e => !assignedToday.has(e.id)) || pool[0];
      }

      if (bestCandidate) {
        assignedToday.add(bestCandidate.id);
        shiftCounts[bestCandidate.id] = (shiftCounts[bestCandidate.id] || 0) + 1;

        generatedShifts.push({
          id: `shift_auto_w${weekNumber}_d${day}_${shiftCounter++}`,
          employeeId: bestCandidate.id,
          weekNumber,
          department: slot.department,
          day,
          startTime: matchedStartTime,
          endTime: matchedEndTime,
          notes: slot.notes,
          acknowledged: false,
          status: forcePublished ? 'published' : 'draft',
          updatedAt: now
        });
      }
    }
  }

  return generatedShifts;
}

/**
 * Generate shifts for a single week.
 * Uses smart planning based on registered employees and availability.
 */
export function generateShiftsForWeek(
  weekNumber: number,
  forcePublished = false,
  employees?: Employee[],
  availabilities: EmployeeAvailability[] = []
): Shift[] {
  if (employees && employees.length > 0) {
    return generateSmartAutoPlan(weekNumber, employees, availabilities, forcePublished);
  }

  // Fallback if no employees passed
  return [];
}

/**
 * Generates all shifts for upcoming weeks starting from next week.
 */
export function generateSixUpcomingWeeksShifts(
  startWeek = 38,
  count = 7,
  employees?: Employee[],
  availabilities: EmployeeAvailability[] = []
): Shift[] {
  const allShifts: Shift[] = [];
  for (let i = 0; i < count; i++) {
    const weekNum = startWeek + i;
    const isFirstWeek = i === 0;
    allShifts.push(...generateShiftsForWeek(weekNum, isFirstWeek, employees, availabilities));
  }
  return allShifts;
}
