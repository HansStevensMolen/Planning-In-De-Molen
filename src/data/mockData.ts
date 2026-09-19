import { Employee, Shift, Notice, SwapRequest, ChangeLog, EmployeeAvailability } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp1',
    name: 'Hans Stevens',
    department: 'zaal',
    statuut: 'Vast',
    experience: 'Verantwoordelijke',
    contractDaysPerWeek: 5,
    role: 'beheerder',
    color: '#0d9488',
    textBgColor: 'bg-teal-50 border-teal-200',
    textColor: 'text-teal-700',
    email: 'hans.stevens@gemeenteschoolbierbeek.be',
    phone: '0475 12 34 56',
    active: true,
    firstLoginComplete: true,
    pin: '1234'
  }
];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_AVAILABILITIES: EmployeeAvailability[] = [];

export const INITIAL_SWAP_REQUESTS: SwapRequest[] = [];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_clean_start',
    title: 'Nieuwe Start Roosterbeheer',
    content: 'Het personeelsbestand en alle voorgaande planningen zijn gewist. De beheerder kan nu personeel toevoegen of synchroniseren via Excel, en nieuwe diensten inplannen.',
    date: new Date().toISOString().split('T')[0],
    category: 'algemeen',
    author: 'Hans Stevens (Beheerder)'
  }
];

export const INITIAL_LOGS: ChangeLog[] = [
  {
    id: 'log_wipe',
    timestamp: Date.now(),
    user: 'Hans Stevens (Beheerder)',
    action: 'Rooster en Personeel Gewist',
    details: 'Al het demopersoneel en alle ingevulde planningen zijn succesvol verwijderd'
  }
];
