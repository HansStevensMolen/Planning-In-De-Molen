import { Shift, Employee, EmployeeAvailability } from '../types';
import { generateSmartAutoPlan } from '../utils/roosterGenerator';

export interface GeminiRoosterProposalResponse {
  success: boolean;
  error?: string;
  weekNumber: number;
  model?: string;
  summary: string;
  reasoning: string[];
  warnings: string[];
  shifts: Shift[];
  employeeStats?: {
    employeeId: string;
    employeeName: string;
    department: string;
    statuut: string;
    contractDays: number;
    assignedShifts: number;
  }[];
  generatedAt: number;
  isFallback?: boolean;
}

export async function generateScheduleWithGemini(
  weekNumber: number,
  employees: Employee[],
  availabilities: EmployeeAvailability[],
  customInstructions?: string,
  departmentFocus: 'all' | 'zaal' | 'keuken' = 'all'
): Promise<GeminiRoosterProposalResponse> {
  try {
    const response = await fetch('/api/rooster/generate-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weekNumber,
        employees,
        availabilities,
        customInstructions,
        departmentFocus,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Serverfout (${response.status}) bij het berekenen van het voorstel.`);
    }

    return data as GeminiRoosterProposalResponse;
  } catch (err: any) {
    console.warn('Gemini API call warning/fallback:', err);
    // If the server-side Gemini call fails (e.g. rate limit or API key error),
    // provide an informative response with smart rules fallback so manager is never blocked
    const fallbackShifts = generateSmartAutoPlan(weekNumber, employees, availabilities, false);
    
    return {
      success: true,
      weekNumber,
      model: 'In De Molen Heuristische Planner (Fallback)',
      summary: `Opmerking: De server meldde: "${err.message || 'Geen verbinding met Gemini'}". Er is daarom automatisch een voorstel gegenereerd op basis van de vaste horecaregels en ingediende beschikbaarheden.`,
      reasoning: [
        'Vaste bezettingsnorm gehanteerd: Overdag 2p, avond 4-7p.',
        'Elke avond voorzien van 1 Sluit en 1 Hulpsluit.',
        'Afgestemd op ingevulde beschikbaarheden en contractdagen.'
      ],
      warnings: [
        err.message ? `Gemini API toelichting: ${err.message}` : 'Gemini service was tijdelijk niet bereikbaar.'
      ],
      shifts: fallbackShifts,
      generatedAt: Date.now(),
      isFallback: true
    };
  }
}
