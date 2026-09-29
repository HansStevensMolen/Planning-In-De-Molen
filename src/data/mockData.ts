import { Employee, Shift, Notice, SwapRequest, ChangeLog, EmployeeAvailability } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    "id": "emp_1789839021025_0",
    "name": "Alexander Godderie",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789821074048_m5tq",
    "name": "Arthur Vander Beken",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ec4899",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_5",
    "name": "Christophe Ancré",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789824722545_ykbd",
    "name": "Elke Petré",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_6",
    "name": "Emma Van den Broeck",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_7",
    "name": "Esmée Joly",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789841627316_o1hv",
    "name": "Fien Vanderwegen",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "textColor": "text-rose-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_9",
    "name": "Geertrui Beerten",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#14b8a6",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_11",
    "name": "Haddy Sarr",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp1",
    "name": "Hans Stevens",
    "department": "zaal",
    "statuut": "Vast",
    "experience": "Verantwoordelijke",
    "contractDaysPerWeek": 5,
    "role": "beheerder",
    "color": "#0d9488",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "email": "hans.stevens@gemeenteschoolbierbeek.be",
    "phone": "0475 12 34 56",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_12",
    "name": "Ine Laurent",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_13",
    "name": "Isabel Vanneck",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789841882714_gx6j",
    "name": "JONATHAN GIELENS",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789222624478_19",
    "name": "Juliette Degrez",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_18",
    "name": "Juliette Vander Beken",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "textColor": "text-rose-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1790181420092_z4kh",
    "name": "Katrien Vandenplas",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#14b8a6",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_20",
    "name": "Lamine Ndiaye",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_21",
    "name": "Leonie Stroeckx",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ec4899",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_22",
    "name": "Lien Noé",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_23",
    "name": "Lieselotte Verreecken",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_24",
    "name": "Linne Ollivier",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_25",
    "name": "Loïs Kamp",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_26",
    "name": "Lotte Fransens",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "textColor": "text-rose-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_30",
    "name": "Maïte Adenot",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#14b8a6",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_31",
    "name": "Manon Vandevelde",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_32",
    "name": "Mara Shöffski",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ec4899",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789222624478_36",
    "name": "Mathias Cakoni",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_36",
    "name": "Matthias Vanparijs",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_38",
    "name": "Mégane Chassagne",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_40",
    "name": "Mirte Christiaen",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1790263857779_yhpl",
    "name": "Mirte Peeters",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "textColor": "text-rose-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_43",
    "name": "Naomie Vandermosten Hick",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#14b8a6",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_44",
    "name": "Nick Wouters",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_45",
    "name": "Niels Vranckx",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ec4899",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_47",
    "name": "Noah Kuijpers",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_48",
    "name": "Nore Milissen",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_49",
    "name": "Ona Verreydt",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_50",
    "name": "Patrick Gevaert",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_53",
    "name": "Renée Stroeckx",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "textColor": "text-rose-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_55",
    "name": "Sander Dam",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#14b8a6",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789842779409_dxra",
    "name": "Sieben Merckx",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#6366f1",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_56",
    "name": "Silvia Vanderschrieck",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#ec4899",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_59",
    "name": "Thomas Bevernage",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#f59e0b",
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_60",
    "name": "Toon Bastiaens",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#10b981",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_61",
    "name": "Wouter Stroobants",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#06b6d4",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  },
  {
    "id": "emp_1789839021025_62",
    "name": "Ynske Cukon",
    "department": "zaal",
    "statuut": "Student",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "color": "#8b5cf6",
    "textBgColor": "bg-violet-50 border-violet-200",
    "textColor": "text-violet-700",
    "active": true,
    "firstLoginComplete": true,
    "pin": "1234"
  }
];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_AVAILABILITIES: EmployeeAvailability[] = [
  {
    "id": "w39_emp1",
    "employeeId": "emp1",
    "weekNumber": 39,
    "employeeName": "Hans Stevens",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "startTime": "Open",
        "day": 0,
        "endTime": "Sluit"
      },
      {
        "startTime": "Open",
        "day": 1,
        "endTime": "18u00",
        "status": "available"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "Open",
        "endTime": "18u00",
        "day": 3
      },
      {
        "endTime": "Sluit",
        "day": 4,
        "status": "available",
        "startTime": "Open"
      },
      {
        "startTime": "Open",
        "endTime": "Sluit",
        "status": "available",
        "day": 5
      },
      {
        "endTime": "21u00",
        "status": "available",
        "day": 6,
        "startTime": "Open"
      }
    ],
    "lastUpdated": 1789297233579,
    "formattedDate": "13/09/2026, 13:00"
  },
  {
    "id": "w39_emp_1789821074048_m5tq",
    "employeeId": "emp_1789821074048_m5tq",
    "weekNumber": 39,
    "employeeName": "Arthur Vander Beken",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 4
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035860,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789841627316_o1hv",
    "employeeId": "emp_1789841627316_o1hv",
    "weekNumber": 39,
    "employeeName": "Fien Vanderwegen",
    "department": "zaal",
    "days": [
      {
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "available"
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 39,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 0
      },
      {
        "status": "available",
        "day": 5
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_11",
    "employeeId": "emp_1789839021025_11",
    "weekNumber": 39,
    "employeeName": "Haddy Sarr",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "day": 1,
        "status": "available"
      },
      {
        "status": "available",
        "day": 2
      },
      {
        "status": "available",
        "day": 3
      },
      {
        "status": "available",
        "day": 4
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 39,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 2
      },
      {
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789222624478_19",
    "employeeId": "emp_1789222624478_19",
    "weekNumber": 39,
    "employeeName": "Juliette Degrez",
    "department": "zaal",
    "days": [
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789222829061,
    "formattedDate": "12/09/2026, 16:20"
  },
  {
    "id": "w39_emp_1789839021025_20",
    "employeeId": "emp_1789839021025_20",
    "weekNumber": 39,
    "employeeName": "Lamine Ndiaye",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "day": 1,
        "status": "available"
      },
      {
        "status": "available",
        "day": 3
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_22",
    "employeeId": "emp_1789839021025_22",
    "weekNumber": 39,
    "employeeName": "Lien Noé",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 1
      },
      {
        "status": "available",
        "day": 3
      },
      {
        "status": "available",
        "day": 4
      },
      {
        "status": "available",
        "day": 5
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_23",
    "employeeId": "emp_1789839021025_23",
    "weekNumber": 39,
    "employeeName": "Lieselotte Verreecken",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 5
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_24",
    "employeeId": "emp_1789839021025_24",
    "weekNumber": 39,
    "employeeName": "Linne Ollivier",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_26",
    "employeeId": "emp_1789839021025_26",
    "weekNumber": 39,
    "employeeName": "Lotte Fransens",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 5
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 39,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 1
      },
      {
        "day": 2,
        "status": "available"
      },
      {
        "day": 3,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_31",
    "employeeId": "emp_1789839021025_31",
    "weekNumber": 39,
    "employeeName": "Manon Vandevelde",
    "department": "zaal",
    "days": [
      {
        "day": 1,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789222624478_36",
    "employeeId": "emp_1789222624478_36",
    "weekNumber": 39,
    "employeeName": "Mathias Cakoni",
    "department": "zaal",
    "days": [
      {
        "day": 4,
        "status": "available"
      },
      {
        "status": "available",
        "day": 5
      },
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789222829062,
    "formattedDate": "12/09/2026, 16:20"
  },
  {
    "id": "w39_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 39,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "day": 1,
        "status": "available"
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_43",
    "employeeId": "emp_1789839021025_43",
    "weekNumber": 39,
    "employeeName": "Naomie Vandermosten Hick",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 4
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_44",
    "employeeId": "emp_1789839021025_44",
    "weekNumber": 39,
    "employeeName": "Nick Wouters",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 0
      },
      {
        "status": "available",
        "day": 1
      },
      {
        "status": "available",
        "day": 2
      },
      {
        "day": 3,
        "status": "available"
      },
      {
        "status": "available",
        "day": 4
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_49",
    "employeeId": "emp_1789839021025_49",
    "weekNumber": 39,
    "employeeName": "Ona Verreydt",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "status": "available",
        "day": 1
      },
      {
        "day": 2,
        "status": "available"
      },
      {
        "day": 3,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 39,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_56",
    "employeeId": "emp_1789839021025_56",
    "weekNumber": 39,
    "employeeName": "Silvia Vanderschrieck",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 2
      },
      {
        "day": 3,
        "status": "available"
      },
      {
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_5",
    "employeeId": "emp_1789839021025_5",
    "weekNumber": 39,
    "employeeName": "Christophe Ancré",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "status": "available",
        "day": 1
      },
      {
        "status": "available",
        "day": 2
      },
      {
        "status": "available",
        "day": 3
      },
      {
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 39,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "day": 2,
        "status": "available"
      },
      {
        "day": 3,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_0",
    "employeeId": "emp_1789839021025_0",
    "weekNumber": 39,
    "employeeName": "Alexander Godderie",
    "department": "zaal",
    "days": [
      {
        "day": 1,
        "status": "available"
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_12",
    "employeeId": "emp_1789839021025_12",
    "weekNumber": 39,
    "employeeName": "Ine Laurent",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "status": "available",
        "day": 1
      },
      {
        "status": "available",
        "day": 4
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_18",
    "employeeId": "emp_1789839021025_18",
    "weekNumber": 39,
    "employeeName": "Juliette Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_25",
    "employeeId": "emp_1789839021025_25",
    "weekNumber": 39,
    "employeeName": "Loïs Kamp",
    "department": "zaal",
    "days": [
      {
        "day": 4,
        "status": "available"
      },
      {
        "status": "available",
        "day": 5
      }
    ],
    "lastUpdated": 1789839035862,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_47",
    "employeeId": "emp_1789839021025_47",
    "weekNumber": 39,
    "employeeName": "Noah Kuijpers",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available"
      },
      {
        "day": 2,
        "status": "available"
      },
      {
        "day": 3,
        "status": "available"
      },
      {
        "status": "available",
        "day": 5
      },
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_53",
    "employeeId": "emp_1789839021025_53",
    "weekNumber": 39,
    "employeeName": "Renée Stroeckx",
    "department": "zaal",
    "days": [
      {
        "day": 4,
        "status": "available"
      },
      {
        "status": "available",
        "day": 5
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_59",
    "employeeId": "emp_1789839021025_59",
    "weekNumber": 39,
    "employeeName": "Thomas Bevernage",
    "department": "zaal",
    "days": [
      {
        "day": 4,
        "status": "available"
      },
      {
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_6",
    "employeeId": "emp_1789839021025_6",
    "weekNumber": 39,
    "employeeName": "Emma Van den Broeck",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 0
      },
      {
        "status": "available",
        "day": 1
      },
      {
        "status": "available",
        "day": 2
      },
      {
        "status": "available",
        "day": 4
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_61",
    "employeeId": "emp_1789839021025_61",
    "weekNumber": 39,
    "employeeName": "Wouter Stroobants",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 5
      }
    ],
    "lastUpdated": 1789839035863,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w39_emp_1789839021025_7",
    "employeeId": "emp_1789839021025_7",
    "weekNumber": 39,
    "employeeName": "Esmée Joly",
    "department": "zaal",
    "days": [
      {
        "day": 5,
        "status": "available"
      },
      {
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1789839035861,
    "formattedDate": "19/09/2026, 19:30"
  },
  {
    "id": "w40_emp_1789821074048_m5tq",
    "employeeId": "emp_1789821074048_m5tq",
    "weekNumber": 40,
    "employeeName": "Arthur Vander Beken",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 2,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 3,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 4,
        "endTime": "23:00",
        "status": "available",
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "endTime": "23:00",
        "day": 5,
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available"
      },
      {
        "day": 6,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366659,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789824722545_ykbd",
    "employeeId": "emp_1789824722545_ykbd",
    "weekNumber": 40,
    "employeeName": "Elke Petré",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "status": "available",
        "endTime": "hulpsluit",
        "startTime": "18:00",
        "day": 3
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 4,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 5,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366659,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_0",
    "employeeId": "emp_1789839021025_0",
    "weekNumber": 40,
    "employeeName": "Alexander Godderie",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "startTime": "18:00",
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 3,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 4,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "available",
        "endTime": "18:00",
        "notes": "Beschikbaar (12u00 - 18u00)",
        "startTime": "12:00"
      }
    ],
    "lastUpdated": 1790019366658,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_11",
    "employeeId": "emp_1789839021025_11",
    "weekNumber": 40,
    "employeeName": "Haddy Sarr",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available",
        "endTime": "22:00",
        "notes": "Beschikbaar (tot 22u00)"
      },
      {
        "endTime": "22:00",
        "status": "available",
        "day": 1,
        "notes": "Beschikbaar (tot 22u00)"
      },
      {
        "endTime": "22:00",
        "day": 2,
        "status": "available",
        "notes": "Beschikbaar (tot 22u00)"
      },
      {
        "notes": "Beschikbaar (tot 18u00)",
        "day": 3,
        "endTime": "18:00",
        "status": "available"
      },
      {
        "endTime": "16:00",
        "notes": "Beschikbaar (tot 16u00)",
        "day": 4,
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_12",
    "employeeId": "emp_1789839021025_12",
    "weekNumber": 40,
    "employeeName": "Ine Laurent",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available",
        "endTime": "18:00",
        "notes": "Beschikbaar (tot 18u00)"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "startTime": "18:00",
        "endTime": "23:00",
        "status": "available",
        "day": 3,
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "status": "unavailable",
        "day": 4,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 5,
        "notes": "Niet-beschikbaar"
      },
      {
        "startTime": "12:00",
        "day": 6,
        "status": "available",
        "endTime": "21:00",
        "notes": "Beschikbaar (12u00 - 21u00)"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 40,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 0
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "available",
        "endTime": "23:00",
        "day": 2,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00"
      },
      {
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "startTime": "18:00",
        "day": 3
      },
      {
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00",
        "status": "available",
        "endTime": "23:00",
        "day": 4
      },
      {
        "startTime": "18:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 5,
        "endTime": "23:00"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_18",
    "employeeId": "emp_1789839021025_18",
    "weekNumber": 40,
    "employeeName": "Juliette Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "available",
        "day": 5,
        "endTime": "23:00",
        "notes": "Beschikbaar (16u00 - 23u00)",
        "startTime": "16:00"
      },
      {
        "startTime": "10:00",
        "day": 6,
        "status": "available",
        "notes": "Beschikbaar (10u00 - 18u00)",
        "endTime": "18:00"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_22",
    "employeeId": "emp_1789839021025_22",
    "weekNumber": 40,
    "employeeName": "Lien Noé",
    "department": "zaal",
    "days": [
      {
        "startTime": "18:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "available",
        "day": 2,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00",
        "endTime": "23:00"
      },
      {
        "day": 3,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "available",
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "endTime": "hulpsluit",
        "day": 4
      },
      {
        "startTime": "12:00",
        "notes": "Beschikbaar (12u00 - 23u00)",
        "day": 5,
        "status": "available",
        "endTime": "23:00"
      },
      {
        "status": "available",
        "day": 6,
        "endTime": "18:00",
        "startTime": "12:00",
        "notes": "Beschikbaar (12u00 - 18u00)"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_23",
    "employeeId": "emp_1789839021025_23",
    "weekNumber": 40,
    "employeeName": "Lieselotte Verreecken",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 2,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 3,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 4
      },
      {
        "startTime": "open",
        "day": 5,
        "endTime": "18:00",
        "notes": "Beschikbaar (Open - 18u00)",
        "status": "available"
      },
      {
        "day": 6,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_24",
    "employeeId": "emp_1789839021025_24",
    "weekNumber": 40,
    "employeeName": "Linne Ollivier",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 1
      },
      {
        "day": 2,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 3
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "available",
        "day": 5,
        "notes": "Beschikbaar (Open - 18u00)",
        "startTime": "open",
        "endTime": "18:00"
      },
      {
        "startTime": "open",
        "notes": "Beschikbaar (Open - 21u00)",
        "status": "available",
        "endTime": "21:00",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_26",
    "employeeId": "emp_1789839021025_26",
    "weekNumber": 40,
    "employeeName": "Lotte Fransens",
    "department": "zaal",
    "days": [
      {
        "endTime": "23:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00",
        "day": 0,
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 2,
        "status": "available",
        "startTime": "18:00",
        "endTime": "23:00",
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "day": 3,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 4,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 5
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 40,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "endTime": "hulpsluit",
        "day": 0,
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "startTime": "18:00",
        "status": "available"
      },
      {
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available",
        "endTime": "23:00",
        "startTime": "18:00",
        "day": 1
      },
      {
        "day": 2,
        "startTime": "18:00",
        "endTime": "23:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_31",
    "employeeId": "emp_1789839021025_31",
    "weekNumber": 40,
    "employeeName": "Manon Vandevelde",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available",
        "endTime": "23:00"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 5,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_32",
    "employeeId": "emp_1789839021025_32",
    "weekNumber": 40,
    "employeeName": "Mara Shöffski",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 3,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 4,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "startTime": "18:00",
        "status": "available"
      },
      {
        "startTime": "18:00",
        "endTime": "23:00",
        "day": 5,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available"
      },
      {
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "status": "available",
        "startTime": "18:00",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_36",
    "employeeId": "emp_1789839021025_36",
    "weekNumber": 40,
    "employeeName": "Matthias Vanparijs",
    "department": "zaal",
    "days": [
      {
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "day": 0,
        "status": "available",
        "startTime": "open"
      },
      {
        "status": "available",
        "startTime": "open",
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "day": 1
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3,
        "notes": "Niet-beschikbaar"
      },
      {
        "startTime": "open",
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "status": "available",
        "day": 4
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 5
      },
      {
        "endTime": "sluit",
        "day": 6,
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)",
        "startTime": "open"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 40,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 1,
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00"
      },
      {
        "day": 2,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "startTime": "18:00",
        "endTime": "23:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 4,
        "status": "available"
      },
      {
        "notes": "Beschikbaar (Open - 18u00)",
        "startTime": "open",
        "status": "available",
        "day": 5,
        "endTime": "18:00"
      },
      {
        "day": 6,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      }
    ],
    "lastUpdated": 1790019366661,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_40",
    "employeeId": "emp_1789839021025_40",
    "weekNumber": 40,
    "employeeName": "Mirte Christiaen",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 3,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "endTime": "23:00",
        "day": 4,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00",
        "status": "available"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 5
      },
      {
        "endTime": "23:00",
        "day": 6,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00",
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1790263857779_yhpl",
    "employeeId": "emp_1790263857779_yhpl",
    "weekNumber": 40,
    "employeeName": "Mirte Peeters",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 3
      },
      {
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "endTime": "18:00",
        "notes": "Beschikbaar (12u00 - 18u00)",
        "day": 6,
        "startTime": "12:00",
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_44",
    "employeeId": "emp_1789839021025_44",
    "weekNumber": 40,
    "employeeName": "Nick Wouters",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Beschikbaar (tot 18u00)",
        "endTime": "18:00",
        "status": "available"
      },
      {
        "status": "available",
        "endTime": "18:00",
        "day": 1,
        "notes": "Beschikbaar (tot 18u00)"
      },
      {
        "notes": "Beschikbaar (open tot hulpsluit)",
        "day": 2,
        "status": "available",
        "endTime": "hulpsluit",
        "startTime": "open"
      },
      {
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "endTime": "hulpsluit",
        "day": 3,
        "status": "available"
      },
      {
        "status": "available",
        "day": 4,
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "endTime": "hulpsluit"
      },
      {
        "day": 5,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Beschikbaar (18u00 - hulpsluit)",
        "endTime": "hulpsluit",
        "startTime": "18:00",
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_45",
    "employeeId": "emp_1789839021025_45",
    "weekNumber": 40,
    "employeeName": "Niels Vranckx",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 4
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 5
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_47",
    "employeeId": "emp_1789839021025_47",
    "weekNumber": 40,
    "employeeName": "Noah Kuijpers",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "day": 1,
        "notes": "Niet-beschikbaar"
      },
      {
        "startTime": "18:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 4
      },
      {
        "notes": "Beschikbaar (Open - 23u00)",
        "day": 5,
        "status": "available",
        "endTime": "23:00",
        "startTime": "open"
      },
      {
        "notes": "Beschikbaar (12u00 - 23u00)",
        "startTime": "12:00",
        "endTime": "23:00",
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_49",
    "employeeId": "emp_1789839021025_49",
    "weekNumber": 40,
    "employeeName": "Ona Verreydt",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available",
        "startTime": "18:00",
        "endTime": "23:00"
      },
      {
        "day": 1,
        "startTime": "18:00",
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "endTime": "23:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 2,
        "startTime": "18:00",
        "status": "available"
      },
      {
        "endTime": "23:00",
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 5,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 6,
        "endTime": "23:00",
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_5",
    "employeeId": "emp_1789839021025_5",
    "weekNumber": 40,
    "employeeName": "Christophe Ancré",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "startTime": "open",
        "day": 0,
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)"
      },
      {
        "day": 1,
        "status": "available",
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "startTime": "open"
      },
      {
        "notes": "Beschikbaar (11u30 - 18u00)",
        "day": 2,
        "startTime": "11:30",
        "endTime": "18:00",
        "status": "available"
      },
      {
        "startTime": "open",
        "day": 3,
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366659,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_50",
    "employeeId": "emp_1789839021025_50",
    "weekNumber": 40,
    "employeeName": "Patrick Gevaert",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Beschikbaar (Open - Sluit)",
        "status": "available",
        "endTime": "sluit",
        "startTime": "open"
      },
      {
        "startTime": "open",
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)",
        "endTime": "sluit",
        "day": 1
      },
      {
        "endTime": "sluit",
        "day": 2,
        "startTime": "open",
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)"
      },
      {
        "notes": "Beschikbaar (Open - Sluit)",
        "status": "available",
        "endTime": "sluit",
        "startTime": "open",
        "day": 3
      },
      {
        "startTime": "open",
        "endTime": "sluit",
        "day": 4,
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)"
      },
      {
        "startTime": "open",
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "day": 5,
        "status": "available"
      },
      {
        "startTime": "open",
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)",
        "endTime": "sluit",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_53",
    "employeeId": "emp_1789839021025_53",
    "weekNumber": 40,
    "employeeName": "Renée Stroeckx",
    "department": "zaal",
    "days": [
      {
        "notes": "Niet-beschikbaar",
        "day": 0,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 3
      },
      {
        "day": 4,
        "endTime": "sluit",
        "status": "available",
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - Sluit)"
      },
      {
        "endTime": "sluit",
        "startTime": "16:00",
        "day": 5,
        "status": "available",
        "notes": "Beschikbaar (16u00 - Sluit)"
      },
      {
        "day": 6,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790019366662,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 40,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "startTime": "open",
        "endTime": "sluit",
        "notes": "Beschikbaar (Open - Sluit)",
        "status": "available"
      },
      {
        "endTime": "sluit",
        "startTime": "open",
        "day": 1,
        "status": "available",
        "notes": "Beschikbaar (Open - Sluit)"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 3
      },
      {
        "notes": "Beschikbaar (17u00 - 23u00)",
        "startTime": "17:00",
        "status": "available",
        "endTime": "23:00",
        "day": 4
      },
      {
        "day": 5,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "available",
        "endTime": "18:00",
        "notes": "Beschikbaar (Open - 18u00)",
        "startTime": "open"
      }
    ],
    "lastUpdated": 1790019366663,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_56",
    "employeeId": "emp_1789839021025_56",
    "weekNumber": 40,
    "employeeName": "Silvia Vanderschrieck",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 0
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "18:00",
        "endTime": "23:00",
        "day": 2,
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "day": 3,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "startTime": "18:00",
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 4
      },
      {
        "day": 5,
        "endTime": "23:00",
        "status": "available",
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)"
      },
      {
        "notes": "Beschikbaar (Open - 18u00)",
        "status": "available",
        "endTime": "18:00",
        "day": 6,
        "startTime": "open"
      }
    ],
    "lastUpdated": 1790019366663,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 40,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "endTime": "23:00",
        "startTime": "18:00",
        "day": 0,
        "notes": "Beschikbaar (18u00 - 23u00)",
        "status": "available"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 1
      },
      {
        "day": 2,
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "startTime": "18:00"
      },
      {
        "startTime": "18:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 3,
        "endTime": "23:00"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5,
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 6,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      }
    ],
    "lastUpdated": 1790019366663,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_62",
    "employeeId": "emp_1789839021025_62",
    "weekNumber": 40,
    "employeeName": "Ynske Cukon",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "endTime": "23:00",
        "status": "available",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "day": 4,
        "startTime": "18:00"
      },
      {
        "day": 5,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 6,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      }
    ],
    "lastUpdated": 1790019366663,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 40,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "endTime": "23:00",
        "day": 0,
        "notes": "Beschikbaar (17u00 - 23u00)",
        "startTime": "17:00",
        "status": "available"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 1
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789841627316_o1hv",
    "employeeId": "emp_1789841627316_o1hv",
    "weekNumber": 40,
    "employeeName": "Fien Vanderwegen",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 0
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Niet-beschikbaar"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "available",
        "notes": "Beschikbaar (18u00 - hulpsluit)",
        "day": 5,
        "endTime": "hulpsluit",
        "startTime": "18:00"
      },
      {
        "startTime": "18:00",
        "notes": "Beschikbaar (18u00 - 23u00)",
        "endTime": "23:00",
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789841882714_gx6j",
    "employeeId": "emp_1789841882714_gx6j",
    "weekNumber": 40,
    "employeeName": "JONATHAN GIELENS",
    "department": "zaal",
    "days": [
      {
        "startTime": "18:00",
        "endTime": "hulpsluit",
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "status": "available",
        "day": 0
      },
      {
        "endTime": "hulpsluit",
        "status": "available",
        "notes": "Beschikbaar (18u00 - Hulpsluit)",
        "startTime": "18:00",
        "day": 1
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 2
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 3,
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "notes": "Niet-beschikbaar",
        "day": 5
      },
      {
        "status": "unavailable",
        "day": 6,
        "notes": "Niet-beschikbaar"
      }
    ],
    "lastUpdated": 1790019366660,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w40_emp_1789842779409_dxra",
    "employeeId": "emp_1789842779409_dxra",
    "weekNumber": 40,
    "employeeName": "Sieben Merckx",
    "department": "zaal",
    "days": [
      {
        "startTime": "16:00",
        "day": 0,
        "endTime": "23:00",
        "notes": "Beschikbaar (16u00 - 23u00)",
        "status": "available"
      },
      {
        "day": 1,
        "status": "available",
        "startTime": "16:00",
        "notes": "Beschikbaar (16u00 - 23u00)",
        "endTime": "23:00"
      },
      {
        "day": 2,
        "startTime": "16:00",
        "endTime": "23:00",
        "notes": "Beschikbaar (16u00 - 23u00)",
        "status": "available"
      },
      {
        "notes": "Beschikbaar (16u00 - 23u00)",
        "status": "available",
        "startTime": "16:00",
        "day": 3,
        "endTime": "23:00"
      },
      {
        "day": 4,
        "status": "unavailable",
        "notes": "Niet-beschikbaar"
      },
      {
        "day": 5,
        "notes": "Niet-beschikbaar",
        "status": "unavailable"
      },
      {
        "notes": "Niet-beschikbaar",
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790019366663,
    "formattedDate": "21/09/2026, 21:36"
  },
  {
    "id": "w41_emp_1789821074048_m5tq",
    "employeeId": "emp_1789821074048_m5tq",
    "weekNumber": 41,
    "employeeName": "Arthur Vander Beken",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available"
      },
      {
        "endTime": "23u00",
        "status": "available",
        "day": 5,
        "startTime": "18u00"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790540134623,
    "formattedDate": "27/09/2026, 22:15"
  },
  {
    "id": "w41_emp_1789839021025_12",
    "employeeId": "emp_1789839021025_12",
    "weekNumber": 41,
    "employeeName": "Ine Laurent",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "endTime": "18u00",
        "startTime": "Open",
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "available",
        "startTime": "18u00",
        "day": 2,
        "endTime": "23u00"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790324225923,
    "formattedDate": "25/09/2026, 10:17"
  },
  {
    "id": "w41_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 41,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "startTime": "18u00",
        "endTime": "23u00",
        "day": 2,
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available"
      },
      {
        "endTime": "Hulpsluit",
        "startTime": "18u00",
        "status": "available",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790073218545,
    "formattedDate": "22/09/2026, 12:33"
  },
  {
    "id": "w41_emp_1789839021025_18",
    "employeeId": "emp_1789839021025_18",
    "weekNumber": 41,
    "employeeName": "Juliette Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "startTime": "16u00",
        "endTime": "Hulpsluit",
        "day": 5,
        "status": "available"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790495479041,
    "formattedDate": "27/09/2026, 09:51"
  },
  {
    "id": "w41_emp_1789839021025_22",
    "employeeId": "emp_1789839021025_22",
    "weekNumber": 41,
    "employeeName": "Lien Noé",
    "department": "zaal",
    "days": [
      {
        "startTime": "Open",
        "day": 0,
        "status": "available",
        "endTime": "Sluit"
      },
      {
        "status": "available",
        "endTime": "Sluit",
        "day": 1,
        "startTime": "Open"
      },
      {
        "day": 2,
        "startTime": "18u00",
        "status": "available",
        "endTime": "23u00"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "startTime": "18u00",
        "endTime": "23u00",
        "status": "available"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "day": 5,
        "endTime": "23u00"
      },
      {
        "endTime": "18u00",
        "startTime": "12u00",
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1790540268327,
    "formattedDate": "27/09/2026, 22:17"
  },
  {
    "id": "w41_emp_1789839021025_24",
    "employeeId": "emp_1789839021025_24",
    "weekNumber": 41,
    "employeeName": "Linne Ollivier",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "Open",
        "endTime": "21u00",
        "day": 6
      }
    ],
    "lastUpdated": 1790177601188,
    "formattedDate": "23/09/2026, 17:33"
  },
  {
    "id": "w41_emp_1789839021025_25",
    "employeeId": "emp_1789839021025_25",
    "weekNumber": 41,
    "employeeName": "Loïs Kamp",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "startTime": "Open",
        "status": "available",
        "day": 5,
        "endTime": "23u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790179706476,
    "formattedDate": "23/09/2026, 18:08"
  },
  {
    "id": "w41_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 41,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0,
        "notes": "Bfast- zwitserland"
      },
      {
        "notes": "Bfast- zwitserland",
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2,
        "notes": "Bfast- zwitserland"
      },
      {
        "day": 3,
        "notes": "Bfast- zwitserland",
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4,
        "notes": "Bfast- zwitserland"
      },
      {
        "day": 5,
        "endTime": "23u00",
        "startTime": "Open",
        "status": "available"
      },
      {
        "day": 6,
        "endTime": "18u00",
        "startTime": "Open",
        "status": "available"
      }
    ],
    "lastUpdated": 1790259470124,
    "formattedDate": "24/09/2026, 16:17"
  },
  {
    "id": "w41_emp_1789839021025_31",
    "employeeId": "emp_1789839021025_31",
    "weekNumber": 41,
    "employeeName": "Manon Vandevelde",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "status": "available",
        "day": 6,
        "endTime": "18u00",
        "startTime": "12u00"
      }
    ],
    "lastUpdated": 1789851486532,
    "formattedDate": "19/09/2026, 22:58"
  },
  {
    "id": "w41_emp_1789839021025_32",
    "employeeId": "emp_1789839021025_32",
    "weekNumber": 41,
    "employeeName": "Mara Shöffski",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "endTime": "23u00",
        "day": 5,
        "startTime": "18u00",
        "status": "available"
      },
      {
        "startTime": "18u00",
        "status": "available",
        "day": 6,
        "endTime": "23u00"
      }
    ],
    "lastUpdated": 1790150345227,
    "formattedDate": "23/09/2026, 09:59"
  },
  {
    "id": "w41_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 41,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "available",
        "day": 1,
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "available",
        "day": 3,
        "startTime": "18u00",
        "endTime": "23u00"
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available",
        "day": 4
      },
      {
        "day": 5,
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790331543448,
    "formattedDate": "25/09/2026, 12:19"
  },
  {
    "id": "w41_emp_1789839021025_40",
    "employeeId": "emp_1789839021025_40",
    "weekNumber": 41,
    "employeeName": "Mirte Christiaen",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "startTime": "18u00",
        "day": 5,
        "endTime": "23u00",
        "status": "available"
      },
      {
        "startTime": "18u00",
        "day": 6,
        "endTime": "23u00",
        "status": "available"
      }
    ],
    "lastUpdated": 1790416264063,
    "formattedDate": "26/09/2026, 11:51"
  },
  {
    "id": "w41_emp_1789839021025_43",
    "employeeId": "emp_1789839021025_43",
    "weekNumber": 41,
    "employeeName": "Naomie Vandermosten Hick",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "startTime": "16u00",
        "endTime": "Hulpsluit",
        "status": "available",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "endTime": "Hulpsluit",
        "status": "available",
        "startTime": "Open"
      }
    ],
    "lastUpdated": 1790427850835,
    "formattedDate": "26/09/2026, 15:04"
  },
  {
    "id": "w41_emp_1789839021025_45",
    "employeeId": "emp_1789839021025_45",
    "weekNumber": 41,
    "employeeName": "Niels Vranckx",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "available",
        "endTime": "Hulpsluit",
        "day": 4,
        "startTime": "16u00"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1789892450361,
    "formattedDate": "20/09/2026, 10:20"
  },
  {
    "id": "w41_emp_1789839021025_48",
    "employeeId": "emp_1789839021025_48",
    "weekNumber": 41,
    "employeeName": "Nore Milissen",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "startTime": "18u00",
        "endTime": "Hulpsluit",
        "status": "available"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "endTime": "21u00",
        "startTime": "Open",
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1790529604416,
    "formattedDate": "27/09/2026, 19:20"
  },
  {
    "id": "w41_emp_1789839021025_53",
    "employeeId": "emp_1789839021025_53",
    "weekNumber": 41,
    "employeeName": "Renée Stroeckx",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "available",
        "startTime": "18u00",
        "endTime": "Sluit"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "endTime": "Sluit",
        "day": 5,
        "startTime": "16u00",
        "status": "available"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790529701319,
    "formattedDate": "27/09/2026, 19:21"
  },
  {
    "id": "w41_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 41,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "startTime": "17u00",
        "status": "available",
        "endTime": "23u00",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1789841617125,
    "formattedDate": "19/09/2026, 20:13"
  },
  {
    "id": "w41_emp_1789839021025_56",
    "employeeId": "emp_1789839021025_56",
    "weekNumber": 41,
    "employeeName": "Silvia Vanderschrieck",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "available",
        "day": 2,
        "startTime": "18u00",
        "endTime": "23u00"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "day": 3,
        "endTime": "23u00"
      },
      {
        "day": 4,
        "endTime": "23u00",
        "status": "available",
        "startTime": "18u00"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "available",
        "startTime": "Open",
        "endTime": "18u00"
      }
    ],
    "lastUpdated": 1790057589599,
    "formattedDate": "22/09/2026, 08:13"
  },
  {
    "id": "w41_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 41,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "endTime": "23u00",
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "startTime": "18u00",
        "endTime": "23u00",
        "day": 2,
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790234425811,
    "formattedDate": "24/09/2026, 09:20"
  },
  {
    "id": "w41_emp_1789839021025_62",
    "employeeId": "emp_1789839021025_62",
    "weekNumber": 41,
    "employeeName": "Ynske Cukon",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790536170896,
    "formattedDate": "27/09/2026, 21:09"
  },
  {
    "id": "w41_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 41,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "available",
        "day": 5,
        "endTime": "18u00",
        "startTime": "Open"
      },
      {
        "endTime": "18u00",
        "day": 6,
        "status": "preferred",
        "startTime": "Open",
        "notes": "Liefst zondag"
      }
    ],
    "lastUpdated": 1790530883945,
    "formattedDate": "27/09/2026, 19:41"
  },
  {
    "id": "w41_emp_1789841627316_o1hv",
    "employeeId": "emp_1789841627316_o1hv",
    "weekNumber": 41,
    "employeeName": "Fien Vanderwegen",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "endTime": "Hulpsluit",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790542702691,
    "formattedDate": "27/09/2026, 22:58"
  },
  {
    "id": "w41_emp_1790263857779_yhpl",
    "employeeId": "emp_1790263857779_yhpl",
    "weekNumber": 41,
    "employeeName": "Mirte Peeters",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "startTime": "12u00",
        "endTime": "18u00",
        "status": "available"
      },
      {
        "startTime": "18u00",
        "status": "available",
        "endTime": "23u00",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "status": "available",
        "startTime": "12u00",
        "day": 6,
        "endTime": "18u00"
      }
    ],
    "lastUpdated": 1790264178893,
    "formattedDate": "24/09/2026, 17:36"
  },
  {
    "id": "w42_emp_1789821074048_m5tq",
    "employeeId": "emp_1789821074048_m5tq",
    "weekNumber": 42,
    "employeeName": "Arthur Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "status": "available",
        "startTime": "18u00",
        "endTime": "23u00"
      },
      {
        "endTime": "23u00",
        "day": 5,
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790539858442,
    "formattedDate": "27/09/2026, 22:10"
  },
  {
    "id": "w42_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 42,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "startTime": "18u00",
        "status": "available",
        "day": 1,
        "endTime": "23u00"
      },
      {
        "day": 2,
        "startTime": "18u00",
        "endTime": "23u00",
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790459087556,
    "formattedDate": "26/09/2026, 23:44"
  },
  {
    "id": "w42_emp_1789839021025_18",
    "employeeId": "emp_1789839021025_18",
    "weekNumber": 42,
    "employeeName": "Juliette Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "endTime": "Hulpsluit",
        "day": 5,
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790685761736,
    "formattedDate": "29/09/2026, 14:42"
  },
  {
    "id": "w42_emp_1789839021025_21",
    "employeeId": "emp_1789839021025_21",
    "weekNumber": 42,
    "employeeName": "Leonie Stroeckx",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "17u00",
        "endTime": "23u00",
        "day": 4
      },
      {
        "startTime": "Open",
        "day": 5,
        "endTime": "23u00",
        "status": "available"
      },
      {
        "status": "available",
        "startTime": "Open",
        "endTime": "18u00",
        "day": 6
      }
    ],
    "lastUpdated": 1790587109681,
    "formattedDate": "28/09/2026, 11:18"
  },
  {
    "id": "w42_emp_1789839021025_24",
    "employeeId": "emp_1789839021025_24",
    "weekNumber": 42,
    "employeeName": "Linne Ollivier",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "endTime": "21u00",
        "startTime": "Open",
        "status": "available"
      }
    ],
    "lastUpdated": 1790687377018,
    "formattedDate": "29/09/2026, 15:09"
  },
  {
    "id": "w42_emp_1789839021025_25",
    "employeeId": "emp_1789839021025_25",
    "weekNumber": 42,
    "employeeName": "Loïs Kamp",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 4,
        "status": "available"
      },
      {
        "startTime": "Open",
        "status": "available",
        "endTime": "23u00",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790179750274,
    "formattedDate": "23/09/2026, 18:09"
  },
  {
    "id": "w42_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 42,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "endTime": "Hulpsluit",
        "startTime": "18u00",
        "status": "available",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "endTime": "Hulpsluit",
        "startTime": "18u00",
        "status": "available"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "startTime": "18u00",
        "status": "available",
        "endTime": "Hulpsluit",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790259780455,
    "formattedDate": "24/09/2026, 16:23"
  },
  {
    "id": "w42_emp_1789839021025_31",
    "employeeId": "emp_1789839021025_31",
    "weekNumber": 42,
    "employeeName": "Manon Vandevelde",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "status": "available",
        "day": 6,
        "startTime": "Open",
        "endTime": "21u00"
      }
    ],
    "lastUpdated": 1789851753973,
    "formattedDate": "19/09/2026, 23:02"
  },
  {
    "id": "w42_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 42,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "available",
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "startTime": "18u00",
        "endTime": "23u00",
        "day": 3,
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "endTime": "23u00",
        "day": 5,
        "startTime": "18u00",
        "status": "available"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790331555324,
    "formattedDate": "25/09/2026, 12:19"
  },
  {
    "id": "w42_emp_1789839021025_45",
    "employeeId": "emp_1789839021025_45",
    "weekNumber": 42,
    "employeeName": "Niels Vranckx",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "endTime": "Hulpsluit",
        "startTime": "16u00",
        "status": "available",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1789892577522,
    "formattedDate": "20/09/2026, 10:22"
  },
  {
    "id": "w42_emp_1789839021025_48",
    "employeeId": "emp_1789839021025_48",
    "weekNumber": 42,
    "employeeName": "Nore Milissen",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790529520501,
    "formattedDate": "27/09/2026, 19:18"
  },
  {
    "id": "w42_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 42,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790351031634,
    "formattedDate": "25/09/2026, 17:43"
  },
  {
    "id": "w42_emp_1789839021025_56",
    "employeeId": "emp_1789839021025_56",
    "weekNumber": 42,
    "employeeName": "Silvia Vanderschrieck",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 2,
        "status": "available"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "endTime": "23u00",
        "day": 4
      },
      {
        "status": "available",
        "endTime": "23u00",
        "day": 5,
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790057667772,
    "formattedDate": "22/09/2026, 08:14"
  },
  {
    "id": "w42_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 42,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 0,
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "available",
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790237897174,
    "formattedDate": "24/09/2026, 10:18"
  },
  {
    "id": "w42_emp_1789839021025_62",
    "employeeId": "emp_1789839021025_62",
    "weekNumber": 42,
    "employeeName": "Ynske Cukon",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "available",
        "day": 5,
        "startTime": "18u00",
        "endTime": "23u00"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790536220187,
    "formattedDate": "27/09/2026, 21:10"
  },
  {
    "id": "w42_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 42,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "notes": "Tot 22u ",
        "day": 0,
        "startTime": "17u00",
        "endTime": "23u00"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790183453977,
    "formattedDate": "23/09/2026, 19:10"
  },
  {
    "id": "w42_emp_1790181420092_z4kh",
    "employeeId": "emp_1790181420092_z4kh",
    "weekNumber": 42,
    "employeeName": "Katrien Vandenplas",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "endTime": "18u00",
        "startTime": "Open",
        "status": "available",
        "day": 6
      }
    ],
    "lastUpdated": 1790596085956,
    "formattedDate": "28/09/2026, 13:48"
  },
  {
    "id": "w43_emp_1789821074048_m5tq",
    "employeeId": "emp_1789821074048_m5tq",
    "weekNumber": 43,
    "employeeName": "Arthur Vander Beken",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "status": "available",
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "status": "available",
        "day": 5,
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790539860541,
    "formattedDate": "27/09/2026, 22:11"
  },
  {
    "id": "w43_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 43,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "day": 2,
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "23u00",
        "day": 4,
        "startTime": "18u00",
        "status": "available"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "day": 5,
        "endTime": "23u00"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790690261864,
    "formattedDate": "29/09/2026, 15:57"
  },
  {
    "id": "w43_emp_1789839021025_25",
    "employeeId": "emp_1789839021025_25",
    "weekNumber": 43,
    "employeeName": "Loïs Kamp",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790179768214,
    "formattedDate": "23/09/2026, 18:09"
  },
  {
    "id": "w43_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 43,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "Sluit",
        "startTime": "18u00",
        "status": "available",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "endTime": "21u00",
        "status": "available",
        "day": 6,
        "startTime": "Open"
      }
    ],
    "lastUpdated": 1790361761288,
    "formattedDate": "25/09/2026, 20:42"
  },
  {
    "id": "w43_emp_1789839021025_31",
    "employeeId": "emp_1789839021025_31",
    "weekNumber": 43,
    "employeeName": "Manon Vandevelde",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "available",
        "startTime": "10u00",
        "endTime": "21u00"
      }
    ],
    "lastUpdated": 1790520430790,
    "formattedDate": "27/09/2026, 16:47"
  },
  {
    "id": "w43_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 43,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "day": 4,
        "endTime": "23u00",
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "available",
        "day": 5,
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 6
      }
    ],
    "lastUpdated": 1790331576557,
    "formattedDate": "25/09/2026, 12:19"
  },
  {
    "id": "w43_emp_1789839021025_45",
    "employeeId": "emp_1789839021025_45",
    "weekNumber": 43,
    "employeeName": "Niels Vranckx",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "Hulpsluit",
        "status": "available",
        "day": 4,
        "startTime": "16u00"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790260789972,
    "formattedDate": "24/09/2026, 16:39"
  },
  {
    "id": "w43_emp_1789839021025_48",
    "employeeId": "emp_1789839021025_48",
    "weekNumber": 43,
    "employeeName": "Nore Milissen",
    "department": "zaal",
    "days": [
      {
        "status": "available",
        "day": 0,
        "startTime": "Open",
        "endTime": "23u00"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "status": "available",
        "endTime": "21u00",
        "startTime": "Open",
        "day": 6
      }
    ],
    "lastUpdated": 1790529590921,
    "formattedDate": "27/09/2026, 19:19"
  },
  {
    "id": "w43_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 43,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "endTime": "18u00",
        "startTime": "Open",
        "day": 6,
        "status": "available"
      }
    ],
    "lastUpdated": 1789841689510,
    "formattedDate": "19/09/2026, 20:14"
  },
  {
    "id": "w43_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 43,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "day": 2,
        "startTime": "18u00",
        "status": "available",
        "endTime": "23u00"
      },
      {
        "endTime": "23u00",
        "day": 3,
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790237932151,
    "formattedDate": "24/09/2026, 10:18"
  },
  {
    "id": "w43_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 43,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "available",
        "endTime": "18u00",
        "startTime": "Open"
      },
      {
        "notes": "Liefst zondag ",
        "endTime": "18u00",
        "status": "preferred",
        "startTime": "Open",
        "day": 6
      }
    ],
    "lastUpdated": 1790530856789,
    "formattedDate": "27/09/2026, 19:40"
  },
  {
    "id": "w44_emp_1789839021025_13",
    "employeeId": "emp_1789839021025_13",
    "weekNumber": 44,
    "employeeName": "Isabel Vanneck",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "status": "available",
        "day": 2,
        "startTime": "18u00",
        "endTime": "23u00"
      },
      {
        "day": 3,
        "status": "unavailable"
      },
      {
        "startTime": "18u00",
        "endTime": "Hulpsluit",
        "day": 4,
        "status": "available"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790690569719,
    "formattedDate": "29/09/2026, 16:02"
  },
  {
    "id": "w44_emp_1789839021025_30",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 44,
    "employeeName": "Maïte Adenot",
    "department": "zaal",
    "days": [
      {
        "startTime": "18u00",
        "status": "available",
        "endTime": "Hulpsluit",
        "day": 0
      },
      {
        "status": "available",
        "day": 1,
        "startTime": "18u00",
        "endTime": "Hulpsluit"
      },
      {
        "status": "available",
        "startTime": "18u00",
        "day": 2,
        "endTime": "Hulpsluit"
      },
      {
        "day": 3,
        "status": "available",
        "startTime": "18u00",
        "endTime": "Hulpsluit"
      },
      {
        "status": "available",
        "day": 4,
        "endTime": "Sluit",
        "startTime": "18u00"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790259952020,
    "formattedDate": "24/09/2026, 16:25"
  },
  {
    "id": "w44_emp_1789839021025_38",
    "employeeId": "emp_1789839021025_38",
    "weekNumber": 44,
    "employeeName": "Mégane Chassagne",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "day": 1,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 2
      },
      {
        "day": 3,
        "startTime": "18u00",
        "status": "available",
        "endTime": "23u00"
      },
      {
        "endTime": "23u00",
        "day": 4,
        "status": "available",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available"
      }
    ],
    "lastUpdated": 1790331751535,
    "formattedDate": "25/09/2026, 12:22"
  },
  {
    "id": "w44_emp_1789839021025_55",
    "employeeId": "emp_1789839021025_55",
    "weekNumber": 44,
    "employeeName": "Sander Dam",
    "department": "zaal",
    "days": [
      {
        "day": 0,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "endTime": "23u00",
        "day": 4,
        "startTime": "18u00",
        "status": "available"
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790173216458,
    "formattedDate": "23/09/2026, 16:20"
  },
  {
    "id": "w44_emp_1789839021025_60",
    "employeeId": "emp_1789839021025_60",
    "weekNumber": 44,
    "employeeName": "Toon Bastiaens",
    "department": "zaal",
    "days": [
      {
        "status": "unavailable",
        "day": 0
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "endTime": "23u00",
        "startTime": "18u00",
        "status": "available",
        "day": 2
      },
      {
        "status": "available",
        "day": 3,
        "endTime": "23u00",
        "startTime": "18u00"
      },
      {
        "status": "unavailable",
        "day": 4
      },
      {
        "day": 5,
        "status": "unavailable"
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790237984955,
    "formattedDate": "24/09/2026, 10:19"
  },
  {
    "id": "w44_emp_1789839021025_9",
    "employeeId": "emp_1789839021025_9",
    "weekNumber": 44,
    "employeeName": "Geertrui Beerten",
    "department": "zaal",
    "days": [
      {
        "endTime": "23u00",
        "day": 0,
        "startTime": "17u00",
        "notes": "Tot 22u",
        "status": "available"
      },
      {
        "status": "unavailable",
        "day": 1
      },
      {
        "day": 2,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 3
      },
      {
        "day": 4,
        "status": "unavailable"
      },
      {
        "status": "unavailable",
        "day": 5
      },
      {
        "day": 6,
        "status": "unavailable"
      }
    ],
    "lastUpdated": 1790183609257,
    "formattedDate": "23/09/2026, 19:13"
  }
];

export const INITIAL_SWAP_REQUESTS: SwapRequest[] = [];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_restored',
    title: '✅ Personeelsbestand & Beschikbaarheden Hersteld',
    content: 'Alle personeelsgegevens en ingezonden beschikbaarheden zijn succesvol hersteld uit het cloud-archief.',
    date: new Date().toISOString().split('T')[0],
    category: 'algemeen',
    author: 'Hans Stevens (Beheerder)'
  }
];

export const INITIAL_LOGS: ChangeLog[] = [
  {
    id: 'log_restore',
    timestamp: Date.now(),
    user: 'Hans Stevens (Beheerder)',
    action: 'Data Succesvol Hersteld',
    details: 'Personeelsbestand (46 medewerkers) en 123 beschikbaarheden succesvol hersteld'
  }
];
