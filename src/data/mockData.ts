import { Employee, Shift, Notice, SwapRequest, ChangeLog, EmployeeAvailability } from "../types";

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    "department": "zaal",
    "statuut": "Student",
    "role": "personeel",
    "textColor": "text-indigo-700",
    "firstLoginComplete": true,
    "name": "Alexander Godderie",
    "contractDaysPerWeek": 2,
    "pin": "1234",
    "email": "",
    "birthDate": "2007-07-27",
    "color": "#6366f1",
    "id": "emp_1789839021025_0",
    "phone": "0456 11 29 40",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "active": true,
    "experience": "Beginner",
    "facebookUrl": "https://www.facebook.com/alexander.godderie"
  },
  {
    "textBgColor": "bg-pink-50 border-pink-200",
    "experience": "Gemiddeld",
    "id": "emp_1790805044270_thz1",
    "textColor": "text-pink-700",
    "name": "Aline Kelchtermans",
    "statuut": "Student",
    "active": true,
    "firstLoginComplete": true,
    "birthDate": "2007-05-31",
    "phone": "0468 56 57 04",
    "department": "zaal",
    "pin": "1234",
    "role": "medewerker",
    "email": "",
    "color": "#ec4899",
    "facebookUrl": "https://www.facebook.com/aline.kelchtermans"
  },
  {
    "statuut": "Flexi",
    "active": true,
    "phone": "0487783457",
    "color": "#f59e0b",
    "pin": "1234",
    "email": "",
    "textColor": "text-amber-700",
    "experience": "Gemiddeld",
    "textBgColor": "bg-amber-50 border-amber-200",
    "department": "zaal",
    "id": "emp_1790805105743_we9w",
    "birthDate": "1993-07-20",
    "name": "Amber Jamaer",
    "role": "medewerker",
    "firstLoginComplete": true,
    "facebookUrl": "https://www.facebook.com/amber.jamaer"
  },
  {
    "active": true,
    "experience": "Beginner",
    "name": "Arthur Vander Beken",
    "role": "personeel",
    "id": "emp_1789821074048_m5tq",
    "textColor": "text-teal-700",
    "statuut": "Student",
    "phone": "+32 468 48 40 01",
    "pin": "1234",
    "textBgColor": "bg-teal-50 border-teal-200",
    "firstLoginComplete": true,
    "color": "#14b8a6",
    "contractDaysPerWeek": 2,
    "birthDate": "2010-08-06",
    "email": "",
    "department": "zaal",
    "facebookUrl": "https://www.facebook.com/arthur.vanderbeken"
  },
  {
    "id": "emp_1790805157231_gtjh",
    "experience": "Beginner",
    "firstLoginComplete": true,
    "birthDate": "2010-04-06",
    "name": "Bas Everaerts",
    "phone": "0495190306",
    "role": "medewerker",
    "color": "#10b981",
    "email": "",
    "pin": "1234",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "active": true,
    "statuut": "Student",
    "textColor": "text-emerald-700",
    "department": "zaal",
    "facebookUrl": "https://www.facebook.com/bas.everaerts"
  },
  {
    "statuut": "Flexi",
    "firstLoginComplete": true,
    "role": "medewerker",
    "department": "zaal",
    "name": "Chantal Van de Walle",
    "pin": "1234",
    "birthDate": "1965-07-06",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "textColor": "text-cyan-700",
    "active": true,
    "id": "emp_1790805189303_9ffm",
    "experience": "Ervaren",
    "email": "",
    "color": "#06b6d4",
    "phone": "0497662163",
    "facebookUrl": "https://www.facebook.com/chantal.vandewalle"
  },
  {
    "email": "",
    "firstLoginComplete": true,
    "color": "#f59e0b",
    "phone": "+32 479 58 21 53",
    "role": "personeel",
    "experience": "Verantwoordelijke",
    "contractDaysPerWeek": 2,
    "textColor": "text-amber-700",
    "name": "Christophe Ancré",
    "pin": "1234",
    "active": true,
    "statuut": "Vast",
    "birthDate": "1987-01-25",
    "id": "emp_1789839021025_5",
    "department": "zaal",
    "textBgColor": "bg-amber-50 border-amber-200",
    "facebookUrl": "https://www.facebook.com/christophe.ancre"
  },
  {
    "pin": "1234",
    "firstLoginComplete": true,
    "role": "personeel",
    "id": "emp_1789824722545_ykbd",
    "contractDaysPerWeek": 2,
    "statuut": "Student",
    "name": "Elke Petré",
    "birthDate": "2007-03-06",
    "department": "zaal",
    "experience": "Ervaren",
    "textColor": "text-rose-700",
    "active": true,
    "textBgColor": "bg-rose-50 border-rose-200",
    "color": "#ef4444",
    "email": "",
    "phone": "0472 45 11 89",
    "facebookUrl": "https://www.facebook.com/elke.petre"
  },
  {
    "statuut": "Student",
    "contractDaysPerWeek": 2,
    "department": "zaal",
    "active": true,
    "phone": "+32 472 66 68 38",
    "color": "#14b8a6",
    "email": "",
    "birthDate": "2005-11-22",
    "firstLoginComplete": true,
    "id": "emp_1789839021025_6",
    "textColor": "text-teal-700",
    "pin": "1234",
    "name": "Emma Van den Broeck",
    "textBgColor": "bg-teal-50 border-teal-200",
    "role": "personeel",
    "experience": "Ervaren",
    "facebookUrl": "https://www.facebook.com/emma.vandenbroeck"
  },
  {
    "role": "personeel",
    "department": "zaal",
    "textBgColor": "bg-amber-50 border-amber-200",
    "contractDaysPerWeek": 2,
    "statuut": "Student",
    "name": "Esmée Joly",
    "birthDate": "2003-01-15",
    "firstLoginComplete": true,
    "color": "#f59e0b",
    "active": true,
    "email": "",
    "pin": "1234",
    "textColor": "text-amber-700",
    "phone": "+32 491 29 96 07",
    "experience": "Ervaren",
    "id": "emp_1789839021025_7",
    "facebookUrl": "https://www.facebook.com/esmee.joly"
  },
  {
    "firstLoginComplete": true,
    "role": "personeel",
    "textColor": "text-violet-700",
    "textBgColor": "bg-violet-50 border-violet-200",
    "statuut": "Student",
    "contractDaysPerWeek": 2,
    "id": "emp_1789841627316_o1hv",
    "active": true,
    "experience": "Gemiddeld",
    "name": "Fien Vanderwegen",
    "color": "#8b5cf6",
    "email": "",
    "department": "zaal",
    "phone": "+32 468 34 49 75",
    "pin": "1234",
    "birthDate": "2007-06-25",
    "facebookUrl": "https://www.facebook.com/fien.vanderwegen"
  },
  {
    "contractDaysPerWeek": 2,
    "birthDate": "1979-12-08",
    "pin": "1234",
    "name": "Geertrui Beerten",
    "experience": "Beginner",
    "role": "personeel",
    "firstLoginComplete": true,
    "statuut": "Flexi",
    "id": "emp_1789839021025_9",
    "department": "zaal",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "phone": "+32 486 87 48 03",
    "color": "#06b6d4",
    "textColor": "text-cyan-700",
    "email": "",
    "active": true,
    "facebookUrl": "https://www.facebook.com/geertrui.beerten"
  },
  {
    "active": true,
    "phone": "0478423114",
    "color": "#8b5cf6",
    "experience": "Ervaren",
    "pin": "1234",
    "email": "",
    "textColor": "text-violet-700",
    "firstLoginComplete": true,
    "statuut": "Flexi",
    "textBgColor": "bg-violet-50 border-violet-200",
    "id": "emp_1790805423953_aju8",
    "birthDate": "1999-02-13",
    "name": "Gerald Billen",
    "department": "zaal",
    "role": "medewerker",
    "facebookUrl": "https://www.facebook.com/gerald.billen"
  },
  {
    "id": "emp_1789839021025_11",
    "textColor": "text-pink-700",
    "department": "zaal",
    "role": "personeel",
    "firstLoginComplete": true,
    "email": "",
    "name": "Haddy Sarr",
    "color": "#ec4899",
    "pin": "1234",
    "phone": "+32 471 72 46 71",
    "statuut": "Vast",
    "active": true,
    "experience": "Verantwoordelijke",
    "birthDate": "1987-12-20",
    "textBgColor": "bg-pink-50 border-pink-200",
    "contractDaysPerWeek": 2,
    "facebookUrl": "https://www.facebook.com/haddy.sarr"
  },
  {
    "statuut": "Flexi",
    "phone": "0474623264",
    "textBgColor": "bg-teal-50 border-teal-200",
    "textColor": "text-teal-700",
    "firstLoginComplete": true,
    "name": "Hans Stevens",
    "email": "hans.stevens2@gmail.com",
    "department": "zaal",
    "color": "#0d9488",
    "role": "beheerder",
    "active": true,
    "id": "emp1",
    "experience": "Verantwoordelijke",
    "avatarUrl": "data:image/jpeg;base64,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",
    "birthDate": "1984-04-23",
    "contractDaysPerWeek": 5,
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/hans.stevens"
  },
  {
    "name": "Ine Laurent",
    "firstLoginComplete": true,
    "department": "zaal",
    "id": "emp_1789839021025_12",
    "role": "personeel",
    "textColor": "text-amber-700",
    "statuut": "Flexi",
    "active": true,
    "birthDate": "2004-02-17",
    "contractDaysPerWeek": 2,
    "phone": "0472 02 06 57",
    "pin": "1234",
    "textBgColor": "bg-amber-50 border-amber-200",
    "experience": "Ervaren",
    "email": "",
    "color": "#f59e0b",
    "facebookUrl": "https://www.facebook.com/ine.laurent"
  },
  {
    "email": "",
    "color": "#10b981",
    "phone": "+32 471 06 98 76",
    "role": "personeel",
    "statuut": "Flexi",
    "experience": "Ervaren",
    "name": "Isabel Vanneck",
    "pin": "1234",
    "birthDate": "0075-04-30",
    "contractDaysPerWeek": 2,
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "textColor": "text-emerald-700",
    "department": "zaal",
    "active": true,
    "id": "emp_1789839021025_13",
    "firstLoginComplete": true,
    "facebookUrl": "https://www.facebook.com/isabel.vanneck"
  },
  {
    "department": "zaal",
    "name": "JONATHAN GIELENS",
    "pin": "1234",
    "id": "emp_1789841882714_gx6j",
    "role": "personeel",
    "textColor": "text-rose-700",
    "textBgColor": "bg-rose-50 border-rose-200",
    "statuut": "Student",
    "contractDaysPerWeek": 2,
    "active": true,
    "birthDate": "1994-08-23",
    "firstLoginComplete": true,
    "phone": "+32 478 73 07 87",
    "email": "",
    "experience": "Ervaren",
    "color": "#ef4444",
    "facebookUrl": "https://www.facebook.com/jonathan.gielens"
  },
  {
    "role": "medewerker",
    "id": "emp_1790805696886_i3n1",
    "active": true,
    "birthDate": "2007-01-05",
    "name": "Joppe van Looy",
    "statuut": "Student",
    "department": "zaal",
    "experience": "Beginner",
    "email": "",
    "textColor": "text-rose-700",
    "color": "#ef4444",
    "textBgColor": "bg-rose-50 border-rose-200",
    "phone": "0474782530",
    "firstLoginComplete": true,
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/joppe.vanlooy"
  },
  {
    "department": "zaal",
    "birthDate": "2003-04-26",
    "statuut": "Flexi",
    "textBgColor": "bg-teal-50 border-teal-200",
    "firstLoginComplete": true,
    "pin": "1234",
    "phone": "0470 39 12 77",
    "active": true,
    "name": "Joris Vanparijs",
    "color": "#14b8a6",
    "email": "",
    "id": "emp_1790805735986_bzqn",
    "role": "medewerker",
    "textColor": "text-teal-700",
    "experience": "Beginner",
    "facebookUrl": "https://www.facebook.com/joris.vanparijs"
  },
  {
    "statuut": "Student",
    "firstLoginComplete": true,
    "role": "personeel",
    "email": "",
    "name": "Juliette Degrez",
    "color": "#ef4444",
    "phone": "0467 02 70 37",
    "textColor": "text-rose-700",
    "experience": "Gemiddeld",
    "contractDaysPerWeek": 2,
    "department": "zaal",
    "id": "emp_1789222624478_19",
    "textBgColor": "bg-rose-50 border-rose-200",
    "active": true,
    "birthDate": "2007-05-26",
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/juliette.degrez"
  },
  {
    "pin": "1234",
    "birthDate": "2006-07-14",
    "phone": "0468340939",
    "department": "zaal",
    "color": "#06b6d4",
    "statuut": "Student",
    "contractDaysPerWeek": 2,
    "textColor": "text-cyan-700",
    "experience": "Ervaren",
    "name": "Juliette Vander Beken",
    "role": "personeel",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "firstLoginComplete": true,
    "active": true,
    "id": "emp_1789839021025_18",
    "facebookUrl": "https://www.facebook.com/juliette.vanderbeken"
  },
  {
    "phone": "0471115966",
    "name": "Kas Torfs",
    "firstLoginComplete": true,
    "email": "",
    "department": "zaal",
    "color": "#6366f1",
    "active": true,
    "pin": "1234",
    "role": "medewerker",
    "birthDate": "2007-06-25",
    "id": "emp_1790805856088_rqk5",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "textColor": "text-indigo-700",
    "experience": "Gemiddeld",
    "statuut": "Student",
    "facebookUrl": "https://www.facebook.com/kas.torfs"
  },
  {
    "birthDate": "2003-05-15",
    "role": "personeel",
    "color": "#10b981",
    "email": "",
    "phone": "0477 35 76 55",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "active": true,
    "contractDaysPerWeek": 2,
    "department": "zaal",
    "name": "Katrien Vandenplas",
    "id": "emp_1790181420092_z4kh",
    "experience": "Beginner",
    "pin": "1234",
    "statuut": "Student",
    "firstLoginComplete": true,
    "textColor": "text-emerald-700",
    "facebookUrl": "https://www.facebook.com/katrien.vandenplas"
  },
  {
    "pin": "1234",
    "color": "#8b5cf6",
    "email": "",
    "id": "emp_1789839021025_20",
    "active": true,
    "phone": "0499 87 02 08",
    "experience": "Ervaren",
    "textColor": "text-violet-700",
    "department": "zaal",
    "role": "personeel",
    "textBgColor": "bg-violet-50 border-violet-200",
    "contractDaysPerWeek": 2,
    "birthDate": "1988-10-18",
    "statuut": "Flexi",
    "firstLoginComplete": true,
    "name": "Lamine Ndiaye",
    "facebookUrl": "https://www.facebook.com/lamine.ndiaye"
  },
  {
    "textColor": "text-amber-700",
    "experience": "Gemiddeld",
    "phone": "0456 24 27 73",
    "color": "#f59e0b",
    "email": "",
    "pin": "1234",
    "name": "Leonie Stroeckx",
    "textBgColor": "bg-amber-50 border-amber-200",
    "firstLoginComplete": true,
    "role": "personeel",
    "department": "zaal",
    "birthDate": "2008-10-15",
    "id": "emp_1789839021025_21",
    "statuut": "Student",
    "active": true,
    "contractDaysPerWeek": 2,
    "facebookUrl": "https://www.facebook.com/leonie.stroeckx"
  },
  {
    "textBgColor": "bg-rose-50 border-rose-200",
    "email": "",
    "color": "#ef4444",
    "phone": "+32 491 75 04 76",
    "firstLoginComplete": true,
    "active": true,
    "department": "zaal",
    "statuut": "Student",
    "textColor": "text-rose-700",
    "birthDate": "2008-10-30",
    "contractDaysPerWeek": 2,
    "role": "personeel",
    "experience": "Gemiddeld",
    "name": "Lien Noé",
    "pin": "1234",
    "id": "emp_1789839021025_22",
    "facebookUrl": "https://www.facebook.com/lien.noe"
  },
  {
    "name": "Lieselotte Verreecken",
    "statuut": "Flexi",
    "textColor": "text-teal-700",
    "experience": "Beginner",
    "role": "personeel",
    "department": "zaal",
    "id": "emp_1789839021025_23",
    "textBgColor": "bg-teal-50 border-teal-200",
    "birthDate": "1981-02-16",
    "phone": "+32 494 18 22 75",
    "pin": "1234",
    "email": "",
    "active": true,
    "contractDaysPerWeek": 2,
    "color": "#14b8a6",
    "firstLoginComplete": true,
    "facebookUrl": "https://www.facebook.com/lieselotte.verreecken"
  },
  {
    "firstLoginComplete": true,
    "birthDate": "2004-05-20",
    "department": "zaal",
    "contractDaysPerWeek": 2,
    "id": "emp_1789839021025_24",
    "role": "personeel",
    "statuut": "Student",
    "email": "",
    "color": "#6366f1",
    "experience": "Ervaren",
    "name": "Linne Ollivier",
    "textColor": "text-indigo-700",
    "active": true,
    "phone": "0479 81 46 03",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/linne.ollivier"
  },
  {
    "phone": "+32 480 68 43 12",
    "name": "Loïs Kamp",
    "department": "zaal",
    "email": "",
    "textColor": "text-pink-700",
    "color": "#ec4899",
    "id": "emp_1789839021025_25",
    "role": "personeel",
    "pin": "1234",
    "firstLoginComplete": true,
    "statuut": "Student",
    "active": true,
    "contractDaysPerWeek": 2,
    "experience": "Gemiddeld",
    "textBgColor": "bg-pink-50 border-pink-200",
    "birthDate": "2007-12-02",
    "facebookUrl": "https://www.facebook.com/lois.kamp"
  },
  {
    "textColor": "text-amber-700",
    "id": "emp_1789839021025_26",
    "active": true,
    "phone": "+32 473 30 76 68",
    "statuut": "Flexi",
    "firstLoginComplete": true,
    "email": "",
    "department": "zaal",
    "color": "#f59e0b",
    "experience": "Gemiddeld",
    "name": "Lotte Fransens",
    "contractDaysPerWeek": 2,
    "textBgColor": "bg-amber-50 border-amber-200",
    "birthDate": "1999-03-16",
    "role": "personeel",
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/lotte.fransens"
  },
  {
    "pin": "1234",
    "name": "Lotte Tiesters",
    "statuut": "Student",
    "firstLoginComplete": true,
    "role": "medewerker",
    "department": "zaal",
    "textColor": "text-indigo-700",
    "id": "emp_1790806077443_j2v1",
    "phone": "0486 11 30 08",
    "active": true,
    "birthDate": "2003-07-10",
    "color": "#6366f1",
    "experience": "Ervaren",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "email": "",
    "facebookUrl": "https://www.facebook.com/lotte.tiesters"
  },
  {
    "statuut": "Student",
    "id": "emp_1790806102136_vc57",
    "birthDate": "2001-11-02",
    "active": true,
    "firstLoginComplete": true,
    "phone": "0473 66 12 90",
    "department": "zaal",
    "color": "#ec4899",
    "email": "",
    "experience": "Ervaren",
    "pin": "1234",
    "name": "Louise Verhaeghe",
    "role": "medewerker",
    "textBgColor": "bg-pink-50 border-pink-200",
    "textColor": "text-pink-700",
    "facebookUrl": "https://www.facebook.com/louise.verhaeghe"
  },
  {
    "name": "Lukas De Smedt",
    "department": "zaal",
    "firstLoginComplete": true,
    "textColor": "text-amber-700",
    "role": "medewerker",
    "id": "emp_1790806129239_1bbw",
    "experience": "Gemiddeld",
    "statuut": "Student",
    "birthDate": "2003-04-24",
    "phone": "0484 83 10 11",
    "pin": "1234",
    "email": "",
    "textBgColor": "bg-amber-50 border-amber-200",
    "active": true,
    "color": "#f59e0b",
    "facebookUrl": "https://www.facebook.com/lukas.desmedt"
  },
  {
    "phone": "0484 78 86 54",
    "name": "Maïte Adenot",
    "department": "zaal",
    "contractDaysPerWeek": 2,
    "textColor": "text-emerald-700",
    "email": "",
    "color": "#10b981",
    "active": true,
    "pin": "1234",
    "statuut": "Flexi",
    "role": "personeel",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "firstLoginComplete": true,
    "birthDate": "1997-03-06",
    "id": "emp_1789839021025_30",
    "experience": "Gemiddeld",
    "facebookUrl": "https://www.facebook.com/maite.adenot"
  },
  {
    "name": "Manon Vandevelde",
    "firstLoginComplete": true,
    "textColor": "text-cyan-700",
    "phone": "0491 30 66 95",
    "id": "emp_1789839021025_31",
    "role": "personeel",
    "email": "",
    "active": true,
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "experience": "Ervaren",
    "color": "#06b6d4",
    "department": "zaal",
    "contractDaysPerWeek": 2,
    "pin": "1234",
    "birthDate": "1999-04-24",
    "statuut": "Flexi",
    "facebookUrl": "https://www.facebook.com/manon.vandevelde"
  },
  {
    "id": "emp_1789839021025_32",
    "active": true,
    "birthDate": "2004-10-28",
    "role": "personeel",
    "email": "",
    "name": "Mara Shöffski",
    "color": "#14b8a6",
    "pin": "1234",
    "phone": "+32 468 26 86 60",
    "experience": "Gemiddeld",
    "department": "zaal",
    "firstLoginComplete": true,
    "contractDaysPerWeek": 2,
    "textBgColor": "bg-teal-50 border-teal-200",
    "statuut": "Student",
    "textColor": "text-teal-700",
    "facebookUrl": "https://www.facebook.com/mara.shoffski"
  },
  {
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "birthDate": "2004-12-27",
    "department": "zaal",
    "email": "",
    "pin": "1234",
    "color": "#10b981",
    "phone": "+32 497 94 75 56",
    "role": "medewerker",
    "statuut": "Student",
    "name": "Margaux Holemans",
    "experience": "Gemiddeld",
    "id": "emp_1790806261708_efew",
    "active": true,
    "textColor": "text-emerald-700",
    "firstLoginComplete": true,
    "facebookUrl": "https://www.facebook.com/margaux.holemans"
  },
  {
    "pin": "1234",
    "birthDate": "2006-05-18",
    "contractDaysPerWeek": 2,
    "statuut": "Student",
    "experience": "Ervaren",
    "department": "zaal",
    "textBgColor": "bg-rose-50 border-rose-200",
    "phone": "+32 471 11 24 73",
    "active": true,
    "name": "Mathias Cakoni",
    "color": "#ef4444",
    "email": "",
    "role": "personeel",
    "firstLoginComplete": true,
    "id": "emp_1789222624478_36",
    "textColor": "text-rose-700",
    "facebookUrl": "https://www.facebook.com/mathias.cakoni"
  },
  {
    "statuut": "Student",
    "birthDate": "2006-03-08",
    "phone": "0468572636",
    "name": "Mathias Granger",
    "department": "zaal",
    "email": "",
    "color": "#06b6d4",
    "id": "emp_1790806292277_lsum",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "role": "medewerker",
    "pin": "1234",
    "active": true,
    "textColor": "text-cyan-700",
    "firstLoginComplete": true,
    "experience": "Beginner",
    "facebookUrl": "https://www.facebook.com/mathias.granger"
  },
  {
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "pin": "1234",
    "role": "personeel",
    "experience": "Verantwoordelijke",
    "textColor": "text-indigo-700",
    "name": "Matthias Vanparijs",
    "birthDate": "1999-03-28",
    "contractDaysPerWeek": 2,
    "active": true,
    "id": "emp_1789839021025_36",
    "firstLoginComplete": true,
    "department": "zaal",
    "color": "#6366f1",
    "email": "",
    "statuut": "Vast",
    "phone": "00 32 470 03 74 00",
    "facebookUrl": "https://www.facebook.com/matthias.vanparijs"
  },
  {
    "statuut": "Student",
    "textBgColor": "bg-violet-50 border-violet-200",
    "department": "zaal",
    "email": "",
    "pin": "1234",
    "color": "#8b5cf6",
    "birthDate": "2006-04-24",
    "phone": "0471 22 84 93",
    "contractDaysPerWeek": 2,
    "firstLoginComplete": true,
    "role": "personeel",
    "textColor": "text-violet-700",
    "experience": "Beginner",
    "name": "Mégane Chassagne",
    "active": true,
    "id": "emp_1789839021025_38",
    "facebookUrl": "https://www.facebook.com/megane.chassagne"
  },
  {
    "experience": "Gemiddeld",
    "pin": "1458",
    "color": "#f59e0b",
    "email": "milan.dresselaers@gmail.com",
    "statuut": "Student",
    "phone": "472190949",
    "id": "emp_1790843756576_qx4k",
    "textColor": "text-amber-700",
    "active": true,
    "textBgColor": "bg-amber-50 border-amber-200",
    "birthDate": "2008-06-02",
    "firstLoginComplete": true,
    "facebookUrl": "https://www.facebook.com/milan.dresselaers",
    "name": "Milan Dresselaers",
    "department": "zaal"
  },
  {
    "birthDate": "2007-12-24",
    "active": true,
    "id": "emp_1789839021025_40",
    "contractDaysPerWeek": 2,
    "phone": "+32 470 39 78 70",
    "experience": "Gemiddeld",
    "email": "",
    "color": "#ec4899",
    "pin": "1234",
    "firstLoginComplete": true,
    "textBgColor": "bg-pink-50 border-pink-200",
    "name": "Mirte Christiaen",
    "department": "zaal",
    "textColor": "text-pink-700",
    "statuut": "Student",
    "role": "personeel",
    "facebookUrl": "https://www.facebook.com/mirte.christiaen"
  },
  {
    "firstLoginComplete": true,
    "role": "medewerker",
    "experience": "Ervaren",
    "active": true,
    "birthDate": "2004-06-09",
    "name": "Mirte Herregods",
    "color": "#8b5cf6",
    "email": "",
    "textColor": "text-violet-700",
    "statuut": "Student",
    "id": "emp_1790806467295_boy8",
    "phone": "0474 90 12 34",
    "pin": "1234",
    "department": "zaal",
    "textBgColor": "bg-violet-50 border-violet-200",
    "facebookUrl": "https://www.facebook.com/mirte.herregods"
  },
  {
    "pin": "1234",
    "experience": "Beginner",
    "role": "personeel",
    "firstLoginComplete": true,
    "statuut": "Student",
    "color": "#f59e0b",
    "email": "",
    "name": "Mirte Peeters",
    "active": true,
    "birthDate": "2006-08-25",
    "phone": "0489 14 33 62",
    "contractDaysPerWeek": 2,
    "textBgColor": "bg-amber-50 border-amber-200",
    "textColor": "text-amber-700",
    "id": "emp_1789839021025_42",
    "department": "zaal",
    "facebookUrl": "https://www.facebook.com/mirte.peeters"
  },
  {
    "role": "personeel",
    "department": "zaal",
    "firstLoginComplete": true,
    "statuut": "Student",
    "name": "Naomie Vandermosten Hick",
    "textColor": "text-rose-700",
    "contractDaysPerWeek": 2,
    "pin": "1234",
    "active": true,
    "birthDate": "2008-08-27",
    "textBgColor": "bg-rose-50 border-rose-200",
    "color": "#ef4444",
    "experience": "Ervaren",
    "id": "emp_1789839021025_43",
    "email": "",
    "phone": "0476 30 06 99",
    "facebookUrl": "https://www.facebook.com/naomie.vandermostenhick"
  },
  {
    "contractDaysPerWeek": 2,
    "textColor": "text-teal-700",
    "firstLoginComplete": true,
    "department": "zaal",
    "phone": "0489 55 02 17",
    "pin": "1234",
    "email": "",
    "color": "#14b8a6",
    "id": "emp_1789839021025_44",
    "name": "Nick Wouters",
    "statuut": "Extra",
    "textBgColor": "bg-teal-50 border-teal-200",
    "experience": "Beginner",
    "birthDate": "1997-03-11",
    "role": "personeel",
    "active": true,
    "facebookUrl": "https://www.facebook.com/nick.wouters"
  },
  {
    "department": "zaal",
    "pin": "1234",
    "textColor": "text-emerald-700",
    "contractDaysPerWeek": 2,
    "phone": "+32 471 41 74 13",
    "active": true,
    "firstLoginComplete": true,
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "name": "Niels Vranckx",
    "birthDate": "2008-02-17",
    "color": "#10b981",
    "email": "",
    "statuut": "Student",
    "role": "personeel",
    "id": "emp_1789839021025_45",
    "experience": "Ervaren",
    "facebookUrl": "https://www.facebook.com/niels.vranckx"
  },
  {
    "experience": "Beginner",
    "firstLoginComplete": true,
    "role": "medewerker",
    "active": true,
    "birthDate": "1998-01-24",
    "name": "Nina Jochmans",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "statuut": "Flexi",
    "email": "",
    "textColor": "text-cyan-700",
    "color": "#06b6d4",
    "phone": "0498818589",
    "id": "emp_1790807036914_fi26",
    "department": "zaal",
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/nina.jochmans"
  },
  {
    "name": "Noah Kuijpers",
    "firstLoginComplete": true,
    "textColor": "text-indigo-700",
    "phone": "0472 12 40 64",
    "id": "emp_1789839021025_47",
    "experience": "Ervaren",
    "email": "",
    "role": "personeel",
    "statuut": "Student",
    "active": true,
    "color": "#6366f1",
    "contractDaysPerWeek": 2,
    "department": "zaal",
    "pin": "1234",
    "birthDate": "2009-07-01",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "facebookUrl": "https://www.facebook.com/noah.kuijpers"
  },
  {
    "email": "",
    "firstLoginComplete": true,
    "color": "#ec4899",
    "phone": "0468 26 64 41",
    "textBgColor": "bg-pink-50 border-pink-200",
    "birthDate": "2005-03-13",
    "experience": "Ervaren",
    "department": "zaal",
    "textColor": "text-pink-700",
    "statuut": "Student",
    "role": "personeel",
    "active": true,
    "name": "Nore Milissen",
    "pin": "1234",
    "id": "emp_1789839021025_48",
    "contractDaysPerWeek": 2,
    "facebookUrl": "https://www.facebook.com/nore.milissen"
  },
  {
    "textColor": "text-amber-700",
    "experience": "Gemiddeld",
    "pin": "1234",
    "statuut": "Student",
    "contractDaysPerWeek": 2,
    "phone": "0468 41 35 78",
    "firstLoginComplete": true,
    "id": "emp_1789222624478_51",
    "color": "#f59e0b",
    "name": "Ona Verreydt",
    "email": "",
    "textBgColor": "bg-amber-50 border-amber-200",
    "birthDate": "2009-07-07",
    "active": true,
    "department": "zaal",
    "role": "personeel",
    "recurringAvailability": {
      "updatedAt": 1790793835084,
      "frequency": "every_week",
      "days": [
        {
          "endTime": "23u00",
          "startTime": "18u00",
          "status": "available",
          "day": 0,
          "notes": ""
        },
        {
          "startTime": "18u00",
          "notes": "",
          "status": "available",
          "endTime": "23u00",
          "day": 1
        },
        {
          "startTime": "18u00",
          "endTime": "23u00",
          "day": 2,
          "notes": "",
          "status": "available"
        },
        {
          "status": "available",
          "endTime": "23u00",
          "day": 3,
          "startTime": "18u00",
          "notes": ""
        },
        {
          "status": "unavailable",
          "endTime": "Sluit",
          "day": 4,
          "startTime": "Open",
          "notes": ""
        },
        {
          "status": "available",
          "day": 5,
          "endTime": "18u00",
          "startTime": "12u00",
          "notes": ""
        },
        {
          "notes": "",
          "day": 6,
          "startTime": "Open",
          "endTime": "Sluit",
          "status": "unavailable"
        }
      ],
      "active": true
    },
    "facebookUrl": "https://www.facebook.com/ona.verreydt"
  },
  {
    "id": "emp_1789839021025_50",
    "color": "#06b6d4",
    "birthDate": "1967-04-04",
    "email": "",
    "pin": "1234",
    "phone": "+32 499 61 24 75",
    "department": "zaal",
    "experience": "Verantwoordelijke",
    "active": true,
    "role": "personeel",
    "firstLoginComplete": true,
    "contractDaysPerWeek": 2,
    "textColor": "text-cyan-700",
    "statuut": "Vast",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "name": "Patrick Gevaert",
    "facebookUrl": "https://www.facebook.com/patrick.gevaert"
  },
  {
    "name": "Paulien De Donder",
    "textBgColor": "bg-violet-50 border-violet-200",
    "active": true,
    "textColor": "text-violet-700",
    "id": "emp_1790807068416_oas7",
    "department": "zaal",
    "role": "medewerker",
    "birthDate": "1998-05-04",
    "firstLoginComplete": true,
    "experience": "Beginner",
    "pin": "1234",
    "phone": "0476011719",
    "statuut": "Student",
    "email": "",
    "color": "#8b5cf6",
    "facebookUrl": "https://www.facebook.com/paulien.dedonder"
  },
  {
    "firstLoginComplete": true,
    "department": "zaal",
    "active": true,
    "textBgColor": "bg-rose-50 border-rose-200",
    "phone": "0477058617",
    "statuut": "Student",
    "email": "",
    "color": "#ef4444",
    "textColor": "text-rose-700",
    "pin": "1234",
    "name": "Pieterjan Gilis",
    "id": "emp_1790807098570_a5ee",
    "birthDate": "2003-09-10",
    "experience": "Gemiddeld",
    "role": "medewerker",
    "facebookUrl": "https://www.facebook.com/pieterjan.gilis"
  },
  {
    "email": "",
    "color": "#10b981",
    "phone": "0489 06 99 73",
    "role": "personeel",
    "statuut": "Student",
    "name": "Renée Stroeckx",
    "birthDate": "2005-12-16",
    "textBgColor": "bg-emerald-50 border-emerald-200",
    "department": "zaal",
    "id": "emp_1789839021025_53",
    "firstLoginComplete": true,
    "experience": "Ervaren",
    "textColor": "text-emerald-700",
    "contractDaysPerWeek": 2,
    "active": true,
    "pin": "1234",
    "facebookUrl": "https://www.facebook.com/renee.stroeckx"
  },
  {
    "textBgColor": "bg-teal-50 border-teal-200",
    "name": "Robbe Rosvelds",
    "id": "emp_1790807141476_v2u1",
    "active": true,
    "phone": "0479732322",
    "email": "",
    "birthDate": "2008-11-30",
    "department": "zaal",
    "pin": "1234",
    "color": "#14b8a6",
    "role": "medewerker",
    "experience": "Beginner",
    "firstLoginComplete": true,
    "textColor": "text-teal-700",
    "statuut": "Student",
    "facebookUrl": "https://www.facebook.com/robbe.rosvelds"
  },
  {
    "role": "personeel",
    "contractDaysPerWeek": 2,
    "birthDate": "1990-03-19",
    "firstLoginComplete": true,
    "id": "emp_1789839021025_55",
    "name": "Sander Dam",
    "experience": "Ervaren",
    "department": "zaal",
    "pin": "1234",
    "active": true,
    "color": "#06b6d4",
    "statuut": "Flexi",
    "textBgColor": "bg-cyan-50 border-cyan-200",
    "email": "",
    "textColor": "text-cyan-700",
    "phone": "0471 63 02 88",
    "facebookUrl": "https://www.facebook.com/sander.dam"
  },
  {
    "name": "Sieben Merckx",
    "firstLoginComplete": true,
    "active": true,
    "id": "emp_1789842779409_dxra",
    "experience": "Gemiddeld",
    "role": "personeel",
    "textColor": "text-teal-700",
    "department": "zaal",
    "birthDate": "1992-07-24",
    "contractDaysPerWeek": 2,
    "phone": "+32 498 05 41 39",
    "pin": "1234",
    "statuut": "Flexi",
    "textBgColor": "bg-teal-50 border-teal-200",
    "email": "",
    "color": "#14b8a6",
    "facebookUrl": "https://www.facebook.com/sieben.merckx"
  },
  {
    "id": "emp_1789839021025_56",
    "textColor": "text-violet-700",
    "pin": "1234",
    "name": "Silvia Vanderschrieck",
    "statuut": "Flexi",
    "phone": "+32 494 30 02 72",
    "role": "personeel",
    "color": "#8b5cf6",
    "department": "zaal",
    "email": "",
    "experience": "Ervaren",
    "contractDaysPerWeek": 2,
    "firstLoginComplete": true,
    "textBgColor": "bg-violet-50 border-violet-200",
    "active": true,
    "birthDate": "1980-08-20",
    "facebookUrl": "https://www.facebook.com/silvia.vanderschrieck"
  },
  {
    "statuut": "Student",
    "pin": "1234",
    "birthDate": "2003-05-12",
    "active": true,
    "department": "zaal",
    "firstLoginComplete": true,
    "phone": "0478 46 70 47",
    "name": "Sophie Pollet",
    "experience": "Gemiddeld",
    "color": "#6366f1",
    "email": "",
    "role": "medewerker",
    "textColor": "text-indigo-700",
    "id": "emp_1790807174436_v5dp",
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "facebookUrl": "https://www.facebook.com/sophie.pollet"
  },
  {
    "department": "zaal",
    "phone": "0491986756",
    "birthDate": "2003-02-13",
    "email": "",
    "active": true,
    "color": "#ec4899",
    "name": "Stien Van Haesendonck",
    "textColor": "text-pink-700",
    "textBgColor": "bg-pink-50 border-pink-200",
    "pin": "1234",
    "experience": "Ervaren",
    "firstLoginComplete": true,
    "id": "emp_1790807214370_8jmk",
    "role": "medewerker",
    "statuut": "Extra",
    "facebookUrl": "https://www.facebook.com/stien.vanhaesendonck"
  },
  {
    "contractDaysPerWeek": 2,
    "firstLoginComplete": true,
    "email": "",
    "pin": "1234",
    "color": "#ef4444",
    "active": true,
    "phone": "+32 468 08 34 93",
    "textBgColor": "bg-rose-50 border-rose-200",
    "department": "zaal",
    "textColor": "text-rose-700",
    "statuut": "Student",
    "experience": "Ervaren",
    "role": "personeel",
    "birthDate": "2008-04-02",
    "name": "Thomas Bevernage",
    "id": "emp_1789839021025_59",
    "facebookUrl": "https://www.facebook.com/thomas.bevernage"
  },
  {
    "experience": "Ervaren",
    "textColor": "text-indigo-700",
    "firstLoginComplete": true,
    "id": "emp_1789839021025_60",
    "name": "Toon Bastiaens",
    "statuut": "Flexi",
    "contractDaysPerWeek": 2,
    "textBgColor": "bg-indigo-50 border-indigo-200",
    "active": true,
    "phone": "0476 90 69 82",
    "pin": "1234",
    "role": "personeel",
    "email": "",
    "department": "zaal",
    "color": "#6366f1",
    "birthDate": "1997-03-18",
    "facebookUrl": "https://www.facebook.com/toon.bastiaens"
  },
  {
    "firstLoginComplete": true,
    "contractDaysPerWeek": 2,
    "textColor": "text-pink-700",
    "textBgColor": "bg-pink-50 border-pink-200",
    "department": "zaal",
    "statuut": "Flexi",
    "id": "emp_1789839021025_61",
    "active": true,
    "pin": "1234",
    "color": "#ec4899",
    "role": "personeel",
    "email": "",
    "phone": "0475 88 41 23",
    "experience": "Beginner",
    "name": "Wouter Stroobants",
    "birthDate": "1991-10-19",
    "facebookUrl": "https://www.facebook.com/wouter.stroobants"
  },
  {
    "role": "personeel",
    "firstLoginComplete": true,
    "department": "zaal",
    "birthDate": "2006-07-01",
    "color": "#8b5cf6",
    "id": "emp_1789839021025_62",
    "email": "",
    "name": "Ynske Cukon",
    "phone": "0471 76 01 16",
    "textBgColor": "bg-violet-50 border-violet-200",
    "pin": "1234",
    "textColor": "text-violet-700",
    "contractDaysPerWeek": 2,
    "experience": "Ervaren",
    "active": true,
    "statuut": "Student",
    "facebookUrl": "https://www.facebook.com/ynske.cukon"
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    "id": "shift_1789839304430_f9to",
    "day": 0,
    "updatedAt": 1789839304430,
    "employeeId": "emp_1789839021025_11",
    "notes": "",
    "endTime": "21:00",
    "acknowledged": false,
    "weekNumber": 39,
    "startTime": "Open",
    "department": "zaal",
    "status": "published"
  },
  {
    "startTime": "Open",
    "id": "shift_1789839319596_sj7o",
    "day": 0,
    "weekNumber": 39,
    "department": "zaal",
    "status": "published",
    "acknowledged": true,
    "updatedAt": 1789839886816,
    "notes": "",
    "endTime": "22:00",
    "employeeId": "emp_1789839021025_12"
  },
  {
    "employeeId": "emp_1789839021025_6",
    "startTime": "18:00",
    "notes": "",
    "id": "shift_1789839396964_rs6x",
    "acknowledged": true,
    "department": "zaal",
    "status": "published",
    "updatedAt": 1789839401479,
    "endTime": "Sluit",
    "weekNumber": 39,
    "day": 0
  },
  {
    "notes": "",
    "startTime": "18:00",
    "id": "shift_1789839422229_x7dd",
    "status": "published",
    "day": 0,
    "employeeId": "emp_1789839021025_60",
    "updatedAt": 1789839427479,
    "department": "zaal",
    "endTime": "Hulpsluit",
    "weekNumber": 39,
    "acknowledged": true
  },
  {
    "status": "published",
    "notes": "",
    "startTime": "Open",
    "endTime": "22:00",
    "employeeId": "emp_1789839021025_11",
    "acknowledged": false,
    "day": 1,
    "weekNumber": 39,
    "updatedAt": 1789839445563,
    "id": "shift_1789839445563_d8wg",
    "department": "zaal"
  },
  {
    "id": "shift_1789839462181_gxbp",
    "employeeId": "emp_1789839021025_5",
    "startTime": "Open",
    "endTime": "18u00",
    "status": "published",
    "weekNumber": 39,
    "notes": "",
    "acknowledged": false,
    "updatedAt": 1789841026556,
    "department": "zaal",
    "day": 1
  },
  {
    "updatedAt": 1789839481213,
    "id": "shift_1789839481213_5c82",
    "department": "zaal",
    "status": "published",
    "weekNumber": 39,
    "day": 1,
    "acknowledged": true,
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_6",
    "notes": "",
    "endTime": "Sluit"
  },
  {
    "employeeId": "emp_1789839021025_20",
    "startTime": "18:00",
    "id": "shift_1789839501913_hm4h",
    "day": 1,
    "endTime": "23:00",
    "notes": "",
    "department": "zaal",
    "updatedAt": 1789839506446,
    "weekNumber": 39,
    "acknowledged": false,
    "status": "published"
  },
  {
    "notes": "",
    "id": "shift_1789839527430_myut",
    "status": "published",
    "employeeId": "emp_1789839021025_11",
    "day": 2,
    "startTime": "Open",
    "endTime": "22:00",
    "acknowledged": false,
    "weekNumber": 39,
    "department": "zaal",
    "updatedAt": 1789839527430
  },
  {
    "day": 2,
    "status": "published",
    "updatedAt": 1789839543014,
    "acknowledged": false,
    "employeeId": "emp_1789839021025_5",
    "notes": "",
    "endTime": "18u00",
    "id": "shift_1789839543014_ti8y",
    "startTime": "Open",
    "department": "zaal",
    "weekNumber": 39
  },
  {
    "acknowledged": true,
    "startTime": "18:00",
    "id": "shift_1789839559117_p6r1",
    "endTime": "Sluit",
    "employeeId": "emp_1789839021025_6",
    "updatedAt": 1789839559117,
    "department": "zaal",
    "notes": "",
    "weekNumber": 39,
    "day": 2,
    "status": "published"
  },
  {
    "day": 2,
    "notes": "",
    "status": "published",
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_13",
    "endTime": "23:00",
    "acknowledged": true,
    "id": "shift_1789839575430_0cz5",
    "weekNumber": 39,
    "updatedAt": 1789839575430,
    "department": "zaal"
  },
  {
    "id": "shift_1789839596698_2rg0",
    "status": "published",
    "notes": "",
    "weekNumber": 39,
    "acknowledged": true,
    "day": 2,
    "updatedAt": 1789839596698,
    "endTime": "23:00",
    "department": "zaal",
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_30"
  },
  {
    "day": 2,
    "weekNumber": 39,
    "updatedAt": 1789839624666,
    "department": "zaal",
    "status": "published",
    "notes": "",
    "id": "shift_1789839618016_r4oj",
    "acknowledged": true,
    "endTime": "Hulpsluit",
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_43"
  },
  {
    "endTime": "23:00",
    "department": "zaal",
    "updatedAt": 1789839669765,
    "weekNumber": 39,
    "acknowledged": false,
    "id": "shift_1789839665932_44y2",
    "day": 3,
    "notes": "",
    "employeeId": "emp_1789839021025_11",
    "startTime": "18:00",
    "status": "published"
  },
  {
    "weekNumber": 39,
    "startTime": "17u00",
    "department": "zaal",
    "status": "published",
    "endTime": "Sluit",
    "acknowledged": false,
    "day": 3,
    "updatedAt": 1789839684265,
    "id": "shift_1789839684265_m3a0",
    "employeeId": "emp_1789839021025_5",
    "notes": ""
  },
  {
    "startTime": "18:00",
    "status": "published",
    "notes": "",
    "acknowledged": true,
    "id": "shift_1789839710682_xtii",
    "employeeId": "emp_1789839021025_30",
    "weekNumber": 39,
    "updatedAt": 1789839710682,
    "department": "zaal",
    "day": 3,
    "endTime": "Hulpsluit"
  },
  {
    "id": "shift_1789839728333_hjr3",
    "department": "zaal",
    "updatedAt": 1789839764415,
    "weekNumber": 39,
    "employeeId": "emp_1789839021025_38",
    "endTime": "18u00",
    "notes": "",
    "startTime": "Open",
    "acknowledged": true,
    "day": 3,
    "status": "published"
  },
  {
    "employeeId": "emp_1789839021025_56",
    "id": "shift_1789839753665_9t3l",
    "startTime": "Open",
    "day": 3,
    "status": "published",
    "notes": "",
    "acknowledged": true,
    "department": "zaal",
    "updatedAt": 1789839753665,
    "weekNumber": 39,
    "endTime": "18u00"
  },
  {
    "acknowledged": false,
    "department": "zaal",
    "endTime": "16u00",
    "notes": "",
    "weekNumber": 39,
    "startTime": "Open",
    "employeeId": "emp_1789839021025_11",
    "day": 4,
    "status": "published",
    "updatedAt": 1789839807983,
    "id": "shift_1789839807983_ujld"
  },
  {
    "endTime": "18u00",
    "updatedAt": 1789841030405,
    "id": "shift_1789839816767_gg7g",
    "day": 4,
    "weekNumber": 39,
    "department": "zaal",
    "startTime": "Open",
    "acknowledged": false,
    "notes": "",
    "status": "published",
    "employeeId": "emp_1789839021025_5"
  },
  {
    "id": "shift_1789839832317_72ee",
    "endTime": "Sluit",
    "notes": "",
    "day": 4,
    "weekNumber": 39,
    "startTime": "18:00",
    "department": "zaal",
    "status": "published",
    "acknowledged": true,
    "employeeId": "emp_1789839021025_6",
    "updatedAt": 1789839832317
  },
  {
    "updatedAt": 1789839868533,
    "employeeId": "emp_1789839021025_13",
    "id": "shift_1789839844199_laa7",
    "endTime": "23:00",
    "startTime": "18:00",
    "department": "zaal",
    "acknowledged": true,
    "notes": "",
    "weekNumber": 39,
    "day": 4,
    "status": "published"
  },
  {
    "weekNumber": 39,
    "status": "published",
    "updatedAt": 1789839872016,
    "day": 4,
    "id": "shift_1789839849767_ef7l",
    "department": "zaal",
    "notes": "",
    "endTime": "23:00",
    "startTime": "17u00",
    "employeeId": "emp_1789839021025_12",
    "acknowledged": true
  },
  {
    "department": "zaal",
    "startTime": "16:00",
    "weekNumber": 39,
    "endTime": "23:00",
    "notes": "",
    "acknowledged": true,
    "status": "published",
    "employeeId": "emp_1789839021025_25",
    "updatedAt": 1789839862783,
    "day": 4,
    "id": "shift_1789839859566_njvt"
  },
  {
    "acknowledged": true,
    "id": "shift_1789839882084_cdtx",
    "weekNumber": 39,
    "department": "zaal",
    "startTime": "18:00",
    "endTime": "Hulpsluit",
    "notes": "",
    "employeeId": "emp_1789839021025_12",
    "day": 1,
    "updatedAt": 1789839882084,
    "status": "published"
  },
  {
    "id": "shift_1789839906800_d40l",
    "acknowledged": true,
    "notes": "",
    "status": "published",
    "updatedAt": 1789839906800,
    "endTime": "Hulpsluit",
    "employeeId": "emp_1789839021025_53",
    "weekNumber": 39,
    "day": 4,
    "startTime": "18:00",
    "department": "zaal"
  },
  {
    "employeeId": "emp_1789839021025_59",
    "status": "published",
    "notes": "",
    "acknowledged": true,
    "endTime": "23:00",
    "startTime": "18:00",
    "department": "zaal",
    "day": 4,
    "weekNumber": 39,
    "id": "shift_1789839919734_zupo",
    "updatedAt": 1789839919734
  },
  {
    "day": 4,
    "endTime": "23:00",
    "updatedAt": 1789839930683,
    "notes": "",
    "employeeId": "emp_1789839021025_56",
    "acknowledged": true,
    "status": "published",
    "startTime": "18:00",
    "id": "shift_1789839930683_38la",
    "weekNumber": 39,
    "department": "zaal"
  },
  {
    "acknowledged": false,
    "notes": "",
    "day": 5,
    "startTime": "Open",
    "weekNumber": 39,
    "department": "zaal",
    "endTime": "22:00",
    "status": "published",
    "updatedAt": 1789839951317,
    "id": "shift_1789839951317_prie",
    "employeeId": "emp_1789839021025_5"
  },
  {
    "department": "zaal",
    "acknowledged": true,
    "status": "published",
    "id": "shift_1789839967617_scjr",
    "notes": "",
    "updatedAt": 1789839967617,
    "weekNumber": 39,
    "employeeId": "emp_1789839021025_23",
    "startTime": "Open",
    "day": 5,
    "endTime": "18u00"
  },
  {
    "updatedAt": 1789842006601,
    "day": 5,
    "employeeId": "emp_1789839021025_47",
    "acknowledged": false,
    "notes": "",
    "weekNumber": 39,
    "startTime": "16:00",
    "id": "shift_1789839978651_85pq",
    "status": "published",
    "department": "zaal",
    "endTime": "23:00"
  },
  {
    "id": "shift_1789839993551_6b8t",
    "acknowledged": true,
    "employeeId": "emp_1789839021025_53",
    "startTime": "18:00",
    "endTime": "Sluit",
    "status": "published",
    "day": 5,
    "weekNumber": 39,
    "notes": "",
    "department": "zaal",
    "updatedAt": 1789839993551
  },
  {
    "department": "zaal",
    "updatedAt": 1789840005234,
    "weekNumber": 39,
    "endTime": "Hulpsluit",
    "acknowledged": false,
    "id": "shift_1789840005234_7zdy",
    "notes": "",
    "startTime": "18:00",
    "status": "published",
    "employeeId": "emp_1789839021025_26",
    "day": 5
  },
  {
    "updatedAt": 1789840018734,
    "endTime": "23:00",
    "day": 5,
    "employeeId": "emp_1789839021025_13",
    "startTime": "18:00",
    "id": "shift_1789840018734_1ews",
    "department": "zaal",
    "status": "published",
    "acknowledged": true,
    "notes": "",
    "weekNumber": 39
  },
  {
    "id": "shift_1789840040851_2v7d",
    "startTime": "18:00",
    "acknowledged": true,
    "endTime": "23:00",
    "employeeId": "emp_1789821074048_m5tq",
    "status": "published",
    "notes": "",
    "updatedAt": 1789840040851,
    "day": 5,
    "department": "zaal",
    "weekNumber": 39
  },
  {
    "updatedAt": 1789841993053,
    "id": "shift_1789840059468_eil4",
    "department": "zaal",
    "acknowledged": false,
    "weekNumber": 39,
    "endTime": "18u00",
    "startTime": "Open",
    "notes": "",
    "employeeId": "emp_1789839021025_55",
    "day": 6,
    "status": "published"
  },
  {
    "endTime": "21:00",
    "updatedAt": 1789840078685,
    "id": "shift_1789840078685_mq5u",
    "employeeId": "emp_1789839021025_24",
    "day": 6,
    "notes": "",
    "startTime": "10u00",
    "weekNumber": 39,
    "status": "published",
    "acknowledged": true,
    "department": "zaal"
  },
  {
    "employeeId": "emp_1789839021025_26",
    "endTime": "20:00",
    "id": "shift_1789840094952_sqag",
    "startTime": "12:00",
    "day": 6,
    "status": "published",
    "notes": "",
    "weekNumber": 39,
    "acknowledged": false,
    "department": "zaal",
    "updatedAt": 1789840094952
  },
  {
    "weekNumber": 39,
    "id": "shift_1789840111036_k046",
    "department": "zaal",
    "endTime": "18u00",
    "startTime": "12:00",
    "status": "published",
    "acknowledged": true,
    "notes": "",
    "employeeId": "emp_1789839021025_22",
    "day": 6,
    "updatedAt": 1789840111036
  },
  {
    "updatedAt": 1789840129052,
    "notes": "",
    "status": "published",
    "day": 6,
    "employeeId": "emp_1789839021025_6",
    "startTime": "20:00",
    "weekNumber": 39,
    "id": "shift_1789840129052_d7y4",
    "department": "zaal",
    "endTime": "Sluit",
    "acknowledged": true
  },
  {
    "day": 6,
    "acknowledged": false,
    "employeeId": "emp_1789839021025_44",
    "startTime": "18:00",
    "status": "published",
    "id": "shift_1789840153686_hrxn",
    "notes": "",
    "endTime": "Hulpsluit",
    "weekNumber": 39,
    "updatedAt": 1789840153686,
    "department": "zaal"
  },
  {
    "updatedAt": 1790261293127,
    "notes": "",
    "department": "zaal",
    "weekNumber": 39,
    "startTime": "16u00",
    "status": "published",
    "day": 6,
    "endTime": "23:00",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_7",
    "id": "shift_1789840172569_5otx",
    "isOpenShift": false
  },
  {
    "weekNumber": 39,
    "updatedAt": 1789840195420,
    "endTime": "23:00",
    "status": "published",
    "department": "zaal",
    "day": 6,
    "id": "shift_1789840195420_vg3k",
    "notes": "",
    "acknowledged": false,
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_47"
  },
  {
    "updatedAt": 1789840210869,
    "notes": "",
    "acknowledged": true,
    "day": 6,
    "endTime": "23:00",
    "department": "zaal",
    "weekNumber": 39,
    "startTime": "18:00",
    "id": "shift_1789840210869_ym7x",
    "status": "published",
    "employeeId": "emp_1789839021025_59"
  },
  {
    "startTime": "18:00",
    "day": 6,
    "status": "published",
    "weekNumber": 39,
    "department": "zaal",
    "updatedAt": 1789848491466,
    "acknowledged": false,
    "endTime": "23:00",
    "notes": "",
    "id": "shift_1789848491466_7o24",
    "employeeId": "emp_1789841627316_o1hv"
  },
  {
    "employeeId": "emp_1789841627316_o1hv",
    "status": "published",
    "startTime": "18:00",
    "notes": "",
    "id": "shift_1789848503022_91eu",
    "acknowledged": false,
    "day": 5,
    "department": "zaal",
    "weekNumber": 39,
    "updatedAt": 1789848503022,
    "endTime": "23:00"
  },
  {
    "startTime": "18:00",
    "employeeId": "emp_1789839021025_25",
    "notes": "",
    "updatedAt": 1789891966981,
    "weekNumber": 39,
    "acknowledged": true,
    "status": "published",
    "day": 5,
    "department": "zaal",
    "endTime": "23:00",
    "id": "shift_1789891966981_jhym"
  },
  {
    "acknowledged": true,
    "department": "zaal",
    "updatedAt": 1789891982765,
    "weekNumber": 39,
    "endTime": "23:00",
    "id": "shift_1789891982765_wuh5",
    "notes": "",
    "status": "published",
    "employeeId": "emp_1789839021025_62",
    "startTime": "18:00",
    "day": 5
  },
  {
    "employeeId": "emp_1789839021025_20",
    "acknowledged": false,
    "id": "shift_1789892050469_5vfk",
    "startTime": "18:00",
    "status": "published",
    "day": 3,
    "notes": "",
    "weekNumber": 39,
    "department": "zaal",
    "endTime": "23:00",
    "updatedAt": 1789892050469
  },
  {
    "id": "shift_1789892067940_gfv8",
    "startTime": "19:00",
    "status": "published",
    "endTime": "23:00",
    "employeeId": "emp_1789839021025_47",
    "acknowledged": false,
    "updatedAt": 1789892067940,
    "weekNumber": 39,
    "day": 3,
    "department": "zaal",
    "notes": ""
  },
  {
    "notes": "",
    "employeeId": "emp_1789821074048_m5tq",
    "status": "published",
    "id": "shift_1790014070125_m9cl",
    "startTime": "18u00",
    "day": 4,
    "acknowledged": true,
    "weekNumber": 39,
    "department": "zaal",
    "isOpenShift": false,
    "endTime": "23u00",
    "updatedAt": 1790260531355
  },
  {
    "weekNumber": 40,
    "startTime": "18u00",
    "notes": "",
    "department": "zaal",
    "day": 0,
    "acknowledged": false,
    "updatedAt": 1790284314363,
    "isOpenShift": false,
    "endTime": "22:00",
    "employeeId": "emp_1789839021025_11",
    "status": "published",
    "id": "shift_1790180676132_1oh9"
  },
  {
    "updatedAt": 1790180687919,
    "id": "shift_1790180687919_4txl",
    "employeeId": "emp_1789839021025_5",
    "isOpenShift": false,
    "startTime": "Open",
    "endTime": "22:00",
    "notes": "",
    "acknowledged": false,
    "department": "zaal",
    "day": 0,
    "status": "published",
    "weekNumber": 40
  },
  {
    "notes": "",
    "status": "published",
    "weekNumber": 40,
    "id": "shift_1790180701828_p6rr",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "department": "zaal",
    "endTime": "18u00",
    "day": 0,
    "startTime": "Open",
    "acknowledgedAt": 1790778228594,
    "updatedAt": 1790778228594,
    "isOpenShift": false,
    "acknowledged": true,
    "employeeId": "emp_1789839021025_12"
  },
  {
    "startTime": "Open",
    "employeeId": "emp_1789839021025_11",
    "isOpenShift": false,
    "notes": "",
    "status": "published",
    "day": 1,
    "id": "shift_1790180792903_pemk",
    "acknowledged": false,
    "updatedAt": 1790180792903,
    "endTime": "22:00",
    "department": "zaal",
    "weekNumber": 40
  },
  {
    "day": 1,
    "startTime": "18u00",
    "employeeId": "emp_1789839021025_5",
    "status": "published",
    "id": "shift_1790180810438_67fn",
    "updatedAt": 1790180810438,
    "acknowledged": false,
    "department": "zaal",
    "notes": "",
    "endTime": "Sluit",
    "isOpenShift": false,
    "weekNumber": 40
  },
  {
    "updatedAt": 1790180823282,
    "day": 1,
    "isOpenShift": false,
    "department": "zaal",
    "notes": "",
    "weekNumber": 40,
    "status": "published",
    "startTime": "18u00",
    "endTime": "Hulpsluit",
    "employeeId": "emp_1789841882714_gx6j",
    "id": "shift_1790180823282_tt81",
    "acknowledged": true
  },
  {
    "isOpenShift": false,
    "endTime": "22u00",
    "weekNumber": 40,
    "day": 2,
    "department": "zaal",
    "acknowledged": false,
    "startTime": "Open",
    "id": "shift_1790180834689_acpc",
    "employeeId": "emp_1789839021025_11",
    "status": "published",
    "notes": "",
    "updatedAt": 1790180834689
  },
  {
    "day": 2,
    "employeeId": "emp_1789839021025_5",
    "acknowledged": false,
    "startTime": "Open",
    "endTime": "18u00",
    "notes": "",
    "department": "zaal",
    "updatedAt": 1790180841982,
    "id": "shift_1790180841982_25ml",
    "weekNumber": 40,
    "isOpenShift": false,
    "status": "published"
  },
  {
    "department": "zaal",
    "endTime": "22:00",
    "status": "published",
    "weekNumber": 40,
    "startTime": "Open",
    "isOpenShift": false,
    "day": 1,
    "notes": "",
    "employeeId": "emp_1789839021025_36",
    "id": "shift_1790180861621_v9ex",
    "acknowledged": false,
    "updatedAt": 1790180861621
  },
  {
    "status": "published",
    "acknowledged": false,
    "department": "zaal",
    "updatedAt": 1790714086324,
    "weekNumber": 40,
    "notes": "",
    "endTime": "Sluit",
    "employeeId": "emp_1789839021025_36",
    "isOpenShift": false,
    "startTime": "16u00",
    "day": 2,
    "id": "shift_1790180875948_0a3x"
  },
  {
    "id": "shift_1790180899364_ubru",
    "acknowledgedAt": 1790769504222,
    "employeeId": "emp_1789842779409_dxra",
    "status": "published",
    "acknowledged": true,
    "startTime": "18u00",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "notes": "",
    "updatedAt": 1790769504222,
    "isOpenShift": false,
    "endTime": "23u00",
    "day": 2,
    "weekNumber": 40,
    "department": "zaal"
  },
  {
    "day": 2,
    "acknowledgedAt": 1790710455665,
    "notes": "",
    "acknowledged": true,
    "startTime": "18u00",
    "status": "published",
    "id": "shift_1790180907133_fa92",
    "employeeId": "emp_1789839021025_56",
    "updatedAt": 1790710455665,
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "endTime": "23u00",
    "isOpenShift": false,
    "department": "zaal",
    "weekNumber": 40
  },
  {
    "status": "published",
    "acknowledged": false,
    "weekNumber": 40,
    "department": "zaal",
    "id": "shift_1790180949586_jwq5",
    "notes": "",
    "startTime": "Open",
    "isOpenShift": false,
    "employeeId": "emp_1789839021025_11",
    "day": 3,
    "updatedAt": 1790180949586,
    "endTime": "18u00"
  },
  {
    "isOpenShift": false,
    "weekNumber": 40,
    "department": "zaal",
    "notes": "",
    "day": 3,
    "status": "published",
    "updatedAt": 1790843311949,
    "acknowledgedAt": 1790843311949,
    "startTime": "17u00",
    "endTime": "Sluit",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "id": "shift_1790180956669_elzx",
    "employeeId": "emp_1789839021025_5",
    "acknowledged": true
  },
  {
    "endTime": "22u00",
    "department": "zaal",
    "status": "published",
    "weekNumber": 40,
    "startTime": "Open",
    "isOpenShift": false,
    "id": "shift_1790180971442_uz66",
    "day": 3,
    "notes": "",
    "employeeId": "emp_1789839021025_50",
    "updatedAt": 1790180971442,
    "acknowledged": true
  },
  {
    "isOpenShift": false,
    "id": "shift_1790180986034_6vqd",
    "weekNumber": 40,
    "department": "zaal",
    "endTime": "Hulpsluit",
    "day": 3,
    "status": "published",
    "updatedAt": 1790180986034,
    "notes": "",
    "employeeId": "emp_1789824722545_ykbd",
    "acknowledged": true,
    "startTime": "18:00"
  },
  {
    "department": "zaal",
    "weekNumber": 40,
    "acknowledgedAt": 1790778227494,
    "acknowledged": true,
    "notes": "",
    "startTime": "18:00",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "isOpenShift": false,
    "id": "shift_1790180993917_ysoi",
    "updatedAt": 1790778227494,
    "day": 3,
    "status": "published",
    "employeeId": "emp_1789839021025_12",
    "endTime": "23u00"
  },
  {
    "isOpenShift": false,
    "day": 3,
    "status": "published",
    "updatedAt": 1790180998708,
    "weekNumber": 40,
    "notes": "",
    "department": "zaal",
    "endTime": "23:00",
    "id": "shift_1790180998708_3fbd",
    "startTime": "18:00",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_13"
  },
  {
    "employeeId": "emp_1789839021025_11",
    "id": "shift_1790181009832_bysn",
    "updatedAt": 1790181009832,
    "isOpenShift": false,
    "department": "zaal",
    "endTime": "16:00",
    "acknowledged": false,
    "weekNumber": 40,
    "startTime": "Open",
    "status": "published",
    "day": 4,
    "notes": ""
  },
  {
    "acknowledged": false,
    "day": 4,
    "updatedAt": 1790181023645,
    "isOpenShift": false,
    "endTime": "22u00",
    "department": "zaal",
    "notes": "",
    "weekNumber": 40,
    "status": "published",
    "id": "shift_1790181023645_rdvb",
    "startTime": "Open",
    "employeeId": "emp_1789839021025_36"
  },
  {
    "employeeId": "emp_1789839021025_53",
    "notes": "",
    "status": "published",
    "isOpenShift": false,
    "id": "shift_1790181036852_shxu",
    "endTime": "Sluit",
    "updatedAt": 1790181036852,
    "weekNumber": 40,
    "department": "zaal",
    "acknowledged": true,
    "day": 4,
    "startTime": "18u00"
  },
  {
    "employeeId": "emp_1789839021025_55",
    "endTime": "23u00",
    "isOpenShift": false,
    "acknowledgedAt": 1790853488434,
    "notes": "",
    "status": "published",
    "startTime": "17u00",
    "id": "shift_1790181045338_n2in",
    "acknowledged": true,
    "updatedAt": 1790853488434,
    "day": 4,
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "weekNumber": 40,
    "department": "zaal"
  },
  {
    "isOpenShift": false,
    "id": "shift_1790181075206_kqff",
    "employeeId": "emp_1789839021025_22",
    "notes": "",
    "endTime": "23:00",
    "acknowledged": false,
    "startTime": "18u00",
    "weekNumber": 40,
    "status": "published",
    "department": "zaal",
    "day": 4,
    "updatedAt": 1790181075206
  },
  {
    "weekNumber": 40,
    "department": "zaal",
    "endTime": "23u00",
    "acknowledged": true,
    "status": "published",
    "startTime": "18u00",
    "id": "shift_1790181087088_hc3u",
    "day": 4,
    "isOpenShift": false,
    "employeeId": "emp_1789839021025_38",
    "notes": "",
    "updatedAt": 1790769479151
  },
  {
    "employeeId": "emp_1789839021025_42",
    "isOpenShift": false,
    "day": 4,
    "startTime": "18:00",
    "acknowledgedAt": 1790842886180,
    "acknowledged": true,
    "updatedAt": 1790842886180,
    "notes": "",
    "id": "shift_1790181099438_htfh",
    "department": "zaal",
    "status": "published",
    "weekNumber": 40,
    "endTime": "23u00",
    "acknowledgedBy": "Hans Stevens (Beheerder)"
  },
  {
    "day": 5,
    "endTime": "22:00",
    "startTime": "Open",
    "department": "zaal",
    "weekNumber": 40,
    "isOpenShift": false,
    "notes": "",
    "updatedAt": 1790181111285,
    "id": "shift_1790181111285_jkdw",
    "employeeId": "emp_1789839021025_50",
    "acknowledged": true,
    "status": "published"
  },
  {
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "day": 5,
    "employeeId": "emp_1789839021025_20",
    "updatedAt": 1790721739466,
    "isOpenShift": false,
    "endTime": "18u00",
    "acknowledgedAt": 1790721739466,
    "acknowledged": true,
    "status": "published",
    "weekNumber": 40,
    "id": "shift_1790181124672_uqno",
    "notes": "",
    "department": "zaal",
    "startTime": "Open"
  },
  {
    "acknowledged": false,
    "department": "zaal",
    "isOpenShift": false,
    "day": 5,
    "updatedAt": 1790264455184,
    "weekNumber": 40,
    "notes": "",
    "employeeId": "emp_1789839021025_47",
    "id": "shift_1790181139553_opgf",
    "status": "published",
    "startTime": "18u00",
    "endTime": "23u00"
  },
  {
    "id": "shift_1790181149157_972z",
    "weekNumber": 40,
    "endTime": "Sluit",
    "startTime": "17u00",
    "department": "zaal",
    "acknowledged": true,
    "isOpenShift": false,
    "employeeId": "emp_1789839021025_53",
    "updatedAt": 1790181149157,
    "status": "published",
    "day": 5,
    "notes": ""
  },
  {
    "id": "shift_1790181172144_ysla",
    "acknowledged": false,
    "updatedAt": 1790181172145,
    "employeeId": "emp_1789841627316_o1hv",
    "endTime": "Hulpsluit",
    "startTime": "18u00",
    "status": "published",
    "department": "zaal",
    "day": 5,
    "notes": "",
    "weekNumber": 40,
    "isOpenShift": false
  },
  {
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "updatedAt": 1790710504345,
    "acknowledged": true,
    "department": "zaal",
    "weekNumber": 40,
    "isOpenShift": false,
    "startTime": "18:00",
    "status": "published",
    "acknowledgedAt": 1790710504345,
    "day": 5,
    "employeeId": "emp_1789839021025_56",
    "notes": "",
    "id": "shift_1790181191266_3j9d",
    "endTime": "23u00"
  },
  {
    "notes": "",
    "weekNumber": 40,
    "endTime": "23u00",
    "department": "zaal",
    "updatedAt": 1790181211841,
    "acknowledged": false,
    "day": 5,
    "id": "shift_1790181211841_b2gz",
    "isOpenShift": false,
    "status": "published",
    "employeeId": "emp_1789839021025_22",
    "startTime": "18:00"
  },
  {
    "employeeId": "emp_1789839021025_13",
    "acknowledged": false,
    "startTime": "18:00",
    "endTime": "23u00",
    "isOpenShift": false,
    "status": "published",
    "department": "zaal",
    "updatedAt": 1790181221825,
    "weekNumber": 40,
    "day": 5,
    "notes": "",
    "id": "shift_1790181221825_cwpu"
  },
  {
    "status": "published",
    "isOpenShift": false,
    "id": "shift_1790181251667_carr",
    "day": 6,
    "weekNumber": 40,
    "notes": "",
    "updatedAt": 1790181251667,
    "department": "zaal",
    "startTime": "Open",
    "endTime": "20u30",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_36"
  },
  {
    "endTime": "20u30",
    "id": "shift_1790181271364_xmxz",
    "day": 6,
    "employeeId": "emp_1789839021025_24",
    "updatedAt": 1790181271364,
    "isOpenShift": false,
    "notes": "",
    "status": "published",
    "acknowledged": false,
    "department": "zaal",
    "startTime": "Open",
    "weekNumber": 40
  },
  {
    "day": 6,
    "updatedAt": 1790181442290,
    "notes": "",
    "isOpenShift": false,
    "acknowledged": false,
    "employeeId": "emp_1790181420092_z4kh",
    "status": "published",
    "id": "shift_1790181442290_mec3",
    "endTime": "18u00",
    "weekNumber": 40,
    "startTime": "Open",
    "department": "zaal"
  },
  {
    "acknowledgedAt": 1790777684564,
    "department": "zaal",
    "acknowledged": true,
    "weekNumber": 40,
    "notes": "",
    "status": "published",
    "day": 6,
    "updatedAt": 1790777684564,
    "endTime": "18u00",
    "isOpenShift": false,
    "startTime": "12:00",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "employeeId": "emp_1789839021025_0",
    "id": "shift_1790181454044_t9l4"
  },
  {
    "acknowledged": true,
    "isOpenShift": false,
    "department": "zaal",
    "endTime": "Sluit",
    "weekNumber": 40,
    "notes": "",
    "startTime": "14:00",
    "id": "shift_1790181467380_euwt",
    "employeeId": "emp_1789839021025_50",
    "day": 6,
    "status": "published",
    "updatedAt": 1790714122973
  },
  {
    "department": "zaal",
    "weekNumber": 40,
    "notes": "",
    "startTime": "18:00",
    "id": "shift_1790181494784_uvc6",
    "employeeId": "emp_1789839021025_47",
    "day": 6,
    "endTime": "23:00",
    "status": "published",
    "updatedAt": 1790181494784,
    "isOpenShift": false,
    "acknowledged": false
  },
  {
    "isOpenShift": false,
    "acknowledgedAt": 1790777756883,
    "department": "zaal",
    "updatedAt": 1790777756883,
    "weekNumber": 40,
    "notes": "",
    "status": "published",
    "endTime": "23:00",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "day": 6,
    "acknowledged": true,
    "employeeId": "emp_1789839021025_12",
    "id": "shift_1790181511688_9s8u",
    "startTime": "18u00"
  },
  {
    "acknowledgedAt": 1790714458206,
    "updatedAt": 1790714458206,
    "notes": "",
    "department": "zaal",
    "weekNumber": 40,
    "startTime": "18:00",
    "endTime": "23:00",
    "employeeId": "emp_1789839021025_40",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "id": "shift_1790181522309_pxmg",
    "status": "published",
    "acknowledged": true,
    "day": 6,
    "isOpenShift": false
  },
  {
    "isOpenShift": false,
    "status": "published",
    "notes": "",
    "acknowledged": true,
    "weekNumber": 40,
    "endTime": "Sluit",
    "id": "shift_1790183013043_cbvj",
    "startTime": "18:00",
    "department": "zaal",
    "day": 0,
    "employeeId": "emp_1789839021025_50",
    "updatedAt": 1790183013044
  },
  {
    "acknowledged": true,
    "status": "published",
    "startTime": "18:00",
    "notes": "",
    "endTime": "23:00",
    "employeeId": "emp_1789839021025_45",
    "day": 4,
    "isOpenShift": false,
    "updatedAt": 1790260437673,
    "weekNumber": 39,
    "department": "zaal",
    "id": "shift_1790260437673_44hc"
  },
  {
    "department": "zaal",
    "startTime": "12:00",
    "weekNumber": 39,
    "isOpenShift": false,
    "updatedAt": 1790261315737,
    "endTime": "18u00",
    "id": "shift_1790261315737_edqd",
    "employeeId": "emp_1789839021025_21",
    "day": 6,
    "notes": "",
    "acknowledged": false,
    "status": "published"
  },
  {
    "updatedAt": 1790261835760,
    "endTime": "23u00",
    "isOpenShift": true,
    "department": "zaal",
    "weekNumber": 39,
    "startTime": "18u00",
    "day": 6,
    "notes": "Openstaande shift: wie kan er inspringen? Schrijf je direct in!",
    "acknowledged": false,
    "employeeId": "open_shift",
    "status": "published",
    "id": "shift_1790261835760_8usj"
  },
  {
    "updatedAt": 1790774484268,
    "notes": "",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "isOpenShift": false,
    "day": 4,
    "id": "shift_1790265213512_oth9",
    "employeeId": "emp_1789839021025_43",
    "department": "zaal",
    "acknowledgedAt": 1790774484268,
    "weekNumber": 40,
    "endTime": "Hulpsluit",
    "startTime": "16u00",
    "acknowledged": true,
    "status": "published"
  },
  {
    "startTime": "18:00",
    "notes": "",
    "employeeId": "emp_1789839021025_60",
    "id": "shift_1790265593759_eitr",
    "day": 2,
    "updatedAt": 1790265593759,
    "acknowledged": true,
    "endTime": "Hulpsluit",
    "isOpenShift": false,
    "status": "published",
    "weekNumber": 40,
    "department": "zaal"
  },
  {
    "department": "zaal",
    "weekNumber": 40,
    "isOpenShift": false,
    "updatedAt": 1790714030789,
    "endTime": "Hulpsluit",
    "employeeId": "emp_1789839021025_30",
    "id": "shift_1790714030789_3vll",
    "day": 0,
    "notes": "",
    "startTime": "18u00",
    "status": "published",
    "acknowledged": false
  },
  {
    "notes": "",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "employeeId": "emp_1789839021025_6",
    "status": "published",
    "endTime": "23u00",
    "day": 1,
    "updatedAt": 1790779718551,
    "acknowledgedAt": 1790779718551,
    "acknowledged": true,
    "startTime": "16u00",
    "id": "shift_1790714051757_qqvn",
    "weekNumber": 40,
    "isOpenShift": false,
    "department": "zaal"
  },
  {
    "id": "shift_1790714170402_0c2d",
    "employeeId": "emp_1789839021025_38",
    "endTime": "Hulpsluit",
    "updatedAt": 1790769768376,
    "acknowledgedAt": 1790769768376,
    "acknowledged": true,
    "day": 6,
    "notes": "",
    "startTime": "18u00",
    "status": "published",
    "department": "zaal",
    "acknowledgedBy": "Hans Stevens (Beheerder)",
    "weekNumber": 40,
    "isOpenShift": false
  },
  {
    "isOpenShift": false,
    "endTime": "22:00",
    "weekNumber": 41,
    "status": "draft",
    "acknowledged": false,
    "updatedAt": 1790714352657,
    "department": "zaal",
    "day": 0,
    "id": "shift_1790714352657_fp9f",
    "notes": "",
    "employeeId": "emp_1789839021025_11",
    "startTime": "Open"
  },
  {
    "status": "draft",
    "notes": "",
    "employeeId": "emp_1789839021025_11",
    "day": 1,
    "updatedAt": 1790714366831,
    "id": "shift_1790714366831_d3dr",
    "endTime": "22:00",
    "acknowledged": false,
    "department": "zaal",
    "isOpenShift": false,
    "weekNumber": 41,
    "startTime": "Open"
  },
  {
    "id": "shift_1790714377658_kpq1",
    "acknowledged": false,
    "startTime": "Open",
    "day": 2,
    "employeeId": "emp_1789839021025_11",
    "endTime": "22:00",
    "weekNumber": 41,
    "notes": "",
    "updatedAt": 1790714377658,
    "status": "draft",
    "department": "zaal",
    "isOpenShift": false
  },
  {
    "department": "zaal",
    "startTime": "Open",
    "endTime": "18u00",
    "acknowledged": false,
    "weekNumber": 41,
    "isOpenShift": false,
    "notes": "",
    "employeeId": "emp_1789839021025_11",
    "status": "draft",
    "updatedAt": 1790714386464,
    "day": 3,
    "id": "shift_1790714386464_dleb"
  },
  {
    "status": "draft",
    "updatedAt": 1790714400930,
    "employeeId": "emp_1789839021025_11",
    "isOpenShift": false,
    "notes": "",
    "startTime": "Open",
    "acknowledged": false,
    "day": 4,
    "department": "zaal",
    "id": "shift_1790714400930_7b0i",
    "endTime": "16u00",
    "weekNumber": 41
  },
  {
    "employeeId": "emp_1789839021025_24",
    "day": 6,
    "notes": "",
    "status": "draft",
    "startTime": "Open",
    "isOpenShift": false,
    "department": "zaal",
    "weekNumber": 41,
    "id": "shift_1790714669086_bri6",
    "acknowledged": false,
    "endTime": "21u00",
    "updatedAt": 1790781018513
  },
  {
    "employeeId": "emp_1789839021025_32",
    "endTime": "23u00",
    "acknowledged": false,
    "startTime": "18u00",
    "department": "zaal",
    "weekNumber": 41,
    "day": 6,
    "notes": "",
    "id": "shift_1790714680815_tgqn",
    "status": "draft",
    "updatedAt": 1790714680815,
    "isOpenShift": false
  },
  {
    "notes": "",
    "employeeId": "emp_1789839021025_40",
    "endTime": "23u00",
    "id": "shift_1790714690504_v4qw",
    "startTime": "18u00",
    "day": 6,
    "isOpenShift": false,
    "department": "zaal",
    "status": "draft",
    "weekNumber": 41,
    "updatedAt": 1790714690504,
    "acknowledged": false
  },
  {
    "department": "zaal",
    "id": "shift_1790714710112_3be9",
    "weekNumber": 41,
    "updatedAt": 1790714710112,
    "notes": "",
    "day": 6,
    "employeeId": "emp_1789839021025_43",
    "status": "draft",
    "acknowledged": false,
    "endTime": "Hulpsluit",
    "startTime": "18u00",
    "isOpenShift": false
  },
  {
    "day": 5,
    "notes": "",
    "status": "draft",
    "employeeId": "emp_1789839021025_40",
    "isOpenShift": false,
    "startTime": "18u00",
    "endTime": "23u00",
    "weekNumber": 41,
    "department": "zaal",
    "id": "shift_1790714773857_1fd2",
    "updatedAt": 1790714773857,
    "acknowledged": false
  },
  {
    "endTime": "23u00",
    "weekNumber": 41,
    "startTime": "18u00",
    "department": "zaal",
    "acknowledged": false,
    "isOpenShift": false,
    "day": 3,
    "updatedAt": 1790714825394,
    "id": "shift_1790714825393_mcge",
    "employeeId": "emp_1789824722545_ykbd",
    "status": "draft",
    "notes": ""
  },
  {
    "status": "draft",
    "updatedAt": 1790787092834,
    "department": "zaal",
    "notes": "",
    "acknowledged": false,
    "weekNumber": 41,
    "day": 0,
    "startTime": "11u00",
    "employeeId": "emp_1789839021025_36",
    "isOpenShift": false,
    "endTime": "22u00",
    "id": "shift_1790780753313_syma"
  },
  {
    "acknowledged": false,
    "updatedAt": 1790780790794,
    "endTime": "20:30",
    "department": "zaal",
    "status": "draft",
    "weekNumber": 41,
    "day": 6,
    "isOpenShift": false,
    "notes": "",
    "startTime": "09u30",
    "employeeId": "emp_1789839021025_36",
    "id": "shift_1790780790794_lchu"
  },
  {
    "updatedAt": 1790780836563,
    "isOpenShift": false,
    "status": "draft",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_50",
    "day": 6,
    "id": "shift_1790780836563_g3mv",
    "startTime": "14u00",
    "notes": "",
    "department": "zaal",
    "endTime": "Sluit",
    "weekNumber": 41
  },
  {
    "isOpenShift": false,
    "status": "draft",
    "weekNumber": 41,
    "acknowledged": false,
    "department": "zaal",
    "updatedAt": 1790780875143,
    "notes": "",
    "day": 6,
    "employeeId": "emp_1789839021025_31",
    "id": "shift_1790780875143_xd33",
    "startTime": "12u00",
    "endTime": "18u00"
  },
  {
    "updatedAt": 1790781682366,
    "employeeId": "emp_1789839021025_56",
    "notes": "",
    "status": "draft",
    "isOpenShift": false,
    "id": "shift_1790781682366_fbww",
    "day": 6,
    "startTime": "12u00",
    "endTime": "18u00",
    "acknowledged": false,
    "weekNumber": 41,
    "department": "zaal"
  },
  {
    "notes": "",
    "acknowledged": false,
    "endTime": "Sluit",
    "updatedAt": 1790781790835,
    "weekNumber": 41,
    "id": "shift_1790781790835_eomt",
    "department": "zaal",
    "isOpenShift": false,
    "status": "draft",
    "startTime": "16u00",
    "day": 5,
    "employeeId": "emp_1789839021025_53"
  },
  {
    "updatedAt": 1790781861382,
    "department": "zaal",
    "id": "shift_1790781861382_vejb",
    "weekNumber": 41,
    "day": 5,
    "employeeId": "emp_1789839021025_50",
    "endTime": "22u00",
    "startTime": "11u00",
    "acknowledged": false,
    "notes": "",
    "status": "draft",
    "isOpenShift": false
  },
  {
    "startTime": "18u00",
    "id": "shift_1790781910385_91wb",
    "day": 5,
    "employeeId": "emp_1789821074048_m5tq",
    "endTime": "23u00",
    "status": "draft",
    "isOpenShift": false,
    "acknowledged": false,
    "updatedAt": 1790781910385,
    "notes": "",
    "department": "zaal",
    "weekNumber": 41
  },
  {
    "startTime": "18u00",
    "id": "shift_1790781930816_9h70",
    "employeeId": "emp_1789839021025_13",
    "notes": "",
    "isOpenShift": false,
    "updatedAt": 1790781930816,
    "department": "zaal",
    "weekNumber": 41,
    "status": "draft",
    "endTime": "Hulpsluit",
    "acknowledged": false,
    "day": 5
  },
  {
    "acknowledged": false,
    "employeeId": "emp_1789841627316_o1hv",
    "startTime": "18u00",
    "notes": "",
    "day": 5,
    "status": "draft",
    "department": "zaal",
    "updatedAt": 1790781953436,
    "weekNumber": 41,
    "endTime": "23u00",
    "id": "shift_1790781953436_svg0",
    "isOpenShift": false
  },
  {
    "acknowledged": false,
    "notes": "",
    "employeeId": "emp_1789839021025_18",
    "status": "draft",
    "day": 5,
    "startTime": "18:00",
    "isOpenShift": false,
    "weekNumber": 41,
    "department": "zaal",
    "id": "shift_1790781971999_jvh5",
    "endTime": "23u00",
    "updatedAt": 1790781971999
  },
  {
    "status": "draft",
    "startTime": "17u00",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_55",
    "endTime": "23u00",
    "notes": "",
    "updatedAt": 1790787132671,
    "day": 4,
    "department": "zaal",
    "weekNumber": 41,
    "id": "shift_1790787132671_dc5s",
    "isOpenShift": false
  },
  {
    "updatedAt": 1790787137050,
    "notes": "",
    "endTime": "23u00",
    "department": "zaal",
    "id": "shift_1790787137050_jnbz",
    "weekNumber": 41,
    "startTime": "18u00",
    "status": "draft",
    "isOpenShift": false,
    "employeeId": "emp_1789839021025_56",
    "acknowledged": false,
    "day": 4
  },
  {
    "department": "zaal",
    "notes": "",
    "weekNumber": 41,
    "endTime": "23u00",
    "id": "shift_1790787146183_6k9f",
    "updatedAt": 1790787146183,
    "employeeId": "emp_1789839021025_60",
    "status": "draft",
    "acknowledged": false,
    "isOpenShift": false,
    "day": 4,
    "startTime": "18u00"
  },
  {
    "status": "draft",
    "updatedAt": 1790787184401,
    "notes": "",
    "id": "shift_1790787184401_uqdv",
    "weekNumber": 41,
    "endTime": "Hulpsluit",
    "department": "zaal",
    "isOpenShift": false,
    "startTime": "18u00",
    "acknowledged": false,
    "employeeId": "emp_1789839021025_45",
    "day": 4
  },
  {
    "weekNumber": 41,
    "department": "zaal",
    "isOpenShift": false,
    "status": "draft",
    "acknowledged": false,
    "updatedAt": 1790787213719,
    "day": 4,
    "notes": "",
    "employeeId": "emp_1789839021025_38",
    "endTime": "23u00",
    "id": "shift_1790787213719_mi4b",
    "startTime": "18u00"
  },
  {
    "isOpenShift": false,
    "acknowledged": false,
    "notes": "",
    "weekNumber": 41,
    "day": 4,
    "department": "zaal",
    "status": "draft",
    "startTime": "16:00",
    "employeeId": "emp_1789839021025_36",
    "endTime": "Sluit",
    "id": "shift_1790787230305_oqzj",
    "updatedAt": 1790787230305
  },
  {
    "weekNumber": 41,
    "department": "zaal",
    "notes": "",
    "day": 4,
    "id": "shift_1790787262122_vgzc",
    "updatedAt": 1790787262122,
    "acknowledged": false,
    "isOpenShift": false,
    "status": "draft",
    "employeeId": "emp_1789821074048_m5tq",
    "endTime": "23u00",
    "startTime": "18u00"
  }
];

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
