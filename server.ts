import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.static(path.join(process.cwd(), "public")));

  // API Health Check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: Date.now()
    });
  });

  // Server-side Gemini Rooster Proposal Endpoint
  app.post("/api/rooster/generate-gemini", async (req: Request, res: Response) => {
    try {
      const {
        weekNumber,
        employees,
        availabilities,
        customInstructions,
        departmentFocus = 'all'
      } = req.body;

      if (!weekNumber) {
        return res.status(400).json({
          success: false,
          error: "Weeknummer is verplicht."
        });
      }

      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Er zijn geen medewerkers meegegeven om in te plannen."
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY is niet geconfigureerd op de server. Stel de API-sleutel in via de Secrets instellingen."
        });
      }

      const activeEmployees = employees.filter((e: any) => e.active !== false);
      if (activeEmployees.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Er zijn geen actieve medewerkers beschikbaar om in te plannen."
        });
      }

      // Filter availabilities for this week
      const weekAvailabilities = (availabilities || []).filter(
        (a: any) => a.weekNumber === Number(weekNumber)
      );

      // Construct detailed prompt for Gemini
      const systemInstruction = `Je bent de professionele personeelsplanner van café/eet-staminée 'In De Molen' te Bierbeek.
Jouw taak is om een waterdicht, eerlijk en optimaal weekrooster samen te stellen voor Week ${weekNumber} op basis van de ingediende beschikbaarheden van het personeel.

BEZETTINGSNORMEN VAN IN DE MOLEN (STRIKT TE VOLGEN):
1. OVERDAG (elke dag van Maandag t/m Zondag):
   - Exact 2 personen per dag (1 Zaal + 1 Keuken).
   - Tijden Maandag t/m Zaterdag: "Open" (of "11u00") tot "18u00".
   - Tijden Zondag (brunch/lunch): "10u00" tot "18u00".

2. 'S AVONDS:
   - Maandag (dag 0) & Dinsdag (dag 1): exact 4 personen (waarvan exact 1 Sluit in zaal, 1 Hulpsluit in zaal, 1 Keuken avond, 1 Zaal avond).
   - Woensdag (dag 2) & Donderdag (dag 3): exact 5 personen (waarvan exact 1 Sluit in zaal, 1 Hulpsluit in zaal, 2 Keuken avond, 1 Zaal avond).
   - Vrijdag (dag 4), Zaterdag (dag 5) & Zondag (dag 6): exact 7 personen (waarvan exact 1 Sluit in zaal, 1 Hulpsluit in zaal, 3 Keuken avond, 2 Zaal avond).

3. SLUIT & HULPSLUIT REGELS:
   - Elke avonddienst MOET exact 1 'Sluit' en exact 1 'Hulpsluit' hebben in de zaal.
   - De Sluit-rol vereist bij voorkeur een 'Verantwoordelijke' of 'Ervaren' medewerker (bijv. Pat, Matthias, of een ervaren student/flexi).
   - Sluit-tijd: 16u00 - Sluit (Zondag vanaf 15u30). Hulpsluit-tijd: 16u00 - Hulpsluit (Zondag vanaf 15u30).

4. BESCHIKBAARHEID & CONTRACTREGELS (CRUCIAAL):
   - 'unavailable': plan deze medewerker NOOIT in op die dag!
   - 'preferred': geef deze medewerker prioriteit om ingepland te worden op die dag.
   - 'available': medewerker is beschikbaar.
   - Respecteer start- en eindtijden vermeld in de beschikbaarheid (bijv. pas vanaf 17u00 beschikbaar).
   - Vast personeel (Pat & Matthias): 4-dagen werkregime (fulltime 4 dagen per week).
   - Studenten en Flexi: gemiddeld 1 tot 3 diensten per week, vooral piekdagen (vr, za, zo avond).
   - Maximaal 1 dienst per medewerker per kalenderdag.
   - Wijs zaalmedewerkers toe aan zaaldiensten en keukenmedewerkers aan keukendiensten.`;

      const promptPayload = {
        weekNumber: Number(weekNumber),
        customInstructions: customInstructions || "Geen extra opmerkingen.",
        departmentFocus,
        employees: activeEmployees.map((e: any) => ({
          id: e.id,
          name: e.name,
          department: e.department || 'zaal',
          statuut: e.statuut,
          experience: e.experience,
          contractDaysPerWeek: e.contractDaysPerWeek || (e.statuut === 'Vast' ? 4 : 2)
        })),
        submittedAvailabilities: weekAvailabilities.map((a: any) => {
          const emp = activeEmployees.find((e: any) => e.id === a.employeeId);
          return {
            employeeId: a.employeeId,
            employeeName: emp?.name || a.employeeId,
            days: a.days || []
          };
        })
      };

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            text: `Hier zijn de medewerkers, hun ingevulde beschikbaarheden en instructies voor Week ${weekNumber}:\n${JSON.stringify(promptPayload, null, 2)}\n\nGenereer het complete, geoptimaliseerde weekrooster voor Week ${weekNumber}.`
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weekNumber: { type: Type.INTEGER },
              summary: {
                type: Type.STRING,
                description: "Korte toelichting in het Nederlands van de gemaakte planning, de bezetting en waarom deze keuzes optimaal zijn."
              },
              reasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 tot 5 kernpunten waarom dit voorstel goed past bij de beschikbaarheden en wensen."
              },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Eventuele knelpunten of dagen waar personeel schaars was."
              },
              shifts: {
                type: Type.ARRAY,
                description: "Alle gegenereerde diensten voor de week (Maandag=0 t/m Zondag=6)",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    employeeId: { type: Type.STRING },
                    day: {
                      type: Type.INTEGER,
                      description: "Dag van de week: 0=Maandag, 1=Dinsdag, 2=Woensdag, 3=Donderdag, 4=Vrijdag, 5=Zaterdag, 6=Zondag"
                    },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    department: {
                      type: Type.STRING,
                      description: "'zaal' of 'keuken'"
                    },
                    notes: {
                      type: Type.STRING,
                      description: "Bijv. 'Overdag Zaal (Dagdienst)', 'Avonddienst • Sluit', 'Avonddienst • Hulpsluit', 'Avond Keuken'"
                    }
                  },
                  required: ["employeeId", "day", "startTime", "endTime", "department", "notes"]
                }
              }
            },
            required: ["weekNumber", "summary", "reasoning", "shifts"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Geen tekstrespons ontvangen van het Gemini model.");
      }

      let parsedData: any;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Gemini response parsing error:", parseError, responseText);
        throw new Error("Het model leverde geen geldig JSON-formaat op.");
      }

      // Sanitize and decorate shifts with client-friendly fields
      const formattedShifts = (parsedData.shifts || []).map((s: any, idx: number) => {
        const emp = activeEmployees.find((e: any) => e.id === s.employeeId);
        return {
          id: `shift_gemini_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: s.employeeId,
          employeeName: emp?.name || 'Onbekend',
          weekNumber: Number(weekNumber),
          day: Math.max(0, Math.min(6, Number(s.day))),
          startTime: s.startTime || '17u00',
          endTime: s.endTime || 'Sluit',
          department: s.department === 'keuken' ? 'keuken' : 'zaal',
          notes: s.notes || 'AI gegenereerde dienst',
          status: 'draft',
          acknowledged: false,
          updatedAt: Date.now()
        };
      });

      // Employee assignment statistics
      const shiftCounts: Record<string, number> = {};
      formattedShifts.forEach((s: any) => {
        shiftCounts[s.employeeId] = (shiftCounts[s.employeeId] || 0) + 1;
      });

      const employeeStats = activeEmployees.map((emp: any) => ({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        statuut: emp.statuut,
        contractDays: emp.contractDaysPerWeek || (emp.statuut === 'Vast' ? 4 : 2),
        assignedShifts: shiftCounts[emp.id] || 0
      }));

      return res.json({
        success: true,
        weekNumber: Number(weekNumber),
        model: "gemini-3.8-flash",
        summary: parsedData.summary || "Roostervoorstel succesvol berekend met Gemini AI.",
        reasoning: parsedData.reasoning || [],
        warnings: parsedData.warnings || [],
        shifts: formattedShifts,
        employeeStats,
        generatedAt: Date.now()
      });

    } catch (err: any) {
      console.error("Error generating schedule with Gemini:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Er is een onverwachte fout opgetreden bij het aanroepen van de Gemini API."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
